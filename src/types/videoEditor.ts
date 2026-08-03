export type VideoRotation = 0 | 90 | 180 | 270;

export interface VideoClip {
    id: string;
    file: File;
    name: string;
    objectUrl: string;
    thumbnailUrl: string;
    duration: number;
    trimStart: number;
    trimEnd: number;
    rotation: VideoRotation;
    muted: boolean;
    width: number;
    height: number;
}

export interface VideoExportClip {
    inputPath: string;
    duration: number;
    trimStart: number;
    trimEnd: number;
    rotation: VideoRotation;
    muted: boolean;
    hasAudio: boolean;
}

export interface VideoExportSettings {
    width: number;
    height: number;
    label: string;
}

export type VideoExportPhase = "loading" | "preparing" | "encoding";
