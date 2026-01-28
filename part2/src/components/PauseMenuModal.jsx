import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import TactileButton from './TactileButton';
import { triggerHaptic } from '../utils/haptic';
import { SPEED_MODES } from '../data/gameData';

/**
 * PauseMenuModal - Game pause menu with settings
 */
const PauseMenuModal = ({
    isOpen,
    onResume,
    onExit,
    currentSpeedMode,
    setSpeedMode,
    isMuted,
    setIsMuted,
    isDark,
    setIsDark
}) => {
    const [speedOpen, setSpeedOpen] = useState(false);
    const selectedSpeedConfig = SPEED_MODES[currentSpeedMode] || SPEED_MODES['teen'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-5 font-['Cairo']">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onResume}></div>

            {/* Modal Body */}
            <div className="relative w-full max-w-[320px] md:max-w-sm bg-white dark:bg-[#1E293B] p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-[3px] md:border-4 border-slate-200 dark:border-slate-700 shadow-2xl animate-pop-in overflow-hidden max-h-[90vh] flex flex-col">

                {/* Title */}
                <div className="text-center mb-4 md:mb-6 shrink-0 pt-1">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-0.5 md:mb-1">استراحة محارب 🛑</h2>
                    <p className="text-[10px] md:text-sm font-bold text-slate-400">خذ نفس وكمل الطريق</p>
                </div>

                <div className="space-y-2 md:space-y-3 overflow-y-auto hide-scrollbar px-1 pb-1">
                    {/* Resume Button */}
                    <TactileButton
                        onClick={onResume}
                        className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl gap-2 md:gap-3 text-base md:text-lg shrink-0"
                        colorClass="bg-yellow-400"
                        borderClass="border-yellow-600"
                    >
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current text-yellow-900" />
                        <span className="font-black text-yellow-900">استئناف اللعب</span>
                    </TactileButton>

                    {/* Speed Control */}
                    <div className="relative shrink-0">
                        <TactileButton
                            onClick={() => setSpeedOpen(!speedOpen)}
                            className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl justify-between"
                            colorClass="bg-slate-50 dark:bg-slate-800"
                            borderClass="border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl ${selectedSpeedConfig.color}`}>
                                    {selectedSpeedConfig.label.split(' ').pop()}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[8px] md:text-[10px] font-bold text-slate-400">سرعة اللعبة</span>
                                    <span className="font-black text-xs md:text-base text-slate-800 dark:text-white">
                                        {selectedSpeedConfig.label.replace(/ .*/, '') + ' ' + selectedSpeedConfig.label.split(' ')[1]}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-slate-400 transition-transform duration-300 ${speedOpen ? 'rotate-180' : ''}`} />
                        </TactileButton>

                        {/* Speed Dropdown */}
                        {speedOpen && (
                            <div className="mt-1 md:mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl border-2 md:border-[3px] border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden animate-slide-down">
                                <div className="p-1 md:p-2 grid gap-1 md:gap-2">
                                    {Object.values(SPEED_MODES).map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => { setSpeedMode(s.id); setSpeedOpen(false); triggerHaptic(); }}
                                            className={`w-full p-2 md:p-3 rounded-lg md:rounded-xl flex items-start gap-2 md:gap-3 transition-all border
                        ${currentSpeedMode === s.id
                                                    ? 'bg-white dark:bg-slate-700 border-yellow-400 shadow-md ring-2 ring-yellow-400/20'
                                                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}
                      `}
                                        >
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg md:text-xl shrink-0 mt-0.5 ${s.color.split(' ')[0]} bg-opacity-20`}>
                                                {s.label.split(' ').pop()}
                                            </div>
                                            <div className="text-right flex-1 pt-0.5">
                                                <div className={`font-black text-sm md:text-base mb-0.5 ${currentSpeedMode === s.id ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {s.label.replace(/ .*/, '') + ' ' + (s.label.split(' ')[1] || '')}
                                                </div>
                                                <div className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight">
                                                    {s.desc}
                                                </div>
                                            </div>
                                            {currentSpeedMode === s.id && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings Row: Sound + Dark Mode + Exit */}
                    <div className="flex gap-2 shrink-0">
                        {/* Sound Toggle */}
                        <TactileButton
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex-1 p-2 md:p-3 rounded-xl md:rounded-2xl gap-1"
                            colorClass={!isMuted ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}
                            borderClass={!isMuted ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'}
                        >
                            {!isMuted ? <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />}
                        </TactileButton>

                        {/* Dark Mode Toggle */}
                        <TactileButton
                            onClick={() => setIsDark(!isDark)}
                            className="flex-1 p-2 md:p-3 rounded-xl md:rounded-2xl gap-1"
                            colorClass={isDark ? 'bg-slate-700' : 'bg-orange-50'}
                            borderClass={isDark ? 'border-slate-600' : 'border-orange-200'}
                        >
                            {isDark ? <Moon className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" /> : <Sun className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />}
                        </TactileButton>

                        {/* Exit Button */}
                        <TactileButton
                            onClick={onExit}
                            className="flex-1 p-2 md:p-3 rounded-xl md:rounded-2xl gap-1"
                            colorClass="bg-rose-50 dark:bg-rose-900/20"
                            borderClass="border-rose-200 dark:border-rose-800"
                        >
                            <LogOut className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                        </TactileButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PauseMenuModal;
