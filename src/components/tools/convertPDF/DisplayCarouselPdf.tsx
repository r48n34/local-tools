import { ActionIcon, Box, Button, Card, Group, Image, Tooltip, Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { memo, useEffect, useMemo } from "react";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { createPdfFromImages } from "../../../utils/imagePdfUtils";

interface DisplayCarouselProps {
    files: File[];
    deleteCb?: (index: number) => void;
}

function DisplayCarouselPdf({ files, deleteCb }: DisplayCarouselProps) {
    const imageUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

    useEffect(
        () => () => {
            imageUrls.forEach(URL.revokeObjectURL);
        },
        [imageUrls],
    );

    async function transferFile(file: File) {
        try {
            const doc = await createPdfFromImages([file]);
            doc.save("download.pdf");

            toast.success("Done, enjoy your PDF!");
        } catch {
            toast.error("Error. Please try another file", { position: "top-right" });
        }
    }

    return (
        <>
            <Carousel
                slideSize="70%"
                slideGap="md"
                withIndicators
                height={430}
                emblaOptions={{ loop: true }}
            >
                {imageUrls.map((url, i) => (
                    <Carousel.Slide key={url}>
                        <Card shadow="sm" padding="lg" radius="md">
                            <Card.Section>
                                {!!deleteCb && (
                                    <Group justify="flex-end">
                                        <Tooltip label="Remove file">
                                            <ActionIcon
                                                variant="light"
                                                aria-label="Settings"
                                                onClick={() => deleteCb(i)}
                                            >
                                                <IconTrash
                                                    style={{ width: "70%", height: "70%" }}
                                                    stroke={1.5}
                                                />
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

                            {!!files[i]?.name && (
                                <Text ta="center" fw={300} fz={14} mt={12}>
                                    {files[i].name}
                                </Text>
                            )}

                            <Button
                                leftSection={<IconDownload />}
                                mt={18}
                                variant="light"
                                fullWidth
                                onClick={() => transferFile(files[i])}
                            >
                                Download PDF
                            </Button>
                        </Card>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </>
    );
}

export default memo(DisplayCarouselPdf);
