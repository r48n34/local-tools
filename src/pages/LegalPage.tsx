import { Container, Title, Text, Card, Grid } from "@mantine/core"
import { IconFreeRights, IconShield, IconUpload } from "@tabler/icons-react"

const legalItems = [
    {
        labels: "Open sources, Free",
        desc: "We will not charge and recive any usage free from this tools.",
        icon: <IconFreeRights size={60}/>,
    },
    {
        labels: "No server uplaoding",
        desc: "All the tools in this website are local devices base, which all the data and media are process in your local devices.",
        icon: <IconUpload size={60}/>,
    },
    {
        labels: "Security",
        desc: "Due to no server upload base, it is safe and security! Yeah!",
        icon: <IconShield size={60}/>,
    },
]

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

                <Grid>
                {legalItems
                    .map(v =>
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Card 
                            shadow="sm" padding="lg" radius="md" withBorder
                        >
                            {v.icon}

                            <Text fz={26} mt={6}>
                                {v.labels}
                            </Text>

                            <Text fz={16} c="dimmed">
                                {v.desc}
                            </Text>

                        </Card>
                    </Grid.Col>
                )}
            </Grid>


            </Container>
        </>
    )
}

export default LegalPage
