import React, { useState } from 'react';
import TactileButton from '../ui/TactileButton';
import SharePopup from '../ui/SharePopup';
import { handleShareChallenge } from '../../utils/sharing';

/**
 * ResultsScreen Component
 * End-of-game results display with score, stats, and error review
 * Features: Score display, correct/wrong counts, error explanations, loss challenge popup
 */
const ResultsScreen = ({
    score = 0,
    correctAnswers = [],
    wrongAnswers = [],
    onPlayAgain,
    onGoToMenu,
    onContinue,
    isDark = false,
    gameWon = false,
    hasNextPart = true,
    currentChapter = 1,
    currentPart = 1,
    gameMode = null,
    showToast
}) => {
    const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const textColor = isDark ? 'text-white' : 'text-slate-800';
    const [showLossPopup, setShowLossPopup] = useState(!gameWon && gameMode === 'monster');

    // Determine result emoji based on performance
    const getResultEmoji = () => {
        const total = correctAnswers.length + wrongAnswers.length;
        const percentage = total > 0 ? (correctAnswers.length / total) * 100 : 0;

        if (percentage >= 90) return '👑';
        if (percentage >= 70) return '🌟';
        if (percentage >= 50) return '😎';
        return '💪';
    };

    const handleLossShare = async () => {
        const shareText = `تحدّى صديقك خلي يشوفنا عضلاته`;
        const result = await handleShareChallenge('تحدي الوحش!', shareText);

        if (result?.success) {
            if (result.type === 'copy') {
                showToast?.('تم نسخ رابط التحدي! 🚀', 'success');
            }
            setShowLossPopup(false);
        } else if (result?.type === 'copy') {
            showToast?.('عذراً، تعذر النسخ.', 'error');
        }
    };

    const handleTryAgain = () => {
        setShowLossPopup(false);
        onPlayAgain();
    };

    return (
        <>
            {/* Loss Challenge Popup - Only for Monster Challenge */}
            {showLossPopup && gameMode === 'monster' && (
                <SharePopup
                    isDarkMode={isDark}
                    onClose={() => setShowLossPopup(false)}
                    title="تحدى صديق!"
                    message="تحدّى صديقك خلي يشوفنا عضلاته"
                    score={score}
                    shareText="تحدّى صديقك خلي يشوفنا عضلاته"
                    onShare={handleLossShare}
                    showTryAgain={true}
                    onTryAgain={handleTryAgain}
                    variant="loss"
                />
            )}

            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-3 md:p-4 animate-pop-in">
                <div className={`w-full max-w-md md:max-w-sm p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl border-2 ${cardBg}`}>
                    {/* Header */}
                    <div className="text-center mb-4 md:mb-6">
                        <span className="text-5xl md:text-6xl block mb-1 md:mb-2 animate-bounce-in">
                            {getResultEmoji()}
                        </span>
                        <h2
                            className={`text-2xl md:text-3xl font-black ${textColor}`}
                            style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                            النتيجة النهائية
                        </h2>
                    </div>

                    {/* Total Score */}
                    <div className="bg-slate-200 dark:bg-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl mb-4 md:mb-6 text-center shadow-inner">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            Total Score
                        </span>
                        <div className={`text-5xl md:text-6xl font-black mt-1 md:mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {score.toLocaleString()}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 md:p-3 rounded-lg md:rounded-xl text-center border-2 border-green-200 dark:border-green-800">
                            <span
                                className="block text-xs font-bold text-green-700 dark:text-green-400 mb-0.5 md:mb-1"
                                style={{ fontFamily: "'Cairo', sans-serif" }}
                            >
                                إجابات صحيحة
                            </span>
                            <span className="text-2xl md:text-3xl font-black text-green-600 dark:text-green-400">
                                {correctAnswers.length}
                            </span>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 md:p-3 rounded-lg md:rounded-xl text-center border-2 border-red-200 dark:border-red-800">
                            <span
                                className="block text-xs font-bold text-red-700 dark:text-red-400 mb-0.5 md:mb-1"
                                style={{ fontFamily: "'Cairo', sans-serif" }}
                            >
                                إجابات خاطئة
                            </span>
                            <span className="text-2xl md:text-3xl font-black text-red-600 dark:text-red-400">
                                {wrongAnswers.length}
                            </span>
                        </div>
                    </div>

                    {/* Error Review with Explanation */}
                    {wrongAnswers.length > 0 && (
                        <div className="mb-3 md:mb-4 max-h-48 md:max-h-40 overflow-y-auto bg-white dark:bg-slate-900 rounded-lg md:rounded-xl p-2 md:p-3 border border-slate-200 dark:border-slate-700">
                            <h3
                                className="font-bold text-red-500 mb-1 md:mb-2 text-sm md:text-base text-right"
                                style={{ fontFamily: "'Cairo', sans-serif" }}
                            >
                                الأخطاء ({wrongAnswers.length})
                            </h3>
                            {wrongAnswers.map((item, i) => {
                                // Get the correct answer from the question data
                                const correctAnswer = item.question?.options?.[item.question?.correct];

                                return (
                                    <div
                                        key={i}
                                        className="text-right text-xs md:text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 py-2 md:py-3"
                                    >
                                        <p className={`font-black mb-1 text-sm md:text-base ${textColor} break-words`}>
                                            {item.question?.text || item.question?.q}
                                        </p>
                                        <div className="flex justify-end gap-1 md:gap-2 mb-1 flex-wrap">
                                            {item.userAnswer && item.userAnswer !== correctAnswer && (
                                                <span className="text-red-500 font-bold line-through opacity-70 text-xs md:text-sm">
                                                    {item.userAnswer}
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className="text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-1.5 md:p-2 rounded font-bold text-xs"
                                            style={{ fontFamily: "'Cairo', sans-serif" }}
                                        >
                                            💡 الجواب الصحيح: {correctAnswer || 'غير متوفر'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {gameWon && hasNextPart && onContinue && (
                        <TactileButton
                            onClick={onContinue}
                            variant="success"
                            size="lg"
                            className="w-full mb-2 md:mb-3 animate-pulse-ring"
                            colorClass="bg-gradient-to-br from-emerald-500 to-green-600"
                            borderClass="border-emerald-700"
                        >
                            <span
                                className="font-black text-lg md:text-xl"
                                style={{ fontFamily: "'Cairo', sans-serif" }}
                            >
                                المتابعة للدرس التالي 🚀
                            </span>
                        </TactileButton>
                    )}

                    <TactileButton
                        onClick={onPlayAgain}
                        variant="success"
                        size="lg"
                        className="w-full mb-2 md:mb-3"
                    >
                        <span
                            className="font-black text-lg md:text-xl"
                            style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                            لعب مرة أخرى
                        </span>
                    </TactileButton>

                    <TactileButton
                        onClick={onGoToMenu}
                        variant="ghost"
                        size="lg"
                        className="w-full"
                    >
                        <span
                            className="font-bold text-sm md:text-base"
                            style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                            القائمة الرئيسية
                        </span>
                    </TactileButton>
                </div>
            </div>
        </>
    );
};

export default ResultsScreen;
