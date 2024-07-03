import { Box, Button, Card, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { toDownloadFile } from '../../utils/downloadFile';
import { memo } from 'react';
import { IconDownload } from '@tabler/icons-react';

interface DisplayCarouselProps {
    imgsList: string[]
    showsDownload: boolean
}

function DisplayCarousel({ imgsList, showsDownload = false }: DisplayCarouselProps) {

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

                            {showsDownload && (
                                <Button
                                    leftSection={<IconDownload />}
                                    mt={18}
                                    variant='light' fullWidth
                                    onClick={() => toDownloadFile(url)}
                                >
                                    Download
                                </Button>
                            )}
                        </Card>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </>
    )
}

export default memo(DisplayCarousel)
