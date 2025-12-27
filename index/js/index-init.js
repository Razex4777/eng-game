// ====================================
// INDEX PAGE INITIALIZATION
// English Mastery Battle
// ====================================

console.log('📄 index-init.js loaded successfully');

// ====================================
// INITIALIZATION FUNCTION
// ====================================
async function initializeIndex() {
    console.log('🚀 initializeIndex() called');
    // Load dark mode preference first
    loadDarkModePreference();

    // Initialize Supabase
    sb_client = initSB();

    // Check if guest mode
    const isGuest = sessionStorage.getItem('guestMode');
    const urlParams = new URLSearchParams(window.location.search);
    const isGuestUrl = urlParams.get('guest') === 'true';

    if (isGuest || isGuestUrl) {
        guestLogin(true);
        return;
    }

    // Prevent redirect loop
    const lastRedirect = sessionStorage.getItem('lastRedirectTime');
    const now = Date.now();
    if (lastRedirect && (now - parseInt(lastRedirect)) < 3000) {
        console.log("⚠️ Preventing redirect loop - showing guest mode");
        guestLogin(true);
        return;
    }

    // Check Supabase auth
    console.log('🔐 About to call checkSupabaseAuth()...');
    const isLoggedIn = await checkSupabaseAuth();
    console.log('🔐 checkSupabaseAuth() returned:', isLoggedIn);

    if (!isLoggedIn) {
        console.log('❌ Not logged in, redirecting to login...');
        sessionStorage.setItem('lastRedirectTime', now.toString());
        window.location.href = '../login.html?from=index';
        return;
    }

    console.log('✅ Auth successful, proceeding with level setup...');

    // Clear redirect flag on successful auth
    sessionStorage.removeItem('lastRedirectTime');

    // Restore level data from localStorage
    console.log('📦 Restoring level data from localStorage...');
    state.levels.forEach(level => {
        const savedStars = localStorage.getItem(`level_${level.id}_stars`);
        const completed = localStorage.getItem(`level_${level.id}_completed`);
        if (savedStars) level.stars = parseInt(savedStars);
        if (completed === 'true') {
            level.status = 'completed';
            const nextLevel = state.levels.find(l => l.id === level.id + 1);
            if (nextLevel) nextLevel.status = 'unlocked';
        }
    });

    // Ensure first level is unlocked
    if (state.levels[0].status === 'locked') {
        state.levels[0].status = 'unlocked';
    }

    console.log('🎮 About to call renderLevels()...');
    renderLevels();
    console.log('✅ renderLevels() completed');
}

// ====================================
// DOM CONTENT LOADED WITH FALLBACK
// ====================================
console.log('📋 Checking document ready state:', document.readyState);

if (document.readyState === 'loading') {
    console.log('⏳ DOM still loading, adding event listener...');
    document.addEventListener('DOMContentLoaded', initializeIndex);
} else {
    console.log('✅ DOM already loaded, initializing immediately...');
    initializeIndex();
}
