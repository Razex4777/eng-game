import React from 'react';
import { RotateCcw, Home } from 'lucide-react';

const ResultsScreen = ({
    isDark,
    score,
    correctAnswers,
    wrongAnswers,
    onRestart,
    onMenu
}) => {
    const textColor = isDark ? 'text-white' : 'text-slate-800';
    const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-pop-in">
            <div className={`w-full max-w-sm p-6 rounded-[2rem] shadow-2xl border-2 ${cardBg} max-h-[90vh] overflow-y-auto`}>
                <div className="text-center mb-6">
                    <span className="text-6xl block mb-2">{score > 50 ? '👑' : '😎'}</span>
                    <h2 className={`text-3xl font-black ${textColor}`} style={{ fontFamily: "'Cairo', sans-serif" }}>النتيجة النهائية</h2>
                </div>

                {/* Total Score */}
                <div className="bg-slate-200 dark:bg-slate-700 p-6 rounded-2xl mb-6 text-center shadow-inner">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Score</span>
                    <div className="text-6xl font-black text-slate-800 dark:text-white mt-2">{score}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl text-center border-2 border-green-200 dark:border-green-800">
                        <span className="block text-xs font-bold text-green-700 dark:text-green-400 mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إجابات صحيحة</span>
                        <span className="text-3xl font-black text-green-600 dark:text-green-400">{correctAnswers.length}</span>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl text-center border-2 border-red-200 dark:border-red-800">
                        <span className="block text-xs font-bold text-red-700 dark:text-red-400 mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إجابات خاطئة</span>
                        <span className="text-3xl font-black text-red-600 dark:text-red-400">{wrongAnswers.length}</span>
                    </div>
                </div>

                {/* Error Review with Explanation */}
                {wrongAnswers.length > 0 && (
                    <div className="mb-4 max-h-40 overflow-y-auto bg-white dark:bg-slate-700 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                        <h3 className="font-bold text-red-500 mb-2 text-base text-right font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>الأخطاء ({wrongAnswers.length})</h3>
                        {wrongAnswers.map((item, i) => (
                            <div key={i} className="text-right text-sm border-b border-slate-100 dark:border-slate-600 last:border-0 py-3">
                                <p className="font-black mb-1 text-slate-800 dark:text-white text-base">{item.question.q}</p>
                                <div className="flex justify-end gap-2 mb-1">
                                    <span className="text-green-600 dark:text-green-400 font-black text-sm bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">{item.question.correct || item.question.a} ✓</span>
                                    <span className="text-red-500 dark:text-red-400 font-bold line-through opacity-70">{item.userAnswer || 'وقت'}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800 p-2 rounded font-bold text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>💡 {item.question.explanation || 'لا يوجد شرح متاح.'}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Play Again Button */}
                <button
                    onClick={onRestart}
                    className="w-full py-4 rounded-2xl font-black text-xl text-white bg-emerald-500 shadow-lg shadow-emerald-500/30 mb-3 hover:scale-105 transition-transform border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                    <RotateCcw className="w-6 h-6" />
                    لعب مرة أخرى
                </button>

                {/* Menu Button */}
                <button
                    onClick={onMenu}
                    className={`w-full py-4 rounded-2xl font-bold transition-colors border-b-4 active:border-b-0 active:translate-y-1 ${isDark ? 'text-slate-400 hover:bg-slate-700 border-slate-600 bg-slate-800' : 'text-slate-500 hover:bg-slate-100 border-slate-300 bg-slate-50'}`}
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        القائمة الرئيسية
                    </div>
                </button>
            </div>

            <style>{`
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>
        </div>
    );
};

export default ResultsScreen;
