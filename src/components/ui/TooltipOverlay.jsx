import React from 'react';
import { Info } from 'lucide-react';

const TooltipOverlay = ({ title, text, onClose, targetRef }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#2A2640] p-6 rounded-[2rem] max-w-sm w-full shadow-2xl border-4 border-yellow-400 relative animate-pop-in"
                onClick={(e) => e.stopPropagation()} // Prevent closing if clicking inside
            >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white dark:border-[#2A2640]">
                    <Info className="w-7 h-7 text-yellow-900" />
                </div>
                <div className="mt-4 text-center">
                    <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-white">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 font-bold text-sm leading-relaxed mb-6">
                        {text}
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition-transform w-full"
                    >
                        فهمت عليك! 👍
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TooltipOverlay;
