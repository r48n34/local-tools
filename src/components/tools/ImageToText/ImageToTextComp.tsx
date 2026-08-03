import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Group,
    Image,
    Progress,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Tooltip,
} from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import {
    IconAlertCircle,
    IconDownload,
    IconFileText,
    IconRefresh,
    IconReload,
    IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import CopyBtn from "../../common/CopyBtn";
import DropZoneComp from "../ImageConvert/DropZoneComp";
import { downloadBlob } from "../../../utils/downloadFile";
import {
    formatCombinedOcrText,
    getTextDownloadName,
    OCR_LANGUAGE_OPTIONS,
    OcrLanguagePreset,
    OcrProgress,
    OcrResult,
    recognizeImages,
} from "../../../utils/ocr";

const ACCEPTED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/bmp",
    "image/tiff",
    "image/gif",
    "image/webp",
];

function downloadText(text: string, fileName: string) {
    downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), fileName);
}

function ImageToTextComp() {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [preset, setPreset] = useState<OcrLanguagePreset>("eng");
    const [results, setResults] = useState<OcrResult[]>([]);
    const [combinedText, setCombinedText] = useState("");
    const [progress, setProgress] = useState<OcrProgress | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const previews = useMemo(
        () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [files],
    );

    useEffect(() => {
        return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
    }, [previews]);

    function reset() {
        setFiles([]);
        setResults([]);
        setCombinedText("");
        setProgress(null);
        setHasRun(false);
    }

    function updateResultText(index: number, text: string) {
        setResults((currentResults) => {
            const nextResults = currentResults.map((result, resultIndex) =>
                resultIndex === index ? { ...result, text } : result,
            );
            setCombinedText(formatCombinedOcrText(nextResults));
            return nextResults;
        });
    }

    async function extractText() {
        if (files.length === 0) {
            return;
        }

        setIsRunning(true);
        setHasRun(false);
        setResults([]);
        setCombinedText("");
        setProgress({
            fileIndex: null,
            totalFiles: files.length,
            status: "loading OCR engine",
            fileProgress: 0,
            overallProgress: 0,
        });

        try {
            const recognizedResults = await recognizeImages(files, preset, {
                onProgress: setProgress,
                onResult: (result, index) => {
                    setResults((currentResults) => {
                        const nextResults = [...currentResults];
                        nextResults[index] = result;
                        return nextResults;
                    });
                },
            });

            setResults(recognizedResults);
            setCombinedText(formatCombinedOcrText(recognizedResults));
            setHasRun(true);

            const failureCount = recognizedResults.filter((result) => result.error).length;
            if (failureCount === 0) {
                toast.success(`Extracted text from ${recognizedResults.length} images`);
            } else {
                toast.error(
                    `${failureCount} of ${recognizedResults.length} images could not be processed`,
                );
            }
        } catch {
            toast.error("OCR stopped unexpectedly. Please try again.");
        } finally {
            setIsRunning(false);
        }
    }

    const currentFileName =
        progress?.fileIndex === null || progress?.fileIndex === undefined
            ? null
            : files[progress.fileIndex]?.name;

    return (
        <Box mx="auto" mt={32}>
            {!hasRun && (
                <Stack gap="lg">
                    {!isRunning && (
                        <DropZoneComp
                            setFilesCb={(newFiles) =>
                                setFiles((currentFiles) => [...currentFiles, ...newFiles])
                            }
                            acceptedTypesList={ACCEPTED_IMAGE_TYPES}
                        />
                    )}

                    {files.length > 0 && (
                        <>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                                {previews.map(({ file, url }, index) => (
                                    <Card
                                        key={`${file.name}-${file.lastModified}-${index}`}
                                        withBorder
                                        padding="sm"
                                    >
                                        <Card.Section>
                                            <Image
                                                src={url}
                                                h={160}
                                                fit="contain"
                                                alt={file.name}
                                            />
                                        </Card.Section>
                                        <Group justify="space-between" mt="sm" wrap="nowrap">
                                            <Text size="sm" truncate title={file.name}>
                                                {file.name}
                                            </Text>
                                            <Tooltip label="Remove image">
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    disabled={isRunning}
                                                    aria-label={`Remove ${file.name}`}
                                                    onClick={() =>
                                                        setFiles((currentFiles) =>
                                                            currentFiles.filter(
                                                                (_, fileIndex) =>
                                                                    fileIndex !== index,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <IconTrash size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Card>
                                ))}
                            </SimpleGrid>

                            <Select
                                label="Recognition language"
                                description="Choose the languages expected in these images"
                                data={OCR_LANGUAGE_OPTIONS}
                                value={preset}
                                disabled={isRunning}
                                onChange={(value) =>
                                    setPreset((value as OcrLanguagePreset | null) || "eng")
                                }
                            />
                        </>
                    )}

                    {isRunning && progress && (
                        <Card withBorder>
                            <Text fw={500}>
                                {currentFileName
                                    ? `Processing ${progress.fileIndex! + 1} of ${progress.totalFiles}: ${currentFileName}`
                                    : "Loading the local OCR engine"}
                            </Text>
                            <Text size="sm" c="dimmed" tt="capitalize" mt={4}>
                                {progress.status}
                            </Text>

                            <Text size="sm" mt="md">
                                Current step
                            </Text>
                            <Progress value={progress.fileProgress} animated mt={4} />

                            <Text size="sm" mt="md">
                                Overall batch
                            </Text>
                            <Progress value={progress.overallProgress} animated mt={4} />
                        </Card>
                    )}

                    <Group justify="space-between">
                        <Button
                            color="red"
                            variant="light"
                            leftSection={<IconTrash size={18} />}
                            disabled={files.length === 0 || isRunning}
                            onClick={reset}
                        >
                            Remove all images
                        </Button>
                        <Button
                            leftSection={<IconFileText size={18} />}
                            disabled={files.length === 0}
                            loading={isRunning}
                            onClick={extractText}
                        >
                            Extract text from {files.length || 0} image
                            {files.length === 1 ? "" : "s"}
                        </Button>
                    </Group>
                </Stack>
            )}

            {(isRunning || hasRun) && results.filter(Boolean).length > 0 && (
                <Stack gap="lg" mt="xl">
                    <Group justify="space-between">
                        <Text fz={28} fw={300}>
                            Extracted text
                        </Text>
                        {hasRun && (
                            <Button
                                variant="light"
                                color="green"
                                leftSection={<IconReload size={18} />}
                                onClick={reset}
                            >
                                Start another batch
                            </Button>
                        )}
                    </Group>

                    {hasRun && (
                        <Card withBorder>
                            <Group justify="space-between" mb="sm">
                                <Text fw={500}>Combined text</Text>
                                <Group gap="xs">
                                    <Tooltip label="Refresh from per-image results">
                                        <ActionIcon
                                            variant="subtle"
                                            aria-label="Refresh combined text"
                                            onClick={() =>
                                                setCombinedText(formatCombinedOcrText(results))
                                            }
                                        >
                                            <IconRefresh size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <CopyBtn value={combinedText} />
                                    <Tooltip label="Download combined text">
                                        <ActionIcon
                                            variant="subtle"
                                            aria-label="Download combined text"
                                            onClick={() =>
                                                downloadText(combinedText, "ocr-results.txt")
                                            }
                                        >
                                            <IconDownload size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Group>
                            <Textarea
                                aria-label="Combined OCR text"
                                value={combinedText}
                                onChange={(event) => setCombinedText(event.currentTarget.value)}
                                autosize
                                minRows={8}
                                maxRows={18}
                            />
                        </Card>
                    )}

                    {results.filter(Boolean).map((result, index) => (
                        <Card key={result.id} withBorder>
                            <Group justify="space-between" mb="sm">
                                <Text fw={500}>{result.fileName}</Text>
                                {!result.error && (
                                    <Group gap="xs">
                                        {result.confidence !== null && (
                                            <Badge variant="light">
                                                {Math.round(result.confidence)}% confidence
                                            </Badge>
                                        )}
                                        <CopyBtn value={result.text} />
                                        <Tooltip label="Download text">
                                            <ActionIcon
                                                variant="subtle"
                                                aria-label={`Download text from ${result.fileName}`}
                                                onClick={() =>
                                                    downloadText(
                                                        result.text,
                                                        getTextDownloadName(result.fileName),
                                                    )
                                                }
                                            >
                                                <IconDownload size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                )}
                            </Group>

                            {result.error ? (
                                <Alert
                                    color="red"
                                    icon={<IconAlertCircle size={18} />}
                                    title="OCR failed for this image"
                                >
                                    {result.error}
                                </Alert>
                            ) : (
                                <Textarea
                                    aria-label={`Text extracted from ${result.fileName}`}
                                    value={result.text}
                                    onChange={(event) =>
                                        updateResultText(index, event.currentTarget.value)
                                    }
                                    autosize
                                    minRows={6}
                                    maxRows={16}
                                />
                            )}
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default ImageToTextComp;
