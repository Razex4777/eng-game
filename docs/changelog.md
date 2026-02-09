# Changelog

# 2026-02-01 19:30
- **📚 Chapters & Reviews Service (chaptersService.js)**:
  - Created comprehensive service for handling Chapters/Levels/Reviews:
    - Maps UI chapters (1-8) to database parts dynamically
    - Fetches structure from `english_chapters`, `biology_chapters`, etc.
    - `fetchQuestionsForPart()`: Get questions for a specific part
    - `fetchQuestionsForChapter()`: Get all questions for a chapter
    - `getChaptersStructure()`: Get chapter info with part counts
    - `getReviewsStructure()`: Get halfyear/fullyear parts
    - `getUserChapterProgress()`: Get user's progress from `user_stats`
    - `calculateChapterProgress()`: Calculate completion percentage
    - `updatePartProgress()`: Update progress after completing a part
    - `isChapterUnlocked()`: Check if chapter is available
  - **ChaptersView.jsx**: Now loads real data from Supabase
    - Shows dynamic question counts per chapter
    - Displays user progress with animated progress bars
    - Locks chapters based on user progression
  - **LevelsView.jsx**: Now shows real parts for each chapter
    - Displays completed/unlocked/locked status per part
    - Shows stars earned on completed parts
  - **ReviewsView.jsx**: Now loads halfyear/fullyear parts dynamically
    - Shows part counts and question counts from Supabase
    - Expandable sections for each review type
    - Sequential unlock system for parts
  - **App.jsx Updates**:
    - Added `chapterGameConfig` state for game configuration
    - Enhanced `handleLevelClick` to pass part/type/subject info
    - Added `handleReviewClick` for review navigation
    - Passed `userId` and `subject` props to views

# 2026-02-01 17:40
- **📊 User Progress Tracking System (تابع رحلتك)**:
  - Created 4 new Supabase tables with RLS policies:
    - `user_stats`: XP, levels, streaks, subject progress (JSONB)
    - `user_daily_activity`: Daily tasks, questions, XP per day
    - `game_sessions`: Detailed per-game tracking (score, accuracy, duration)
    - `user_achievements`: Unlockable achievements with XP rewards
  - Created `userProgressService.js` with 18+ functions:
    - Dashboard stats: `getUserDashboardStats`, `initializeUserStats`
    - Game recording: `recordGameSession`, `updateStatsAfterGame`
    - Progress: `getSubjectProgress`, `calculateProgressPercent`
    - Streaks: `checkAndUpdateStreak`
    - Daily: `getTodayActivity`, `completeDailyTask`
    - History: `getRecentGames`, `getBestScores`
    - Achievements: `unlockAchievement`, `getUserAchievements`, `checkAchievements`
    - Helpers: `calculateLevel`, `xpForNextLevel`, `formatPlayTime`
  - Created Postgres functions:
    - `update_user_stats_after_game()`: Updates XP, streak, progress atomically
    - `get_user_dashboard_stats()`: Optimized single-query dashboard data
  - **Integration**:
    - `App.jsx`: Fetches real stats from Supabase (replaces hardcoded values)
    - `GameContainer.jsx`: Records game sessions and updates stats after each game
    - Stats refresh automatically when exiting a game
  - **Stale Closure Fix**:
    - Fixed `wrongAnswers` being empty in `onGameEnd` callback
    - Added refs (`scoreRef`, `wrongAnswersRef`, `correctAnswersRef`) to track latest state

# 2026-02-01 17:03
- **حقيبة الأخطاء (Wrong Answers Inventory)**:
  - Created `wrong_answers_inventory` table in Supabase with RLS policies.
  - Created `wrongAnswersService.js` with CRUD operations:
    - `getWrongAnswers`, `getWrongAnswersCount`, `getWrongAnswersForPart`
    - `addWrongAnswer`, `addWrongAnswersBatch`
    - `clearWrongAnswersForPart` (clears on win), `deleteWrongAnswer`
  - Created `WrongAnswersInventory.jsx` UI component:
    - Floating button with error count badge
    - Modal with grouped view by subject/part
    - Detail view showing question, options, and explanation
    - Delete and review functionality
  - Integrated into `App.jsx` for logged-in users
  - Updated `GameContainer` to save wrong answers on game end
  - Wrong answers auto-clear when user wins the part (no mistakes)
- **Bug Fix**:
  - Fixed `showFeedback` initialization order error using ref pattern

# 2026-02-01 15:10
- **CSS Modular Refactoring**:
  - Split `index.css` (900+ lines) into modular files in `src/styles/` folder.
  - Created: `variables.css`, `base.css`, `keyframes.css`, `animations.css`, `components.css`.
  - Main `index.css` now just imports all modular files.
