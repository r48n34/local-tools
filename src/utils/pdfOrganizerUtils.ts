import JSZip from "jszip";
import { degrees, PDFDocument } from "pdf-lib";
import type { PdfPageItem, PdfSource } from "../types/pdfOrganizer.ts";

function normalizedDegrees(value: number) {
    return ((value % 360) + 360) % 360;
}

function safeFileStem(fileName: string) {
    const stem = fileName.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]+/g, "_");
    return stem || "page";
}

export async function assemblePdf(sources: PdfSource[], pages: PdfPageItem[]) {
    if (pages.length === 0) {
        throw new Error("At least one PDF page is required");
    }

    const sourceDocuments = new Map<string, PDFDocument>();
    for (const source of sources) {
        sourceDocuments.set(source.id, await PDFDocument.load(source.bytes));
    }

    const output = await PDFDocument.create();
    for (const pageItem of pages) {
        const source = sourceDocuments.get(pageItem.sourceId);
        if (!source) {
            throw new Error(`Missing source document for ${pageItem.sourceName}`);
        }

        const [page] = await output.copyPages(source, [pageItem.sourcePageIndex]);
        const originalRotation = page.getRotation().angle;
        page.setRotation(degrees(normalizedDegrees(originalRotation + pageItem.rotation)));
        output.addPage(page);
    }

    return output.save();
}

export async function createSeparatePagesZip(sources: PdfSource[], pages: PdfPageItem[]) {
    if (pages.length === 0) {
        throw new Error("Select at least one PDF page");
    }

    const zip = new JSZip();
    for (const [index, page] of pages.entries()) {
        const bytes = await assemblePdf(sources, [page]);
        const name = `${String(index + 1).padStart(3, "0")}_${safeFileStem(page.sourceName)}_page_${page.sourcePageIndex + 1}.pdf`;
        zip.file(name, bytes);
    }

    return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}
