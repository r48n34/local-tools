import assert from "node:assert/strict";
import test from "node:test";
import type { Row } from "read-excel-file/browser";
import type {
    DrawResult,
    LuckyDrawParticipant,
    SavedLuckyDrawEvent,
} from "../src/types/luckyDraw.ts";
import {
    calculateTargetRotation,
    createWheelSegments,
    createWinnerCsv,
    getCurrentPrize,
    getEligibleParticipants,
    getHeaders,
    normalizeManualParticipants,
    normalizeParticipants,
    selectWeightedParticipant,
} from "../src/utils/luckyDrawUtils.ts";
import {
    clearSavedLuckyDraw,
    loadSavedLuckyDraw,
    LUCKY_DRAW_STORAGE_KEY,
    saveLuckyDraw,
} from "../src/utils/luckyDrawStorage.ts";

function participant(id: string, weight = 1): LuckyDrawParticipant {
    return {
        id,
        name: `Person ${id}`,
        externalId: id.toUpperCase(),
        weight,
        enabled: true,
        sourceSheet: "People",
        sourceRow: Number(id.replace(/\D/g, "")) || 2,
    };
}

function result(person: LuckyDrawParticipant, prizeId = "prize-1"): DrawResult {
    return {
        id: `result-${person.id}`,
        participantId: person.id,
        participantName: person.name,
        participantExternalId: person.externalId,
        participantWeight: person.weight,
        prizeId,
        prizeName: "Grand, Prize",
        prizeColor: "violet",
        sourceSheet: person.sourceSheet,
        sourceRow: person.sourceRow,
        drawnAt: "2026-08-03T10:00:00.000Z",
    };
}

test("normalizes mapped spreadsheet rows and keeps duplicate names distinct", () => {
    const rows: Row[] = [
        ["Name", "Member ID", "Weight"],
        ["Alex", "A-1", 2],
        ["Alex", "A-2", null],
        [null, "A-3", 5],
    ];
    const normalized = normalizeParticipants(
        rows,
        { headerRow: 1, nameColumn: 0, idColumn: 1, weightColumn: 2 },
        "Guests",
    );

    assert.equal(normalized.errors.length, 0);
    assert.deepEqual(
        normalized.participants.map(({ id, name, externalId, weight, sourceRow }) => ({
            id,
            name,
            externalId,
            weight,
            sourceRow,
        })),
        [
            { id: "Guests:2", name: "Alex", externalId: "A-1", weight: 2, sourceRow: 2 },
            { id: "Guests:3", name: "Alex", externalId: "A-2", weight: 1, sourceRow: 3 },
        ],
    );
});

test("reports invalid weights with their original spreadsheet rows", () => {
    const rows: Row[] = [
        ["Name", "Weight"],
        ["Valid", 1],
        ["Zero", 0],
        ["Text", "many"],
        ["Negative", -2],
    ];
    const normalized = normalizeParticipants(
        rows,
        { headerRow: 1, nameColumn: 0, idColumn: null, weightColumn: 1 },
        "People",
    );

    assert.equal(normalized.participants.length, 1);
    assert.deepEqual(
        normalized.errors.map((error) => error.row),
        [3, 4, 5],
    );
});

test("creates equal-weight manual entries while preserving duplicate names and source lines", () => {
    const participants = normalizeManualParticipants(" Alice \r\n\r\nBob\nAlice\n  Carol  ");

    assert.deepEqual(
        participants.map(({ id, name, weight, sourceSheet, sourceRow }) => ({
            id,
            name,
            weight,
            sourceSheet,
            sourceRow,
        })),
        [
            { id: "manual:1", name: "Alice", weight: 1, sourceSheet: "Manual entry", sourceRow: 1 },
            { id: "manual:3", name: "Bob", weight: 1, sourceSheet: "Manual entry", sourceRow: 3 },
            { id: "manual:4", name: "Alice", weight: 1, sourceSheet: "Manual entry", sourceRow: 4 },
            { id: "manual:5", name: "Carol", weight: 1, sourceSheet: "Manual entry", sourceRow: 5 },
        ],
    );
});

