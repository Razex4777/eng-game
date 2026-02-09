import { supabase } from '../lib/supabase';

/**
 * Game Settings Service
 * Handles CRUD operations for user game preferences stored in Supabase
 */

// Default settings for new users
const DEFAULT_SETTINGS = {
    speed_mode: 'teen',
    is_muted: false,
    is_dark_mode: false,
    base_speed: 2000
};

/**
 * Get game settings for the current authenticated user
 * Creates default settings if none exist
 */
export const getGameSettings = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Return default settings for non-authenticated users
            return { data: DEFAULT_SETTINGS, error: null };
        }

        const { data, error } = await supabase
            .from('game_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // No settings found, create default settings
            const newSettings = await createGameSettings(user.id);
            return newSettings;
        }

        if (error) {
            console.error('Error fetching game settings:', error);
            return { data: DEFAULT_SETTINGS, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Exception in getGameSettings:', err);
        return { data: DEFAULT_SETTINGS, error: err };
    }
};

/**
 * Create default game settings for a user
 */
export const createGameSettings = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('game_settings')
            .insert({
                user_id: userId,
                ...DEFAULT_SETTINGS
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating game settings:', error);
            return { data: DEFAULT_SETTINGS, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Exception in createGameSettings:', err);
        return { data: DEFAULT_SETTINGS, error: err };
    }
};

/**
 * Update game settings for the current user
 * @param {Object} settings - Settings to update (partial update supported)
 */
export const updateGameSettings = async (settings) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // For non-authenticated users, just return the settings
            return { data: settings, error: null };
        }

        const { data, error } = await supabase
            .from('game_settings')
            .upsert({
                user_id: user.id,
                ...settings
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating game settings:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Exception in updateGameSettings:', err);
        return { data: null, error: err };
    }
};

/**
 * Update speed mode only
 */
export const updateSpeedMode = async (speedMode) => {
    return updateGameSettings({ speed_mode: speedMode });
};

/**
 * Update mute setting only
 */
export const updateMuteSetting = async (isMuted) => {
    return updateGameSettings({ is_muted: isMuted });
};

/**
 * Update dark mode setting only
 */
export const updateDarkModeSetting = async (isDarkMode) => {
    return updateGameSettings({ is_dark_mode: isDarkMode });
};

/**
 * Update base speed (fall duration in ms)
 */
export const updateBaseSpeed = async (baseSpeed) => {
    return updateGameSettings({ base_speed: baseSpeed });
};

/**
 * Speed mode configurations with multipliers
 * Base speed is 2000ms, multiplier scales it
 * Higher multiplier = more time = slower/easier
 */
export const SPEED_MODES = {
    baby: {
        id: 'baby',
        multiplier: 6, // 12 seconds - Very slow, lots of time
        label: 'وضع الرضيع 👶',
        shortLabel: 'وضع الرضيع',
        desc: 'رحلة الألف ميل تبدأ بخطوة',
        color: 'bg-blue-100 text-blue-600',
        border: 'border-blue-200',
        emoji: '👶'
    },
    teen: {
        id: 'teen',
        multiplier: 4, // 8 seconds - Normal comfortable pace
        label: 'فتى (متوسط) 👱',
        shortLabel: 'فتى',
        desc: 'للناس اللي قطعت شوط (هرولة)',
        color: 'bg-orange-100 text-orange-600',
        border: 'border-orange-200',
        emoji: '👱'
    },
    beast: {
        id: 'beast',
        multiplier: 2.5, // 5 seconds - Challenging but doable
        label: 'وضع الوحش 👹',
        shortLabel: 'وضع الوحش',
        desc: 'للأبطال اللي يمشون ميل ميل!',
        color: 'bg-red-100 text-red-600',
        border: 'border-red-200',
        emoji: '👹'
    },
    insane: {
        id: 'insane',
        multiplier: 1.5, // 3 seconds - Really fast, hardcore
        label: 'مجنون 🤯',
        shortLabel: 'مجنون',
        desc: 'للي ما يعرف الخوف!',
        color: 'bg-purple-100 text-purple-600',
        border: 'border-purple-200',
        emoji: '🤯'
    }
};

/**
 * Get the effective fall speed based on base speed and mode
 */
export const getEffectiveFallSpeed = (baseSpeed, speedMode) => {
    const mode = SPEED_MODES[speedMode] || SPEED_MODES.teen;
    return baseSpeed * mode.multiplier;
};
