import React, { useState, useEffect } from 'react';
import { GraduationCap, Flame, X, Star, Lock, Infinity as InfinityIcon, Play, BookOpen, Dna, Loader2, Zap, Layers } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';
import SharePopup from '../components/ui/SharePopup';
import { handleShareChallenge } from '../utils/sharing';
import { getUserProgress, getAllPartCounts, getLastAttemptScore, getHighScore } from '../services/monsterChallengeService';

/**
 * Battle Arena Modal - Monster Challenge Selection Screen
 * Shows progress for each subject/type and allows starting a challenge
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
    const [userProgress, setUserProgress] = useState(null);
    const [partCounts, setPartCounts] = useState(null);
    // Review type selection: chapters, halfyear, fullyear
    const [selectedType, setSelectedType] = useState('fullyear');
    const [showVsTutorial, setShowVsTutorial] = useState(true);
    const [showVsPopup, setShowVsPopup] = useState(false);
    const [lastScore, setLastScore] = useState(null);
    const [highScore, setHighScore] = useState(null);

    const bgCard = isDarkMode ? 'bg-[#1E293B]' : 'bg-white';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const accentColor = preferredSubject === 'biology' ? 'text-emerald-500' : 'text-[#F59E0B]';
    const primaryColor = preferredSubject === 'biology' ? 'bg-emerald-500' : 'bg-[#3B82F6]';
    const subjectIcon = preferredSubject === 'biology' ? <Dna className={`w-8 h-8 ${accentColor}`} /> : <BookOpen className={`w-8 h-8 ${accentColor}`} />;
    const subjectName = preferredSubject === 'biology' ? 'الأحياء' : 'الإنجليزي';

    // Load user progress and part counts
    useEffect(() => {
        const loadData = async () => {
            if (!user?.auth_id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [progressResult, countsResult] = await Promise.all([
                    getUserProgress(user.auth_id),
                    getAllPartCounts()
                ]);

                if (progressResult.progress) {
                    setUserProgress(progressResult.progress);
                }
                if (countsResult.counts) {
                    setPartCounts(countsResult.counts);
                }
            } catch (error) {
                console.error('Error loading challenge data:', error);
                showToast?.('خطأ في تحميل البيانات', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Get current progress for selected type
    const getCurrentPart = () => {
        if (!userProgress || !userProgress[preferredSubject]) return 1;
        return userProgress[preferredSubject][selectedType] || 1;
    };

    // Get max parts for selected type
    const getMaxParts = () => {
        if (!partCounts || !partCounts[preferredSubject]) return 12;
        return partCounts[preferredSubject][selectedType] || 12;
    };

    const currentPart = getCurrentPart();
    const maxParts = getMaxParts();
    const progressPercent = Math.round((currentPart / maxParts) * 100);

    // Type configurations
    const typeConfigs = {
        chapters: { id: 'chapters', name: 'فصل فصل', icon: Layers, color: 'bg-amber-500' },
        halfyear: { id: 'halfyear', name: 'نصف السنة', icon: Zap, color: 'bg-orange-500' },
        fullyear: { id: 'fullyear', name: 'السنة الكاملة', icon: Star, color: 'bg-purple-500' }
    };

    const currentTypeInfo = typeConfigs[selectedType];

    const onShare = async () => {
        // First fetch scores for the VS popup
        if (user?.id) {
            try {
                const [lastAttemptResult, highScoreResult] = await Promise.all([
                    getLastAttemptScore(user.id, preferredSubject, selectedType),
                    getHighScore(user.id, preferredSubject, selectedType)
                ]);

                setLastScore(lastAttemptResult.score);
                setHighScore(highScoreResult.highScore);
                setShowVsPopup(true);
            } catch (error) {
                console.error('Error loading scores:', error);
                showToast?.('خطأ في تحميل البيانات', 'error');
            }
        }
    };

    const handleVsShare = async () => {
        const shareText = `اريد ${playerName} هكر اللعبة ووصل الى ${highScore || 'آلاف'} ويتحداك لكسر هذا الرقم`;
        const result = await handleShareChallenge('تحدي الوحش!', shareText);

        if (result?.success) {
            if (result.type === 'copy') {
                showToast('تم نسخ رابط التحدي! 🚀', 'success');
            }
            setShowVsPopup(false);
        } else if (result?.type === 'copy') {
            showToast('عذراً، تعذر النسخ.', 'error');
        }
    };

    const handleStartChallenge = () => {
        // Pass the game configuration
        onStartGame({
            mode: 'monster',
            subject: preferredSubject,
            type: selectedType,
            part: currentPart
        });
    };

    return (
        <>
            {/* VS Popup */}
            {showVsPopup && (
                <SharePopup
                    isDarkMode={isDarkMode}
                    onClose={() => setShowVsPopup(false)}
                    title="تحدى صديق!"
                    message="شارك أعلى نقاطك وتحدى أصدقائك لكسر الرقم!"
                    lastScore={lastScore}
                    highScore={highScore}
                    shareText={`اريد ${playerName} هكر اللعبة ووصل الى ${highScore || 'آلاف'} ويتحداك لكسر هذا الرقم`}
                    onShare={handleVsShare}
                    variant="vs"
                />
            )}

            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 font-['Cairo'] backdrop-blur-sm transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-200/50'}`}>
                <div className={`relative w-full max-w-sm md:max-w-md p-6 pb-8 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-300 animate-pop-in ${bgCard} ${isDarkMode ? 'shadow-black/50 border border-slate-700' : 'shadow-xl border border-slate-100'}`}>

                {/* Handle */}
                <div className={`w-8 h-1 rounded-full mx-auto mb-6 opacity-20 ${isDarkMode ? 'bg-white' : 'bg-slate-900'}`}></div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {/* Monster Badge Icon */}
                        <div className="relative">
                            <span className="text-5xl animate-pulse filter drop-shadow-lg">👹</span>
                            <div className="absolute -inset-2 bg-red-500/20 blur-xl rounded-full animate-ping"></div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className={`text-3xl font-black ${textPrimary} tracking-tight leading-none`}>
                                تحدي الوحش
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-xs font-bold ${textSecondary}`}>مادة {subjectName}</span>
                                <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#334155] hover:bg-[#475569]' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                        <X className={`w-5 h-5 ${textPrimary}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className={`w-8 h-8 animate-spin ${textSecondary}`} />
                    </div>
                ) : (
                    <>
                        {/* Review Type Selector */}
                        <div className={`flex items-center gap-2 mb-6 p-1.5 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            {Object.entries(typeConfigs).map(([typeKey, typeInfo]) => {
                                const Icon = typeInfo.icon;
                                const isSelected = selectedType === typeKey;

                                return (
                                    <button
                                        key={typeKey}
                                        onClick={() => setSelectedType(typeKey)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-sm transition-all ${
                                            isSelected
                                                ? `${typeInfo.color} text-white shadow-lg scale-105`
                                                : `${isDarkMode ? 'bg-transparent text-slate-400 hover:text-white' : 'bg-transparent text-slate-500 hover:text-slate-700'}`
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{typeInfo.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Progress Card */}
                        <div className={`p-4 rounded-2xl mb-6 ${isDarkMode ? 'bg-[#334155]' : 'bg-slate-100'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-sm font-bold ${textPrimary}`}>تقدمك</span>
                                <span className={`text-xs font-bold ${accentColor}`}>
                                    المرحلة {currentPart} من {maxParts}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${preferredSubject === 'biology' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className={`text-xs font-bold ${textSecondary}`}>
                                        {progressPercent}% مكتمل
                                    </span>
                                </div>
                                {currentPart > 1 && (
                                    <button
                                        onClick={onShare}
                                        className={`text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-600 text-white' : 'bg-white text-slate-700'}`}
                                    >
                                        تحدى صديق 🔥
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Part Grid - Show current and next parts */}
                        <div className="grid grid-cols-6 gap-2 mb-6">
                            {Array.from({ length: Math.min(12, maxParts) }, (_, i) => i + 1).map((part) => {
                                const isCompleted = part < currentPart;
                                const isCurrent = part === currentPart;
                                const isLocked = part > currentPart;

                                return (
                                    <div
                                        key={part}
                                        className={`
                                            aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all
                                            ${isCurrent
                                                ? `${primaryColor} text-white shadow-lg scale-110 animate-pulse`
                                                : isCompleted
                                                    ? `${isDarkMode ? 'bg-emerald-600/30' : 'bg-emerald-100'} ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`
                                                    : `${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <Star className="w-4 h-4 fill-current" />
                                        ) : isLocked ? (
                                            <Lock className="w-3 h-3" />
                                        ) : (
                                            part
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Start Button */}
                        <TactileButton
                            className={`w-full p-0 !rounded-[28px] overflow-hidden group border-none ${preferredSubject === 'biology' ? 'bg-emerald-500' : 'bg-[#6366F1]'}`}
                            onClick={handleStartChallenge}
                        >
                            <div className="w-full p-5 flex items-center justify-between z-10 relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Play className="w-7 h-7 text-white fill-current" />
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl font-black text-white">ابدأ التحدي</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-white/90">
                                            <Flame className="w-3.5 h-3.5 text-orange-300 fill-current" />
                                            <span className="text-xs font-bold text-white/90">
                                                المرحلة {currentPart} - {currentTypeInfo.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${preferredSubject === 'biology' ? 'text-emerald-500' : 'text-[#6366F1]'}`}>
                                    <InfinityIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </TactileButton>
                    </>
                )}
                </div>
            </div>
        </>
    );
};

export default BattleArenaModal;
