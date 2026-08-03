import type { CellValue, Row } from "read-excel-file/browser";
import type {
    DrawResult,
    ImportError,
    LuckyDrawPalette,
    LuckyDrawParticipant,
    ParticipantMapping,
    PrizeRound,
    WheelSegment,
} from "../types/luckyDraw";

export const WHEEL_PALETTES: Record<LuckyDrawPalette, string[]> = {
    festival: ["#ff6b6b", "#ffd43b", "#51cf66", "#339af0", "#845ef7", "#f06595"],
    ocean: ["#0b7285", "#1098ad", "#15aabf", "#22b8cf", "#3bc9db", "#66d9e8"],
    sunset: ["#c92a2a", "#e8590c", "#f08c00", "#fab005", "#e64980", "#9c36b5"],
    mono: ["#212529", "#495057", "#868e96", "#adb5bd", "#343a40", "#6c757d"],
};

export const DEFAULT_PRIZES: PrizeRound[] = [
    { id: "grand-prize", name: "Grand Prize", color: "violet", winnerCount: 1 },
];

function cellToText(value: CellValue | null | undefined) {
    if (value === null || value === undefined) {
        return "";
    }
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }
    return String(value).trim();
}

export function findFirstHeaderRow(rows: Row[]) {
    const index = rows.findIndex((row) => row.some((cell) => cellToText(cell) !== ""));
    return index === -1 ? 1 : index + 1;
}

export function getHeaders(rows: Row[], headerRow: number) {
    const row = rows[headerRow - 1] ?? [];
    const seen = new Map<string, number>();
    return row.map((cell, index) => {
        const base = cellToText(cell) || `Column ${index + 1}`;
        const count = (seen.get(base) ?? 0) + 1;
        seen.set(base, count);
        return count === 1 ? base : `${base} (${count})`;
    });
}

export function guessParticipantColumns(headers: string[]) {
    const find = (pattern: RegExp) => {
        const index = headers.findIndex((header) => pattern.test(header));
        return index === -1 ? null : index;
    };

    return {
        nameColumn: find(/(^|\s)(name|participant|entrant|member|姓名|名字)(\s|$)/i) ?? 0,
        idColumn: find(/(^|\s)(id|number|no\.?|email|編號|号码|號碼)(\s|$)/i),
        weightColumn: find(/(^|\s)(weight|chance|entries|tickets|權重|权重)(\s|$)/i),
    };
}

export function normalizeParticipants(rows: Row[], mapping: ParticipantMapping, sheetName: string) {
    const participants: LuckyDrawParticipant[] = [];
    const errors: ImportError[] = [];

    rows.slice(mapping.headerRow).forEach((row, index) => {
        const sourceRow = mapping.headerRow + index + 1;
        const name = cellToText(row[mapping.nameColumn]);
        if (!name) {
            return;
        }

        const rawWeight = mapping.weightColumn === null ? null : row[mapping.weightColumn];
        const weightText = cellToText(rawWeight);
        const weight = weightText === "" ? 1 : Number(weightText);
        if (!Number.isFinite(weight) || weight <= 0) {
            errors.push({
                row: sourceRow,
                message: `Weight must be a positive number; received "${weightText}".`,
            });
            return;
        }

        participants.push({
            id: `${encodeURIComponent(sheetName)}:${sourceRow}`,
            name,
            externalId: mapping.idColumn === null ? "" : cellToText(row[mapping.idColumn]),
            weight,
            enabled: true,
            sourceSheet: sheetName,
            sourceRow,
        });
    });

    return { participants, errors };
}

export function normalizeManualParticipants(value: string) {
    const participants: LuckyDrawParticipant[] = [];

    value.split(/\r?\n/).forEach((line, index) => {
        const name = line.trim();
        if (!name) {
            return;
        }

        participants.push({
            id: `manual:${index + 1}`,
            name,
            externalId: "",
            weight: 1,
            enabled: true,
            sourceSheet: "Manual entry",
            sourceRow: index + 1,
        });
    });

    return participants;
}

export function cryptoRandomFloat() {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] / 4_294_967_296;
}

export function selectWeightedParticipant(
    participants: LuckyDrawParticipant[],
    random: () => number = cryptoRandomFloat,
) {
    if (participants.length === 0) {
        throw new Error("At least one eligible participant is required.");
    }

    const totalWeight = participants.reduce((total, participant) => total + participant.weight, 0);
    const point = Math.min(Math.max(random(), 0), 1 - Number.EPSILON) * totalWeight;
    let cumulative = 0;

    for (const participant of participants) {
        cumulative += participant.weight;
        if (point < cumulative) {
            return participant;
        }
    }

    return participants[participants.length - 1];
}

export function createWheelSegments(participants: LuckyDrawParticipant[]) {
    const totalWeight = participants.reduce((total, participant) => total + participant.weight, 0);
    let cursor = 0;

    return participants.map<WheelSegment>((participant) => {
        const startDegrees = cursor;
        cursor += (participant.weight / totalWeight) * 360;
        return { participant, startDegrees, endDegrees: cursor };
    });
}

export function calculateTargetRotation(
    currentRotation: number,
    segment: WheelSegment,
    turns = 6,
    landingRatio = 0.5,
) {
    const safeRatio = Math.min(Math.max(landingRatio, 0.1), 0.9);
    const landingAngle =
        segment.startDegrees + (segment.endDegrees - segment.startDegrees) * safeRatio;
    const desiredRotation = (270 - landingAngle + 360) % 360;
    const currentNormalized = ((currentRotation % 360) + 360) % 360;
    const adjustment = (desiredRotation - currentNormalized + 360) % 360;
    return currentRotation + turns * 360 + adjustment;
}

export function getEligibleParticipants(
    participants: LuckyDrawParticipant[],
    results: DrawResult[],
    allowRepeats: boolean,
) {
    const winnerIds = new Set(results.map((result) => result.participantId));
    return participants.filter(
        (participant) => participant.enabled && (allowRepeats || !winnerIds.has(participant.id)),
    );
}

export function getCurrentPrize(prizes: PrizeRound[], results: DrawResult[]) {
    return prizes.find((prize) => {
        const winnerCount = results.filter((result) => result.prizeId === prize.id).length;
        return winnerCount < prize.winnerCount;
    });
}

function csvCell(value: string | number) {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function createWinnerCsv(results: DrawResult[]) {
    const header = ["Drawn at", "Prize", "Name", "ID", "Weight", "Worksheet", "Source row"];
    const rows = results.map((result) => [
        result.drawnAt,
        result.prizeName,
        result.participantName,
        result.participantExternalId,
        result.participantWeight,
        result.sourceSheet,
        result.sourceRow,
    ]);
    return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function createLuckyDrawId(prefix: string) {
    return `${prefix}-${crypto.randomUUID()}`;
}
