import React, { useState } from 'react';
import { CheckCircle2, Star, Check, MessageCircle, Send, LogIn, UserX } from 'lucide-react';
import TactileButton from '../components/ui/TactileButton';

// LoginView
const LoginView = ({ isDarkMode, onLoginSuccess, onGoogleSignIn, onGuestLogin, initialData }) => {
    const [step, setStep] = useState(() => {
        // If we have initialData (Partially logged in via Supabase), jump to appropriate step
        if (initialData) {
            if (!initialData.name) return 1;
            if (!initialData.age || !initialData.gender) return 2;
            if (!initialData.governorate) return 3;
            return 1; // Fallback
        }
        return 0;
    });
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        age: initialData?.age || '',
        gender: initialData?.gender || '',
        governorate: initialData?.governorate || ''
    });
    const governorates = ["بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "كركوك", "الأنبار", "ديالى", "ذي قار", "بابل", "واسط", "ميسان", "القادسية", "المثنى", "صلاح الدين", "دهوك", "السليمانية"];
    const ages = Array.from({ length: 14 }, (_, i) => 15 + i);

    const handleGoogleLogin = () => {
        if (onGoogleSignIn) {
            onGoogleSignIn();
        } else {
            // Fallback for local-only mode
            if (localStorage.getItem('user_registered') === 'true') {
                const savedName = localStorage.getItem('user_name') || 'البطل';
                onLoginSuccess({ name: savedName }, false);
            } else {
                setStep(1);
            }
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNextStep = () => {
        if (step === 1 && !formData.name.trim()) return alert("شنو اسمك يا بطل؟");
        if (step === 2 && (!formData.age || !formData.gender)) return alert("المعلومات ناقصة!");
        if (step === 3 && !formData.governorate) return alert("من أي محافظة؟");

        if (step === 3) {
            localStorage.setItem('user_registered', 'true');
            localStorage.setItem('user_name', formData.name);
            onLoginSuccess(formData, false);
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBackStep = () => setStep(prev => prev - 1);
    const inputClasses = `w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold outline-none focus:border-yellow-400 transition-all text-center shadow-sm`;

    const StepsProgressBar = () => (
        <div className="flex items-center justify-between mb-8 px-4 w-full relative">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 transition-all duration-500 ${step >= s ? 'bg-yellow-400 border-yellow-200 text-yellow-900 scale-110 shadow-lg' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'}`}>
                        {step > s ? <Check className="w-5 h-5" /> : s}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 ${step >= s ? 'text-yellow-600' : 'text-slate-400'}`}>
                        {s === 1 ? 'الاسم' : s === 2 ? 'شخصي' : 'المكان'}
                    </span>
                </div>
            ))}
            <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0"></div>
            <div className="absolute top-5 left-8 h-1 bg-yellow-400 transition-all duration-500 ease-out -z-0" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '85%' }}></div>
        </div>
    );

    return (
        <div className="min-h-full flex flex-col items-center justify-center px-5 py-10 w-full">
            <div className={`text-center mb-8 relative z-10 transition-all duration-500 ${step > 0 ? 'scale-75 mb-2' : ''}`}>
                <div className="w-24 h-24 mx-auto bg-yellow-400 rounded-[2rem] rotate-[-3deg] flex items-center justify-center shadow-xl border-b-8 border-yellow-600 mb-4 relative group hover:rotate-0 transition-transform duration-300">
                    <CheckCircle2 className="w-12 h-12 text-white drop-shadow-md" strokeWidth={3} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-yellow-200 animate-bounce">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                </div>
                <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>ختمتها<span className="text-yellow-500">.</span></h1>
                <p className={`text-xs md:text-sm font-bold opacity-60 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>الطريق الأمتع للـ 100</p>
            </div>

            <div className={`w-full max-w-sm relative z-20`}>
                {step > 0 && <StepsProgressBar />}
                {step === 0 && (
                    <div className="animate-fade-in-up">
                        <div className={`p-6 rounded-[32px] border-2 shadow-2xl backdrop-blur-lg mb-6 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-white'}`}>
                            <TactileButton onClick={handleGoogleLogin} className="w-full p-4 rounded-2xl flex items-center justify-center gap-3 mb-3" colorClass="bg-white" borderClass="border-slate-200">
                                <div className="w-6 h-6 shrink-0 mr-3">
                                    <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                </div>
                                <span className="font-bold text-slate-700">دخول سريع عبر Google</span>
                            </TactileButton>

                            <TactileButton
                                onClick={onGuestLogin}
                                className="w-full p-4 rounded-2xl flex items-center justify-center gap-3"
                                colorClass={isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}
                                borderClass={isDarkMode ? 'border-slate-600' : 'border-slate-300'}
                            >
                                <UserX className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                                <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>التسجيل كضيف</span>
                            </TactileButton>
                        </div>

                        {/* استرجاع أزرار المجتمع والدعم */}
                        <div className="flex gap-3 mb-4">
                            <TactileButton
                                className="flex-1 p-3 rounded-xl gap-2"
                                colorClass="bg-[#229ED9]"
                                borderClass="border-[#1A7DB0]"
                                onClick={() => window.open('https://t.me/khtmtha', '_blank')}
                            >
                                <Send className="w-4 h-4 text-white -rotate-45" />
                                <span className="font-bold text-white text-xs">مجتمع الطلاب</span>
                            </TactileButton>

                            <TactileButton
                                className="flex-1 p-3 rounded-xl gap-2"
                                colorClass="bg-[#25D366]"
                                borderClass="border-[#1da851]"
                                onClick={() => window.open('https://wa.me/message/AQBNBH24LYHJO1', '_blank')}
                            >
                                <MessageCircle className="w-4 h-4 text-white" />
                                <span className="font-bold text-white text-xs">واجهت مشكلة؟</span>
                            </TactileButton>
                        </div>
                    </div>
                )}
                {step > 0 && (
                    <div className="animate-slide-up bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 shadow-xl relative">
                        {step === 1 && <><h3 className={`text-xl font-black text-center mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>أهلاً! شنو اسمك؟ 👋</h3><input type="text" name="name" placeholder="الاسم الكامل" value={formData.name} onChange={handleInputChange} className={inputClasses} autoFocus /></>}
                        {step === 2 && <><h3 className={`text-xl font-black text-center mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>معلوماتك الشخصية 👤</h3><div className="flex gap-3"><select name="age" value={formData.age} onChange={handleInputChange} className={`${inputClasses} flex-[0.6] appearance-none cursor-pointer`}><option value="">العمر</option>{ages.map(age => <option key={age} value={age}>{age}</option>)}</select><select name="gender" value={formData.gender} onChange={handleInputChange} className={`${inputClasses} flex-1 appearance-none cursor-pointer`}><option value="">الجنس</option><option value="male">ذكر 🙋‍♂️</option><option value="female">أنثى 🙋‍♀️</option></select></div></>}
                        {step === 3 && <><h3 className={`text-xl font-black text-center mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>من أي محافظة؟</h3><select name="governorate" value={formData.governorate} onChange={handleInputChange} className={`${inputClasses} appearance-none cursor-pointer`}><option value="">اختر المحافظة</option>{governorates.map(g => <option key={g} value={g}>{g}</option>)}</select></>}
                        <div className="flex gap-3 mt-6"><button onClick={handleBackStep} className="flex-[0.3] p-4 rounded-xl font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">رجوع</button><TactileButton onClick={handleNextStep} className="flex-1 p-4 rounded-xl" colorClass="bg-yellow-400" borderClass="border-yellow-600"><span className="font-black text-yellow-900 text-lg">{step === 3 ? 'انطلق! 🚀' : 'التالي'}</span></TactileButton></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginView;
