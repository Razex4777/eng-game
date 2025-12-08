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
    
    state.qY = -250;
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
        const halfScreen = gameArea.offsetHeight / 2;
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
        // Speed is now constant - removed state.speed += 0.025
        
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
        
        if (!state.answeredQuestions.has(state.qData.id)) {
            state.questions.push(state.qData);
            console.log(`❌ Wrong answer! Question added back to queue.`);
        }
        
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
    
    if (!state.answeredQuestions.has(state.qData.id)) {
        state.questions.push(state.qData);
        console.log(`⏰ Time's up! Question added back to queue.`);
    }
    
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
        // Log why we're not running (only once)
        if (!state._loopDebugLogged) {
            console.log(`⚠️ gameLoop blocked: playing=${state.playing}, waiting=${state.waiting}, paused=${state.paused}`);
            state._loopDebugLogged = true;
        }
        return;
    }
    state._loopDebugLogged = false; // Reset for next block
    
    if (!state.frozen) {
        const gameH = document.getElementById('game-area').offsetHeight;
        state.qY += state.speed;
        const qEl = document.getElementById('falling-question');
        qEl.style.top = `${state.qY}px`;
        
        if (state.qY > gameH + 50) {
            handleMiss();
            return;
        }
    }
    
    state.animFrame = requestAnimationFrame(gameLoop);
}

// ====================================
// LEVEL END
// ====================================
async function endLevel() {
    state.playing = false;
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    stopStreak();
    
    // Check if we have wrong answers to retry
    if (!state.retryMode && state.wrongAnswers.length > 0) {
        console.log(`\n🔄 RETRY MODE: ${state.wrongAnswers.length} wrong answers to retry`);
        startRetryMode();
        return;
    }
    
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
    const xpEarned = state.score + (stars * 50) + (state.retryMode ? 0 : 100);
    
    console.log(`\n🏆 LEVEL COMPLETE!`);
    console.log(`   📊 Score: ${state.score}`);
    console.log(`   ✅ Correct: ${state.correctAnswers.length}`);
    console.log(`   ❌ Wrong: ${state.wrongAnswers.length}`);
    console.log(`   🎯 Accuracy: ${accuracy}%`);
    console.log(`   ⭐ Stars: ${stars}`);
    console.log(`   ✨ XP: ${xpEarned}`);
    
    // Save progress to Supabase (only for logged-in users)
    // Guest users (demoMode=true) don't save anything
    // Registered users on Level 0 save wrong answers only
    // Registered users on Level 1+ save full progress
    const isLoggedIn = state.userId && !state.userId.startsWith('guest_') && !state.demoMode;
    
    console.log(`\n💾 Save Decision:`);
    console.log(`   👤 User ID: ${state.userId}`);
    console.log(`   🎮 Demo Mode: ${state.demoMode}`);
    console.log(`   📍 Level: ${state.levelId}`);
    console.log(`   ✅ Is Logged In: ${isLoggedIn}`);
    
    if (isLoggedIn) {
        if (state.levelId !== 0) {
            // Full progress save for levels 1+
            console.log('   📊 Saving FULL progress (Level 1+)');
            await saveProgressToSupabase(stars, xpEarned, accuracy, totalQuestions);
        } else {
            // Level 0 (Demo): Only save wrong answers for analytics
            console.log('   📊 Saving wrong answers only (Level 0)');
            await saveWrongAnswersOnly();
        }
    } else {
        console.log('   ⚠️ Not saving - Guest or Demo mode');
    }
    
    // Save to localStorage as backup
    if (state.levelId !== 0) {
        localStorage.setItem(`level_${state.levelId}_stars`, stars);
        localStorage.setItem(`level_${state.levelId}_completed`, 'true');
    }
    
    showResultsScreen();
}

