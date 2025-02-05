import { Box, Group, Loader, Text } from "@mantine/core"

function CenterLoading() {
    return (
        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Box>
                <Group justify="center">
                    <Loader color="indigo" type="dots" />
                </Group>

                <Text ta="center" mt={8} c="dimmed" fz={16} fw={400}>
                    Loading data...
                </Text>

            </Box>
        </Box>
    )
}

export default CenterLoading
