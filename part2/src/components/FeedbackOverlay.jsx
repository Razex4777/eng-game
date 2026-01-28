import React from 'react';

const FeedbackOverlay = ({ feedback }) => {
    if (!feedback.show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[500] pointer-events-none p-4 overflow-hidden">
            {/* Full-Screen Dynamic Flash */}
            <div className={`
                absolute inset-0 transition-opacity duration-300
                ${feedback.correct
                    ? 'bg-emerald-500/10 animate-pulse'
                    : 'bg-rose-500/10 animate-pulse'
                }
            `}></div>

            {/* High-Impact Badge */}
            <div className={`
                relative
                transform transition-all duration-300
                scale-100 md:scale-150
                p-6 md:p-12
                rounded-[2.5rem] md:rounded-[4rem] 
                shadow-[0_40px_100px_rgba(0,0,0,0.5)] 
                text-center 
                border-4 md:border-8 border-white
                animate-pop-in
                max-w-[85vw]
                flex flex-col items-center
                ${feedback.correct
                    ? 'bg-gradient-to-br from-emerald-400 to-green-600 rotate-3'
                    : 'bg-gradient-to-br from-rose-400 to-rose-600 -rotate-3'
                }
            `}>
                {/* Visual Ornament */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-[inherit]">
                    <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-white/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Big Reaction Emoji */}
                <div className="text-5xl md:text-9xl mb-3 md:mb-6 drop-shadow-2xl animate-bounce">
                    {feedback.correct ? '🤩' : '😱'}
                </div>

                {/* Feedback Message */}
                <p className="text-xl md:text-4xl font-black text-white whitespace-pre-line drop-shadow-md leading-none tracking-tighter" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {feedback.message}
                </p>

                {/* Streak Indication if Correct */}
                {feedback.correct && (
                    <div className="mt-3 md:mt-4 px-3 md:px-4 py-1 bg-white/20 rounded-full text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest border border-white/30 backdrop-blur-sm">
                        PERFECT STREAK
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackOverlay;
