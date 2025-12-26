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
    
    // Ensure lives is never negative for display
    const livesCount = Math.max(0, state.lives);
    const filledStars = '❤️'.repeat(livesCount);
    const emptyStars = '🖤'.repeat(Math.max(0, 3 - livesCount));
    stars.innerHTML = filledStars + emptyStars;
    stars.className = `flex gap-0.5 text-lg ${livesCount <= 1 ? 'animate-pulse' : ''}`;
    
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
function showFeedback(correct, title) {
    const centerFeedback = document.getElementById('feedback-center');
    const feedbackBox = document.getElementById('feedback-box');
    const emojiEl = document.getElementById('feedback-emoji');
    const messageEl = document.getElementById('feedback-message');
    
    if (correct) {
        feedbackBox.className = 'correct pointer-events-auto';
        emojiEl.innerText = "✓";
        emojiEl.style.color = "#10b981";
        const msg = state.combo >= 3 ? getRandomMessage('streak') : getRandomMessage('correct');
        messageEl.innerText = msg;
        messageEl.style.color = "#059669";
    } else {
        feedbackBox.className = 'wrong pointer-events-auto';
        emojiEl.innerText = "✕";
        emojiEl.style.color = "#ef4444";
        const msg = getRandomMessage('wrong');
        messageEl.innerText = msg;
        messageEl.style.color = "#dc2626";
    }
    
    centerFeedback.classList.add('show');
    setTimeout(() => {
        centerFeedback.classList.remove('show');
        if (state.lives <= 0) {
            setTimeout(() => endLevel(), 300);
        } else {
            continueGame();
        }
    }, 1800);
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
    const deltaX = qRect.left + qRect.width/2 - (btnRect.left + btnRect.width/2);
    const deltaY = qRect.top + qRect.height/2 - (btnRect.top + btnRect.height/2);
    const flyingBtn = btnEl.cloneNode(true);
    
    flyingBtn.style.position = 'fixed';
    flyingBtn.style.left = btnRect.left + 'px';
    flyingBtn.style.top = btnRect.top + 'px';
    flyingBtn.style.width = btnRect.width + 'px';
    flyingBtn.style.height = btnRect.height + 'px';
    flyingBtn.style.zIndex = '100';
    flyingBtn.style.pointerEvents = 'none';
    
    if (isCorrect) {
        flyingBtn.style.transition = 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    } else {
        flyingBtn.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }
    
    document.body.appendChild(flyingBtn);
    btnEl.style.opacity = '0';
    
    setTimeout(() => {
        if (isCorrect) {
            flyingBtn.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;
            flyingBtn.style.opacity = '0';
        } else {
            flyingBtn.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.8)`;
        }
    }, 10);
    
    if (isCorrect) {
        setTimeout(() => {
            const qEl = document.getElementById('falling-question');
            qEl.style.animation = 'shake-question 0.3s ease-out';
            AudioSys.play(1200, 'square', 0.2, 0.3);
            setTimeout(() => {
                qEl.style.animation = '';
                flyingBtn.remove();
            }, 300);
        }, 350);
    } else {
        setTimeout(() => {
            AudioSys.play(300, 'sawtooth', 0.15, 0.15);
            qEl.style.animation = 'shake-question 0.4s ease-out';
            flyingBtn.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            flyingBtn.style.transform = `translate(0, 0) scale(1) rotate(${Math.random() * 40 - 20}deg)`;
            flyingBtn.style.opacity = '0';
            setTimeout(() => {
                qEl.style.animation = '';
                flyingBtn.remove();
            }, 400);
        }, 500);
    }
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
        if (failed) {
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
