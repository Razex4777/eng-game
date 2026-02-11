import React from 'react';
import { TrendingUp, BookOpen } from 'lucide-react';

/**
 * CompletionProgress Component
 * Displays completion percentage across curriculum
 * Calculates: (total_questions_answered / total_questions) × 100
 *
 * Question totals:
 * - English: 348 questions
 * - Biology: 334 questions
 * - Combined: 682 questions
 */
const CompletionProgress = ({
    totalQuestionsAnswered = 0,
    subject = null, // 'english' | 'biology' | null (null = combined)
    isDark,
    className = ''
}) => {
    // Question totals by subject
    const QUESTION_TOTALS = {
        english: 348,
        biology: 334,
        combined: 682
    };

    // Determine total based on subject
    const totalQuestions = subject
        ? QUESTION_TOTALS[subject]
        : QUESTION_TOTALS.combined;

    // Calculate percentage
    const percentage = totalQuestions > 0
        ? Math.min(100, Math.round((totalQuestionsAnswered / totalQuestions) * 100))
        : 0;

    // Color scheme based on percentage
    const getColorScheme = (percent) => {
        if (percent >= 75) return 'green';
        if (percent >= 50) return 'blue';
        if (percent >= 25) return 'orange';
        return 'red';
    };

    const colorScheme = getColorScheme(percentage);

    const colorClasses = {
        green: {
            gradient: 'from-emerald-500 to-teal-500',
            bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
            border: isDark ? 'border-emerald-700' : 'border-emerald-200',
            text: 'text-emerald-600',
            ring: 'stroke-emerald-500'
        },
        blue: {
            gradient: 'from-blue-500 to-cyan-500',
            bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
            border: isDark ? 'border-blue-700' : 'border-blue-200',
            text: 'text-blue-600',
            ring: 'stroke-blue-500'
        },
        orange: {
            gradient: 'from-orange-500 to-amber-500',
            bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
            border: isDark ? 'border-orange-700' : 'border-orange-200',
            text: 'text-orange-600',
            ring: 'stroke-orange-500'
        },
        red: {
            gradient: 'from-red-500 to-pink-500',
            bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
            border: isDark ? 'border-red-700' : 'border-red-200',
            text: 'text-red-600',
            ring: 'stroke-red-500'
        }
    };

    const colors = colorClasses[colorScheme];

    // Circle progress dimensions
    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`w-full p-5 rounded-2xl border-2 relative overflow-hidden transition-all duration-300 ${colors.bg} ${colors.border} ${className}`}>
            <div className="flex items-center justify-between">
                {/* Left: Circular Progress */}
                <div className="relative">
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress Circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            className={colors.ring}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {percentage}%
                        </span>
                        <span className={`text-xs font-bold ${colors.text}`}>
                            مكتمل
                        </span>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 mr-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-black/20' : 'bg-white/50'}`}>
                            <BookOpen className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            تقدم المنهج
                        </h3>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                        <div className={`flex items-baseline gap-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            <span className="text-2xl font-black">{totalQuestionsAnswered}</span>
                            <span className="text-sm font-bold text-slate-400">من</span>
                            <span className="text-lg font-bold text-slate-400">{totalQuestions}</span>
                        </div>
                        <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {subject === 'english' && 'أسئلة اللغة الإنجليزية'}
                            {subject === 'biology' && 'أسئلة علم الأحياء'}
                            {!subject && 'إجمالي الأسئلة المجابة'}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-1.5 mt-3">
                        <TrendingUp className={`w-4 h-4 ${colors.text}`} />
                        <span className={`text-xs font-bold ${colors.text}`}>
                            {percentage >= 75 && 'ممتاز! قريب من الإتمام'}
                            {percentage >= 50 && percentage < 75 && 'في منتصف الطريق!'}
                            {percentage >= 25 && percentage < 50 && 'تقدم جيد، استمر!'}
                            {percentage < 25 && 'بداية رائعة!'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Linear Progress Bar at Bottom */}
            <div className={`w-full h-2 rounded-full overflow-hidden mt-4 ${isDark ? 'bg-black/20' : 'bg-white/50'}`}>
                <div
                    className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default CompletionProgress;
