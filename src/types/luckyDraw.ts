import type { Row } from "read-excel-file/browser";

export type WorkbookSheet = {
    name: string;
    rows: Row[];
};

export type LuckyDrawParticipant = {
    id: string;
    name: string;
    externalId: string;
    weight: number;
    enabled: boolean;
    sourceSheet: string;
    sourceRow: number;
};

export type PrizeRound = {
    id: string;
    name: string;
    color: string;
    winnerCount: number;
};

export type DrawResult = {
    id: string;
    participantId: string;
    participantName: string;
    participantExternalId: string;
    participantWeight: number;
    prizeId: string;
    prizeName: string;
    prizeColor: string;
    sourceSheet: string;
    sourceRow: number;
    drawnAt: string;
};

export type LuckyDrawPalette = "festival" | "ocean" | "sunset" | "mono";

export type LuckyDrawSettings = {
    allowRepeats: boolean;
    durationSeconds: number;
    sound: boolean;
    confetti: boolean;
    palette: LuckyDrawPalette;
};

export type SavedLuckyDrawEvent = {
    version: 1;
    savedAt: string;
    participants: LuckyDrawParticipant[];
    prizes: PrizeRound[];
    results: DrawResult[];
    settings: LuckyDrawSettings;
};

export type ParticipantMapping = {
    headerRow: number;
    nameColumn: number;
    idColumn: number | null;
    weightColumn: number | null;
};

export type ImportError = {
    row: number;
    message: string;
};

export type WheelSegment = {
    participant: LuckyDrawParticipant;
    startDegrees: number;
    endDegrees: number;
};
