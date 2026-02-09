import React from 'react';
import { Swords, Play, Lock } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';

// بطاقة الوحش
const MonsterCard = ({ isDarkMode, onClick, isGuest, playerName }) => (
    <TactileButton
        onClick={onClick}
        disabled={false}
        className={`w-full mb-6 overflow-hidden p-0 group ${isGuest ? 'opacity-80 grayscale-[0.8]' : ''}`}
        colorClass={isDarkMode ? 'bg-[#7C3AED]' : 'bg-[#8B5CF6]'}
        borderClass={isDarkMode ? 'border-[#5B21B6]' : 'border-[#7C3AED]'}
        shadowColor={isGuest ? '' : "shadow-purple-200 dark:shadow-none"}
    >
        <div className="absolute inset-0 bg-white/5"></div>
        {!isGuest && <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>}

        <div className="relative z-10 w-full p-6 flex items-center justify-between">
            <div className="flex flex-col items-start text-right w-full">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-xl border border-white/20 mb-2 shadow-sm">
                    <Swords className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-black text-white tracking-wide">ENDLESS</span>
                </div>
                <h2 className="text-3xl font-black text-white drop-shadow-sm mb-1">تحدي الوحش</h2>
                <p className="text-purple-100 text-xs font-bold mb-4 opacity-90">{isGuest ? 'سجل لفتح التحدي' : 'اكسر حاجز الملل!'}</p>
                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/10 mb-2 w-fit">
                    <div className="flex flex-col items-start px-1">
                        <span className="text-[9px] text-purple-100 font-bold uppercase opacity-80">أعلى سكور</span>
                        <span className="text-xl font-black text-white font-mono leading-none">{isGuest ? '0' : '12,500'}</span>
                    </div>
                    <div className="w-px h-8 bg-white/20 mx-2"></div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform ${isGuest ? 'bg-slate-400 text-slate-200' : 'bg-white text-purple-600 group-hover:scale-110'}`}>
                        {isGuest ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </div>
                </div>
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 transform group-hover:rotate-12 transition-transform duration-500">
                <Swords className="w-32 h-32 text-white" />
            </div>
            {isGuest && <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
        </div>
    </TactileButton>
);

export default MonsterCard;
