import { Box, Button, Card, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { memo } from 'react';
import { IconDownload } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { getHeightAndWidthFromDataUrl } from '../../utils/convertUtils';

interface DisplayCarouselProps {
    imgsList: string[]
}

function DisplayCarouselPdf({ imgsList }: DisplayCarouselProps) {

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
                {imgsList.map((url) => (
                    <Carousel.Slide key={url}>
                        <Card shadow="sm" padding="lg" radius="md">
                            <Card.Section>
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
