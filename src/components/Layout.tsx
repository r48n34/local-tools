import { Group } from "@mantine/core"
import ToggleThemeBtn from "./ToggleThemeBtn"

function Layout({ children }: any) {

    return (
        <>
            <Group justify="flex-end" mt={16} mr={16}>
                <ToggleThemeBtn/>
            </Group>

            <div>
                {children}
            </div>
        </>
    )
}

export default Layout