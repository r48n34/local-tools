import { CopyButton, ActionIcon, Tooltip, rem } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';

type CopyBtnProps = {
    value: string | number | null;
    showFullText?: boolean;
    width?: string | number;
    [x:string]: any;
}

function CopyBtn({ value, showFullText = false, width = rem(16), ...props }: CopyBtnProps) {

    return (
        <CopyButton value={value ? value + "" : ""} timeout={2500}>
            {({ copied, copy }) => (
                <Tooltip
                    label={
                        copied
                            ? 'Copied'
                            : showFullText
                                ? `Copy ${value}`
                                : `Copy value`
                    }
                    withArrow
                    position="right"
                >
                    <ActionIcon  variant="subtle" onClick={copy} {...props}>
                        {copied ? (
                            <IconCheck style={{ width: width }} />
                        ) : (
                            <IconCopy style={{ width: width }} />
                        )}
                    </ActionIcon>
                </Tooltip>
            )}
        </CopyButton>
    )
}

export default CopyBtn
