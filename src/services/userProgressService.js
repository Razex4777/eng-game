/**
 * User Progress Service
 * Handles all user progress, stats, streaks, and achievements
 */
import { supabase } from '../lib/supabase';

// ===============================================
// Dashboard Stats
// ===============================================

/**
 * Get user dashboard stats (main stats display)
 * Uses the Postgres function for optimized data fetching
 */
export const getUserDashboardStats = async (userId) => {
    if (!userId) return { data: null, error: 'No user ID' };

    const { data, error } = await supabase
        .rpc('get_user_dashboard_stats', { p_user_id: userId });

    if (error) {
        console.error('[userProgressService] Error getting dashboard stats:', error);
        return { data: null, error };
    }

    return { data, error: null };
};

/**
 * Get user stats directly from user_stats table
 */
export const getUserStats = async (userId) => {
    if (!userId) return { data: null, error: 'No user ID' };

    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('[userProgressService] Error getting user stats:', error);
        return { data: null, error };
    }

    return { data: data || getDefaultStats(), error: null };
};

/**
 * Initialize user stats (call when user first logs in)
 */
export const initializeUserStats = async (userId) => {
    if (!userId) return { error: 'No user ID' };

    const { data, error } = await supabase
        .from('user_stats')
        .upsert({
            user_id: userId,
            created_at: new Date().toISOString()
        }, {
            onConflict: 'user_id',
            ignoreDuplicates: true
        });

    if (error) {
        console.error('[userProgressService] Error initializing user stats:', error);
    }

    return { data, error };
};

// ===============================================
// Game Session Recording
// ===============================================

/**
 * Record a completed game session
 */
export const recordGameSession = async (userId, sessionData) => {
    if (!userId) return { data: null, error: 'No user ID' };

    const { data, error } = await supabase
        .from('game_sessions')
        .insert({
            user_id: userId,
            subject: sessionData.subject,
            question_type: sessionData.questionType || 'fullyear',
            part_number: sessionData.partNumber || 1,
            game_mode: sessionData.gameMode || 'monster',
            score: sessionData.score || 0,
            questions_total: sessionData.questionsTotal || 0,
            questions_correct: sessionData.questionsCorrect || 0,
            questions_wrong: sessionData.questionsWrong || 0,
            max_combo: sessionData.maxCombo || 0,
            max_streak: sessionData.maxStreak || 0,
            accuracy: sessionData.questionsTotal > 0
                ? (sessionData.questionsCorrect / sessionData.questionsTotal * 100).toFixed(2)
                : 0,
            xp_earned: sessionData.xpEarned || 0,
            duration_seconds: sessionData.durationSeconds || 0,
            completed: true,
            won: sessionData.won || false,
            ended_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('[userProgressService] Error recording game session:', error);
    }

    return { data, error };
};

/**
 * Update user stats after a game (uses Postgres function)
 */
export const updateStatsAfterGame = async (userId, gameData) => {
    if (!userId) return { data: null, error: 'No user ID' };

    const { data, error } = await supabase
        .rpc('update_user_stats_after_game', {
            p_user_id: userId,
            p_subject: gameData.subject,
            p_question_type: gameData.questionType || 'fullyear',
            p_part_number: gameData.partNumber || 1,
            p_score: gameData.score || 0,
            p_questions_correct: gameData.questionsCorrect || 0,
            p_questions_total: gameData.questionsTotal || 0,
            p_xp_earned: gameData.xpEarned || 0,
            p_duration_seconds: gameData.durationSeconds || 0,
            p_won: gameData.won || false
        });

    if (error) {
        console.error('[userProgressService] Error updating stats after game:', error);
    } else {
        console.log('[userProgressService] Stats updated:', data);
    }

    return { data, error };
};

// ===============================================
// Subject Progress
// ===============================================

/**
 * Get progress for a specific subject
 */
export const getSubjectProgress = async (userId, subject) => {
    if (!userId) return { data: null, error: 'No user ID' };

    const { data, error } = await supabase
        .from('user_stats')
        .select('subject_progress')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        return { data: null, error };
    }

    const progress = data?.subject_progress?.[subject] || {
        fullyear: { current_part: 1, last_completed: 0 },
        halfyear: { current_part: 1, last_completed: 0 },
        chapters: { current_part: 1, last_completed: 0 }
    };

    return { data: progress, error: null };
};

/**
 * Get the last played or first incomplete part for Continue Journey
 * Returns { subject, type, part, chapterNumber } or null
 *
 * Strategy:
 * 1. Check game_sessions for the most recent session
 * 2. If last session was won, return next part
 * 3. If last session was lost/incomplete, return same part
 * 4. If no sessions, return first part (chapters/1/1)
 */
