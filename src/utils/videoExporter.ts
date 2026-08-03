import type {
    VideoClip,
    VideoExportClip,
    VideoExportPhase,
    VideoExportSettings,
} from "../types/videoEditor.ts";
import { buildVideoExportCommand } from "./videoEditorUtils.ts";

const CORE_URL = "/ffmpeg/ffmpeg-core.js";
const WASM_URL = "/ffmpeg/ffmpeg-core.wasm";

function extensionFor(file: File) {
    const extension = file.name.match(/\.[a-zA-Z0-9]+$/)?.[0];
    return extension || ".video";
}

function abortError() {
    return new DOMException("Video export was cancelled", "AbortError");
}

export async function exportVideo(
    clips: VideoClip[],
    settings: VideoExportSettings,
    onPhase: (phase: VideoExportPhase) => void,
    signal: AbortSignal,
) {
    const { FFmpeg, FFFSType } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();
    let mounted = false;
    const outputPath = "/output.mp4";
    const handleAbort = () => ffmpeg.terminate();
    signal.addEventListener("abort", handleAbort, { once: true });

    try {
        onPhase("loading");
        await ffmpeg.load({ coreURL: CORE_URL, wasmURL: WASM_URL }, { signal });
        if (signal.aborted) {
            throw abortError();
        }

        onPhase("preparing");
        await ffmpeg.createDir("/input");
        const mountedFiles = clips.map(
            (clip, index) =>
                new File([clip.file], `clip-${index}${extensionFor(clip.file)}`, {
                    type: clip.file.type,
                }),
        );
        await ffmpeg.mount(FFFSType.WORKERFS, { files: mountedFiles }, "/input");
        mounted = true;

        const exportClips: VideoExportClip[] = [];
        for (const [index, clip] of clips.entries()) {
            const inputPath = `/input/${mountedFiles[index].name}`;
            const probePath = `/probe-${index}.json`;
            const exitCode = await ffmpeg.ffprobe(
                [
                    "-v",
                    "error",
                    "-select_streams",
                    "a",
                    "-show_entries",
                    "stream=codec_type",
                    "-of",
                    "json",
                    inputPath,
                    "-o",
                    probePath,
                ],
                -1,
                { signal },
            );
            const probeData = exitCode === 0 ? await ffmpeg.readFile(probePath, "utf8") : "";
            const hasAudio =
                typeof probeData === "string" &&
                probeData.length > 0 &&
                ((JSON.parse(probeData) as { streams?: unknown[] }).streams?.length ?? 0) > 0;
            await ffmpeg.deleteFile(probePath).catch(() => undefined);
            exportClips.push({
                inputPath,
                duration: clip.duration,
                trimStart: clip.trimStart,
                trimEnd: clip.trimEnd,
                rotation: clip.rotation,
                muted: clip.muted,
                hasAudio,
            });
        }

        onPhase("encoding");
        const exitCode = await ffmpeg.exec(
            buildVideoExportCommand(exportClips, settings, outputPath),
            -1,
            { signal },
        );
        if (signal.aborted) {
            throw abortError();
        }
        if (exitCode !== 0) {
            throw new Error("FFmpeg could not export this timeline");
        }

        const data = await ffmpeg.readFile(outputPath);
        if (typeof data === "string") {
            throw new Error("FFmpeg returned an invalid video file");
        }
        return new Blob([data.slice().buffer], { type: "video/mp4" });
    } finally {
        signal.removeEventListener("abort", handleAbort);
        if (!signal.aborted) {
            await ffmpeg.deleteFile(outputPath).catch(() => undefined);
            if (mounted) {
                await ffmpeg.unmount("/input").catch(() => undefined);
            }
            ffmpeg.terminate();
        }
    }
}
