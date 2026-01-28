// ====================================
// GAME UI FUNCTIONS
// English Mastery Battle
// ====================================

// ====================================
// HUD UPDATE
// ====================================
function updateHUD() {
    document.getElementById('score-display').innerText = state.score;
    const stars = document.getElementById('lives-display');

    // Compact display for 10 lives
    stars.innerHTML = `<span class="text-rose-500">❤️</span> <span class="font-black text-xl">${livesCount}</span>`;
    stars.className = `flex items-center gap-1 ${livesCount <= 2 ? 'animate-pulse text-red-500' : ''}`;

    // Combo container (hidden since fire removed)
    const combo = document.getElementById('combo-container');
    if (combo) {
        combo.style.display = 'none';
    }

    document.getElementById('count-freeze').innerText = state.powerups.freeze;
    document.getElementById('count-bomb').innerText = state.powerups.bomb;
    const freeze = document.getElementById('btn-freeze');
    const bomb = document.getElementById('btn-bomb');
    freeze.classList.toggle('disabled', state.powerups.freeze <= 0);
    bomb.classList.toggle('disabled', state.powerups.bomb <= 0);
}

// ====================================
// FEEDBACK DISPLAY
// ====================================
const GAME_MESSAGES = {
    correct: [
        "👏 إمتاز! استمر هيج", "🌟 وحش ابو جاسم", "⚡ انت شكاكي", "🌟 جينات اينشتاين عندك؟",
        "رح تشكهم بالوزاري", "🔥 بطل", "💯 ممتاز!", "💪 ما تتوقف!", "🔥 عفية عليك!",
        "🚀 إشكلك مخلص المنهج قبل الأستاذ!", "🔥 الله يزوجك 4"
    ],
    wrong: [
        "🙄 السؤال يگلك: أرجوك بعد لا تجاوبني!", "⚡ بهاي السرعة جاوبت... شكلك مستغني عن الدرجة!",
        "💔 راح تبقى الإجابة بذاكرتك كصدمة عاطفية!", "🤦‍♂️ لو تخلي إيدك على عينك جان جاوبت صح",
        "😭 من جاوبت، الجملة جانت تبجي وتصيح: مو هيج الحل", "😅 همزين مو بالوزاري!",
        "🤣 بعدك بالسادس لو حوّلوك ابتدائي؟", "😳 جاوبت من جيبك؟ لأن الكتاب مابي هيج شي", "😬 آخ... طارت الدرجة!"
    ],
    streak: ["🔥🔥 ON FIRE!", "⚡ UNSTOPPABLE!", "💪 GODLIKE!", "🌟 LEGEND!"]
};

function showFeedback(correct, title) {
    const centerFeedback = document.getElementById('feedback-center');
    const feedbackBox = document.getElementById('feedback-box');
    const emojiEl = document.getElementById('feedback-emoji');
    const messageEl = document.getElementById('feedback-message');

    if (correct) {
        feedbackBox.className = 'correct pointer-events-auto shadow-2xl scale-100 rotate-2';
        emojiEl.innerText = "🤩";
        const msgList = state.streak.multiplier >= 4 ? GAME_MESSAGES.streak : GAME_MESSAGES.correct;
        messageEl.innerText = msgList[Math.floor(Math.random() * msgList.length)];
    } else {
        feedbackBox.className = 'wrong pointer-events-auto shadow-2xl scale-100 -rotate-2';
        emojiEl.innerText = "😱";
        messageEl.innerText = GAME_MESSAGES.wrong[Math.floor(Math.random() * GAME_MESSAGES.wrong.length)];
    }

    centerFeedback.classList.add('show');
    setTimeout(() => {
        centerFeedback.classList.remove('show');
        if (state.lives <= 0) {
            setTimeout(() => endLevel(), 300);
        } else {
            continueGame();
        }
    }, correct ? 1000 : 1500);
}

