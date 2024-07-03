import { Box, Text, Container } from '@mantine/core';
import { useMemo, useState } from 'react';

import { FileWithPath } from '@mantine/dropzone';
import DropZoneComp from '../components/ImageConvert/DropZoneComp';
import DisplayCarouselPdfToImg from '../components/PdfConvertImage/DisplayCarouselPdfToImg';

function PdfConvertImage() {

    // Input files
    const [files, setFiles] = useState<FileWithPath[]>([]);

    // Prevent flashing display rerender
    const DisplayCarouselMemo = useMemo(() =>
        <DisplayCarouselPdfToImg fileList={files} />,
        [files]
    );

    return (
        <Container size={"lg"}>
            <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                PDF to images
            </Text>

            <Text ta={"center"} fz={16} fw={300} mt={-34} c='dimmed'>
                Convert PDF file to images in local run time, no server upload require
            </Text>

            <Box mx="auto" mt={32}>
                <Box pos="relative">
                    <DropZoneComp setFilesCb={setFiles} acceptedTypesList={["application/pdf"]} />

                    {files.length >= 1 && (
                        <Box mt={24}>
                            {DisplayCarouselMemo}

                            <Text ta="right" mt={24} fz={18} fw={500} c="dimmed">
                                Uploaded total: {files.length} files
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>

        </Container>
    );
}

export default PdfConvertImage