export const getLastPlayedPart = async (userId, subject = 'english') => {
    if (!userId) return { data: null, error: 'No user ID' };

    try {
        // Get the most recent game session
        const { data: recentSession, error: sessionError } = await supabase
            .from('game_sessions')
            .select('subject, question_type, part_number, won, completed, created_at')
            .eq('user_id', userId)
            .eq('subject', subject)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (sessionError && sessionError.code !== 'PGRST116') {
            console.error('[getLastPlayedPart] Error fetching session:', sessionError);
        }

        // If no sessions found, start from the beginning
        if (!recentSession) {
            return {
                data: {
                    subject,
                    type: 'chapters',
                    part: 1,
                    chapterNumber: 1,
                    isFirstTime: true
                },
                error: null
            };
        }

        // Determine next part based on last session
        let nextPart = recentSession.part_number;
        let nextType = recentSession.question_type;

        // If last session was won and completed, advance to next part
        if (recentSession.won && recentSession.completed) {
            nextPart = recentSession.part_number + 1;
        }

        // For chapters mode, extract chapter number from part
        // Assuming parts are numbered sequentially across chapters
        // Chapter 1: parts 1-N, Chapter 2: parts N+1-M, etc.
        let chapterNumber = 1;
        if (nextType === 'chapters') {
            // Simple estimation: if we know chapters structure
            // For now, use part number to estimate chapter (can be refined)
            chapterNumber = Math.ceil(nextPart / 3); // Assuming ~3 parts per chapter
        }

        return {
            data: {
                subject: recentSession.subject,
                type: nextType,
                part: nextPart,
                chapterNumber,
                lastSessionWon: recentSession.won,
                isFirstTime: false
            },
            error: null
        };
    } catch (error) {
        console.error('[getLastPlayedPart] Unexpected error:', error);
        return { data: null, error };
    }
};

/**
 * Get overall progress percentage across all subjects
 */
export const getOverallProgress = async (userId) => {
    if (!userId) return { data: 0, error: 'No user ID' };

    const { data: stats, error } = await getUserStats(userId);
    if (error) return { data: 0, error };

    const subjectProgress = stats?.subject_progress || {};
    const subjects = Object.keys(subjectProgress);

    if (subjects.length === 0) return { data: 0, error: null };

    // Calculate average progress across all subjects
    let totalProgress = 0;
    subjects.forEach(subject => {
        const progress = subjectProgress[subject];
        const chaptersProgress = progress?.chapters?.current_part || 1;
        // Assuming 24 total parts across 8 chapters (3 parts each)
        const percentage = Math.min(100, ((chaptersProgress - 1) / 24) * 100);
        totalProgress += percentage;
    });

    return { data: Math.round(totalProgress / subjects.length), error: null };
};

/**
 * Calculate overall progress percentage for a subject
 */
export const calculateProgressPercent = (subjectProgress, maxParts = 12) => {
    if (!subjectProgress?.fullyear) return 0;
    const currentPart = subjectProgress.fullyear.current_part || 1;
    return Math.min(100, Math.round(((currentPart - 1) / maxParts) * 100));
};

// ===============================================
// Streak Management
// ===============================================

/**
 * Check and update streak on app open
 */
export const checkAndUpdateStreak = async (userId) => {
    if (!userId) return { streak: 0/*, wasUpdated: false*/ };

    const { data: stats } = await getUserStats(userId);

    const today = new Date().toISOString().split('T')[0];
    const lastPlay = stats?.last_play_date;

    if (!lastPlay) {
        return { streak: 0, needsUpdate: true };
    }

    const lastPlayDate = new Date(lastPlay);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastPlayDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Already played today
        return { streak: stats.current_streak_days, needsUpdate: false };
    } else if (diffDays === 1) {
        // Streak continues!
        return { streak: stats.current_streak_days, needsUpdate: true };
    } else {
        // Streak broken
        return { streak: 0, needsUpdate: true, streakBroken: true };
    }
};

// ===============================================
// Daily Activity
// ===============================================

/**
 * Get today's activity
 */
