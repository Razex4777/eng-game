import React from 'react';
import { Play, LogOut, Star, Award, Target, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MenuScreen = ({ isDark, onStartGame }) => {
    const { profile, signOut } = useAuth();
    const textColor = isDark ? 'text-white' : 'text-slate-800';
    const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';
    const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-sm p-6 rounded-[2rem] shadow-2xl border-4 ${cardBg} relative overflow-hidden flex flex-col`}>

                {/* الخلفية المتحركة */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute w-32 h-32 bg-yellow-400 rounded-full blur-3xl -top-10 -right-10 animate-pulse" />
                    <div className="absolute w-32 h-32 bg-blue-400 rounded-full blur-3xl -bottom-10 -left-10 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                    {/* الشعار والعنوان */}
                    <div className="text-center mb-6">
                        <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg animate-bounce">
                            <span className="text-4xl">🎮</span>
                        </div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-1">
                            KHTMTHA
                        </h1>
                        <p className={`text-sm font-bold ${subTextColor}`}>
                            أجب قبل ما يوصل السؤال!
                        </p>
                    </div>

                    {/* Profile Section */}
                    {profile && (
                        <div className="w-full mb-4">
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                                                {profile.full_name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0" dir="rtl">
                                    <div className={`font-black text-sm ${textColor} truncate`}>
                                        {profile.full_name || 'لاعب'}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <div className="flex items-center gap-1 bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">
                                            <Star className="w-2.5 h-2.5 fill-current" />
                                            <span className="text-[10px] font-black">{profile.total_xp?.toLocaleString() || 0} XP</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
                                            <Award className="w-2.5 h-2.5" />
                                            <span className="text-[10px] font-black">Lv.{profile.current_level || 1}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={signOut}
                                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${isDark ? 'bg-slate-600 hover:bg-rose-500/20' : 'bg-slate-200 hover:bg-rose-100'}`}
                                >
                                    <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {[
                                    { label: 'الدقة', value: `${Math.round(profile.accuracy || 0)}%`, icon: <Target className="w-3 h-3" />, color: 'text-emerald-500' },
                                    { label: 'النجوم', value: profile.total_stars || 0, icon: <Star className="w-3 h-3" />, color: 'text-amber-500' },
                                    { label: 'المراحل', value: profile.completed_stages || 0, icon: <Trophy className="w-3 h-3" />, color: 'text-purple-500' },
                                ].map((stat, i) => (
                                    <div key={i} className={`flex flex-col items-center p-2 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white/50 border-slate-200'}`}>
                                        <div className={`${stat.color} mb-0.5`}>{stat.icon}</div>
                                        <div className={`font-black text-sm ${textColor}`}>{stat.value}</div>
                                        <div className={`text-[8px] font-bold ${subTextColor}`}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* قائمة الشرح والقواعد */}
                    <div className="space-y-2 mb-6 text-sm">
                        {[
                            { icon: '⚡', title: 'COMBO', desc: 'جاوب بالنصف العلوي!', color: 'from-amber-500/20 to-orange-500/20' },
                            { icon: '❄️', title: 'تجميد', desc: '5 ثواني توقف (2x)', color: 'from-cyan-100 to-cyan-50 border-cyan-200 text-cyan-600' },
                            { icon: '💣', title: 'قنبلة', desc: 'احذف جوابين (1x)', color: 'from-red-100 to-rose-100 border-red-200 text-red-600' },
                            { icon: '⭐', title: 'XP', desc: 'عادي = 10 نقاط', color: 'from-yellow-100 to-amber-100 border-yellow-200 text-amber-600' },
                            { icon: '💔', title: '10 أرواح', desc: 'المرحلة لا نهائية!', color: 'from-blue-50 to-slate-50 border-blue-100 text-blue-500' },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r ${item.color}`}>
                                <span className="text-xl w-8 text-center">{item.icon}</span>
                                <div className="flex-1 text-right" dir="rtl">
                                    <span className="font-black ml-2">{item.title}</span>
                                    <span className="opacity-80">{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* زر ابدأ اللعب */}
                    <button
                        onClick={onStartGame}
                        className="w-full py-4 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-xl border-b-[6px] border-emerald-600 active:border-b-0 active:translate-y-[6px] transition-all duration-75 relative overflow-hidden group mt-auto"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Play className="w-6 h-6 fill-white" /> ابدأ اللعب!
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-active:translate-y-0 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuScreen;
