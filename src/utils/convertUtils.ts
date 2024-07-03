export async function imageToWebp(myFile: File, qualityNum: number = 100): Promise<File> {
    return new Promise((rec) => {
        const image = new Image();
        image.onload = () => {

            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext('2d')!.drawImage(image, 0, 0);
            canvas.toBlob((blob) => {

                rec(
                    new File([blob!], `${crypto.randomUUID()}.webp`, { type: blob!.type })
                )

            }, 'image/webp', Math.floor(qualityNum / 100));

        };

        image.src = URL.createObjectURL(myFile);
    })
}

export async function webpimageToPng(myFile: File): Promise<File> {
    return new Promise((rec) => {
        const image = new Image();
        image.onload = () => {

            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext('2d')!.drawImage(image, 0, 0);
            canvas.toBlob((blob) => {

                rec(
                    new File([blob!], `${crypto.randomUUID()}.png`, { type: blob!.type })
                )

            }, 'image/png', 1);

        };

        image.src = URL.createObjectURL(myFile);
    })
}

export function getHeightAndWidthFromDataUrl(dataURL: string): Promise<{ height: number, width: number }> {
    return new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
            resolve({
                height: img.height,
                width: img.width
            })
        }
        img.src = dataURL
    })
}

// export const getHeightAndWidthFromDataUrl = (dataURL: string) => new Promise(resolve => {
//     const img = new Image()
//     img.onload = () => {
//         resolve({
//             height: img.height,
//             width: img.width
//         })
//     }
//     img.src = dataURL
// })