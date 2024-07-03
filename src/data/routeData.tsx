import { IconImageInPicture } from "@tabler/icons-react";

export const categoryList = [
    {
        labels: "Image Converter",
        link: "imageConvert",
        desc: "Convert any images to other format",
        icon: <IconImageInPicture size={64}/>
    }
]

export type Category = typeof categoryList[number];
