import assert from "node:assert/strict";
import test from "node:test";
import type { OcrResult } from "../src/utils/ocr.ts";
import { formatCombinedOcrText, getOcrLanguages, getTextDownloadName } from "../src/utils/ocr.ts";

function result(overrides: Partial<OcrResult> = {}): OcrResult {
    return {
        id: crypto.randomUUID(),
        fileName: "image.png",
        text: "Example text",
        confidence: 95,
        error: null,
        ...overrides,
    };
}

test("maps every OCR preset to its Tesseract language list", () => {
    assert.deepEqual(getOcrLanguages("eng"), ["eng"]);
    assert.deepEqual(getOcrLanguages("eng+chi_sim"), ["eng", "chi_sim"]);
    assert.deepEqual(getOcrLanguages("eng+chi_tra"), ["eng", "chi_tra"]);
});

test("creates safe text download names while preserving useful dots and Unicode", () => {
    assert.equal(getTextDownloadName("invoice.final.png"), "invoice.final.txt");
    assert.equal(getTextDownloadName("收據.jpeg"), "收據.txt");
    assert.equal(getTextDownloadName('bad<>:"|?*.webp'), "bad_______.txt");
    assert.equal(getTextDownloadName(".png"), "ocr-result.txt");
});

test("formats edited OCR results in upload order and preserves Unicode and empty text", () => {
    const formatted = formatCombinedOcrText([
        result({ fileName: "first.png", text: "Edited first result" }),
        result({ fileName: "第二張.png", text: "繁體中文" }),
        result({ fileName: "empty.png", text: "" }),
    ]);

    assert.equal(
        formatted,
        [
            "===== first.png =====\nEdited first result",
            "===== 第二張.png =====\n繁體中文",
            "===== empty.png =====\n",
        ].join("\n\n"),
    );
});

test("labels failed images in combined output without discarding their position", () => {
    const formatted = formatCombinedOcrText([
        result({ fileName: "good.png", text: "Readable" }),
        result({ fileName: "broken.png", text: "", error: "Unsupported image" }),
    ]);

    assert.match(formatted, /===== good\.png =====\nReadable/);
    assert.match(formatted, /===== broken\.png =====\n\[OCR failed: Unsupported image\]/);
    assert.ok(formatted.indexOf("good.png") < formatted.indexOf("broken.png"));
});
