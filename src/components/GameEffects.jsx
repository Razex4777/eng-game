import React from 'react';

/**
 * ParticleSystem - Renders confetti and coin particles
 */
const ParticleSystem = ({ particles }) => {
    return (
        <>
            {particles.map(p => (
                <div
                    key={p.id}
                    className="fixed pointer-events-none z-[500]"
                    style={{
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        opacity: p.life,
                        transform: `scale(${p.life}) rotate(${p.rotation}deg)`,
                        borderRadius: p.type === 'coin' ? '50%' : '2px',
                        boxShadow: p.type === 'coin' ? '0 0 10px #fbbf24' : 'none',
                        border: p.type === 'coin' ? '2px solid #f59e0b' : 'none'
                    }}
                >
                    {p.type === 'coin' && (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-yellow-700">
                            $
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

/**
 * ScorePopup - Floating score indicator when earning points
 */
const ScorePopup = ({ scorePopup }) => {
    if (!scorePopup) return null;

    return (
        <div
            className="fixed z-[400] pointer-events-none font-black text-2xl md:text-4xl animate-scoreUp"
            style={{ left: scorePopup.x, top: scorePopup.y, transform: 'translate(-50%, -50%)' }}
        >
            <span
                className={scorePopup.streak ? 'text-orange-500' : 'text-emerald-500'}
                style={{ textShadow: '1.5px 1.5px 0px white, 0 0 15px currentColor' }}
            >
                +{scorePopup.points}
            </span>
        </div>
    );
};

/**
 * StreakDisplay - Shows combo multiplier with timer ring
 */
const StreakDisplay = ({ streak }) => {
    if (!streak.active) return null;

    return (
        <div className="absolute bottom-24 md:bottom-32 left-3 md:left-4 z-30 animate-popIn">
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-2 md:border-4 relative overflow-hidden ${streak.multiplier >= 5 ? 'bg-gradient-to-br from-red-600 to-orange-600 border-orange-400' :
                streak.multiplier >= 4 ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-amber-300' :
                    'bg-gradient-to-br from-blue-500 to-indigo-500 border-indigo-300'
                }`}>
                <span className="text-white text-base md:text-xl font-black leading-none">{streak.multiplier}X</span>
                <span className="text-[7px] md:text-[9px] font-bold text-white/90">COMBO</span>
                {/* Timer Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
                    <circle cx="24" cy="24" r="20" className="md:hidden" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        className="md:hidden"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={126}
                        strokeDashoffset={126 - (126 * streak.timeLeft / streak.maxTime)}
                    />
                    <circle cx="32" cy="32" r="28" className="hidden md:block" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                    <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="hidden md:block"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={175}
                        strokeDashoffset={175 - (175 * streak.timeLeft / streak.maxTime)}
                    />
                </svg>
            </div>
        </div>
    );
};

/**
 * ComboDisplay - Shows fire emoji with combo count
 */
const ComboDisplay = ({ combo }) => {
    if (combo < 2) return null;

    return (
        <div className="absolute bottom-24 md:bottom-32 right-3 md:right-4 z-30 flex flex-col items-center animate-popIn">
            <div className="relative">
                <span className="text-3xl md:text-5xl block animate-fire filter drop-shadow-md">🔥</span>
                <span className="absolute top-full left-1/2 -translate-x-1/2 text-white bg-orange-500 text-[8px] md:text-xs font-black px-1.5 md:px-2 py-0.5 rounded rotate-3 whitespace-nowrap border border-white shadow-lg">
                    {combo}x
                </span>
            </div>
        </div>
    );
};

export { ParticleSystem, ScorePopup, StreakDisplay, ComboDisplay };
