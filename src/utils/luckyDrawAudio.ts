function tone(
    context: AudioContext,
    frequency: number,
    start: number,
    duration: number,
    volume: number,
) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
}

function playSequence(notes: Array<[number, number, number, number]>) {
    try {
        const context = new AudioContext();
        const now = context.currentTime;
        notes.forEach(([frequency, delay, duration, volume]) =>
            tone(context, frequency, now + delay, duration, volume),
        );
        window.setTimeout(() => void context.close(), 1400);
    } catch {
        // Sound is an enhancement; drawing continues if audio is unavailable.
    }
}

export function playSpinSound() {
    playSequence([
        [330, 0, 0.12, 0.08],
        [440, 0.1, 0.12, 0.08],
    ]);
}

export function playWinnerSound() {
    playSequence([
        [523.25, 0, 0.35, 0.12],
        [659.25, 0.18, 0.4, 0.12],
        [783.99, 0.38, 0.55, 0.14],
    ]);
}
