import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ActionIcon, Box, Card, Checkbox, Group, Image, Text, Tooltip } from "@mantine/core";
import { IconGripVertical, IconRotateClockwise, IconTrash } from "@tabler/icons-react";
import type { PdfPageItem } from "../../../types/pdfOrganizer";

interface SortablePdfPageProps {
    page: PdfPageItem;
    onSelect: (id: string, selected: boolean) => void;
    onRotate: (id: string) => void;
    onRemove: (id: string) => void;
}

function SortablePdfPage({ page, onSelect, onRotate, onRemove }: SortablePdfPageProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: page.id,
    });

    return (
        <Card
            ref={setNodeRef}
            withBorder
            shadow={isDragging ? "lg" : "sm"}
            padding="xs"
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.65 : 1,
                zIndex: isDragging ? 2 : "auto",
            }}
        >
            <Group justify="space-between" wrap="nowrap" mb={4}>
                <Checkbox
                    size="xs"
                    checked={page.selected}
                    onChange={(event) => onSelect(page.id, event.currentTarget.checked)}
                    aria-label={`Select ${page.sourceName} page ${page.sourcePageIndex + 1}`}
                />
                <Group gap={4} wrap="nowrap">
                    <Tooltip label="Drag to reorder">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            aria-label="Drag page to reorder"
                            {...attributes}
                            {...listeners}
                        >
                            <IconGripVertical size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Rotate clockwise">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            aria-label="Rotate page clockwise"
                            onClick={() => onRotate(page.id)}
                        >
                            <IconRotateClockwise size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remove page">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            aria-label="Remove page"
                            onClick={() => onRemove(page.id)}
                        >
                            <IconTrash size={18} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <Box h={150} style={{ overflow: "hidden", display: "grid", placeItems: "center" }}>
                <Image
                    src={page.thumbnailUrl}
                    alt={`${page.sourceName} page ${page.sourcePageIndex + 1}`}
                    h="100%"
                    fit="contain"
                    style={{
                        transform: `rotate(${page.rotation}deg) scale(${page.rotation % 180 === 0 ? 1 : 0.72})`,
                    }}
                />
            </Box>

            <Text size="xs" fw={500} truncate="end" mt={6}>
                {page.sourceName}
            </Text>
            <Text size="xs" c="dimmed" lh={1.25}>
                Page {page.sourcePageIndex + 1} · {page.rotation}°
            </Text>
        </Card>
    );
}

export default SortablePdfPage;
