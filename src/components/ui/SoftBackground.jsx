import React from 'react';

const SoftBackground = ({ isDarkMode }) => (
    <div className={`fixed inset-0 -z-10 transition-colors duration-500 ${isDarkMode ? 'bg-[#1E1B2E]' : 'bg-[#FFFBF5]'}`}>
        <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[60px] opacity-15 mix-blend-multiply animate-float-slow ${isDarkMode ? 'bg-purple-900' : 'bg-[#FFE4E6]'}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[60px] opacity-15 mix-blend-multiply animate-float-delayed ${isDarkMode ? 'bg-indigo-900' : 'bg-[#E0F2FE]'}`} />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
);

export default SoftBackground;
