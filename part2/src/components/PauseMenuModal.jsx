import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import { triggerHaptic } from '../utils/haptic';

// زر بتصميم ملموس (Tactile)
const TactileButton = ({ children, onClick, className, colorClass, borderClass, disabled, activeScale = true }) => {
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
        shadow-sm
      `}
        >
            {children}
        </button>
    );
};

const PauseMenuModal = ({ isOpen, onClose, onResume, onExit, currentSpeedMode, setSpeedMode, isMuted, setIsMuted, isDark, setIsDark }) => {
    const [speedOpen, setSpeedOpen] = useState(false);

    // إعدادات السرعة
    const speeds = {
        'baby': {
            id: 'baby',
            val: 0.3,
            label: 'وضع الرضيع 👶',
            desc: 'رحلة الألف ميل تبدأ بخطوة',
            color: 'bg-blue-100 text-blue-600',
            border: 'border-blue-200'
        },
        'teen': {
            id: 'teen',
            val: 0.5,
            label: 'فتى (متوسط) 👱',
            desc: 'للناس اللي قطعت شوط (هرولة)',
            color: 'bg-orange-100 text-orange-600',
            border: 'border-orange-200'
        },
        'beast': {
            id: 'beast',
            val: 0.8,
            label: 'وضع الوحش 👹',
            desc: 'للأبطال اللي يمشون ميل ميل!',
            color: 'bg-red-100 text-red-600',
            border: 'border-red-200'
        }
    };

    const selectedSpeedConfig = speeds[currentSpeedMode] || speeds['teen'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-5 font-['Cairo']">
            {/* خلفية معتمة */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onResume}></div>

            {/* جسم القائمة */}
            <div className="relative w-full max-w-sm bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border-4 border-slate-200 dark:border-slate-700 shadow-2xl animate-pop-in overflow-hidden max-h-[90vh] flex flex-col">

                {/* عنوان القائمة */}
                <div className="text-center mb-6 shrink-0 pt-2">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">استراحة محارب 🛑</h2>
                    <p className="text-sm font-bold text-slate-400">خذ نفس وكمل الطريق</p>
                </div>

                <div className="space-y-3 overflow-y-auto hide-scrollbar px-1 pb-2">
                    {/* 1. زر الاستئناف */}
                    <TactileButton
                        onClick={onResume}
                        className="w-full py-4 rounded-2xl gap-3 text-lg shrink-0"
                        colorClass="bg-yellow-400"
                        borderClass="border-yellow-600"
                    >
                        <Play className="w-6 h-6 fill-current text-yellow-900" />
                        <span className="font-black text-yellow-900">استئناف اللعب</span>
                    </TactileButton>

                    {/* 2. زر التحكم بالسرعة */}
                    <div className="relative shrink-0">
                        <TactileButton
                            onClick={() => setSpeedOpen(!speedOpen)}
                            className="w-full p-4 rounded-2xl justify-between"
                            colorClass="bg-slate-50 dark:bg-slate-800"
                            borderClass="border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selectedSpeedConfig.color}`}>
                                    {selectedSpeedConfig.label.split(' ').pop()}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold text-slate-400">سرعة اللعبة</span>
                                    <span className="font-black text-slate-800 dark:text-white">{selectedSpeedConfig.label.replace(/ .*/, '') + ' ' + selectedSpeedConfig.label.split(' ')[1]}</span>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${speedOpen ? 'rotate-180' : ''}`} />
                        </TactileButton>

                        {/* القائمة المنسدلة */}
                        {speedOpen && (
                            <div className="mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden animate-slide-down">
                                <div className="p-2 grid gap-2">
                                    {Object.values(speeds).map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => { setSpeedMode(s.id); setSpeedOpen(false); triggerHaptic(); }}
                                            className={`w-full p-3 rounded-xl flex items-start gap-3 transition-all border
                        ${currentSpeedMode === s.id
                                                    ? 'bg-white dark:bg-slate-700 border-yellow-400 shadow-md ring-2 ring-yellow-400/20'
                                                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}
                      `}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 mt-1 ${s.color.split(' ')[0]} bg-opacity-20`}>
                                                {s.label.split(' ').pop()}
                                            </div>
                                            <div className="text-right flex-1 pt-0.5">
                                                <div className={`font-black text-base mb-0.5 ${currentSpeedMode === s.id ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {s.label.replace(/ .*/, '') + ' ' + (s.label.split(' ')[1] || '')}
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

                    {/* 3. صف الأزرار (صوت + وضع ليلي + خروج) */}
                    <div className="flex gap-2 shrink-0">
                        {/* زر الصوت */}
                        <TactileButton
                            onClick={() => setIsMuted(!isMuted)}
                            className="flex-1 p-3 rounded-2xl gap-1"
                            colorClass={!isMuted ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}
                            borderClass={!isMuted ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'}
                        >
                            {!isMuted ? <Volume2 className="w-5 h-5 text-indigo-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                        </TactileButton>

                        {/* زر الوضع الليلي */}
                        <TactileButton
                            onClick={() => setIsDark(!isDark)}
                            className="flex-1 p-3 rounded-2xl gap-1"
                            colorClass={isDark ? 'bg-slate-700' : 'bg-orange-50'}
                            borderClass={isDark ? 'border-slate-600' : 'border-orange-200'}
                        >
                            {isDark ? <Moon className="w-5 h-5 text-yellow-300" /> : <Sun className="w-5 h-5 text-orange-500" />}
                        </TactileButton>

                        {/* زر الخروج */}
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

            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.1) rotate(5deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 300px; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
};

export default PauseMenuModal;
