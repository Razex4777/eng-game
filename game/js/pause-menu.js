// ====================================
// NEW PAUSE MENU LOGIC
// ====================================

let speedOpen = false;

function togglePauseMenu() {
    if (!state.playing) return;

    state.paused = !state.paused;
    const overlay = document.getElementById('pause-overlay');

    if (state.paused) {
        overlay.classList.remove('hidden');
        renderPauseMenu();
        if (state.animFrame) cancelAnimationFrame(state.animFrame);
    } else {
        overlay.classList.add('hidden');
        gameLoop();
    }
}

function renderPauseMenu() {
    const overlay = document.getElementById('pause-overlay');
    if (!overlay) return;

    // We'll use the HTML structure already in game.html, 
    // but update its internal content to match the new design.
    const isSoundOn = !state.muted;
    const currentSpeed = state.speedType || 'teen';

    overlay.innerHTML = `
        <div class="bg-white dark:bg-[#1E293B] w-full max-w-sm rounded-[2.5rem] shadow-2xl relative border-4 border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all scale-100 p-8">
            <div class="text-center mb-10">
                <h2 class="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-2">توقف مؤقت</h2>
                <p class="text-slate-400 dark:text-slate-500 font-bold">خذ نفساً عميقاً... ثم واصل!</p>
            </div>

            <div class="space-y-4">
                <!-- Resume Button -->
                <button onclick="togglePauseMenu()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl py-5 rounded-2xl shadow-[0_6px_0_#4338CA] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3">
                    <span>واصل اللعب</span>
                    <span class="text-2xl">▶️</span>
                </button>

                <!-- Speed Selector -->
                <div class="relative">
                    <button onclick="toggleSpeedMenu()" class="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-lg py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <div class="flex items-center gap-3">
                            <span id="current-speed-icon">${getSpeedIcon(currentSpeed)}</span>
                            <span>سرعة التحدي</span>
                        </div>
                        <span class="transform transition-transform ${speedOpen ? 'rotate-180' : ''}">▼</span>
                    </button>

                    <div id="speed-options" class="${speedOpen ? '' : 'hidden'} mt-2 p-2 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl space-y-1">
                        ${renderSpeedOption('baby', 'وضع الرضيع 👶', 'رحلة الألف ميل تبدأ بخطوة', currentSpeed)}
                        ${renderSpeedOption('teen', 'فتى (متوسط) 👱', 'للناس اللي قطعت شوط (هرولة)', currentSpeed)}
                        ${renderSpeedOption('beast', 'وضع الوحش 👹', 'للأبطال اللي يمشون ميل ميل!', currentSpeed)}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Sound Toggle -->
                    <button onclick="toggleSound()" class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span class="text-2xl">${isSoundOn ? '🔊' : '🔇'}</span>
                        <span class="text-xs">${isSoundOn ? 'الصوت يعمل' : 'الصوت مكتوم'}</span>
                    </button>

                    <!-- Exit Button -->
                    <button onclick="exitGame()" class="bg-red-50 dark:bg-red-900/20 text-red-500 font-black py-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <span class="text-2xl">🚪</span>
                        <span class="text-xs">خروج</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderSpeedOption(type, title, subtitle, current) {
    const isActive = type === current;
    return `
        <button onclick="setGameSpeed('${type}')" class="w-full p-3 rounded-xl flex items-center justify-between transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}">
            <div class="text-right">
                <h4 class="font-black text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}">${title}</h4>
                <p class="text-[10px] font-bold text-slate-400">${subtitle}</p>
            </div>
            ${isActive ? '✅' : ''}
        </button>
    `;
}

function getSpeedIcon(type) {
    if (type === 'baby') return '👶';
    if (type === 'beast') return '👹';
    return '👱';
}

function toggleSpeedMenu() {
    speedOpen = !speedOpen;
    renderPauseMenu();
}

function setGameSpeed(type) {
    const speeds = {
        'baby': 0.5,
        'teen': 0.8,
        'beast': 1.5
    };

    state.speed = speeds[type];
    state.speedType = type;
    speedOpen = false;
    renderPauseMenu();
}

function toggleSound() {
    state.muted = !state.muted;
    if (state.muted) {
        AudioSys.mute();
    } else {
        AudioSys.unmute();
    }
    renderPauseMenu();
}

function exitGame() {
    window.location.href = '../index/index.html';
}

// Override existing pause button listener
document.addEventListener('DOMContentLoaded', () => {
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
        pauseBtn.onclick = togglePauseMenu;
    }

    const resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn) {
        resumeBtn.onclick = togglePauseMenu;
    }
});
