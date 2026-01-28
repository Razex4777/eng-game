import React from 'react';
import { triggerHaptic } from '../utils/haptic';

/**
 * TactileButton - A button with tactile feedback and 3D effect
 */
const TactileButton = ({
    children,
    onClick,
    className = '',
    colorClass = '',
    borderClass = '',
    shadowColor = '',
    disabled = false,
    activeScale = true
}) => {
    return (
        <button
            disabled={disabled}
            onClick={(e) => { triggerHaptic(); if (onClick) onClick(e); }}
            className={`
        relative group transition-all duration-150 ease-out
        border-2 border-b-[6px] 
        ${activeScale ? 'active:border-b-2 active:translate-y-[4px] active:scale-[0.98]' : ''}
        rounded-[20px] flex items-center justify-center
        ${disabled ? 'opacity-80 pointer-events-none' : ''}
        ${className}
        ${colorClass}
        ${borderClass}
        ${shadowColor}
        shadow-sm
      `}
        >
            {children}
        </button>
    );
};

export default TactileButton;
