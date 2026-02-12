import React from 'react';
import { Pause, Maximize, Minimize, Heart, Zap, Skull } from 'lucide-react';
import TactileButton from '../ui/TactileButton';

const GameHUD = ({
    score = 0,
    lives = 3,
    progress,
    onPause,
    onToggleFullScreen,
    isFullscreen,
    isDark,
    powerups = { freeze: 0, bomb: 0 },
    onFreeze,
    onBomb,
    frozen
}) => {
    const text = isDark ? 'text-white' : 'text-slate-800';

    return (
        <>
            {/* HEADER (HUD) */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-50 h-24">

                {/* Left: Pause & Fullscreen Buttons */}
                <div className="flex gap-2 shrink-0">
                    <TactileButton
                        onClick={onPause}
                        className="w-12 h-12 rounded-xl shadow-md flex items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 transition-all"
                        variant="primary"
                        colorClass={isDark ? 'bg-slate-800' : 'bg-white'}
                        borderClass={isDark ? 'border-slate-700' : 'border-slate-200'}
                    >
                        <Pause className={`w-6 h-6 fill-current ${isDark ? 'text-slate-200' : 'text-slate-700'}`} />
                    </TactileButton>
                    <TactileButton
                        onClick={onToggleFullScreen}
                        className="w-12 h-12 rounded-xl shadow-md flex items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 transition-all"
                        variant="primary"
                        colorClass={isDark ? 'bg-slate-800' : 'bg-white'}
                        borderClass={isDark ? 'border-slate-700' : 'border-slate-200'}
                    >
                        {isFullscreen ? 
                            <Minimize className={`w-6 h-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} /> : 
                            <Maximize className={`w-6 h-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} />
                        }
                    </TactileButton>
                </div>

                {/* Center: THE BOSS PROGRESS BAR (FLEXIBLE) */}
                {/* Only show progress if it's passed (not null/undefined) */}
                {progress !== null && progress !== undefined && (
                    <div className="flex-1 mx-3 h-6 relative">
                        {/* Background adjusted to be softer/more harmonious */}
                        <div className={`w-full h-full border-2 border-slate-400/50 rounded-full relative overflow-hidden shadow-inner ${isDark ? 'bg-slate-700/50' : 'bg-slate-300/50'}`}>
                            {/* Fill */}
                            <div
                                className={`h-full transition-all duration-500 ease-out relative rounded-l-full ${progress > 80 ? 'bg-gradient-to-r from-orange-600 to-red-600 animate-pulse' :
                                    progress > 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                        'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                                    }`}
                                style={{
                                    width: `${progress}%`,
                                    boxShadow: `0 0 15px ${progress > 80 ? '#ef4444' : progress > 50 ? '#f59e0b' : '#10b981'}`
                                }}
                            >
                                {/* Shine Effect */}
                                <div className="absolute top-0 left-0 right-0 h-[50%] bg-white/30 rounded-t-full"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_white]"></div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Right: Score + Lives */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border-2 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} shadow-sm`}>
                        <span className="text-yellow-500 text-xs font-black">XP</span>
                        <span className={`text-xl font-black ${text}`}>{(score ?? 0).toLocaleString()}</span>
                    </div>
                    {/* Lives */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} shadow-sm`}>
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                        <span className={`text-lg font-black ${text}`}>{lives}</span>
                    </div>
                </div>
            </div>


            {/* POWERUPS - positioned above answer buttons */}
            {onFreeze && onBomb && powerups && (
                <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-4 z-50">
                    {/* Freeze Button */}
                    <TactileButton
                        onClick={onFreeze}
                        disabled={powerups.freeze <= 0 || frozen}
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center gap-0"
                        variant="primary"
                        colorClass={isDark ? 'bg-slate-800' : 'bg-white'}
                        borderClass={isDark ? 'border-slate-700' : 'border-slate-200'}
                        activeScale={powerups.freeze > 0 && !frozen}
                    >
                        <span className="text-2xl filter drop-shadow-sm">❄️</span>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white dark:border-slate-800">
                            {powerups.freeze}
                        </div>
                    </TactileButton>

                    {/* Bomb Button */}
                    <TactileButton
                        onClick={onBomb}
                        disabled={powerups.bomb <= 0}
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center gap-0"
                        variant="primary"
                        colorClass={isDark ? 'bg-slate-800' : 'bg-white'}
                        borderClass={isDark ? 'border-slate-700' : 'border-slate-200'}
                        activeScale={powerups.bomb > 0}
                    >
                        <span className="text-2xl filter drop-shadow-sm">💣</span>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white dark:border-slate-800">
                            {powerups.bomb}
                        </div>
                    </TactileButton>
                </div>
            )}
        </>
    );
};

export default GameHUD;
