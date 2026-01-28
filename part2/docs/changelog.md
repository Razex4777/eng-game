# Changelog

## 2026-01-28 14:34

### Updated Answer Buttons Design

- **GameScreen.jsx**: Updated answer buttons to match menu button design
  - Added `border-2` for consistent border style
  - Changed active state to `active:border-b-2 active:translate-y-[4px] active:scale-[0.98]`
  - Removed `shadow-xl` to match menu buttons
  - Updated container background opacity for better visibility

---

## 2026-01-28 14:31

### Fixed Light/Dark Mode Background

- **App.jsx**: Fixed background to properly switch between light and dark modes
  - Light mode: `bg-sky-50` with white-to-slate gradient
  - Dark mode: `bg-[#0A0A1A]` with dark gradient (unchanged)
- Previously light mode showed dark background with 80% opacity

---

## 2026-01-28 13:51

### UI/UX: Restored Original Design (Client Request)

- **Reverted to Original Design**: Restored the original tactile button design from `code.txt` per client request
- **Updated Components**:
  - `MenuScreen.jsx` - Yellow game controller icon, green play button, simplified rules list
  - `PauseMenuModal.jsx` - Tactile buttons, yellow "استئناف اللعب" button, speed mode dropdown
  - `GameScreen.jsx` - Streak counter bottom-left, combo fire bottom-right, glassmorphism answer buttons
  - `ResultsScreen.jsx` - Tactile button styling, proper animations
  - `FeedbackOverlay.jsx` - Pop-in animation, rotated cards
  - `LoginScreen.jsx` - Simplified design, removed blue/purple gradients
- **Removed Lottie Animations**:
  - Removed Lottie player script from `index.html`
  - Replaced Lottie animations with emoji icons (🎮)
  - Removed `dotlottie-player` from `MenuScreen.jsx` and `LoginScreen.jsx`
- **Color Scheme Changes**:
  - Removed blue/indigo dominant colors
  - Restored yellow, emerald, slate color palette
  - Tactile button borders (border-b-[6px], active:border-b-0)
- **Animations Restored**:
  - `animate-popIn` - Pop-in effect
  - `animate-shakeQ` - Question shake
  - `animate-fire` - Combo fire animation
  - `goldenPulse` - Golden question glow
  - `spinProjectile` - Flying button animation

---

## 2026-01-28 14:15

### Stage Locking & Progress Tracking

- **Database**: Added `user_progress` table with RLS policies to track completed stages, stars, and best scores
- **Stage Locking Logic**:
  - **Chapters_Review**: Part 1 of each chapter is unlocked. Complete Part 1 → unlock Part 2, etc.
  - **FullYear/HalfYear**: Sequential progression - must complete stage N to unlock stage N+1
- **StageSelectScreen**: Updated to show locked/unlocked stages with visual indicators (lock icon, opacity)
- **Progress Saving**: Automatically saves progress when stage is completed or game ends
- **Star System**: 3 stars (90%+), 2 stars (70%+), 1 star (50%+), 0 stars (below 50%)
- **Fixed nextQuestion**: No longer loops infinitely - game ends when all questions answered

---

## 2026-01-27 10:19

### Stage Navigation System & Supabase Integration

- **Database Schema**: Created `subjects`, `categories`, `stages`, `questions` tables with RLS policies
- **Data Import**: Imported 92 stages and 2,083 questions from Excel files via `scripts/import-excel.js`
- **New Screens**:
  - `SubjectSelectScreen.jsx` - Subject selection (Biology, English)
  - `CategorySelectScreen.jsx` - Category selection (Chapters Review, Full Year, Half Year)
  - `StageSelectScreen.jsx` - Stage selection with chapter grouping
- **Navigation Flow**: Menu → Subject → Category → Stage → Play (questions from Supabase)
- **App.jsx Updates**: Added navigation state, loading from Supabase, back navigation handlers

---

## 2026-01-26 01:20


### UI/UX: Aggressive Responsive Downsizing

- **Downsized HUD & Game UI**: Reduced overall size of HUD elements, question cards, and power-up buttons for better fit on small resolutions.
- **Answer Buttons Optimization**: Refined the 2x2 grid to scale down effectively with reduced font sizes and padding.
- **Menu & Results Scaling**: Shrinked Lottie animations and text elements in Menu and Results screens to prevent them from feeling "too large" on mobile.
- **Consolidated CSS Animations**: Cleaned up `index.css` by removing duplicate keyframes and ensuring center-neutrality for all transforms.
- **Refined Feedback & Modals**: Downsized FeedbackOverlay and PauseMenuModal for a more compact experience.

---

### Major Refactoring: Modular Component Architecture

- **Refactored `App.jsx`**: Reduced from 1066 lines to ~490 lines by extracting components
- **Created custom hooks**:
  - `useAudio`: Audio context management, sound playback
  - `useFullscreen`: Fullscreen API handling
- **Extracted UI components** to `src/components/`:
  - `GameScreen.jsx`: Main game UI with header, falling question, powerups, answer buttons
  - `MenuScreen.jsx`: Start screen with animated background and game rules
  - `ResultsScreen.jsx`: Game over screen with score, stats, and error review
  - `PauseMenuModal.jsx`: Pause menu with speed, sound, dark mode settings
  - `FeedbackOverlay.jsx`: Correct/wrong answer feedback modal
  - `GameEffects.jsx`: ParticleSystem, ScorePopup, StreakDisplay, ComboDisplay
  - `TactileButton.jsx`: Reusable button with 3D press effect
- **Extracted game data** to `src/data/gameData.js`:
  - MESSAGES: Feedback messages for correct/wrong answers
  - QUESTIONS: Quiz questions with explanations
  - SPEED_MODES: Baby/Teen/Beast speed configurations
  - GAME_RULES: Game rules for menu display
  - GAME_CONSTANTS: Initial lives, points, multipliers, durations
- **Extracted utilities** to `src/utils/haptic.js`:
  - `triggerHaptic`: Device vibration feedback function
- **Updated documentation**: Refreshed project_structure.md with new file tree

---

## 2026-01-26 23:40

- **Initial project setup**: Separated `code.txt` into proper React project structure
- Created `package.json` with Vite, React, TailwindCSS, and lucide-react dependencies
- Created `vite.config.js` for Vite bundler configuration
- Created `tailwind.config.js` for TailwindCSS with dark mode class strategy
- Created `postcss.config.js` for PostCSS plugins
- Created `index.html` with RTL support for Arabic UI and SEO meta tags
- Created `src/main.jsx` as React entry point
- Created `src/index.css` with TailwindCSS directives and all game animations
- Created `src/App.jsx` with complete game logic including:
  - TactileButton component with haptic feedback
  - PauseMenuModal component with speed settings
  - Game states: menu, playing, paused, results
  - Combo/Streak system with multipliers
  - Freeze and Bomb powerups
  - Particle effects and score popups
  - Audio system with Web Audio API
  - 10 lives infinite mode gameplay
- Created documentation files in `docs/` directory

