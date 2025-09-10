import * as PDFJS from 'pdfjs-dist';

PDFJS.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

import { ActionIcon, Box, Button, Card, Group, Text, Tooltip } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { memo, useState } from 'react';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { toDownloadFileZip } from '../../../utils/downloadFile';
import ProgressBar from '../ImageConvert/ProgressBar';

interface DisplayCarouselProps {
    fileList: File[]
    deleteCb?: (index: number) => void
}

function DisplayCarouselPdfToImg({ fileList, deleteCb }: DisplayCarouselProps) {

    const [progressNumber, setProgressNumber] = useState<number>(-1);

    async function transferFile(file: File) {

        try {
            const loadingTask = PDFJS.getDocument(URL.createObjectURL(file));
            const pdf = await loadingTask.promise;

            const canvasdiv = document.getElementById('canvas');
            const totalPages = pdf.numPages
            let data: string[] = [];

            for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
                const page = await pdf.getPage(pageNumber);

                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });

                let canvas = document.createElement('canvas');
                canvasdiv!.appendChild(canvas);

                // Prepare canvas using PDF page dimensions
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                let renderContext = { canvasContext: context, viewport: viewport };

                await page.render(renderContext as any).promise;
                data.push(canvas.toDataURL('image/png'))

                setProgressNumber(Math.floor((pageNumber / totalPages) * 100))

                if (data.length === totalPages) {
                    toDownloadFileZip(data.map(v => ({
                        originalName: crypto.randomUUID(),
                        data: v
                    })), "jpeg");
                    setProgressNumber(-1);
                    toast.success("Done, enjoy your zip file!")
                }

            }

        }
        catch (error) {
            console.log(error);
            toast.error("Error. Please try another file", { position: 'top-right' })
        }
        finally {
            console.log("DONE");
            setProgressNumber(-1)
        }

    }

    return (
        <>
            <div id="canvas" style={{ display: "none" }}></div>
            <Carousel slideSize="70%" slideGap="md" withIndicators height={220} loop>
                {fileList.map((file, i) => (
                    <Carousel.Slide key={file.name}>
                        <Card shadow="sm" padding="lg" radius="md">

                            <Card.Section>
                                {!!deleteCb && (
                                    <Group justify='flex-end' >
                                        <Tooltip label="Remove file">
                                            <ActionIcon variant="light" aria-label="Settings" onClick={() => deleteCb(i)}>
                                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                )}

                                <Box>
                                    <Text ta="center" fz={24} mt={12}>
                                        {file.name}
                                    </Text>
                                    <Text ta="center" fz={16} c="dimmed">
                                        {file.type}
                                    </Text>
                                </Box>

                            </Card.Section>

                            <Button
                                loading={progressNumber >= 0}
                                leftSection={<IconDownload />}
                                mt={18}
                                variant='light' fullWidth
                                onClick={() => transferFile(file)}
                            >
                                Download images
                            </Button>

                            {progressNumber >= 0 && (
                                <ProgressBar progressNumber={progressNumber} />
                            )}

                        </Card>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </>
    )
}

export default memo(DisplayCarouselPdfToImg)
