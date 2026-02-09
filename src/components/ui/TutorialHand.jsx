import React from 'react';
import { MousePointer2 } from 'lucide-react';

const TutorialHand = ({ text = "اضغط هنا", direction = "left" }) => (
    <div className={`absolute z-50 pointer-events-none animate-pulse-ring
    ${direction === 'left' ? 'top-1/2 -right-6 -translate-y-1/2' : 'top-1/2 -left-6 -translate-y-1/2'}
  `}>
        <div className={`relative flex items-center ${direction === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4 border-yellow-400 z-10
            ${direction === 'left' ? 'rotate-[-90deg]' : 'rotate-[90deg]'}
        `}>
                <MousePointer2 className="w-6 h-6 text-yellow-600 fill-yellow-600 animate-bounce" />
            </div>
            <span className={`bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-xl shadow-lg whitespace-nowrap border-2 border-yellow-100 absolute top-1/2 -translate-y-1/2
            ${direction === 'left' ? 'right-10' : 'left-10'}
        `}>
                {text}
            </span>
        </div>
    </div>
);

export default TutorialHand;
