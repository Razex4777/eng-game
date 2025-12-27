// ====================================
// INDEX PAGE UI FUNCTIONS
// English Mastery Battle
// ====================================

// ====================================
// DARK MODE TOGGLE
// ====================================
function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('darkmode-icon');
    const bgContainer = document.getElementById('bg-container');

    body.classList.toggle('dark');

    if (body.classList.contains('dark')) {
        icon.textContent = '☀️';
        if (bgContainer) {
            bgContainer.className = 'fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10';
        }
        localStorage.setItem('indexDarkMode', 'true');
    } else {
        icon.textContent = '🌙';
        if (bgContainer) {
            bgContainer.className = 'fixed inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 -z-10';
        }
        localStorage.setItem('indexDarkMode', 'false');
    }
}

function loadDarkModePreference() {
    const isDark = localStorage.getItem('indexDarkMode') === 'true';
    const body = document.body;
    const icon = document.getElementById('darkmode-icon');
    const bgContainer = document.getElementById('bg-container');

    if (isDark) {
        body.classList.add('dark');
        if (icon) icon.textContent = '☀️';
        if (bgContainer) {
            bgContainer.className = 'fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-10';
        }
    }
}

// ====================================
// PROFILE CARD
// ====================================
function toggleProfileCard() {
    const card = document.getElementById('profile-card');
    card.classList.toggle('hidden');
}

function updateProfileCard(userData) {
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const avatarEl = document.getElementById('profile-avatar');
    const xpEl = document.getElementById('profile-xp');
    const levelEl = document.getElementById('profile-level');
    const starsEl = document.getElementById('profile-stars');

    // Check if guest/demo mode
    if (state.isGuest || !userData) {
        if (nameEl) nameEl.textContent = '🎮 وضع التجربة';
        if (emailEl) emailEl.textContent = 'سجّل دخولك لحفظ تقدمك!';
        if (avatarEl) {
            avatarEl.src = 'https://ui-avatars.com/api/?name=Demo&background=8b5cf6&color=fff&bold=true';
        }
        if (xpEl) xpEl.textContent = '0';
        if (levelEl) levelEl.textContent = 'Demo';
        if (starsEl) starsEl.textContent = '0';
        return;
    }

    if (nameEl) nameEl.textContent = userData.full_name || 'مستخدم';
    if (emailEl) emailEl.textContent = userData.email || '';
    if (avatarEl) {
        avatarEl.src = userData.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.full_name || 'U') + '&background=6366f1&color=fff';
    }
    if (xpEl) xpEl.textContent = userData.total_xp || 0;
    if (levelEl) levelEl.textContent = userData.current_level || 1;
    if (starsEl) starsEl.textContent = userData.total_stars || 0;
}