export const getTodayActivity = async (userId) => {
    if (!userId) return { data: null, error: 'No user ID' };

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('user_daily_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single();

    if (error && error.code !== 'PGRST116') {
        return { data: null, error };
    }

    return {
        data: data || {
            questions_answered: 0,
            correct_answers: 0,
            xp_earned: 0,
            games_played: 0,
            daily_tasks_completed: 0,
            daily_tasks_total: 5
        },
        error: null
    };
};

/**
 * Complete a daily task
 */
export const completeDailyTask = async (userId) => {
    if (!userId) return { error: 'No user ID' };

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('user_daily_activity')
        .upsert({
            user_id: userId,
            activity_date: today
        }, {
            onConflict: 'user_id,activity_date'
        });

    if (!error) {
        // Fetch current count and increment
        const { data: current } = await supabase
            .from('user_daily_activity')
            .select('daily_tasks_completed')
            .eq('user_id', userId)
            .eq('activity_date', today)
            .single();

        await supabase
            .from('user_daily_activity')
            .update({
                daily_tasks_completed: (current?.daily_tasks_completed || 0) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('activity_date', today);
    }

    return { data, error };
};

// ===============================================
// Game History
// ===============================================

/**
 * Get recent game sessions
 */
export const getRecentGames = async (userId, limit = 10) => {
    if (!userId) return { data: [], error: 'No user ID' };

    const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    return { data: data || [], error };
};

/**
 * Get best scores for a subject/type
 */
export const getBestScores = async (userId, subject, questionType = 'fullyear') => {
    if (!userId) return { data: [], error: 'No user ID' };

    const { data, error } = await supabase
        .from('game_sessions')
        .select('part_number, score, accuracy, xp_earned, created_at')
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('question_type', questionType)
        .eq('won', true)
        .order('part_number', { ascending: true });

    return { data: data || [], error };
};

// ===============================================
// Achievements
// ===============================================

/**
 * Unlock an achievement
 */
export const unlockAchievement = async (userId, achievementId, name, description, xpReward = 0) => {
    if (!userId) return { data: null, error: 'No user ID' };

    const { data, error } = await supabase
        .from('user_achievements')
        .upsert({
            user_id: userId,
            achievement_id: achievementId,
            achievement_name: name,
            achievement_description: description,
            xp_reward: xpReward
        }, {
            onConflict: 'user_id,achievement_id',
            ignoreDuplicates: true
        });

    if (!error && xpReward > 0) {
        // Add XP reward to user stats
        await supabase.rpc('update_user_stats_after_game', {
            p_user_id: userId,
            p_subject: 'english',
            p_question_type: 'fullyear',
            p_part_number: 1,
            p_score: 0,
            p_questions_correct: 0,
            p_questions_total: 0,
            p_xp_earned: xpReward,
            p_duration_seconds: 0,
            p_won: false
        });
    }

    return { data, error };
};

/**
 * Get user achievements
 */
export const getUserAchievements = async (userId) => {
    if (!userId) return { data: [], error: 'No user ID' };

    const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

    return { data: data || [], error };
};

/**
 * Check and award achievements based on current stats
 */
export const checkAchievements = async (userId, stats) => {
    if (!userId || !stats) return;

    const achievements = [];

    // First Win
    if (stats.total_questions >= 1) {
        achievements.push({
            id: 'first_question',
            name: 'أول سؤال',
            description: 'أجبت على أول سؤال!',
            xp: 10
        });
    }

    // Streak achievements
    if (stats.streak_days >= 3) {
        achievements.push({
            id: 'streak_3',
            name: 'نشاط 3 أيام',
            description: 'حافظت على streak لمدة 3 أيام!',
            xp: 50
        });
    }
    if (stats.streak_days >= 7) {
        achievements.push({
            id: 'streak_7',
            name: 'أسبوع متواصل',
            description: 'حافظت على streak لمدة أسبوع كامل!',
            xp: 100
        });
    }

    // XP milestones
    if (stats.total_xp >= 1000) {
        achievements.push({
            id: 'xp_1000',
            name: 'ألف نقطة',
            description: 'جمعت 1000 XP!',
            xp: 50
        });
    }

    // Award all applicable achievements
    for (const ach of achievements) {
        await unlockAchievement(userId, ach.id, ach.name, ach.description, ach.xp);
    }
};

// ===============================================
// Helper Functions
// ===============================================

/**
 * Default stats for new users
 */
const getDefaultStats = () => ({
    total_xp: 0,
    current_level: 1,
    total_questions_answered: 0,
    correct_answers_count: 0,
    current_streak_days: 0,
    max_streak_days: 0,
    total_play_time_seconds: 0,
    total_sessions: 0,
    subject_progress: {}
});

/**
 * Calculate level from XP
 * Level formula: level = floor(sqrt(xp / 100)) + 1
 */
export const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Calculate XP needed for next level
 */
export const xpForNextLevel = (currentLevel) => {
    return currentLevel * currentLevel * 100;
};

/**
 * Format play time as human readable
 */
export const formatPlayTime = (seconds) => {
    if (seconds < 60) return `${seconds} ثانية`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} دقيقة`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
};

export default {
    getUserDashboardStats,
    getUserStats,
    initializeUserStats,
    recordGameSession,
    updateStatsAfterGame,
    getSubjectProgress,
    getLastPlayedPart,
    getOverallProgress,
    calculateProgressPercent,
    checkAndUpdateStreak,
    getTodayActivity,
    completeDailyTask,
    getRecentGames,
    getBestScores,
    unlockAchievement,
    getUserAchievements,
    checkAchievements,
    calculateLevel,
    xpForNextLevel,
    formatPlayTime
};
