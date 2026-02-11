/**
 * Audio Manager - Web Audio API utilities for game sounds
 */

// Audio context (created lazily on first user interaction)
let audioContext = null;

/**
 * Initialize the audio context (must be called after user interaction)
 */
export const initAudio = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Play a beep sound with customizable frequency and duration
 */
export const playBeep = async (frequency = 440, duration = 0.1, type = 'sine', volume = 0.3) => {
    try {
        const ctx = initAudio();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
        console.warn('Audio playback failed:', error);
    }
};

/**
 * Play correct answer sound - cheerful ascending tone
 */
export const playCorrectSound = () => {
    playBeep(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => playBeep(659.25, 0.1, 'sine', 0.3), 100); // E5
    setTimeout(() => playBeep(783.99, 0.15, 'sine', 0.3), 200); // G5
};

/**
 * Play wrong answer sound - descending error tone
 */
export const playWrongSound = () => {
    playBeep(311.13, 0.15, 'sawtooth', 0.2); // Eb4
    setTimeout(() => playBeep(233.08, 0.2, 'sawtooth', 0.2), 150); // Bb3
};

/**
 * Play combo sound - exciting ascending arpeggio
 */
export const playComboSound = (comboLevel = 1) => {
    const baseFreq = 400 + (comboLevel * 50);
    playBeep(baseFreq, 0.08, 'square', 0.2);
    setTimeout(() => playBeep(baseFreq * 1.25, 0.08, 'square', 0.2), 60);
    setTimeout(() => playBeep(baseFreq * 1.5, 0.08, 'square', 0.2), 120);
    setTimeout(() => playBeep(baseFreq * 2, 0.15, 'square', 0.25), 180);
};

/**
 * Play power-up activation sound
 */
export const playPowerUpSound = () => {
    playBeep(440, 0.05, 'sine', 0.3);
    setTimeout(() => playBeep(554.37, 0.05, 'sine', 0.3), 50);
    setTimeout(() => playBeep(659.25, 0.05, 'sine', 0.3), 100);
    setTimeout(() => playBeep(880, 0.1, 'sine', 0.35), 150);
};

/**
 * Play freeze power-up sound - icy crystalline effect
 */
export const playFreezeSound = () => {
    playBeep(880, 0.1, 'triangle', 0.2);
    setTimeout(() => playBeep(1046.5, 0.1, 'triangle', 0.2), 80);
    setTimeout(() => playBeep(1318.5, 0.15, 'triangle', 0.25), 160);
};

/**
 * Play bomb power-up sound - explosive effect
 */
export const playBombSound = () => {
    playBeep(100, 0.3, 'sawtooth', 0.4);
    setTimeout(() => playBeep(60, 0.3, 'sawtooth', 0.3), 100);
};

/**
 * Play button click sound
 */
export const playClickSound = () => {
    playBeep(600, 0.05, 'sine', 0.15);
};

/**
 * Play game over sound
 */
export const playGameOverSound = () => {
    playBeep(392, 0.2, 'sine', 0.3); // G4
    setTimeout(() => playBeep(349.23, 0.2, 'sine', 0.25), 200); // F4
    setTimeout(() => playBeep(329.63, 0.2, 'sine', 0.2), 400); // E4
    setTimeout(() => playBeep(261.63, 0.4, 'sine', 0.3), 600); // C4
};

/**
 * Play victory sound
 */
export const playVictorySound = () => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C (octave higher)
    notes.forEach((freq, i) => {
        setTimeout(() => playBeep(freq, 0.15, 'sine', 0.3), i * 150);
    });
    setTimeout(() => {
        playBeep(783.99, 0.3, 'sine', 0.35);
        playBeep(1046.50, 0.3, 'sine', 0.35);
    }, 600);
};

/**
 * Play countdown tick sound
 */
export const playTickSound = () => {
    playBeep(1000, 0.03, 'square', 0.1);
};

/**
 * Play streak sound
 */
export const playStreakSound = (streakLevel = 1) => {
    const baseFreq = 500 + (streakLevel * 100);
    playBeep(baseFreq, 0.1, 'triangle', 0.25);
    setTimeout(() => playBeep(baseFreq * 1.5, 0.15, 'triangle', 0.3), 100);
};

export default {
    initAudio,
    playBeep,
    playCorrectSound,
    playWrongSound,
    playComboSound,
    playPowerUpSound,
    playFreezeSound,
    playBombSound,
    playClickSound,
    playGameOverSound,
    playVictorySound,
    playTickSound,
    playStreakSound
};
