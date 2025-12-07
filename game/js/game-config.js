// ====================================
// GAME CONFIGURATION
// English Mastery Battle
// ====================================

// ====================================
// SUPABASE CONFIGURATION
// ====================================
let supabaseClient = null;
let currentSupabaseUser = null;

// Stub for Firebase (to prevent errors - will be removed after full migration)
const firebaseDB = {
    ref: () => ({
        once: async () => ({ val: () => null }),
        set: async () => {},
        update: async () => {},
        transaction: async (fn) => fn(null)
    }),
    update: async () => {}
};

// Firebase namespace stub
const firebase = {
    database: {
        ServerValue: {
            increment: (n) => n,
            TIMESTAMP: Date.now()
        }
    }
};

// Check Supabase auth on load
async function checkGameAuth() {
    try {
        supabaseClient = initSupabase();
        if (!supabaseClient) {
            console.log("❌ Supabase not initialized");
            return false;
        }
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session || !session.user) {
            console.log("❌ No active session - user not logged in");
            return false;
        }
        
        console.log("✅ Game: Session found for:", session.user.email);
        currentSupabaseUser = session.user;
        
        // Get user data from database
        const { data: userData, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
        
        if (error || !userData) {
            console.log("❌ User not found in database - needs to complete registration");
            return false;
        }
        
        // Check if profile is complete (has phone and full_name)
        if (!userData.phone || !userData.full_name) {
            console.log("❌ Profile incomplete - needs to complete registration");
            return false;
        }
        
        // User is fully registered - save user data to state
        state.userId = userData.id;
        state.currentUserData = userData;  // Save full user data for Supabase operations
        state.demoMode = false;
        console.log("✅ Game: User fully authenticated:", userData.full_name);
        console.log("   📊 Total XP:", userData.total_xp || 0);
        console.log("   📍 Current Level:", userData.current_level || 1);
        return true;
        
    } catch (error) {
        console.error("❌ Game auth check failed:", error);
        return false;
    }
}

