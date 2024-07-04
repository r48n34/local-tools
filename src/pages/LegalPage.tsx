import { Container, Title, Text } from "@mantine/core"
import LegalCardList from "../components/legal/LegalCardList"

function LegalPage() {
    return (
        <>
            <Container size={"xl"}>
                <Title order={1} fw={300} fz={52} ta="center">
                    Privacy & Data Security policies
                </Title>

                <Text mb={48} fw={300} fz={22}  c="dimmed" ta="center">
                    This website aims to create no server uploading, privacy, efficiency, free, open sources.
                </Text>

                <LegalCardList />
            </Container>
        </>
    )
}

export default LegalPage
