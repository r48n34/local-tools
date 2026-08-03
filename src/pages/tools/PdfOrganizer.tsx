import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    ActionIcon,
    Badge,
    Box,
    Container,
    Group,
    LoadingOverlay,
    Paper,
    SegmentedControl,
    SimpleGrid,
    Table,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
    IconAlertCircle,
    IconChecks,
    IconDownload,
    IconFileExport,
    IconFileTypePdf,
    IconFileZip,
    IconFiles,
    IconGripVertical,
    IconLayoutGrid,
    IconRefresh,
    IconSquare,
    IconTable,
    IconTrash,
    IconUpload,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import SortablePdfPage from "../../components/tools/PdfOrganizer/SortablePdfPage";
import SortablePdfRow from "../../components/tools/PdfOrganizer/SortablePdfRow";
import type { PdfPageItem, PdfSource } from "../../types/pdfOrganizer";
import { downloadBlob } from "../../utils/downloadFile";
import { assemblePdf, createSeparatePagesZip } from "../../utils/pdfOrganizerUtils";
import { loadPdfFile } from "../../utils/pdfPageLoader";

function PdfOrganizer() {
    const [sources, setSources] = useState<PdfSource[]>([]);
    const [pages, setPages] = useState<PdfPageItem[]>([]);
    const [busy, setBusy] = useState(false);
    const [view, setView] = useState<"cards" | "table">("cards");
    const pagesRef = useRef(pages);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        pagesRef.current = pages;
    }, [pages]);

    useEffect(
        () => () => {
            pagesRef.current.forEach((page) => URL.revokeObjectURL(page.thumbnailUrl));
        },
        [],
    );

    async function addFiles(files: File[]) {
        setBusy(true);
        let loadedCount = 0;
        try {
            for (const file of files) {
                try {
                    const loaded = await loadPdfFile(file);
                    setSources((current) => [...current, loaded.source]);
                    setPages((current) => [...current, ...loaded.pages]);
                    loadedCount += 1;
                } catch {
                    toast.error(`${file.name} is encrypted, empty, or invalid.`);
                }
            }

            if (loadedCount > 0) {
                toast.success(`Added ${loadedCount} PDF${loadedCount === 1 ? "" : "s"}.`);
            }
        } finally {
            setBusy(false);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        setPages((current) => {
            const oldIndex = current.findIndex((page) => page.id === active.id);
            const newIndex = current.findIndex((page) => page.id === over.id);
            return arrayMove(current, oldIndex, newIndex);
        });
    }

    function selectPage(id: string, selected: boolean) {
        setPages((current) =>
            current.map((page) => (page.id === id ? { ...page, selected } : page)),
        );
    }

    function selectAll(selected: boolean) {
        setPages((current) => current.map((page) => ({ ...page, selected })));
    }

    function rotatePage(id: string) {
        setPages((current) =>
            current.map((page) =>
                page.id === id
                    ? {
                          ...page,
                          rotation: ((page.rotation + 90) % 360) as PdfPageItem["rotation"],
                      }
                    : page,
            ),
        );
    }

    function removePages(predicate: (page: PdfPageItem) => boolean) {
        const removedPages = pages.filter(predicate);
        const remainingPages = pages.filter((page) => !predicate(page));
        removedPages.forEach((page) => URL.revokeObjectURL(page.thumbnailUrl));
        const remainingSourceIds = new Set(remainingPages.map((page) => page.sourceId));

        setPages(remainingPages);
        setSources((current) => current.filter((source) => remainingSourceIds.has(source.id)));
    }

    function reset() {
        pagesRef.current.forEach((page) => URL.revokeObjectURL(page.thumbnailUrl));
        setPages([]);
        setSources([]);
    }

    async function exportPages(exportPages: PdfPageItem[], fileName: string) {
        if (exportPages.length === 0) {
            toast.error("Select at least one page first.");
            return;
        }

        setBusy(true);
        try {
            const bytes = await assemblePdf(sources, exportPages);
            downloadBlob(
                new Blob([new Uint8Array(bytes).buffer], { type: "application/pdf" }),
                fileName,
            );
            toast.success("Your PDF is ready.");
        } catch {
            toast.error("The PDF could not be created.");
        } finally {
            setBusy(false);
        }
    }

    async function exportSeparatePages() {
        const selectedPages = pages.filter((page) => page.selected);
        if (selectedPages.length === 0) {
            toast.error("Select at least one page first.");
            return;
        }

        setBusy(true);
        try {
            downloadBlob(await createSeparatePagesZip(sources, selectedPages), "pdf-pages.zip");
            toast.success("Your separate PDF pages are ready.");
        } catch {
            toast.error("The selected pages could not be exported.");
        } finally {
            setBusy(false);
        }
    }

    const selectedCount = pages.filter((page) => page.selected).length;

    return (
        <>
            <Helmet>
                <title>PDF Organizer | Local Tools</title>
            </Helmet>
            <Container size="xl">
                <Title order={1} ta="center" fw={300} fz={34} mt={8}>
                    <IconFiles size={30} /> PDF Organizer
                </Title>
                <Text ta="center" fz="md" c="dimmed" mb="lg">
                    Merge, split, rotate, and reorder PDF pages without uploading them.
                </Text>

                <Box pos="relative">
                    <LoadingOverlay visible={busy} zIndex={10} overlayProps={{ blur: 2 }} />
                    <Dropzone
                        accept={["application/pdf"]}
                        onDrop={addFiles}
                        onReject={() => toast.error("Please choose valid PDF files.")}
                        disabled={busy}
                        maxSize={500 * 1024 ** 2}
                        p="sm"
                    >
                        <Group justify="center" gap="sm" mih={92} style={{ pointerEvents: "none" }}>
                            <Dropzone.Accept>
                                <IconUpload size={32} color="var(--mantine-color-blue-6)" />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconAlertCircle size={32} color="var(--mantine-color-red-6)" />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconFileTypePdf size={32} color="var(--mantine-color-dimmed)" />
                            </Dropzone.Idle>
                            <Box>
                                <Text size="md" fw={500}>
                                    Drop PDFs or click to add
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Add multiple files · processed only on this device
                                </Text>
                            </Box>
                        </Group>
                    </Dropzone>

                    {pages.length > 0 && (
                        <>
                            <Paper withBorder p="xs" my="md" radius="md">
                                <Group justify="space-between" gap="xs">
                                    <Group gap={5}>
                                        <Tooltip label="Select all pages">
                                            <ActionIcon
                                                variant="light"
                                                aria-label="Select all pages"
                                                onClick={() => selectAll(true)}
                                            >
                                                <IconChecks size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Clear selection">
                                            <ActionIcon
                                                variant="subtle"
                                                aria-label="Clear page selection"
                                                disabled={selectedCount === 0}
                                                onClick={() => selectAll(false)}
                                            >
                                                <IconSquare size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Delete selected pages">
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                aria-label="Delete selected pages"
                                                disabled={selectedCount === 0}
                                                onClick={() => removePages((page) => page.selected)}
                                            >
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Reset organizer">
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                aria-label="Reset organizer"
                                                onClick={reset}
                                            >
                                                <IconRefresh size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Badge size="sm" variant="light">
                                            {pages.length} pages
                                        </Badge>
                                        {selectedCount > 0 && (
                                            <Badge size="sm" variant="dot">
                                                {selectedCount} selected
                                            </Badge>
                                        )}
                                    </Group>

                                    <Group gap={5}>
                                        <SegmentedControl<"cards" | "table">
                                            size="xs"
                                            value={view}
                                            onChange={setView}
                                            data={[
                                                {
                                                    value: "cards",
                                                    label: (
                                                        <Group gap={4} wrap="nowrap">
                                                            <IconLayoutGrid size={15} />
                                                            <Text size="xs">Cards</Text>
                                                        </Group>
                                                    ),
                                                },
                                                {
                                                    value: "table",
                                                    label: (
                                                        <Group gap={4} wrap="nowrap">
                                                            <IconTable size={15} />
                                                            <Text size="xs">Table</Text>
                                                        </Group>
                                                    ),
                                                },
                                            ]}
                                        />
                                        <Tooltip label="Selected pages as one PDF">
                                            <ActionIcon
                                                variant="light"
                                                aria-label="Download selected pages as one PDF"
                                                disabled={selectedCount === 0}
                                                onClick={() =>
                                                    exportPages(
                                                        pages.filter((page) => page.selected),
                                                        "selected-pages.pdf",
                                                    )
                                                }
                                            >
                                                <IconFileExport size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Selected pages as ZIP">
                                            <ActionIcon
                                                variant="light"
                                                aria-label="Download selected pages as ZIP"
                                                disabled={selectedCount === 0}
                                                onClick={exportSeparatePages}
                                            >
                                                <IconFileZip size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Download organized PDF">
                                            <ActionIcon
                                                size="lg"
                                                aria-label="Download organized PDF"
                                                onClick={() => exportPages(pages, "organized.pdf")}
                                            >
                                                <IconDownload size={20} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Group>
                                <Group gap={4} mt={6} c="dimmed">
                                    <IconGripVertical size={14} />
                                    <Text size="xs">
                                        Drag pages to reorder; exports follow the displayed order.
                                    </Text>
                                </Group>
                            </Paper>

                            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={pages.map((page) => page.id)}
                                    strategy={
                                        view === "cards"
                                            ? rectSortingStrategy
                                            : verticalListSortingStrategy
                                    }
                                >
                                    {view === "cards" ? (
                                        <SimpleGrid
                                            cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }}
                                            spacing="xs"
                                        >
                                            {pages.map((page) => (
                                                <SortablePdfPage
                                                    key={page.id}
                                                    page={page}
                                                    onSelect={selectPage}
                                                    onRotate={rotatePage}
                                                    onRemove={(id) =>
                                                        removePages((item) => item.id === id)
                                                    }
                                                />
                                            ))}
                                        </SimpleGrid>
                                    ) : (
                                        <Table.ScrollContainer minWidth={720}>
                                            <Table
                                                verticalSpacing="xs"
                                                horizontalSpacing="sm"
                                                highlightOnHover
                                                withTableBorder
                                            >
                                                <Table.Thead>
                                                    <Table.Tr>
                                                        <Table.Th>Move</Table.Th>
                                                        <Table.Th ta="center">Order</Table.Th>
                                                        <Table.Th>Preview</Table.Th>
                                                        <Table.Th>File</Table.Th>
                                                        <Table.Th>Source</Table.Th>
                                                        <Table.Th>Rotation</Table.Th>
                                                        <Table.Th ta="right">Actions</Table.Th>
                                                    </Table.Tr>
                                                </Table.Thead>
                                                <Table.Tbody>
                                                    {pages.map((page, index) => (
                                                        <SortablePdfRow
                                                            key={page.id}
                                                            page={page}
                                                            position={index + 1}
                                                            onSelect={selectPage}
                                                            onRotate={rotatePage}
                                                            onRemove={(id) =>
                                                                removePages(
                                                                    (item) => item.id === id,
                                                                )
                                                            }
                                                        />
                                                    ))}
                                                </Table.Tbody>
                                            </Table>
                                        </Table.ScrollContainer>
                                    )}
                                </SortableContext>
                            </DndContext>
                        </>
                    )}
                </Box>
            </Container>
        </>
    );
}

export default PdfOrganizer;
