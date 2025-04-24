import { Helmet } from 'react-helmet-async';
import { ActionIcon, Card, Container, Grid, Group, Text, Tooltip } from '@mantine/core';
import QRMakingComp from '../../components/tools/QRmaker/QRMakingComp';
import { IconMinus, IconPlus, IconScan } from '@tabler/icons-react';
import { useState } from 'react';

function QRmaker() {

    const [qrMakerCount, setQrMakerCount] = useState<number>(1);

    return (
        <>
            <Helmet>
                <title>QR maker | Local Tools</title>
            </Helmet>

            <Container size={"lg"}>
                <Text ta={"center"} fz={38} fw={300} mb={32} mt={12}>
                    <IconScan size={30} /> QR maker
                </Text>

                <Text ta={"center"} fz={22} fw={300} mt={-34} c='dimmed'>
                    Your website serverless QR maker
                </Text>

                <Group justify='flex-end' mb={12}>
                    <Tooltip label="Add QR Generator">
                        <ActionIcon
                            variant="light"
                            aria-label="Add"
                            onClick={() => setQrMakerCount(v => v + 1)}
                        >
                            <IconPlus style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Reduce QR Generator">
                        <ActionIcon
                            variant="light"
                            aria-label="Add"
                            disabled={qrMakerCount <= 1}
                            onClick={() => setQrMakerCount(v => v >= 2 ? v - 1 : v)}
                        >
                            <IconMinus style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                <Grid>
                    {new Array(qrMakerCount).fill(null).map((_, i) => (
                        <Grid.Col span={{ base: 12, md: 12, lg: qrMakerCount === 1 ? 12 : 6 }} key={i}>
                            <Card shadow="sm" padding="lg" radius="md" withBorder>
                                <QRMakingComp />
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>

            </Container>
        </>
    )
}

export default QRmaker
