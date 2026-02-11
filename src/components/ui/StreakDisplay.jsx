import React, { useEffect, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { getUserStats } from '../../services/userProgressService';

/**
 * StreakDisplay Component
 * Visual 7-day calendar showing completed days with fire icons
 * Displays current streak prominently with max streak badge
 */
const StreakDisplay = ({ userId, isDark, className = '' }) => {
    const [streakData, setStreakData] = useState({
        currentStreak: 0,
        maxStreak: 0,
        lastPlayDate: null,
        weekDays: []
    });
    const [loading, setLoading] = useState(true);

    // Arabic day names and abbreviations
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayAbbreviations = ['أحد', 'إثن', 'ثلث', 'أرب', 'خمس', 'جمع', 'سبت'];

    useEffect(() => {
        const fetchStreakData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const { data: stats } = await getUserStats(userId);

                const currentStreak = stats?.current_streak_days || 0;
                const maxStreak = stats?.max_streak_days || 0;
                const lastPlayDate = stats?.last_play_date;

                // Generate last 7 days status
                const weekDays = generateWeekDays(currentStreak, lastPlayDate);

                setStreakData({
                    currentStreak,
                    maxStreak,
                    lastPlayDate,
                    weekDays
                });
            } catch (error) {
                console.error('[StreakDisplay] Error fetching streak data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStreakData();
    }, [userId]);

    // Generate 7-day calendar based on current streak
    const generateWeekDays = (currentStreak, lastPlayDate) => {
        const today = new Date();
        const days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const dayOfWeek = date.getDay();
            const dayName = dayNames[dayOfWeek];
            const dayAbbr = dayAbbreviations[dayOfWeek];

            // Determine if this day is completed
            // If current streak is N, last N days (including today) are completed
            const isCompleted = i < currentStreak;

            days.push({
                date,
                dayName,
                dayAbbr,
                isCompleted,
                isToday: i === 0
            });
        }

        return days;
    };

    if (loading) {
        return (
            <div className={`w-full p-4 rounded-2xl border-2 animate-pulse ${isDark ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-slate-200'} ${className}`}>
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        );
    }

    const { currentStreak, maxStreak, weekDays } = streakData;
    const isMaxStreak = currentStreak > 0 && currentStreak === maxStreak;

    return (
        <div className={`w-full p-4 rounded-2xl border-2 relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-slate-200'} ${className}`}>
            {/* Header with Current Streak */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                        <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-400'}`} />
                    </div>
                    <div>
                        <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            سلسلة: {currentStreak} {currentStreak === 1 ? 'يوم' : 'أيام'}
                        </h3>
                        <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            أقصى سلسلة: {maxStreak} {maxStreak === 1 ? 'يوم' : 'أيام'}
                        </p>
                    </div>
                </div>

                {/* Max Streak Badge */}
                {isMaxStreak && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg animate-pulse">
                        <Trophy className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-black text-white">رقم قياسي</span>
                    </div>
                )}
            </div>

            {/* 7-Day Calendar */}
            <div className="flex items-center justify-between gap-1">
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center gap-1.5 flex-1"
                    >
                        {/* Fire Icon or Empty Circle */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                            day.isCompleted
                                ? isDark ? 'bg-orange-900/50' : 'bg-orange-100'
                                : isDark ? 'bg-slate-700' : 'bg-slate-100'
                        } ${day.isToday ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
                            {day.isCompleted ? (
                                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            ) : (
                                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                            )}
                        </div>

                        {/* Day Name */}
                        <span className={`text-[10px] font-bold ${
                            day.isToday
                                ? isDark ? 'text-blue-400' : 'text-blue-600'
                                : isDark ? 'text-slate-500' : 'text-slate-600'
                        }`}>
                            {day.dayAbbr}
                        </span>
                    </div>
                ))}
            </div>

            {/* Motivational Message */}
            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <p className={`text-xs font-bold text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {currentStreak === 0 && '🔥 ابدأ سلسلتك اليوم!'}
                    {currentStreak === 1 && '💪 سلسلة رائعة! استمر غداً'}
                    {currentStreak >= 2 && currentStreak < 7 && `🌟 رائع! ${7 - currentStreak} أيام للأسبوع الكامل`}
                    {currentStreak >= 7 && currentStreak < 30 && '🔥 أنت في وضع النار! استمر'}
                    {currentStreak >= 30 && '👑 أسطوري! سلسلة لا تصدق'}
                </p>
            </div>
        </div>
    );
};

export default StreakDisplay;