function showScorePopup(points, isStreak) {
    const qEl = document.getElementById('falling-question');
    const qRect = qEl.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'fixed z-[400] pointer-events-none font-black text-4xl animate-scoreUp';
    popup.style.left = (qRect.left + qRect.width / 2) + 'px';
    popup.style.top = qRect.top + 'px';
    popup.style.color = isStreak ? '#f97316' : '#10b981';
    popup.style.textShadow = '2px 2px 0px white, 0 0 20px currentColor';
    popup.innerText = `+${points}`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

// ====================================
// QUESTION COLORS
// ====================================
function updateQuestionColors() {
    const qEl = document.getElementById('falling-question');
    if (!qEl || qEl.classList.contains('hidden')) return;

    qEl.style.removeProperty('animation');

    if (state.qData && state.qData.golden) {
        qEl.classList.add('question-box');
        qEl.style.removeProperty('background');
        qEl.style.removeProperty('border');
        qEl.style.removeProperty('boxShadow');
        qEl.style.removeProperty('color');
    } else {
        qEl.classList.remove('question-box');
        if (state.dark) {
            qEl.style.background = '#1e293b';
            qEl.style.border = '4px solid #334155';
            qEl.style.boxShadow = '0 12px 0 #0f172a, 0 20px 25px -5px rgba(0, 0, 0, 0.5)';
            qEl.style.color = '#f8fafc';
        } else {
            qEl.style.background = '#ffffff';
            qEl.style.border = '4px solid #e5e7eb';
            qEl.style.boxShadow = '0 12px 0 #cbd5e1, 0 20px 25px -5px rgba(0, 0, 0, 0.15)';
            qEl.style.color = '#1f2937';
        }
    }
}

function updateFrozenQuestionColors() {
    const qEl = document.getElementById('falling-question');
    if (state.frozen) {
        qEl.classList.remove('question-box');
        qEl.style.background = state.dark ? 'linear-gradient(135deg, #1e3a8a, #1e40af)' : 'linear-gradient(135deg, #eff6ff, #dbeafe)';
        qEl.style.borderColor = '#60a5fa';
        qEl.style.boxShadow = state.dark ? '0 12px 0 #1e3a8a, 0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 12px 0 #bfdbfe, 0 20px 25px -5px rgba(59, 130, 246, 0.3)';
        qEl.style.color = state.dark ? '#dbeafe' : '#1e40af';
    }
}

// ====================================
// ANIMATIONS
// ====================================
function triggerShake(duration = 0.4) {
    document.body.style.animation = `shake ${duration}s`;
    setTimeout(() => { document.body.style.animation = ''; }, duration * 1000);
}

function shakeQuestion() {
    const qEl = document.getElementById('falling-question');
    qEl.style.animation = 'shake-question 0.6s ease-out';
    setTimeout(() => { qEl.style.animation = ''; }, 600);
}

function launchButtonToQuestion(btnEl, isCorrect) {
    const btnRect = btnEl.getBoundingClientRect();
    const qEl = document.getElementById('falling-question');
    const qRect = qEl.getBoundingClientRect();

    const deltaX = (qRect.left + qRect.width / 2) - (btnRect.left + btnRect.width / 2);
    const deltaY = (qRect.top + qRect.height / 2) - (btnRect.top + btnRect.height / 2);

    const flyingBtn = btnEl.cloneNode(true);
    flyingBtn.style.position = 'fixed';
    flyingBtn.style.left = btnRect.left + 'px';
    flyingBtn.style.top = btnRect.top + 'px';
    flyingBtn.style.width = btnRect.width + 'px';
    flyingBtn.style.height = btnRect.height + 'px';
    flyingBtn.style.zIndex = '300';
    flyingBtn.style.pointerEvents = 'none';
    flyingBtn.style.margin = '0';

    // Set custom properties for the animation
    flyingBtn.style.setProperty('--tx', `${deltaX}px`);
    flyingBtn.style.setProperty('--ty', `${deltaY}px`);

    if (isCorrect) {
        flyingBtn.style.backgroundColor = '#10b981';
        flyingBtn.style.color = 'white';
        flyingBtn.style.border = '4px solid #059669';
    } else {
        flyingBtn.style.backgroundColor = '#ef4444';
        flyingBtn.style.color = 'white';
        flyingBtn.style.border = '4px solid #dc2626';
    }

    flyingBtn.style.animation = 'spinProjectile 0.35s ease-in forwards';
    flyingBtn.style.boxShadow = '0 0 40px rgba(0,0,0,0.3)';

    document.body.appendChild(flyingBtn);
    btnEl.style.opacity = '0';

    setTimeout(() => {
        if (isCorrect) {
            qEl.style.animation = 'shake-question 0.3s ease-out';
            if (navigator.vibrate) navigator.vibrate(80);
        } else {
            qEl.style.animation = 'shake-question 0.4s ease-out';
            if (navigator.vibrate) navigator.vibrate(200);
        }
        flyingBtn.remove();
    }, 350);
}

// ====================================
// PARTICLES & BUBBLES
// ====================================
function initParticles() {
    const container = document.getElementById('particles-container');
    function createParticle() {
        const particle = document.createElement('div');
        const types = ['star', 'circle', 'triangle'];
        const type = types[Math.floor(Math.random() * types.length)];
        particle.className = `particle particle-${type}`;
        if (type === 'star') { particle.innerHTML = '✦'; }
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
        particle.style.animationDuration = `${Math.random() * 8 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(particle);
        setTimeout(() => { particle.remove(); }, 20000);
    }
    for (let i = 0; i < 25; i++) { setTimeout(() => createParticle(), i * 150); }
    setInterval(() => { if (state.playing) { createParticle(); } }, 2500);
}

function initBubbles() {
    const container = document.getElementById('bubbles-container');
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = Math.random() * 30 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${Math.random() * 15 + 12}s`;
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(bubble);
        setTimeout(() => { bubble.remove(); }, 30000);
    }
    for (let i = 0; i < 20; i++) { setTimeout(() => createBubble(), i * 200); }
    setInterval(() => { if (state.playing) { createBubble(); } }, 3000);
}

// ====================================
// STREAK UI
// ====================================
function updateStreakUI() {
    const circle = document.getElementById('streak-circle');
    const multiplier = document.getElementById('streak-multiplier');
    multiplier.textContent = state.streak.multiplier + 'X';
    circle.className = 'streak-circle level-' + state.streak.multiplier;
    updateStreakTimerBar();
}

function updateStreakTimerBar() {
    const fill = document.getElementById('streak-timer-fill');
    const percentage = Math.max(0, (state.streak.timeLeft / state.streak.maxTime) * 100);
    fill.style.width = percentage + '%';
}

// ====================================
// RESULTS SCREEN
// ====================================
function showResultsScreen(failed = false) {
    const resultsScreen = document.getElementById('results-screen');
    const totalQuestions = state.correctAnswers.length + state.wrongAnswers.length;

    document.getElementById('total-questions').innerText = totalQuestions;
    document.getElementById('correct-answers').innerText = state.correctAnswers.length;
    document.getElementById('wrong-answers').innerText = state.wrongAnswers.length;
    document.getElementById('final-score').innerText = state.score;

    // Show/hide Next Level button based on success and level
    const nextLevelBtn = document.getElementById('btn-next-level');
    if (nextLevelBtn) {
        // Show next level button only if:
        // 1. Player didn't fail (still has lives)
        // 2. Current level is not the last level (30)
        // 3. Player is not in demo mode or is logged in
        const canShowNextLevel = !failed && state.levelId !== null && state.levelId < 30;
        if (canShowNextLevel) {
            nextLevelBtn.classList.remove('hidden');
        } else {
            nextLevelBtn.classList.add('hidden');
        }
    }

    // Hide the falling question
    const qEl = document.getElementById('falling-question');
    if (qEl) qEl.classList.add('hidden');

    const errorsList = document.getElementById('errors-list');
    errorsList.innerHTML = '';

    // Show Game Over or Success header
    const headerEl = document.getElementById('results-header');
    if (headerEl) {
        if (state.isEndless) {
            headerEl.innerHTML = `
                <div class="text-4xl mb-2">👺</div>
                <h2 class="text-2xl font-black text-purple-600 ar-text">انتهى تحدي الوحش!</h2>
                <p class="text-slate-500 ar-text">وصلت إلى سكور: <span class="text-indigo-600 font-black">${state.score}</span></p>
            `;
        } else if (failed) {
            headerEl.innerHTML = '<div class="text-4xl mb-2">💔</div><h2 class="text-2xl font-black text-red-600 ar-text">خسرت المرحلة!</h2><p class="text-slate-500 ar-text">حاول مرة أخرى</p>';
        } else if (state.wrongAnswers.length === 0) {
            headerEl.innerHTML = '<div class="text-4xl mb-2">🏆</div><h2 class="text-2xl font-black text-green-600 ar-text">ممتاز!</h2><p class="text-slate-500 ar-text">أداء رائع!</p>';
        } else {
            headerEl.innerHTML = '<div class="text-4xl mb-2">⭐</div><h2 class="text-2xl font-black text-indigo-600 ar-text">أحسنت!</h2><p class="text-slate-500 ar-text">أنهيت المرحلة</p>';
        }
    }

    if (state.wrongAnswers.length === 0 && !failed) {
        errorsList.innerHTML = '<div class="text-center p-4"><p class="text-2xl font-black ar-text">🎉 مبروك! لا توجد أخطاء!</p></div>';
    } else {
        state.wrongAnswers.forEach((answer, index) => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-item';
            errorDiv.innerHTML = `
                <div class="font-black text-lg mb-2">${index + 1}. ${answer.question.q}</div>
                <div class="text-sm mb-2">
                    <span class="font-bold">إجابتك:</span> 
                    <span class="text-red-600 dark:text-red-400 font-bold">${answer.userAnswer || 'لم تجب'}</span>
                </div>
                <div class="text-sm mb-2">
                    <span class="font-bold">الإجابة الصحيحة:</span> 
                    <span class="text-green-600 dark:text-green-400 font-bold">${answer.question.a}</span>
                </div>
            `;
            errorsList.appendChild(errorDiv);
        });
    }

    resultsScreen.classList.add('show');
}
