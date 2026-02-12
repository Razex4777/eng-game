import React, { useState, useEffect } from 'react';
import {
    GraduationCap,
    Flame,
    X,
    Star,
    Lock,
    Infinity as InfinityIcon,
    Play,
    Loader2
} from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import { handleShareChallenge } from '../utils/sharing';
import { supabase } from '../lib/supabase';
import { getUserProgress } from '../services/monsterChallengeService';

/**
 * Battle Arena Modal - Challenge Selection Screen
 * Simplified version matching code.txt patterns
 */
const BattleArenaModal = ({
    isDarkMode,
    onClose,
    playerName,
    onStartGame,
    showToast,
    user,
    preferredSubject = 'english'
}) => {
    const [loading, setLoading] = useState(true);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [showVsTutorial, setShowVsTutorial] = useState(true);
    const [chapterScores, setChapterScores] = useState({});
    const [chapters, setChapters] = useState([]);
    const [currentPart, setCurrentPart] = useState(1);

    // Simple theme classes
    const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const primaryColor = 'bg-[#3B82F6]';

    // Fetch data from Supabase
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const tableName = `${preferredSubject}_chapters`;

                // Get distinct parts from question bank
                const { data: partData, error: partError } = await supabase
                    .from(tableName)
                    .select('part')
                    .order('part', { ascending: true });

                if (partError) throw partError;

                const uniqueParts = [...new Set(partData.map(r => r.part))];
                setChapters(uniqueParts);

                // Get user's current progress
                if (user?.auth_id || user?.id) {
                    const authId = user.auth_id || user.id;
                    const { progress } = await getUserProgress(authId);

                    if (progress?.[preferredSubject]?.chapters) {
                        setCurrentPart(progress[preferredSubject].chapters);
                    }
                }

                // Get per-chapter high scores
                if (user?.id) {
                    const { data: sessions, error: sessError } = await supabase
                        .from('game_sessions')
                        .select('part_number, score')
                        .eq('user_id', user.id)
                        .eq('subject', preferredSubject)
                        .eq('question_type', 'chapters')
                        .order('score', { ascending: false });

                    if (!sessError && sessions) {
                        const highScores = {};
                        sessions.forEach(s => {
                            if (!highScores[s.part_number] || s.score > highScores[s.part_number]) {
                                highScores[s.part_number] = s.score;
                            }
                        });
                        setChapterScores(highScores);
                    }
                }
            } catch (error) {
                console.error('Error loading battle arena data:', error);
                setChapters(Array.from({ length: 8 }, (_, i) => i + 1));
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, preferredSubject]);

    const onShare = (chapterName, score) => {
        const text = `🎮 تحدي الأبطال!\n\nالمحارب (${playerName}) حقق ${score} XP في ${chapterName}..\nويتحداك تكسر هذا الرقم! 💪🔥`;
        handleShareChallenge('تحدي ختمتها!', text);
    };

    const handleStartChallenge = (partNum) => {
        if (partNum > currentPart) {
            showToast?.('أكمل المستوى الحالي أولاً! 🔒', 'warning');
            return;
        }
        onStartGame({
            mode: 'monster',
            subject: preferredSubject,
            type: 'chapters',
            part: partNum
        });
    };

    const handleStartComprehensive = () => {
        onStartGame({
            mode: 'monster',
            subject: preferredSubject,
            type: 'fullyear',
            part: 1
        });
    };

    let firstScoreFound = false;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Cairo'] backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-200/50'}`}>
            <div className={`relative w-full max-w-sm md:max-w-md p-6 pb-8 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-300 animate-pop-in ${bgCard} ${isDarkMode ? 'shadow-black/50 border border-slate-700' : 'shadow-xl border border-slate-100'}`}>
                {/* Handle */}
                <div className={`w-8 h-1 rounded-full mx-auto mb-6 opacity-20 ${isDarkMode ? 'bg-white' : 'bg-slate-900'}`} />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h3 className={`text-3xl font-black ${textPrimary} tracking-tight leading-none flex items-center gap-2`}>
                            <GraduationCap className="w-8 h-8 text-[#F59E0B]" />
                            ساحة التحدي
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-xs font-bold ${textSecondary}`}>اختر التحدي الدراسي</span>
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                        <X className={`w-5 h-5 ${textPrimary}`} />
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className={`w-8 h-8 animate-spin ${textSecondary}`} />
                    </div>
                ) : (
                    <>
                        {/* Chapter Grid */}
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {chapters.map((num) => {
                                const score = chapterScores[num] || 0;
                                const hasScore = score > 0;
                                const isSelected = selectedChapter === num;
                                const isLocked = num > currentPart;

                                let isTargetForTutorial = false;
                                if (hasScore && !firstScoreFound) {
                                    firstScoreFound = true;
                                    isTargetForTutorial = true;
                                }

                                return (
                                    <div key={num} className="relative group h-28">
                                        <TactileButton
                                            onClick={() => {
                                                if (isLocked) {
                                                    showToast?.('أكمل المستوى الحالي أولاً! 🔒', 'warning');
                                                    return;
                                                }
                                                setSelectedChapter(num);
                                                handleStartChallenge(num);
                                            }}
                                            className={`w-full h-full flex-col !gap-0 !rounded-[20px] border-none transition-all ${isSelected
                                                ? `${primaryColor} text-white shadow-lg shadow-blue-500/30 translate-y-[-4px]`
                                                : hasScore
                                                    ? (isDarkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-slate-100 hover:bg-slate-200')
                                                    : (isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-50')
                                                } ${isLocked ? 'opacity-40' : ''}`}
                                        >
                                            <div className="flex-1 flex flex-col items-center justify-center w-full">
                                                <span className={`text-[10px] font-bold mb-0.5 ${!isSelected && !hasScore ? 'opacity-30' : 'opacity-80'}`}>الفصل</span>
                                                <span className={`text-3xl font-black leading-none mb-1 ${!isSelected && !hasScore && 'opacity-30'}`}>{num}</span>
                                                <div className="mt-2 h-5 flex items-center justify-center">
                                                    {hasScore ? (
                                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                                                            <Star className={`w-2.5 h-2.5 ${isSelected ? 'text-yellow-300 fill-current' : 'text-yellow-500 fill-current'}`} />
                                                            <span className={`text-[9px] font-black ${isSelected ? 'text-white' : (isDarkMode ? 'text-slate-300' : 'text-slate-600')}`}>
                                                                {score > 999 ? (score / 1000).toFixed(1) + 'k' : score}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Lock className={`w-3 h-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                                                    )}
                                                </div>
                                            </div>
                                        </TactileButton>

                                        {/* VS Share Button */}
                                        {hasScore && (
                                            <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 z-30">
                                                {isTargetForTutorial && showVsTutorial && (
                                                    <div className="absolute bottom-7 left-1/2 transform -translate-x-1/2 w-max z-50 pointer-events-none animate-bounce">
                                                        <div className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-lg border-2 border-yellow-100 mb-1 text-center shadow-md">
                                                            تحدى صديقك! 🔥
                                                        </div>
                                                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400 mx-auto" />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowVsTutorial(false);
                                                        onShare(`الفصل ${num}`, score);
                                                    }}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-[3px] ${isDarkMode ? 'border-[#1E293B] bg-white text-slate-900' : 'border-white bg-slate-900 text-white'
                                                        }`}
                                                >
                                                    <span className="text-[9px] font-black italic">VS</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Comprehensive Challenge CTA */}
                        <div className="relative w-full mt-2">
                            <TactileButton
                                className={`w-full p-0 !rounded-[28px] overflow-hidden group border-none ${isDarkMode ? 'bg-[#6366F1]' : 'bg-[#818CF8]'}`}
                                onClick={handleStartComprehensive}
                            >
                                <div className="w-full p-5 flex items-center justify-between z-10 relative">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                            <InfinityIcon className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl font-black text-white">التحدي الشامل</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-white/90">
                                                <Star className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                                                <span className="text-xs font-bold">Max XP: <span className="text-white font-black">12,500</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-[#6366F1]">
                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                    </div>
                                </div>
                            </TactileButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BattleArenaModal;
