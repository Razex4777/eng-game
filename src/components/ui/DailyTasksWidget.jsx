import React, { useEffect, useState } from 'react';
import { Flame, Target } from 'lucide-react';
import { getTodayActivity } from '../../services/userProgressService';

/**
 * DailyTasksWidget Component
 * Displays daily goal: 2 stages/day with progress indicator
 * Green: 2+ stages completed | Red: 0-1 stages completed
 */
const DailyTasksWidget = ({ userId, isDark, className = '' }) => {
    const [dailyData, setDailyData] = useState({
        stagesCompleted: 0,
        currentStreak: 0
    });
    const [loading, setLoading] = useState(true);

    const DAILY_GOAL = 2;

    useEffect(() => {
        const fetchDailyData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                // Get today's activity
                const { data: todayActivity } = await getTodayActivity(userId);

                // Calculate stages completed today (games_played represents stages)
                const stagesCompleted = todayActivity?.games_played || 0;

                setDailyData({
                    stagesCompleted,
                    currentStreak: 0 // Will be passed from parent or fetched separately
                });
            } catch (error) {
                console.error('[DailyTasksWidget] Error fetching daily data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyData();
    }, [userId]);

    if (loading) {
        return (
            <div className={`w-full p-4 rounded-2xl border-2 animate-pulse ${isDark ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-slate-200'} ${className}`}>
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        );
    }

    const { stagesCompleted } = dailyData;
    const isGoalMet = stagesCompleted >= DAILY_GOAL;
    const progressPercent = Math.min(100, (stagesCompleted / DAILY_GOAL) * 100);

    // Color scheme based on progress
    const statusColor = isGoalMet ? 'green' : stagesCompleted >= 1 ? 'orange' : 'red';

    const colorClasses = {
        green: {
            bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
            border: isDark ? 'border-emerald-700' : 'border-emerald-200',
            text: 'text-emerald-600',
            icon: 'text-emerald-500',
            progress: 'bg-emerald-500'
        },
        orange: {
            bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
            border: isDark ? 'border-orange-700' : 'border-orange-200',
            text: 'text-orange-600',
            icon: 'text-orange-500',
            progress: 'bg-orange-500'
        },
        red: {
            bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
            border: isDark ? 'border-red-700' : 'border-red-200',
            text: 'text-red-600',
            icon: 'text-red-500',
            progress: 'bg-red-500'
        }
    };

    const colors = colorClasses[statusColor];

    return (
        <div className={`w-full p-4 rounded-2xl border-2 relative overflow-hidden transition-all duration-300 ${colors.bg} ${colors.border} ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/50'}`}>
                        <Target className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            الهدف اليومي
                        </h3>
                        <p className={`text-xs font-bold ${colors.text}`}>
                            {stagesCompleted} من {DAILY_GOAL} مراحل اليوم
                        </p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isDark ? 'bg-black/20' : 'bg-white/70'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${isGoalMet ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {isGoalMet ? 'مكتمل ✓' : 'قيد التقدم'}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-black/20' : 'bg-white/50'}`}>
                <div
                    className={`h-full transition-all duration-500 ${colors.progress} shadow-lg`}
                    style={{ width: `${progressPercent}%` }}
                >
                    {isGoalMet && (
                        <div className="w-full h-full bg-white/30 animate-pulse"></div>
                    )}
                </div>
            </div>

            {/* Motivational Message */}
            <p className={`text-xs font-bold mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {isGoalMet
                    ? '🎉 أحسنت! حققت هدفك اليومي'
                    : stagesCompleted >= 1
                        ? '💪 مرحلة واحدة تبقت لتحقيق الهدف!'
                        : '🚀 ابدأ رحلتك اليومية الآن'
                }
            </p>
        </div>
    );
};

export default DailyTasksWidget;
