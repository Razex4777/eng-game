import React from 'react';
import { User } from 'lucide-react';
import TactileButton from '../ui/TactileButton';

// Premium 3D icons
import themeIcon from '../../assets/icons/theme_icon.png';
import audioIcon from '../../assets/icons/audio_icon.png';
import settingsIcon from '../../assets/icons/settings_icon.png';

/**
 * TopNav Component
 * Top navigation bar with settings and user controls
 */
const TopNav = ({
    isDarkMode = false,
    isMuted = false,
    isGuest = false,
    userName,
    userAvatar,
    onDarkModeToggle,
    onMuteToggle,
    onSettingsClick,
    onLoginClick,
    onLogout
}) => {
    return (
        <div className="flex items-center justify-between w-full mb-4 px-1">
            {/* Left side - User Info/Login */}
            <div className="flex items-center gap-2">
                {isGuest ? (
                    <TactileButton
                        onClick={onLoginClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl"
                        colorClass={isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'}
                        borderClass={isDarkMode ? 'border-yellow-600' : 'border-yellow-500'}
                    >
                        <User className="w-4 h-4 text-yellow-900" />
                        <span className="text-xs font-black text-yellow-900">تسجيل</span>
                    </TactileButton>
                ) : (
                    <div className={`
            flex items-center gap-2 px-4 py-2 rounded-xl 
            ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}
          `}>
                        <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden
              ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'}
            `}>
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ display: userAvatar ? 'none' : 'flex' }}
                            >
                                <span className="text-white font-black text-sm">
                                    {userName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                أهلاً، {userName || 'البطل'}!
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Premium ⭐</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right side - Controls with Premium 3D Icons */}
            <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <TactileButton
                    onClick={onDarkModeToggle}
                    className="w-10 h-10 rounded-xl p-1.5"
                    colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                    borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}
                >
                    <img
                        src={themeIcon}
                        alt="Theme"
                        className={`w-full h-full object-contain transition-transform duration-300 ${isDarkMode ? 'rotate-180' : ''}`}
                    />
                </TactileButton>

                {/* Mute Toggle */}
                <TactileButton
                    onClick={onMuteToggle}
                    className="w-10 h-10 rounded-xl p-1.5"
                    colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                    borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}
                >
                    <img
                        src={audioIcon}
                        alt="Audio"
                        className={`w-full h-full object-contain transition-opacity duration-300 ${isMuted ? 'opacity-40 grayscale' : ''}`}
                    />
                </TactileButton>

                {/* Settings */}
                {!isGuest && (
                    <TactileButton
                        onClick={onSettingsClick}
                        className="w-10 h-10 rounded-xl p-1.5"
                        colorClass={isDarkMode ? 'bg-slate-800' : 'bg-white'}
                        borderClass={isDarkMode ? 'border-slate-700' : 'border-slate-200'}
                    >
                        <img
                            src={settingsIcon}
                            alt="Settings"
                            className="w-full h-full object-contain hover:rotate-45 transition-transform duration-300"
                        />
                    </TactileButton>
                )}
            </div>
        </div>
    );
};

export default TopNav;
