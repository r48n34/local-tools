import { Container, Title, Text, Grid, Card } from "@mantine/core";
import { categoryList } from "../data/routeData";
import { useNavigate } from "react-router-dom";

function HomePage() {

    const navigate = useNavigate()

    return (
        <Container size={"lg"}>
            <Title order={1} fw={300} fz={52} ta="center">
                Tools Box
            </Title>

            <Text mb={48} fw={300} fz={18} mt={-2} c="dimmed" ta="center">
                Collections of web base tools, no server uploading.
            </Text>

            <Grid>
                {categoryList.map(v =>
                    <Grid.Col span={4}>
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
