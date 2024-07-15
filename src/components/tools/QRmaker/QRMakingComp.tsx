import { Card, ColorInput, FileInput, Grid, Group, Textarea, Tooltip, Text, Select, Button } from '@mantine/core';
import { IconArrowBarToDown } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

function QRMakingComp() {

    const qrRef = useRef<QRCode>(null);

    const [imgFile, setImgFile] = useState<File>();
    const [qrContent, setQrContent] = useState<string>("https://www.youtube.com/");

    const [bgColor, setBgColor] = useState<string>("#FFFFFF");
    const [fgColor, setFgColor] = useState<string>("#000000");

    const [qrStyle, setQrStyle] = useState<"squares" | "dots" | "fluid" | undefined>("squares");

    return (
        <>
            <Grid mt={48}>
                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>

                    <Text ta="center" fz={20} c="dimmed">
                        Required field
                    </Text>
                    <Textarea
                        label="Qr content"
                        description="Input your qr content"
                        placeholder="Input placeholder"

                        value={qrContent}
                        onChange={(event) => setQrContent(event.currentTarget.value)}
                    />

                    <Text ta="center" mt={16} fz={20} c="dimmed">
                        Optional
                    </Text>

                    <FileInput
                        mt={16}
                        clearable
                        accept="image/png,image/jpeg"
                        label="Upload files"
                        placeholder="Upload files"
                        description="Input your image for QR"
                        value={imgFile}
                        onChange={setImgFile as any}
                    />

                    <ColorInput
                        mt={16}
                        label="Bg Color"
                        description="Set QR code bg Color"
                        value={bgColor} onChange={setBgColor}
                    />

                    <ColorInput
                        mt={16}
                        label="Fg Color"
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
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>

                        <Group justify='center'>
                            <QRCode
                                size={350}
                                logoWidth={350 * 0.2}
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
                                    onClick={() => qrRef.current!.download('png')}
                                    variant='light'
                                >
                                    png
                                </Button>
                            </Tooltip>

                            <Tooltip label={"Download jpg QR"}>
                                <Button
                                    size="xs"
                                    leftSection={<IconArrowBarToDown size="1.125rem" />}
                                    onClick={() => qrRef.current!.download('jpg')}
                                    variant='light'
                                >
                                    jpg
                                </Button>
                            </Tooltip>

                            <Tooltip label={"Download webp QR"}>
                                <Button
                                    size="xs"
                                    leftSection={<IconArrowBarToDown size="1.125rem" />}
                                    onClick={() => qrRef.current!.download('webp')}
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
