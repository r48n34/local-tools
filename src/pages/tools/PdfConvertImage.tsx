import { Helmet } from 'react-helmet-async';
import { Box, Text, Container } from '@mantine/core';
import { useMemo, useState } from 'react';

import { FileWithPath } from '@mantine/dropzone';
import DropZoneComp from '../../components/tools/ImageConvert/DropZoneComp';
import DisplayCarouselPdfToImg from '../../components/tools/PdfConvertImage/DisplayCarouselPdfToImg';
import { IconFileAnalytics } from '@tabler/icons-react';

function PdfConvertImage() {

    // Input files
    const [files, setFiles] = useState<FileWithPath[]>([]);

    // Prevent flashing display rerender
    const DisplayCarouselMemo = useMemo(() =>
        <DisplayCarouselPdfToImg
            fileList={files}
            deleteCb={(ind) => setFiles((files) => files.filter((_, i) => i !== ind))}
        />,
        [files]
    );

    return (
        <>
            <Helmet>
                <title>Pdf Convert Image | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconFileAnalytics size={30} /> PDF to images
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                    Convert PDF file to images in local run time, no server upload require
                </Text>

                <Box mx="auto" mt={32}>
                    <Box pos="relative">

                        <DropZoneComp
                            setFilesCb={(files) => setFiles(currentFiles => [...currentFiles, ...files])}
                            acceptedTypesList={["application/pdf"]}
                        />

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
        </>
    );
}

export default PdfConvertImage