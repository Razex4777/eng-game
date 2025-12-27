// ====================================
// SUPABASE CONFIGURATION
// English Mastery Battle
// ====================================

// Use var to allow redeclaration across different script includes if necessary
var SUPABASE_URL = 'https://judlqxxkbptuauaexjxu.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZGxxeHhrYnB0dWF1YWV4anh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTA0MTksImV4cCI6MjA4MDY2NjQxOX0.c-KItvik4vrDfs9w1I-nYjGHJkyuVU3ckawMF_pGMU8';

// Initialize Supabase Client - use unique name to avoid conflict with SDK
var supabaseClient = supabaseClient || null;

function initSupabase() {
    // Check if already initialized and valid
    if (supabaseClient && typeof supabaseClient.auth !== 'undefined') {
        console.log('✅ Supabase already initialized');
        return supabaseClient;
    }

    // Check if SDK is loaded (it defines window.supabase)
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.error('❌ Supabase SDK not loaded! Make sure to include the script tag from CDN.');
        return null;
    }

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        return null;
    }
}

// ====================================
// AUTHENTICATION FUNCTIONS
// ====================================

// تسجيل الدخول بـ Google
async function signInWithGoogle() {
    try {
        if (!supabaseClient) initSupabase();

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) throw error;
        console.log('✅ Google Sign-in initiated');
        return data;
    } catch (error) {
        console.error('❌ Google Sign-in failed:', error.message);
        throw error;
    }
}

// الحصول على المستخدم الحالي
async function getCurrentUser() {
    try {
        if (!supabaseClient) initSupabase();
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('❌ Get user failed:', error.message);
        return null;
    }
}

// تسجيل الخروج
async function signOut() {
    try {
        if (!supabaseClient) initSupabase();
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        console.log('✅ Signed out successfully');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('❌ Sign out failed:', error.message);
    }
}

// الاستماع لتغييرات حالة المصادقة
function onAuthStateChange(callback) {
    if (!supabaseClient) initSupabase();
    return supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event);
        callback(event, session);
    });
}

// ====================================
// USER DATABASE FUNCTIONS
// ====================================

// إنشاء أو تحديث مستخدم جديد
async function createOrUpdateUser(authUser, additionalData = {}) {
    try {
        if (!supabaseClient) initSupabase();

        const userData = {
            auth_id: authUser.id,
            email: authUser.email,
            full_name: additionalData.fullName || authUser.user_metadata?.full_name || 'مستخدم جديد',
            phone: additionalData.phone || null,
            last_login: new Date().toISOString()
        };

        const { data: existingUser } = await supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .single();

        if (existingUser) {
            const { data, error } = await supabaseClient
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('auth_id', authUser.id)
                .select()
                .single();

            if (error) throw error;
            return { user: data, isNew: false };
        } else {
            const { data, error } = await supabaseClient
                .from('users')
                .insert(userData)
                .select()
                .single();

            if (error) throw error;
            return { user: data, isNew: true };
        }
    } catch (error) {
        console.error('❌ Create/Update user failed:', error.message);
        throw error;
    }
}

// تحديث بيانات المستخدم
async function updateUserProfile(authId, data) {
    try {
        if (!supabaseClient) initSupabase();
        const { data: updatedUser, error } = await supabaseClient
            .from('users')
            .update(data)
            .eq('auth_id', authId)
            .select()
            .single();

        if (error) throw error;
        return updatedUser;
    } catch (error) {
        console.error('❌ Update profile failed:', error.message);
        throw error;
    }
}

// جلب بيانات المستخدم
async function getUserData(authId) {
    try {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', authId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Get user data failed:', error.message);
        return null;
    }
}

// ====================================
// PROGRESS FUNCTIONS
// ====================================

async function saveStageProgress(userId, stageId, progressData) {
    try {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient
            .from('user_progress')
            .upsert({
                user_id: userId,
                stage_id: stageId,
                score: progressData.score,
                total_questions: progressData.total,
                stars: progressData.stars,
                xp_earned: progressData.xp,
                accuracy: progressData.accuracy,
                time_spent: progressData.timeSpent,
                is_perfect: progressData.score === progressData.total,
                best_score: progressData.score,
                completed_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,stage_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Save progress failed:', error.message);
        throw error;
    }
}

async function getUserProgress(userId) {
    try {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .order('stage_id', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Get progress failed:', error.message);
        return [];
    }
}

async function updateUserStats(userId, stats) {
    try {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient
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
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Update stats failed:', error.message);
        throw error;
    }
}

// ====================================
// WRONG ANSWERS FUNCTIONS
// ====================================

async function saveWrongAnswer(userId, questionData) {
    try {
        if (!supabaseClient) initSupabase();
        const { error } = await supabaseClient
            .from('wrong_answers')
            .upsert({
                user_id: userId,
                question_id: questionData.id,
                question_text: questionData.question,
                correct_answer: questionData.correctAnswer,
                wrong_answer: questionData.wrongAnswer,
                stage_id: questionData.stageId,
                wrong_count: 1,
                last_wrong_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,question_id',
                ignoreDuplicates: false
            });

        if (error && error.code === '23505') {
            await supabaseClient.rpc('increment_wrong_count', {
                p_user_id: userId,
                p_question_id: questionData.id
            });
        }
    } catch (error) {
        console.error('❌ Save wrong answer failed:', error.message);
    }
}

// ====================================
// SUGGESTIONS FUNCTIONS
// ====================================

async function submitSuggestion(userId, userEmail, userName, content) {
    try {
        if (!supabaseClient) initSupabase();
        const { data, error } = await supabaseClient
            .from('suggestions')
            .insert({
                user_id: userId,
                user_email: userEmail,
                user_name: userName,
                content: content
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ Submit suggestion failed:', error.message);
        throw error;
    }
}

// ====================================
// EXPORT
// ====================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSupabase,
        signInWithGoogle,
        getCurrentUser,
        signOut,
        onAuthStateChange,
        createOrUpdateUser,
        updateUserProfile,
        getUserData,
        saveStageProgress,
        getUserProgress,
        updateUserStats,
        saveWrongAnswer,
        submitSuggestion
    };
}
