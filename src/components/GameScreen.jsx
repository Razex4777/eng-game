import React, { forwardRef } from 'react';
import { Pause, Maximize, Minimize, Heart, Zap } from 'lucide-react';

/**
 * GameHeader - HUD showing score, lives, and controls
 */
const GameHeader = ({
    isDark,
    score,
    lives,
    isFullscreen,
    onPause,
    onToggleFullscreen
}) => {
    const textColor = isDark ? 'text-white' : 'text-slate-800';

    return (
        <div className="flex items-start justify-between px-4 pt-4 pb-2 relative z-50 h-24">
            {/* Left: Pause & Fullscreen Buttons */}
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={onPause}
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-md flex items-center justify-center border-b-4 border-slate-200 dark:border-slate-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <Pause className="w-6 h-6 text-slate-700 dark:text-slate-200 fill-current" />
                </button>
                <button
                    onClick={onToggleFullscreen}
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-md flex items-center justify-center border-b-4 border-slate-200 dark:border-slate-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    {isFullscreen ? <Minimize className="w-6 h-6 text-slate-700 dark:text-slate-200" /> : <Maximize className="w-6 h-6 text-slate-700 dark:text-slate-200" />}
                </button>
            </div>

            {/* Right: Score + Lives */}
            <div className="flex flex-col items-end gap-1 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border-2 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} shadow-sm`}>
                    <span className="text-yellow-500 text-xs font-black">XP</span>
                    <span className={`text-xl font-black ${textColor}`}>{score.toLocaleString()}</span>
                </div>
                {/* Lives (Single Heart with Number) */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} shadow-sm`}>
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <span className={`text-lg font-black ${textColor}`}>{lives}</span>
                </div>
            </div>
        </div>
    );
};

/**
 * StreakDisplay - Shows combo multiplier with timer ring
 */
const StreakDisplay = ({ streak }) => {
    if (!streak.active) return null;

    return (
        <div className="absolute bottom-32 left-4 z-30 animate-pop-in">
            <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 relative overflow-hidden ${streak.multiplier >= 5 ? 'bg-gradient-to-br from-red-600 to-orange-600 border-orange-400' :
                streak.multiplier >= 4 ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-amber-300' :
                    'bg-gradient-to-br from-blue-500 to-indigo-500 border-indigo-300'
                }`}>
                <span className="text-white text-xl font-black leading-none">{streak.multiplier}X</span>
                <span className="text-[9px] font-bold text-white/90">COMBO</span>
                {/* Timer Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={175} strokeDashoffset={175 - (175 * streak.timeLeft / streak.maxTime)} />
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
        <div className="absolute bottom-32 right-4 z-30 flex flex-col items-center animate-pop-in">
            <div className="relative">
                <span className="text-5xl block animate-fire filter drop-shadow-md">🔥</span>
                <span className="absolute top-full left-1/2 -translate-x-1/2 text-white bg-orange-500 text-xs font-black px-2 py-0.5 rounded rotate-3 whitespace-nowrap border border-white shadow-lg">
                    {combo}x
                </span>
            </div>
        </div>
    );
};

/**
 * FallingQuestion - The question card that falls down
 */
const FallingQuestion = forwardRef(({
    currentQ,
    qY,
    isDark,
    frozen,
    shakeQuestion
}, ref) => {
    const textColor = isDark ? 'text-white' : 'text-slate-800';

    if (!currentQ) return null;

    return (
        <div
            ref={ref}
            className={`absolute left-1/2 -translate-x-1/2 w-[90%] max-w-sm p-6 rounded-3xl text-center transition-transform ${shakeQuestion ? 'animate-shakeQ' : ''} ${frozen ? 'bg-cyan-500 border-cyan-300' :
                currentQ.golden ? 'bg-amber-400 border-amber-200' :
                    (isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200')
                } border-b-[8px] border-x-2 border-t-2`}
            style={{
                top: qY,
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                animation: currentQ.golden && !frozen ? 'goldenPulse 1.5s infinite' : undefined
            }}
        >
            {/* Badges */}
            <div className="absolute -top-4 left-0 right-0 flex justify-center gap-2">
                {currentQ.golden && <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-yellow-300">GOLDEN</span>}
                {frozen && <span className="bg-cyan-100 text-cyan-800 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-cyan-300 animate-pulse">FROZEN</span>}
            </div>

            <p className={`text-xl font-black leading-snug ${frozen ? 'text-white' : currentQ.golden ? 'text-amber-900' : textColor}`}>
                {currentQ.q}
            </p>
        </div>
    );
});

FallingQuestion.displayName = 'FallingQuestion';

/**
 * PowerupsBar - Freeze and Bomb buttons
 */
const PowerupsBar = ({
    isDark,
    powerups,
    frozen,
    onFreeze,
    onBomb
}) => {
    return (
        <div className="flex justify-center gap-6 pb-2 relative z-20">
            <button
                onClick={onFreeze}
                disabled={powerups.freeze <= 0 || frozen}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 transition-all active:scale-90 ${powerups.freeze <= 0 || frozen ? 'opacity-30 grayscale scale-90' : 'hover:scale-105 hover:-translate-y-1'
                    } ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}
            >
                ❄️
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow">{powerups.freeze}</span>
            </button>
            <button
                onClick={onBomb}
                disabled={powerups.bomb <= 0}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 transition-all active:scale-90 ${powerups.bomb <= 0 ? 'opacity-30 grayscale scale-90' : 'hover:scale-105 hover:-translate-y-1'
                    } ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}
            >
                💣
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow">{powerups.bomb}</span>
            </button>
        </div>
    );
};

/**
 * AnswerButtons - Tactile answer options (same style as menu)
 */
const AnswerButtons = ({
    isDark,
    options,
    disabledOptions,
    flyingBtn,
    feedbackShow,
    optionRefs,
    onAnswer
}) => {
    if (!options) return null;

    return (
        <div className={`p-4 pb-8 rounded-t-[3rem] border-t ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-white/60 border-white/60'}`}>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {options.map((opt, idx) => {
                    const isDisabled = disabledOptions.includes(opt);
                    const isFlying = flyingBtn?.index === idx;

                    return (
                        <button
                            key={idx}
                            ref={el => optionRefs.current[idx] = el}
                            onClick={() => !isDisabled && onAnswer(opt, idx)}
                            disabled={isDisabled || feedbackShow || flyingBtn !== null}
                            className={`
                                relative py-5 px-3 rounded-2xl font-black text-lg tracking-wide 
                                border-2 border-b-[6px] 
                                active:border-b-2 active:translate-y-[4px] active:scale-[0.98]
                                transition-all duration-150 ease-out
                                ${isFlying ? 'opacity-0' :
                                    isDisabled
                                        ? 'opacity-30 grayscale pointer-events-none scale-90'
                                        : isDark
                                            ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600'
                                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * FlyingButton - Animated button that flies to question
 */
const FlyingButton = ({ flyingBtn }) => {
    if (!flyingBtn) return null;

    return (
        <div
            className={`fixed z-[300] rounded-2xl font-black text-lg flex items-center justify-center border-4 ${flyingBtn.correct
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-rose-500 text-white border-rose-600'
                }`}
            style={{
                left: flyingBtn.startX,
                top: flyingBtn.startY,
                width: flyingBtn.startW,
                height: flyingBtn.startH,
                '--tx': `${flyingBtn.targetX - flyingBtn.startX}px`,
                '--ty': `${flyingBtn.targetY - flyingBtn.startY}px`,
                animation: 'spinProjectile 0.35s ease-in forwards',
                boxShadow: '0 0 40px rgba(0,0,0,0.3)'
            }}
        >
            {flyingBtn.text}
        </div>
    );
};

/**
 * GameScreen - Main game interface
 */
const GameScreen = ({
    isDark,
    score,
    lives,
    combo,
    streak,
    powerups,
    frozen,
    currentQ,
    qY,
    disabledOptions,
    flyingBtn,
    shakeQuestion,
    isFullscreen,
    gameAreaRef,
    questionRef,
    optionRefs,
    onPause,
    onToggleFullscreen,
    onFreeze,
    onBomb,
    onAnswer
}) => {
    return (
        <div className="h-screen flex flex-col relative z-10">
            {/* Fever Mode Background Effect */}
            {streak.active && streak.multiplier >= 5 && (
                <div className="fixed inset-0 pointer-events-none fever-mode z-0" />
            )}

            <GameHeader
                isDark={isDark}
                score={score}
                lives={lives}
                isFullscreen={isFullscreen}
                onPause={onPause}
                onToggleFullscreen={onToggleFullscreen}
            />

            {/* Game Area */}
            <div ref={gameAreaRef} className="flex-1 relative overflow-visible">
                <StreakDisplay streak={streak} />
                <ComboDisplay combo={combo} />

                <FallingQuestion
                    ref={questionRef}
                    currentQ={currentQ}
                    qY={qY}
                    isDark={isDark}
                    frozen={frozen}
                    shakeQuestion={shakeQuestion}
                />
            </div>

            <div className="flex flex-col shrink-0">
                <PowerupsBar
                    isDark={isDark}
                    powerups={powerups}
                    frozen={frozen}
                    onFreeze={onFreeze}
                    onBomb={onBomb}
                />

                <AnswerButtons
                    isDark={isDark}
                    options={currentQ?.options}
                    disabledOptions={disabledOptions}
                    flyingBtn={flyingBtn}
                    feedbackShow={false}
                    optionRefs={optionRefs}
                    onAnswer={onAnswer}
                />
            </div>

            <FlyingButton flyingBtn={flyingBtn} />

            <style>{`
        @keyframes shakeQ { 0%, 100% { transform: translateX(-50%) scale(1); } 20% { transform: translateX(calc(-50% - 10px)) scale(1.02); } 40% { transform: translateX(calc(-50% + 10px)) scale(0.98); } 60% { transform: translateX(calc(-50% - 8px)) scale(1.01); } 80% { transform: translateX(calc(-50% + 8px)) scale(0.99); } }
        @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fire { 0%, 100% { transform: scale(1) rotate(-3deg); filter: brightness(1); } 50% { transform: scale(1.2) rotate(3deg); filter: brightness(1.3); } }
        @keyframes goldenPulse { 0%, 100% { box-shadow: 0 8px 0 #d97706, 0 0 30px rgba(251,191,36,0.5); } 50% { box-shadow: 0 8px 0 #d97706, 0 0 50px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.4); } }
        @keyframes spinProjectile { 0% { transform: translate(0,0) rotate(0deg); } 100% { transform: translate(var(--tx), var(--ty)) rotate(360deg) scale(0.5); } }
        @keyframes neonPulse { 0%, 100% { box-shadow: inset 0 0 20px rgba(236, 72, 153, 0.5); } 50% { box-shadow: inset 0 0 50px rgba(168, 85, 247, 0.8); } }
        .animate-shakeQ { animation: shakeQ 0.4s ease-out; }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-fire { animation: fire 0.3s infinite; }
        .fever-mode { animation: neonPulse 1s infinite alternate; background: rgba(236, 72, 153, 0.1); }
      `}</style>
        </div>
    );
};

export default GameScreen;
