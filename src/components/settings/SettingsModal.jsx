import React, { useState, useEffect } from 'react';
import { X, User, Camera, ChevronDown, BookOpen, Dna, Check, Loader2 } from 'lucide-react';
import TactileButton from '../ui/TactileButton';
import { supabase } from '../../lib/supabase';

/**
 * SettingsModal Component
 * Allows users to update their profile: avatar, name, age, gender, region, preferred subject
 */

// Iraqi governorates
const GOVERNORATES = [
    'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء',
    'الأنبار', 'ديالى', 'كركوك', 'صلاح الدين', 'بابل', 'واسط',
    'ذي قار', 'المثنى', 'القادسية', 'ميسان', 'دهوك', 'السليمانية'
];

const AGE_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 15); // 15-28

const SettingsModal = ({
    isOpen,
    onClose,
    isDarkMode,
    user,
    onProfileUpdate,
    showToast
}) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        age: null,
        gender: '',
        region: '',
        avatar_url: '',
        preferred_subject: 'english'
    });
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Load user data when modal opens
    useEffect(() => {
        if (isOpen && user?.auth_id) {
            loadUserProfile();
        }
    }, [isOpen, user]);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('full_name, age, gender, region, avatar_url, preferred_subject')
                .eq('auth_id', user.auth_id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    age: data.age || null,
                    gender: data.gender || '',
                    region: data.region || '',
                    avatar_url: data.avatar_url || '',
                    preferred_subject: data.preferred_subject || 'english'
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showToast?.('فشل تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Pending avatar file to upload on save
    const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewAvatarUrl) {
                URL.revokeObjectURL(previewAvatarUrl);
            }
        };
    }, [previewAvatarUrl]);

    // Reset pending avatar when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPendingAvatarFile(null);
            if (previewAvatarUrl) {
                URL.revokeObjectURL(previewAvatarUrl);
                setPreviewAvatarUrl(null);
            }
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!formData.full_name.trim()) {
            showToast?.('الاسم مطلوب', 'error');
            return;
        }

        setSaving(true);
        try {
            let finalAvatarUrl = formData.avatar_url;

            // Upload pending avatar if exists
            if (pendingAvatarFile) {
                const fileExt = pendingAvatarFile.name.split('.').pop();
                const fileName = `${user.auth_id}/${Date.now()}.${fileExt}`;

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, pendingAvatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                finalAvatarUrl = publicUrl;
            }

            // Update user profile
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: formData.full_name.trim(),
                    age: formData.age,
                    gender: formData.gender,
                    region: formData.region,
                    preferred_subject: formData.preferred_subject,
                    avatar_url: finalAvatarUrl
                })
                .eq('auth_id', user.auth_id);

            if (error) throw error;

            // Clear pending avatar
            setPendingAvatarFile(null);
            if (previewAvatarUrl) {
                URL.revokeObjectURL(previewAvatarUrl);
                setPreviewAvatarUrl(null);
            }

            showToast?.('تم حفظ التغييرات بنجاح ✓', 'success');
            onProfileUpdate?.({ ...formData, avatar_url: finalAvatarUrl });
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            showToast?.('فشل حفظ التغييرات', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            showToast?.('الرجاء اختيار صورة فقط', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast?.('حجم الصورة كبير جداً (الحد الأقصى 2MB)', 'error');
            return;
        }

        // Store file for later upload
        setPendingAvatarFile(file);

        // Create preview URL
        if (previewAvatarUrl) {
            URL.revokeObjectURL(previewAvatarUrl);
        }
        const objectUrl = URL.createObjectURL(file);
        setPreviewAvatarUrl(objectUrl);
    };

    if (!isOpen) return null;

    const bgColor = isDarkMode ? 'bg-slate-900' : 'bg-white';
    const textColor = isDarkMode ? 'text-white' : 'text-slate-800';
    const inputBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
    const dropdownBg = isDarkMode ? 'bg-slate-800' : 'bg-white';

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className={`w-full max-w-md ${bgColor} rounded-3xl shadow-2xl overflow-hidden animate-pop-in`}
                dir="rtl"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-6 pb-16">
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <h2 className="text-2xl font-black text-white text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        الإعدادات
                    </h2>
                </div>

                {/* Avatar Section */}
                <div className="flex justify-center -mt-12 mb-4 relative z-10">
                    <div className="relative">
                        <div className={`w-24 h-24 rounded-full border-4 ${isDarkMode ? 'border-slate-900' : 'border-white'} overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500 shadow-xl`}>
                            {(previewAvatarUrl || formData.avatar_url) ? (
                                <img
                                    src={previewAvatarUrl || formData.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-white/80" />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg">
                            <Camera className="w-4 h-4" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarSelect}
                                disabled={saving}
                            />
                        </label>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-4 md:p-6 pt-2 max-h-[65vh] md:max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className={`block text-xs md:text-sm font-bold mb-1 md:mb-2 ${textColor}`}>
                                    الاسم الكامل
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 ${inputBg} ${textColor} font-bold focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm md:text-base`}
                                    placeholder="أدخل اسمك"
                                />
                            </div>

                            {/* Age & Gender Row */}
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {/* Age Dropdown */}
                                <div className="relative">
                                    <label className={`block text-xs md:text-sm font-bold mb-1 md:mb-2 ${textColor}`}>
                                        العمر
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setActiveDropdown(activeDropdown === 'age' ? null : 'age')}
                                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 ${inputBg} ${textColor} font-bold flex items-center justify-between`}
                                    >
                                        <span className="text-sm md:text-base">{formData.age || 'اختر'}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {activeDropdown === 'age' && (
                                        <div className={`absolute top-full left-0 right-0 mt-1 ${dropdownBg} border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 md:max-h-40 overflow-y-auto`}>
                                            {AGE_OPTIONS.map(age => (
                                                <button
                                                    key={age}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, age }));
                                                        setActiveDropdown(null);
                                                    }}
                                                    className={`w-full px-4 py-2 text-right hover:bg-purple-100 dark:hover:bg-purple-900/30 ${textColor} font-bold ${formData.age === age ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                                                >
                                                    {age}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Gender Dropdown */}
                                <div className="relative">
                                    <label className={`block text-xs md:text-sm font-bold mb-1 md:mb-2 ${textColor}`}>
                                        الجنس
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setActiveDropdown(activeDropdown === 'gender' ? null : 'gender')}
                                        className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 ${inputBg} ${textColor} font-bold flex items-center justify-between`}
                                    >
                                        <span className="text-sm md:text-base">{formData.gender === 'male' ? 'ذكر' : formData.gender === 'female' ? 'أنثى' : 'اختر'}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {activeDropdown === 'gender' && (
                                        <div className={`absolute top-full left-0 right-0 mt-1 ${dropdownBg} border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50`}>
                                            {[{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }].map(option => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, gender: option.value }));
                                                        setActiveDropdown(null);
                                                    }}
                                                    className={`w-full px-4 py-2 text-right hover:bg-purple-100 dark:hover:bg-purple-900/30 ${textColor} font-bold ${formData.gender === option.value ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Region Dropdown */}
                            <div className="relative">
                                <label className={`block text-xs md:text-sm font-bold mb-1 md:mb-2 ${textColor}`}>
                                    المحافظة
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setActiveDropdown(activeDropdown === 'region' ? null : 'region')}
                                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 ${inputBg} ${textColor} font-bold flex items-center justify-between`}
                                >
                                    <span className="text-sm md:text-base">{formData.region || 'اختر المحافظة'}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {activeDropdown === 'region' && (
                                    <div className={`absolute top-full left-0 right-0 mt-1 ${dropdownBg} border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 md:max-h-40 overflow-y-auto`}>
                                        {GOVERNORATES.map(gov => (
                                            <button
                                                key={gov}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, region: gov }));
                                                    setActiveDropdown(null);
                                                }}
                                                className={`w-full px-4 py-2 text-right hover:bg-purple-100 dark:hover:bg-purple-900/30 ${textColor} font-bold ${formData.region === gov ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                                            >
                                                {gov}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Subject Selection */}
                            <div>
                                <label className={`block text-xs md:text-sm font-bold mb-2 md:mb-3 ${textColor}`}>
                                    المادة المفضلة
                                </label>
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                    {/* English */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, preferred_subject: 'english' }))}
                                        className={`relative p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-3 transition-all ${formData.preferred_subject === 'english'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : `border-slate-200 dark:border-slate-700 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`
                                            }`}
                                    >
                                        {formData.preferred_subject === 'english' && (
                                            <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 w-4 md:w-5 h-4 md:h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <Check className="w-2.5 md:w-3 h-2.5 md:h-3 text-white" />
                                            </div>
                                        )}
                                        <BookOpen className={`w-6 md:w-8 mx-auto mb-1 md:mb-2 ${formData.preferred_subject === 'english' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                        <span className={`block font-black text-xs md:text-sm ${formData.preferred_subject === 'english' ? 'text-emerald-600' : textColor}`}>
                                            English
                                        </span>
                                        <span className={`block text-[10px] md:text-xs ${formData.preferred_subject === 'english' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            الانگليزي
                                        </span>
                                    </button>

                                    {/* Biology */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, preferred_subject: 'biology' }))}
                                        className={`relative p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-3 transition-all ${formData.preferred_subject === 'biology'
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : `border-slate-200 dark:border-slate-700 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`
                                            }`}
                                    >
                                        {formData.preferred_subject === 'biology' && (
                                            <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 w-4 md:w-5 h-4 md:h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                <Check className="w-2.5 md:w-3 h-2.5 md:h-3 text-white" />
                                            </div>
                                        )}
                                        <Dna className={`w-8 h-8 mx-auto mb-2 ${formData.preferred_subject === 'biology' ? 'text-purple-600' : 'text-slate-400'}`} />
                                        <span className={`block font-black text-sm ${formData.preferred_subject === 'biology' ? 'text-purple-600' : textColor}`}>
                                            Biology
                                        </span>
                                        <span className={`block text-xs ${formData.preferred_subject === 'biology' ? 'text-purple-500' : 'text-slate-400'}`}>
                                            الأحياء
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-0">
                    <TactileButton
                        onClick={handleSave}
                        disabled={saving || loading}
                        variant="success"
                        size="lg"
                        className="w-full"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <span className="font-black text-lg text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                حفظ التغييرات
                            </span>
                        )}
                    </TactileButton>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
