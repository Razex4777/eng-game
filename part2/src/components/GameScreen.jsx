import React, { forwardRef } from 'react';
import { Pause, Maximize, Minimize, Heart, Zap, Shield, Target } from 'lucide-react';
import { StreakDisplay, ComboDisplay } from './GameEffects';
import TactileButton from './TactileButton';

/**
 * GameHeader - High-fidelity HUD showing score, lives, and controls
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
        <div className="flex items-start justify-between px-3 md:px-4 pt-3 md:pt-4 pb-2 relative z-[100] h-20 md:h-28 pointer-events-none">
            {/* Left HUD: Control Center */}
            <div className="flex gap-2 md:gap-2.5 pointer-events-auto">
                <button
                    onClick={onPause}
                    className="group w-10 h-10 md:w-14 md:h-14 glass-panel rounded-xl md:rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg md:shadow-xl shadow-slate-900/20"
                >
                    <Pause className="w-5 h-5 md:w-7 md:h-7 text-indigo-500 fill-indigo-500" />
                </button>
                <button
                    onClick={onToggleFullscreen}
                    className="w-10 h-10 md:w-14 md:h-14 glass-panel rounded-xl md:rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg md:shadow-xl shadow-slate-900/20"
                >
                    {isFullscreen
                        ? <Minimize className="w-5 h-5 md:w-7 md:h-7 text-slate-500" />
                        : <Maximize className="w-5 h-5 md:w-7 md:h-7 text-slate-500" />
                    }
                </button>
            </div>

            {/* Right HUD: Stats Center */}
            <div className="flex flex-col items-end gap-2 md:gap-3 pointer-events-auto">
                {/* Score Board */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg md:rounded-2xl blur opacity-25"></div>
                    <div className="relative flex items-center gap-2 md:gap-3 px-2 md:px-5 py-1 md:py-2 glass-panel rounded-lg md:rounded-2xl shadow-lg md:shadow-xl overflow-hidden min-w-[80px] md:min-w-[120px] justify-end border border-white/10">
                        <div className="flex flex-col items-end">
                            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest text-orange-500 leading-none mb-0.5 md:mb-1">XP Points</span>
                            <span className={`text-base md:text-2xl font-black ${textColor} leading-none tracking-tight`}>
                                {score.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-6 h-6 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-md md:shadow-lg transform -rotate-12">
                            <Zap className="w-3.5 h-3.5 md:w-6 md:h-6 text-white fill-white" />
                        </div>
                    </div>
                </div>

                {/* Lives Board */}
                <div className="flex items-center gap-2 group">
                    <div className="relative h-7 md:h-10 px-2.5 md:px-4 glass-panel rounded-full flex items-center gap-1 md:gap-2 shadow-lg border border-rose-500/30">
                        <Heart className={`w-3.5 h-3.5 md:w-5 md:h-5 text-rose-500 fill-rose-500 transition-transform ${lives <= 3 ? 'animate-bounce' : ''}`} />
                        <span className={`text-xs md:text-xl font-black ${textColor}`}>{lives}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * FallingQuestion - Physically modeled card with dynamic lighting
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
            className={`absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] md:max-w-sm p-4 md:p-8 rounded-[1.25rem] md:rounded-[2.5rem] text-center transform-gpu transition-shadow duration-300 ${shakeQuestion ? 'animate-shakeQ' : ''
                } ${frozen
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-200'
                    : currentQ.golden
                        ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 border-yellow-200'
                        : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100')
                } border-b-[4px] md:border-b-[10px] border-x-2 md:border-x-4 border-t-1 md:border-t-2 shadow-2xl`}
            style={{
                top: qY,
                zIndex: 40,
                boxShadow: frozen ? '0 0 20px rgba(34,211,238,0.2)' : currentQ.golden ? '0 0 20px rgba(234,179,8,0.2)' : undefined,
            }}
        >
            {/* Specialized Badge */}
            <div className="absolute -top-4 md:-top-6 left-0 right-0 flex justify-center gap-2 md:gap-3">
                {currentQ.golden && (
                    <div className="bg-white text-orange-600 text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 rounded-full shadow-lg border-2 border-orange-200 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 fill-orange-500" />
                        GOLDEN
                    </div>
                )}
                {frozen && (
                    <div className="bg-white text-cyan-600 text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 rounded-full shadow-lg border-2 border-cyan-200 flex items-center gap-1 animate-pulse">
                        FREEZE
                    </div>
                )}
            </div>

            {/* Question Text */}
            <div className="relative z-10">
                <p className={`text-base md:text-3xl font-black leading-tight tracking-tight ${frozen || currentQ.golden ? 'text-white' : textColor
                    }`}>
                    {currentQ.q}
                </p>
            </div>
        </div>
    );
});

FallingQuestion.displayName = 'FallingQuestion';

/**
 * ModernPowerups - High-end powerup deck
 */
