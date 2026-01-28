// ====================================
// APP SUPABASE CONFIGURATION
// English Mastery Battle
// ====================================

// Use var for safe global scoping
var ST_URL_VAL = 'https://judlqxxkbptuauaexjxu.supabase.co';
var ST_KEY_VAL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZGxxeHhrYnB0dWF1YWV4anh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTA0MTksImV4cCI6MjA4MDY2NjQxOX0.c-KItvik4vrDfs9w1I-nYjGHJkyuVU3ckawMF_pGMU8';

// Unique global identifier for the client instance
var sb_client = sb_client || null;

/**
 * Initializes the Supabase client if not already done.
 */
function initSB() {
    // Return existing client if valid
    if (sb_client && typeof sb_client.auth !== 'undefined') {
        console.log('✅ SB Client already active');
        return sb_client;
    }

    // Check for SDK provided by CDN
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.error('❌ Supabase SDK (window.supabase) is missing!');
        return null;
    }

    try {
        sb_client = window.supabase.createClient(ST_URL_VAL, ST_KEY_VAL);
        console.log('✅ SB Client initialized successfully');
        return sb_client;
    } catch (err) {
        console.error('❌ SB Initialization Failed:', err);
        return null;
    }
}

// ====================================
// AUTHENTICATION HELPERS
// ====================================

async function signInWithGoogle() {
    try {
        if (!sb_client) initSB();
        const { data, error } = await sb_client.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/index.html' }
        });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('❌ Google Auth Failed:', err.message);
        throw err;
    }
}

async function getCurrentUser() {
    try {
        if (!sb_client) initSB();
        const { data: { user }, error } = await sb_client.auth.getUser();
        if (error) throw error;
        return user;
    } catch (err) {
        console.error('❌ Get User Failed:', err.message);
        return null;
    }
}

async function signOut() {
    try {
        if (!sb_client) initSB();
        const { error } = await sb_client.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (err) {
        console.error('❌ Sign Out Failed:', err.message);
    }
}

function onAuthStateChange(callback) {
    if (!sb_client) initSB();
    return sb_client.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth State Changed:', event);
        callback(event, session);
    });
}

// ====================================
// DATABASE OPERATIONS
// ====================================

async function createOrUpdateUser(authUser, additionalData = {}) {
    try {
        if (!sb_client) initSB();

        const userData = {
            auth_id: authUser.id,
            email: authUser.email,
            full_name: additionalData.fullName || authUser.user_metadata?.full_name || 'New Player',
            phone: additionalData.phone || null,
            last_login: new Date().toISOString()
        };

        const { data: existingUser } = await sb_client
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .single();

        if (existingUser) {
            const { data, error } = await sb_client
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('auth_id', authUser.id)
                .select().single();
            if (error) throw error;
            return { user: data, isNew: false };
        } else {
            const { data, error } = await sb_client
                .from('users')
                .insert(userData)
                .select().single();
            if (error) throw error;
            return { user: data, isNew: true };
        }
    } catch (err) {
        console.error('❌ DB User Sync Failed:', err.message);
        throw err;
    }
}

async function updateUserProfile(authId, data) {
    try {
        if (!sb_client) initSB();
        const { data: updated, error } = await sb_client
            .from('users')
            .update(data)
            .eq('auth_id', authId)
            .select().single();
        if (error) throw error;
        return updated;
    } catch (err) {
        console.error('❌ Update Profile Failed:', err.message);
        throw err;
    }
}

async function getUserData(authId) {
    try {
        if (!sb_client) initSB();
        const { data, error } = await sb_client
            .from('users')
            .select('*')
            .eq('auth_id', authId)
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('❌ Get User Data Failed:', err.message);
        return null;
    }
}

async function saveStageProgress(userId, stageId, progress) {
    try {
        if (!sb_client) initSB();
        const { data, error } = await sb_client
            .from('user_progress')
            .upsert({
                user_id: userId,
                stage_id: stageId,
                score: progress.score,
                total_questions: progress.total,
                stars: progress.stars,
                xp_earned: progress.xp,
                accuracy: progress.accuracy,
                time_spent: progress.timeSpent,
                is_perfect: progress.score === progress.total,
                best_score: progress.score,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_id,stage_id' })
            .select().single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('❌ Save Progress Failed:', err.message);
        throw err;
    }
}

async function getUserProgress(userId) {
    try {
        if (!sb_client) initSB();
        const { data, error } = await sb_client
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .order('stage_id', { ascending: true });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('❌ Get Progress Failed:', err.message);
        return [];
    }
}

async function saveMonsterHighScore(userId, score) {
    try {
        if (!sb_client) initSB();

        // Save to user_progress with a special stage_id (e.g., 999)
        const { data, error } = await sb_client
            .from('user_progress')
            .upsert({
                user_id: userId,
                stage_id: 999, // 999 for Monster Challenge
                score: score,
                best_score: score,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_id,stage_id' })
            .select().single();

        if (error) throw error;

        // Also update users.monster_highscore if column exists (optional/future-proof)
        await sb_client
            .from('users')
            .update({ monster_highscore: score })
            .eq('id', userId);

        return data;
    } catch (err) {
        console.error('❌ Save Monster HighScore Failed:', err.message);
        return null;
    }
}

async function updateUserStats(userId, stats) {
    try {
        if (!sb_client) initSB();
        const { data, error } = await sb_client
            .from('users')
            .update({
                total_xp: stats.totalXP,
                current_level: stats.currentLevel,
                completed_stages: stats.completedStages,
                total_stars: stats.totalStars,
                accuracy: stats.accuracy,
                total_play_time: stats.totalPlayTime
            })
            .eq('id', userId)
            .select().single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('❌ Update Stats Failed:', err.message);
        throw err;
    }
}

async function saveWrongAnswer(userId, question) {
    try {
        if (!sb_client) initSB();
        const { error } = await sb_client
            .from('wrong_answers')
            .upsert({
                user_id: userId,
                question_id: question.id,
                question_text: question.question,
                correct_answer: question.correctAnswer,
                wrong_answer: question.wrongAnswer,
                stage_id: question.stageId,
                wrong_count: 1,
                last_wrong_at: new Date().toISOString()
            }, { onConflict: 'user_id,question_id', ignoreDuplicates: false });

        if (error && error.code === '23505') {
            await sb_client.rpc('increment_wrong_count', {
                p_user_id: userId,
                p_question_id: question.id
            });
        }
    } catch (err) {
        console.error('❌ Save Mistake Failed:', err.message);
    }
}

async function submitSuggestion(userId, email, name, content) {
    try {
        if (!sb_client) initSB();
        const { data, error } = await sb_client
            .from('suggestions')
            .insert({ user_id: userId, user_email: email, user_name: name, content: content })
            .select().single();
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('❌ Submit Suggestion Failed:', err.message);
        throw err;
    }
}

// Compatibility Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSB, signInWithGoogle, getCurrentUser, signOut, onAuthStateChange,
        createOrUpdateUser, updateUserProfile, getUserData, saveStageProgress,
        getUserProgress, updateUserStats, saveWrongAnswer, submitSuggestion
    };
}
