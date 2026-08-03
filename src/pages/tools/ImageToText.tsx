import { Container, Text } from "@mantine/core";
import { IconTextScan2 } from "@tabler/icons-react";
import { Helmet } from "react-helmet-async";
import ImageToTextComp from "../../components/tools/ImageToText/ImageToTextComp";

function ImageToText() {
    return (
        <>
            <Helmet>
                <title>OCR: Image to Text | Local Tools</title>
            </Helmet>

            <Container size="lg">
                <Text ta="center" fz={38} fw={300} mb={32} mt={12}>
                    <IconTextScan2 size={30} /> OCR: Image to Text
                </Text>

                <Text ta="center" fz={22} fw={300} mt={-34} c="dimmed">
                    Extract text from images locally — your files never leave this device
                </Text>

                <ImageToTextComp />
            </Container>
        </>
    );
}

export default ImageToText;
