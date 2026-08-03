export interface PdfSource {
    id: string;
    name: string;
    bytes: Uint8Array;
}

export interface PdfPageItem {
    id: string;
    sourceId: string;
    sourceName: string;
    sourcePageIndex: number;
    selected: boolean;
    rotation: 0 | 90 | 180 | 270;
    thumbnailUrl: string;
}

export interface LoadedPdf {
    source: PdfSource;
    pages: PdfPageItem[];
}
