import { Helmet } from 'react-helmet-async';
import { Container, Text } from '@mantine/core';
import { IconPictureInPictureFilled } from '@tabler/icons-react';
import ScanDocsComp from '../../components/tools/ScanDocs/ScanDocsComp';

function ScanDocs(){
    return (
        <>
            <Helmet>
                <title>Document Extractor | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconPictureInPictureFilled size={30}/> Document Extractor
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                    Your website serverless Document Extractor
                </Text>

                <ScanDocsComp />                
            </Container>
        </>
    )
}
    
export default ScanDocs
