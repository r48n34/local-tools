import JSZip from "jszip";
import { ImageOutputScheme } from "../pages/tools/ImageConvert";

export function toDownloadFile(str: string, fileName: string = crypto.randomUUID()) {

    if (typeof window !== "undefined") {
        const link = document.createElement("a");
        link.href = str;

        // File name
        link.download = fileName;

        link.click();
    }

}

function getoneBaseTotalSize(base64Data: string) {
    let length = base64Data.length;

    // Account for padding characters
    if (base64Data.endsWith('==')) {
        length -= 2;
    } else if (base64Data.endsWith('=')) {
        length -= 1;
    }

    // In Byte
    return Math.ceil((length * 3) / 4);
}

export function getAllBaseTotalSize(baseStrLs: string[]) {
    const totalByte =  baseStrLs.reduce((acc, str) => {
        return acc + getoneBaseTotalSize(str)
    }, 0);

    return {
        byte: totalByte,
        kb: totalByte / 1024,
        mb: totalByte / 1024 / 1024,
    }
}

export async function toDownloadFileZip(
    strs: ImageOutputScheme[],
    currentMineType: "jpeg" | "png" | "bmp" | "webp"
) {

    const zip = new JSZip();

    // Add Images to the zip file
    for (let i = 0; i < strs.length; i++) {
        const response = await fetch(strs[i].data);
        const blob = await response.blob();
        zip.file(`${i + 1}_${strs[i].originalName}.${currentMineType}`, blob);
    }

    // Generate the zip file
    const zipData = await zip.generateAsync({
        type: "blob",
        streamFiles: true,
        // compression: "DEFLATE"
    });

    // Create a download link for the zip file
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(zipData);
    link.download = `${crypto.randomUUID()}.zip`;
    link.click();

}