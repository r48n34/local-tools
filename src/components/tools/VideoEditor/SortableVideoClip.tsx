import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Group,
    Image,
    RangeSlider,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    IconGripVertical,
    IconPlayerPlay,
    IconRotateClockwise,
    IconTrash,
    IconVolume,
    IconVolumeOff,
} from "@tabler/icons-react";
import type { VideoClip } from "../../../types/videoEditor";
import { nextVideoRotation } from "../../../utils/videoEditorUtils";

interface SortableVideoClipProps {
    clip: VideoClip;
    active: boolean;
    onChange: (clip: VideoClip) => void;
    onRemove: (id: string) => void;
    onPreview: (id: string) => void;
}

function formatSeconds(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
}

function SortableVideoClip({
    clip,
    active,
    onChange,
    onRemove,
    onPreview,
}: SortableVideoClipProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: clip.id,
    });

    return (
        <Card
            ref={setNodeRef}
            withBorder
            shadow={isDragging ? "lg" : "sm"}
            padding="sm"
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.65 : 1,
                borderColor: active ? "var(--mantine-color-blue-5)" : undefined,
            }}
        >
            <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                    <Tooltip label="Drag to reorder">
                        <ActionIcon
                            variant="subtle"
                            aria-label="Drag clip to reorder"
                            {...attributes}
                            {...listeners}
                        >
                            <IconGripVertical size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Badge variant="light">{formatSeconds(clip.trimEnd - clip.trimStart)}</Badge>
                </Group>

                {clip.thumbnailUrl && (
                    <Image
                        src={clip.thumbnailUrl}
                        alt={`Preview of ${clip.name}`}
                        h={130}
                        fit="contain"
                        bg="black"
                        radius="sm"
                        style={{
                            transform: `rotate(${clip.rotation}deg) scale(${clip.rotation % 180 === 0 ? 1 : 0.72})`,
                        }}
                    />
                )}

                <Text size="sm" fw={500} truncate="end">
                    {clip.name}
                </Text>
                <Text size="xs" c="dimmed">
                    {clip.width}×{clip.height} · {formatSeconds(clip.duration)}
                </Text>

                <RangeSlider
                    label={(value) => formatSeconds(value)}
                    min={0}
                    max={clip.duration}
                    minRange={Math.min(0.1, clip.duration)}
                    step={0.1}
                    value={[clip.trimStart, clip.trimEnd]}
                    onChange={([trimStart, trimEnd]) => onChange({ ...clip, trimStart, trimEnd })}
                    thumbFromLabel="Trim start"
                    thumbToLabel="Trim end"
                />
                <Text size="xs" c="dimmed" ta="center">
                    {formatSeconds(clip.trimStart)} – {formatSeconds(clip.trimEnd)}
                </Text>

                <Group justify="space-between" gap="xs">
                    <Button
                        size="compact-sm"
                        variant={active ? "filled" : "light"}
                        leftSection={<IconPlayerPlay size={16} />}
                        onClick={() => onPreview(clip.id)}
                    >
                        Preview
                    </Button>
                    <Group gap={4}>
                        <Tooltip label="Rotate clockwise">
                            <ActionIcon
                                variant="light"
                                aria-label="Rotate clip clockwise"
                                onClick={() =>
                                    onChange({
                                        ...clip,
                                        rotation: nextVideoRotation(clip.rotation),
                                    })
                                }
                            >
                                <IconRotateClockwise size={17} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={clip.muted ? "Restore clip audio" : "Mute clip"}>
                            <ActionIcon
                                variant="light"
                                aria-label={clip.muted ? "Restore clip audio" : "Mute clip"}
                                onClick={() => onChange({ ...clip, muted: !clip.muted })}
                            >
                                {clip.muted ? (
                                    <IconVolumeOff size={17} />
                                ) : (
                                    <IconVolume size={17} />
                                )}
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Remove clip">
                            <ActionIcon
                                variant="light"
                                color="red"
                                aria-label="Remove clip"
                                onClick={() => onRemove(clip.id)}
                            >
                                <IconTrash size={17} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
            </Stack>
        </Card>
    );
}

export default SortableVideoClip;
