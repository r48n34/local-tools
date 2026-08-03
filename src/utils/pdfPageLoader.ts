import * as PDFJS from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import type { LoadedPdf, PdfPageItem, PdfSource } from "../types/pdfOrganizer.ts";

PDFJS.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

const THUMBNAIL_WIDTH = 220;

async function canvasToObjectUrl(canvas: HTMLCanvasElement) {
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
            if (value) {
                resolve(value);
            } else {
                reject(new Error("Unable to render PDF thumbnail"));
            }
        }, "image/webp");
    });

    return URL.createObjectURL(blob);
}

export async function loadPdfFile(file: File): Promise<LoadedPdf> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validationDocument = await PDFDocument.load(bytes);
    if (validationDocument.getPageCount() === 0) {
        throw new Error("The PDF has no pages");
    }

    const source: PdfSource = {
        id: crypto.randomUUID(),
        name: file.name,
        bytes,
    };
    const loadingTask = PDFJS.getDocument({ data: bytes.slice() });
    const pdf = await loadingTask.promise;
    const pages: PdfPageItem[] = [];

    try {
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const initialViewport = page.getViewport({ scale: 1 });
            const viewport = page.getViewport({ scale: THUMBNAIL_WIDTH / initialViewport.width });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Canvas is not supported in this browser");
            }

            await page.render({ canvas, canvasContext: context, viewport }).promise;
            pages.push({
                id: crypto.randomUUID(),
                sourceId: source.id,
                sourceName: source.name,
                sourcePageIndex: pageNumber - 1,
                selected: false,
                rotation: 0,
                thumbnailUrl: await canvasToObjectUrl(canvas),
            });
            page.cleanup();
        }
    } catch (error) {
        pages.forEach((page) => URL.revokeObjectURL(page.thumbnailUrl));
        throw error;
    } finally {
        await pdf.destroy();
    }

    return { source, pages };
}
