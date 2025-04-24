import { Card, ColorInput, FileInput, Grid, Group, Textarea, Tooltip, Text, Select, Button, TextInput, Accordion } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconArrowBarToDown, IconImageInPicture, IconTag } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

function QRMakingComp() {

    const qrRef = useRef<QRCode>(null);
    const { ref, width } = useElementSize();

    const [imgFile, setImgFile] = useState<File>();

    const [fileName, setFileName] = useState<string>("My QR Code");
    const [qrContent, setQrContent] = useState<string>("https://www.youtube.com/");

    const [bgColor, setBgColor] = useState<string>("#FFFFFF");
    const [fgColor, setFgColor] = useState<string>("#000000");

    const [qrStyle, setQrStyle] = useState<"squares" | "dots" | "fluid" | undefined>("squares");

    return (
        <>
            <Grid>
                <Grid.Col span={{ base: 12, md: 5, lg: 6 }}>

                    <Text ta="center" fz={20} c="dimmed">
                        Required field
                    </Text>
                    <Textarea
                        label="QR content"
                        description="Input your QR content (URL / String)"
                        placeholder="Input placeholder"

                        value={qrContent}
                        onChange={(event) => setQrContent(event.currentTarget.value)}
                    />

                    <TextInput
                        leftSection={<IconTag size={18} />}
                        mt={12}
                        label="QR File Name"
                        description="Your Download QR File Name"
                        placeholder="File Name"
                        value={fileName}
                        onChange={(event) => setFileName(event.currentTarget.value)}
                    />

                    <Accordion mt={12} variant="separated">
                        <Accordion.Item value="Optional">
                            <Accordion.Control>
                                Optional Setting
                            </Accordion.Control>
                            <Accordion.Panel>

                                <FileInput
                                    mt={16}
                                    clearable
                                    accept="image/png,image/jpeg"
                                    label="QR Center Image"
                                    placeholder="Upload image"
                                    description="Input your image for QR"
                                    leftSection={<IconImageInPicture size={20} />}
                                    value={imgFile}
                                    onChange={setImgFile as any}
                                />

                                <ColorInput
                                    mt={16}
                                    label="Background Color"
                                    description="Set QR code bg Color"
                                    value={bgColor} onChange={setBgColor}
                                />

                                <ColorInput
                                    mt={16}
                                    label="Foreground Color"
                                    description="Set QR code fg Color"
                                    value={fgColor} onChange={setFgColor}
                                />

                                <Select
                                    mt={16}
                                    label="QR Style"
                                    placeholder="Pick QR Style"
                                    description="Pick QR Style"
                                    data={['squares', 'dots', 'fluid']}
                                    value={qrStyle} onChange={setQrStyle as any}
                                />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
{/* 
                    <Text ta="center" mt={16} fz={20} c="dimmed">
                        Optional
                    </Text> */}


                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 7, lg: 6 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>

                        <Group justify='center' ref={ref}>
                            <QRCode
                                size={width * 0.9}
                                logoWidth={width * 0.9 * 0.2}
                                value={qrContent}
                                logoImage={!!imgFile ? URL.createObjectURL(imgFile) : ""}
                                ref={qrRef}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                qrStyle={qrStyle}
                            />
                        </Group>

                        <Group justify='center' mt={24}>
                            <Tooltip label={"Download png QR"}>
                                <Button
                                    size="xs"
                                    leftSection={<IconArrowBarToDown size="1.125rem" />}
                                    onClick={() => qrRef.current!.download('png', fileName)}
                                    variant='light'
                                >
                                    png
                                </Button>
                            </Tooltip>

                            <Tooltip label={"Download jpg QR"}>
                                <Button
                                    size="xs"
                                    leftSection={<IconArrowBarToDown size="1.125rem" />}
                                    onClick={() => qrRef.current!.download('jpg', fileName)}
                                    variant='light'
                                >
                                    jpg
                                </Button>
                            </Tooltip>

                            <Tooltip label={"Download webp QR"}>
                                <Button
                                    size="xs"
                                    leftSection={<IconArrowBarToDown size="1.125rem" />}
                                    onClick={() => qrRef.current!.download('webp', fileName)}
                                    variant='light'
                                >
                                    webp
                                </Button>
                            </Tooltip>
                        </Group>



                    </Card>
                </Grid.Col>
            </Grid >

        </>
    )
}

export default QRMakingComp
