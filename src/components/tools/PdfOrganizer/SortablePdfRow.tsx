import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Box, Checkbox, Group, Image, Table, Text, Tooltip } from "@mantine/core";
import { IconGripVertical, IconRotateClockwise, IconTrash } from "@tabler/icons-react";
import type { PdfPageItem } from "../../../types/pdfOrganizer";

interface SortablePdfRowProps {
    page: PdfPageItem;
    position: number;
    onSelect: (id: string, selected: boolean) => void;
    onRotate: (id: string) => void;
    onRemove: (id: string) => void;
}

function SortablePdfRow({ page, position, onSelect, onRotate, onRemove }: SortablePdfRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: page.id,
    });

    return (
        <Table.Tr
            ref={setNodeRef}
            bg={page.selected ? "var(--mantine-color-blue-light)" : undefined}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.6 : 1,
                position: "relative",
                zIndex: isDragging ? 2 : "auto",
            }}
        >
            <Table.Td w={76}>
                <Group gap={4} wrap="nowrap">
                    <Checkbox
                        size="xs"
                        checked={page.selected}
                        onChange={(event) => onSelect(page.id, event.currentTarget.checked)}
                        aria-label={`Select ${page.sourceName} page ${page.sourcePageIndex + 1}`}
                    />
                    <Tooltip label="Drag to reorder">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            aria-label="Drag page to reorder"
                            {...attributes}
                            {...listeners}
                        >
                            <IconGripVertical size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Table.Td>
            <Table.Td w={54}>
                <Text size="sm" c="dimmed" ta="center">
                    {position}
                </Text>
            </Table.Td>
            <Table.Td w={76}>
                <Box
                    w={52}
                    h={62}
                    style={{ overflow: "hidden", display: "grid", placeItems: "center" }}
                >
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
            </Table.Td>
            <Table.Td miw={180}>
                <Text size="sm" fw={500} truncate="end" maw={320}>
                    {page.sourceName}
                </Text>
            </Table.Td>
            <Table.Td w={110}>
                <Text size="sm">Page {page.sourcePageIndex + 1}</Text>
            </Table.Td>
            <Table.Td w={90}>
                <Text size="sm" c="dimmed">
                    {page.rotation}°
                </Text>
            </Table.Td>
            <Table.Td w={96}>
                <Group gap={4} wrap="nowrap" justify="flex-end">
                    <Tooltip label="Rotate clockwise">
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            aria-label="Rotate page clockwise"
                            onClick={() => onRotate(page.id)}
                        >
                            <IconRotateClockwise size={16} />
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
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    );
}

export default SortablePdfRow;
