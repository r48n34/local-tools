import { ActionIcon, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";

function GoUrlBtn({ title, url, icon }: { title: string; url: string; icon: ReactNode }) {
    return (
        <Tooltip label={title}>
            <ActionIcon variant="light" onClick={() => !!window && window.open(url, "_blank")}>
                {icon}
            </ActionIcon>
        </Tooltip>
    );
}

export default GoUrlBtn;
