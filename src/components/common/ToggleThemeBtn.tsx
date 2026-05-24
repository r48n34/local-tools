import { Switch, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconSunHigh, IconMoonFilled } from "@tabler/icons-react";

function ToggleThemeBtn() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === "dark";

    return (
        <Tooltip label={"Toggle color scheme"}>
            <Switch
                checked={dark}
                color="dark"
                onChange={() => toggleColorScheme()}
                onLabel={<IconMoonFilled size={14} stroke={2.5} />}
                offLabel={<IconSunHigh size={14} stroke={2.5} />}
                aria-label="Toggle color scheme"
            />
        </Tooltip>
    );
}

export default ToggleThemeBtn;
