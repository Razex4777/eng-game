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
 * 
 * Progression logic:
 * - `monster_challenge_progress.{subject}.chapters` → current unlocked part
 * - Parts < current → completed (green star, replayable, VS share)
 * - Part == current → current level (playable, highlighted)
 * - Parts > current → locked (greyed out, not clickable)
 * 
 * Data sources:
 * - Chapters come from `{subject}_chapters` table (distinct parts)
 * - Scores from `game_sessions` (per user, subject, type='chapters', part_number)
 * - Progress from `users.monster_challenge_progress` JSONB
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

    // ── Theme tokens ──────────────────────────────────────────
    const t = isDarkMode ? {
        overlay: 'bg-black/70',
        modal: 'bg-[#0F172A]',
        modalBorder: 'border-slate-800',
        modalShadow: 'shadow-black/60',
        handle: 'bg-slate-600',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-400',
        closeBtn: 'bg-slate-800 hover:bg-slate-700',
        // Cards
        cardCompleted: 'bg-slate-800/90 border-slate-600/50 hover:bg-slate-700/90',
        cardCurrent: 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25',
        cardLocked: 'bg-slate-800/30 border-slate-700/20',
        lockIcon: 'text-slate-600',
        scoreBadgeBg: 'bg-white/10',
        scoreText: 'text-slate-300',
        vsBtn: 'border-[#0F172A] bg-white text-slate-900',
        ctaBg: 'bg-indigo-600 hover:bg-indigo-500',
    } : {
        overlay: 'bg-slate-400/40',
        modal: 'bg-white',
        modalBorder: 'border-slate-200',
        modalShadow: 'shadow-xl',
        handle: 'bg-slate-300',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-500',
        closeBtn: 'bg-slate-100 hover:bg-slate-200',
        // Cards
        cardCompleted: 'bg-slate-100 border-slate-200/80 hover:bg-slate-200',
        cardCurrent: 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/25',
        cardLocked: 'bg-slate-50 border-slate-200/40',
        lockIcon: 'text-slate-400',
        scoreBadgeBg: 'bg-black/5',
        scoreText: 'text-slate-600',
        vsBtn: 'border-white bg-slate-900 text-white',
        ctaBg: 'bg-indigo-500 hover:bg-indigo-400',
    };

    // ── Fetch real data from Supabase ─────────────────────────
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const tableName = `${preferredSubject}_chapters`;

                // 1. Get distinct parts (chapters) from the question bank
                const { data: partData, error: partError } = await supabase
                    .from(tableName)
                    .select('part')
                    .order('part', { ascending: true });

                if (partError) throw partError;

                const uniqueParts = [...new Set(partData.map(r => r.part))];
                setChapters(uniqueParts);

                // 2. Get user's current progress (which part they've unlocked)
                if (user?.auth_id || user?.id) {
                    const authId = user.auth_id || user.id;
                    const { progress } = await getUserProgress(authId);

                    if (progress?.[preferredSubject]?.chapters) {
                        setCurrentPart(progress[preferredSubject].chapters);
                    }
                }

                // 3. Get per-chapter high scores from game_sessions
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

    // ── Helpers ───────────────────────────────────────────────
    const getChapterState = (partNum) => {
        if (partNum < currentPart) return 'completed';
        if (partNum === currentPart) return 'current';
        return 'locked';
    };

    const onShare = (chapterLabel, score) => {
        const text = `🎮 تحدي الأبطال!\n\nالمحارب (${playerName}) حقق ${score} XP في ${chapterLabel}..\nويتحداك تكسر هذا الرقم! 💪🔥`;
        handleShareChallenge('تحدي ختمتها!', text);
    };

    const handleStartChallenge = (partNum) => {
        const state = getChapterState(partNum);
        if (state === 'locked') {
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

    const totalMaxXP = Object.values(chapterScores).reduce((s, v) => s + v, 0);
    let firstScoreFound = false;

    return (
        <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center font-['Cairo'] backdrop-blur-sm transition-colors duration-500 ${t.overlay}`}>
            <div className={`
                relative w-full max-w-sm md:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem]
                shadow-2xl overflow-hidden transition-all duration-300 animate-pop-in border
                ${t.modal} ${t.modalBorder} ${t.modalShadow}
            `}>
                {/* Handle */}
                <div className={`w-8 h-1 rounded-full mx-auto mt-4 mb-3 ${t.handle}`} />

                {/* ── Header ──────────────────────────── */}
                <div className="flex items-center justify-between px-6 mb-4">
                    <div className="flex flex-col">
                        <h3 className={`text-2xl sm:text-3xl font-black ${t.textPrimary} tracking-tight leading-none flex items-center gap-2`}>
                            <GraduationCap className="w-7 h-7 text-amber-500" />
                            ساحة التحدي
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-xs font-bold ${t.textSecondary}`}>
                                اختر التحدي الدراسي
                            </span>
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${t.closeBtn}`}
                    >
                        <X className={`w-5 h-5 ${t.textPrimary}`} />
                    </button>
                </div>

                {/* ── Content ─────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 px-6">
                        <Loader2 className={`w-8 h-8 animate-spin ${t.textSecondary}`} />
                    </div>
                ) : (
                    <div className="px-5 pb-6">
                        {/* ── Chapter Grid ────────────── */}
                        <div className="grid grid-cols-4 gap-2.5 mb-6 max-h-[55vh] overflow-y-auto pr-1">
                            {chapters.map((partNum) => {
                                const score = chapterScores[partNum] || 0;
                                const state = getChapterState(partNum);
                                const hasScore = score > 0;
                                const isSelected = selectedChapter === partNum;
                                const isLocked = state === 'locked';
                                const isCurrent = state === 'current';
                                const isCompleted = state === 'completed';

                                // VS tutorial on first scored chapter
                                let showTutorial = false;
                                if (hasScore && !firstScoreFound) {
                                    firstScoreFound = true;
                                    showTutorial = true;
                                }

                                // Card style based on state
                                let cardClass = '';
                                if (isSelected && !isLocked) {
                                    cardClass = t.cardCurrent;
                                } else if (isCurrent) {
                                    cardClass = t.cardCurrent;
                                } else if (isCompleted) {
                                    cardClass = t.cardCompleted;
                                } else {
                                    cardClass = t.cardLocked;
                                }

                                const isHighlighted = isSelected || isCurrent;

                                return (
                                    <div key={partNum} className="relative group">
                                        <TactileButton
                                            onClick={() => {
                                                if (isLocked) {
                                                    showToast?.('أكمل المستوى الحالي أولاً! 🔒', 'warning');
                                                    return;
                                                }
                                                setSelectedChapter(partNum);
                                                handleStartChallenge(partNum);
                                            }}
                                            className={`
                                                w-full aspect-square flex-col !gap-0 !rounded-[18px]
                                                border transition-all duration-200
                                                ${cardClass}
                                                ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <div className="flex-1 flex flex-col items-center justify-center w-full">
                                                <span className={`text-[10px] font-bold mb-0.5 ${isHighlighted ? 'text-white/80' : isLocked ? 'opacity-30' : 'opacity-70'} ${!isHighlighted ? t.textPrimary : ''}`}>
                                                    الفصل
                                                </span>
                                                <span className={`text-2xl sm:text-3xl font-black leading-none mb-1 ${isHighlighted ? 'text-white' : ''} ${isLocked ? 'opacity-30' : ''} ${!isHighlighted ? t.textPrimary : ''}`}>
                                                    {partNum}
                                                </span>
                                                <div className="mt-1 h-5 flex items-center justify-center">
                                                    {isCurrent && !hasScore ? (
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20">
                                                            <Play className="w-2.5 h-2.5 text-white fill-current" />
                                                            <span className="text-[9px] font-black text-white">ابدأ</span>
                                                        </div>
                                                    ) : hasScore ? (
                                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isHighlighted ? 'bg-white/20' : t.scoreBadgeBg}`}>
                                                            <Star className={`w-2.5 h-2.5 ${isHighlighted ? 'text-yellow-300 fill-current' : 'text-yellow-500 fill-current'}`} />
                                                            <span className={`text-[9px] font-black ${isHighlighted ? 'text-white' : t.scoreText}`}>
                                                                {score > 999 ? (score / 1000).toFixed(1) + 'k' : score}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Lock className={`w-3 h-3 ${t.lockIcon}`} />
                                                    )}
                                                </div>
                                            </div>
                                        </TactileButton>

                                        {/* VS Share Button - only on completed scored chapters */}
                                        {hasScore && isCompleted && (
                                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-30">
                                                {showTutorial && showVsTutorial && (
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
                                                        onShare(`الفصل ${partNum}`, score);
                                                    }}
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-[3px] ${t.vsBtn}`}
                                                >
                                                    <span className="text-[8px] font-black italic">VS</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Bottom CTA - التحدي الشامل ── */}
                        <div className="relative w-full">
                            <TactileButton
                                className={`w-full p-0 !rounded-[24px] overflow-hidden group border-none ${t.ctaBg}`}
                                onClick={handleStartComprehensive}
                            >
                                <div className="w-full p-4 flex items-center justify-between z-10 relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white fill-current" />
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-lg font-black text-white">التحدي الشامل</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-white/90">
                                                <Star className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                                                <span className="text-xs font-bold">
                                                    Max XP: <span className="text-white font-black">
                                                        {totalMaxXP > 0 ? totalMaxXP.toLocaleString() : '12,500'}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-indigo-600">
                                        <InfinityIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </TactileButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BattleArenaModal;
