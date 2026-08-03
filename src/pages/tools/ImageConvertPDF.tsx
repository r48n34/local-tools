import { Helmet } from "react-helmet-async";
import { Button, Group, Box, Text, Container, LoadingOverlay } from "@mantine/core";
import { useState } from "react";
import { IconDeviceMobileMessage, IconFileUpload, IconTrash } from "@tabler/icons-react";

import { FileWithPath } from "@mantine/dropzone";
import DropZoneComp from "../../components/tools/ImageConvert/DropZoneComp";

import { createPdfFromImages } from "../../utils/imagePdfUtils";
import DisplayCarouselPdf from "../../components/tools/convertPDF/DisplayCarouselPdf";
import toast from "react-hot-toast";
import ProgressBar from "../../components/tools/ImageConvert/ProgressBar";

function ImageConvertPDF() {
    const [progressNumber, setProgressNumber] = useState<number>(-1);

    // Input files
    const [files, setFiles] = useState<FileWithPath[]>([]);

    async function combindAllToPdf() {
        try {
            const grandPdf = await createPdfFromImages(files, (completed, total) => {
                setProgressNumber(Math.floor((completed / total) * 100));
            });
            grandPdf.save("combinded_download.pdf");
        } catch {
            toast.error("Error. Please try another file", { position: "top-right" });
        } finally {
            setProgressNumber(-1);
        }
    }

    return (
        <>
            <Helmet>
                <title>Image Convert PDF | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconDeviceMobileMessage size={40} /> Image To PDF
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c="dimmed">
                    Convert images to PDF file in local run time, no server upload require
                </Text>

                <Box mx="auto" mt={32}>
                    {progressNumber >= 0 && <ProgressBar progressNumber={progressNumber} />}

                    <Box pos="relative">
                        <LoadingOverlay
                            visible={progressNumber >= 0}
                            zIndex={1000}
                            overlayProps={{ radius: "sm", blur: 2 }}
                        />
                        <DropZoneComp
                            setFilesCb={(files) =>
                                setFiles((currentFiles) => [...currentFiles, ...files])
                            }
                            acceptedTypesList={[
                                "image/png",
                                "image/jpeg",
                                "image/bmp",
                                "image/tiff",
                                "image/gif",
                                "image/webp",
                            ]}
                        />

                        {files.length >= 1 && (
                            <Box mt={24}>
                                <DisplayCarouselPdf
                                    files={files}
                                    deleteCb={(ind) =>
                                        setFiles((files) => files.filter((_, i) => i !== ind))
                                    }
                                />

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
                                color="red"
                                onClick={() => {
                                    setFiles([]);
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

export default ImageConvertPDF;
