import React from 'react';
import { Play, Sparkles, Trophy, Brain, Flame, Heart, LogOut, Star, Target, Zap, Award } from 'lucide-react';
import TactileButton from './TactileButton';
import { GAME_RULES } from '../data/gameData';
import { useAuth } from '../context/AuthContext';

const MenuScreen = ({ isDark, onStartGame }) => {
    const { profile, signOut } = useAuth();
    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-slate-400' : 'text-slate-600';
    const cardBg = isDark ? 'bg-slate-900/60' : 'bg-white/60';

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-y-auto bg-[#0A0A1A]/20">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className={`w-full max-w-[340px] md:max-w-sm p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] glass-panel shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] relative flex flex-col items-center animate-card-spawn z-10`}>

                {/* Profile Section - NEW */}
                {profile && (
                    <div className="w-full mb-4 md:mb-6">
                        {/* Profile Card */}
                        <div className={`relative flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border ${isDark ? 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-white/10' : 'bg-gradient-to-r from-white/80 to-slate-50/80 border-black/5'}`}>
                            {/* Avatar with Gradient Ring */}
                            <div className="relative shrink-0">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-sm opacity-70" />
                                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-white/20">
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                                            {profile.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                {/* Online Indicator */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                    <Zap className="w-2 h-2 text-white" />
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0" dir="rtl">
                                <div className={`font-black text-sm md:text-base ${textColor} truncate`}>
                                    {profile.full_name || 'لاعب'}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="flex items-center gap-1 bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-md">
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                        <span className="text-[9px] md:text-[10px] font-black">{profile.total_xp?.toLocaleString() || 0} XP</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md">
                                        <Award className="w-2.5 h-2.5" />
                                        <span className="text-[9px] md:text-[10px] font-black">Lv.{profile.current_level || 1}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={signOut}
                                className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-700/50 hover:bg-rose-500/20' : 'bg-slate-200/50 hover:bg-rose-100'}`}
                            >
                                <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 hover:text-rose-500" />
                            </button>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 mt-2 md:mt-3">
                            {[
                                { label: 'الدقة', value: `${Math.round(profile.accuracy || 0)}%`, icon: <Target className="w-3 h-3" />, color: 'text-emerald-500' },
                                { label: 'النجوم', value: profile.total_stars || 0, icon: <Star className="w-3 h-3" />, color: 'text-amber-500' },
                                { label: 'المراحل', value: profile.completed_stages || 0, icon: <Trophy className="w-3 h-3" />, color: 'text-purple-500' },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className={`flex flex-col items-center p-2 rounded-lg border ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-white/40 border-black/5'}`}
                                >
                                    <div className={`${stat.color} mb-0.5`}>{stat.icon}</div>
                                    <div className={`font-black text-sm ${textColor}`}>{stat.value}</div>
                                    <div className={`text-[8px] font-bold ${subTextColor} uppercase tracking-wide`}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lottie Animation Header */}
                <div className="w-20 h-20 md:w-32 md:h-32 mb-2 relative drop-shadow-2xl">
                    <dotlottie-player
                        src="https://assets-v2.lottiefiles.com/a/f681a37c-1166-11ee-9636-db9c192d121a/5g9elzlwXu.lottie"
                        background="transparent"
                        speed="1"
                        style={{ width: '100%', height: '100%' }}
                        loop
                        autoplay
                    ></dotlottie-player>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 md:w-8 md:h-8 bg-yellow-400 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border-2 md:border-3 border-white rotate-12 z-20">
                        <Trophy className="w-2.5 h-2.5 md:w-4 md:h-4 text-yellow-900" />
                    </div>
                </div>

                {/* Title & Slogan */}
                <div className="text-center mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter mb-0.5 md:mb-1 italic">
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            KHTMTHA
                        </span>
                    </h1>
                    <p className={`text-[9px] md:text-sm font-bold tracking-wide flex items-center justify-center gap-1 md:gap-2 ${subTextColor}`}>
                        <Brain className="w-3 h-3 md:w-4 md:h-4 text-indigo-400" /> English Master Challenge
                    </p>
                </div>

                {/* Compact Rule Cards */}
                <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full mb-4 md:mb-6">
                    {GAME_RULES.map((rule, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 p-2 md:p-3 rounded-lg md:rounded-xl border transition-all ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-white/40 border-black/5'}`}
                        >
                            <div className="text-base md:text-xl filter drop-shadow-sm shrink-0">{rule.icon}</div>
                            <div className="flex-1 min-w-0" dir="rtl">
                                <div className={`font-black text-[8px] md:text-xs ${textColor} leading-tight truncate`}>{rule.title}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Start Button - The Hero Component */}
                <TactileButton
                    onClick={onStartGame}
                    className="w-full h-12 md:h-16 rounded-xl md:rounded-2xl gap-2 md:gap-3 shrink-0"
                    colorClass="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"
                    borderClass="border-emerald-700"
                >
                    <span className="text-base md:text-xl font-black italic text-white">ابدأ التحدي</span>
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
                        <Play className="w-3 h-3 md:w-4 md:h-4 text-white fill-current ml-0.5" />
                    </div>
                </TactileButton>

                {/* Additional Label */}
                <div className="mt-3 md:mt-4 flex items-center gap-3 md:gap-4 opacity-40">
                    <div className="flex items-center gap-1 text-[7px] md:text-[9px] font-black tracking-widest uppercase">
                        <Flame className="w-2 h-2 md:w-2.5 md:h-2.5 text-orange-500" /> Extreme
                    </div>
                    <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-slate-500 rounded-full"></div>
                    <div className="flex items-center gap-1 text-[7px] md:text-[9px] font-black tracking-widest uppercase">
                        <Heart className="w-2 h-2 md:w-2.5 md:h-2.5 text-rose-500" /> 10 Lives
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuScreen;
