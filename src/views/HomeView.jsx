import React from 'react';
import { List, FileText, Lock } from 'lucide-react';
import { TactileButton, StatsHUD } from '../components/ui';
import TutorialHand from '../components/ui/TutorialHand';
import MonsterCard from './MonsterCard';

/**
 * HomeView Component
 * Layout order (matching reference):
 * 1. Welcome header (هلا بالبطل)
 * 2. StatsHUD bar (أيام | سؤال | XP)
 * 3. Continue Journey banner
 * 4. Monster Challenge card
 * 5. Quick nav grid (Chapters + Reviews)
 */
const HomeView = ({
    isDarkMode,
    userData,
    userStats,
    showTutorial,
    seenTooltips,
    onTutorialDismiss,
    onContinueJourney,
    onMonsterClick,
    onChaptersClick,
    onReviewsClick,
    onFlameClick,
    onQuestionsClick,
    showToast
}) => {
    const isGuest = userData?.isGuest;

    return (
        <div className="animate-fade-in-up">
            {/* ─── Welcome Header ─── */}
            <div className="text-center py-6 mb-2">
                <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    هلا بالبطل
                </h1>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isGuest
                        ? 'نسخة التجربه (ضيف)'
                        : `أهلاً ${userData?.name || 'البطل'} 👋`
                    }
                </p>
            </div>

            {/* ─── Continue Journey / Try Free Banner ─── */}
            <div className="relative mb-6">
                {/* Side-pointing animated tutorial hand */}
                {showTutorial && (
                    <TutorialHand
                        text={isGuest ? 'جرب مجاناً هنا' : 'ابدأ رحلتك من هنا'}
                        direction="left"
                    />
                )}
                <TactileButton
                    onClick={() => {
                        onTutorialDismiss();
                        onContinueJourney();
                    }}
                    className={`w-full p-6 rounded-[32px] group border-2 relative overflow-hidden ${showTutorial ? 'animate-pulse-ring z-40' : ''}`}
                    colorClass="bg-gradient-to-br from-indigo-500 to-blue-600"
                    borderClass="border-indigo-700"
                >
                    <div className="w-full flex items-center justify-between z-20 relative">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-2xl font-black text-white drop-shadow-md">
                                {isGuest ? 'جرب التحدي مجاناً 🎮' : 'تابع رحلتك 🚀'}
                            </span>
                            <span className="text-sm font-bold text-indigo-100 opacity-90">
                                {userStats?.lastPlayedPart
                                    ? `الفصل ${userStats.lastPlayedPart.chapterNumber} - الدرس ${userStats.lastPlayedPart.part}`
                                    : 'ابدأ رحلتك التعليمية'
                                }
                            </span>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <span className="text-5xl font-black text-white drop-shadow-lg tracking-tighter" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                {userStats?.overallProgress || '0'}<span className="text-2xl">%</span>
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-black/20">
                        <div className="h-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.9)]" style={{ width: `${userStats?.overallProgress || 0}%` }}></div>
                    </div>
                </TactileButton>

                {/* Dark spotlight overlay behind banner */}
                {showTutorial && (
                    <div className="fixed inset-0 bg-black/40 z-30 pointer-events-none transition-opacity duration-500"></div>
                )}
            </div>

            {/* ─── Stats HUD (below banner) ─── */}
            <StatsHUD
                isDarkMode={isDarkMode}
                days={userStats?.streakDays ?? 0}
                questions={userStats?.totalQuestions ?? 0}
                xp={userStats?.totalXP ?? 0}
                subject={userData?.preferred_subject}
                onFlameClick={onFlameClick}
                onQuestionsClick={onQuestionsClick}
            />

            {/* ─── Monster Challenge Card ─── */}
            <div className="relative">
                <MonsterCard
                    isDarkMode={isDarkMode}
                    onClick={onMonsterClick}
                    playerName={userData?.name}
                    isGuest={isGuest}
                />
                {!isGuest && !seenTooltips.monster && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full z-20 animate-bounce pointer-events-none"></div>
                )}
            </div>

            {/* ─── Quick Navigation Grid ─── */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <TactileButton
                    onClick={onChaptersClick}
                    className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-4 group relative ${isGuest ? 'opacity-80 grayscale-[0.5]' : ''}`}
                    colorClass={isDarkMode ? 'bg-emerald-600' : 'bg-[#6EE7B7]'}
                    borderClass={isDarkMode ? 'border-emerald-800' : 'border-[#059669]'}
                >
                    {!isGuest && !seenTooltips.chapters && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full z-20 animate-bounce"></div>
                    )}
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center transform group-active:scale-90 transition-transform bg-white/20 border-2 border-white/20">
                        {isGuest
                            ? <Lock className="w-8 h-8 text-white/70 drop-shadow-sm" strokeWidth={3} />
                            : <List className="w-8 h-8 text-white drop-shadow-sm" strokeWidth={3} />
                        }
                    </div>
                    <div className="text-center">
                        <span className="block text-xl font-black text-white drop-shadow-md">الفصول</span>
                        <span className="text-[10px] font-bold text-emerald-900 bg-white/20 px-2 py-0.5 rounded-lg mt-1 inline-block">
                            {isGuest ? 'سجّل للفتح' : 'المنهج الكامل'}
                        </span>
                    </div>
                </TactileButton>

                <TactileButton
                    onClick={onReviewsClick}
                    className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-4 group relative ${isGuest ? 'opacity-80 grayscale-[0.5]' : ''}`}
                    colorClass={isDarkMode ? 'bg-orange-600' : 'bg-[#FDBA74]'}
                    borderClass={isDarkMode ? 'border-orange-800' : 'border-[#EA580C]'}
                >
                    {!isGuest && !seenTooltips.reviews && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full z-20 animate-bounce"></div>
                    )}
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center transform group-active:scale-90 transition-transform bg-white/20 border-2 border-white/20">
                        {isGuest
                            ? <Lock className="w-8 h-8 text-white/70 drop-shadow-sm" strokeWidth={3} />
                            : <FileText className="w-8 h-8 text-white drop-shadow-sm" strokeWidth={3} />
                        }
                    </div>
                    <div className="text-center">
                        <span className="block text-xl font-black text-white drop-shadow-md">مراجعات</span>
                        <span className="text-[10px] font-bold text-orange-900 bg-white/20 px-2 py-0.5 rounded-lg mt-1 inline-block">
                            {isGuest ? 'سجّل للفتح' : 'مركزة & شاملة'}
                        </span>
                    </div>
                </TactileButton>
            </div>
        </div>
    );
};

export default HomeView;
