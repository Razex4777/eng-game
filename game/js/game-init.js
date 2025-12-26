// ====================================
// GAME INITIALIZATION
// English Mastery Battle
// ====================================

// ====================================
// DOM CONTENT LOADED
// ====================================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM Content Loaded - Initializing game...');
    
    // Initialize Audio
    try { AudioSys.init(); } catch(e) { console.log('Audio init failed:', e); }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    const body = document.body;
    
    if (savedTheme === 'dark') {
        state.dark = true;
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        setTimeout(() => {
            const btn = document.getElementById('btn-darkmode');
            if (btn) btn.innerHTML = "☀️";
        }, 100);
    }
    console.log('🎨 Theme loaded:', savedTheme);
    
    // Get level from URL first (priority), then localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const levelFromUrl = urlParams.get('level');
    
    if (levelFromUrl !== null) {
        // URL has priority
        state.levelId = parseInt(levelFromUrl);
        console.log(`📍 Level from URL: ${state.levelId}`);
    } else {
        // Fallback to localStorage
        const selectedLevel = localStorage.getItem('selectedLevel');
        if (selectedLevel && parseInt(selectedLevel) > 0) {
            state.levelId = parseInt(selectedLevel);
            console.log(`📍 Level from localStorage: ${state.levelId}`);
        } else {
            // Default to level 1 for registered users (not 0)
            state.levelId = 1;
            console.log('📍 Default Level: 1');
        }
    }
    
    // Initialize Supabase auth
    console.log('🔄 Initializing Supabase...');
    const authOk = await initializeSupabaseGame();
    if (!authOk) return;
    console.log('✅ Supabase initialized');
    
    // Load game settings from Supabase (including speed)
    await loadGameSettings();
    
    // Load encouragement messages from Supabase
    if (typeof loadEncouragementMessages === 'function') {
        await loadEncouragementMessages();
    }
    
    // Show how to play screen
    document.getElementById('howtoplay-screen').classList.remove('hidden');
    console.log('✅ How to play screen shown');
    console.log('📦 Ready to start game!');
});

// ====================================
// EVENT LISTENERS
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    // Start button
    document.getElementById('btn-start-game').onclick = async () => {
        console.log('🚀 START button clicked!');
        document.getElementById('howtoplay-screen').classList.add('hidden');
        await startGame();
        initBubbles();
        initParticles();
        console.log('✅ Game started!');
    };

    // Pause/Resume
    document.getElementById('btn-pause').onclick = togglePause;
    document.getElementById('btn-resume').onclick = togglePause;

    // Dark mode
    document.getElementById('btn-darkmode').onclick = toggleDarkMode;

    // Mute
    document.getElementById('btn-mute').onclick = toggleMute;

    // Powerups
    document.getElementById('btn-freeze').onclick = useFreeze;
    document.getElementById('btn-bomb').onclick = useBomb;

    // Results screen buttons
    document.getElementById('btn-play-again').onclick = playAgain;
    document.getElementById('btn-main-menu').onclick = goToMainMenu;
    document.getElementById('btn-next-level').onclick = goToNextLevel;

    // Fullscreen events
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
    document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
    document.addEventListener('MSFullscreenChange', updateFullscreenIcon);
});