const PowerupsBar = ({
    isDark,
    powerups,
    frozen,
    onFreeze,
    onBomb
}) => {
    return (
        <div className="flex justify-center gap-4 md:gap-8 pb-2 md:pb-3 relative z-50">
            <div className="relative group">
                <button
                    onClick={onFreeze}
                    disabled={powerups.freeze <= 0 || frozen}
                    className={`w-11 h-11 md:w-16 md:h-16 rounded-xl md:rounded-3xl glass-panel flex flex-col items-center justify-center shadow-lg transition-all ${powerups.freeze <= 0 || frozen ? 'opacity-20 scale-90' : 'active:scale-95'
                        }`}
                >
                    <span className="text-xl md:text-3xl">❄️</span>
                    <div className="absolute -bottom-1 px-1.5 md:px-3 py-0 text-[7px] md:text-[10px] font-black bg-cyan-500 text-white rounded-full border-2 border-white">
                        {powerups.freeze}
                    </div>
                </button>
            </div>

            <div className="relative group">
                <button
                    onClick={onBomb}
                    disabled={powerups.bomb <= 0}
                    className={`w-11 h-11 md:w-16 md:h-16 rounded-xl md:rounded-3xl glass-panel flex flex-col items-center justify-center shadow-lg transition-all ${powerups.bomb <= 0 ? 'opacity-20 scale-90' : 'active:scale-95'
                        }`}
                >
                    <span className="text-xl md:text-3xl">💣</span>
                    <div className="absolute -bottom-1 px-1.5 md:px-3 py-0 text-[7px] md:text-[10px] font-black bg-rose-500 text-white rounded-full border-2 border-white">
                        {powerups.bomb}
                    </div>
                </button>
            </div>
        </div>
    );
};

/**
 * AnswerButtons - Re-tooled arcade controller layout
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
    return (
        <div className="w-full px-2 md:px-4 pb-8 md:pb-12 pt-3 md:pt-4 shrink-0 z-50">
            <div className={`max-w-xl mx-auto p-2 md:p-6 rounded-[1.5rem] md:rounded-[3rem] glass-panel shadow-2xl ${isDark ? 'bg-slate-900/60' : 'bg-white/60'
                }`}>
                <div className="grid grid-cols-2 gap-1.5 md:gap-4">
                    {options?.map((opt, idx) => {
                        const isDisabled = disabledOptions.includes(opt);
                        const isFlying = flyingBtn?.index === idx;

                        return (
                            <button
                                key={idx}
                                ref={el => optionRefs.current[idx] = el}
                                onClick={() => !isDisabled && onAnswer(opt, idx)}
                                disabled={isDisabled || feedbackShow || flyingBtn !== null}
                                className={`
                  relative group min-h-[44px] md:min-h-[80px] px-2 md:px-6 rounded-xl md:rounded-[2rem] 
                  font-black text-[10px] md:text-xl tracking-wide 
                  transition-all duration-150 transform border-b-[3px] md:border-b-[8px] active:border-b-0 active:translate-y-[3px] md:active:translate-y-[8px] 
                  ${isFlying ? 'opacity-0 scale-95' :
                                        isDisabled
                                            ? 'opacity-20 contrast-50 pointer-events-none scale-95'
                                            : isDark
                                                ? 'bg-slate-800 text-white border-slate-950 hover:bg-slate-700'
                                                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                                    } shadow-md md:shadow-2xl
                `}
                            >
                                <div className="flex items-center justify-center gap-1.5 md:gap-3">
                                    <span className={`w-4 h-4 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[7px] md:text-[10px] border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="truncate">{opt}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/**
 * FlyingButton - Enhanced projectile with motion blur
 */
const FlyingButton = ({ flyingBtn }) => {
    if (!flyingBtn) return null;

    return (
        <div
            className={`fixed z-[300] rounded-[2rem] font-black text-xl flex items-center justify-center border-4 shadow-2xl ${flyingBtn.correct
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
                animation: 'spinProjectile 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                boxShadow: flyingBtn.correct ? '0 0 40px rgba(16,185,129,0.5)' : '0 0 40px rgba(244,63,94,0.5)'
            }}
        >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[2rem]"></div>
            <span className="relative z-10">{flyingBtn.text}</span>
        </div>
    );
};

/**
 * GameScreen - The visual peak of the experience
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
    feedbackShow,
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
        <div className="h-screen flex flex-col relative z-20 overflow-hidden">
            {/* Visual Ambiance */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] transition-opacity duration-700 ${streak.active ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] transition-opacity duration-700 ${streak.active ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>

            <GameHeader
                isDark={isDark}
                score={score}
                lives={lives}
                isFullscreen={isFullscreen}
                onPause={onPause}
                onToggleFullscreen={onToggleFullscreen}
            />

            {/* Main Gameplay Theater */}
            <div ref={gameAreaRef} className="flex-1 relative order-2 overflow-visible px-4">
                {/* HUD Feedback Layers */}
                <StreakDisplay streak={streak} />
                <ComboDisplay combo={combo} />

                {/* The Falling Subject */}
                <FallingQuestion
                    ref={questionRef}
                    currentQ={currentQ}
                    qY={qY}
                    isDark={isDark}
                    frozen={frozen}
                    shakeQuestion={shakeQuestion}
                />

                {/* Danger Proximity Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none opacity-0 transition-opacity duration-300" style={{ opacity: qY > 400 ? (qY - 400) / 300 : 0 }}></div>
            </div>

            <div className="flex flex-col shrink-0 order-3 md:order-2">
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
                    feedbackShow={feedbackShow}
                    optionRefs={optionRefs}
                    onAnswer={onAnswer}
                />
            </div>

            <FlyingButton flyingBtn={flyingBtn} />
        </div>
    );
};

export default GameScreen;
