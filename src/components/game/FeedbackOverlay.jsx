import React, { useMemo } from 'react';

/**
 * FeedbackOverlay Component
 * Displays animated feedback for correct/wrong answers
 * Features: Pop-in animation, emoji, message display, responsive scaling
 */
const FeedbackOverlay = ({
    show,
    correct,
    message,
    isDark = false
}) => {
    // Memoize decorative particles so they don't jump on every render
    const particles = useMemo(() => {
        return [...Array(6)].map((_, i) => ({
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            delay: `${i * 0.1}s`
        }));
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[400] pointer-events-none px-4">
            <div
                className={`
          relative
          transform transition-all duration-300
          scale-100 md:scale-125 lg:scale-150
          p-6 md:p-8
          rounded-[2rem] md:rounded-[3rem] 
          shadow-2xl text-center border-4 md:border-8 
          animate-pop-in 
          max-w-[90vw]
          ${correct
                        ? 'bg-emerald-500 border-white text-white rotate-2 md:rotate-3'
                        : 'bg-rose-500 border-white text-white -rotate-2 md:-rotate-3'
                    }
        `}
                style={{
                    boxShadow: correct
                        ? '0 25px 50px -12px rgba(16, 185, 129, 0.5)'
                        : '0 25px 50px -12px rgba(244, 63, 94, 0.5)'
                }}
            >
                {/* Emoji */}
                <div className="text-6xl md:text-8xl mb-2 md:mb-4 drop-shadow-md animate-bounce-in">
                    {correct ? '🤩' : '😱'}
                </div>

                {/* Message */}
                <p
                    className="text-xl md:text-3xl font-black whitespace-pre-line drop-shadow-md leading-tight"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                    {message}
                </p>

                {/* Decorative particles */}
                {correct && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                        {particles.map((p, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                                style={{
                                    top: p.top,
                                    left: p.left,
                                    animationDelay: p.delay,
                                    animationDuration: '1s'
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackOverlay;
