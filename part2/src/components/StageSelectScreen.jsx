import React, { useEffect, useState } from 'react';
import { Play, Lock, CheckCircle2, ArrowRight, Loader2, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const StageSelectScreen = ({ isDark, subject, category, onSelectStage, onBack }) => {
    const { profile } = useAuth();
    const [stages, setStages] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStagesAndProgress();
    }, [category, profile]);

    const loadStagesAndProgress = async () => {
        // Load stages
        const { data: stagesData, error: stagesError } = await supabase
            .from('stages')
            .select('*')
            .eq('category_id', category.id)
            .order('order_index');

        if (!stagesError && stagesData) {
            setStages(stagesData);
        }

        // Load user progress if logged in
        if (profile?.id) {
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('stage_id, completed, stars, best_score')
                .eq('user_id', profile.id);

            if (progressData) {
                const progressMap = {};
                progressData.forEach(p => {
                    progressMap[p.stage_id] = p;
                });
                setUserProgress(progressMap);
            }
        }

        setLoading(false);
    };

    // Determine if a stage is unlocked
    const isStageUnlocked = (stage, index, chapterStages) => {
        // Chapters_Review: Each chapter's Part 1 is always unlocked
        // To unlock Part N, must complete Part N-1 of same chapter
        if (category.name === 'Chapters_Review') {
            if (stage.part_no === 1 || index === 0) return true;
            const prevStage = chapterStages[index - 1];
            return userProgress[prevStage?.id]?.completed === true;
        }

        // FullYear/HalfYear: First stage unlocked, then sequential
        if (index === 0) return true;
        const orderedStages = stages.filter(s => s.chapter_no === stage.chapter_no || !stage.chapter_no);
        const stageIndex = orderedStages.findIndex(s => s.id === stage.id);
        if (stageIndex === 0) return true;
        const prevStage = orderedStages[stageIndex - 1];
        return userProgress[prevStage?.id]?.completed === true;
    };

    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-slate-400' : 'text-slate-600';
    const cardBg = isDark ? 'bg-slate-800/50' : 'bg-white/50';

    // Group stages by chapter number
    const groupedStages = stages.reduce((acc, stage) => {
        const chapter = stage.chapter_no || 0;
        if (!acc[chapter]) acc[chapter] = [];
        acc[chapter].push(stage);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A1A]/90 z-[100]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col z-[100] bg-[#0A0A1A]/95">
            {/* Header */}
            <div className="shrink-0 p-4 md:p-6 border-b border-white/10">
                <div className="max-w-lg mx-auto" dir="rtl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold ${subTextColor}`}>{subject.name_ar}</span>
                        <span className={`text-xs ${subTextColor}`}>›</span>
                        <span className={`text-xs font-bold ${subTextColor}`}>{category.name_ar}</span>
                    </div>
                    <h1 className={`text-xl md:text-2xl font-black ${textColor}`}>
                        اختر المرحلة
                    </h1>
                    <p className={`text-xs md:text-sm ${subTextColor} mt-1`}>
                        {stages.length} مرحلة متاحة
                    </p>
                </div>
            </div>

            {/* Stages List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {Object.entries(groupedStages).map(([chapter, chapterStages]) => (
                        <div key={chapter}>
                            {/* Chapter Header (if has chapter) */}
                            {chapter !== '0' && (
                                <div className="flex items-center gap-3 mb-3" dir="rtl">
                                    <h2 className={`text-sm font-black ${textColor}`}>
                                        الفصل {chapter}
                                    </h2>
                                    <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                                </div>
                            )}

                            {/* Stage Cards */}
                            <div className="grid grid-cols-1 gap-2">
                                {chapterStages.map((stage, idx) => {
                                    const unlocked = isStageUnlocked(stage, idx, chapterStages);
                                    const progress = userProgress[stage.id];
                                    const completed = progress?.completed;
                                    const stars = progress?.stars || 0;

                                    return (
                                        <button
                                            key={stage.id}
                                            onClick={() => unlocked && onSelectStage(stage)}
                                            disabled={!unlocked}
                                            className={`group relative w-full p-3 md:p-4 rounded-xl ${cardBg} border transition-all duration-200 ${unlocked
                                                    ? `${isDark ? 'border-white/5 hover:border-indigo-500/50' : 'border-black/5 hover:border-indigo-500/50'} hover:scale-[1.01] active:scale-[0.99] cursor-pointer`
                                                    : `${isDark ? 'border-white/5' : 'border-black/5'} opacity-50 cursor-not-allowed`
                                                }`}
                                        >
                                            <div className="flex items-center gap-3" dir="rtl">
                                                {/* Part Number Badge */}
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-md ${completed
                                                        ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                                        : unlocked
                                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                            : 'bg-gradient-to-br from-slate-600 to-slate-700'
                                                    }`}>
                                                    {completed ? (
                                                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                                    ) : unlocked ? (
                                                        <span className="text-white font-black text-sm md:text-base">
                                                            {stage.part_no || idx + 1}
                                                        </span>
                                                    ) : (
                                                        <Lock className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                                                    )}
                                                </div>

                                                {/* Stage Info */}
                                                <div className="flex-1 text-right">
                                                    <h3 className={`text-sm md:text-base font-bold ${textColor}`}>
                                                        الجزء {stage.part_no || idx + 1}
                                                    </h3>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <p className={`text-[10px] md:text-xs ${subTextColor}`}>
                                                            {stage.total_questions} سؤال
                                                        </p>
                                                        {completed && stars > 0 && (
                                                            <div className="flex items-center gap-0.5">
                                                                {[1, 2, 3].map(i => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3 h-3 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Play/Lock Icon */}
                                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors ${unlocked
                                                        ? `${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'} group-hover:bg-indigo-500`
                                                        : `${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`
                                                    }`}>
                                                    {unlocked ? (
                                                        <Play className={`w-4 h-4 md:w-5 md:h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'} group-hover:text-white fill-current transition-colors`} />
                                                    ) : (
                                                        <Lock className={`w-4 h-4 md:w-5 md:h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer - Back Button */}
            <div className="shrink-0 p-4 border-t border-white/10">
                <div className="max-w-lg mx-auto">
                    <button
                        onClick={onBack}
                        className={`w-full py-3 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} ${textColor} font-bold transition-colors flex items-center justify-center gap-2`}
                    >
                        <ArrowRight className="w-4 h-4" />
                        رجوع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StageSelectScreen;
