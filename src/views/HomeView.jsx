import React from 'react';
import { List, FileText, Lock, Play, Swords } from 'lucide-react';
import { TactileButton, StatsHUD } from '../components/ui';

/**
 * HomeView Component (Simplified)
 * Clean layout matching code.txt reference:
 * 1. Welcome header
 * 2. Continue Journey banner
 * 3. StatsHUD bar
 * 4. Monster Challenge card
 * 5. Quick nav grid
 */
const HomeView = ({
    isDarkMode,
    userData,
    userStats,
    onContinueJourney,
    onMonsterClick,
    onChaptersClick,
    onReviewsClick,
    onFlameClick,
    onQuestionsClick
}) => {
    const isGuest = userData?.isGuest;

    return (
        <div className="animate-fade-in-up">
            {/* Welcome Header */}
            <div className="text-center py-6 mb-2">
                <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    هلا بالبطل
                </h1>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isGuest ? 'نسخة التجربه (ضيف)' : `أهلاً ${userData?.name || 'البطل'} 👋`}
                </p>
            </div>

            {/* Continue Journey Banner */}
            <TactileButton
                onClick={onContinueJourney}
                className="w-full p-5 rounded-[28px] group border-2 relative overflow-hidden mb-4"
                colorClass="bg-gradient-to-br from-indigo-500 to-blue-600"
                borderClass="border-indigo-700"
            >
                <div className="w-full flex items-center justify-between z-10 relative">
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-xl font-black text-white drop-shadow-md">
                            {isGuest ? 'جرب مجاناً 🎮' : 'تابع رحلتك 🚀'}
                        </span>
                        <span className="text-xs font-bold text-indigo-100 opacity-80">
                            {userStats?.lastPlayedPart
                                ? `الفصل ${userStats.lastPlayedPart.chapterNumber} - الدرس ${userStats.lastPlayedPart.part}`
                                : 'ابدأ رحلتك التعليمية'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-black text-white">
                            {userStats?.overallProgress || 0}<span className="text-lg">%</span>
                        </span>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
                    <div
                        className="h-full bg-yellow-400 transition-all duration-500"
                        style={{ width: `${userStats?.overallProgress || 0}%` }}
                    />
                </div>
            </TactileButton>

            {/* Stats HUD */}
            <StatsHUD
                isDarkMode={isDarkMode}
                days={userStats?.streakDays ?? 0}
                questions={userStats?.totalQuestions ?? 0}
                xp={userStats?.totalXP ?? 0}
                subject={userData?.preferred_subject}
                onFlameClick={onFlameClick}
                onQuestionsClick={onQuestionsClick}
            />

            {/* Monster Challenge Card */}
            <TactileButton
                onClick={onMonsterClick}
                className={`w-full mb-6 overflow-hidden p-0 group ${isGuest ? 'opacity-80 grayscale-[0.8]' : ''}`}
                colorClass={isDarkMode ? 'bg-[#7C3AED]' : 'bg-[#8B5CF6]'}
                borderClass={isDarkMode ? 'border-[#5B21B6]' : 'border-[#7C3AED]'}
                shadowColor={isGuest ? '' : 'shadow-purple-200'}
            >
                <div className="absolute inset-0 bg-white/5"></div>
                {!isGuest && <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>}

                <div className="relative z-10 w-full p-6 flex items-center justify-between">
                    <div className="flex flex-col items-start text-right w-full">
                        <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-xl border border-white/20 mb-2 shadow-sm">
                            <Swords className="w-3.5 h-3.5 text-white" />
                            <span className="text-[10px] font-black text-white tracking-wide">ENDLESS</span>
                        </div>
                        <h2 className="text-3xl font-black text-white drop-shadow-sm mb-1">تحدي الوحش</h2>
                        <p className="text-purple-100 text-xs font-bold mb-4 opacity-90">
                            {isGuest ? 'سجل لفتح التحدي' : 'اكسر حاجز الملل!'}
                        </p>
                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/10 w-fit">
                            <div className="flex flex-col items-start px-1">
                                <span className="text-[9px] text-purple-100 font-bold uppercase opacity-80">أعلى سكور</span>
                                <span className="text-xl font-black text-white font-mono leading-none">
                                    {isGuest ? '0' : '12,500'}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-white/20 mx-2"></div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform ${isGuest ? 'bg-slate-400 text-slate-200' : 'bg-white text-purple-600 group-hover:scale-110'}`}>
                                {isGuest ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                            </div>
                        </div>
                    </div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 transform group-hover:rotate-12 transition-transform duration-500">
                        <Swords className="w-32 h-32 text-white" />
                    </div>
                    {isGuest && <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
                </div>
            </TactileButton>

            {/* Quick Navigation Grid */}
            <div className="grid grid-cols-2 gap-3">
                <TactileButton
                    onClick={onChaptersClick}
                    className={`aspect-square rounded-[24px] flex flex-col items-center justify-center gap-3 group ${isGuest ? 'opacity-80 grayscale-[0.5]' : ''}`}
                    colorClass={isDarkMode ? 'bg-emerald-600' : 'bg-[#6EE7B7]'}
                    borderClass={isDarkMode ? 'border-emerald-800' : 'border-[#059669]'}
                >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 border-2 border-white/20">
                        {isGuest ? <Lock className="w-7 h-7 text-white/70" /> : <List className="w-7 h-7 text-white" strokeWidth={3} />}
                    </div>
                    <div className="text-center">
                        <span className="block text-lg font-black text-white">الفصول</span>
                        <span className="text-[9px] font-bold text-emerald-900 bg-white/20 px-2 py-0.5 rounded-lg">
                            {isGuest ? 'سجّل للفتح' : 'المنهج الكامل'}
                        </span>
                    </div>
                </TactileButton>

                <TactileButton
                    onClick={onReviewsClick}
                    className={`aspect-square rounded-[24px] flex flex-col items-center justify-center gap-3 group ${isGuest ? 'opacity-80 grayscale-[0.5]' : ''}`}
                    colorClass={isDarkMode ? 'bg-orange-600' : 'bg-[#FDBA74]'}
                    borderClass={isDarkMode ? 'border-orange-800' : 'border-[#EA580C]'}
                >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 border-2 border-white/20">
                        {isGuest ? <Lock className="w-7 h-7 text-white/70" /> : <FileText className="w-7 h-7 text-white" strokeWidth={3} />}
                    </div>
                    <div className="text-center">
                        <span className="block text-lg font-black text-white">مراجعات</span>
                        <span className="text-[9px] font-bold text-orange-900 bg-white/20 px-2 py-0.5 rounded-lg">
                            {isGuest ? 'سجّل للفتح' : 'مركزة & شاملة'}
                        </span>
                    </div>
                </TactileButton>
            </div>
        </div>
    );
};

export default HomeView;
