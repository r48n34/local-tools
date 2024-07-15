import { Helmet } from 'react-helmet-async';
import jsPDF from 'jspdf';
import { Button, Group, Box, Text, Container, LoadingOverlay } from '@mantine/core';
import { useMemo, useState } from 'react';
import { IconDeviceMobileMessage, IconFileUpload, IconTrash } from '@tabler/icons-react';

import { FileWithPath } from '@mantine/dropzone';
import DropZoneComp from '../../components/tools/ImageConvert/DropZoneComp';

import { getHeightAndWidthFromDataUrl } from '../../utils/convertUtils';
import DisplayCarouselPdf from '../../components/tools/convertPDF/DisplayCarouselPdf';
import toast from 'react-hot-toast';
import ProgressBar from '../../components/tools/ImageConvert/ProgressBar';

function ImageConvertPDF() {

    const [progressNumber, setProgressNumber] = useState<number>(-1);

    // Input files
    const [files, setFiles] = useState<FileWithPath[]>([]);

    async function combindAllToPdf() {

        try {

            const grandPdf = new jsPDF()

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                const currentImg = URL.createObjectURL(file)
                const { width, height } = await getHeightAndWidthFromDataUrl(currentImg);

                if (width > height) {
                    grandPdf.addPage([width, height], 'l');
                }
                else {
                    grandPdf.addPage([height, width], 'p');
                }

                grandPdf.addImage(currentImg, 'PNG', 0, 0, width, height);
                setProgressNumber(Math.floor(((i + 1) / files.length) * 100))
            }

            // Remove the first blank page
            grandPdf.deletePage(1);
            grandPdf.save('combinded_download.pdf')
        }
        catch (error) {
            toast.error("Error. Please try another file", { position: 'top-right' })
        }
        finally {
            setProgressNumber(-1)
        }

    }

    // Prevent flashing display rerender
    const DisplayCarouselMemo = useMemo(() =>
        <DisplayCarouselPdf
            imgsList={files.map(v => URL.createObjectURL(v))}
            nameList={files.map(v => v.name)}
            deleteCb={(ind) => setFiles((files) => files.filter((_, i) => i !== ind))}
        />,
        [files]
    );

    return (
        <>
            <Helmet>
                <title>Image Convert PDF | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconDeviceMobileMessage size={40}/> Image To PDF
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                    Convert images to PDF file in local run time, no server upload require
                </Text>

                <Box mx="auto" mt={32}>

                    {progressNumber >= 0 && (
                        <ProgressBar progressNumber={progressNumber} />
                    )}

                    <Box pos="relative">
                        <LoadingOverlay
                            visible={progressNumber >= 0}
                            zIndex={1000}
                            overlayProps={{ radius: "sm", blur: 2 }}
                        />
                        <DropZoneComp
                            setFilesCb={(files) => setFiles(currentFiles => [...currentFiles, ...files])}
                            acceptedTypesList={["image/png", "image/jpeg", "image/bmp", "image/tiff", "image/gif", "image/webp"]}
                        />

                        {files.length >= 1 && (
                            <Box mt={24}>
                                {DisplayCarouselMemo}

                                <Text ta="right" mt={24} fz={18} fw={500} c="dimmed">
                                    Uploaded total: {files.length} files
                                </Text>
                            </Box>
                        )}

                        <Group justify="space-between" mb={16} mt={22}>
                            <Button
                                disabled={files.length <= 0}
                                leftSection={<IconTrash />}
                                variant="light"
                                color='red'
                                onClick={() => {
                                    setFiles([])
                                }}
                                loading={progressNumber >= 0}
                            >
                                Remove all files
                            </Button>

                            <Button
                                disabled={files.length <= 0}
                                leftSection={<IconFileUpload />}
                                variant="light"
                                onClick={combindAllToPdf}
                            >
                                Combind to one PDF
                            </Button>
                        </Group>

                    </Box>


                </Box>

            </Container>
        </>
    );
}

export default ImageConvertPDF