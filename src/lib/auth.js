import { supabase } from './supabase';

/**
 * Authentication service for the game
 * Handles Google OAuth, session management, and user profiles
 */

/**
 * Sign in with Google OAuth
 * Opens a popup for Google authentication
 */
export const signInWithGoogle = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });

        if (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('signInWithGoogle error:', error);
        return { data: null, error };
    }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear local storage
        localStorage.removeItem('user_registered');
        localStorage.removeItem('user_name');

        return { error: null };
    } catch (error) {
        console.error('signOut error:', error);
        return { error };
    }
};

/**
 * Get the current session
 */
export const getSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { session, error: null };
    } catch (error) {
        console.error('getSession error:', error);
        return { session: null, error };
    }
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { user, error: null };
    } catch (error) {
        console.error('getCurrentUser error:', error);
        return { user: null, error };
    }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Called when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
    try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                callback(event, session);
            }
        );
        return () => subscription.unsubscribe();
    } catch (error) {
        console.error('[Auth] Failed to subscribe to auth state changes:', error);
        return () => { };
    }
};

/**
 * Get or create user in the users table
 * Uses the existing users table schema with auth_id
 */
export const getOrCreateProfile = async (authUser) => {
    if (!authUser) return { profile: null, error: 'No user provided' };

    try {
        // First, check if user exists by auth_id
        const { data: existing, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if (existing) {
            // Update last login
            await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('auth_id', authUser.id);

            return { profile: existing, error: null };
        }

        // Create new user
        const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;

        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                auth_id: authUser.id,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'لاعب',
                avatar_url: avatarUrl,
                user_type: 'google',
                current_level: 1,
                total_xp: 0,
                completed_stages: 0,
                total_stars: 0,
                accuracy: 0,
                total_play_time: 0,
                current_streak: 0,
                max_streak: 0,
                is_demo_completed: false,
                daily_questions_completed: 0,
                daily_stages_completed: 0,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                last_active_date: new Date().toISOString().split('T')[0],
                last_daily_reset: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('Create user error:', createError);
            // User might exist, try fetching again by email
            const { data: retryUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', authUser.email)
                .single();

            if (retryUser) {
                // Link auth_id to existing user
                const { data: updated, error: linkError } = await supabase
                    .from('users')
                    .update({ auth_id: authUser.id, last_login: new Date().toISOString() })
                    .eq('id', retryUser.id)
                    .select()
                    .single();

                if (linkError) throw linkError;
                return { profile: updated, error: null };
            }
            throw createError;
        }

        return { profile: newUser, error: null };
    } catch (error) {
        console.error('getOrCreateProfile error:', error);
        return { profile: null, error };
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('auth_id', userId)
            .select()
            .single();

        if (error) throw error;
        return { profile: data, error: null };
    } catch (error) {
        console.error('updateProfile error:', error);
        return { profile: null, error };
    }
};

/**
 * Get user stats
 */
export const getUserStats = async (authId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('current_level, total_xp, completed_stages, total_stars, accuracy, current_streak, max_streak, daily_questions_completed, daily_stages_completed')
            .eq('auth_id', authId)
            .single();

        if (error) throw error;
        return { stats: data, error: null };
    } catch (error) {
        console.error('getUserStats error:', error);
        return { stats: null, error };
    }
};

export default {
    signInWithGoogle,
    signOut,
    getSession,
    getCurrentUser,
    onAuthStateChange,
    getOrCreateProfile,
    updateProfile,
    getUserStats
};
