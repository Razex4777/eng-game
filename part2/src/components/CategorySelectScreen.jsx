import React, { useEffect, useState } from 'react';
import { BookMarked, Calendar, CalendarDays, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORY_ICONS = {
    'Chapters_Review': BookMarked,
    'FullYear': Calendar,
    'HalfYear': CalendarDays
};

const CATEGORY_COLORS = {
    'Chapters_Review': 'from-violet-500 to-purple-600',
    'FullYear': 'from-amber-500 to-orange-600',
    'HalfYear': 'from-rose-500 to-pink-600'
};

const CategorySelectScreen = ({ isDark, subject, onSelectCategory, onBack }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stageCounts, setStageCounts] = useState({});

    useEffect(() => {
        loadCategories();
    }, [subject]);

    const loadCategories = async () => {
        // Get categories for this subject
        const { data: cats, error } = await supabase
            .from('categories')
            .select('*')
            .eq('subject_id', subject.id)
            .order('order_index');

        if (!error && cats) {
            setCategories(cats);

            // Get stage counts for each category
            const counts = {};
            for (const cat of cats) {
                const { count } = await supabase
                    .from('stages')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', cat.id);
                counts[cat.id] = count || 0;
            }
            setStageCounts(counts);
        }
        setLoading(false);
    };

    const textColor = isDark ? 'text-white' : 'text-slate-900';
    const subTextColor = isDark ? 'text-slate-400' : 'text-slate-600';

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A1A]/90 z-[100]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-y-auto bg-[#0A0A1A]/20">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[15%] right-[15%] w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[25%] left-[15%] w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="w-full max-w-[360px] md:max-w-lg relative z-10 animate-card-spawn">
                {/* Header */}
                <div className="text-center mb-6 md:mb-8" dir="rtl">
                    <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold mb-3 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                        {subject.name_ar}
                    </div>
                    <h1 className={`text-2xl md:text-3xl font-black ${textColor} mb-2`}>
                        اختر نوع المراجعة
                    </h1>
                    <p className={`text-sm ${subTextColor}`}>
                        حدد طريقة المراجعة المناسبة لك
                    </p>
                </div>

                {/* Category Cards */}
                <div className="space-y-3 md:space-y-4">
                    {categories.map((category) => {
                        const Icon = CATEGORY_ICONS[category.name] || BookMarked;
                        const gradient = CATEGORY_COLORS[category.name] || 'from-gray-500 to-slate-600';
                        const stageCount = stageCounts[category.id] || 0;

                        return (
                            <button
                                key={category.id}
                                onClick={() => onSelectCategory(category)}
                                className={`group relative w-full p-4 md:p-5 rounded-xl md:rounded-2xl glass-panel border ${isDark ? 'border-white/10 hover:border-white/20' : 'border-black/5 hover:border-black/10'} transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 rounded-xl md:rounded-2xl transition-opacity`} />

                                <div className="flex items-center gap-3 md:gap-4" dir="rtl">
                                    {/* Icon */}
                                    <div className={`w-11 h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                                        <Icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 text-right">
                                        <h3 className={`text-base md:text-lg font-black ${textColor}`}>
                                            {category.name_ar}
                                        </h3>
                                        <p className={`text-[10px] md:text-xs ${subTextColor}`}>
                                            {stageCount} مرحلة
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className={`w-4 h-4 md:w-5 md:h-5 ${subTextColor} group-hover:translate-x-1 transition-transform rotate-180`} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className={`mt-6 w-full py-3 rounded-xl ${isDark ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-200/50 hover:bg-slate-300/50'} ${textColor} font-bold transition-colors`}
                >
                    رجوع
                </button>
            </div>
        </div>
    );
};

export default CategorySelectScreen;
