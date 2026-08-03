import type {
    VideoClip,
    VideoExportClip,
    VideoExportSettings,
    VideoRotation,
} from "../types/videoEditor.ts";

const MINIMUM_CLIP_DURATION = 0.1;

function waitForVideoEvent(video: HTMLVideoElement, eventName: "loadedmetadata" | "seeked") {
    return new Promise<void>((resolve, reject) => {
        const handleSuccess = () => {
            cleanup();
            resolve();
        };
        const handleError = () => {
            cleanup();
            reject(new Error("This video cannot be read by your browser"));
        };
        const cleanup = () => {
            video.removeEventListener(eventName, handleSuccess);
            video.removeEventListener("error", handleError);
        };

        video.addEventListener(eventName, handleSuccess, { once: true });
        video.addEventListener("error", handleError, { once: true });
    });
}

async function createVideoThumbnail(video: HTMLVideoElement, duration: number) {
    video.currentTime = Math.min(1, duration / 2);
    await waitForVideoEvent(video, "seeked");

    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 320 / video.videoWidth);
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) {
        return "";
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp"));
    return blob ? URL.createObjectURL(blob) : "";
}

export async function createVideoClip(file: File): Promise<VideoClip> {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = objectUrl;

    try {
        await waitForVideoEvent(video, "loadedmetadata");
        if (!Number.isFinite(video.duration) || video.duration < MINIMUM_CLIP_DURATION) {
            throw new Error("The video has no usable duration");
        }

        return {
            id: crypto.randomUUID(),
            file,
            name: file.name,
            objectUrl,
            thumbnailUrl: await createVideoThumbnail(video, video.duration),
            duration: video.duration,
            trimStart: 0,
            trimEnd: video.duration,
            rotation: 0,
            muted: false,
            width: video.videoWidth,
            height: video.videoHeight,
        };
    } catch (error) {
        URL.revokeObjectURL(objectUrl);
        throw error;
    } finally {
        video.removeAttribute("src");
        video.load();
    }
}

export function disposeVideoClip(clip: VideoClip) {
    URL.revokeObjectURL(clip.objectUrl);
    if (clip.thumbnailUrl) {
        URL.revokeObjectURL(clip.thumbnailUrl);
    }
}

export function nextVideoRotation(rotation: VideoRotation): VideoRotation {
    return ((rotation + 90) % 360) as VideoRotation;
}

function decimal(value: number) {
    return Number(value.toFixed(3)).toString();
}

function rotationFilter(rotation: VideoRotation) {
    if (rotation === 90) {
        return ",transpose=clock";
    }
    if (rotation === 180) {
        return ",hflip,vflip";
    }
    if (rotation === 270) {
        return ",transpose=cclock";
    }
    return "";
}

export function buildVideoExportCommand(
    clips: VideoExportClip[],
    settings: VideoExportSettings,
    outputPath = "/output.mp4",
) {
    if (clips.length === 0) {
        throw new Error("At least one video clip is required");
    }

    const args: string[] = [];
    clips.forEach((clip) => args.push("-i", clip.inputPath));

    let nextInputIndex = clips.length;
    const audioInputIndexes = clips.map((clip, index) => {
        if (clip.hasAudio && !clip.muted) {
            return index;
        }

        const inputIndex = nextInputIndex;
        nextInputIndex += 1;
        args.push(
            "-f",
            "lavfi",
            "-t",
            decimal(clip.trimEnd - clip.trimStart),
            "-i",
            "anullsrc=channel_layout=stereo:sample_rate=48000",
        );
        return inputIndex;
    });

    const filters: string[] = [];
    clips.forEach((clip, index) => {
        const start = decimal(clip.trimStart);
        const end = decimal(clip.trimEnd);
        filters.push(
            `[${index}:v:0]trim=start=${start}:end=${end},setpts=PTS-STARTPTS${rotationFilter(clip.rotation)},scale=${settings.width}:${settings.height}:force_original_aspect_ratio=decrease,pad=${settings.width}:${settings.height}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p[v${index}]`,
        );

        if (clip.hasAudio && !clip.muted) {
            filters.push(
                `[${index}:a:0]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS,aresample=48000[a${index}]`,
            );
        } else {
            filters.push(
                `[${audioInputIndexes[index]}:a:0]asetpts=PTS-STARTPTS,aresample=48000[a${index}]`,
            );
        }
    });

    const concatInputs = clips.map((_, index) => `[v${index}][a${index}]`).join("");
    filters.push(`${concatInputs}concat=n=${clips.length}:v=1:a=1[vout][aout]`);

    args.push(
        "-filter_complex",
        filters.join(";"),
        "-map",
        "[vout]",
        "-map",
        "[aout]",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        outputPath,
    );

    return args;
}
