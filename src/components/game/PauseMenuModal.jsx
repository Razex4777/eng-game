import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Moon, Sun, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { updateSpeedMode, updateMuteSetting, updateDarkModeSetting, SPEED_MODES } from '../../services/gameSettingsService';

// Tactile Button Component (Local)
const TactileButton = ({ children, onClick, className, colorClass, borderClass, shadowColor = "", disabled, activeScale = true }) => {
    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }
    };

    return (
        <button
            disabled={disabled}
            onClick={(e) => { triggerHaptic(); if (onClick) onClick(e); }}
            className={`
                relative group transition-all duration-150 ease-out
                border-2 border-b-[6px] 
                ${activeScale ? 'active:border-b-2 active:translate-y-[4px] active:scale-[0.98]' : ''}
                rounded-[20px] flex items-center justify-center
                ${disabled ? 'opacity-80 pointer-events-none' : ''}
                ${className}
                ${colorClass}
                ${borderClass}
                ${shadowColor}
                shadow-sm
            `}
        >
            {children}
        </button>
    );
};

const PauseMenuModal = ({
    isOpen,
    onClose,
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
    const [saving, setSaving] = useState(false);

    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }
    };

    // Handle speed mode change with Supabase sync
    const handleSpeedChange = async (speedId) => {
        triggerHaptic();
        setSpeedMode(speedId);
        setSpeedOpen(false);

        // Save to Supabase in background
        setSaving(true);
        try {
            await updateSpeedMode(speedId);
        } catch (err) {
            console.error('Failed to save speed setting:', err);
        } finally {
            setSaving(false);
        }
    };

    // Handle mute toggle with Supabase sync
    const handleMuteToggle = async () => {
        const newValue = !isMuted;
        setIsMuted(newValue);

        try {
            await updateMuteSetting(newValue);
        } catch (err) {
            console.error('Failed to save mute setting:', err);
        }
    };

    // Handle dark mode toggle with Supabase sync
    const handleDarkModeToggle = async () => {
        const newValue = !isDark;
        setIsDark(newValue);

        try {
            await updateDarkModeSetting(newValue);
        } catch (err) {
            console.error('Failed to save dark mode setting:', err);
        }
    };

    const selectedSpeedConfig = SPEED_MODES[currentSpeedMode] || SPEED_MODES['teen'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-5 font-['Cairo']">
            {/* Dark Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onResume}></div>

            {/* Modal Body */}
            <div className="relative w-full max-w-sm bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border-4 border-slate-200 dark:border-slate-700 shadow-2xl animate-pop-in max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="text-center mb-6 shrink-0 pt-2">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">استراحة محارب 🛑</h2>
                    <p className="text-sm font-bold text-slate-400">خذ نفس وكمل الطريق</p>
                </div>

                <div className="flex-1 min-h-0 space-y-3 overflow-y-auto px-1 pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,116,139,0.3) transparent' }}>
                    {/* 1. Resume Button */}
                    <TactileButton
                        onClick={onResume}
                        className="w-full py-4 rounded-2xl gap-3 text-lg shrink-0"
                        colorClass="bg-yellow-400"
                        borderClass="border-yellow-600"
                    >
                        <Play className="w-6 h-6 fill-current text-yellow-900" />
                        <span className="font-black text-yellow-900">استئناف اللعب</span>
                    </TactileButton>

                    {/* 2. Speed Control */}
                    <div className="relative shrink-0">
                        <TactileButton
                            onClick={() => setSpeedOpen(!speedOpen)}
                            className="w-full p-4 rounded-2xl justify-between"
                            colorClass="bg-slate-50 dark:bg-slate-800"
                            borderClass="border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selectedSpeedConfig.color}`}>
                                    {selectedSpeedConfig.emoji}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        سرعة اللعبة
                                        {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                                    </span>
                                    <span className="font-black text-slate-800 dark:text-white">{selectedSpeedConfig.shortLabel}</span>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${speedOpen ? 'rotate-180' : ''}`} />
                        </TactileButton>

                        {/* Speed Dropdown */}
                        {speedOpen && (
                            <div className="mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden animate-dropdown-in">
                                <div className="p-2 grid gap-2">
                                    {Object.values(SPEED_MODES).map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSpeedChange(s.id)}
                                            className={`w-full p-3 rounded-xl flex items-start gap-3 transition-all border
                                                ${currentSpeedMode === s.id
                                                    ? 'bg-white dark:bg-slate-700 border-yellow-400 shadow-md ring-2 ring-yellow-400/20'
                                                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}
                                            `}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 mt-1 ${s.color.split(' ')[0]} bg-opacity-20`}>
                                                {s.emoji}
                                            </div>
                                            <div className="text-right flex-1 pt-0.5">
                                                <div className={`font-black text-base mb-0.5 ${currentSpeedMode === s.id ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {s.shortLabel}
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight">
                                                    {s.desc}
                                                </div>
                                            </div>
                                            {currentSpeedMode === s.id && <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Bottom Controls Row */}
                    <div className="flex gap-2 shrink-0">
                        {/* Sound Button */}
                        <TactileButton
                            onClick={handleMuteToggle}
                            className="flex-1 p-3 rounded-2xl gap-1"
                            colorClass={!isMuted ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}
                            borderClass={!isMuted ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'}
                        >
                            {!isMuted ? <Volume2 className="w-5 h-5 text-indigo-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                        </TactileButton>

                        {/* Dark Mode Button */}
                        <TactileButton
                            onClick={handleDarkModeToggle}
                            className="flex-1 p-3 rounded-2xl gap-1"
                            colorClass={isDark ? 'bg-slate-700' : 'bg-orange-50'}
                            borderClass={isDark ? 'border-slate-600' : 'border-orange-200'}
                        >
                            {isDark ? <Moon className="w-5 h-5 text-yellow-300" /> : <Sun className="w-5 h-5 text-orange-500" />}
                        </TactileButton>

                        {/* Exit Button */}
                        <TactileButton
                            onClick={onExit}
                            className="flex-1 p-3 rounded-2xl gap-1"
                            colorClass="bg-rose-50 dark:bg-rose-900/20"
                            borderClass="border-rose-200 dark:border-rose-800"
                        >
                            <LogOut className="w-5 h-5 text-rose-500" />
                        </TactileButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PauseMenuModal;
