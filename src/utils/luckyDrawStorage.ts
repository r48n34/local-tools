import type { SavedLuckyDrawEvent } from "../types/luckyDraw";

export const LUCKY_DRAW_STORAGE_KEY = "local-tools:lucky-draw:event:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object";
}

function isParticipant(value: unknown) {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        typeof value.externalId === "string" &&
        typeof value.weight === "number" &&
        Number.isFinite(value.weight) &&
        value.weight > 0 &&
        typeof value.enabled === "boolean" &&
        typeof value.sourceSheet === "string" &&
        typeof value.sourceRow === "number"
    );
}

function isPrize(value: unknown) {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        typeof value.color === "string" &&
        typeof value.winnerCount === "number" &&
        Number.isInteger(value.winnerCount) &&
        value.winnerCount > 0
    );
}

function isResult(value: unknown) {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.id === "string" &&
        typeof value.participantId === "string" &&
        typeof value.participantName === "string" &&
        typeof value.participantExternalId === "string" &&
        typeof value.participantWeight === "number" &&
        typeof value.prizeId === "string" &&
        typeof value.prizeName === "string" &&
        typeof value.prizeColor === "string" &&
        typeof value.sourceSheet === "string" &&
        typeof value.sourceRow === "number" &&
        typeof value.drawnAt === "string"
    );
}

function isSettings(value: unknown) {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.allowRepeats === "boolean" &&
        typeof value.durationSeconds === "number" &&
        value.durationSeconds >= 2 &&
        value.durationSeconds <= 10 &&
        typeof value.sound === "boolean" &&
        typeof value.confetti === "boolean" &&
        ["festival", "ocean", "sunset", "mono"].includes(String(value.palette))
    );
}

function isSavedEvent(value: unknown): value is SavedLuckyDrawEvent {
    if (!isRecord(value)) {
        return false;
    }
    return (
        value.version === 1 &&
        typeof value.savedAt === "string" &&
        Array.isArray(value.participants) &&
        value.participants.every(isParticipant) &&
        Array.isArray(value.prizes) &&
        value.prizes.every(isPrize) &&
        Array.isArray(value.results) &&
        value.results.every(isResult) &&
        isSettings(value.settings)
    );
}

export function loadSavedLuckyDraw(storage: Pick<Storage, "getItem"> = localStorage) {
    try {
        const raw = storage.getItem(LUCKY_DRAW_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed: unknown = JSON.parse(raw);
        if (!isSavedEvent(parsed)) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function saveLuckyDraw(
    event: SavedLuckyDrawEvent,
    storage: Pick<Storage, "setItem"> = localStorage,
) {
    storage.setItem(LUCKY_DRAW_STORAGE_KEY, JSON.stringify(event));
}

export function clearSavedLuckyDraw(storage: Pick<Storage, "removeItem"> = localStorage) {
    try {
        storage.removeItem(LUCKY_DRAW_STORAGE_KEY);
    } catch {
        // A blocked storage API should not prevent an in-memory draw.
    }
}
