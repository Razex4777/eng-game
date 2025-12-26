// ====================================
// INDEX PAGE CONFIGURATION
// English Mastery Battle
// ====================================

// ====================================
// SUPABASE REFERENCE
// ====================================
let supabaseClient;
let currentUserData = null;

// ====================================
// GAME STATE
// ====================================
let state = {
    isGuest: false,
    levels: [
        // Demo Stage (0)
        { id: 0, stars: 0, status: "unlocked", title: "Demo" },
        // Regular Stages 1-30
        ...Array.from({ length: 30 }, (_, i) => ({ 
            id: i + 1, 
            stars: 0, 
            status: "locked", 
            title: (i + 1).toString() 
        }))
    ],
    totalXP: 0
};
