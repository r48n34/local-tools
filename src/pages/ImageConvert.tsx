import 'jimp/browser/lib/jimp';
const { Jimp } = window as any;

import { LoadingOverlay, Button, Group, Box, Text, Accordion, Grid, Select, NumberInput, Container } from '@mantine/core';
import { useMemo, useState } from 'react';
import { IconFileUpload, IconFileZip, IconImageInPicture, IconReload } from '@tabler/icons-react';

import toast from 'react-hot-toast';
import { FileWithPath } from '@mantine/dropzone';
import DropZoneComp from '../components/ImageConvert/DropZoneComp';
import DisplayCarousel from '../components/ImageConvert/DisplayCarousel';
import { toDownloadFile, toDownloadFileZip } from '../utils/downloadFile';
import { imageToWebp, webpimageToPng } from '../utils/convertUtils';
import ProgressBar from '../components/ImageConvert/ProgressBar';

type OPFormat = "jpeg" | "png" | "bmp" | "webp"
interface Settings {
    opFormat: OPFormat
    quality: number
    scale: number
}

function UploadFormComp() {

    const [progressNumber, setProgressNumber] = useState<number>(-1);

    // Input files
    const [files, setFiles] = useState<FileWithPath[]>([]);

    // Output files
    const [outputFile, setOutputFile] = useState<string[]>([]);

    const [settings, setSettings] = useState<Settings>({
        opFormat: "jpeg",
        quality: 100, // 1 - 100
        scale: 1 // 0.1 - A bigger numbers
    });

    async function transferFile() {

        try {
            toast.success('Converting images...')
            setOutputFile([]);

            const opType = settings.opFormat === "png"
                ? Jimp.MIME_PNG
                : settings.opFormat === "bmp"
                    ? Jimp.MIME_BMP
                    : Jimp.MIME_JPEG // "jpeg"

            let resultArr = []
            for (let file of files) {

                if (settings.opFormat === "webp") {
                    resultArr.push(
                        URL.createObjectURL(await imageToWebp(file, settings.quality))
                    )
                }
                else {

                    // If it's webp, change to png first due to Jimp do not support webp input
                    const finalFile = file.type === "image/webp"
                        ? await webpimageToPng(file)
                        : file

                    const jimpImage = await Jimp.read(
                        URL.createObjectURL(finalFile)
                    );

                    resultArr.push(
                        await jimpImage
                            .scale(settings.scale)
                            .quality(settings.quality)
                            .getBase64Async(opType)
                    )
                }

                setProgressNumber(Math.floor((resultArr.length / files.length) * 100))

            }

            setOutputFile(resultArr);
            toast.success('Done, enjoy your images!')

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
        <DisplayCarousel imgsList={files.map(v => URL.createObjectURL(v))} showsDownload={false} />,
        [files]
    );

    return (
        <Container size={"lg"}>
            <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                Transfer file local
            </Text>

            <Text ta={"center"} fz={16} fw={300} mt={-34} c='dimmed'>
                Convert image in local run time, no server upload require
            </Text>

            <Box mx="auto" mt={32}>

                {progressNumber >= 0 && (
                    <ProgressBar progressNumber={progressNumber}/>
                )}

                {outputFile.length <= 0 && (
                    <Box pos="relative">
                        <LoadingOverlay visible={progressNumber >= 0} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
                        <DropZoneComp setFilesCb={setFiles} acceptedTypesList={["image/png", "image/jpeg", "image/bmp", "image/tiff", "image/gif", "image/webp"]} />

                        <Accordion defaultValue="Setting">
                            <Accordion.Item key="Setting" value="Setting">
                                <Accordion.Control>
                                    Basic setting
                                </Accordion.Control>

                                <Accordion.Panel>
                                    <Grid>
                                        <Grid.Col span={6}>
                                            <Select
                                                label="Output format"
                                                description="Select your output format"
                                                data={["jpeg", "png", "bmp", "webp"]}
                                                value={settings.opFormat}
                                                onChange={(v) => setSettings({ ...settings, opFormat: v as OPFormat || "jpeg" })}
                                            />
                                        </Grid.Col>

                                        <Grid.Col span={6}>
                                            <NumberInput
                                                label="Scale images"
                                                description="x times the image output res (1 = normal)"
                                                value={settings.scale}
                                                onChange={(v) => setSettings({ ...settings, scale: +v || 1 })}
                                                min={0} max={30} step={0.1}
                                            />
                                        </Grid.Col>

                                        {["jpeg", "webp"].includes(settings.opFormat) && (
                                            <Grid.Col span={6}>
                                                <NumberInput
                                                    label="Quality output"
                                                    description="Only affect if you choosing jpeg 1 (Worst) - 100 (Best)"
                                                    value={settings.quality}
                                                    onChange={(v) => setSettings({ ...settings, quality: +v || 1 })}
                                                    min={1} max={100} step={1}
                                                />
                                            </Grid.Col>
                                        )}
                                    </Grid>
                                </Accordion.Panel>

                            </Accordion.Item>
                        </Accordion>

                        {files.length >= 1 && (
                            <Box mt={24}>

                                {DisplayCarouselMemo}

                                <Text ta="right" mt={24} fz={18} fw={500} c="dimmed">
                                    Uploaded total: {files.length} files
                                </Text>
                            </Box>
                        )}

                        <Group justify="flex-end" mb={16} mt={22}>
                            <Button
                                disabled={files.length <= 0}
                                leftSection={<IconFileUpload />}
                                variant="light"
                                onClick={transferFile}
                                loading={progressNumber >= 0}
                            >
                                Transfer all image
                            </Button>
                        </Group>

                    </Box>
                )}

                {outputFile.length >= 1 && (
                    <Box mx="auto" mt={32}>
                        
                        <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                            Result images
                        </Text>

                        <DisplayCarousel imgsList={outputFile} showsDownload={true} />
                        <Group justify="space-between" mb={16} mt={22}>

                            <Button
                                leftSection={<IconReload />}
                                variant='light'
                                color="green"
                                onClick={() => {
                                    setFiles([]);
                                    setOutputFile([]);
                                }}
                            >
                                Convert again
                            </Button>

                            <Group>
                                <Button
                                    leftSection={<IconImageInPicture />}
                                    variant='light'
                                    onClick={() => {
                                        for (let opFile of outputFile) {
                                            toDownloadFile(opFile)
                                        }
                                    }}
                                >
                                    Download All
                                </Button>

                                <Button
                                    leftSection={<IconFileZip />}
                                    variant='light'
                                    onClick={() => {
                                        toDownloadFileZip(outputFile, settings.opFormat)
                                    }}
                                >
                                    Download All with ZIP
                                </Button>
                            </Group>
                        </Group>
                    </Box>
                )}

            </Box>

        </Container>
    );
}

export default UploadFormComp