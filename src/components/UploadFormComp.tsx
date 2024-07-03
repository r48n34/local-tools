import 'jimp/browser/lib/jimp';
const { Jimp } = window as any;

import { Button, Group, Box, Text } from '@mantine/core';
import { useState } from 'react';
import { IconFileUpload } from '@tabler/icons-react';

import toast from 'react-hot-toast';
import { FileWithPath } from '@mantine/dropzone';
import DropZoneComp from './common/DropZoneComp';
import DisplayCarousel from './common/DisplayCarousel';
import { toDownloadFile } from '../utils/downloadFile';

function UploadFormComp() {

    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [outputFile, setOutputFile] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function imageToWebp(myFile: File) {
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

    async function transferFile() {

        try {
            setIsLoading(true);

            console.log("HELLO");
            console.log(files);
            console.log(isLoading);

            // const modifyFile = files.map( v => {
            //     if(v.){

            //     }
            // })

            let resultArr = []
            for (let file of files) {
                const jimpImage = await Jimp.read(
                    URL.createObjectURL(file)
                );

                // Jimp.MIME_PNG, Jimp.MIME_JPEG, Jimp.MIME_BMP
                const newImg = await jimpImage
                    .scale(1)
                    .resize(256, 256)
                    .getBase64Async(Jimp.MIME_JPEG);

                console.log(await imageToWebp(file));

                resultArr.push(newImg)

            }

            console.log(resultArr);

            setOutputFile(resultArr)

        }
        catch (error) {
            console.log(error);
            toast.error("Error. Please try another file", { position: 'top-right' })
        }
        finally {
            setIsLoading(false)
        }

    }

    return (
        <>
            <Text ta={"center"} fz={34} fw={300} mb={32} mt={4}>
                Predict stuff
            </Text>

            <Text ta={"center"} fz={14} fw={300} mt={-34} c='dimmed'>
                Predict stuff in nextjs runtime
            </Text>



            <Box mx="auto" mt={32}>

                <DropZoneComp setFilesCb={setFiles} />

                <DisplayCarousel imgsList={files.map(v => URL.createObjectURL(v))} />

                {/* <SimpleGrid cols={{ base: 1, sm: 4 }} mt={previews.length > 0 ? 'xl' : 0}>
                            {previews}
                        </SimpleGrid> */}

                <Group justify="flex-end" mb={16} mt={22}>
                    <Button
                        disabled={files.length <= 0}
                        leftSection={<IconFileUpload />}
                        variant="light"
                        onClick={transferFile}
                    >
                        Transfer
                    </Button>
                </Group>

            </Box>

            <Box mx="auto" mt={32}>
                {outputFile.length >= 1 && (
                    <>
                        <DisplayCarousel imgsList={outputFile} />
                        <Button
                            variant='light'
                            onClick={() => {
                                for (let k of outputFile) {
                                    toDownloadFile(k, "Hello")
                                }
                            }}
                        >
                            Download
                        </Button>
                    </>
                )}
            </Box>

            {/* {outputFile.map(v => <img src={v} alt="Transformed" />)} */}

        </>
    );
}

export default UploadFormComp