import React from 'react';
import { X, Share2, Trophy, Flame } from 'lucide-react';
import TactileButton from './TactileButton';

/**
 * SharePopup Component
 * Reusable popup for sharing challenges and scores
 * Used in BattleArenaModal (VS challenge) and ResultsScreen (loss challenge)
 */
const SharePopup = ({
    isDarkMode = false,
    onClose,
    title,
    message,
    score = null,
    highScore = null,
    lastScore = null,
    shareText,
    onShare,
    showTryAgain = false,
    onTryAgain,
    variant = 'vs' // 'vs' or 'loss'
}) => {
    const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';

    return (
        <div
            className={`fixed inset-0 z-[150] flex items-center justify-center p-4 font-['Cairo'] backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90' : 'bg-slate-200/70'}`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-sm p-6 pb-8 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-300 animate-pop-in ${bgCard} ${isDarkMode ? 'shadow-black/50 border border-slate-700' : 'shadow-xl border border-slate-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient Background */}
                <div className={`absolute inset-0 opacity-10 ${variant === 'vs' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-orange-500 to-red-500'}`} />

                {/* Handle */}
                <div className={`w-8 h-1 rounded-full mx-auto mb-6 opacity-20 relative z-10 ${isDarkMode ? 'bg-white' : 'bg-slate-900'}`} />

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        {variant === 'vs' ? (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                <Flame className="w-6 h-6 text-white fill-current" />
                            </div>
                        )}
                        <h3 className={`text-2xl font-black ${textPrimary} tracking-tight`}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                        <X className={`w-5 h-5 ${textPrimary}`} />
                    </button>
                </div>

                {/* Message */}
                <div className={`mb-6 text-center relative z-10`}>
                    <p className={`text-lg font-bold ${textPrimary} mb-4 leading-relaxed`}>
                        {message}
                    </p>

                    {/* Score Display */}
                    {(score !== null || lastScore !== null || highScore !== null) && (
                        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-[#334155]' : 'bg-slate-100'}`}>
                            {lastScore !== null && (
                                <div className="mb-3">
                                    <span className={`text-sm font-bold ${textSecondary}`}>آخر محاولة</span>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className={`text-3xl font-black ${textPrimary}`}>
                                            {lastScore.toLocaleString()}
                                        </span>
                                        <span className={`text-sm font-bold ${textSecondary}`}>نقطة</span>
                                    </div>
                                </div>
                            )}

                            {highScore !== null && lastScore !== null && (
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent my-3" />
                            )}

                            {highScore !== null && (
                                <div>
                                    <span className={`text-sm font-bold ${textSecondary}`}>أعلى نقاط</span>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        <span className={`text-3xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent`}>
                                            {highScore.toLocaleString()}
                                        </span>
                                        <span className={`text-sm font-bold ${textSecondary}`}>نقطة</span>
                                    </div>
                                </div>
                            )}

                            {score !== null && lastScore === null && highScore === null && (
                                <div>
                                    <span className={`text-sm font-bold ${textSecondary}`}>نقاطك</span>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className={`text-3xl font-black ${textPrimary}`}>
                                            {score.toLocaleString()}
                                        </span>
                                        <span className={`text-sm font-bold ${textSecondary}`}>نقطة</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Share Button */}
                <div className="relative z-10 space-y-3">
                    <TactileButton
                        className={`w-full p-0 !rounded-[28px] overflow-hidden group border-none ${variant === 'vs' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                        onClick={onShare}
                    >
                        <div className="w-full p-5 flex items-center justify-center gap-3 z-10 relative">
                            <Share2 className="w-5 h-5 text-white" />
                            <span className="text-lg font-black text-white">
                                شارك التحدي
                            </span>
                        </div>
                    </TactileButton>

                    {/* Try Again Button */}
                    {showTryAgain && onTryAgain && (
                        <TactileButton
                            className={`w-full p-0 !rounded-[28px] overflow-hidden group border-none ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                            onClick={onTryAgain}
                        >
                            <div className="w-full p-4 flex items-center justify-center gap-3 z-10 relative">
                                <span className={`text-base font-bold ${textPrimary}`}>
                                    حاول مرة أخرى
                                </span>
                            </div>
                        </TactileButton>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`w-full p-4 rounded-2xl font-bold ${textSecondary} hover:${textPrimary} transition-colors`}
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePopup;
