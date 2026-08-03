import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";
import { degrees, PDFDocument } from "pdf-lib";
import type { PdfPageItem, PdfSource } from "../src/types/pdfOrganizer.ts";
import { assemblePdf, createSeparatePagesZip } from "../src/utils/pdfOrganizerUtils.ts";

async function source(id: string, name: string, pageWidths: number[]): Promise<PdfSource> {
    const document = await PDFDocument.create();
    pageWidths.forEach((width) => document.addPage([width, 200]));
    return { id, name, bytes: await document.save() };
}

function page(
    sourceId: string,
    sourceName: string,
    sourcePageIndex: number,
    rotation: PdfPageItem["rotation"] = 0,
): PdfPageItem {
    return {
        id: `${sourceId}-${sourcePageIndex}`,
        sourceId,
        sourceName,
        sourcePageIndex,
        selected: true,
        rotation,
        thumbnailUrl: "",
    };
}

test("assembles mixed sources in displayed order and applies rotation", async () => {
    const first = await source("first", "first.pdf", [100, 110]);
    const second = await source("second", "second.pdf", [300]);

    const bytes = await assemblePdf(
        [first, second],
        [page("second", "second.pdf", 0), page("first", "first.pdf", 1, 90)],
    );
    const output = await PDFDocument.load(bytes);

    assert.equal(output.getPageCount(), 2);
    assert.equal(output.getPage(0).getWidth(), 300);
    assert.equal(output.getPage(1).getWidth(), 110);
    assert.deepEqual(output.getPage(1).getRotation(), degrees(90));
});

test("exports every selected page as a separately named PDF in a ZIP", async () => {
    const input = await source("source", "My document.pdf", [100, 120]);
    const zipBlob = await createSeparatePagesZip(
        [input],
        [page("source", input.name, 1), page("source", input.name, 0)],
    );
    const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    const names = Object.keys(zip.files);

    assert.deepEqual(names, ["001_My_document_page_2.pdf", "002_My_document_page_1.pdf"]);
    for (const name of names) {
        const document = await PDFDocument.load(await zip.file(name)!.async("uint8array"));
        assert.equal(document.getPageCount(), 1);
    }
});

test("rejects an empty page selection", async () => {
    await assert.rejects(() => assemblePdf([], []), /At least one PDF page/);
});
