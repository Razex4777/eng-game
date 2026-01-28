import React from 'react';
import { Home, RotateCcw, Trophy, Target, Star, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import TactileButton from './TactileButton';

const ResultsScreen = ({
    isDark,
    score,
    correctAnswers,
    wrongAnswers,
    onRestart,
    onMenu
}) => {
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-slate-400' : 'text-slate-600';
    const cardBg = isDark ? 'bg-slate-900' : 'bg-white';

    const accuracy = correctAnswers.length + wrongAnswers.length > 0
        ? Math.round((correctAnswers.length / (correctAnswers.length + wrongAnswers.length)) * 100)
        : 0;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center z-[200] p-3 md:p-6 overflow-y-auto">
            <div className="w-full max-w-[340px] md:max-w-xl animate-card-spawn py-6">
                {/* Header Ribbon */}
                <div className="text-center mb-6 md:mb-10 relative">
                    <div className="relative inline-block px-8 md:px-12 py-2 md:py-3 glass-panel rounded-full border-2 border-white/20">
                        <h2 className="text-2xl md:text-5xl font-black italic tracking-tighter text-white uppercase">GAME OVER</h2>
                    </div>
                </div>

                <div className={`${cardBg} rounded-[2rem] md:rounded-[3.5rem] p-5 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[3px] md:border-4 ${isDark ? 'border-slate-800' : 'border-slate-100'} relative overflow-hidden`}>

                    {/* Subtle Background Mark */}
                    <Trophy className="absolute -top-6 -right-6 w-32 h-32 md:w-64 md:h-64 text-slate-500/5 rotate-12" />

                    {/* Main Score Center */}
                    <div className="flex flex-col items-center mb-5 md:mb-10 relative z-10">
                        <div className="w-24 h-24 md:w-48 md:h-48 -mt-12 md:-mt-28 mb-0.5 relative transform hover:scale-105 transition-transform cursor-pointer">
                            <dotlottie-player
                                src="https://assets-v2.lottiefiles.com/a/e02d8f1e-2a64-11f0-a039-67a5a202f4d0/dcljI7D67C.lottie"
                                background="transparent"
                                speed="1"
                                style={{ width: '100%', height: '100%' }}
                                loop
                                autoplay
                            ></dotlottie-player>
                        </div>
                        <div className="text-center">
                            <div className="text-[7px] md:text-[10px] font-black text-orange-500 uppercase tracking-tight md:tracking-[0.3em] mb-0.5">Total XP Points</div>
                            <div className={`text-4xl md:text-8xl font-black ${textColor} tracking-tight leading-none`}>
                                {score.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-12">
                        {[
                            { label: 'Correct', val: correctAnswers.length, icon: <CheckCircle2 className="w-2.5 h-2.5 md:w-4 md:h-4" />, color: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
                            { label: 'Accuracy', val: `${accuracy}%`, icon: <Target className="w-2.5 h-2.5 md:w-4 md:h-4" />, color: 'bg-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
                            { label: 'Errors', val: wrongAnswers.length, icon: <AlertCircle className="w-2.5 h-2.5 md:w-4 md:h-4" />, color: 'bg-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-500' },
                        ].map((stat, i) => (
                            <div key={i} className={`${stat.bg} p-2 md:p-5 rounded-xl md:rounded-3xl border ${isDark ? 'border-white/5' : 'border-black/5'} flex flex-col items-center text-center transition-transform`}>
                                <div className={`${stat.color} w-5 h-5 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-white mb-1 shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <div className={`text-sm md:text-2xl font-black ${textColor}`}>{stat.val}</div>
                                <div className={`text-[6px] md:text-[9px] font-black uppercase tracking-widest ${stat.text}`}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* High-Fidelity Error Review Section */}
                    {wrongAnswers.length > 0 && (
                        <div className="mb-6 md:mb-10 last:mb-0">
                            <div className="flex items-center justify-between mb-2 md:mb-4">
                                <h3 className={`text-xs md:text-xl font-black ${textColor} italic`}>Error Review</h3>
                                <div className="h-0.5 grow mx-2 md:mx-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                <div className="bg-rose-500 text-white text-[7px] md:text-[10px] font-black px-2 py-0.5 rounded-full">{wrongAnswers.length} MISSES</div>
                            </div>

                            <div className="space-y-2 md:space-y-4 max-h-[160px] md:max-h-[300px] overflow-y-auto pr-1 hide-scrollbar" dir="rtl">
                                {wrongAnswers.map((item, i) => (
                                    <div key={i} className={`p-3 md:p-6 rounded-2xl md:rounded-[2rem] border-[1.5px] text-right transition-colors ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-black/5'
                                        }`}>
                                        <p className={`font-black text-xs md:text-lg mb-1.5 md:mb-3 ${textColor} leading-tight`}>{item.question.q}</p>
                                        <div className="flex flex-wrap justify-end gap-1.5 md:gap-3 mb-2 md:mb-4">
                                            <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-600 font-black px-2 md:px-4 py-0.5 md:py-1.5 rounded-lg text-[8px] md:text-xs border border-emerald-500/20">
                                                <CheckCircle2 className="w-2 h-2 md:w-3 md:h-3" /> {item.question.a}
                                            </span>
                                            <span className="flex items-center gap-1 bg-rose-500/10 text-rose-500 font-bold px-2 md:px-4 py-0.5 md:py-1.5 rounded-lg text-[8px] md:text-xs line-through opacity-60">
                                                {item.userAnswer || 'Time Over'}
                                            </span>
                                        </div>
                                        <div className={`p-2 md:p-4 rounded-xl text-[8px] md:text-xs font-bold italic border ${isDark ? 'bg-black/20 border-white/5 text-slate-400' : 'bg-white/50 border-black/5 text-slate-600'
                                            }`}>
                                            💡 {item.question.explanation}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Hub */}
                    <div className="grid grid-cols-2 gap-2 md:gap-4 mt-6 md:mt-12 relative z-10">
                        <TactileButton
                            onClick={onRestart}
                            className="h-11 md:h-16 rounded-xl md:rounded-2xl gap-1.5 md:gap-2 text-xs md:text-lg"
                            colorClass="bg-emerald-500"
                            borderClass="border-emerald-700"
                        >
                            <RotateCcw className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                            <span className="font-black text-white italic">مرة أخرى</span>
                        </TactileButton>
                        <TactileButton
                            onClick={onMenu}
                            className={`h-11 md:h-16 rounded-xl md:rounded-2xl gap-1.5 md:gap-2 text-[10px] md:text-lg ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
                            colorClass={isDark ? 'bg-slate-800' : 'bg-slate-100'}
                            borderClass={isDark ? 'border-slate-700' : 'border-slate-200'}
                        >
                            <Home className="w-3.5 h-3.5 md:w-5 md:h-5" /> القائمة
                        </TactileButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsScreen;
