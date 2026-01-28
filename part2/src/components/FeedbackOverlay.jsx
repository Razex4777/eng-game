import React from 'react';

const FeedbackOverlay = ({ feedback }) => {
    if (!feedback.show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[400] pointer-events-none px-4">
            <div className={`
        relative
        transform transition-all duration-300
        scale-100 md:scale-125 lg:scale-150
        p-6 md:p-8
        rounded-[2rem] md:rounded-[3rem]
        shadow-2xl text-center border-4 md:border-8
        animate-popIn
        max-w-[90vw]
        ${feedback.correct
                    ? 'bg-emerald-500 border-white text-white rotate-2 md:rotate-3'
                    : 'bg-rose-500 border-white text-white -rotate-2 md:-rotate-3'
                }`}>
                <div className="text-6xl md:text-8xl mb-2 md:mb-4 drop-shadow-md">
                    {feedback.correct ? '🤩' : '😱'}
                </div>
                <p className="text-xl md:text-3xl font-black whitespace-pre-line drop-shadow-md leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {feedback.message}
                </p>
            </div>

            <style>{`
        @keyframes popIn {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
        </div>
    );
};

export default FeedbackOverlay;
