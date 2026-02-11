import React from 'react';

const ToastNotification = ({ message, icon: Icon, isVisible, type = 'info' }) => {
    return (
        <div
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[150] transition-all duration-500 w-[90%] max-w-sm
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}
      `}
            style={{ transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' }}
        >
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border-b-4 backdrop-blur-md justify-center text-center relative overflow-hidden
        ${type === 'fire' ? 'bg-orange-500 border-orange-700 text-white' :
                    type === 'love' ? 'bg-rose-500 border-rose-700 text-white' :
                        type === 'info' ? 'bg-blue-600 border-blue-800 text-white' :
                            'bg-slate-800 border-slate-950 text-white'}
      `}>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10"></div>
                {Icon && <Icon className={`w-6 h-6 shrink-0 ${type === 'love' ? 'animate-pulse' : 'animate-bounce'}`} />}
                <span className="font-bold text-sm leading-snug">{message}</span>
            </div>
        </div>
    );
};

export default ToastNotification;
