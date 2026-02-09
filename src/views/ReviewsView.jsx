import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Zap, Infinity as InfinityIcon, ChevronLeft, CheckCircle2, Play, Loader2, BookOpen } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import StatsHUD from '../components/ui/StatsHUD';
import {
    getReviewsStructure,
    getSubjectConfig,
    getUserChapterProgress
} from '../services/chaptersService';

// واجهة المراجعات
const ReviewsView = ({
    isDarkMode,
    onBack,
    isGuest,
    onShowLogin,
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

    // Fetch review structures and user progress
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get halfyear structure
                const { parts: halfyear } = await getReviewsStructure(subject, 'halfyear');
                setHalfyearParts(halfyear);

                // Get fullyear structure
                const { parts: fullyear } = await getReviewsStructure(subject, 'fullyear');
                setFullyearParts(fullyear);

                // Get user progress if logged in
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

    // Get part status based on user progress
    const getPartStatus = (type, partNum) => {
        if (isGuest) return 'locked';

        const typeProgress = userProgress?.[type] || {};
        const partProgress = typeProgress[partNum];

        if (partProgress?.completed) return 'completed';

        // Check if previous part is completed (for sequential unlock)
        if (partNum === 1) return 'unlocked';
        const prevPartProgress = typeProgress[partNum - 1];
        if (prevPartProgress?.completed) return 'unlocked';

        return 'locked';
    };

    // Handle clicking on a review part
    const handlePartClick = (type, part) => {
        if (isGuest) {
            onShowLogin();
            return;
        }

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

    // Render special review section (halfyear or fullyear)
    const renderSpecialReview = (type, title, parts, colorTheme, icon) => {
        const Icon = icon;

        return (
            <div className="mb-4">
                <TactileButton
                    onClick={() => toggleReview(type)}
                    className={`w-full p-5 flex items-center justify-between rounded-[24px] z-10 relative overflow-hidden`}
                    colorClass={colorTheme.bg}
                    borderClass={colorTheme.border}
                >
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Icon className="w-24 h-24 text-white" />
                    </div>
                    <div className="flex items-center gap-4 z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 bg-white/20 border-white/40 text-white`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div className="text-right text-white">
                            <div className="flex items-center gap-2">
                                <span className="block text-xl font-black">{title}</span>
                            </div>
                            <span className="text-xs opacity-80 font-bold">
                                {parts.length} جزء • {parts.reduce((sum, p) => sum + p.questionCount, 0)} سؤال
                            </span>
                        </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 bg-white/20 text-white ${expandedReview === type ? '-rotate-90' : ''}`}>
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                </TactileButton>

                {expandedReview === type && (
                    <div className="mt-3 grid grid-cols-1 gap-3 pl-2 animate-slide-up">
                        {parts.map((part) => {
                            const status = getPartStatus(type, part.part);
                            const isLocked = status === 'locked';
                            const isCompleted = status === 'completed';

                            return (
                                <TactileButton
                                    key={part.part}
                                    onClick={() => handlePartClick(type, part)}
                                    disabled={isLocked}
                                    className={`w-full p-4 flex items-center justify-between rounded-xl relative overflow-hidden ${isLocked ? 'opacity-60 grayscale' : ''}`}
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
                                    <div className="flex items-center gap-4 z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${isCompleted
                                                ? 'bg-emerald-500 border-emerald-600 text-white'
                                                : isLocked
                                                    ? 'bg-slate-200 border-slate-300 text-slate-400 dark:bg-slate-700 dark:border-slate-600'
                                                    : (isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600')
                                            }`}>
                                            {isCompleted
                                                ? <CheckCircle2 className="w-6 h-6" />
                                                : isLocked
                                                    ? <Lock className="w-5 h-5" />
                                                    : <span className="font-black text-xl">{part.part}</span>
                                            }
                                        </div>
                                        <div className="text-right">
                                            <span className={`block font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                                الجزء {part.part}
                                            </span>
                                            <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-400'
                                                }`}>
                                                {isCompleted ? 'مكتمل' : `${part.questionCount} سؤال`}
                                            </span>
                                        </div>
                                    </div>
                                    {!isLocked && !isCompleted && (
                                        <Play className="w-6 h-6 text-indigo-500 fill-indigo-500 animate-pulse" />
                                    )}
                                </TactileButton>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up pb-32">
            <StatsHUD isDarkMode={isDarkMode} compact={true} onFlameClick={onFlameClick} onQuestionsClick={onQuestionsClick} isGuest={isGuest} />
            <div className="flex items-center gap-4 mb-6">
                <TactileButton onClick={() => onBack('home')} className="w-12 h-12 rounded-xl" colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'} borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}>
                    <ArrowLeft className={isDarkMode ? 'text-white' : 'text-slate-700'} />
                </TactileButton>
                <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>المراجعات</h2>
            </div>

            {isGuest ? (
                <div className="text-center py-20 opacity-60">
                    <Lock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>المراجعات للمشتركين فقط</h3>
                    <p className="text-sm text-slate-500 mb-6">سجل دخولك لتتمتع بكافة المميزات</p>
                    <TactileButton onClick={onShowLogin} className="w-48 mx-auto p-3 rounded-xl" colorClass="bg-yellow-400" borderClass="border-yellow-600">
                        <span className="font-bold text-yellow-900">تسجيل الدخول</span>
                    </TactileButton>
                </div>
            ) : (
                <div className="space-y-4">
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
            )}
        </div>
    );
};

export default ReviewsView;
