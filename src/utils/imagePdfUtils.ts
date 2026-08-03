import jsPDF from "jspdf";

const PDF_IMAGE_COMPRESSION = "SLOW";

interface ImageDimensions {
    width: number;
    height: number;
}

function getImageDimensions(file: Blob): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
        const imageUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error("Unable to read image dimensions"));
        };
        image.src = imageUrl;
    });
}

function getOrientation(width: number, height: number): "landscape" | "portrait" {
    return width > height ? "landscape" : "portrait";
}

export async function createPdfFromImages(
    files: Blob[],
    onProgress?: (completed: number, total: number) => void,
): Promise<jsPDF> {
    if (files.length === 0) {
        throw new Error("At least one image is required");
    }

    let pdf: jsPDF | undefined;

    for (const [index, file] of files.entries()) {
        const [{ width, height }, imageBuffer] = await Promise.all([
            getImageDimensions(file),
            file.arrayBuffer(),
        ]);
        const orientation = getOrientation(width, height);

        if (pdf) {
            pdf.addPage([width, height], orientation);
        } else {
            pdf = new jsPDF({
                orientation,
                unit: "px",
                format: [width, height],
                compress: true,
                hotfixes: ["px_scaling"],
            });
        }

        // Passing the original bytes lets jsPDF detect and preserve compact JPEG data.
        // SLOW prevents transparent PNGs from being stored as raw pixel data and
        // produces substantially smaller output than jsPDF's faster predictors.
        pdf.addImage(
            new Uint8Array(imageBuffer),
            0,
            0,
            width,
            height,
            undefined,
            PDF_IMAGE_COMPRESSION,
        );
        onProgress?.(index + 1, files.length);
    }

    return pdf!;
}
