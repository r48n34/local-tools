import { Outlet } from "react-router-dom";

import { Group } from "@mantine/core"
import ToggleThemeBtn from "./ToggleThemeBtn"

function Layout() {

    return (
        <>
            <Group justify="flex-end" mt={16} mr={16}>
                <ToggleThemeBtn/>
            </Group>

            <div>
                <Outlet />
            </div>
        </>
    )
}

export default Layout