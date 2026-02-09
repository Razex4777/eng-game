import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, BookOpen, Loader2 } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import StatsHUD from '../components/ui/StatsHUD';
import {
    getChaptersStructure,
    getUserChapterProgress,
    calculateChapterProgress,
    isChapterUnlocked
} from '../services/chaptersService';

// واجهة الفصول (ChaptersView)
const ChaptersView = ({
    isDarkMode,
    onBack,
    onFlameClick,
    onQuestionsClick,
    onChapterClick,
    isGuest,
    onShowLogin,
    days = 0,
    questions = 0,
    xp = 0,
    userId = null,
    subject = 'english' // Current subject (english/biology)
}) => {
    const chapterNames = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];

    const [chaptersData, setChaptersData] = useState({});
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch chapters structure and user progress
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get chapters structure from Supabase
                const { chapters } = await getChaptersStructure(subject);
                setChaptersData(chapters);

                // Get user progress if logged in
                if (userId) {
                    const { progress } = await getUserChapterProgress(userId, subject);
                    setUserProgress(progress);
                }
            } catch (error) {
                console.error('Error loading chapters:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subject, userId]);

    const handleChapterClick = (chapterNum) => {
        if (isGuest && chapterNum > 1) {
            onShowLogin();
        } else {
            // Check if chapter is unlocked
            const unlocked = isChapterUnlocked(subject, chapterNum, userProgress);
            if (!unlocked && !isGuest) {
                // Could show a toast here
                return;
            }
            onChapterClick(chapterNum, subject);
        }
    };

    // Helper to determine progress bar color
    const getProgressColor = (p) => {
        if (p === 100) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'; // Green + Glow
        if (p >= 90) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'; // Red/Fiery + Pulse
        if (p >= 50) return 'bg-orange-500'; // Orange
        return 'bg-yellow-400'; // Yellow
    };

    // Get progress for a chapter
    const getChapterProgressPercent = (chapterNum) => {
        return calculateChapterProgress(subject, chapterNum, userProgress);
    };

    // Check if chapter is locked
    const isChapterLocked = (chapterNum) => {
        if (isGuest) return chapterNum !== 1;
        return !isChapterUnlocked(subject, chapterNum, userProgress);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up pb-32">
            <StatsHUD
                isDarkMode={isDarkMode}
                compact={true}
                onFlameClick={onFlameClick}
                onQuestionsClick={onQuestionsClick}
                isGuest={isGuest}
                days={days}
                questions={questions}
                xp={xp}
            />
            <div className="flex items-center gap-4 mb-6">
                <TactileButton onClick={() => onBack('home')} className="w-12 h-12 rounded-xl" colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'} borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}>
                    <ArrowLeft className={isDarkMode ? 'text-white' : 'text-slate-700'} />
                </TactileButton>
                <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>خريطة الفصول</h2>
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                    const isLocked = isChapterLocked(num);
                    const progress = getChapterProgressPercent(num);
                    const chapterInfo = chaptersData[num] || {};
                    const totalQuestions = chapterInfo.totalQuestions || 0;
                    const partsCount = chapterInfo.parts?.length || 0;

                    return (
                        <TactileButton
                            key={num}
                            onClick={() => handleChapterClick(num)}
                            className={`w-full p-5 flex items-center justify-between rounded-[28px] group transition-all ${isLocked ? 'opacity-90 grayscale-[0.5]' : ''}`}
                            colorClass={isLocked ? (isDarkMode ? 'bg-slate-900' : 'bg-slate-200') : (isDarkMode ? 'bg-slate-800' : 'bg-white')}
                            borderClass={isLocked ? (isDarkMode ? 'border-slate-800' : 'border-slate-300') : (isDarkMode ? 'border-slate-700' : 'border-slate-200')}
                        >
                            <div className="flex items-center gap-5 w-full">
                                <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl font-black border-2 shadow-inner transform group-active:scale-90 transition-transform ${isLocked ? (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-300 border-slate-400 text-slate-500') : (isDarkMode ? 'bg-[#1E293B] border-slate-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-500')}`}>
                                    {isLocked ? <Lock className="w-8 h-8" /> : num}
                                </div>

                                <div className="flex-1 flex flex-col justify-center h-full">
                                    <span className={`block text-xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'} ${isLocked ? 'text-slate-500' : ''}`}>
                                        الفصل {chapterNames[num - 1]}
                                    </span>

                                    {/* Show parts/questions count */}
                                    <span className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {partsCount} مراحل • {totalQuestions} سؤال
                                    </span>

                                    {!isLocked ? (
                                        <div className="w-full max-w-[140px]">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className={`text-[10px] font-bold ${progress >= 90 && progress < 100 ? 'text-red-500 animate-pulse' : progress === 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {progress === 100 ? '✅ مكتمل' : progress >= 90 ? '🔥 قريب!' : progress > 0 ? 'جاري' : 'ابدأ'}
                                                </span>
                                                <span className={`text-xs font-black ${progress === 100 ? 'text-emerald-500' : progress >= 90 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {progress}%
                                                </span>
                                            </div>
                                            {/* The Turbo Bar */}
                                            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(progress)}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                            <span className="text-xs font-bold text-red-400">
                                                {isGuest ? 'سجل لفتح' : 'أكمل الفصل السابق'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isLocked && isGuest && <div className="bg-black/10 px-2 py-1 rounded text-[10px] font-bold shrink-0">للمشتركين</div>}
                        </TactileButton>
                    );
                })}
            </div>
        </div>
    );
};

export default ChaptersView;