// ====================================
// CUSTOM TOAST/POPUP
// ====================================
function showSuccessPopup(message, emoji = '✅') {
    // Remove any existing popup
    const existing = document.getElementById('success-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'success-popup';
    popup.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 2.5rem 3rem;
                border-radius: 2rem;
                text-align: center;
                color: white;
                box-shadow: 0 25px 80px rgba(16, 185, 129, 0.5);
                transform: scale(1);
                animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                max-width: 90%;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounce 0.6s ease;">${emoji}</div>
                <h2 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; direction: rtl;">${message}</h2>
                <button onclick="this.closest('#success-popup').remove()" style="
                    background: white;
                    color: #059669;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 1rem;
                    font-weight: 900;
                    font-size: 1rem;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    حسناً 👍
                </button>
            </div>
        </div>
        <style>
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        </style>
    `;
    document.body.appendChild(popup);

    // Auto-close after 4 seconds
    setTimeout(() => {
        if (popup.parentNode) {
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.3s';
            setTimeout(() => popup.remove(), 300);
        }
    }, 4000);
}

// ====================================
// FEEDBACK MODAL
// ====================================
function openFeedbackModal() {
    document.getElementById('feedback-modal').classList.remove('hidden');
}

function closeFeedbackModal() {
    document.getElementById('feedback-modal').classList.add('hidden');
}

async function submitFeedback() {
    const text = document.getElementById('feedback-text').value;
    if (!text.trim()) return;

    const btn = document.querySelector('#feedback-modal button:last-child');
    const originalText = btn.innerHTML;
    btn.innerHTML = "جاري الإرسال...";
    btn.disabled = true;

    try {
        if (!sb_client || !currentUserData) {
            throw new Error("User not authenticated or client missing");
        }

        const { error } = await sb_client.from('suggestions').insert({
            user_id: currentUserData.id,
            user_email: currentUserData.email,
            user_name: currentUserData.full_name,
            content: text
        });

        if (error) throw error;

        document.getElementById('feedback-text').value = "";
        closeFeedbackModal();
        showSuccessPopup("شكراً لك! تم استلام اقتراحك 💚", "🎉");
    } catch (error) {
        console.error("❌ Submit feedback failed:", error);
        closeFeedbackModal();
        // Show error popup (reusing success popup style but with error message/color if possible, or just standard alert for now)
        // Since we don't have a specific error popup, we'll use a modified message
        showSuccessPopup("عذراً، حدث خطأ أثناء الإرسال ❌", "⚠️");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ====================================
// FULLSCREEN TOGGLE
// ====================================
function toggleFullScreen() {
    const element = document.documentElement;

    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
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

// ====================================
// LEVEL RENDERING
// ====================================
function renderLevels() {
    console.log('🎮 renderLevels called');
    console.log('📊 state.levels:', state.levels);

    const container = document.getElementById('levels-grid');
    if (!container) {
        console.error('❌ levels-grid container not found!');
        return;
    }
    container.innerHTML = '';

    // Reverse order: stages from 30 to 1
    // Stage 1 appears at bottom
    for (let i = state.levels.length - 1; i >= 0; i--) {
        console.log(`🏗️ Creating level card for index ${i}, level:`, state.levels[i]);
        const card = createLevelCard(state.levels[i]);
        container.appendChild(card);
    }

    // Auto-scroll to bottom (Stage 1)
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

function createLevelCard(level) {
    const card = document.createElement('div');
    let isLocked = level.status === "locked";

    let bgClass, borderClass, shadowClass;

    if (isLocked) {
        bgClass = "bg-slate-300";
        borderClass = "border-slate-400";
        shadowClass = "";
    } else {
        // Color based on stars earned:
        // 3 stars = Green (perfect)
        // 2 stars = Yellow/Orange (good)
        // 1 star = Blue (passed)
        // 0 stars = Purple/Indigo (unlocked but not played or failed)
        if (level.stars >= 3) {
            bgClass = "bg-green-500";
            borderClass = "border-green-400";
        } else if (level.stars === 2) {
            bgClass = "bg-yellow-500";
            borderClass = "border-yellow-400";
        } else if (level.stars === 1) {
            bgClass = "bg-blue-500";
            borderClass = "border-blue-400";
        } else {
            bgClass = "bg-indigo-500";
            borderClass = "border-indigo-400";
        }
        shadowClass = "hover:scale-105 cursor-pointer shadow-xl";
    }

    card.id = `level-${level.id}`;
    // Mobile-first: smaller cards on mobile, larger on desktop
    card.className = `relative w-40 sm:w-56 md:w-64 h-52 sm:h-72 md:h-80 flex flex-col items-center shrink-0 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[3rem] border-4 sm:border-[6px] md:border-[8px] transition-all duration-300 transform ${bgClass} ${borderClass} ${shadowClass} ${isLocked ? 'card-locked' : ''}`;

    // Glossy effect
    const glossy = document.createElement('div');
    glossy.className = `absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 w-4/5 h-1/4 rounded-t-[1rem] sm:rounded-t-[2rem] pointer-events-none bg-gradient-to-b from-white/30 to-transparent`;
    card.appendChild(glossy);

    // Middle section with level number
    const middleSection = document.createElement('div');
    middleSection.className = 'flex-1 flex items-center justify-center w-full relative';
    const numberText = document.createElement('span');
    // Show "Demo" for level 0, otherwise show the level number
    // Mobile-first: smaller text on mobile
    if (level.id === 0) {
        numberText.className = `font-black text-[1.75rem] sm:text-[2.5rem] md:text-[3rem] text-white/90 drop-shadow-md`;
        numberText.textContent = 'Demo';
    } else {
        numberText.className = `font-black text-[4rem] sm:text-[6rem] md:text-[8rem] text-white/90 drop-shadow-md`;
        numberText.textContent = level.id;
    }
    numberText.style.fontFamily = "'Nunito', sans-serif";
    middleSection.appendChild(numberText);

    // Lock icon for locked levels (smaller on mobile)
    if (isLocked) {
        middleSection.innerHTML += `<div class="absolute inset-0 flex items-center justify-center z-20"><span class="text-4xl sm:text-5xl md:text-7xl opacity-60">🔒</span></div>`;
    }
    card.appendChild(middleSection);

    // Stars section (smaller on mobile)
    const starsSection = document.createElement('div');
    starsSection.className = `w-full mt-auto rounded-b-[1.5rem] sm:rounded-b-[2.5rem] flex items-end justify-between px-3 sm:px-6 pb-3 sm:pb-6`;
    for (let i = 0; i < 3; i++) {
        const isFilled = i < level.stars;
        const fill = isFilled ? "#fbbf24" : "rgba(0,0,0,0.2)";
        const stroke = isFilled ? "#f59e0b" : "rgba(255,255,255,0.4)";

        // Smaller stars on mobile
        starsSection.innerHTML += `
            <svg class="w-7 h-7 sm:w-10 sm:h-10 md:w-[45px] md:h-[45px]" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>`;
    }
    card.appendChild(starsSection);

    // Click handler for unlocked levels
    if (!isLocked) {
        card.onclick = () => {
            // Level 0 for guests uses special demo URL
            if (level.id === 0 && state.isGuest) {
                window.location.href = `../game/game.html?level=0&guest=true`;
            } else {
                window.location.href = `../game/game.html?level=${level.id}`;
            }
        };
    }
    return card;
}
