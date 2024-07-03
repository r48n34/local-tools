export async function imageToWebp(myFile: File) {
    return new Promise((rec) => {
        const image = new Image();
        image.onload = () => {

            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext('2d')!.drawImage(image, 0, 0);
            canvas.toBlob((blob) => {

                const myImage = new File([blob!], 'my-new-name.webp', { type: blob!.type });
                rec(myImage)

            }, 'image/webp', 1);

        };

        image.src = URL.createObjectURL(myFile);
    })
}