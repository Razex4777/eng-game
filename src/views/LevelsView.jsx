import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Star, Play, Loader2 } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import { getSubjectConfig, getUserChapterProgress } from '../services/chaptersService';

/**
 * LevelsView (Simplified)
 * Clean level grid matching code.txt reference
 */
const LevelsView = ({
    isDarkMode,
    chapterNum,
    onBack,
    onLevelClick,
    userId = null,
    subject = 'english'
}) => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const config = getSubjectConfig(subject);
                const chapterConfig = config?.chapters?.[chapterNum];

                if (chapterConfig) {
                    let progress = {};
                    if (userId) {
                        const { progress: userProg } = await getUserChapterProgress(userId, subject);
                        progress = userProg;
                    }

                    const chaptersProgress = progress?.chapters || {};
                    let foundUnlocked = false;

                    const partsWithStatus = chapterConfig.parts.map((partNum, index) => {
                        const partProgress = chaptersProgress[partNum];
                        const isCompleted = partProgress?.completed || false;
                        const stars = partProgress?.stars || 0;

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
                            stars
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
        if (level.status === 'locked') return;
        onLevelClick({ ...level, chapterNum, subject, type: 'chapters' });
    };

    const chapterNames = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up pb-32">
            <div className="flex items-center gap-4 mb-6">
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
                        الفصل {chapterNames[chapterNum - 1]}
                    </h2>
                    <p className="text-sm font-bold text-slate-400">{parts.length} مراحل</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {parts.map((level) => {
                    const isLocked = level.status === 'locked';
                    const isCompleted = level.status === 'completed';

                    return (
                        <TactileButton
                            key={level.id}
                            onClick={() => handleLevelClick(level)}
                            className={`w-full aspect-[4/5] rounded-[20px] flex flex-col items-center justify-center gap-1 relative overflow-hidden group
                                ${isLocked ? 'opacity-80 grayscale' : ''}
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
                            <span className={`text-4xl font-black ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                                {level.displayNumber}
                            </span>

                            {isLocked ? (
                                <Lock className="w-6 h-6 text-slate-400 mt-1" />
                            ) : (
                                <div className="flex gap-0.5 mt-1">
                                    {[1, 2, 3].map(star => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= level.stars
                                                ? 'text-yellow-300 fill-yellow-300'
                                                : 'text-white/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </TactileButton>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelsView;
