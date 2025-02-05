import { useEffect, useState } from 'react';
import { Text, Card, FileInput, Grid, Group, ActionIcon, Tooltip, Image } from '@mantine/core';
import CenterLoading from '../../common/CenterLoading';
import { IconDownload } from '@tabler/icons-react';
import toast from 'react-hot-toast';

function ScanDocsComp() {

    const [loadedOpenCV, setLoadedOpenCV] = useState(false);
    const [value, setValue] = useState<File | null>(null);
    const [extractedDocumentLink, setExtractedDocumentLink] = useState<string>("");

    useEffect(() => {
        // @ts-ignore
        const scanner = new jscanify();

        loadOpenCv(() => {
            if (value) {
                const newImg = document.createElement('img');
                newImg.src = URL.createObjectURL(value);

                newImg.onload = function () {
                    const resultCanvas: HTMLCanvasElement | null = scanner.extractPaper(newImg, newImg.width, newImg.height);

                    // Failed to extract documents
                    if (!resultCanvas) {
                        toast.error("Failed to extract document")
                        return
                    }

                    const canvaToImgUrl = resultCanvas.toDataURL();
                    setExtractedDocumentLink(canvaToImgUrl);

                    toast.success("Document Extracted")
                };
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const loadOpenCv = (onComplete: Function) => {
        const isScriptPresent = !!document.getElementById('open-cv');
        if (isScriptPresent || loadedOpenCV) {
            setLoadedOpenCV(true);
            onComplete();
        } else {
            const script = document.createElement('script');
            script.id = 'open-cv';
            script.src = 'https://docs.opencv.org/4.7.0/opencv.js';

            script.onload = function () {
                setTimeout(function () {
                    onComplete();
                }, 1000);
                setLoadedOpenCV(true);
            };
            document.body.appendChild(script);
        }
    };

    if (!loadedOpenCV) {
        return (
            <CenterLoading />
        )
    }

    return (
        <>
            <FileInput
                mt={12}
                label="Input Document image"
                description="Upload your document image here"
                value={value}
                onChange={setValue}
                accept="image/png,image/jpeg,image/webp"
            />

            {!!value && (
                <>
                    <Grid mt={36}>
                        <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <Group justify="space-between" mb={24}>
                                    <Text fz={22} fw={300} c='dimmed' >
                                        Extracted Result
                                    </Text>

                                    <Tooltip label="Download file">
                                        <ActionIcon variant="light" aria-label="Download file"
                                            onClick={() => {
                                                let link = document.createElement('a');
                                                link.download = 'extractedDocuments.png';
                                                link.href = (document.getElementById('extractedDocs') as HTMLImageElement)!.src
                                                link.click();
                                            }}
                                        >
                                            <IconDownload style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>

                                <Group justify='center'>
                                    <Image
                                        id="extractedDocs"
                                        radius="md"
                                        src={extractedDocumentLink || ""}
                                    />
                                </Group>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </>
            )}
        </>
    )
}

export default ScanDocsComp
