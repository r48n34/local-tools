import { Container, Text } from '@mantine/core';
import QRMakingComp from '../../components/tools/QRmaker/QRMakingComp';

function QRmaker() {

    return (
        <Container size={"lg"}>
            <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                QR maker
            </Text>

            <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                Your website serverless QR maker 
            </Text>

            <QRMakingComp />
        </Container>
    )
}

export default QRmaker
