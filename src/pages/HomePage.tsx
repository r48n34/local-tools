import { Container, Title, Text, Grid, Card } from "@mantine/core";
import { categoryList } from "../data/routeData";
import { useNavigate } from "react-router-dom";
import { IconTools } from "@tabler/icons-react";

function HomePage() {

    const navigate = useNavigate()

    return (
        <Container size={"lg"}>
            <Title order={1} fw={300} fz={52} ta="center">
                <IconTools size={42} /> Tools Box
            </Title>

            <Text mb={48} fw={300} fz={22} mt={-2} c="dimmed" ta="center">
                Collections of web base tools, no server uploading, privacy, efficiency, free, open sources. 
            </Text>

            <Grid>
                {categoryList
                    .filter(v => v.displayAtHome)
                    .map(v =>
                    <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                        <Card 
                            component="a" href={v.link} 
                            onClick={(e) => {
                                e.preventDefault();    
                                navigate(v.link)
                            }}
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
    )
}

export default HomePage
