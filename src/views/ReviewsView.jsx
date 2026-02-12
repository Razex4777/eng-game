import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Zap, Infinity as InfinityIcon, ChevronLeft, CheckCircle2, Play, Loader2, Flame, Target } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import StatsHUD from '../components/ui/StatsHUD';
import { getReviewsStructure, getUserChapterProgress } from '../services/chaptersService';

/**
 * ReviewsView (Simplified)
 * Clean review selection matching code.txt reference
 */
const ReviewsView = ({
    isDarkMode,
    onBack,
    onFlameClick,
    onQuestionsClick,
    onReviewClick,
    userId = null,
    subject = 'english'
}) => {
    const [expandedReview, setExpandedReview] = useState(null);
    const [halfyearParts, setHalfyearParts] = useState([]);
    const [fullyearParts, setFullyearParts] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);

    const toggleReview = (id) => setExpandedReview(expandedReview === id ? null : id);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { parts: halfyear } = await getReviewsStructure(subject, 'halfyear');
                setHalfyearParts(halfyear);

                const { parts: fullyear } = await getReviewsStructure(subject, 'fullyear');
                setFullyearParts(fullyear);

                if (userId) {
                    const { progress } = await getUserChapterProgress(userId, subject);
                    setUserProgress(progress);
                }
            } catch (error) {
                console.error('Error loading reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [subject, userId]);

    const getPartStatus = (type, partNum) => {
        const typeProgress = userProgress?.[type] || {};
        const partProgress = typeProgress[partNum];

        if (partProgress?.completed) return 'completed';
        if (partNum === 1) return 'unlocked';
        const prevPartProgress = typeProgress[partNum - 1];
        if (prevPartProgress?.completed) return 'unlocked';

        return 'locked';
    };

    const handlePartClick = (type, part) => {
        const status = getPartStatus(type, part.part);
        if (status === 'locked') return;

        if (onReviewClick) {
            onReviewClick({
                type,
                part: part.part,
                subject,
                questionCount: part.questionCount
            });
        }
    };

    const renderSpecialReview = (type, title, parts, colorTheme, Icon) => (
        <div className="mb-3">
            <TactileButton
                onClick={() => toggleReview(type)}
                className="w-full p-4 flex items-center justify-between rounded-[20px] relative overflow-hidden"
                colorClass={colorTheme.bg}
                borderClass={colorTheme.border}
            >
                <div className="flex items-center gap-3 z-10">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 border border-white/30 text-white">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right text-white">
                        <span className="block text-lg font-black">{title}</span>
                        <span className="text-xs opacity-80 font-bold">
                            {parts.length} جزء
                        </span>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white transition-transform ${expandedReview === type ? '-rotate-90' : ''}`}>
                    <ChevronLeft className="w-4 h-4" />
                </div>
            </TactileButton>

            {expandedReview === type && (
                <div className="mt-2 space-y-2 animate-slide-up">
                    {parts.map((part) => {
                        const status = getPartStatus(type, part.part);
                        const isLocked = status === 'locked';
                        const isCompleted = status === 'completed';

                        return (
                            <TactileButton
                                key={part.part}
                                onClick={() => handlePartClick(type, part)}
                                disabled={isLocked}
                                className={`w-full p-3 flex items-center justify-between rounded-xl ${isLocked ? 'opacity-60 grayscale' : ''}`}
                                colorClass={
                                    isCompleted
                                        ? (isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50')
                                        : isLocked
                                            ? (isDarkMode ? 'bg-slate-900' : 'bg-slate-100')
                                            : (isDarkMode ? 'bg-slate-800' : 'bg-white')
                                }
                                borderClass={
                                    isCompleted
                                        ? 'border-emerald-200'
                                        : isLocked
                                            ? 'border-slate-200'
                                            : (isDarkMode ? 'border-slate-700' : 'border-slate-200')
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${isCompleted
                                            ? 'bg-emerald-500 border-emerald-600 text-white'
                                            : isLocked
                                                ? 'bg-slate-200 border-slate-300 text-slate-400 dark:bg-slate-700 dark:border-slate-600'
                                                : (isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600')
                                        }`}>
                                        {isCompleted
                                            ? <CheckCircle2 className="w-5 h-5" />
                                            : isLocked
                                                ? <Lock className="w-4 h-4" />
                                                : <span className="font-black">{part.part}</span>
                                        }
                                    </div>
                                    <div>
                                        <span className={`block font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                            الجزء {part.part}
                                        </span>
                                        <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {isCompleted ? 'مكتمل' : `${part.questionCount} سؤال`}
                                        </span>
                                    </div>
                                </div>
                                {!isLocked && !isCompleted && (
                                    <Play className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                                )}
                            </TactileButton>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up pb-32">
            <StatsHUD
                isDarkMode={isDarkMode}
                compact={true}
                onFlameClick={() => onFlameClick?.('العب 7 أيام متواصلة بدون تسطيح حتى تحصل شعلة 🔥', 'fire', Flame)}
                onQuestionsClick={() => onQuestionsClick?.('المجموع الكلّي لاسئلة المنهج 🎯', 'info', Target)}
            />

            <div className="flex items-center gap-4 mb-6">
                <TactileButton
                    onClick={() => onBack('home')}
                    className="w-12 h-12 rounded-xl"
                    colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                    borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}
                >
                    <ArrowLeft className={isDarkMode ? 'text-white' : 'text-slate-700'} />
                </TactileButton>
                <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>المراجعات</h2>
            </div>

            <div className="space-y-3">
                {/* مراجعة نصف السنة */}
                {renderSpecialReview(
                    'halfyear',
                    'مراجعة نصف السنة',
                    halfyearParts,
                    { bg: 'bg-gradient-to-r from-amber-400 to-orange-500', border: 'border-orange-600' },
                    Zap
                )}

                {/* المراجعة الشاملة */}
                {renderSpecialReview(
                    'fullyear',
                    'المراجعة الشاملة',
                    fullyearParts,
                    { bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', border: 'border-indigo-700' },
                    InfinityIcon
                )}
            </div>
        </div>
    );
};

export default ReviewsView;
