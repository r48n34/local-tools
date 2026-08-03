import { createWorker, OEM } from "tesseract.js";

export type OcrLanguagePreset = "eng" | "eng+chi_sim" | "eng+chi_tra";

export type OcrProgress = {
    fileIndex: number | null;
    totalFiles: number;
    status: string;
    fileProgress: number;
    overallProgress: number;
};

export type OcrResult = {
    id: string;
    fileName: string;
    text: string;
    confidence: number | null;
    error: string | null;
};

type RecognizeImagesOptions = {
    onProgress?: (progress: OcrProgress) => void;
    onResult?: (result: OcrResult, index: number) => void;
};

const OCR_ASSET_PATHS = {
    workerPath: "/tesseract/worker.min.js",
    corePath: "/tesseract/core",
    langPath: "/tesseract/lang",
} as const;

export const OCR_LANGUAGE_OPTIONS: Array<{
    value: OcrLanguagePreset;
    label: string;
}> = [
    { value: "eng", label: "English" },
    { value: "eng+chi_sim", label: "Simplified Chinese + English" },
    { value: "eng+chi_tra", label: "Traditional Chinese + English" },
];

export function getOcrLanguages(preset: OcrLanguagePreset): string[] {
    return preset.split("+");
}

export function getTextDownloadName(fileName: string): string {
    const baseName = fileName.replace(/\.[^/.]+$/, "").trim();
    const safeName = baseName.replace(/[<>:"/\\|?*\p{Cc}]/gu, "_").replace(/[. ]+$/g, "");

    return `${safeName || "ocr-result"}.txt`;
}

export function formatCombinedOcrText(results: OcrResult[]): string {
    return results
        .map((result) => {
            const content = result.error ? `[OCR failed: ${result.error}]` : result.text;
            return `===== ${result.fileName} =====\n${content}`;
        })
        .join("\n\n");
}

function errorMessage(error: unknown): string {
    return error instanceof Error && error.message ? error.message : "Unknown OCR error";
}

function createErrorResult(file: File, error: unknown): OcrResult {
    return {
        id: crypto.randomUUID(),
        fileName: file.name,
        text: "",
        confidence: null,
        error: errorMessage(error),
    };
}

export async function recognizeImages(
    files: File[],
    preset: OcrLanguagePreset,
    { onProgress, onResult }: RecognizeImagesOptions = {},
): Promise<OcrResult[]> {
    if (files.length === 0) {
        return [];
    }

    let currentFileIndex: number | null = null;
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

    try {
        worker = await createWorker(getOcrLanguages(preset), OEM.LSTM_ONLY, {
            ...OCR_ASSET_PATHS,
            gzip: true,
            logger: (message) => {
                const fileProgress = Math.round(message.progress * 100);
                const overallProgress =
                    currentFileIndex === null
                        ? 0
                        : Math.round(((currentFileIndex + message.progress) / files.length) * 100);

                onProgress?.({
                    fileIndex: currentFileIndex,
                    totalFiles: files.length,
                    status: message.status,
                    fileProgress,
                    overallProgress,
                });
            },
        });
    } catch (error) {
        const results = files.map((file, index) => {
            const result = createErrorResult(file, error);
            onResult?.(result, index);
            return result;
        });

        return results;
    }

    const results: OcrResult[] = [];

    try {
        for (let index = 0; index < files.length; index += 1) {
            currentFileIndex = index;
            const file = files[index];

            try {
                const response = await worker.recognize(file);
                const result: OcrResult = {
                    id: crypto.randomUUID(),
                    fileName: file.name,
                    text: response.data.text.trim(),
                    confidence: response.data.confidence,
                    error: null,
                };
                results.push(result);
                onResult?.(result, index);
            } catch (error) {
                const result = createErrorResult(file, error);
                results.push(result);
                onResult?.(result, index);
            }

            onProgress?.({
                fileIndex: index,
                totalFiles: files.length,
                status: "recognition complete",
                fileProgress: 100,
                overallProgress: Math.round(((index + 1) / files.length) * 100),
            });
        }

        return results;
    } finally {
        await worker.terminate();
    }
}
