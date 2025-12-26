// ====================================
// GAME STATE MANAGEMENT
// English Mastery Battle
// ====================================

// ====================================
// GAME STATE
// ====================================
let state = {
    demoMode: true,
    userId: null,
    sessionId: null,
    levelId: null,
    playing: false,
    paused: false,
    retryMode: false,           // وضع إعادة الأسئلة الخاطئة
    currentUserData: null,      // بيانات المستخدم من Supabase
    score: 0,
    lives: 3,
    combo: 0,
    qIndex: 0,
    qData: null,
    qY: -200,
    speed: 0.8,  // السرعة الافتراضية - أبطأ (يمكن تغييرها من Supabase)
    powerups: { freeze: 2, bomb: 1 },
    frozen: false,
    freezeTimeout: null,
    dark: false,
    muted: false,
    waiting: false,
    animFrame: null,
    streak: {
        active: false,
        multiplier: 1,
        timeLeft: 0,
        maxTime: 7000,
        timer: null,
        startTime: 0
    },
    questions: [],
    correctAnswers: [],
    wrongAnswers: [],
    answeredQuestions: new Set()
};

// ====================================
// SESSION DATA COLLECTION
// ====================================
let sessionData = {
    mistakes: [],
    startTime: null,
    endTime: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0
};

function startSession() {
    sessionData = {
        mistakes: [],
        startTime: Date.now(),
        endTime: null,
        questionsAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0
    };
}

function trackMistakeLocal(questionData, wrongAnswer) {
    sessionData.mistakes.push({
        questionId: questionData.id,
        question: questionData.q,
        wrongAnswer: wrongAnswer,
        correctAnswer: questionData.a,
        stage: state.levelId,
        timestamp: Date.now()
    });
    sessionData.wrongAnswers++;
    console.log(`📝 Mistake stored locally: ${questionData.id}`);
}

function trackCorrectAnswerLocal() {
    sessionData.correctAnswers++;
}

// ====================================
// SUPABASE INITIALIZATION
// ====================================
async function initializeSupabaseGame() {
    // Check for guest mode from sessionStorage or URL
    const isGuestSession = sessionStorage.getItem('guestMode');
    const urlParams = new URLSearchParams(window.location.search);
    const isGuestUrl = urlParams.get('guest') === 'true';
    const levelFromUrl = urlParams.get('level');
    
    // Set level from URL if provided
    if (levelFromUrl) {
        state.levelId = parseInt(levelFromUrl);
        localStorage.setItem('selectedLevel', levelFromUrl);
        console.log(`📍 Level from URL: ${state.levelId}`);
    }
    
    // Initialize Supabase client first (needed for settings even in guest mode)
    supabaseClient = initSupabase();
    console.log("🔌 Supabase client initialized:", supabaseClient ? "✅" : "❌");
    
    // Guest mode - allow demo only
    if (isGuestSession || isGuestUrl) {
        console.log("🎮 Demo Mode - Playing as guest");
        state.demoMode = true;
        state.userId = 'guest_' + Date.now();
        
        // Guests can only play level 0 (demo)
        if (state.levelId !== 0) {
            console.log("⚠️ Guests can only play demo level");
            state.levelId = 0;
        }
        return true;
    }
    
    // Check Supabase authentication
    const isAuthenticated = await checkGameAuth();
    
    if (!isAuthenticated) {
        console.log("❌ Not authenticated or profile incomplete");
        console.log("🔄 Redirecting to login page...");
        
        // Save intended destination
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        
        // Redirect to login
        window.location.href = '../login.html?from=game';
        return false;
    }
    
    console.log("✅ Supabase game initialized - User authenticated");
    return true;
}

// ====================================
// LOAD GAME SETTINGS FROM SUPABASE
// ====================================
async function loadGameSettings() {
    try {
        console.log("🔄 Loading game settings from Supabase...");
        
        if (!supabaseClient) {
            console.log("⚠️ Supabase not initialized, using default settings");
            console.log(`⚙️ Default speed: ${state.speed}`);
            return;
        }
        
        const { data: settings, error } = await supabaseClient
            .from('game_settings')
            .select('setting_key, setting_value');
        
        if (error) {
            console.log("⚠️ Could not load game settings:", error.message);
            console.log(`⚙️ Using default speed: ${state.speed}`);
            return;
        }
        
        console.log("📦 Settings from Supabase:", settings);
        
        if (settings && settings.length > 0) {
            settings.forEach(setting => {
                if (setting.setting_key === 'game_speed') {
                    const speed = parseFloat(setting.setting_value);
                    console.log(`📊 Raw speed value: "${setting.setting_value}" → parsed: ${speed}`);
                    
                    // Validate speed is reasonable (0.1 to 5.0) - allowing very slow for testing
                    if (!isNaN(speed) && speed >= 0.1 && speed <= 5.0) {
                        state.speed = speed;
                        console.log(`✅ Game speed set to: ${speed}`);
                    } else if (!isNaN(speed) && speed > 0 && speed < 0.1) {
                        // If too slow, use minimum
                        state.speed = 0.1;
                        console.log(`⚠️ Speed ${speed} too slow, using minimum: 0.1`);
                    } else if (!isNaN(speed) && speed > 3.0) {
                        // If too fast, use maximum
                        state.speed = 3.0;
                        console.log(`⚠️ Speed ${speed} too fast, using maximum: 3.0`);
                    } else {
                        console.log(`⚠️ Invalid speed value, using default: ${state.speed}`);
                    }
                }
            });
        } else {
            console.log("⚠️ No settings found in Supabase");
        }
        
        console.log(`🎮 FINAL GAME SPEED: ${state.speed}`);
    } catch (error) {
        console.log("⚠️ Error loading game settings:", error);
        console.log(`⚙️ Using default speed: ${state.speed}`);
    }
}
