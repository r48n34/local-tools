import { IconFileAnalytics, IconImageInPicture, IconPdf, IconPictureInPictureFilled, IconQrcode,IconFileTypeTs, IconFileSpreadsheet } from "@tabler/icons-react";

export const categoryList = [
    {
        labels: "Image Converter",
        link: "imageConvert",
        desc: "Convert any images to other format",
        icon: <IconImageInPicture size={60}/>,
        categories: "Media",
        tags: ["Image"],
        displayAtHome: true,
        avaiableAtHome: true,
        displayAtNav: true
    },
    {
        labels: "Image To PDF",
        link: "imageConvertPDF",
        desc: "Convert images to PDF file",
        icon: <IconPdf size={60}/>,
        categories: "Media",
        tags: ["Image", "PDF"],
        displayAtHome: true,
        avaiableAtHome: true,
        displayAtNav: true
    },
    {
        labels: "PDF to Images",
        link: "pdfConvertImages",
        desc: "Convert PDF file to images",
        icon: <IconFileAnalytics size={60}/>,
        categories: "Media",
        tags: ["PDF", "Image"],
        displayAtHome: true,
        avaiableAtHome: true,
        displayAtNav: true
    },
    {
        labels: "Documents extractor",
        link: "scanDocs",
        desc: "Extract document image",
        icon: <IconFileSpreadsheet size={60}/>,
        categories: "Media",
        tags: ["Document", "Image"],
        displayAtHome: true,
        avaiableAtHome: true,
        displayAtNav: true
    },
    {
        labels: "Scan QR",
        link: "scanQR",
        desc: "Scan Qr code from upload image",
        icon: <IconQrcode size={60}/>,
        categories: "QR",
        tags: ["QR", "Image"],
        displayAtHome: true,
        avaiableAtHome: true,
        displayAtNav: true
    },
    {
        labels: "QR maker",
        link: "makeQR",
        desc: "Making your own QR code",
        icon: <IconPictureInPictureFilled size={60}/>,
        categories: "QR",
        tags: ["QR", "Image"],
        displayAtHome: true,
        avaiableAtHome: true,
        displayAtNav: true
    },
    {
        labels: "TS Interface Generate",
        link: "types",
        desc: "Turn Your json / ts object to TS interface",
        icon: <IconFileTypeTs size={60}/>,
        categories: "Developers",
        tags: ["Developers"],
        displayAtHome: true,
        avaiableAtHome: true,
        displayAtNav: true
    }
]

export type Category = typeof categoryList[number];
