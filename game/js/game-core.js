// ====================================
// GAME CORE LOGIC
// English Mastery Battle
// ====================================

// ====================================
// QUESTION FETCHING
// ====================================
function loadQuestionsForLevel(levelId) {
    console.log(`\n📚 Loading questions for Level ${levelId}...`);
    
    // Demo mode only if explicitly set (guest user)
    // Level 0 uses demo questions but registered users still save analytics
    if (state.demoMode) {
        console.log("🎮 Guest Demo mode - using demo questions");
        return DEMO_QUESTIONS;
    }
    
    // Level 0 for registered users - still use demo questions but allow analytics
    if (levelId === 0) {
        console.log("🎮 Level 0 (Demo questions) - User is registered, analytics enabled");
        return DEMO_QUESTIONS;
    }
    
    // Check if questions database is initialized
    if (typeof questionsData === 'undefined' || Object.keys(questionsData).length === 0) {
        console.log("⚠️ Questions database not initialized, trying to initialize...");
        if (typeof initializeQuestionsDatabase === 'function') {
            initializeQuestionsDatabase();
        }
    }
    
    // Try to get questions for this level
    if (typeof getStageQuestions === 'function') {
        const questions = getStageQuestions(levelId);
        if (questions && questions.length > 0) {
            console.log(`✅ Loaded ${questions.length} questions for Stage ${levelId}`);
            
            // Log some stats
            const goldenCount = questions.filter(q => q.golden === 1 || q.repeat >= 5).length;
            console.log(`   📊 Golden questions: ${goldenCount}`);
            console.log(`   📊 Sample: "${questions[0].q.substring(0, 50)}..."`);
            
            return questions;
        }
    }
    
    // Check questionsData directly
    const stageKey = `stage${levelId}`;
    if (typeof questionsData !== 'undefined' && questionsData[stageKey]) {
        const questions = questionsData[stageKey];
        console.log(`✅ Direct load: ${questions.length} questions for ${stageKey}`);
        return questions;
    }
    
    // Fallback to demo questions
    console.log("⚠️ No questions found for this level, using demo questions");
    return DEMO_QUESTIONS;
}

async function fetchQuestionsFromFirebase() {
    return loadQuestionsForLevel(state.levelId);
}

// ====================================
// GAME START
// ====================================
async function startGame() {
    console.log('\n🎮 =======================================');
    console.log('🎮 STARTING GAME');
    console.log('🎮 =======================================');
    console.log('📍 Level ID:', state.levelId);
    
    state.playing = true;
    state.retryMode = false;  // Reset retry mode
    state.qIndex = 0;
    state.score = 0;
    state.lives = 3;
    state.combo = 0;
    state.powerups = { freeze: 2, bomb: 1 };
    state.frozen = false;
    state.answeredQuestions = new Set();
    state.speed = 1.5; // Fixed speed as requested
    stopStreak();

    startSession();
    state.sessionId = Date.now().toString();
    
    console.log('\n📥 Fetching questions from database...');
    
    try {
        state.questions = await fetchQuestionsFromFirebase();
        
        if (!state.questions || state.questions.length === 0) {
            throw new Error('No questions returned from fetch!');
        }
        
        console.log('✅ Questions loaded successfully!');
        console.log(`   Total: ${state.questions.length} questions`);
        
    } catch (error) {
        console.error('❌ CRITICAL ERROR in startGame:', error);
        alert('⚠️ فشل تحميل الأسئلة!\nيرجى إعادة تحميل الصفحة.');
        state.playing = false;
        return;
    }
    
    state.wrongAnswers = [];
    state.correctAnswers = [];

    // Mark golden questions (repeat >= 5) and ensure repeat field exists
    state.questions = state.questions.map(q => ({
        ...q,
        repeat: q.repeat || 1,
        golden: (q.golden === 1) || (q.repeat >= 5)
    }));
    
    // Shuffle questions for variety
    state.questions = state.questions.sort(() => Math.random() - 0.5);
    
    // DEMO MODE: Limit to 5 questions only for level 0
    if (state.levelId === 0 || state.levelId === '0') {
        state.questions = state.questions.slice(0, 5);
        console.log('🎯 DEMO MODE: Limited to 5 questions');
    }
    
    console.log(`   🌟 Golden questions: ${state.questions.filter(q => q.golden).length}`);

    updateHUD();
    nextQuestion();
    gameLoop();
    console.log('✅ Game started successfully!');
}

