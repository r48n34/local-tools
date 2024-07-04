import { ActionIcon, Box, Button, Card, Group, Image, Tooltip } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { memo } from 'react';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { getHeightAndWidthFromDataUrl } from '../../../utils/convertUtils';

interface DisplayCarouselProps {
    imgsList: string[]
    deleteCb?: (index: number) => void
}

function DisplayCarouselPdf({ imgsList, deleteCb }: DisplayCarouselProps) {

    async function transferFile(url: string) {

        try {

            const currentImg = url;
            const { width, height } = await getHeightAndWidthFromDataUrl(currentImg);

            let doc = width > height
                ? new jsPDF('l', 'mm', [width, height])
                : new jsPDF('p', 'mm', [height, width])

            doc.addImage(currentImg, 'PNG', 0, 0, width, height);
            doc.save('download.pdf');
    
            toast.success('Done, enjoy your PDF!')
        }
        catch (error) {
            toast.error("Error. Please try another file", { position: 'top-right' })
        }

    }

    return (
        <>
            <Carousel slideSize="70%" slideGap="md" withIndicators height={430} loop>
                {imgsList.map((url, i) => (
                    <Carousel.Slide key={url}>
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
                                    <Image
                                        src={url}
                                        style={{ objectFit: "cover" }}
                                        alt={"Images"}
                                        height={300}
                                        width="100%"
                                    />
                                </Box>

                            </Card.Section>

                            <Button
                                leftSection={<IconDownload />}
                                mt={18}
                                variant='light' fullWidth
                                onClick={() => transferFile(url)}
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

export default memo(DisplayCarouselPdf)
