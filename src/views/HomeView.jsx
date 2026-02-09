import React from 'react';
import { List, FileText, Star } from 'lucide-react';
import { TactileButton, StatsHUD } from '../components/ui';
import MonsterCard from './MonsterCard';

/**
 * HomeView Component
 * Main home screen with navigation cards and stats
 */
const HomeView = ({
    isDarkMode,
    isGuest,
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
    return (
        <div className="animate-fade-in-up">
            {/* Continue Journey / Try Free Card */}
            <div className="relative mb-6">
                {showTutorial && (
                    <div className="absolute -top-12 left-0 right-0 flex justify-center animate-bounce z-50 pointer-events-none">
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-black px-4 py-2 rounded-xl shadow-lg border-2 border-yellow-100">
                            {isGuest ? "جرب مجاناً هنا 👇" : "ابدأ رحلتك من هنا 👇"}
                        </div>
                    </div>
                )}
                <TactileButton
                    onClick={() => {
                        onTutorialDismiss();
                        if (isGuest) {
                            onContinueJourney(1);
                        } else {
                            showToast("قريباً.. من هنا تكمل آخر درس وصلت اله! 🚀", "info", Star);
                        }
                    }}
                    className={`w-full p-6 rounded-[32px] group border-2 relative overflow-hidden ${showTutorial ? 'animate-pulse-ring z-40' : ''}`}
                    colorClass="bg-gradient-to-br from-indigo-500 to-blue-600"
                    borderClass="border-indigo-700"
                >
                    <div className="w-full flex items-center justify-between z-20 relative">
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-2xl font-black text-white drop-shadow-md">{isGuest ? 'جرب التحدي مجاناً 🎮' : 'تابع رحلتك 🚀'}</span>
                            <span className="text-sm font-bold text-indigo-100 opacity-90">
                                {isGuest ? 'العب أول مرحلة واكتشف مستواك!' : 'الفصل 2 - الدرس 3'}
                            </span>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <span className="text-5xl font-black text-white drop-shadow-lg tracking-tighter" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                {isGuest ? '0' : '45'}<span className="text-2xl">%</span>
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-black/20">
                        <div className="h-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.9)]" style={{ width: isGuest ? '0%' : '45%' }}></div>
                    </div>
                </TactileButton>
            </div>

            {/* Stats HUD (Only for logged in) */}
            {!isGuest && (
                <StatsHUD
                    isDarkMode={isDarkMode}
                    isGuest={isGuest}
                    days={userStats.streakDays}
                    questions={userStats.totalQuestions}
                    xp={userStats.totalXP}
                    onFlameClick={onFlameClick}
                    onQuestionsClick={onQuestionsClick}
                />
            )}

            {/* Monster Challenge Card */}
            <div className="relative">
                <MonsterCard
                    isDarkMode={isDarkMode}
                    isGuest={isGuest}
                    onClick={onMonsterClick}
                    playerName={userData?.name}
                />
                {!seenTooltips.monster && !isGuest && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full z-20 animate-bounce pointer-events-none"></div>
                )}
            </div>

            {/* Quick Navigation Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <TactileButton
                    onClick={onChaptersClick}
                    className="aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-4 group relative"
                    colorClass={isDarkMode ? 'bg-emerald-600' : 'bg-[#6EE7B7]'}
                    borderClass={isDarkMode ? 'border-emerald-800' : 'border-[#059669]'}
                >
                    {!seenTooltips.chapters && !isGuest && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full z-20 animate-bounce"></div>
                    )}
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center transform group-active:scale-90 transition-transform bg-white/20 border-2 border-white/20">
                        <List className="w-8 h-8 text-white drop-shadow-sm" strokeWidth={3} />
                    </div>
                    <div className="text-center">
                        <span className="block text-xl font-black text-white drop-shadow-md">الفصول</span>
                        <span className="text-[10px] font-bold text-emerald-900 bg-white/20 px-2 py-0.5 rounded-lg mt-1 inline-block">المنهج الكامل</span>
                    </div>
                </TactileButton>

                <TactileButton
                    onClick={onReviewsClick}
                    className="aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-4 group relative"
                    colorClass={isDarkMode ? 'bg-orange-600' : 'bg-[#FDBA74]'}
                    borderClass={isDarkMode ? 'border-orange-800' : 'border-[#EA580C]'}
                >
                    {!seenTooltips.reviews && !isGuest && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full z-20 animate-bounce"></div>
                    )}
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center transform group-active:scale-90 transition-transform bg-white/20 border-2 border-white/20">
                        <FileText className="w-8 h-8 text-white drop-shadow-sm" strokeWidth={3} />
                    </div>
                    <div className="text-center">
                        <span className="block text-xl font-black text-white drop-shadow-md">مراجعات</span>
                        <span className="text-[10px] font-bold text-orange-900 bg-white/20 px-2 py-0.5 rounded-lg mt-1 inline-block">مركزة & شاملة</span>
                    </div>
                </TactileButton>
            </div>
        </div>
    );
};

export default HomeView;
