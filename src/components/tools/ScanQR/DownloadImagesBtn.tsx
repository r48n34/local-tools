import { ActionIcon, Tooltip } from '@mantine/core';
import { IconArrowBarToDown } from "@tabler/icons-react"

type DownloadImagesBtnProps = {
    imgSrc: string;
    fileName: string;
}

function DownloadImagesBtn({ imgSrc, fileName = "qr_code_images" }: DownloadImagesBtnProps) {

    function downloadImages() {

        if (document) {
            let a = document.createElement("a");
            (a as any).style = "display: none";
            document.body.appendChild(a);
            a.href = imgSrc;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(imgSrc);
        }

    }

    return (
        <>
            {imgSrc !== "" && (
                <Tooltip label={"Download QR"}>
                    <ActionIcon onClick={() => downloadImages()} variant='light'>
                        <IconArrowBarToDown size="1.125rem" />
                    </ActionIcon>
                </Tooltip>
            )}
        </>
    )
}

export default DownloadImagesBtn
