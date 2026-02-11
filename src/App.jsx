import React, { useState, useEffect } from 'react';
import { Fingerprint, Send, X } from 'lucide-react';

// Components
import { SoftBackground, ToastNotification, TactileButton } from './components/ui';
import { BottomDock, TopNav } from './components/layout';
import { SettingsModal } from './components/settings';
import { MonsterChallengeLoader, WrongAnswersReviewMode } from './components/game';

// Views
import { LoginView, ChaptersView, LevelsView, ReviewsView, BattleArenaModal, HomeView } from './views';

// Hooks & Auth
import { useDarkMode, useToast, useAudioMute } from './hooks';
import { signInWithGoogle, signOut, onAuthStateChange, getOrCreateProfile, updateProfile } from './lib/auth';
import { getWrongAnswersCount } from './services/wrongAnswersService';
import { getUserDashboardStats, initializeUserStats, getLastPlayedPart, getOverallProgress } from './services/userProgressService';

/**
 * Main App Component
 * Root component managing navigation and global state
 */
function App() {
    // Navigation State
    const [currentView, setCurrentView] = useState('login'); // login, home, chapters, levels, game
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [gameMode, setGameMode] = useState(null); // 'finite' or 'infinite'
    const [showTutorial, setShowTutorial] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [monsterSheetOpen, setMonsterSheetOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [showReviewMode, setShowReviewMode] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [seenTooltips, setSeenTooltips] = useState({
        monster: false,
        chapters: false,
        reviews: false,
        fingerprint: false,
        daily: false,
        mistakes: false
    });

    // User State
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [userData, setUserData] = useState(null);
    const [authUser, setAuthUser] = useState(null); // Supabase auth user
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // App-wide Settings
    const { isDarkMode, toggleDarkMode } = useDarkMode(false);
    const { isMuted, toggleMute } = useAudioMute();
    const { toast, showToast, hideToast } = useToast();

    // User Stats (fetched from Supabase)
    const [userStats, setUserStats] = useState({
        streakDays: 0,
        totalQuestions: 0,
        totalXP: 0,
        dailyTasksDone: 0,
        dailyTasksTotal: 5,
        mistakesToReview: 0,
        subjectProgress: {},
        overallProgress: 0,
        lastPlayedPart: null
    });
    const [statsLoading, setStatsLoading] = useState(false);

    // Fetch user stats from Supabase when authenticated
    useEffect(() => {
        const fetchUserStats = async () => {
            if (!authUser?.id) {
                return;
            }

            setStatsLoading(true);
            try {
                // Initialize stats record if needed
                await initializeUserStats(authUser.id);

                // Fetch dashboard stats
                const { data: stats } = await getUserDashboardStats(authUser.id);

                // Fetch overall progress
                const { data: overallProgress } = await getOverallProgress(authUser.id);

                // Fetch last played part for Continue Journey
                const { data: lastPlayedPart } = await getLastPlayedPart(authUser.id, 'english');

                if (stats) {
                    setUserStats({
                        streakDays: stats.streak_days || 0,
                        totalQuestions: stats.total_questions || 0,
                        totalXP: stats.total_xp || 0,
                        dailyTasksDone: stats.daily_tasks_done || 0,
                        dailyTasksTotal: stats.daily_tasks_total || 5,
                        mistakesToReview: stats.mistakes_to_review || 0,
                        subjectProgress: stats.subject_progress || {},
                        overallProgress: overallProgress || 0,
                        lastPlayedPart: lastPlayedPart
                    });
                }
            } catch (err) {
                console.error('[App] Failed to fetch user stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchUserStats();
    }, [authUser?.id]);

    // Listen to Supabase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (event, session) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('Auth event:', event, session?.user?.id);
            }

            if (event === 'SIGNED_IN' && session?.user) {
                // User signed in
                setAuthUser(session.user);

                // Get or create profile
                const { profile, error } = await getOrCreateProfile(session.user);

                if (error) {
                    console.error('Error fetching/creating profile:', error);
                }

                const name = profile?.full_name ||
                    session.user.user_metadata?.full_name ||
                    session.user.email?.split('@')[0] ||
                    'لاعب';

                const avatar = profile?.avatar_url ||
                    session.user.user_metadata?.avatar_url ||
                    session.user.user_metadata?.picture ||
                    null;

                setUserData({
                    id: session.user.id,
                    auth_id: session.user.id, // For Supabase queries
                    name: name,
                    email: session.user.email,
                    avatar: avatar,
                    age: profile?.age,
                    gender: profile?.gender,
                    governorate: profile?.region, // DB 'region' maps to UI 'governorate'
                    preferred_subject: profile?.preferred_subject || 'english'
                });

                setIsLoggedIn(true);

                // If profile is new or missing details, stay on login to show registration steps
                if (!profile?.age || !profile?.region) {
                    setCurrentView('login');
                    // We don't show toast yet, they need to finish registration
                } else {
                    setCurrentView('home');
                    showToast(`أهلاً بك مجدداً ${name}! 👋`, 'success');
                }

                setShowLoginModal(false);
            } else if (event === 'SIGNED_OUT') {
                // User signed out
                setAuthUser(null);
                setUserData(null);
                setIsLoggedIn(false);
                setCurrentView('login');
            }

            setAuthLoading(false);
        });



        return () => unsubscribe();
    }, []);

    // Google Sign In Handler
    const handleGoogleSignIn = async () => {
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                console.error('Google sign-in error:', error);
                showToast('حصل خطأ في تسجيل الدخول 😔', 'error');
            }
            // Auth state change listener will handle the rest
        } catch (error) {
            console.error('Sign-in error:', error);
            showToast('حصل خطأ في تسجيل الدخول', 'error');
        }
    };

    // Login Handler
    const handleLoginSuccess = async (data) => {
        setIsLoggedIn(true);

        const mergedData = { ...userData, ...data };
        setUserData(mergedData);
        setCurrentView('home');

        // If they are logged in via Supabase, sync their profile data
        if (authUser) {
            try {
                const { error } = await updateProfile(authUser.id, {
                    full_name: data.name || mergedData.name,
                    age: parseInt(data.age) || null,
                    gender: data.gender || null,
                    region: data.governorate || null, // UI 'governorate' matches DB 'region'
                    is_demo_completed: true // Mark profile as complete
                });

                if (error) throw error;
                console.log('Profile synced to Supabase successfully');
            } catch (error) {
                console.error('Failed to sync profile to Supabase:', error);
            }
        }

        localStorage.setItem('user_registered', 'true');
        localStorage.setItem('user_name', data.name || mergedData.name);
        showToast(`تم حفظ معلوماتك بنجاح! 🎉`, 'success');
    };

    // Navigation Handlers
    const handleNavigate = (view) => {
        setCurrentView(view);
        if (view === 'home') {
            setSelectedChapter(null);
            setGameMode(null);
        }
    };

    // Game configuration for chapters/reviews
    const [chapterGameConfig, setChapterGameConfig] = useState(null);

    const handleChapterClick = (chapterNum, subject = 'english') => {
        setSelectedChapter(chapterNum);
        setChapterGameConfig(prev => ({ ...prev, subject }));
        setCurrentView('levels');
    };

    const handleLevelClick = (levelData) => {
        // levelData contains: { id, partNumber, chapterNum, subject, type }
        setChapterGameConfig({
            subject: levelData.subject || 'english',
            type: levelData.type || 'chapters',
            part: levelData.partNumber || levelData.id,
            chapterNum: levelData.chapterNum,
            gameMode: 'finite' // 3 lives mode for chapters
        });
        setGameMode('finite');
        setCurrentView('game');
        showToast('حظاً موفقاً! 🚀', 'fire');
    };

    const handleContinueJourney = async () => {
        // Load last played or first incomplete part
        const { data: lastPart } = await getLastPlayedPart(authUser?.id, userData?.preferred_subject || 'english');

        if (lastPart) {
            handleLevelClick({
                id: lastPart.part,
                partNumber: lastPart.part,
                chapterNum: lastPart.chapterNumber || 1,
                subject: lastPart.subject,
                type: lastPart.type
            });
        } else {
            // Fallback to first part if no data
            handleLevelClick({
                id: 1,
                partNumber: 1,
                chapterNum: 1,
                subject: userData?.preferred_subject || 'english',
                type: 'chapters'
            });
        }
    };

    const handleReviewClick = (reviewData) => {
        // Handle wrong answers review separately
        if (reviewData.type === 'wrongAnswers') {
            setReviewData(reviewData);
            setShowReviewMode(true);
            showToast('ابدأ مراجعة أخطائك! 📦', 'fire');
            return;
        }

        // Handle halfyear/fullyear reviews
        setChapterGameConfig({
            subject: reviewData.subject || 'english',
            type: reviewData.type, // 'halfyear' or 'fullyear'
            part: reviewData.part,
            gameMode: 'finite'
        });
        setGameMode('finite');
        setCurrentView('game');
        showToast('حظاً موفقاً في المراجعة! 📚', 'fire');
    };

    const [showBattleArena, setShowBattleArena] = useState(false);

    const handleMonsterChallenge = () => {
        setShowBattleArena(true);
    };

    const handleGameExit = async () => {
        setCurrentView('home');
        setGameMode(null);

        // Refresh user stats after game
        if (authUser?.id) {
            try {
                const { data: stats } = await getUserDashboardStats(authUser.id);
                if (stats) {
                    setUserStats({
                        streakDays: stats.streak_days || 0,
                        totalQuestions: stats.total_questions || 0,
                        totalXP: stats.total_xp || 0,
                        dailyTasksDone: stats.daily_tasks_done || 0,
                        dailyTasksTotal: stats.daily_tasks_total || 5,
                        mistakesToReview: stats.mistakes_to_review || 0,
                        subjectProgress: stats.subject_progress || {}
                    });
                }
            } catch (err) {
                console.error('[App] Failed to refresh stats after game:', err);
            }
        }
    };

    // Show Login Modal for restricted features
    const handleShowLogin = () => {
        setShowLoginModal(true);
    };

    // Feature click handling
    const handleFeatureClick = (feature) => {
        setSeenTooltips(prev => ({ ...prev, [feature]: true }));
        return true;
    };

    // Logout
    const handleLogout = async () => {
        try {
            if (authUser) {
                await signOut();
            }
            setIsLoggedIn(false);
            setUserData(null);
            setAuthUser(null);
            localStorage.removeItem('user_registered');
            localStorage.removeItem('user_name');
            setCurrentView('login');
            showToast('تم تسجيل الخروج 👋', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            showToast('حصل خطأ في تسجيل الخروج', 'error');
        }
    };

    // Loading state
    if (authLoading) {
        return (
            <div className={`min-h-screen w-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <SoftBackground isDarkMode={isDarkMode} />
                <div className="text-center z-10 animate-pulse">
                    <div className="w-20 h-20 mx-auto bg-yellow-400 rounded-[1.5rem] flex items-center justify-center shadow-lg mb-4">
                        <span className="text-3xl">✓</span>
                    </div>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        جاري التحميل...
                    </p>
                </div>
            </div>
        );
    }

    // Render based on current view
    const renderContent = () => {
        // Login View
        if (currentView === 'login' || showLoginModal) {
            return (
                <div className={`min-h-screen w-full ${showLoginModal ? 'fixed inset-0 z-[100]' : ''}`}>
                    <SoftBackground isDarkMode={isDarkMode} />
                    <LoginView
                        isDarkMode={isDarkMode}
                        onLoginSuccess={(data) => {
                            handleLoginSuccess(data);
                            setShowLoginModal(false);
                        }}
                        onGoogleSignIn={handleGoogleSignIn}
                        initialData={userData}
                    />
                    {showLoginModal && (
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 right-4 text-3xl text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            );
        }

        // Wrong Answers Review Mode - Full Screen
        if (showReviewMode && reviewData) {
            return (
                <WrongAnswersReviewMode
                    userId={authUser?.id}
                    wrongAnswerId={reviewData.wrongAnswerId}
                    onComplete={async (result) => {
                        console.log('[App] Review completed:', result);
                        setShowReviewMode(false);
                        setReviewData(null);
                        setCurrentView('reviews');

                        if (result.mastered) {
                            showToast('🎉 أحسنت! تم حذف السؤال من الأخطاء', 'success');
                        } else if (result.success) {
                            showToast('✅ إجابة صحيحة! استمر في المراجعة', 'success');
                        } else {
                            showToast('💪 حاول مرة أخرى في المرة القادمة', 'info');
                        }
                    }}
                    onExit={() => {
                        setShowReviewMode(false);
                        setReviewData(null);
                        setCurrentView('reviews');
                    }}
                    isDark={isDarkMode}
                    isMuted={isMuted}
                    setIsMuted={toggleMute}
                    setIsDark={toggleDarkMode}
                />
            );
        }

        // Game View - All game modes now use Supabase
        if (currentView === 'game' && gameMode) {
            // All games now use MonsterChallengeLoader which fetches from Supabase
            const gameConfig = typeof gameMode === 'object'
                ? gameMode
                : { mode: 'monster', subject: userData?.preferred_subject || 'english', type: 'fullyear', part: 1 };

            return (
                <MonsterChallengeLoader
                    gameConfig={gameConfig}
                    isDarkMode={isDarkMode}
                    isMuted={isMuted}
                    onExit={handleGameExit}
                    toggleMute={toggleMute}
                    toggleDarkMode={toggleDarkMode}
                    showToast={showToast}
                />
            );
        }

        // Main App Layout
        return (
            <div className="min-h-screen w-full relative" dir="rtl">
                <SoftBackground isDarkMode={isDarkMode} />

                <div className="w-full max-w-lg mx-auto px-4 py-6 pb-32 relative z-10">
                    {/* Top Navigation */}
                    <TopNav
                        isDarkMode={isDarkMode}
                        isMuted={isMuted}

                        userName={userData?.name}
                        userAvatar={userData?.avatar}
                        onDarkModeToggle={toggleDarkMode}
                        onMuteToggle={toggleMute}
                        onSettingsClick={() => setSettingsOpen(true)}
                        onLoginClick={handleShowLogin}
                        onLogout={handleLogout}
                    />

                    {/* Home View */}
                    {currentView === 'home' && (
                        <HomeView
                            isDarkMode={isDarkMode}
                            userData={userData}
                            userStats={userStats}
                            showTutorial={showTutorial}
                            seenTooltips={seenTooltips}
                            onTutorialDismiss={() => setShowTutorial(false)}
                            onContinueJourney={handleContinueJourney}
                            onMonsterClick={() => {
                                if (handleFeatureClick('monster')) setShowBattleArena(true);
                            }}
                            onChaptersClick={() => {
                                if (handleFeatureClick('chapters')) setCurrentView('chapters');
                            }}
                            onReviewsClick={() => {
                                if (handleFeatureClick('reviews')) setCurrentView('reviews');
                            }}
                            onFlameClick={() => setCurrentView('reviews')}
                            onQuestionsClick={() => setCurrentView('chapters')}
                            showToast={showToast}
                        />
                    )}

                    {currentView === 'chapters' && (
                        <ChaptersView
                            isDarkMode={isDarkMode}
                            onBack={() => setCurrentView('home')}
                            onChapterClick={handleChapterClick}
                            onShowLogin={handleShowLogin}
                            onFlameClick={() => setCurrentView('reviews')}
                            onQuestionsClick={() => setCurrentView('chapters')}
                            days={userStats.streakDays}
                            questions={userStats.totalQuestions}
                            xp={userStats.totalXP}
                            userId={authUser?.id}
                            subject={chapterGameConfig?.subject || 'english'}
                        />
                    )
                    }

                    {
                        currentView === 'levels' && (
                            <LevelsView
                                isDarkMode={isDarkMode}
                                chapterNum={selectedChapter}
                                onBack={() => setCurrentView('chapters')}
                                onLevelClick={handleLevelClick}
                                onShowLogin={handleShowLogin}
                                userId={authUser?.id}
                                subject={chapterGameConfig?.subject || 'english'}
                            />
                        )
                    }

                    {
                        currentView === 'reviews' && (
                            <ReviewsView
                                isDarkMode={isDarkMode}
                                onBack={() => setCurrentView('home')}
                                onShowLogin={handleShowLogin}
                                onFlameClick={() => setCurrentView('reviews')}
                                onQuestionsClick={() => setCurrentView('chapters')}
                                onReviewClick={handleReviewClick}
                                userId={authUser?.id}
                                subject={chapterGameConfig?.subject || 'english'}
                            />
                        )
                    }

                    {/* Fingerprint / Feedback Button */}
                    <div className="fixed bottom-28 left-5 z-50">
                        <div className="relative">
                            <TactileButton
                                onClick={() => {
                                    if (handleFeatureClick('fingerprint')) setFeedbackOpen(true);
                                }}
                                className="w-12 h-12 rounded-full shadow-lg relative"
                                colorClass={isDarkMode ? 'bg-[#2A2640]' : 'bg-white'}
                                borderClass={isDarkMode ? 'border-[#3E3859]' : 'border-teal-200'}
                            >
                                {!seenTooltips.fingerprint && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full z-20 animate-bounce"></div>
                                )}
                                <Fingerprint className="w-6 h-6 text-teal-500" />
                            </TactileButton>
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-teal-600 bg-white/80 px-2 rounded-full">بصمتك</span>
                        </div>
                    </div>

                    <BottomDock
                        isDarkMode={isDarkMode}
                        onTaskClick={() => handleFeatureClick('daily')}
                        onMistakeClick={() => handleFeatureClick('mistakes')}
                        onReviewStart={() => {
                            if (handleFeatureClick('reviews')) {
                                setCurrentView('reviews');
                                showToast('افتح قسم المراجعات للبدء! 📦', 'info');
                            }
                        }}
                        mistakesCount={userStats.mistakesToReview}
                        userId={authUser?.id}
                    />
                </div >

                {/* Feedback Selection Modal (بصمتك) */}
                {
                    feedbackOpen && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setFeedbackOpen(false)}></div>
                            <div className={`relative w-full max-w-sm p-6 rounded-[2rem] border-2 shadow-2xl animate-pop-in ${isDarkMode ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-white'}`}>
                                <button onClick={() => setFeedbackOpen(false)} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><X className="w-5 h-5 text-slate-400" /></button>
                                <div className="flex flex-col items-center text-center mb-6 mt-2">
                                    <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-4 rotate-3"><Fingerprint className="w-8 h-8 text-teal-500" /></div>
                                    <h3 className={`text-xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>اللعبة تكبر بأفكاركم 💡</h3>
                                    <p className={`text-sm opacity-60 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>شنو اقتراحك حتى نطورها؟</p>
                                </div>
                                <textarea
                                    className={`w-full h-32 p-4 rounded-xl border-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${isDarkMode ? 'bg-black/20 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                                    placeholder="اكتب فكرتك الجهنمية هنا..."
                                ></textarea>
                                <TactileButton
                                    onClick={() => {
                                        setFeedbackOpen(false);
                                        showToast('شكراً يا بطل! فكرتك وصلت 💡', 'info', Send);
                                    }}
                                    className="w-full py-3 rounded-xl gap-2"
                                    colorClass="bg-teal-500"
                                    borderClass="border-teal-700"
                                >
                                    <span className="font-bold text-white">إرسال الفكرة</span>
                                    <Send className="w-4 h-4 text-white" />
                                </TactileButton>
                            </div>
                        </div>
                    )
                }

                {
                    showBattleArena && (
                        <BattleArenaModal
                            isDarkMode={isDarkMode}
                            playerName={userData?.name}
                            user={userData}
                            preferredSubject={userData?.preferred_subject || 'english'}
                            onClose={() => setShowBattleArena(false)}
                            showToast={showToast}
                            onStartGame={(config) => {
                                // config contains: { mode, subject, type, part }
                                setGameMode(config);
                                setCurrentView('game');
                                setShowBattleArena(false);
                                showToast('انطلق! ⚔️', 'fire');
                            }}
                        />
                    )
                }
            </div >
        );
    };

    return (
        <>
            {renderContent()}

            {/* Toast Notification */}
            <ToastNotification
                message={toast.message}
                isVisible={toast.visible}
                type={toast.type}
                icon={toast.icon}
                onClose={hideToast}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                isDarkMode={isDarkMode}
                user={authUser ? { auth_id: authUser.id, ...userData } : null}
                onProfileUpdate={(updatedData) => {
                    setUserData(prev => ({
                        ...prev,
                        name: updatedData.full_name,
                        age: updatedData.age,
                        gender: updatedData.gender,
                        governorate: updatedData.region
                    }));
                }}
                showToast={showToast}
            />
        </>
    );
}

export default App;
