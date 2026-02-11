import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star, Gamepad2, Play, CheckCircle2, Loader2 } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import {
    getSubjectConfig,
    getUserChapterProgress
} from '../services/chaptersService';

// واجهة المراحل (LevelsView)
const LevelsView = ({
    isDarkMode,
    chapterNum,
    onBack,
    onShowLogin,
    onLevelClick,
    userId = null,
    subject = 'english'
}) => {
    const [parts, setParts] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch parts for this chapter and user progress
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get chapter configuration
                const config = getSubjectConfig(subject);
                const chapterConfig = config?.chapters?.[chapterNum];

                if (chapterConfig) {
                    // Get user progress if logged in
                    let progress = {};
                    if (userId) {
                        const { progress: userProg } = await getUserChapterProgress(userId, subject);
                        progress = userProg;
                    }
                    setUserProgress(progress);

                    // Build parts list with status
                    const chaptersProgress = progress?.chapters || {};
                    let foundUnlocked = false;

                    const partsWithStatus = chapterConfig.parts.map((partNum, index) => {
                        const partProgress = chaptersProgress[partNum];
                        const isCompleted = partProgress?.completed || false;
                        const stars = partProgress?.stars || 0;

                        // First incomplete part is unlocked, rest are locked
                        let status = 'locked';
                        if (isCompleted) {
                            status = 'completed';
                        } else if (!foundUnlocked) {
                            status = 'unlocked';
                            foundUnlocked = true;
                        }

                        return {
                            id: partNum,
                            partNumber: partNum,
                            displayNumber: index + 1,
                            status,
                            stars,
                            score: partProgress?.score || 0
                        };
                    });

                    setParts(partsWithStatus);
                }
            } catch (error) {
                console.error('Error loading levels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chapterNum, subject, userId]);

    const handleLevelClick = (level) => {
        if (level.status === 'locked') {
            return; // Can't click locked levels
        }

        // Pass the part info to start the game
        onLevelClick({
            ...level,
            chapterNum,
            subject,
            type: 'chapters'
        });
    };

    // Get chapter name
    const chapterNames = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];
    const chapterName = chapterNames[chapterNum - 1] || chapterNum;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up pb-32">
            <div className="flex items-center gap-4 mb-8">
                <TactileButton
                    onClick={() => onBack('chapters')}
                    className="w-12 h-12 rounded-xl"
                    colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                    borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}
                >
                    <ArrowLeft className={isDarkMode ? 'text-white' : 'text-slate-700'} />
                </TactileButton>
                <div>
                    <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        الفصل {chapterName}
                    </h2>
                    <p className="text-sm font-bold text-slate-400">
                        {`${parts.length} مراحل`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {parts.map((level) => {
                    const isLocked = level.status === 'locked';
                    const isCompleted = level.status === 'completed';
                    const isUnlocked = level.status === 'unlocked';

                    return (
                        <div key={level.id} className="flex flex-col items-center gap-2">
                            <TactileButton
                                onClick={() => handleLevelClick(level)}
                                className={`w-full aspect-[4/5] rounded-[24px] flex flex-col items-center justify-center gap-1 relative overflow-hidden group transition-transform active:scale-95 
                                    ${isLocked
                                        ? 'opacity-80 grayscale'
                                        : isCompleted
                                            ? 'shadow-lg shadow-emerald-500/20'
                                            : 'shadow-lg shadow-indigo-500/20'
                                    }
                                `}
                                colorClass={
                                    isLocked
                                        ? (isDarkMode ? 'bg-slate-900' : 'bg-slate-200')
                                        : isCompleted
                                            ? (isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500')
                                            : (isDarkMode ? 'bg-indigo-600' : 'bg-[#8B5CF6]')
                                }
                                borderClass={
                                    isLocked
                                        ? (isDarkMode ? 'border-slate-800' : 'border-slate-300')
                                        : isCompleted
                                            ? (isDarkMode ? 'border-emerald-800' : 'border-emerald-600')
                                            : (isDarkMode ? 'border-indigo-800' : 'border-[#7C3AED]')
                                }
                            >
                                {/* Level number */}
                                <span className={`text-5xl font-black drop-shadow-md ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                                    {level.displayNumber}
                                </span>

                                {/* Stars or Lock icon */}
                                {isLocked ? (
                                    <Lock className="w-7 h-7 text-slate-400 mt-2" />
                                ) : isCompleted ? (
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3].map(star => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 drop-shadow-sm ${star <= level.stars
                                                    ? 'text-yellow-300 fill-yellow-300'
                                                    : 'text-white/30'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Play className="w-7 h-7 text-white mt-2 fill-white animate-pulse" />
                                )}

                                {/* Completed checkmark */}
                                {isCompleted && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </TactileButton>

                            {/* Part label */}
                            <span className={`text-xs font-bold ${isLocked
                                ? 'text-slate-400'
                                : isCompleted
                                    ? 'text-emerald-500'
                                    : isDarkMode
                                        ? 'text-indigo-400'
                                        : 'text-indigo-600'
                                }`}>
                                {isCompleted ? 'مكتمل' : isUnlocked ? 'العب الآن' : 'مغلق'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelsView;
