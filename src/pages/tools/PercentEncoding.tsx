import { Container, Text } from "@mantine/core";
import { IconImageInPicture } from "@tabler/icons-react";
import { Helmet } from "react-helmet-async";
import PercentEncodingComp from "../../components/tools/PercentEncoding/PercentEncodingComp";

function PercentEncoding() {
    return (
        <>
            <Helmet>
                <title>SQL Percent Encoding | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconImageInPicture size={30} /> SQL Percent Encoding
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                    Convert SQL Percent Encoding password / string
                </Text>

                <PercentEncodingComp />
            </Container>
        </>
    )
}

export default PercentEncoding
