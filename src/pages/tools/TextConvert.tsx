import { Text, Container } from "@mantine/core";
import { IconTextWrap } from "@tabler/icons-react";
import { Helmet } from "react-helmet-async";
import TextConvertComp from "../../components/tools/TextConvert/TextConvertComp";

function TextConvert() {
    return (
        <>
            <Helmet>
                <title>Text Convert | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconTextWrap size={30}/> Text Convert
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                    Your website serverless Text Converter
                </Text>

                <TextConvertComp />                
            </Container>
        </>
    )
}

export default TextConvert
