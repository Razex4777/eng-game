import React, { forwardRef } from 'react';

/**
 * QuestionCard Component
 * Displays the falling question with various states (normal, golden, frozen)
 * Features: Animated badges, shake effect, glow effects
 */
const QuestionCard = forwardRef(({
    question,
    position,
    frozen = false,
    shaking = false,
    isDark = false
}, ref) => {
    if (!question) return null;

    const isGolden = question.golden;

    // Determine card background based on state
    const getCardBackground = () => {
        if (frozen) return 'bg-cyan-500 border-cyan-300';
        if (isGolden) return 'bg-amber-400 border-amber-200';
        return isDark
            ? 'bg-slate-800 border-slate-600'
            : 'bg-white border-slate-200';
    };

    // Determine text color based on state
    const getTextColor = () => {
        if (frozen) return 'text-white';
        if (isGolden) return 'text-amber-900';
        return isDark ? 'text-white' : 'text-slate-800';
    };

    return (
        <div
            ref={ref}
            className={`
        absolute left-1/2 -translate-x-1/2 
        w-[90%] max-w-sm 
        p-6 rounded-3xl text-center 
        transition-transform 
        ${shaking ? 'animate-shake' : ''} 
        ${getCardBackground()}
        border-b-[8px] border-x-2 border-t-2
      `}
            style={{
                top: typeof position === 'number' ? `${position}px` : position,
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                animation: isGolden && !frozen ? 'golden-pulse 1.5s infinite' : undefined
            }}
        >
            {/* Badges */}
            <div className="absolute -top-4 left-0 right-0 flex justify-center gap-2">
                {isGolden && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-yellow-300 animate-pulse">
                        ⭐ GOLDEN
                    </span>
                )}
                {frozen && (
                    <span className="bg-cyan-100 text-cyan-800 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-cyan-300 animate-pulse">
                        ❄️ FROZEN
                    </span>
                )}
            </div>

            {/* Question Text */}
            <p className={`text-xl font-black leading-snug ${getTextColor()}`}>
                {question.text || question.q}
            </p>

            {/* Difficulty indicator (optional) */}
            {question.difficulty && (
                <div className="mt-3 flex justify-center gap-1">
                    {[1, 2, 3].map((level) => (
                        <div
                            key={level}
                            className={`w-2 h-2 rounded-full transition-all ${level <= (question.difficulty === 'easy' ? 1 : question.difficulty === 'medium' ? 2 : 3)
                                ? 'bg-current opacity-80'
                                : 'bg-current opacity-20'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Frozen effect overlay */}
            {frozen && (
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                    {/* Snowflakes */}
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-white/60 text-lg animate-snowflake-fall"
                            style={{
                                left: `${10 + i * 20}%`,
                                animationDelay: `${i * 0.3}s`
                            }}
                        >
                            ❄️
                        </div>
                    ))}
                </div>
            )}

            {/* Golden glow effect */}
            {isGolden && !frozen && (
                <div className="absolute -inset-2 rounded-[2rem] bg-yellow-400/20 blur-xl -z-10 animate-pulse" />
            )}
        </div>
    );
});

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;
