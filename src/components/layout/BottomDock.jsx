import React, { useState, useEffect } from 'react';
import { Target, Play, CheckCircle2, Briefcase, X, Loader2 } from 'lucide-react';
import TactileButton from '../ui/TactileButton';
import { getWrongAnswers } from '../../services/wrongAnswersService';
import { getTodayActivity } from '../../services/userProgressService';

/**
 * BottomDock (Simplified)
 * Clean daily task widget matching code.txt reference
 */
const BottomDock = ({
    isDarkMode,
    onTaskClick,
    onMistakeClick,
    onReviewStart,
    mistakesCount = 0,
    userId = null
}) => {
    const DAILY_GOAL = 2;
    const [dailyStages, setDailyStages] = useState(0);
    const [dailyLoading, setDailyLoading] = useState(true);
    const [mistakesOpen, setMistakesOpen] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDailyActivity = async () => {
            if (!userId) {
                setDailyLoading(false);
                return;
            }
            try {
                const { data: todayActivity } = await getTodayActivity(userId);
                setDailyStages(todayActivity?.games_played || 0);
            } catch (error) {
                console.error('[BottomDock] Error fetching daily activity:', error);
            } finally {
                setDailyLoading(false);
            }
        };
        fetchDailyActivity();
    }, [userId]);

    const taskState = dailyStages === 0 ? 0 : (dailyStages < DAILY_GOAL ? 1 : 2);

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

    const currentTask = [
        { color: 'bg-rose-400', border: 'border-rose-600', text: 'text-rose-900', label: 'ابدأ المهام', sub: `${dailyStages}/${DAILY_GOAL}`, icon: Target, iconBg: 'bg-rose-100' },
        { color: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-yellow-900', label: 'جاري العمل', sub: `${dailyStages}/${DAILY_GOAL}`, icon: Play, iconBg: 'bg-yellow-100' },
        { color: 'bg-emerald-400', border: 'border-emerald-600', text: 'text-emerald-900', label: 'أحسنت!', sub: `${dailyStages}/${DAILY_GOAL}`, icon: CheckCircle2, iconBg: 'bg-emerald-100' }
    ][taskState];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
            <div className="max-w-lg mx-auto flex items-end justify-between pointer-events-auto">
                {/* Mistakes Bag */}
                <div className="relative">
                    {mistakesOpen && (
                        <div className={`absolute bottom-full left-0 mb-3 w-56 p-4 rounded-2xl border-2 shadow-xl animate-slide-up ${isDarkMode ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>حقيبة الأخطاء</h3>
                                <button onClick={() => setMistakesOpen(false)}>
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">
                                لديك <span className="text-amber-500 font-bold">{wrongAnswers.length || mistakesCount}</span> أخطاء سابقة.
                            </p>
                            {loading ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                </div>
                            ) : wrongAnswers.length === 0 ? (
                                <div className="text-center py-3">
                                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                        ممتاز! لا توجد أخطاء 🎉
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setMistakesOpen(false);
                                        onReviewStart?.();
                                    }}
                                    className="w-full py-2 bg-amber-400 border-b-4 border-amber-600 text-white rounded-xl text-xs font-bold"
                                >
                                    راجعها الآن
                                </button>
                            )}
                        </div>
                    )}
                    <TactileButton
                        onClick={(e) => {
                            if (onMistakeClick && onMistakeClick(e) === false) return;
                            setMistakesOpen(!mistakesOpen);
                        }}
                        className="w-16 h-16 rounded-[20px] flex flex-col gap-1"
                        colorClass={isDarkMode ? 'bg-yellow-500' : 'bg-[#FCD34D]'}
                        borderClass="border-yellow-700"
                    >
                        <Briefcase className="w-6 h-6 text-amber-800" />
                        {mistakesCount > 0 && (
                            <span className={`absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-2 rounded-full flex items-center justify-center text-white text-[10px] font-bold animate-bounce ${isDarkMode ? 'border-slate-800' : 'border-white'}`}>
                                {mistakesCount}
                            </span>
                        )}
                    </TactileButton>
                </div>

                {/* Daily Task Widget */}
                <TactileButton
                    onClick={onTaskClick}
                    className="h-16 px-5 rounded-[20px] flex items-center justify-between gap-4 min-w-[180px]"
                    colorClass={currentTask.color}
                    borderClass={currentTask.border}
                >
                    <div className={`flex flex-col items-start ${currentTask.text}`}>
                        <span className="text-[10px] opacity-80 font-bold">المهمة اليومية</span>
                        <span className="text-sm font-black">{currentTask.label}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${currentTask.iconBg} flex items-center justify-center border-2 border-white/40`}>
                        {taskState === 2
                            ? <CheckCircle2 className="w-5 h-5 text-teal-600" />
                            : <span className={`font-black text-sm ${currentTask.text}`}>{currentTask.sub}</span>
                        }
                    </div>
                </TactileButton>
            </div>
        </div>
    );
};

export default BottomDock;
