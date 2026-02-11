/**
 * Messages Service
 * Fetches encouragement messages from Supabase
 */

import { supabase } from '../lib/supabase';

// Cache for messages to avoid repeated fetches
let cachedMessages = null;

/**
 * Fetch encouragement messages from Supabase
 * @returns {Promise<{messages: Object|null, error: Error|null}>}
 */
export const fetchEncouragementMessages = async () => {
    // Return cached messages if available
    if (cachedMessages) {
        return { messages: cachedMessages, error: null };
    }

    try {
        const { data, error } = await supabase
            .from('encouragement_messages')
            .select('*')
            .eq('is_active', true);

        if (error) throw error;

        // Group messages by type
        cachedMessages = {
            correct: data.filter(m => m.type === 'correct').map(m => m.message),
            wrong: data.filter(m => m.type === 'wrong').map(m => m.message),
            streak: data.filter(m => m.type === 'streak').map(m => m.message),
            combo: data.filter(m => m.type === 'combo').map(m => m.message)
        };

        return { messages: cachedMessages, error: null };
    } catch (error) {
        console.error('Error fetching encouragement messages:', error);
        return { messages: null, error };
    }
};

/**
 * Clear the message cache (useful for refreshing)
 */
export const clearMessageCache = () => {
    cachedMessages = null;
};

/**
 * Get a random correct answer message
 * @param {Object} messages - Cached messages object
 * @returns {string} Random correct message
 */
export const getRandomCorrectMessage = (messages) => {
    const correctMessages = messages?.correct || cachedMessages?.correct;
    if (!correctMessages?.length) return '👏 صحيح!';
    return correctMessages[Math.floor(Math.random() * correctMessages.length)];
};

/**
 * Get a random wrong answer message
 * @param {Object} messages - Cached messages object
 * @returns {string} Random wrong message
 */
export const getRandomWrongMessage = (messages) => {
    const wrongMessages = messages?.wrong || cachedMessages?.wrong;
    if (!wrongMessages?.length) return '😅 حاول مرة ثانية!';
    return wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
};

/**
 * Get streak message based on streak count
 * @param {number} streakCount - Current streak count
 * @param {Object} messages - Cached messages object
 * @returns {string} Streak message
 */
export const getStreakMessage = (streakCount, messages) => {
    streakCount = Math.max(1, streakCount);
    const streakMessages = messages?.streak || cachedMessages?.streak;
    if (!streakMessages?.length) {
        // Fallback streak messages
        const fallback = ['🔥🔥 ON FIRE!', '⚡ UNSTOPPABLE!', '💪 GODLIKE!', '🌟 LEGEND!'];
        const index = Math.min(Math.floor((streakCount - 1) / 3), fallback.length - 1);
        return fallback[index];
    }
    const index = Math.min(Math.floor((streakCount - 1) / 3), streakMessages.length - 1);
    return streakMessages[index];
};

/**
 * Get combo message
 * @param {number} combo - Current combo count
 * @param {Object} messages - Cached messages object
 * @returns {string|null} Combo message or null
 */
export const getComboMessage = (combo, messages) => {
    if (combo < 2) return null;

    const comboMessages = messages?.combo || cachedMessages?.combo;
    if (!comboMessages?.length) {
        // Fallback combo messages
        if (combo >= 5) return '👑 MEGA COMBO x5!';
        if (combo >= 4) return '💎 Combo x4!';
        if (combo >= 3) return '⚡ Combo x3!';
        if (combo >= 2) return '🔥 Combo x2!';
        return null;
    }

    const index = Math.min(combo - 2, comboMessages.length - 1);
    return comboMessages[index];
};

/**
 * Get final countdown message for remaining questions
 * @param {number} remaining - Remaining questions
 * @returns {string|null} Countdown message or null
 */
export const getFinalCountdownMessage = (remaining) => {
    const countdownMessages = {
        3: "يلا يا وحش 💪 باقيلك 3 بس!",
        2: "ركز أبو جاسم 😎 بعد سؤالين وتخلص!",
        1: "هاي الأخيرة 🔥 لا تضيّعها!"
    };
    return countdownMessages[remaining] || null;
};

export default {
    fetchEncouragementMessages,
    clearMessageCache,
    getRandomCorrectMessage,
    getRandomWrongMessage,
    getStreakMessage,
    getComboMessage,
    getFinalCountdownMessage
};