// ====================================
// RETRY MODE (إعادة الأسئلة الخاطئة)
// ====================================
function startRetryMode() {
    console.log('\n🔄 =======================================');
    console.log('🔄 STARTING RETRY MODE');
    console.log('🔄 =======================================');
    
    state.retryMode = true;
    
    // Get unique wrong questions (avoid duplicates)
    const uniqueWrongQuestions = [];
    const seenIds = new Set();
    
    state.wrongAnswers.forEach(answer => {
        const q = answer.question;
        if (!seenIds.has(q.id)) {
            seenIds.add(q.id);
            uniqueWrongQuestions.push(q);
        }
    });
    
    console.log(`   📝 Unique wrong questions: ${uniqueWrongQuestions.length}`);
    
    // Reset for retry
    state.questions = uniqueWrongQuestions;
    state.qIndex = 0;
    state.wrongAnswers = []; // Clear for retry round
    state.answeredQuestions = new Set();
    state.waiting = false;
    state.lives = 3; // Reset lives for retry round
    state.combo = 0;
    
    // Show retry notification
    showRetryNotification(uniqueWrongQuestions.length);
    
    // Start retry after notification
    setTimeout(() => {
        hideRetryNotification();
        
        // CRITICAL: Re-enable game state for retry
        state.playing = true;
        state.waiting = false;
        
        console.log('🎮 Retry mode activated - game playing:', state.playing);
        console.log('   ❤️ Lives reset to:', state.lives);
        
        updateHUD(); // Update display with reset lives
        nextQuestion();
        gameLoop();
    }, 2000);
}

function showRetryNotification(count) {
    const notification = document.createElement('div');
    notification.id = 'retry-notification';
    notification.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 2rem 3rem; border-radius: 2rem; text-align: center; color: white; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔄</div>
                <h2 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 0.5rem;">إعادة الأسئلة الخاطئة</h2>
                <p style="font-size: 1.2rem; opacity: 0.9;">${count} سؤال للمراجعة</p>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
}

function hideRetryNotification() {
    const notification = document.getElementById('retry-notification');
    if (notification) notification.remove();
}

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
        
        // Update user's total XP
        const newTotalXP = (userData.total_xp || 0) + xpEarned;
        const newCurrentLevel = Math.max(userData.current_level || 1, state.levelId + 1);
        
        if (typeof updateUserStats === 'function') {
            await updateUserStats(userData.id, {
                totalXP: newTotalXP,
                currentLevel: newCurrentLevel,
                completedStages: (userData.completed_stages || 0) + 1,
                totalStars: (userData.total_stars || 0) + stars
            });
            console.log('✅ User stats updated');
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

// Save wrong answers only (for Demo level analytics)
async function saveWrongAnswersOnly() {
    console.log('\n📊 Saving wrong answers for analytics (Demo level)...');
    
    try {
        const userData = state.currentUserData || await getUserDataFromSupabase();
        if (!userData || !userData.id) {
            console.log('⚠️ No user data, skipping wrong answers save');
            return;
        }
        
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
            console.log(`✅ ${state.wrongAnswers.length} wrong answers saved for analytics`);
        } else {
            console.log('ℹ️ No wrong answers to save');
        }
    } catch (error) {
        console.error('❌ Error saving wrong answers:', error);
    }
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
    timerEl.classList.remove('show');
}

// ====================================
// DATA SAVING (Demo mode = NO SAVING)
// ====================================
async function sendAnalyticsToFirebase(wrongQuestions) {
    // NO SAVING IN DEMO MODE
    if (state.demoMode || state.levelId === 0) {
        console.log("🎮 Demo mode - skipping analytics save");
        return;
    }
    if (!wrongQuestions || wrongQuestions.length === 0) return;

    console.log("📊 Analytics would be saved (not implemented yet)");
}

async function saveSessionToFirebase() {
    // NO SAVING IN DEMO MODE
    if (state.demoMode || state.levelId === 0) {
        console.log("🎮 Demo mode - skipping session save");
        return;
    }
    if (!state.userId || state.userId.startsWith('guest_')) {
        console.log("👤 Guest user - skipping session save");
        return;
    }

    console.log("💾 Session would be saved (not implemented yet)");
}

async function saveGameProgress(userId, stageId, gameData) {
    // NO SAVING IN DEMO MODE
    if (state.demoMode || state.levelId === 0) {
        console.log("🎮 Demo mode - skipping progress save");
        return;
    }
    if (!userId || userId.startsWith('guest_')) {
        console.log("👤 Guest user - skipping progress save");
        return;
    }
    
    console.log("💾 Progress would be saved to Supabase (pending implementation)");
}
