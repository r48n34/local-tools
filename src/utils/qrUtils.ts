import jsQR from "jsqr";

async function imageDataFromSource(source: string) {
    const image = Object.assign(new Image(), { src: source });
    await new Promise(resolve => image.addEventListener('load', () => resolve(null)));

    const context = Object.assign(document.createElement('canvas'), {
        width: image.width,
        height: image.height
    }).getContext('2d') as CanvasRenderingContext2D;

    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0);

    return {
        data: context.getImageData(0, 0, image.width, image.height),
        width: image.width,
        height: image.height,
    }
}

export async function imageSrcToQR(src: string) {
    const imagesArray = await imageDataFromSource(src)
    const code = jsQR(imagesArray.data.data, imagesArray.width, imagesArray.height);

    if (code) {
        // console.log("Found QR code", code);
        return code.data
    }

    return ""
}