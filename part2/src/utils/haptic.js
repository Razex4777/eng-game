/**
 * Trigger device haptic feedback
 * @param {number} duration - Vibration duration in ms
 */
export const triggerHaptic = (duration = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
    }
};
