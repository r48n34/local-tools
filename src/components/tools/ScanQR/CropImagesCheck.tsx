import { Card, Grid, Group, Text } from '@mantine/core';
import { useState } from 'react';
import Cropper from 'react-easy-crop'
import getCroppedImg, { CroppedObj } from '../../../utils/cropImage';
import QRcodeData from './QRcodeData';
import DownloadImagesBtn from './DownloadImagesBtn';

type CropImagesCheckProps = {
    src: string;
}

function CropImagesCheck({ src }: CropImagesCheckProps) {
    const [crop, setCrop] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedObj | null>(null)

    const [croppedImage, setCroppedImage] = useState<string>("")

    const onCropComplete = (_: CroppedObj, croppedAreaPixels: CroppedObj) => {
        setCroppedAreaPixels(croppedAreaPixels);
        showCroppedImage()
    }

    const showCroppedImage = async () => {
        try {
            const croppedImage = await getCroppedImg(
                src,
                croppedAreaPixels!,
                0
            );

            setCroppedImage(croppedImage)
        }
        catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <Text w={500} fw={500} mb={8} fz={14}>
                Crop image
            </Text>

            <Grid mb={12}>
                <Grid.Col span={{ base: 12, md: 8, lg: 8 }}>
                    <Card shadow="sm" padding="md" radius="md" withBorder h={300}>
                        <Cropper
                            image={src}
                            crop={crop}
                            zoom={zoom}
                            zoomSpeed={0.2}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            restrictPosition={false}
                            aspect={1}
                        />
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4, lg: 4 }} >
                    <Card shadow="sm" padding="md" radius="md" withBorder >
                        <Group justify='center' ml={12} mr={12}>
                            <img src={croppedImage} width={300} height={300} />
                        </Group>

                        <Group justify='flex-end' mt={14} mr={8} >
                            <DownloadImagesBtn imgSrc={croppedImage} fileName={''} />
                        </Group>
                    </Card>
                </Grid.Col>

            </Grid>

            <QRcodeData src={croppedImage} title={"Cropped images QR found"} /> 
        </>
    )
}

export default CropImagesCheck
