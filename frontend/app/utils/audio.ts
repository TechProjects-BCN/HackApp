// Simple "Ding" sound base64
// const notificationSound = "data:audio/wav;base64,..."; // Unused

let audioCtx: AudioContext | null = null;

export const playNotificationSound = () => {
    try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;

        // Singleton pattern: Reuse context to prevents main thread blocking from repeated creation
        if (!audioCtx) {
            audioCtx = new Ctx();
        }

        // Resume if suspended (browser autoplay policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // 500Hz
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1); // Slide up to 1000Hz

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);

        // No cleanup needed for nodes (GC handles disconnected nodes), 
        // and we intentionally keep the context open for performance.

    } catch (e) {
        // console.error("Audio play failed", e);
    }
};
