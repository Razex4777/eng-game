import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, User, Moon, Maximize, LogOut } from 'lucide-react';

/**
 * Subject options available in the app
 */
const SUBJECTS = [
    { id: 'english', label: 'English', badge: 'EN' },
    { id: 'biology', label: 'الأحياء', icon: '⚗' }
];

/**
 * TopNav Component
 * Full-width top bar pinned to viewport edges:
 * - Screen LEFT: Subject selector dropdown
 * - Screen RIGHT: Profile icon with settings dropdown
 * 
 * Uses physical left/right positioning (not logical) so it works
 * correctly regardless of RTL/LTR direction.
 */
const TopNav = ({
    isDarkMode = false,
    currentSubject = 'english',
    userName,
    isGuest = false,
    onDarkModeToggle,
    onFullscreenToggle,
    onSubjectChange,
    onLogout
}) => {
    const [subjectOpen, setSubjectOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const subjectRef = useRef(null);
    const profileRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (subjectRef.current && !subjectRef.current.contains(e.target)) {
                setSubjectOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeSubject = SUBJECTS.find(s => s.id === currentSubject) || SUBJECTS[0];

    return (
        <div className="w-full mb-4 relative" style={{ minHeight: '52px' }}>
            {/* ─── Screen LEFT: Subject Selector ─── */}
            <div
                ref={subjectRef}
                className="absolute top-0"
                style={{ left: 0 }}
            >
                <button
                    onClick={() => { setSubjectOpen(!subjectOpen); setProfileOpen(false); }}
                    className={`
                        flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-base transition-all
                        ${isDarkMode
                            ? 'bg-slate-800/80 text-white border border-slate-700 hover:bg-slate-700/80'
                            : 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:shadow-md'}
                        ${subjectOpen ? (isDarkMode ? 'ring-2 ring-purple-500' : 'ring-2 ring-purple-400') : ''}
                    `}
                >
                    <ChevronLeft className={`w-4.5 h-4.5 transition-transform duration-200 ${subjectOpen ? '-rotate-90' : ''}`} />
                    <span>{activeSubject.label}</span>
                    {activeSubject.badge && (
                        <span className={`
                            text-[11px] font-black px-2 py-0.5 rounded-md
                            ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}
                        `}>
                            {activeSubject.badge}
                        </span>
                    )}
                    {activeSubject.icon && <span className="text-lg">{activeSubject.icon}</span>}
                </button>

                {/* Subject Dropdown */}
                {subjectOpen && (
                    <div className={`
                        absolute top-full mt-2 w-56 rounded-2xl border-2 border-b-4 shadow-xl z-50
                        overflow-hidden animate-fade-in-up
                        ${isDarkMode ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-slate-200'}
                    `}
                        style={{ left: 0 }}
                    >
                        {SUBJECTS.map((subject) => (
                            <button
                                key={subject.id}
                                onClick={() => {
                                    onSubjectChange?.(subject.id);
                                    setSubjectOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-colors
                                    ${currentSubject === subject.id
                                        ? (isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-50 text-purple-700')
                                        : (isDarkMode ? 'text-white hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50')
                                    }
                                `}
                            >
                                {subject.icon && <span className="text-lg">{subject.icon}</span>}
                                <span>{subject.label}</span>
                                {subject.badge && (
                                    <span className={`
                                        text-[10px] font-black px-1.5 py-0.5 rounded ml-auto
                                        ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}
                                    `}>
                                        {subject.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Screen RIGHT: Profile Menu ─── */}
            <div
                ref={profileRef}
                className="absolute top-0"
                style={{ right: 0 }}
            >
                <button
                    onClick={() => { setProfileOpen(!profileOpen); setSubjectOpen(false); }}
                    className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                        ${isDarkMode
                            ? 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80'
                            : 'bg-white text-slate-500 border border-slate-200 shadow-sm hover:shadow-md'}
                        ${profileOpen ? (isDarkMode ? 'ring-2 ring-purple-500' : 'ring-2 ring-purple-400') : ''}
                    `}
                >
                    <User className="w-6 h-6" />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                    <div className={`
                        absolute top-full mt-2 w-60 rounded-2xl border-2 border-b-4 shadow-xl z-50
                        overflow-hidden animate-fade-in-up
                        ${isDarkMode ? 'bg-[#2A2640] border-[#3E3859]' : 'bg-white border-slate-200'}
                    `}
                        style={{ right: 0 }}
                    >
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => onDarkModeToggle?.()}
                            className={`
                                w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-colors
                                ${isDarkMode ? 'text-white hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50'}
                            `}
                        >
                            <Moon className="w-5 h-5" />
                            <span>الوضع الليلي</span>
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={() => onFullscreenToggle?.()}
                            className={`
                                w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-colors
                                ${isDarkMode ? 'text-white hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50'}
                            `}
                        >
                            <Maximize className="w-5 h-5" />
                            <span>ملء الشاشة</span>
                        </button>

                        {/* Divider */}
                        <div className={`mx-4 ${isDarkMode ? 'border-t border-slate-700' : 'border-t border-slate-100'}`} />

                        {/* Logout */}
                        <button
                            onClick={() => {
                                onLogout?.();
                                setProfileOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-5 py-4 text-sm font-bold
                                text-red-500 transition-colors
                                ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}
                            `}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopNav;
