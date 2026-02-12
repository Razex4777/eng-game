/**
 * Guest Service
 * Manages guest session lifecycle: ID generation, localStorage persistence,
 * and optional Supabase tracking via the guest_sessions table.
 */
import { supabase } from '../lib/supabase';

const GUEST_ID_KEY = 'guest_id';
const GUEST_MODE_KEY = 'is_guest';
const GUEST_NAME_KEY = 'guest_name';

/**
 * Generate a UUID-style guest identifier
 */
const generateGuestId = () => {
    return 'guest_' + crypto.randomUUID();
};

/**
 * Get existing guest ID or create a new one
 * @returns {string} The guest identifier
 */
export const getOrCreateGuestId = () => {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = generateGuestId();
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
};

/**
 * Enter guest mode — sets localStorage flags and returns a guest profile object
 * @returns {{ guestId: string, name: string, isGuest: true }}
 */
export const enterGuestMode = () => {
    const guestId = getOrCreateGuestId();
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    localStorage.setItem(GUEST_NAME_KEY, 'ضيف');

    return {
        guestId,
        name: 'ضيف',
        isGuest: true
    };
};

/**
 * Check if the app is currently in guest mode
 * @returns {boolean}
 */
export const isGuestMode = () => {
    return localStorage.getItem(GUEST_MODE_KEY) === 'true';
};

/**
 * Save a game session result for a guest user
 * @param {string} guestId
 * @param {object} sessionData - { subject, question_type, part_number, score, ... }
 */
export const saveGuestSession = async (guestId, sessionData) => {
    if (!guestId) return { error: 'No guest ID' };

    try {
        const { data, error } = await supabase
            .from('guest_sessions')
            .insert({
                guest_id: guestId,
                subject: sessionData.subject || 'english',
                question_type: sessionData.question_type || 'chapters',
                part_number: sessionData.part_number || 1,
                score: sessionData.score || 0,
                questions_answered: sessionData.questions_answered || 0,
                questions_correct: sessionData.questions_correct || 0,
                questions_wrong: sessionData.questions_wrong || 0,
                accuracy: sessionData.accuracy || 0,
                duration_seconds: sessionData.duration_seconds || 0,
                max_combo: sessionData.max_combo || 0,
                won: sessionData.won || false
            });

        if (error) {
            console.error('[GuestService] Error saving session:', error);
        }
        return { data, error };
    } catch (error) {
        console.error('[GuestService] saveGuestSession error:', error);
        return { data: null, error };
    }
};

/**
 * Clear all guest data from localStorage
 * Used when guest signs out or upgrades to a real account
 */
export const clearGuestData = () => {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_MODE_KEY);
    localStorage.removeItem(GUEST_NAME_KEY);
};

export default {
    getOrCreateGuestId,
    enterGuestMode,
    isGuestMode,
    saveGuestSession,
    clearGuestData
};