- **Dropdown Animation Fix**:
  - Fixed `animate-slide-down` which was fading OUT instead of IN.
  - Added new `animate-dropdown-in` animation for proper dropdown visibility.
  - Fixed PauseMenuModal speed dropdown - options now visible when expanded.
- **PauseMenuModal Layout Fix**:
  - Removed `overflow-hidden` that was clipping dropdown content.
  - Added `flex-1 min-h-0` for proper flex scrolling behavior.

# 2026-02-01 14:50
- **Game Settings Supabase Integration**:
  - Created `game_settings` table in Supabase with RLS policies.
  - Created `gameSettingsService.js` with CRUD operations for user settings.
  - Centralized `SPEED_MODES` configuration with multipliers and labels.
  - Updated `PauseMenuModal` to sync settings with Supabase on change.
  - Added 'insane' speed mode (🤯) for hardcore players.
  - `useGameLogic` now uses SPEED_MODES from service for consistency.

# 2026-02-01 14:40
- **UI Layout Fixes**:
  - Moved powerup buttons (freeze/bomb) from `bottom-24` to `bottom-48` - now appear ABOVE answer options.
- **Game Flow Improvements**:
  - Reduced feedback display time from 1500ms to 800ms for faster transitions to next question.
- **Animation Debugging**:
  - Fixed falling question animation by stabilizing useEffect dependencies with refs.
  - Cleaned up debug console.log statements from production code.

# 2026-02-01 13:30
- **App.jsx Modular Refactoring**:
  - Extracted `MonsterChallengeLoader` to `components/game/MonsterChallengeLoader.jsx`.
  - Extracted `HomeView` to `views/HomeView.jsx`.
  - Reduced App.jsx from 793 lines to 546 lines.
  - Fixed QUESTIONS undefined error by removing dead code paths.
  - All game modes now use Supabase data exclusively.

# 2026-02-01 12:08
- **Game Mode Refactoring**:
  - Monster Challenge now exclusively uses `fullyear` type (removed type selection UI).
  - Simplified BattleArenaModal to display fixed "السنة الكاملة" badge.
- **Static Data Migration to Supabase**:
  - Deleted `src/data/` folder (questions.js and messages.js).
  - Created `services/messagesService.js` to fetch encouragement messages from Supabase.
  - Created `utils/helpers.js` with shuffleArray utility.
  - Updated `useGameLogic.js` to use new services.
  - Updated `App.jsx` imports to use new utilities.

# 2026-01-31 20:50
- **Monster Challenge Database Integration**:
  - Created `monsterChallengeService.js` for Supabase question queries.
  - Refactored `BattleArenaModal` to use dynamic database questions.
  - Added subject selection (Biology/English) with type selection (chapters, fullyear, halfyear).
  - Added progress tracking visualization with part-based challenge system.
- **Database Schema Updates**:
  - Added `monster_challenge_progress` JSONB column to users table.
  - Created `update_user_analytics` RPC function for atomic analytics updates.
  - Randomized all answer positions in Biology and English question tables.
- **User Data Enhancement**:
  - Added `auth_id` and `preferred_subject` to userData for Monster Challenge integration.
  - Updated App.jsx to pass proper user context to BattleArenaModal.

# 2026-01-31 19:40
- Created `SettingsModal` component for user profile editing.
- Added `preferred_subject` column to users table (English/Biology selection).
- Integrated settings modal with `App.jsx` - accessible via TopNav settings button.
- Features: avatar upload, name/age/gender/region editing, subject preference.
- Updated project structure documentation.

# 2026-01-29 15:30
- Refined `App.jsx` UI with improved Home view and component integrations.
- Integrated `GameContainer` completely with `useGameLogic`.
- Implemented missing game animations (`hardShake`, `shakeQ`, `fever-mode`) in `index.css`.
- Fixed `FlyingButton` animation name.
- Added `shakeScreen` state to `useGameLogic` for whole-screen feedback.
- Ensured 100% Arabic content accuracy in `messages.js` and UI labels.
- Verified build and component structure.

# 2026-01-29 14:30
- Implemented core game logic and physics engine in `GameContainer.jsx`.
- Created unified game dashboard components: `LevelsView`, `ReviewsView`, `BattleArenaModal`.
- Integrated `App.jsx` navigation and state synchronization across all views.
- Verified all components against premium text requirements for 100% accuracy.
- Added `canvas-confetti` dependency and visual celebration logic.
- Resolved module export errors and refactored `GameContainer.jsx` for hook-based logic.
- Improved fallback safety in message utility functions.
- Fixed syntax and linting errors in `App.jsx` and `GameHUD.jsx`.

# 2026-01-29 12:55
- Initial documentation setup.
- Mapped project structure from current file system state.
