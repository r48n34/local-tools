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
} from "@dnd-kit/sortable";
import {
    Alert,
    Box,
    Button,
    Container,
    Group,
    LoadingOverlay,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import {
    IconAlertTriangle,
    IconMovie,
    IconPlayerPlay,
    IconPlayerStop,
    IconTrash,
    IconUpload,
    IconVideo,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import SortableVideoClip from "../../components/tools/VideoEditor/SortableVideoClip";
import type { VideoClip, VideoExportPhase, VideoExportSettings } from "../../types/videoEditor";
import { downloadBlob } from "../../utils/downloadFile";
import { createVideoClip, disposeVideoClip } from "../../utils/videoEditorUtils";
import { exportVideo } from "../../utils/videoExporter";

const MAX_VIDEO_SIZE = 2 * 1024 ** 3 - 1;
const LARGE_TIMELINE_SIZE = 500 * 1024 ** 2;
const OUTPUT_PRESETS: VideoExportSettings[] = [
    { width: 1280, height: 720, label: "720p landscape" },
    { width: 1920, height: 1080, label: "1080p landscape" },
    { width: 720, height: 1280, label: "720p portrait" },
    { width: 1080, height: 1920, label: "1080p portrait" },
];

function presetValue(preset: VideoExportSettings) {
    return `${preset.width}x${preset.height}`;
}

function VideoEditor() {
    const [clips, setClips] = useState<VideoClip[]>([]);
    const [activeClipId, setActiveClipId] = useState<string | null>(null);
    const [previewingTimeline, setPreviewingTimeline] = useState(false);
    const [importing, setImporting] = useState(false);
    const [exportPhase, setExportPhase] = useState<VideoExportPhase | null>(null);
    const [outputPreset, setOutputPreset] = useState(OUTPUT_PRESETS[0]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const clipsRef = useRef(clips);
    const abortControllerRef = useRef<AbortController | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        clipsRef.current = clips;
    }, [clips]);

    useEffect(
        () => () => {
            abortControllerRef.current?.abort();
            clipsRef.current.forEach(disposeVideoClip);
        },
        [],
    );

    const activeClip = clips.find((clip) => clip.id === activeClipId) ?? clips[0];
    const activeIndex = activeClip ? clips.findIndex((clip) => clip.id === activeClip.id) : -1;
    const combinedSize = useMemo(
        () => clips.reduce((total, clip) => total + clip.file.size, 0),
        [clips],
    );

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !activeClip) {
            return;
        }

        const cueAndPlay = () => {
            video.currentTime = activeClip.trimStart;
            if (previewingTimeline) {
                void video.play();
            }
        };

        if (video.readyState >= 1) {
            cueAndPlay();
        } else {
            video.addEventListener("loadedmetadata", cueAndPlay, { once: true });
            return () => video.removeEventListener("loadedmetadata", cueAndPlay);
        }
    }, [activeClip, previewingTimeline]);

    async function addFiles(files: File[]) {
        setImporting(true);
        const added: VideoClip[] = [];
        try {
            for (const file of files) {
                if (file.size >= MAX_VIDEO_SIZE) {
                    toast.error(`${file.name} exceeds the browser's 2 GB limit.`);
                    continue;
                }

                try {
                    added.push(await createVideoClip(file));
                } catch {
                    toast.error(`${file.name} cannot be previewed by this browser.`);
                }
            }

            if (added.length > 0) {
                setClips((current) => [...current, ...added]);
                setActiveClipId((current) => current ?? added[0].id);
                if (clips.length === 0) {
                    const first = added[0];
                    setOutputPreset(
                        first.height > first.width ? OUTPUT_PRESETS[2] : OUTPUT_PRESETS[0],
                    );
                }
                toast.success(`Added ${added.length} video clip${added.length === 1 ? "" : "s"}.`);
            }
        } finally {
            setImporting(false);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }
        setClips((current) =>
            arrayMove(
                current,
                current.findIndex((clip) => clip.id === active.id),
                current.findIndex((clip) => clip.id === over.id),
            ),
        );
    }

    function removeClip(id: string) {
        setClips((current) => {
            const removed = current.find((clip) => clip.id === id);
            if (removed) {
                disposeVideoClip(removed);
            }
            const next = current.filter((clip) => clip.id !== id);
            if (activeClipId === id) {
                setActiveClipId(next[0]?.id ?? null);
                setPreviewingTimeline(false);
            }
            return next;
        });
    }

    function reset() {
        clipsRef.current.forEach(disposeVideoClip);
        setClips([]);
        setActiveClipId(null);
        setPreviewingTimeline(false);
    }

    function handlePreviewTimeUpdate() {
        const video = videoRef.current;
        if (!video || !activeClip || video.currentTime < activeClip.trimEnd - 0.03) {
            return;
        }

        if (previewingTimeline && activeIndex < clips.length - 1) {
            setActiveClipId(clips[activeIndex + 1].id);
        } else {
            video.pause();
            video.currentTime = activeClip.trimEnd;
            setPreviewingTimeline(false);
        }
    }

    async function handleExport() {
        if (clips.length === 0) {
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        setPreviewingTimeline(false);
        try {
            const blob = await exportVideo(clips, outputPreset, setExportPhase, controller.signal);
            downloadBlob(blob, "edited-video.mp4");
            toast.success("Your edited MP4 is ready.");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                toast("Video export cancelled.");
            } else {
                toast.error("The video could not be exported. Try shorter or smaller clips.");
            }
        } finally {
            abortControllerRef.current = null;
            setExportPhase(null);
        }
    }

    const phaseLabel =
        exportPhase === "loading"
            ? "Loading the local video engine…"
            : exportPhase === "preparing"
              ? "Preparing clips…"
              : "Encoding MP4…";

    return (
        <>
            <Helmet>
                <title>Video Editor | Local Tools</title>
            </Helmet>
            <Container size="xl">
                <Title order={1} ta="center" fw={300} mt={12}>
                    <IconMovie size={34} /> Video Editor
                </Title>
                <Text ta="center" fz="lg" c="dimmed" mb="xl">
                    Trim and combine clips locally with simple, private MP4 export.
                </Text>

                <Box pos="relative">
                    <LoadingOverlay
                        visible={importing}
                        zIndex={10}
                        overlayProps={{ blur: 2 }}
                        loaderProps={{ children: "Reading video metadata…" }}
                    />
                    <Dropzone
                        accept={["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]}
                        onDrop={addFiles}
                        onReject={() => toast.error("Choose MP4, WebM, MOV, or M4V video files.")}
                        maxSize={MAX_VIDEO_SIZE}
                        disabled={importing || exportPhase !== null}
                    >
                        <Group
                            justify="center"
                            gap="lg"
                            mih={150}
                            style={{ pointerEvents: "none" }}
                        >
                            <Dropzone.Accept>
                                <IconUpload size={46} color="var(--mantine-color-blue-6)" />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconAlertTriangle size={46} color="var(--mantine-color-red-6)" />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconVideo size={46} color="var(--mantine-color-dimmed)" />
                            </Dropzone.Idle>
                            <Box>
                                <Text size="lg">
                                    Drop video clips here or click to choose files
                                </Text>
                                <Text size="sm" c="dimmed">
                                    MP4, WebM, MOV, and M4V · files never leave this device
                                </Text>
                            </Box>
                        </Group>
                    </Dropzone>
                </Box>

                {combinedSize > LARGE_TIMELINE_SIZE && (
                    <Alert icon={<IconAlertTriangle />} color="yellow" mt="lg">
                        This timeline is over 500 MB. Browser export may be slow or run out of
                        memory.
                    </Alert>
                )}

                {clips.length > 0 && (
                    <Stack mt="xl">
                        <Box bg="black" p="md" style={{ borderRadius: 8, overflow: "hidden" }}>
                            {activeClip && (
                                <video
                                    ref={videoRef}
                                    key={activeClip.id}
                                    src={activeClip.objectUrl}
                                    controls
                                    muted={activeClip.muted}
                                    onTimeUpdate={handlePreviewTimeUpdate}
                                    style={{
                                        width: "100%",
                                        maxHeight: 480,
                                        display: "block",
                                        transform: `rotate(${activeClip.rotation}deg) scale(${activeClip.rotation % 180 === 0 ? 1 : 0.72})`,
                                    }}
                                />
                            )}
                        </Box>

                        <Group justify="space-between">
                            <Group>
                                <Button
                                    leftSection={
                                        previewingTimeline ? (
                                            <IconPlayerStop size={18} />
                                        ) : (
                                            <IconPlayerPlay size={18} />
                                        )
                                    }
                                    variant="light"
                                    onClick={() => {
                                        if (previewingTimeline) {
                                            videoRef.current?.pause();
                                            setPreviewingTimeline(false);
                                        } else {
                                            setActiveClipId(clips[0].id);
                                            setPreviewingTimeline(true);
                                        }
                                    }}
                                >
                                    {previewingTimeline
                                        ? "Stop timeline preview"
                                        : "Preview timeline"}
                                </Button>
                                <Text c="dimmed">{clips.length} clips · hard cuts</Text>
                            </Group>
                            <Select
                                label="Output size"
                                value={presetValue(outputPreset)}
                                data={OUTPUT_PRESETS.map((preset) => ({
                                    value: presetValue(preset),
                                    label: `${preset.label} (${preset.width}×${preset.height})`,
                                }))}
                                onChange={(value) => {
                                    const preset = OUTPUT_PRESETS.find(
                                        (item) => presetValue(item) === value,
                                    );
                                    if (preset) {
                                        setOutputPreset(preset);
                                    }
                                }}
                            />
                        </Group>

                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <SortableContext
                                items={clips.map((clip) => clip.id)}
                                strategy={rectSortingStrategy}
                            >
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                                    {clips.map((clip) => (
                                        <SortableVideoClip
                                            key={clip.id}
                                            clip={clip}
                                            active={activeClip?.id === clip.id}
                                            onChange={(nextClip) =>
                                                setClips((current) =>
                                                    current.map((item) =>
                                                        item.id === nextClip.id ? nextClip : item,
                                                    ),
                                                )
                                            }
                                            onRemove={removeClip}
                                            onPreview={(id) => {
                                                setPreviewingTimeline(false);
                                                setActiveClipId(id);
                                            }}
                                        />
                                    ))}
                                </SimpleGrid>
                            </SortableContext>
                        </DndContext>

                        {exportPhase && (
                            <Alert icon={<IconMovie />} color="blue">
                                {phaseLabel} Keep this tab open until export finishes.
                            </Alert>
                        )}

                        <Group justify="space-between" mt="sm">
                            <Button
                                variant="light"
                                color="red"
                                leftSection={<IconTrash size={18} />}
                                disabled={exportPhase !== null}
                                onClick={reset}
                            >
                                Remove all clips
                            </Button>
                            {exportPhase ? (
                                <Button
                                    color="red"
                                    variant="light"
                                    onClick={() => abortControllerRef.current?.abort()}
                                >
                                    Cancel export
                                </Button>
                            ) : (
                                <Button
                                    leftSection={<IconMovie size={18} />}
                                    onClick={handleExport}
                                >
                                    Export MP4
                                </Button>
                            )}
                        </Group>
                    </Stack>
                )}
            </Container>
        </>
    );
}

export default VideoEditor;
