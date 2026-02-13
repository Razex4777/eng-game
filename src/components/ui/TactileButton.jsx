import React from 'react';
import { triggerHaptic } from '../../utils/haptics';

export const TactileButton = ({
    children,
    onClick,
    className = "",
    colorClass = "",
    borderClass = "",
    shadowColor = "",
    isDarkMode,
    disabled,
    activeScale = true,
    type = "button",
    style,
    id,
    variant,
    size
}) => {
    // Map variant to styling
    const variantStyles = {
        success: {
            color: 'bg-emerald-500',
            border: 'border-emerald-600',
            shadow: 'shadow-emerald-700/50'
        },
        ghost: {
            color: 'bg-slate-100 dark:bg-slate-700',
            border: 'border-slate-200 dark:border-slate-600',
            shadow: ''
        },
        primary: {
            color: colorClass,
            border: borderClass,
            shadow: shadowColor
        }
    };

    const currentVariant = variantStyles[variant] || variantStyles.primary;
    const finalColor = currentVariant.color;
    const finalBorder = currentVariant.border;
    const finalShadow = currentVariant.shadow;

    const sizeClasses = size === 'lg' ? 'py-4 px-8' : '';

    return (
        <button
            id={id}
            type={type}
            disabled={disabled}
            onClick={(e) => { if (!disabled) { triggerHaptic(); if (onClick) onClick(e); } }}
            onTouchEnd={(e) => { if (!disabled) { e.preventDefault(); triggerHaptic(); if (onClick) onClick(e); } }}
            style={style}
            className={`
        relative group transition-all duration-150 ease-out
        border-2 border-b-[6px] 
        ${activeScale && !disabled ? 'active:border-b-2 active:translate-y-[4px] active:scale-[0.98]' : ''}
        rounded-[20px] flex items-center justify-center
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed border-b-2 translate-y-[2px]' : ''}
        ${className}
        ${finalColor}
        ${finalBorder}
        ${finalShadow}
        ${sizeClasses}
        shadow-sm
        touch-manipulation
      `}
        >
            {children}
        </button>
    );
};

export default TactileButton;
