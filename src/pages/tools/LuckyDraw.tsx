import {
    Accordion,
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Checkbox,
    Container,
    Divider,
    FileButton,
    Grid,
    Group,
    Modal,
    NumberInput,
    Paper,
    Progress,
    ScrollArea,
    Select,
    SimpleGrid,
    Slider,
    Stack,
    Switch,
    Table,
    Tabs,
    Text,
    TextInput,
    Textarea,
    Title,
    Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconAlertCircle,
    IconArrowsMaximize,
    IconArrowsMinimize,
    IconCheck,
    IconConfetti,
    IconDownload,
    IconFileSpreadsheet,
    IconHistory,
    IconPlayerPlayFilled,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconSettings,
    IconTrash,
    IconTrophy,
    IconUpload,
    IconUsers,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import readXlsxFile from "read-excel-file/browser";
import LuckyDrawConfetti from "../../components/tools/LuckyDraw/LuckyDrawConfetti";
import LuckyDrawWheel from "../../components/tools/LuckyDraw/LuckyDrawWheel";
import type {
    DrawResult,
    LuckyDrawPalette,
    LuckyDrawParticipant,
    LuckyDrawSettings,
    PrizeRound,
    SavedLuckyDrawEvent,
    WorkbookSheet,
} from "../../types/luckyDraw";
import { downloadBlob } from "../../utils/downloadFile";
import { playSpinSound, playWinnerSound } from "../../utils/luckyDrawAudio";
import {
    calculateTargetRotation,
    createLuckyDrawId,
    createWheelSegments,
    createWinnerCsv,
    cryptoRandomFloat,
    DEFAULT_PRIZES,
    findFirstHeaderRow,
    getCurrentPrize,
    getEligibleParticipants,
    getHeaders,
    guessParticipantColumns,
    normalizeManualParticipants,
    normalizeParticipants,
    selectWeightedParticipant,
} from "../../utils/luckyDrawUtils";
import {
    clearSavedLuckyDraw,
    loadSavedLuckyDraw,
    saveLuckyDraw,
} from "../../utils/luckyDrawStorage";
import classes from "./LuckyDraw.module.css";

const DEFAULT_SETTINGS: LuckyDrawSettings = {
    allowRepeats: false,
    durationSeconds: 6,
    sound: false,
    confetti: true,
    palette: "festival",
};

const PRIZE_COLORS = ["violet", "pink", "red", "orange", "yellow", "green", "cyan", "blue"];

function cloneDefaultPrizes() {
    return DEFAULT_PRIZES.map((prize) => ({ ...prize }));
}

function LuckyDraw() {
    const pageRef = useRef<HTMLDivElement>(null);
    const spinTimerRef = useRef<number | null>(null);
    const confettiTimerRef = useRef<number | null>(null);
    const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)") ?? false;

    const [sheets, setSheets] = useState<WorkbookSheet[]>([]);
    const [sheetName, setSheetName] = useState("");
    const [headerRow, setHeaderRow] = useState(1);
    const [nameColumn, setNameColumn] = useState<number | null>(null);
    const [idColumn, setIdColumn] = useState<number | null>(null);
    const [weightColumn, setWeightColumn] = useState<number | null>(null);
    const [workbookName, setWorkbookName] = useState("");
    const [loadingWorkbook, setLoadingWorkbook] = useState(false);
    const [manualNames, setManualNames] = useState("");
    const [section, setSection] = useState<"participants" | "draw">("participants");

    const [participants, setParticipants] = useState<LuckyDrawParticipant[]>([]);
    const [participantSearch, setParticipantSearch] = useState("");
    const [prizes, setPrizes] = useState<PrizeRound[]>(cloneDefaultPrizes);
    const [results, setResults] = useState<DrawResult[]>([]);
    const [settings, setSettings] = useState<LuckyDrawSettings>(DEFAULT_SETTINGS);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [lastWinner, setLastWinner] = useState<DrawResult | null>(null);
    const [winnerModalOpen, setWinnerModalOpen] = useState(false);
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [saveEnabled, setSaveEnabled] = useState(false);
    const [savedEvent, setSavedEvent] = useState<SavedLuckyDrawEvent | null>(null);
    const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const activeSheet = sheets.find((sheet) => sheet.name === sheetName);
    const headers = useMemo(
        () => getHeaders(activeSheet?.rows ?? [], headerRow),
        [activeSheet, headerRow],
    );
    const columnOptions = headers.map((header, index) => ({ value: String(index), label: header }));
    const importPreview = useMemo(() => {
        if (!activeSheet || nameColumn === null) {
            return { participants: [], errors: [] };
        }
        return normalizeParticipants(
            activeSheet.rows,
            { headerRow, nameColumn, idColumn, weightColumn },
            activeSheet.name,
        );
    }, [activeSheet, headerRow, idColumn, nameColumn, weightColumn]);
    const manualParticipants = useMemo(
        () => normalizeManualParticipants(manualNames),
        [manualNames],
    );

    const eligibleParticipants = useMemo(
        () => getEligibleParticipants(participants, results, settings.allowRepeats),
        [participants, results, settings.allowRepeats],
    );
    const currentPrize = useMemo(() => getCurrentPrize(prizes, results), [prizes, results]);
    const enabledParticipantCount = participants.filter(
        (participant) => participant.enabled,
    ).length;
    const remainingSlots = prizes.reduce((total, prize) => {
        const drawn = results.filter((result) => result.prizeId === prize.id).length;
        return total + Math.max(0, prize.winnerCount - drawn);
    }, 0);
    const filteredParticipants = participants.filter((participant) => {
        const query = participantSearch.trim().toLowerCase();
        return (
            !query ||
            participant.name.toLowerCase().includes(query) ||
            participant.externalId.toLowerCase().includes(query)
        );
    });

    useEffect(() => {
        const event = loadSavedLuckyDraw();
        if (event) {
            setSavedEvent(event);
            setRecoveryModalOpen(true);
        }

        const handleFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", handleFullscreen);
        return () => document.removeEventListener("fullscreenchange", handleFullscreen);
    }, []);

    useEffect(() => {
        if (!saveEnabled) {
            return;
        }
        try {
            saveLuckyDraw({
                version: 1,
                savedAt: new Date().toISOString(),
                participants,
                prizes,
                results,
                settings,
            });
        } catch {
            setSaveEnabled(false);
            toast.error("This browser could not save the event. The draw will continue in memory.");
        }
    }, [participants, prizes, results, saveEnabled, settings]);

    useEffect(
        () => () => {
            if (spinTimerRef.current !== null) {
                window.clearTimeout(spinTimerRef.current);
            }
            if (confettiTimerRef.current !== null) {
                window.clearTimeout(confettiTimerRef.current);
            }
        },
        [],
    );

    function configureSheet(sheet: WorkbookSheet) {
        const nextHeaderRow = findFirstHeaderRow(sheet.rows);
        const nextHeaders = getHeaders(sheet.rows, nextHeaderRow);
        const guessed = guessParticipantColumns(nextHeaders);
        setSheetName(sheet.name);
        setHeaderRow(nextHeaderRow);
        setNameColumn(guessed.nameColumn);
        setIdColumn(guessed.idColumn);
        setWeightColumn(guessed.weightColumn);
    }

    async function loadWorkbook(file: File | null) {
        if (!file) {
            return;
        }
        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            toast.error("Please choose an .xlsx workbook.");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            toast.error("The workbook is larger than the 20 MB browser limit.");
            return;
        }

        setLoadingWorkbook(true);
        try {
            const parsed = await readXlsxFile(file);
            const nextSheets = parsed.map((sheet) => ({ name: sheet.sheet, rows: sheet.data }));
            if (nextSheets.length === 0) {
                throw new Error("Workbook has no worksheets");
            }
            setSheets(nextSheets);
            setWorkbookName(file.name);
            configureSheet(nextSheets[0]);
            toast.success(
                `Loaded ${nextSheets.length} worksheet${nextSheets.length === 1 ? "" : "s"}.`,
            );
        } catch {
            toast.error("The workbook is empty, encrypted, or invalid.");
        } finally {
            setLoadingWorkbook(false);
        }
    }

    function changeHeaderRow(value: string | number) {
        if (!activeSheet) {
            return;
        }
        const next = Math.min(Math.max(Number(value) || 1, 1), activeSheet.rows.length || 1);
        const guessed = guessParticipantColumns(getHeaders(activeSheet.rows, next));
        setHeaderRow(next);
        setNameColumn(guessed.nameColumn);
        setIdColumn(guessed.idColumn);
        setWeightColumn(guessed.weightColumn);
    }

    function replaceParticipantList(nextParticipants: LuckyDrawParticipant[], source: string) {
        setParticipants(nextParticipants);
        setResults([]);
        setLastWinner(null);
        setRotation(0);
        setSection("draw");
        toast.success(`Added ${nextParticipants.length} participants from ${source}.`);
    }

    function importParticipants() {
        if (importPreview.errors.length > 0) {
            toast.error("Fix the invalid weight values before importing.");
            return;
        }
        if (importPreview.participants.length < 2) {
            toast.error("At least two participants with names are required.");
            return;
        }
        replaceParticipantList(importPreview.participants, "the workbook");
    }

    function importManualParticipants() {
        if (manualParticipants.length < 2) {
            toast.error("Enter at least two names, one per line.");
            return;
        }
        replaceParticipantList(manualParticipants, "the name list");
    }

    function toggleVisibleParticipants(enabled: boolean) {
        const visibleIds = new Set(filteredParticipants.map((participant) => participant.id));
        setParticipants((current) =>
            current.map((participant) =>
                visibleIds.has(participant.id) ? { ...participant, enabled } : participant,
            ),
        );
    }

    function updatePrize(id: string, patch: Partial<PrizeRound>) {
        setPrizes((current) =>
            current.map((prize) => (prize.id === id ? { ...prize, ...patch } : prize)),
        );
    }

    function addPrize() {
        const index = prizes.length + 1;
        setPrizes((current) => [
            ...current,
            {
                id: createLuckyDrawId("prize"),
                name: `Prize ${index}`,
                color: PRIZE_COLORS[index % PRIZE_COLORS.length],
                winnerCount: 1,
            },
        ]);
    }

    function removePrize(id: string) {
        setPrizes((current) => current.filter((prize) => prize.id !== id));
    }

    function finishSpin(winner: LuckyDrawParticipant, prize: PrizeRound) {
        const result: DrawResult = {
            id: createLuckyDrawId("result"),
            participantId: winner.id,
            participantName: winner.name,
            participantExternalId: winner.externalId,
            participantWeight: winner.weight,
            prizeId: prize.id,
            prizeName: prize.name,
            prizeColor: prize.color,
            sourceSheet: winner.sourceSheet,
            sourceRow: winner.sourceRow,
            drawnAt: new Date().toISOString(),
        };
        setResults((current) => [...current, result]);
        setLastWinner(result);
        setWinnerModalOpen(true);
        setSpinning(false);
        if (settings.sound) {
            playWinnerSound();
        }
        if (settings.confetti) {
            setShowConfetti(true);
            confettiTimerRef.current = window.setTimeout(() => setShowConfetti(false), 2800);
        }
    }

    function spin() {
        if (spinning || !currentPrize || eligibleParticipants.length === 0) {
            return;
        }
        const winner = selectWeightedParticipant(eligibleParticipants);
        const segment = createWheelSegments(eligibleParticipants).find(
            (item) => item.participant.id === winner.id,
        );
        if (!segment) {
            return;
        }
        if (settings.sound) {
            playSpinSound();
        }

        const targetRotation = calculateTargetRotation(
            rotation,
            segment,
            6,
            0.2 + cryptoRandomFloat() * 0.6,
        );
        const duration = reducedMotion ? 350 : settings.durationSeconds * 1000;
        setSpinning(true);
        window.requestAnimationFrame(() =>
            window.requestAnimationFrame(() => setRotation(targetRotation)),
        );
        spinTimerRef.current = window.setTimeout(() => finishSpin(winner, currentPrize), duration);
    }

    function exportHistory() {
        if (results.length === 0) {
            toast.error("Draw at least one winner before exporting.");
            return;
        }
        downloadBlob(
            new Blob([createWinnerCsv(results)], { type: "text/csv;charset=utf-8" }),
            "lucky-draw-winners.csv",
        );
        toast.success("Winner history downloaded.");
    }

    function resetEvent() {
        setParticipants([]);
        setResults([]);
        setPrizes(cloneDefaultPrizes());
        setSettings(DEFAULT_SETTINGS);
        setSheets([]);
        setSheetName("");
        setWorkbookName("");
        setManualNames("");
        setSection("participants");
        setRotation(0);
        setLastWinner(null);
        setSaveEnabled(false);
        clearSavedLuckyDraw();
        setResetModalOpen(false);
        toast.success("Lucky draw reset.");
    }

    function resumeSavedEvent() {
        if (!savedEvent) {
            return;
        }
        setParticipants(savedEvent.participants);
        setPrizes(savedEvent.prizes);
        setResults(savedEvent.results);
        setSettings(savedEvent.settings);
        setSaveEnabled(true);
        setSection("draw");
        setRecoveryModalOpen(false);
        toast.success("Saved lucky draw restored.");
    }

    function deleteSavedEvent() {
        clearSavedLuckyDraw();
        setSavedEvent(null);
        setRecoveryModalOpen(false);
    }

    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await pageRef.current?.requestFullscreen();
            }
        } catch {
            toast.error("Fullscreen mode is not available in this browser.");
        }
    }

    const currentPrizeWinnerCount = currentPrize
        ? results.filter((result) => result.prizeId === currentPrize.id).length
        : 0;

    return (
        <Box ref={pageRef} className={`${classes.page} ${fullscreen ? classes.fullscreen : ""}`}>
            <Helmet>
                <title>Lucky Draw | Local Tools</title>
                <meta
                    name="description"
                    content="Import an XLSX file or enter a name list and run a private, local lucky draw spin wheel."
                />
            </Helmet>
            {showConfetti && <LuckyDrawConfetti />}

            <Container size="xl">
                <Paper
                    className={classes.hero}
                    withBorder
                    radius="lg"
                    p={{ base: "md", sm: "xl" }}
                    mb="lg"
                >
                    <Group justify="space-between" align="flex-start">
                        <Box>
                            <Title order={1} fw={500} fz={{ base: 32, sm: 44 }}>
                                <IconConfetti size={38} /> Lucky Draw
                            </Title>
                            <Text c="dimmed" maw={720} mt={4}>
                                Import participants from Excel or paste a name list, then run a
                                presentation-ready draw. Your data never leaves this device.
                            </Text>
                        </Box>
                        <Group gap="xs">
                            <Tooltip
                                label={fullscreen ? "Exit fullscreen" : "Presentation fullscreen"}
                            >
                                <ActionIcon
                                    variant="light"
                                    size="lg"
                                    aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                    onClick={toggleFullscreen}
                                >
                                    {fullscreen ? (
                                        <IconArrowsMinimize size={20} />
                                    ) : (
                                        <IconArrowsMaximize size={20} />
                                    )}
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Reset the entire event">
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    size="lg"
                                    aria-label="Reset lucky draw"
                                    onClick={() => setResetModalOpen(true)}
                                    disabled={spinning}
                                >
                                    <IconRefresh size={20} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                </Paper>

                <Tabs
                    value={section}
                    onChange={(value) => {
                        if (value === "participants" || value === "draw") {
                            setSection(value);
                        }
                    }}
                    keepMounted
                >
                    <Tabs.List grow>
                        <Tabs.Tab value="participants" leftSection={<IconUsers size={18} />}>
                            1. Participants
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="draw"
                            leftSection={<IconTrophy size={18} />}
                            disabled={participants.length < 2}
                        >
                            2. Prizes & draw
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="participants" pt="lg">
                        <Accordion
                            variant="separated"
                            defaultValue={participants.length ? null : "import"}
                            mb="lg"
                        >
                            <Accordion.Item value="import">
                                <Accordion.Control icon={<IconFileSpreadsheet size={22} />}>
                                    <Group gap="xs">
                                        <Text fw={600}>Import participants</Text>
                                        {participants.length > 0 && (
                                            <Badge variant="light">
                                                {participants.length} imported
                                            </Badge>
                                        )}
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap="md">
                                        <Group justify="space-between">
                                            <Box>
                                                <Text fw={600}>
                                                    {workbookName || "Choose an XLSX workbook"}
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    XLSX only, up to 20 MB. Processing stays in your
                                                    browser.
                                                </Text>
                                            </Box>
                                            <FileButton
                                                onChange={loadWorkbook}
                                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                            >
                                                {(props) => (
                                                    <Button
                                                        {...props}
                                                        leftSection={<IconUpload size={18} />}
                                                        loading={loadingWorkbook}
                                                        disabled={spinning}
                                                    >
                                                        {workbookName
                                                            ? "Replace workbook"
                                                            : "Upload XLSX"}
                                                    </Button>
                                                )}
                                            </FileButton>
                                        </Group>

                                        {activeSheet && (
                                            <>
                                                <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }}>
                                                    <Select
                                                        label="Worksheet"
                                                        data={sheets.map((sheet) => ({
                                                            value: sheet.name,
                                                            label: sheet.name,
                                                        }))}
                                                        value={sheetName}
                                                        onChange={(value) => {
                                                            const sheet = sheets.find(
                                                                (item) => item.name === value,
                                                            );
                                                            if (sheet) configureSheet(sheet);
                                                        }}
                                                        disabled={spinning}
                                                    />
                                                    <NumberInput
                                                        label="Header row"
                                                        min={1}
                                                        max={activeSheet.rows.length || 1}
                                                        value={headerRow}
                                                        onChange={changeHeaderRow}
                                                        disabled={spinning}
                                                    />
                                                    <Select
                                                        label="Name column"
                                                        data={columnOptions}
                                                        value={
                                                            nameColumn === null
                                                                ? null
                                                                : String(nameColumn)
                                                        }
                                                        onChange={(value) =>
                                                            setNameColumn(
                                                                value === null
                                                                    ? null
                                                                    : Number(value),
                                                            )
                                                        }
                                                        required
                                                        searchable
                                                        disabled={spinning}
                                                    />
                                                    <Select
                                                        label="ID column"
                                                        description="Optional"
                                                        data={columnOptions}
                                                        value={
                                                            idColumn === null
                                                                ? null
                                                                : String(idColumn)
                                                        }
                                                        onChange={(value) =>
                                                            setIdColumn(
                                                                value === null
                                                                    ? null
                                                                    : Number(value),
                                                            )
                                                        }
                                                        clearable
                                                        searchable
                                                        disabled={spinning}
                                                    />
                                                    <Select
                                                        label="Weight column"
                                                        description="Optional; blank = 1"
                                                        data={columnOptions}
                                                        value={
                                                            weightColumn === null
                                                                ? null
                                                                : String(weightColumn)
                                                        }
                                                        onChange={(value) =>
                                                            setWeightColumn(
                                                                value === null
                                                                    ? null
                                                                    : Number(value),
                                                            )
                                                        }
                                                        clearable
                                                        searchable
                                                        disabled={spinning}
                                                    />
                                                </SimpleGrid>

                                                <Group gap="xs">
                                                    <Badge
                                                        color="green"
                                                        leftSection={<IconCheck size={12} />}
                                                    >
                                                        {importPreview.participants.length} valid
                                                        rows
                                                    </Badge>
                                                    {importPreview.errors.length > 0 && (
                                                        <Badge
                                                            color="red"
                                                            leftSection={
                                                                <IconAlertCircle size={12} />
                                                            }
                                                        >
                                                            {importPreview.errors.length} invalid
                                                            weights
                                                        </Badge>
                                                    )}
                                                </Group>

                                                {importPreview.errors.length > 0 && (
                                                    <Alert
                                                        color="red"
                                                        icon={<IconAlertCircle size={18} />}
                                                        title="Fix these rows before importing"
                                                    >
                                                        {importPreview.errors
                                                            .slice(0, 5)
                                                            .map((error) => (
                                                                <Text key={error.row} size="sm">
                                                                    Row {error.row}: {error.message}
                                                                </Text>
                                                            ))}
                                                        {importPreview.errors.length > 5 && (
                                                            <Text size="sm">
                                                                And{" "}
                                                                {importPreview.errors.length - 5}{" "}
                                                                more rows.
                                                            </Text>
                                                        )}
                                                    </Alert>
                                                )}

                                                <Table.ScrollContainer minWidth={560}>
                                                    <Table striped withTableBorder>
                                                        <Table.Thead>
                                                            <Table.Tr>
                                                                <Table.Th>Source row</Table.Th>
                                                                <Table.Th>Name</Table.Th>
                                                                <Table.Th>ID</Table.Th>
                                                                <Table.Th>Weight</Table.Th>
                                                            </Table.Tr>
                                                        </Table.Thead>
                                                        <Table.Tbody>
                                                            {importPreview.participants
                                                                .slice(0, 5)
                                                                .map((participant) => (
                                                                    <Table.Tr key={participant.id}>
                                                                        <Table.Td>
                                                                            {participant.sourceRow}
                                                                        </Table.Td>
                                                                        <Table.Td>
                                                                            {participant.name}
                                                                        </Table.Td>
                                                                        <Table.Td>
                                                                            {participant.externalId ||
                                                                                "—"}
                                                                        </Table.Td>
                                                                        <Table.Td>
                                                                            {participant.weight}
                                                                        </Table.Td>
                                                                    </Table.Tr>
                                                                ))}
                                                        </Table.Tbody>
                                                    </Table>
                                                </Table.ScrollContainer>
                                                <Group justify="flex-end">
                                                    <Button
                                                        onClick={importParticipants}
                                                        leftSection={<IconUsers size={18} />}
                                                        disabled={
                                                            importPreview.errors.length > 0 ||
                                                            importPreview.participants.length < 2 ||
                                                            spinning
                                                        }
                                                    >
                                                        Import {importPreview.participants.length}{" "}
                                                        participants
                                                    </Button>
                                                </Group>
                                            </>
                                        )}

                                        <Divider
                                            label="Or enter names manually"
                                            labelPosition="center"
                                        />
                                        <SimpleGrid cols={{ base: 1, md: 2 }}>
                                            <Box>
                                                <Text fw={600}>Paste a name list</Text>
                                                <Text size="sm" c="dimmed">
                                                    Enter one name per line. Blank lines are ignored
                                                    and duplicate names remain separate entries.
                                                </Text>
                                            </Box>
                                            <Stack gap="xs">
                                                <Textarea
                                                    label="Participant names"
                                                    placeholder={"Alice\nBob\nCarol"}
                                                    value={manualNames}
                                                    onChange={(event) =>
                                                        setManualNames(event.currentTarget.value)
                                                    }
                                                    autosize
                                                    minRows={6}
                                                    maxRows={16}
                                                    disabled={spinning}
                                                />
                                                <Group justify="space-between">
                                                    <Badge variant="light">
                                                        {manualParticipants.length} names
                                                    </Badge>
                                                    <Button
                                                        variant="light"
                                                        leftSection={<IconUsers size={18} />}
                                                        onClick={importManualParticipants}
                                                        disabled={
                                                            manualParticipants.length < 2 ||
                                                            spinning
                                                        }
                                                    >
                                                        Use {manualParticipants.length} names
                                                    </Button>
                                                </Group>
                                            </Stack>
                                        </SimpleGrid>
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    </Tabs.Panel>

                    <Tabs.Panel value="draw" pt="lg">
                        {participants.length > 0 && (
                            <>
                                <Grid gap="lg">
                                    <Grid.Col span={{ base: 12, lg: 4 }}>
                                        <Stack gap="lg">
                                            <Card withBorder radius="lg" padding="lg">
                                                <Group mb="md">
                                                    <IconTrophy size={22} />
                                                    <Text fw={700}>2. Prize rounds</Text>
                                                </Group>
                                                <Stack gap="sm">
                                                    {prizes.map((prize, index) => {
                                                        const drawnCount = results.filter(
                                                            (result) => result.prizeId === prize.id,
                                                        ).length;
                                                        return (
                                                            <Paper
                                                                key={prize.id}
                                                                withBorder
                                                                p="sm"
                                                                radius="md"
                                                            >
                                                                <Group
                                                                    justify="space-between"
                                                                    mb="xs"
                                                                >
                                                                    <Badge color={prize.color}>
                                                                        Round {index + 1}
                                                                    </Badge>
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="red"
                                                                        aria-label={`Remove ${prize.name}`}
                                                                        disabled={
                                                                            prizes.length === 1 ||
                                                                            drawnCount > 0 ||
                                                                            spinning
                                                                        }
                                                                        onClick={() =>
                                                                            removePrize(prize.id)
                                                                        }
                                                                    >
                                                                        <IconTrash size={17} />
                                                                    </ActionIcon>
                                                                </Group>
                                                                <TextInput
                                                                    label="Prize name"
                                                                    value={prize.name}
                                                                    onChange={(event) =>
                                                                        updatePrize(prize.id, {
                                                                            name: event
                                                                                .currentTarget
                                                                                .value,
                                                                        })
                                                                    }
                                                                    disabled={
                                                                        spinning || drawnCount > 0
                                                                    }
                                                                />
                                                                <SimpleGrid cols={2} mt="xs">
                                                                    <NumberInput
                                                                        label="Winners"
                                                                        min={Math.max(
                                                                            1,
                                                                            drawnCount,
                                                                        )}
                                                                        value={prize.winnerCount}
                                                                        onChange={(value) =>
                                                                            updatePrize(prize.id, {
                                                                                winnerCount:
                                                                                    Math.max(
                                                                                        1,
                                                                                        Number(
                                                                                            value,
                                                                                        ) || 1,
                                                                                    ),
                                                                            })
                                                                        }
                                                                        disabled={spinning}
                                                                    />
                                                                    <Select
                                                                        label="Color"
                                                                        data={PRIZE_COLORS}
                                                                        value={prize.color}
                                                                        onChange={(value) =>
                                                                            value &&
                                                                            updatePrize(prize.id, {
                                                                                color: value,
                                                                            })
                                                                        }
                                                                        disabled={spinning}
                                                                    />
                                                                </SimpleGrid>
                                                                {drawnCount > 0 && (
                                                                    <Progress
                                                                        mt="sm"
                                                                        value={
                                                                            (drawnCount /
                                                                                prize.winnerCount) *
                                                                            100
                                                                        }
                                                                        color={prize.color}
                                                                    />
                                                                )}
                                                            </Paper>
                                                        );
                                                    })}
                                                    <Button
                                                        variant="light"
                                                        leftSection={<IconPlus size={17} />}
                                                        onClick={addPrize}
                                                        disabled={spinning}
                                                    >
                                                        Add prize round
                                                    </Button>
                                                </Stack>
                                            </Card>

                                            <Card withBorder radius="lg" padding="lg">
                                                <Group mb="md">
                                                    <IconSettings size={22} />
                                                    <Text fw={700}>Event settings</Text>
                                                </Group>
                                                <Stack gap="md">
                                                    <Box>
                                                        <Group justify="space-between">
                                                            <Text size="sm" fw={500}>
                                                                Spin duration
                                                            </Text>
                                                            <Badge variant="light">
                                                                {settings.durationSeconds}s
                                                            </Badge>
                                                        </Group>
                                                        <Slider
                                                            mt="xs"
                                                            min={2}
                                                            max={10}
                                                            step={1}
                                                            value={settings.durationSeconds}
                                                            onChange={(durationSeconds) =>
                                                                setSettings((current) => ({
                                                                    ...current,
                                                                    durationSeconds,
                                                                }))
                                                            }
                                                            disabled={spinning}
                                                            marks={[
                                                                { value: 2, label: "2s" },
                                                                { value: 6, label: "6s" },
                                                                { value: 10, label: "10s" },
                                                            ]}
                                                        />
                                                    </Box>
                                                    <Select
                                                        label="Wheel palette"
                                                        data={[
                                                            {
                                                                value: "festival",
                                                                label: "Festival",
                                                            },
                                                            { value: "ocean", label: "Ocean" },
                                                            { value: "sunset", label: "Sunset" },
                                                            { value: "mono", label: "Monochrome" },
                                                        ]}
                                                        value={settings.palette}
                                                        onChange={(value) =>
                                                            value &&
                                                            setSettings((current) => ({
                                                                ...current,
                                                                palette: value as LuckyDrawPalette,
                                                            }))
                                                        }
                                                        disabled={spinning}
                                                    />
                                                    <Switch
                                                        label="Allow repeat winners"
                                                        description="When off, winners leave the eligible pool."
                                                        checked={settings.allowRepeats}
                                                        onChange={(event) =>
                                                            setSettings((current) => ({
                                                                ...current,
                                                                allowRepeats:
                                                                    event.currentTarget.checked,
                                                            }))
                                                        }
                                                        disabled={spinning}
                                                    />
                                                    <Switch
                                                        label="Winner sound"
                                                        description="Play locally generated draw effects."
                                                        checked={settings.sound}
                                                        onChange={(event) =>
                                                            setSettings((current) => ({
                                                                ...current,
                                                                sound: event.currentTarget.checked,
                                                            }))
                                                        }
                                                        disabled={spinning}
                                                    />
                                                    <Switch
                                                        label="Confetti"
                                                        checked={settings.confetti}
                                                        onChange={(event) =>
                                                            setSettings((current) => ({
                                                                ...current,
                                                                confetti:
                                                                    event.currentTarget.checked,
                                                            }))
                                                        }
                                                        disabled={spinning}
                                                    />
                                                    <Divider />
                                                    <Switch
                                                        label="Save this event on this device"
                                                        description="Stores normalized entries and results, never the workbook."
                                                        checked={saveEnabled}
                                                        onChange={(event) => {
                                                            const checked =
                                                                event.currentTarget.checked;
                                                            setSaveEnabled(checked);
                                                            if (!checked) clearSavedLuckyDraw();
                                                        }}
                                                    />
                                                </Stack>
                                            </Card>
                                        </Stack>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, lg: 8 }}>
                                        <Card withBorder radius="lg" padding="lg">
                                            <Group justify="space-between" mb="xs">
                                                <Box>
                                                    <Text size="sm" c="dimmed">
                                                        Current round
                                                    </Text>
                                                    <Title
                                                        order={2}
                                                        c={currentPrize?.color ?? "dimmed"}
                                                    >
                                                        {currentPrize?.name ??
                                                            "All rounds complete"}
                                                    </Title>
                                                    {currentPrize && (
                                                        <Text size="sm" c="dimmed">
                                                            Winner {currentPrizeWinnerCount + 1} of{" "}
                                                            {currentPrize.winnerCount}
                                                        </Text>
                                                    )}
                                                </Box>
                                                <Group gap="xs">
                                                    <Badge variant="light" size="lg">
                                                        {eligibleParticipants.length} eligible
                                                    </Badge>
                                                    <Badge variant="outline" size="lg">
                                                        {remainingSlots} prizes left
                                                    </Badge>
                                                </Group>
                                            </Group>

                                            {!settings.allowRepeats &&
                                                remainingSlots > eligibleParticipants.length && (
                                                    <Alert
                                                        color="yellow"
                                                        icon={<IconAlertCircle size={18} />}
                                                        mb="sm"
                                                    >
                                                        There are more remaining prize slots than
                                                        unique eligible participants. Add entries,
                                                        reduce prize counts, or allow repeat
                                                        winners.
                                                    </Alert>
                                                )}

                                            <LuckyDrawWheel
                                                participants={eligibleParticipants}
                                                rotation={rotation}
                                                durationSeconds={settings.durationSeconds}
                                                spinning={spinning}
                                                palette={settings.palette}
                                                reducedMotion={reducedMotion}
                                            />

                                            <Group justify="center" mt="md">
                                                <Button
                                                    size="xl"
                                                    radius="xl"
                                                    leftSection={<IconPlayerPlayFilled size={24} />}
                                                    onClick={spin}
                                                    loading={spinning}
                                                    disabled={
                                                        !currentPrize ||
                                                        eligibleParticipants.length === 0
                                                    }
                                                    color={currentPrize?.color ?? "gray"}
                                                >
                                                    {spinning
                                                        ? "Spinning…"
                                                        : currentPrize
                                                          ? `Spin for ${currentPrize.name}`
                                                          : "Draw complete"}
                                                </Button>
                                            </Group>
                                            {reducedMotion && (
                                                <Text size="xs" c="dimmed" ta="center" mt="xs">
                                                    Reduced motion is enabled; results use a short
                                                    reveal.
                                                </Text>
                                            )}
                                        </Card>
                                    </Grid.Col>
                                </Grid>

                                <Grid gap="lg" mt="lg">
                                    <Grid.Col span={{ base: 12, md: 5 }}>
                                        <Card withBorder radius="lg" padding="lg">
                                            <Group justify="space-between" mb="md">
                                                <Group gap="xs">
                                                    <IconUsers size={22} />
                                                    <Text fw={700}>Participants</Text>
                                                    <Badge>
                                                        {enabledParticipantCount}/
                                                        {participants.length}
                                                    </Badge>
                                                </Group>
                                            </Group>
                                            <TextInput
                                                placeholder="Search name or ID"
                                                leftSection={<IconSearch size={16} />}
                                                value={participantSearch}
                                                onChange={(event) =>
                                                    setParticipantSearch(event.currentTarget.value)
                                                }
                                            />
                                            <Group gap="xs" my="sm">
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    onClick={() => toggleVisibleParticipants(true)}
                                                    disabled={spinning}
                                                >
                                                    Include visible
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    onClick={() => toggleVisibleParticipants(false)}
                                                    disabled={spinning}
                                                >
                                                    Exclude visible
                                                </Button>
                                            </Group>
                                            <ScrollArea h={320} type="auto">
                                                <Table striped stickyHeader>
                                                    <Table.Thead>
                                                        <Table.Tr>
                                                            <Table.Th>Use</Table.Th>
                                                            <Table.Th>Name</Table.Th>
                                                            <Table.Th>ID</Table.Th>
                                                            <Table.Th>Weight</Table.Th>
                                                        </Table.Tr>
                                                    </Table.Thead>
                                                    <Table.Tbody>
                                                        {filteredParticipants.map((participant) => (
                                                            <Table.Tr key={participant.id}>
                                                                <Table.Td>
                                                                    <Checkbox
                                                                        aria-label={`Include ${participant.name}`}
                                                                        checked={
                                                                            participant.enabled
                                                                        }
                                                                        disabled={spinning}
                                                                        onChange={(event) =>
                                                                            setParticipants(
                                                                                (current) =>
                                                                                    current.map(
                                                                                        (item) =>
                                                                                            item.id ===
                                                                                            participant.id
                                                                                                ? {
                                                                                                      ...item,
                                                                                                      enabled:
                                                                                                          event
                                                                                                              .currentTarget
                                                                                                              .checked,
                                                                                                  }
                                                                                                : item,
                                                                                    ),
                                                                            )
                                                                        }
                                                                    />
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    {participant.name}
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    {participant.externalId || "—"}
                                                                </Table.Td>
                                                                <Table.Td>
                                                                    {participant.weight}
                                                                </Table.Td>
                                                            </Table.Tr>
                                                        ))}
                                                    </Table.Tbody>
                                                </Table>
                                            </ScrollArea>
                                        </Card>
                                    </Grid.Col>

                                    <Grid.Col span={{ base: 12, md: 7 }}>
                                        <Card withBorder radius="lg" padding="lg">
                                            <Group justify="space-between" mb="md">
                                                <Group gap="xs">
                                                    <IconHistory size={22} />
                                                    <Text fw={700}>Winner history</Text>
                                                    <Badge variant="light">{results.length}</Badge>
                                                </Group>
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    leftSection={<IconDownload size={16} />}
                                                    onClick={exportHistory}
                                                    disabled={results.length === 0}
                                                >
                                                    Export CSV
                                                </Button>
                                            </Group>
                                            {results.length === 0 ? (
                                                <Paper withBorder p="xl" radius="md">
                                                    <Text c="dimmed" ta="center">
                                                        Winners will appear here after each spin.
                                                    </Text>
                                                </Paper>
                                            ) : (
                                                <Table.ScrollContainer minWidth={650}>
                                                    <Table striped withTableBorder>
                                                        <Table.Thead>
                                                            <Table.Tr>
                                                                <Table.Th>#</Table.Th>
                                                                <Table.Th>Prize</Table.Th>
                                                                <Table.Th>Winner</Table.Th>
                                                                <Table.Th>ID</Table.Th>
                                                                <Table.Th>Drawn at</Table.Th>
                                                            </Table.Tr>
                                                        </Table.Thead>
                                                        <Table.Tbody>
                                                            {[...results]
                                                                .reverse()
                                                                .map((result, index) => (
                                                                    <Table.Tr key={result.id}>
                                                                        <Table.Td>
                                                                            {results.length - index}
                                                                        </Table.Td>
                                                                        <Table.Td>
                                                                            <Badge
                                                                                color={
                                                                                    result.prizeColor
                                                                                }
                                                                            >
                                                                                {result.prizeName}
                                                                            </Badge>
                                                                        </Table.Td>
                                                                        <Table.Td fw={600}>
                                                                            {result.participantName}
                                                                        </Table.Td>
                                                                        <Table.Td>
                                                                            {result.participantExternalId ||
                                                                                "—"}
                                                                        </Table.Td>
                                                                        <Table.Td>
                                                                            {new Date(
                                                                                result.drawnAt,
                                                                            ).toLocaleString()}
                                                                        </Table.Td>
                                                                    </Table.Tr>
                                                                ))}
                                                        </Table.Tbody>
                                                    </Table>
                                                </Table.ScrollContainer>
                                            )}
                                        </Card>
                                    </Grid.Col>
                                </Grid>
                            </>
                        )}
                    </Tabs.Panel>
                </Tabs>
            </Container>

            <Modal
                opened={winnerModalOpen}
                onClose={() => setWinnerModalOpen(false)}
                centered
                size="lg"
                title="We have a winner!"
            >
                {lastWinner && (
                    <Paper className={classes.resultCard} withBorder p="xl" radius="lg" ta="center">
                        <IconTrophy
                            size={58}
                            color={`var(--mantine-color-${lastWinner.prizeColor}-6)`}
                        />
        
                        <Title
                            className={classes.winnerName}
                            order={2}
                            fz={{ base: 34, sm: 48 }}
                            mt="md"
                        >
                            {lastWinner.participantName}
                        </Title>
                        {lastWinner.participantExternalId && (
                            <Text c="dimmed" mt="xs">
                                ID: {lastWinner.participantExternalId}
                            </Text>
                        )}
                        <Button mt="xl" onClick={() => setWinnerModalOpen(false)}>
                            Continue
                        </Button>
                    </Paper>
                )}
            </Modal>

            <Modal
                opened={resetModalOpen}
                onClose={() => setResetModalOpen(false)}
                centered
                title="Reset lucky draw?"
            >
                <Text>
                    This removes participants, prizes, results, and any event saved on this device.
                </Text>
                <Group justify="flex-end" mt="lg">
                    <Button variant="default" onClick={() => setResetModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="red" leftSection={<IconTrash size={17} />} onClick={resetEvent}>
                        Reset everything
                    </Button>
                </Group>
            </Modal>

            <Modal
                opened={recoveryModalOpen}
                onClose={() => setRecoveryModalOpen(false)}
                centered
                closeOnClickOutside={false}
                title="Resume your saved lucky draw?"
            >
                <Text>
                    A draw saved on{" "}
                    {savedEvent ? new Date(savedEvent.savedAt).toLocaleString() : "this device"} is
                    available.
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                    {savedEvent?.participants.length ?? 0} participants and{" "}
                    {savedEvent?.results.length ?? 0} results
                </Text>
                <Group justify="space-between" mt="lg">
                    <Button variant="subtle" color="red" onClick={deleteSavedEvent}>
                        Delete saved event
                    </Button>
                    <Button onClick={resumeSavedEvent}>Resume event</Button>
                </Group>
            </Modal>
        </Box>
    );
}

export default LuckyDraw;
