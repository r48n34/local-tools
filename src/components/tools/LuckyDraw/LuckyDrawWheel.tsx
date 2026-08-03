import { Box, Text } from "@mantine/core";
import { useEffect, useMemo, useRef } from "react";
import type { LuckyDrawPalette, LuckyDrawParticipant } from "../../../types/luckyDraw";
import { createWheelSegments, WHEEL_PALETTES } from "../../../utils/luckyDrawUtils";
import classes from "../../../pages/tools/LuckyDraw.module.css";

type LuckyDrawWheelProps = {
    participants: LuckyDrawParticipant[];
    rotation: number;
    durationSeconds: number;
    spinning: boolean;
    palette: LuckyDrawPalette;
    reducedMotion: boolean;
};

function drawWheel(
    canvas: HTMLCanvasElement,
    participants: LuckyDrawParticipant[],
    palette: LuckyDrawPalette,
) {
    const bounds = canvas.getBoundingClientRect();
    const size = Math.max(280, Math.floor(Math.min(bounds.width, bounds.height || bounds.width)));
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    context.scale(ratio, ratio);
    const center = size / 2;
    const radius = center - 8;
    context.clearRect(0, 0, size, size);

    if (participants.length === 0) {
        context.beginPath();
        context.arc(center, center, radius, 0, Math.PI * 2);
        context.fillStyle = "#dee2e6";
        context.fill();
        context.strokeStyle = "#868e96";
        context.lineWidth = 4;
        context.stroke();
        return;
    }

    const colors = WHEEL_PALETTES[palette];
    const segments = createWheelSegments(participants);
    for (const [index, segment] of segments.entries()) {
        const start = (segment.startDegrees * Math.PI) / 180;
        const end = (segment.endDegrees * Math.PI) / 180;
        const angleSize = segment.endDegrees - segment.startDegrees;

        context.beginPath();
        context.moveTo(center, center);
        context.arc(center, center, radius, start, end);
        context.closePath();
        context.fillStyle = colors[index % colors.length];
        context.fill();
        context.strokeStyle = "rgba(255, 255, 255, 0.72)";
        context.lineWidth = participants.length > 120 ? 0.3 : 1.5;
        context.stroke();

        if (angleSize >= 5 && participants.length <= 120) {
            const middle = (start + end) / 2;
            const label =
                segment.participant.name.length > 22
                    ? `${segment.participant.name.slice(0, 20)}…`
                    : segment.participant.name;
            context.save();
            context.translate(center, center);
            context.rotate(middle);
            context.textAlign = "right";
            context.textBaseline = "middle";
            context.fillStyle = "#ffffff";
            context.font = `600 ${angleSize < 10 ? 10 : 12}px system-ui, sans-serif`;
            context.shadowColor = "rgba(0, 0, 0, 0.65)";
            context.shadowBlur = 2;
            context.fillText(label, radius - 16, 0, Math.max(44, radius * 0.5));
            context.restore();
        }
    }

    context.beginPath();
    context.arc(center, center, Math.max(24, radius * 0.12), 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.strokeStyle = "#343a40";
    context.lineWidth = 4;
    context.stroke();
}

function LuckyDrawWheel({
    participants,
    rotation,
    durationSeconds,
    spinning,
    palette,
    reducedMotion,
}: LuckyDrawWheelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const participantSignature = useMemo(
        () =>
            participants.map((participant) => `${participant.id}:${participant.weight}`).join("|"),
        [participants],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const render = () => drawWheel(canvas, participants, palette);
        render();
        const observer = new ResizeObserver(render);
        observer.observe(canvas);
        return () => observer.disconnect();
    }, [palette, participantSignature, participants]);

    return (
        <Box className={classes.wheelStage}>
            <Box className={classes.pointer} aria-hidden="true" />
            <canvas
                ref={canvasRef}
                className={classes.wheelCanvas}
                aria-label={`Lucky draw wheel with ${participants.length} eligible participants`}
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition:
                        spinning && !reducedMotion
                            ? `transform ${durationSeconds}s cubic-bezier(0.12, 0.72, 0.08, 1)`
                            : "none",
                }}
            />
            {participants.length === 0 && (
                <Text className={classes.emptyWheelText} fw={600} ta="center">
                    Import participants to begin
                </Text>
            )}
        </Box>
    );
}

export default LuckyDrawWheel;
