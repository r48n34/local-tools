import { Progress } from "@mantine/core";

type ProgressBarProps = {
    progressNumber: number;
}

function ProgressBar({ progressNumber }: ProgressBarProps) {
    return (
        <>
            <Progress.Root size="xl" mb={12} >
                <Progress.Section value={progressNumber} animated>
                    <Progress.Label>
                        {progressNumber} %
                    </Progress.Label>
                </Progress.Section>
            </Progress.Root>
        </>
    )
}

export default ProgressBar
