import React from 'react';
import { Flame, Target, Star } from 'lucide-react';

const StatsHUD = ({
    isDarkMode,
    compact = false,
    onFlameClick,
    onQuestionsClick,
    days = 0,
    questions = 0,
    xp = 0,
    subject = null // 'english' | 'biology' | null (null = combined)
}) => {

    // Question totals by subject
    const QUESTION_TOTALS = {
        english: 348,
        biology: 334,
        combined: 682
    };

    // Determine total based on subject
    const totalQuestions = subject
        ? (QUESTION_TOTALS[subject] || QUESTION_TOTALS.combined)
        : QUESTION_TOTALS.combined;

    if (compact) {
        return (
            <div className={`w-full mb-6 p-3 px-5 rounded-2xl border-2 flex items-center justify-between shadow-sm animate-fade-in-up ${isDarkMode ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-[#E2E8F0]'}`}>
                <div onClick={onFlameClick} className="flex items-center gap-3 cursor-pointer active:scale-90 transition-transform"><Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" /><span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{days}</span></div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <div onClick={onQuestionsClick} className="flex items-center gap-3 cursor-pointer active:scale-90 transition-transform"><Target className="w-6 h-6 text-blue-400" /><span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{questions}</span></div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex items-center gap-3"><Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /><span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{xp}</span></div>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-lg mx-auto mb-6 p-3 rounded-2xl border-2 border-b-4 flex items-center justify-between relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}>
            <div onClick={(e) => { e.stopPropagation(); onFlameClick?.(); }} className="flex-1 flex flex-col items-center justify-center relative group cursor-pointer active:scale-95 transition-transform">
                <div className="flex items-center gap-1 mb-0.5"><div className="p-1.5 rounded-lg bg-orange-100"><Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" /></div><span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{days}</span></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">أيام</span>
            </div>
            <div className="w-0.5 h-8 bg-slate-100 dark:bg-slate-700/50 rounded-full"></div>
            <div onClick={(e) => { e.stopPropagation(); onQuestionsClick?.(); }} className="flex-[1.5] flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
                <div className="flex items-baseline gap-1 mb-0.5"><span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{questions}</span><span className="text-xs font-bold text-slate-400">/{totalQuestions}</span><Target className="w-3.5 h-3.5 ml-1 text-blue-400" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">سؤال</span>
            </div>
            <div className="w-0.5 h-8 bg-slate-100 dark:bg-slate-700/50 rounded-full"></div>
            <div className="flex-1 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform">
                <div className="flex items-center gap-1 mb-0.5"><span className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{xp}</span><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP</span>
            </div>
        </div>
    );
};

export default StatsHUD;
