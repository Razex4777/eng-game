export const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
    }
};

export const hapticSuccess = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20, 10, 20]);
    }
};

export const hapticError = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
    }
};

export const hapticCombo = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([10, 10, 10, 10, 30]);
    }
};

export const hapticPowerUp = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
    }
};
