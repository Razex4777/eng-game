// ====================================
// GAME CONTROLS
// English Mastery Battle
// ====================================

// ====================================
// PAUSE/RESUME
// ====================================
function togglePause() {
    if (!state.playing || state.waiting) return;
    state.paused = !state.paused;
    const overlay = document.getElementById('pause-overlay');
    const fallingQuestion = document.getElementById('falling-question');
    const optionsGrid = document.getElementById('options-grid');
    const streakTimer = document.getElementById('streak-timer');
    
    if (state.paused) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        // FORCE hide falling question and options when paused
        if (fallingQuestion) {
            fallingQuestion.style.display = 'none';
            fallingQuestion.style.visibility = 'hidden';
            fallingQuestion.style.opacity = '0';
        }
        if (optionsGrid) optionsGrid.style.display = 'none';
        if (streakTimer) streakTimer.style.display = 'none';
        if (state.animFrame) cancelAnimationFrame(state.animFrame);
        if (state.streak.timer) clearInterval(state.streak.timer);
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        // Show falling question and options when resumed
        if (fallingQuestion) {
            fallingQuestion.style.display = 'block';
            fallingQuestion.style.visibility = 'visible';
            fallingQuestion.style.opacity = '1';
        }
        if (optionsGrid) optionsGrid.style.display = 'grid';
        if (streakTimer) streakTimer.style.display = 'flex';
        if (state.streak.active) {
            state.streak.startTime = Date.now() - (state.streak.maxTime - state.streak.timeLeft);
            runStreakTimer();
        }
        gameLoop();
    }
}

// ====================================
// DARK MODE TOGGLE
// ====================================
function toggleDarkMode() {
    state.dark = !state.dark;
    
    if (state.dark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode', 'dark');
    } else {
        document.body.classList.remove('dark-mode', 'dark');
        document.body.classList.add('light-mode');
    }
    
    document.getElementById('btn-darkmode').innerHTML = state.dark ? "☀️" : "🌙";
    
    localStorage.setItem('theme', state.dark ? 'dark' : 'light');
    
    if (state.frozen) {
        updateFrozenQuestionColors();
    } else if (state.playing && !state.waiting) {
        updateQuestionColors();
    }
}

// ====================================
// MUTE TOGGLE
// ====================================
function toggleMute() {
    state.muted = !state.muted;
    document.getElementById('sound-status').innerHTML = state.muted ? "UNMUTE SOUND 🔇" : "MUTE SOUND 🔊";
}

// ====================================
// FREEZE POWERUP
// ====================================
function useFreeze() {
    console.log('❄️ Freeze button clicked');
    if (state.powerups.freeze > 0 && !state.frozen && state.playing && !state.waiting && !state.paused) {
        console.log('✅ Activating freeze...');
        state.powerups.freeze--;
        state.frozen = true;
        AudioSys.freeze();
        updateHUD();
        updateFrozenQuestionColors();
        
        if (state.freezeTimeout) clearTimeout(state.freezeTimeout);
        state.freezeTimeout = setTimeout(() => {
            if (state.playing && !state.waiting) {
                state.frozen = false;
                updateQuestionColors();
                console.log('✅ Freeze ended');
            }
        }, 5000);
    }
}

// ====================================
// BOMB POWERUP
// ====================================
function useBomb() {
    console.log('💣 Bomb button clicked');
    if (state.powerups.bomb > 0 && state.playing && !state.waiting && !state.paused) {
        console.log('✅ Activating bomb...');
        const grid = document.getElementById('options-grid');
        const btns = Array.from(grid.children);
        
        const wrong = btns.filter(b => b.dataset.text !== state.qData.a);
        
        if (wrong.length >= 2) {
            state.powerups.bomb--;
            AudioSys.pop();
            updateHUD();
            wrong.sort(() => Math.random() - 0.5);
            wrong.slice(0, 2).forEach(b => {
                b.style.opacity = '0.3';
                b.style.pointerEvents = 'none';
                b.style.filter = 'grayscale(100%)';
            });
        }
    }
}

// ====================================
// FULLSCREEN TOGGLE
// ====================================
function toggleFullScreen() {
    const btn = document.getElementById('fullscreen-btn');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        
        if (btn) {
            btn.classList.remove('pulse');
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function updateFullscreenIcon() {
    const btn = document.getElementById('fullscreen-btn');
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                            document.mozFullScreenElement || document.msFullscreenElement);
    
    if (btn) {
        if (isFullscreen) {
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
            btn.title = "الخروج من ملء الشاشة / Exit Fullscreen";
        } else {
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            `;
            btn.title = "ملء الشاشة / Fullscreen";
        }
    }
}

// ====================================
// MAIN MENU / PLAY AGAIN
// ====================================
function goToMainMenu() {
    // NO SAVING FOR DEMO MODE
    if (state.demoMode || state.levelId === 0) {
        console.log("🎮 Demo mode - no progress saved");
        window.location.href = '../index/index.html';
        return;
    }
    
    const totalQuestions = state.correctAnswers.length + state.wrongAnswers.length;
    const correctPercentage = totalQuestions > 0 ? (state.correctAnswers.length / totalQuestions) * 100 : 0;
    
    let stars = 0;
    if (correctPercentage >= 90 && state.lives === 3) {
        stars = 3;
    } else if (correctPercentage >= 70) {
        stars = 2;
    } else if (correctPercentage >= 50) {
        stars = 1;
    }
    
    // Save progress to localStorage (for real levels only)
    localStorage.setItem(`level_${state.levelId}_stars`, stars);
    localStorage.setItem(`level_${state.levelId}_completed`, 'true');
    console.log(`💾 Level ${state.levelId} completed with ${stars} stars`);
    
    window.location.href = '../index/index.html';
}

function playAgain() {
    document.getElementById('results-screen').classList.remove('show');
    startGame();
}

// ====================================
// GO TO NEXT LEVEL
// ====================================
function goToNextLevel() {
    if (state.levelId === null || state.levelId >= 30) {
        // If no level or last level, go to main menu
        goToMainMenu();
        return;
    }
    
    const nextLevelId = state.levelId + 1;
    console.log(`➡️ Going to next level: ${nextLevelId}`);
    
    // Navigate to next level
    window.location.href = `game.html?level=${nextLevelId}`;
}
