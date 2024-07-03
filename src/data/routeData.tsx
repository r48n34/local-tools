import { IconImageInPicture, IconPdf } from "@tabler/icons-react";

export const categoryList = [
    {
        labels: "Image Converter",
        link: "imageConvert",
        desc: "Convert any images to other format",
        icon: <IconImageInPicture size={60}/>
    },
    {
        labels: "Image To PDF",
        link: "imageConvertPDF",
        desc: "Convert images to PDF file",
        icon: <IconPdf size={60}/>
    }
]

export type Category = typeof categoryList[number];