// ====================================
// DEMO DATA (for testing)
// ====================================
const DEMO_QUESTIONS = [
    { 
        id: "q1",
        q: "I ______ to the store yesterday.", 
        options: ["go", "went", "gone", "going"], 
        a: "went", 
        repeat: 8,
        explanation: "نستخدم 'went' لأنها الصيغة الماضية من الفعل 'go' ونحتاجها مع 'yesterday'"
    },
    { 
        id: "q2",
        q: "He's a very ______ person.", 
        options: ["interested", "interesting", "interest", "interests"], 
        a: "interesting", 
        repeat: 5,
        explanation: "نستخدم 'interesting' لوصف الشخص نفسه، بينما 'interested' تصف شعور الشخص"
    },
    { 
        id: "q3",
        q: "How ______ exercise does he take?", 
        options: ["many", "much", "more", "most"], 
        a: "much", 
        repeat: 12,
        explanation: "نستخدم 'much' مع الأسماء غير المعدودة مثل 'exercise'"
    },
    { 
        id: "q4",
        q: "This book is very ______.", 
        options: ["bored", "boring", "bores", "bore"], 
        a: "boring", 
        repeat: 4,
        explanation: "'boring' تصف الكتاب نفسه، بينما 'bored' تصف شعور القارئ"
    },
    { 
        id: "q5",
        q: "She ______ glasses before.", 
        options: ["wear", "used to wear", "wears", "is wearing"], 
        a: "used to wear", 
        repeat: 10,
        explanation: "نستخدم 'used to' للتعبير عن عادة في الماضي توقفت الآن"
    },
    { 
        id: "q6",
        q: "There's only a ______ juice left.", 
        options: ["few", "little", "many", "much"], 
        a: "little", 
        repeat: 6,
        explanation: "نستخدم 'a little' مع الأسماء غير المعدودة مثل 'juice'"
    },
    { 
        id: "q7",
        q: "While Ali was showering, someone ______.", 
        options: ["knock", "knocks", "knocked", "knocking"], 
        a: "knocked", 
        repeat: 4,
        explanation: "نستخدم الماضي البسيط 'knocked' للحدث الذي قاطع الحدث المستمر"
    },
    { 
        id: "q8",
        q: "The story was ______ written.", 
        options: ["beautiful", "beautifully", "beauty", "beautify"], 
        a: "beautifully", 
        repeat: 3,
        explanation: "نستخدم الظرف 'beautifully' لوصف الفعل 'written'"
    },
    { 
        id: "q9",
        q: "I like these shoes. Can I ______?", 
        options: ["try on them", "try them on", "try on it", "try it on"], 
        a: "try them on", 
        repeat: 9,
        explanation: "مع الأفعال المركبة والضمائر، نضع الضمير بين الفعل والحرف: 'try them on'"
    },
    { 
        id: "q10",
        q: "If I ______ you, I would study.", 
        options: ["am", "was", "were", "be"], 
        a: "were", 
        repeat: 7,
        explanation: "في الجمل الشرطية من النوع الثاني، نستخدم 'were' مع جميع الضمائر"
    },
    { 
        id: "q11",
        q: "My flight was ______ because it was twelve hours.", 
        options: ["tired", "more tired", "tiring", "most tiring"], 
        a: "tiring", 
        repeat: 2,
        explanation: "'tiring' تصف الرحلة نفسها، بينما 'tired' تصف شعور الشخص"
    },
    { 
        id: "q12",
        q: "It was the most ______ day of my life.", 
        options: ["frightened", "frightening", "more frightening", "most frightened"], 
        a: "frightening", 
        repeat: 11,
        explanation: "'frightening' تصف اليوم نفسه، بينما 'frightened' تصف شعور الشخص"
    },
    { 
        id: "q13",
        q: "We hope we can live ______ together.", 
        options: ["peaceful", "more peaceful", "peacefully", "most peacefully"], 
        a: "peacefully", 
        repeat: 3,
        explanation: "نستخدم الظرف 'peacefully' لوصف الفعل 'live'"
    },
    { 
        id: "q14",
        q: "I've already ______ the TV.", 
        options: ["turned on it", "turned it on", "it turned on", "on turned it"], 
        a: "turned it on", 
        repeat: 5,
        explanation: "مع الأفعال المركبة والضمائر، نضع الضمير بين الفعل والحرف"
    },
    { 
        id: "q15",
        q: "How ______ times a week do you wash your hair?", 
        options: ["much", "few", "many", "little"], 
        a: "many", 
        repeat: 4,
        explanation: "نستخدم 'many' مع الأسماء المعدودة مثل 'times'"
    }
];

// ====================================
// ENCOURAGEMENT MESSAGES
// ====================================
const ENCOURAGEMENT_MESSAGES = {
    correct: [
        "🚀 شكلك مخلص المنهج قبل الأستاذ!",
        "✨ عاشت ايدك!",
        "🔥 بطل!",
        "⚡ انت شكاكي!",
        "💯 ممتاز!",
        "🌟 رائع جداً!"
    ],
    streak: [
        "🔥 عفية عليك!",
        "👏 سويت ذا الوبرا بالامتحان!\nهيج استمر!",
        "🌟 انت الأول بالصف!",
        "💪 ما تنوقف!"
    ],
    wrong: [
        "🤣 بعدك بالسادس لو حوّلوك ابتدائي؟",
        "💔 راح تبقى الإجابة بذاكرتك\nكصدمة عاطفية!",
        "🙄 السؤال يگلك:\nأرجوك بعد لا تجاوبني!",
        "😅 همزين مو بالوزاري!",
        "😬 آخ... طارت الدرجة!",
        "🧐 جاوبت من جيبك؟\nلأن الكتاب مابي هيچ شي!",
        "🤦‍♂️ لو تخلي إيدك على عينك\nچان جاوبت صح!",
        "😭 من جاوبت، الجملة چانت تبچي\nوتصيح: مو هيچ الحل!",
        "⚡️ بهاي السرعة جاوبت...\nشكلك مستغني عن الدرجة!"
    ]
};

function getRandomMessage(type) {
    const messages = ENCOURAGEMENT_MESSAGES[type];
    if (!messages || messages.length === 0) return "";
    return messages[Math.floor(Math.random() * messages.length)];
}
