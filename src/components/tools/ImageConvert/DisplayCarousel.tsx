import { ActionIcon, Box, Button, Card, Group, Image, Tooltip } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { toDownloadFile } from '../../../utils/downloadFile';
import { memo } from 'react';
import { IconDownload, IconTrash } from '@tabler/icons-react';

interface DisplayCarouselProps {
    imgsList: string[]
    showsDownload: boolean
    deleteCb?: (index: number) => void
}

function DisplayCarousel({ imgsList, deleteCb, showsDownload = false }: DisplayCarouselProps) {

    return (
        <>
            <Carousel slideSize="70%" slideGap="md" withIndicators height={430} loop>
                {imgsList.map((url, i) => (
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

                                    {!!deleteCb && (
                                        <Group justify='flex-end' >
                                            <Tooltip label="Remove file">
                                            <ActionIcon variant="light" aria-label="Settings" onClick={() => deleteCb(i)}>
                                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                            </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    )}
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