// ====================================
// QUESTION FLOW
// ====================================
function nextQuestion() {
    console.log(`📍 nextQuestion called - qIndex: ${state.qIndex}`);
    
    if (!state.questions || state.questions.length === 0) {
        console.error('❌ No questions loaded!');
        alert('⚠️ لم يتم تحميل الأسئلة! يرجى إعادة المحاولة.');
        return;
    }
    
    if (state.qIndex >= state.questions.length) {
        endLevel();
        return;
    }
    
    state.qData = state.questions[state.qIndex];
    console.log(`❓ Question ${state.qIndex + 1}:`, state.qData.q);
    
    state.qY = -250; // Start above the screen
    state.frozen = false;
    if (state.freezeTimeout) {
        clearTimeout(state.freezeTimeout);
        state.freezeTimeout = null;
    }
    state.waiting = false;
    
    const qEl = document.getElementById('falling-question');
    const goldenBadge = document.getElementById('golden-badge');
    const repeatBadge = document.getElementById('repeat-badge');
    const repeatCount = document.getElementById('repeat-count');
    
    document.getElementById('q-text').innerText = state.qData.q;
    qEl.classList.remove('hidden');
    qEl.style.display = 'block';
    qEl.style.top = `${state.qY}px`; // Set initial position
    
    if (state.qData.golden) {
        goldenBadge.classList.remove('hidden');
    } else {
        goldenBadge.classList.add('hidden');
    }

    if (state.qData.repeat && state.qData.repeat > 0) {
        repeatBadge.classList.remove('hidden');
        repeatCount.innerText = state.qData.repeat;
    } else {
        repeatBadge.classList.add('hidden');
    }

    updateQuestionColors();

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    // Shuffle options randomly
    const shuffledOptions = [...state.qData.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.dataset.text = opt;
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(opt, btn);
        grid.appendChild(btn);
    });
    
    const prog = (state.qIndex / state.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${prog}%`;
}

// ====================================
// ANSWER HANDLING
// ====================================
function handleAnswer(sel, btnEl) {
    if (!state.playing || state.waiting || state.paused) return;
    
    const correct = sel === state.qData.a;
    state.waiting = true;
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    
    const answerRecord = {
        question: state.qData,
        userAnswer: sel,
        correct: correct
    };

    if (correct) {
        const qEl = document.getElementById('falling-question');
        const gameArea = document.getElementById('game-area');
        const questionMiddle = state.qY + qEl.offsetHeight / 2;
        const halfScreen = gameArea ? (gameArea.offsetHeight / 2) : 300;
        
        // Update streak if answered in top half
        const isTopHalf = questionMiddle < halfScreen;
        if (isTopHalf) { 
            updateStreak(); 
        } else { 
            stopStreak(); 
        }
        
        const basePoints = state.qData.golden ? 20 : 10;
        const streakMultiplier = state.streak.active ? state.streak.multiplier : 1;
        const finalPoints = basePoints * streakMultiplier;
        
        btnEl.classList.add('bg-emerald-500');
        state.score += finalPoints;
        state.combo++;
        // Speed is constant
        
        state.correctAnswers.push(answerRecord);
        state.answeredQuestions.add(state.qData.id);
        
        trackCorrectAnswerLocal();
        
        launchButtonToQuestion(btnEl, true);
        AudioSys.correct();
        if (navigator.vibrate) navigator.vibrate(50);
        triggerShake(0.25);
        showFeedback(true);
    } else {
        stopStreak();
        btnEl.classList.add('bg-red-500');
        state.combo = 0;
        state.lives--;
        
        state.wrongAnswers.push(answerRecord);
        
        trackMistakeLocal(state.qData, answerRecord);
        
        // IMPORTANT: In strict mode (3 hearts), we might not want to re-add the question
        // if we are going to fail anyway. But for now, let's keep it consistent.
        // User said: "When error returns... do not return hearts 3".
        // If lives == 0, we will fail anyway.
        
        launchButtonToQuestion(btnEl, false);
        AudioSys.wrong();
        if (navigator.vibrate) navigator.vibrate(200);
        triggerShake(0.5);
        shakeQuestion();
        showFeedback(false);
    }
    updateHUD();
}

function handleMiss() {
    stopStreak();
    state.combo = 0;
    state.lives--;
    
    const answerRecord = {
        question: state.qData,
        userAnswer: null,
        correct: false
    };
    
    state.wrongAnswers.push(answerRecord);
    trackMistakeLocal(state.qData, null);
    
    AudioSys.wrong();
    if (navigator.vibrate) navigator.vibrate(200);
    state.waiting = true;
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    triggerShake(0.5);
    shakeQuestion();
    updateHUD();
    showFeedback(false, "Time's Up!");
}

function continueGame() {
    // Check for Game Over logic here (after feedback shown)
    if (state.lives <= 0) {
        endLevel(true); // true = failed/game over
        return;
    }

    state.qIndex++;
    state.waiting = false;
    nextQuestion();
    gameLoop();
}

// ====================================
// GAME LOOP
// ====================================
function gameLoop() {
    if (!state.playing || state.waiting || state.paused) {
        if (!state._loopDebugLogged) {
            console.log(`⚠️ gameLoop blocked: playing=${state.playing}, waiting=${state.waiting}, paused=${state.paused}`);
            state._loopDebugLogged = true;
        }
        return;
    }
    state._loopDebugLogged = false;
    
    if (!state.frozen) {
        // Use fixed speed if not set
        const speed = state.speed || 0.8;
        state.qY += speed;
        
        const qEl = document.getElementById('falling-question');
        qEl.style.top = `${state.qY}px`;
        
        // Get the answer buttons area position (fail line)
        const optionsGrid = document.getElementById('options-grid');
        const qElHeight = qEl ? qEl.offsetHeight : 150;
        
        // Calculate fail line: when bottom of question reaches top of buttons
        let failLine = window.innerHeight; // Default fallback
        if (optionsGrid) {
            const optionsRect = optionsGrid.getBoundingClientRect();
            failLine = optionsRect.top - qElHeight; // Question bottom reaches buttons top
        }
        
        // Check if question reached the fail line (buttons area)
        if (state.qY >= failLine) {
            handleMiss();
            return;
        }
    }
    
    state.animFrame = requestAnimationFrame(gameLoop);
}

// ====================================
// LEVEL END
// ====================================
async function endLevel(failed = false) {
    state.playing = false;
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    stopStreak();
    
    // GAME OVER - 0 Lives
    if (failed || state.lives <= 0) {
        console.log("❌ GAME OVER - 0 Lives");
        AudioSys.wrong(); // Play fail sound
        showResultsScreen(true); // Show failed screen
        return;
    }
    
    // Check if we have wrong answers to retry
    // User requested: "When error returns... do not return hearts 3".
    // If they finished the level but had errors (and > 0 lives), 
    // we can either let them retry OR just finish.
    // The user's main complaint was "If 3 hearts lost -> Lose stage".
    // Since we handle that above, maybe we can keep Retry Mode for "Finished but want to perfect"?
    // Or maybe disable it?
    // "When error returns for the question do not return the hearts 3"
    // I will DISABLE auto-retry for now, and just show results. 
    // They can replay the whole level if they want.
    
    // Calculate final results
    const totalQuestions = state.correctAnswers.length + state.wrongAnswers.length;
    const accuracy = totalQuestions > 0 ? Math.round((state.correctAnswers.length / totalQuestions) * 100) : 0;
    
    // Calculate stars
    let stars = 0;
    if (accuracy >= 90 && state.lives === 3) {
        stars = 3;
    } else if (accuracy >= 70) {
        stars = 2;
    } else if (accuracy >= 50) {
        stars = 1;
    }
    
    // Calculate XP earned
    const xpEarned = state.score + (stars * 50) + 100;
    
    console.log(`\n🏆 LEVEL COMPLETE!`);
    console.log(`   📊 Score: ${state.score}`);
    console.log(`   ✅ Correct: ${state.correctAnswers.length}`);
    console.log(`   ❌ Wrong: ${state.wrongAnswers.length}`);
    console.log(`   🎯 Accuracy: ${accuracy}%`);
    console.log(`   ⭐ Stars: ${stars}`);
    console.log(`   ✨ XP: ${xpEarned}`);
    
    // Save progress to Supabase
    const isLoggedIn = state.userId && !state.userId.startsWith('guest_') && !state.demoMode;
    
    if (isLoggedIn) {
        // SAVE FOR ALL LEVELS (Including 0 if it counts as completing Demo)
        console.log('   📊 Saving progress');
        
        // For Level 0, we treat it as unlocking Level 1
        await saveProgressToSupabase(stars, xpEarned, accuracy, totalQuestions);
        
        if (state.levelId === 0) {
             // Unlock Level 1 locally too
             localStorage.setItem('level_0_completed', 'true');
             localStorage.setItem('level_1_unlocked', 'true');
        }
    }
    
    // Save to localStorage as backup
    localStorage.setItem(`level_${state.levelId}_stars`, stars);
    localStorage.setItem(`level_${state.levelId}_completed`, 'true');
    
    showResultsScreen(false);
}

// ====================================
// RETRY MODE (REMOVED/DISABLED)
// ====================================
// Retry mode logic removed to satisfy user requirement:
// "If lose 3 hearts, lose stage" and "Don't return hearts to 3".
// The cleanest way is to just have standard Win/Fail.

// ====================================
// SAVE PROGRESS TO SUPABASE
// ====================================
async function saveProgressToSupabase(stars, xpEarned, accuracy, totalQuestions) {
    console.log('\n💾 Saving progress to Supabase...');
    
    try {
        // Get user's database ID
        const userData = state.currentUserData || await getUserDataFromSupabase();
        if (!userData || !userData.id) {
            console.log('⚠️ No user data, skipping Supabase save');
            return;
        }
        
        // Save stage progress
        if (typeof saveStageProgress === 'function') {
            await saveStageProgress(userData.id, state.levelId, {
                score: state.score,
                total: totalQuestions,
                stars: stars,
                xp: xpEarned,
                accuracy: accuracy,
                timeSpent: Math.round((Date.now() - sessionData.startTime) / 1000)
            });
            console.log('✅ Stage progress saved');
        }
        
        // Update user's total XP and Level
        const newTotalXP = (userData.total_xp || 0) + xpEarned;
        
        // If completing level 0, ensure we are at least level 1
        // If completing level X, ensure we are at least level X+1
        const nextLevel = state.levelId + 1;
        const newCurrentLevel = Math.max(userData.current_level || 1, nextLevel);
        
        if (typeof updateUserStats === 'function') {
            await updateUserStats(userData.id, {
                totalXP: newTotalXP,
                currentLevel: newCurrentLevel,
                completedStages: (userData.completed_stages || 0) + 1,
                totalStars: (userData.total_stars || 0) + stars
            });
            console.log(`✅ User stats updated (Level -> ${newCurrentLevel})`);
        }
        
        // Save wrong answers for analytics
        if (state.wrongAnswers.length > 0 && typeof saveWrongAnswer === 'function') {
            for (const answer of state.wrongAnswers) {
                await saveWrongAnswer(userData.id, {
                    id: answer.question.id,
                    question: answer.question.q,
                    correctAnswer: answer.question.a,
                    wrongAnswer: answer.userAnswer,
                    stageId: state.levelId
                });
            }
            console.log('✅ Wrong answers saved');
        }
        
        console.log('✅ All progress saved to Supabase!');
        
    } catch (error) {
        console.error('❌ Error saving to Supabase:', error);
    }
}

// Save wrong answers only (Kept for compatibility)
async function saveWrongAnswersOnly() {
   // Redirect to main save function
   await saveProgressToSupabase(0, 0, 0, state.wrongAnswers.length);
}

async function getUserDataFromSupabase() {
    try {
        if (!supabaseClient) return null;
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;
        
        const { data } = await supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
        
        return data;
    } catch (e) {
        console.error('Error getting user data:', e);
        return null;
    }
}

// ====================================
// STREAK MANAGEMENT
// ====================================
function updateStreak() {
    if (!state.streak.active) {
        state.streak.active = true;
        state.streak.multiplier = 2;
        state.streak.maxTime = 7000;
        startStreakTimer();
    } else {
        if (state.streak.multiplier < 5) { 
            state.streak.multiplier++; 
        }
        const currentRemaining = state.streak.timeLeft;
        const newTime = Math.min(currentRemaining + 7000, 12000);
        state.streak.maxTime = newTime;
        state.streak.timeLeft = newTime;
        state.streak.startTime = Date.now();
    }
    updateStreakUI();
}

function startStreakTimer() {
    state.streak.timeLeft = state.streak.maxTime;
    state.streak.startTime = Date.now();
    const timerEl = document.getElementById('streak-timer');
    timerEl.classList.add('show');
    updateStreakUI();
    runStreakTimer();
}

function runStreakTimer() {
    if (state.streak.timer) { 
        clearInterval(state.streak.timer); 
    }
    state.streak.timer = setInterval(() => {
        if (state.paused) return;
        
        const elapsed = Date.now() - state.streak.startTime;
        state.streak.timeLeft = state.streak.maxTime - elapsed;
        
        if (state.streak.timeLeft <= 0) {
            stopStreak();
        } else {
            updateStreakTimerBar();
        }
    }, 50);
}

function stopStreak() {
    if (state.streak.timer) {
        clearInterval(state.streak.timer);
        state.streak.timer = null;
    }
    state.streak.active = false;
    state.streak.multiplier = 1;
    state.streak.timeLeft = 0;
    const timerEl = document.getElementById('streak-timer');
    if (timerEl) {
        timerEl.classList.remove('show');
        timerEl.style.display = 'none';
    }
}

// ====================================
// DATA SAVING
// ====================================
async function sendAnalyticsToFirebase(wrongQuestions) {
    // Legacy function, replaced by saveProgressToSupabase
}

async function saveSessionToFirebase() {
    // Legacy function
}

async function saveGameProgress(userId, stageId, gameData) {
    // Legacy function
}
