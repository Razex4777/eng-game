import React, { forwardRef } from 'react';
import { triggerHaptic } from '../../utils/haptics';

/**
 * AnswerButtons Component
 * Grid of answer option buttons with glassmorphism container
 * Features: Disabled states, flying animation support, tactile feedback
 */
const AnswerButtons = forwardRef(({
    options = [],
    onAnswer,
    disabledOptions = [],
    disabled = false,
    flyingButtonIndex = null,
    isDark = false
}, ref) => {

    const getButtonClasses = (option, index) => {
        const isDisabled = disabledOptions.includes(option);
        const isFlying = flyingButtonIndex === index;

        const baseClasses = `
      relative py-3 md:py-5 px-2 md:px-3 rounded-xl md:rounded-2xl font-black text-base md:text-lg tracking-wide 
      transition-all duration-150 border-b-[4px] md:border-b-[6px]
      active:border-b-0 active:translate-y-[2px] md:active:translate-y-[4px]
      hover:scale-[1.02] hover:-translate-y-[1px] md:hover:-translate-y-[2px]
      shadow-lg md:shadow-xl
    `;

        if (isFlying) {
            return `${baseClasses} opacity-0`;
        }

        if (isDisabled) {
            return `${baseClasses} opacity-30 grayscale pointer-events-none scale-90`;
        }

        return `${baseClasses} ${isDark
            ? 'bg-slate-700 text-white border-slate-900 shadow-slate-900/50 hover:bg-slate-600'
            : 'bg-white text-slate-800 border-slate-300 shadow-slate-200 hover:bg-slate-50'
            }`;
    };

    return (
        <div
            className="grid grid-cols-2 gap-2 md:gap-3 px-2 md:px-4 pb-4 md:pb-8"
            ref={ref}
        >
            {options.map((option, index) => {
                const isDisabled = disabledOptions.includes(option) || disabled;

                return (
                    <button
                        key={index}
                        onClick={() => { if (!isDisabled) { triggerHaptic(); onAnswer?.(option, index); } }}
                        disabled={isDisabled}
                        className={getButtonClasses(option, index)}
                        data-option-index={index}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
});

AnswerButtons.displayName = 'AnswerButtons';

/**
 * FlyingButton Component
 * Animated button that flies from answer to question
 */
export const FlyingButton = ({
    text,
    correct,
    startPosition,
    targetPosition
}) => {
    if (!startPosition || !targetPosition) return null;

    const translateX = targetPosition.x - startPosition.x;
    const translateY = targetPosition.y - startPosition.y;

    return (
        <div
            className={`
        fixed z-[300] rounded-2xl font-black text-lg 
        flex items-center justify-center border-4
        ${correct
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-rose-500 text-white border-rose-600'
                }
      `}
            style={{
                left: startPosition.x,
                top: startPosition.y,
                width: startPosition.width,
                height: startPosition.height,
                '--ty': `${translateY}px`,
                animation: 'spinProjectile 0.35s ease-in forwards',
                boxShadow: '0 0 40px rgba(0,0,0,0.3)'
            }}
        >
            {text}
        </div>
    );
};

export default AnswerButtons;