test("deduplicates repeated spreadsheet header labels for column mapping", () => {
    assert.deepEqual(getHeaders([["Name", "Name", null]], 1), ["Name", "Name (2)", "Column 3"]);
});

test("selects participants according to cumulative weights with an injectable random source", () => {
    const people = [participant("1", 1), participant("2", 3), participant("3", 6)];

    assert.equal(selectWeightedParticipant(people, () => 0).id, "1");
    assert.equal(selectWeightedParticipant(people, () => 0.1).id, "2");
    assert.equal(selectWeightedParticipant(people, () => 0.3999).id, "2");
    assert.equal(selectWeightedParticipant(people, () => 0.4).id, "3");
    assert.equal(selectWeightedParticipant(people, () => 1).id, "3");
    assert.throws(() => selectWeightedParticipant([], () => 0.5), /At least one/);
});

test("calculates a multi-turn rotation that lands inside the selected wheel segment", () => {
    const people = [participant("1", 1), participant("2", 2), participant("3", 1)];
    const segment = createWheelSegments(people)[1];
    const target = calculateTargetRotation(47, segment, 5, 0.25);
    const sourceAngleAtPointer = (((270 - target) % 360) + 360) % 360;

    assert.ok(target > 47 + 4 * 360);
    assert.ok(sourceAngleAtPointer > segment.startDegrees);
    assert.ok(sourceAngleAtPointer < segment.endDegrees);
});

test("filters previous winners only when repeats are disabled and advances prize rounds", () => {
    const people = [participant("1"), participant("2")];
    const prizes = [
        { id: "prize-1", name: "First", color: "red", winnerCount: 1 },
        { id: "prize-2", name: "Second", color: "blue", winnerCount: 2 },
    ];
    const results = [result(people[0])];

    assert.deepEqual(
        getEligibleParticipants(people, results, false).map(({ id }) => id),
        ["2"],
    );
    assert.equal(getEligibleParticipants(people, results, true).length, 2);
    assert.equal(getCurrentPrize(prizes, results)?.id, "prize-2");
    assert.equal(
        getCurrentPrize(prizes, [...results, result(people[0], "prize-2")])?.id,
        "prize-2",
    );
});

test("escapes winner history as spreadsheet-friendly CSV", () => {
    const person = { ...participant("1"), name: 'Lee, "Lucky"' };
    const csv = createWinnerCsv([result(person)]);

    assert.ok(csv.startsWith("\uFEFFDrawn at"));
    assert.match(csv, /"Grand, Prize"/);
    assert.match(csv, /"Lee, ""Lucky"""/);
});

test("saves, loads, rejects corrupt data, and clears local recovery state", () => {
    const values = new Map<string, string>();
    const storage = {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => void values.set(key, value),
        removeItem: (key: string) => void values.delete(key),
    };
    const event: SavedLuckyDrawEvent = {
        version: 1,
        savedAt: "2026-08-03T10:00:00.000Z",
        participants: [participant("1")],
        prizes: [{ id: "prize-1", name: "Prize", color: "blue", winnerCount: 1 }],
        results: [],
        settings: {
            allowRepeats: false,
            durationSeconds: 6,
            sound: false,
            confetti: true,
            palette: "festival",
        },
    };

    saveLuckyDraw(event, storage);
    assert.deepEqual(loadSavedLuckyDraw(storage), event);
    values.set(LUCKY_DRAW_STORAGE_KEY, "not-json");
    assert.equal(loadSavedLuckyDraw(storage), null);
    values.set(
        LUCKY_DRAW_STORAGE_KEY,
        JSON.stringify({ ...event, settings: { ...event.settings, palette: "unknown" } }),
    );
    assert.equal(loadSavedLuckyDraw(storage), null);
    clearSavedLuckyDraw(storage);
    assert.equal(values.size, 0);
});
