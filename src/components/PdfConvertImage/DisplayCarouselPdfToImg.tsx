import * as PDFJS from 'pdfjs-dist';

PDFJS.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString()

import { Box, Button, Card, Text } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { memo, useState } from 'react';
import { IconDownload } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { toDownloadFileZip } from '../../utils/downloadFile';

interface DisplayCarouselProps {
    fileList: File[]
}

function DisplayCarouselPdfToImg({ fileList }: DisplayCarouselProps) {

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
                    toDownloadFileZip(data, "jpeg");
                    setProgressNumber(-1)
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
                {fileList.map((file) => (
                    <Carousel.Slide key={file.name}>
                        <Card shadow="sm" padding="lg" radius="md">
                            
                            <Card.Section>
                                <Box>
                                    <Text ta="center" fz={28} mt={12}>
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
                                Download PDF
                            </Button>

                        </Card>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </>
    )
}

export default memo(DisplayCarouselPdfToImg)
