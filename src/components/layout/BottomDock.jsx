import React, { useState, useEffect } from 'react';
import { Target, Play, CheckCircle2, Briefcase, X, Loader2, ChevronLeft, Trash2 } from 'lucide-react';
import TactileButton from '../ui/TactileButton';
import { getWrongAnswers, deleteWrongAnswer, getRealCorrectAnswer } from '../../services/wrongAnswersService';
import { getTodayActivity } from '../../services/userProgressService';

const BottomDock = ({
    isDarkMode,
    onTaskClick,
    onMistakeClick,
    onReviewStart,
    mistakesCount = 0,
    userId = null
}) => {
    const DAILY_GOAL = 2; // 2 stages per day as per client requirements
    const [dailyStages, setDailyStages] = useState(0);
    const [dailyLoading, setDailyLoading] = useState(true);

    // Mistakes modal state
    const [mistakesOpen, setMistakesOpen] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // Fetch daily activity from Supabase
    useEffect(() => {
        const fetchDailyActivity = async () => {
            if (!userId) {
                setDailyLoading(false);
                return;
            }

            try {
                const { data: todayActivity } = await getTodayActivity(userId);
                const stagesCompleted = todayActivity?.games_played || 0;
                setDailyStages(stagesCompleted);
            } catch (error) {
                console.error('[BottomDock] Error fetching daily activity:', error);
            } finally {
                setDailyLoading(false);
            }
        };

        fetchDailyActivity();
    }, [userId]);

    // Determine task state index (0, 1, or 2)
    const taskState = dailyStages === 0 ? 0 : (dailyStages < DAILY_GOAL ? 1 : 2);

    // Fetch wrong answers when modal opens
    useEffect(() => {
        const fetchData = async () => {
            if (mistakesOpen && userId) {
                setLoading(true);
                const { data } = await getWrongAnswers(userId);
                setWrongAnswers(data || []);
                setLoading(false);
            }
        };
        fetchData();
    }, [mistakesOpen, userId]);

    const handleDelete = async (id) => {
        // Optimistic delete
        const prev = wrongAnswers;
        setWrongAnswers(wa => wa.filter(w => w.id !== id));
        const { error } = await deleteWrongAnswer(id);
        if (error) {
            console.error('[BottomDock] Delete failed, rolling back:', error);
            setWrongAnswers(prev);
        }
    };

    const currentTask = [
        { color: 'bg-rose-400', border: 'border-rose-600', text: 'text-rose-900', label: 'ابدأ المهام', sub: `${dailyStages}/${DAILY_GOAL}`, icon: Target, iconBg: 'bg-rose-100' },
        { color: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-900', label: 'جاري العمل', sub: `${dailyStages}/${DAILY_GOAL}`, icon: Play, iconBg: 'bg-yellow-100' },
        { color: 'bg-emerald-400', border: 'border-emerald-600', text: 'text-emerald-900', label: 'مكتمل ✓', sub: `${dailyStages}/${DAILY_GOAL}`, icon: CheckCircle2, iconBg: 'bg-emerald-100' }
    ][taskState];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
            <div className="max-w-lg mx-auto flex items-end justify-between pointer-events-auto">
                <div className="relative">
                    {mistakesOpen && (
                        <div className={`absolute bottom-full left-0 mb-3 w-72 max-h-[400px] p-4 rounded-3xl border-2 border-b-4 shadow-xl animate-slide-up origin-bottom-left overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-[#E2E8F0]'}`}>
                            <div className="flex justify-between items-start mb-2">
                                {selectedAnswer ? (
                                    <button
                                        onClick={() => setSelectedAnswer(null)}
                                        className="flex items-center gap-1 text-amber-500 text-sm font-bold"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        رجوع
                                    </button>
                                ) : (
                                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>حقيبة الأخطاء</h3>
                                )}
                                <button onClick={() => { setMistakesOpen(false); setSelectedAnswer(null); }}>
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            {!selectedAnswer && (
                                <p className="text-xs text-slate-500 mb-3">
                                    لديك <span className="text-amber-500 font-bold">{wrongAnswers.length || mistakesCount}</span> أخطاء سابقة.
                                </p>
                            )}

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto min-h-0">
                                {loading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                    </div>
                                ) : selectedAnswer ? (
                                    // Detail View - Simplified to show only wrong answer and correct answer
                                    <div className="space-y-3">
                                        <p className={`text-sm font-bold text-right ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                            {selectedAnswer.question_text}
                                        </p>

                                        {/* Show user's wrong answer if different from correct */}
                                        {selectedAnswer.user_answer && selectedAnswer.user_answer !== selectedAnswer.correct_answer && (
                                            <div className="text-right">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">إجابتك:</span>
                                                <div className="p-2 rounded-lg text-xs text-right font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 line-through">
                                                    {selectedAnswer.user_answer}
                                                </div>
                                            </div>
                                        )}

                                        {/* Show correct answer */}
                                        <div className="text-right">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">الإجابة الصحيحة:</span>
                                            <div className="p-2 rounded-lg text-xs text-right font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800">
                                                {selectedAnswer.correct_answer || 'غير متوفر'}
                                            </div>
                                        </div>

                                        {/* Show explanation if available */}
                                        {selectedAnswer.explanation && (
                                            <p className="text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-right">
                                                💡 {selectedAnswer.explanation}
                                            </p>
                                        )}
                                    </div>
                                ) : wrongAnswers.length === 0 ? (
                                    <div className="text-center py-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                        <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            ممتاز! لا توجد أخطاء 🎉
                                        </p>
                                    </div>
                                ) : (
                                    // List View
                                    <div className="space-y-2">
                                        {wrongAnswers.slice(0, 10).map((wa) => (
                                            <div
                                                key={wa.id}
                                                onClick={() => setSelectedAnswer(wa)}
                                                className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600' : 'bg-slate-50 hover:bg-slate-100'}`}
                                            >
                                                <div className="flex-1 text-right">
                                                    <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                        {wa.question_text?.slice(0, 40)}...
                                                    </p>
                                                    <span className="text-[10px] text-slate-400">
                                                        {wa.subject === 'biology' ? '🧬 أحياء' : '📚 إنجليزي'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(wa.id); }}
                                                    className="p-1 rounded hover:bg-red-100 text-red-400"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {wrongAnswers.length > 10 && (
                                            <p className="text-center text-[10px] text-slate-400">+{wrongAnswers.length - 10} أخرى</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!selectedAnswer && wrongAnswers.length > 0 && (
                                <button
                                    onClick={() => {
                                        setMistakesOpen(false);
                                        setSelectedAnswer(null);
                                        onReviewStart?.();
                                    }}
                                    className="w-full py-2 bg-amber-400 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 text-white rounded-xl text-xs font-bold shadow-sm transition-all mt-3"
                                >
                                    راجعها الآن
                                </button>
                            )}
                        </div>
                    )}
                    <TactileButton
                        onClick={(e) => {
                            // First check if there's a tutorial step needed
                            if (onMistakeClick && onMistakeClick(e) === false) return;
                            // If tutorial allowed (or not needed), toggle menu
                            setMistakesOpen(!mistakesOpen);
                        }}
                        className="w-16 h-16 rounded-[20px] flex flex-col gap-1"
                        colorClass={isDarkMode ? 'bg-yellow-500' : 'bg-[#FCD34D]'}
                        borderClass={isDarkMode ? 'border-yellow-700' : 'border-yellow-700'}
                    >
                        <Briefcase className="w-6 h-6 text-amber-800" />
                        {mistakesCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm animate-bounce">
                                {mistakesCount}
                            </span>
                        )}
                    </TactileButton>
                </div>
                <TactileButton
                    onClick={(e) => {
                        onTaskClick(e);
                    }}
                    className="h-16 px-6 rounded-[20px] flex items-center justify-between gap-6 min-w-[190px]"
                    colorClass={currentTask.color}
                    borderClass={currentTask.border}
                >
                    <div className={`flex flex-col items-start ${currentTask.text}`}>
                        <span className="text-[10px] opacity-80 font-bold">المهمة اليومية</span>
                        <span className="text-sm font-black tracking-wide">{currentTask.label}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${currentTask.iconBg} flex items-center justify-center border-2 border-white/40 shadow-sm`}>
                        {taskState === 2 ? <CheckCircle2 className="w-5 h-5 text-teal-600" /> : <span className={`font-black text-sm ${currentTask.text}`}>{currentTask.sub}</span>}
                    </div>
                </TactileButton>
            </div>
        </div >
    );
};

export default BottomDock;

