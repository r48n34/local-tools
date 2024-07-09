import JSZip from "jszip";

export function toDownloadFile(str: string) {

    if (typeof window !== "undefined") {
        const link = document.createElement("a");
        link.href = str;

        // File name
        link.download = crypto.randomUUID();

        link.click();
    }

}

export async function toDownloadFileZip(
    strs: string[],
    currentMineType: "jpeg" | "png" | "bmp" | "webp"
) {

    const zip = new JSZip();

    // Add Images to the zip file
    for (let i = 0; i < strs.length; i++) {
        const response = await fetch(strs[i]);
        const blob = await response.blob();
        zip.file(`${i + 1}_${crypto.randomUUID()}.${currentMineType}`, blob);
    }

    // Generate the zip file
    const zipData = await zip.generateAsync({
        type: "blob",
        streamFiles: true,
        compression: "DEFLATE"
    });

    // Create a download link for the zip file
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(zipData);
    link.download = `${crypto.randomUUID()}.zip`;
    link.click();

}