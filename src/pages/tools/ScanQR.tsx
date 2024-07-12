import { Container, FileInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconQrcode, IconUpload } from '@tabler/icons-react';

import QRcodeData from '../../components/tools/ScanQR/QRcodeData';
import CropImagesCheck from '../../components/tools/ScanQR/CropImagesCheck';
import { Helmet } from 'react-helmet-async';

interface FormObject {
    file: File | null
}

function ScanQR() {
    const form = useForm<FormObject>({
        initialValues: {
            file: null,
        },
        validate: {
            file: (value) => (
                !value
                    ? 'Missing png file'
                    : value.size / 1024 / 1024 >= 100 // in MiB 
                        ? 'png file too big'
                        : null
            ),
        },
    });

    return (
        <>
            <Helmet>
                <title>Scan QR | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconQrcode size={30} /> QR scan
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                    Your website serverless QR scan
                </Text>

                <form onSubmit={form.onSubmit((values) => console.log(values))}>

                    <FileInput
                        placeholder="hello.png"
                        label="QR image"
                        withAsterisk
                        accept="image/png, image/jpg, image/jpeg"
                        leftSection={<IconUpload size={12} />}
                        {...form.getInputProps('file')}
                        mb={16}
                    />

                    {form.values.file
                        ? (<>
                            <QRcodeData title={"Original images QR found"} src={URL.createObjectURL(form.values.file)} />
                            <CropImagesCheck src={URL.createObjectURL(form.values.file)} />
                        </>)
                        : <></>
                    }

                </form>
            </Container>
        </>
    )
}

export default ScanQR
