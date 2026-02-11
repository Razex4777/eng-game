import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFullscreen Hook
 * Manages fullscreen state and toggle functionality
 */
export const useFullscreen = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);

    return { isFullscreen, toggleFullscreen };
};

/**
 * useDarkMode Hook
 * Manages dark mode state with localStorage persistence
 */
export const useDarkMode = (defaultValue = false) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('darkMode');
            return saved ? JSON.parse(saved) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

        // Apply to document
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    return { isDarkMode, setIsDarkMode, toggleDarkMode };
};

/**
 * useToast Hook
 * Manages toast notification state
 */
export const useToast = (duration = 3500) => {
    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: 'info',
        icon: null
    });
    const timerRef = useRef(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const showToast = useCallback((message, type = 'info', icon = null) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast({ visible: true, message, type, icon });
        timerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
            timerRef.current = null;
        }, duration);
    }, [duration]);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    return { toast, showToast, hideToast };
};

/**
 * useLocalStorage Hook
 * Syncs state with localStorage
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

/**
 * useAudioMute Hook
 * Manages audio mute state
 */
export const useAudioMute = () => {
    const [isMuted, setIsMuted] = useLocalStorage('audioMuted', false);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, [setIsMuted]);

    return { isMuted, setIsMuted, toggleMute };
};

// Default export for the main hook index
export { default as useGameLogic } from './useGameLogic';
