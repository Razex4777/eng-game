import React, { useEffect, useState } from 'react';
import { BookOpen, Microscope, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SUBJECT_ICONS = {
    'Biology': Microscope,
    'English': BookOpen
};

const SUBJECT_COLORS = {
    'Biology': 'from-emerald-500 to-teal-600',
    'English': 'from-blue-500 to-indigo-600'
};

const SubjectSelectScreen = ({ isDark, onSelectSubject, onBack }) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        console.log('📚 Loading subjects...');
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .order('order_index');

        console.log('📚 Subjects result:', { data, error });

        if (error) {
            console.error('❌ Subjects error:', error);
        }

        if (data) {
            setSubjects(data);
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
                <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-[360px] md:max-w-lg relative z-10 animate-card-spawn">
                {/* Header */}
                <div className="text-center mb-6 md:mb-10" dir="rtl">
                    <h1 className={`text-2xl md:text-4xl font-black ${textColor} mb-2`}>
                        اختر المادة
                    </h1>
                    <p className={`text-sm md:text-base ${subTextColor}`}>
                        حدد المادة التي تريد اختبار نفسك فيها
                    </p>
                </div>

                {/* Subject Cards */}
                <div className="grid gap-4 md:gap-6">
                    {subjects.map((subject) => {
                        const Icon = SUBJECT_ICONS[subject.name] || BookOpen;
                        const gradient = SUBJECT_COLORS[subject.name] || 'from-purple-500 to-pink-600';

                        return (
                            <button
                                key={subject.id}
                                onClick={() => onSelectSubject(subject)}
                                className={`group relative w-full p-5 md:p-7 rounded-2xl md:rounded-3xl glass-panel border-2 ${isDark ? 'border-white/10 hover:border-white/20' : 'border-black/5 hover:border-black/10'} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                {/* Gradient Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl md:rounded-3xl transition-opacity`} />

                                <div className="flex items-center gap-4 md:gap-6" dir="rtl">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-7 h-7 md:w-10 md:h-10 text-white" />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 text-right">
                                        <h3 className={`text-xl md:text-2xl font-black ${textColor} mb-1`}>
                                            {subject.name_ar}
                                        </h3>
                                        <p className={`text-xs md:text-sm ${subTextColor}`}>
                                            {subject.name}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className={`w-5 h-5 md:w-6 md:h-6 ${subTextColor} group-hover:translate-x-1 transition-transform rotate-180`} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className={`mt-6 w-full py-3 rounded-xl ${isDark ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-200/50 hover:bg-slate-300/50'} ${textColor} font-bold transition-colors`}
                    >
                        رجوع
                    </button>
                )}
            </div>
        </div>
    );
};

export default SubjectSelectScreen;
