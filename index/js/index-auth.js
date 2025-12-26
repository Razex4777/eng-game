// ====================================
// INDEX PAGE AUTH FUNCTIONS
// English Mastery Battle
// ====================================

// ====================================
// SUPABASE AUTH CHECK
// ====================================
async function checkSupabaseAuth() {
    try {
        if (!supabaseClient) {
            console.log("❌ Supabase not initialized");
            return false;
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        
        // No session = not logged in
        if (!session || !session.user) {
            console.log("❌ No active session - user not logged in");
            return false;
        }
        
        console.log("✅ Session found for:", session.user.email);
        
        // Check user exists in database
        const { data: userData, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
        
        if (error || !userData) {
            console.log("❌ User not found in database - needs to complete registration");
            // Prevent redirect loop - only redirect if not already redirected
            if (!sessionStorage.getItem('authRedirectAttempt')) {
                sessionStorage.setItem('authRedirectAttempt', 'true');
                window.location.href = '/login.html?incomplete=true';
            } else {
                console.log("⚠️ Already tried redirecting - showing guest mode");
                sessionStorage.removeItem('authRedirectAttempt');
                guestLogin(); // Fall back to guest mode
            }
            return false;
        }
        
        sessionStorage.removeItem('loginRedirectCount');
        
        // Check if profile is complete (must have phone AND full_name)
        if (!userData.phone || !userData.full_name) {
            console.log("❌ Profile incomplete - missing phone or name");
            window.location.href = '/login.html?incomplete=true';
            return false;
        }
        
        // User is fully authenticated!
        currentUserData = userData;
        console.log("✅ User fully authenticated:", userData.full_name);
        
        // Display save decision info (for debugging)
        console.log(`\n💾 User Save Status:`);
        console.log(`   👤 User ID: ${userData.id}`);
        console.log(`   📧 Email: ${userData.email}`);
        console.log(`   🎮 Is Guest: false`);
        console.log(`   📊 Total XP: ${userData.total_xp || 0}`);
        console.log(`   📍 Current Level: ${userData.current_level || 1}`);
        console.log(`   ⭐ Total Stars: ${userData.total_stars || 0}`);
        console.log(`   ✅ Will save progress: YES (registered user)`);
        
        // Show user info in UI
        const userNameEl = document.getElementById('user-name');
        const userTypeEl = document.getElementById('user-type-display');
        const userInfoEl = document.getElementById('user-info');
        
        if (userNameEl) userNameEl.textContent = userData.full_name;
        if (userTypeEl) userTypeEl.textContent = userData.full_name;
        if (userInfoEl) userInfoEl.classList.remove('hidden');
        
        // Update XP display
        const xpDisplay = document.getElementById('total-xp-display');
        if (xpDisplay) xpDisplay.textContent = userData.total_xp || 0;
        
        // Update profile card
        updateProfileCard(userData);
        
        // Load progress from Supabase
        await loadUserProgressSupabase(userData.id);
        
        return true;
        
    } catch (error) {
        console.error("❌ Auth check failed:", error);
        return false;
    }
}

// ====================================
// LOAD USER PROGRESS FROM SUPABASE
// ====================================
async function loadUserProgressSupabase(userId) {
    if (!userId) return;
    
    try {
        const { data: progress } = await supabaseClient
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);
        
        if (progress && progress.length > 0) {
            progress.forEach(p => {
                const stageIndex = state.levels.findIndex(l => l.id === p.stage_id);
                if (stageIndex !== -1) {
                    state.levels[stageIndex].status = 'completed';
                    state.levels[stageIndex].stars = p.stars || 0;
                    
                    // Unlock next stage
                    if (stageIndex + 1 < state.levels.length && p.stars >= 1) {
                        state.levels[stageIndex + 1].status = 'unlocked';
                    }
                }
            });
        }
        
        console.log("✅ Progress loaded from Supabase");
    } catch (error) {
        console.error("❌ Load progress failed:", error);
    }
}

// ====================================
// GUEST LOGIN
// ====================================
function guestLogin(skipAnimation = false) {
    state.isGuest = true;
    sessionStorage.setItem('guestMode', 'true');
    
    // Display save decision info (for debugging)
    console.log(`\n💾 Guest Save Status:`);
    console.log(`   👤 User ID: guest_${Date.now()}`);
    console.log(`   🎮 Is Guest: true`);
    console.log(`   📍 Can play: Level 0 (Demo) only`);
    console.log(`   ❌ Will save progress: NO (guest user)`);
    
    const userTypeEl = document.getElementById('user-type-display');
    const userInfoEl = document.getElementById('user-info');
    
    if (userTypeEl) userTypeEl.innerText = "زائر (Demo)";
    if (userInfoEl) userInfoEl.classList.remove('hidden');
    
    // Update profile card with demo info
    updateProfileCard(null);
    
    // Lock all stages except Demo (stage 0)
    state.levels.forEach((level, index) => {
        if (index === 0) {
            level.status = 'unlocked';
        } else {
            level.status = 'locked';
        }
    });
    
    renderLevels();
    
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }, 300);
}

// ====================================
// LOGOUT (Supabase)
// ====================================
async function logout() {
    try {
        sessionStorage.removeItem('guestMode');
        state.isGuest = false;
        
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        
        console.log("✅ Logged out successfully");
        window.location.href = '/login.html';
    } catch (error) {
        console.error("❌ Logout failed:", error);
        window.location.href = '/login.html';
    }
}
