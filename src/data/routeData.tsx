import { IconImageInPicture, IconPdf } from "@tabler/icons-react";

export const categoryList = [
    {
        labels: "Image Converter",
        link: "imageConvert",
        desc: "Convert any images to other format",
        icon: <IconImageInPicture size={60}/>,
        categories: "Media",
        tags: ["Image"]
    },
    {
        labels: "Image To PDF",
        link: "imageConvertPDF",
        desc: "Convert images to PDF file",
        icon: <IconPdf size={60}/>,
        categories: "Media",
        tags: ["Image", "PDF"]
    },
    {
        labels: "PDF to Images",
        link: "pdfConvertImages",
        desc: "Convert PDF file to images",
        icon: <IconImageInPicture size={60}/>,
        categories: "Media",
        tags: ["PDF", "Image"]
    }
]

export type Category = typeof categoryList[number];
