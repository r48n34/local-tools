import assert from "node:assert/strict";
import test from "node:test";
import type { VideoExportClip, VideoExportSettings } from "../src/types/videoEditor.ts";
import { buildVideoExportCommand } from "../src/utils/videoEditorUtils.ts";

const baseClip: VideoExportClip = {
    inputPath: "/input/clip-0.mp4",
    duration: 10,
    trimStart: 1,
    trimEnd: 8.5,
    rotation: 0,
    muted: false,
    hasAudio: true,
};

const presets: VideoExportSettings[] = [
    { width: 1280, height: 720, label: "720p landscape" },
    { width: 1920, height: 1080, label: "1080p landscape" },
    { width: 720, height: 1280, label: "720p portrait" },
    { width: 1080, height: 1920, label: "1080p portrait" },
];

test("builds scale and padding filters for every output preset", () => {
    for (const preset of presets) {
        const command = buildVideoExportCommand([baseClip], preset);
        const filter = command[command.indexOf("-filter_complex") + 1];
        assert.match(filter, new RegExp(`scale=${preset.width}:${preset.height}`));
        assert.match(filter, new RegExp(`pad=${preset.width}:${preset.height}`));
        assert.match(filter, /concat=n=1:v=1:a=1/);
    }
});

test("combines trims, rotations, source audio, and generated silence", () => {
    const second: VideoExportClip = {
        ...baseClip,
        inputPath: "/input/clip-1.webm",
        trimStart: 0.25,
        trimEnd: 3,
        rotation: 90,
        muted: true,
        hasAudio: true,
    };
    const third: VideoExportClip = {
        ...baseClip,
        inputPath: "/input/clip-2.mov",
        trimStart: 0,
        trimEnd: 2,
        rotation: 180,
        muted: false,
        hasAudio: false,
    };
    const command = buildVideoExportCommand([baseClip, second, third], presets[0]);
    const filter = command[command.indexOf("-filter_complex") + 1];

    assert.equal(
        command.filter((value) => value === "anullsrc=channel_layout=stereo:sample_rate=48000")
            .length,
        2,
    );
    assert.match(filter, /trim=start=1:end=8.5/);
    assert.match(filter, /transpose=clock/);
    assert.match(filter, /hflip,vflip/);
    assert.match(filter, /concat=n=3:v=1:a=1\[vout\]\[aout\]/);
    assert.equal(command.at(-1), "/output.mp4");
    assert.ok(command.includes("libx264"));
    assert.ok(command.includes("aac"));
});

test("rejects an empty timeline", () => {
    assert.throws(() => buildVideoExportCommand([], presets[0]), /At least one video clip/);
});
