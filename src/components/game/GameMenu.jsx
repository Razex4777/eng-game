import React from 'react';
import { Play, Zap, Star, Heart, Bomb } from 'lucide-react';
import TactileButton from '../ui/TactileButton';

/**
 * GameMenu Component
 * Starting menu for the game with rules and start button
 * Features: Game instructions, power-up explanations, animated start button
 */
const GameMenu = ({
    onStartGame,
    gameMode = 'finite', // 'finite' or 'infinite'
    isDark = false
}) => {
    const cardBg = isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-white';
    const textColor = isDark ? 'text-white' : 'text-slate-800';

    // Game rules based on mode
    const rules = gameMode === 'infinite'
        ? [
            { icon: '❄️', title: 'تجميد', desc: 'وقف السؤال 5 ثواني (2x)', color: 'from-cyan-100 to-blue-100 border-cyan-200 text-cyan-700' },
            { icon: '💣', title: 'قنبلة', desc: 'احذف جوابين (1x)', color: 'from-red-100 to-rose-100 border-red-200 text-red-700' },
            { icon: '⭐', title: 'XP', desc: 'عادي = 10 نقاط', color: 'from-yellow-100 to-amber-100 border-yellow-200 text-amber-700' },
            { icon: '❤️', title: '10 أرواح', desc: 'وضع لا نهائي!', color: 'from-purple-50 to-violet-50 border-purple-200 text-purple-600' },
        ]
        : [
            { icon: '❄️', title: 'تجميد', desc: 'وقف السؤال 5 ثواني (2x)', color: 'from-cyan-100 to-blue-100 border-cyan-200 text-cyan-700' },
            { icon: '💣', title: 'قنبلة', desc: 'احذف جوابين (1x)', color: 'from-red-100 to-rose-100 border-red-200 text-red-700' },
            { icon: '⭐', title: 'XP', desc: 'عادي = 10 نقاط', color: 'from-yellow-100 to-amber-100 border-yellow-200 text-amber-700' },
            { icon: '💔', title: '3 أرواح', desc: 'الخطأ يرجع السؤال!', color: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-600' },
        ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-[2rem] shadow-2xl border-2 overflow-hidden ${cardBg}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10">
                        <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-3 rotate-3 border-4 border-white/30">
                            <Zap className="w-10 h-10 text-yellow-300 fill-yellow-300" />
                        </div>
                        <h1
                            className="text-3xl font-black text-white drop-shadow-lg"
                            style={{ fontFamily: "'Cairo', sans-serif" }}
                        >
                            {gameMode === 'infinite' ? 'تحدي الوحش' : 'تحدي المعرفة'}
                        </h1>
                        <p className="text-indigo-100 text-sm font-bold mt-1">
                            {gameMode === 'infinite' ? 'هل تقدر تستمر للأبد؟' : 'جاوب بسرعة قبل ما يوصل!'}
                        </p>
                    </div>
                </div>

                {/* Rules Section */}
                <div className="p-5 space-y-3">
                    <h2
                        className={`text-lg font-black text-center mb-4 ${textColor}`}
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                        قواعد اللعب 📋
                    </h2>

                    {rules.map((item, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r ${item.color} border`}
                        >
                            <span className="text-xl w-8 text-center">{item.icon}</span>
                            <div className="flex-1 text-right" dir="rtl">
                                <span className="font-black ml-2">{item.title}</span>
                                <span className="opacity-80">{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Start Button */}
                <div className="p-5 pt-0">
                    <TactileButton
                        onClick={onStartGame}
                        variant="success"
                        size="lg"
                        className="w-full group"
                    >
                        <span
                            className="relative z-10 flex items-center justify-center gap-2"
                            style={{ fontFamily: 'Tajawal' }}
                        >
                            <Play className="w-6 h-6 fill-white" />
                            ابدأ اللعب!
                        </span>
                    </TactileButton>
                </div>
            </div>
        </div>
    );
};

export default GameMenu;
