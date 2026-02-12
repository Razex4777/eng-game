import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Loader2, Flame, Target, Play } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import StatsHUD from '../components/ui/StatsHUD';
import { getChaptersStructure, getUserChapterProgress, calculateChapterProgress, isChapterUnlocked } from '../services/chaptersService';

/**
 * ChaptersView (Simplified)
 * Clean chapter selection matching code.txt reference
 */
const ChaptersView = ({
    isDarkMode,
    onBack,
    onFlameClick,
    onQuestionsClick,
    onChapterClick,
    onShowLogin,
    days = 0,
    questions = 0,
    xp = 0,
    userId = null,
    subject = 'english'
}) => {
    const chapterNames = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];
    const [chaptersData, setChaptersData] = useState({});
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { chapters } = await getChaptersStructure(subject);
                setChaptersData(chapters);
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
        const unlocked = isChapterUnlocked(subject, chapterNum, userProgress);
        if (!unlocked) return;
        onChapterClick(chapterNum, subject);
    };

    const getProgressColor = (p) => {
        if (p === 100) return 'bg-emerald-500';
        if (p >= 90) return 'bg-red-500 animate-pulse';
        if (p >= 50) return 'bg-orange-500';
        return 'bg-yellow-400';
    };

    const getChapterProgressPercent = (chapterNum) => calculateChapterProgress(subject, chapterNum, userProgress);
    const isChapterLocked = (chapterNum) => !isChapterUnlocked(subject, chapterNum, userProgress);

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
                onFlameClick={() => onFlameClick?.('العب 7 أيام متواصلة بدون تسطيح حتى تحصل شعلة 🔥', 'fire', Flame)}
                onQuestionsClick={() => onQuestionsClick?.('المجموع الكلّي لاسئلة المنهج 🎯', 'info', Target)}
                days={days}
                questions={questions}
                xp={xp}
            />

            <div className="flex items-center gap-4 mb-6">
                <TactileButton
                    onClick={() => onBack('home')}
                    className="w-12 h-12 rounded-xl"
                    colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                    borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}
                >
                    <ArrowLeft className={isDarkMode ? 'text-white' : 'text-slate-700'} />
                </TactileButton>
                <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>خريطة الفصول</h2>
            </div>

            <div className="space-y-3">
                {/* Demo Stage Button - always visible and accessible */}
                <TactileButton
                    onClick={() => handleChapterClick(0)}
                    className="w-full p-4 flex items-center justify-between rounded-[24px] group"
                    colorClass="bg-gradient-to-r from-indigo-500 to-purple-600"
                    borderClass="border-indigo-700"
                >
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black border-2 bg-white/20 border-white/30 text-white">
                            🎮
                        </div>
                        <div className="flex-1">
                            <span className="block text-lg font-black mb-1 text-white">
                                المرحلة التجريبية
                            </span>
                            <span className="text-xs font-medium text-indigo-100">
                                جرب اللعبة مجاناً
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                    </div>
                </TactileButton>

                {/* Chapter Buttons */}
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
                            className={`w-full p-4 flex items-center justify-between rounded-[24px] group ${isLocked ? 'opacity-90 grayscale-[0.5]' : ''}`}
                            colorClass={isLocked ? (isDarkMode ? 'bg-slate-900' : 'bg-slate-200') : (isDarkMode ? 'bg-slate-800' : 'bg-white')}
                            borderClass={isLocked ? (isDarkMode ? 'border-slate-800' : 'border-slate-300') : (isDarkMode ? 'border-slate-700' : 'border-slate-200')}
                        >
                            <div className="flex items-center gap-4 w-full">
                                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black border-2 transform group-active:scale-90 transition-transform ${isLocked
                                    ? (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-300 border-slate-400 text-slate-500')
                                    : (isDarkMode ? 'bg-[#1E293B] border-slate-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-500')
                                    }`}>
                                    {isLocked ? <Lock className="w-6 h-6" /> : num}
                                </div>

                                <div className="flex-1">
                                    <span className={`block text-lg font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'} ${isLocked ? 'text-slate-500' : ''}`}>
                                        الفصل {chapterNames[num - 1]}
                                    </span>
                                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {partsCount} مراحل • {totalQuestions} سؤال
                                    </span>

                                    {!isLocked ? (
                                        <div className="w-full max-w-[120px] mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[10px] font-bold ${progress >= 90 && progress < 100 ? 'text-red-500' : progress === 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {progress === 100 ? '✅ مكتمل' : progress >= 90 ? '🔥 قريب!' : progress > 0 ? 'جاري' : 'ابدأ'}
                                                </span>
                                                <span className={`text-xs font-black ${progress === 100 ? 'text-emerald-500' : progress >= 90 ? 'text-red-500' : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {progress}%
                                                </span>
                                            </div>
                                            <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                            <span className="text-xs font-bold text-red-400">أكمل الفصل السابق</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TactileButton>
                    );
                })}
            </div>
        </div>
    );
};

export default ChaptersView;
