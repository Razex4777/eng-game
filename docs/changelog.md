# Changelog

# 2026-02-12 14:30
- **🎮 Guest Mode UI - Simplified View**:
  - **`views/HomeView.jsx`**: Guest users now see ONLY the Continue Journey banner
    - Shows: "جرب مجاناً 🎮", "ابدأ رحلتك التعليمية", "0%", "0 أيام"
    - Hidden for guests: StatsHUD, Monster Challenge card, Quick Navigation grid
  - **`components/layout/BottomDock.jsx`**: Completely hidden for guest users
  - **`App.jsx`**: Passed `isGuest` prop to BottomDock

# 2026-02-12 13:45
- **🐛 Guest Mode UI Fix**:
  - **`App.jsx`**: Fixed guest login showing registered user content instead of guest-specific UI
    - **Root cause 1**: `userStats` was not being reset for guests, showing previous user's progress
    - **Root cause 2**: Auth state listener could overwrite guest `userData` if Supabase session existed
    - **Fix 1**: Added `setUserStats()` call in `handleGuestLogin` to reset all stats to 0/null for guests
    - **Fix 2**: Added `setAuthUser(null)` in `handleGuestLogin` to clear any existing Supabase auth state
    - **Fix 3**: Added `isGuestMode()` check at start of `onAuthStateChange` callback to skip processing if in guest mode
  - **Result**: Guest users now correctly see "جرب مجاناً 🎮" instead of "تابع رحلتك 🚀" and "ابدأ رحلتك التعليمية" instead of previous user's progress

# 2026-02-12 12:30
- **✨ UI Simplification (Matching code.txt Reference)**:
  - **`views/HomeView.jsx`**: Removed TutorialHand, seenTooltips, showTutorial props; inline MonsterCard; cleaner navigation grid
  - **`views/ChaptersView.jsx`**: Reduced from 179 to ~130 lines; simpler progress bar without glow effects
  - **`views/LevelsView.jsx`**: Removed CheckCircle2, Gamepad2 imports; simplified level grid with just number + stars
  - **`views/ReviewsView.jsx`**: Removed wrong answers bag section; cleaner expand/collapse for review types
  - **`components/layout/BottomDock.jsx`**: Reduced from 240 to ~140 lines; simplified daily task widget
  - **`views/BattleArenaModal.jsx`**: Removed complex theme tokens object; simpler inline theme classes matching code.txt style
  - **`App.jsx`**: Updated HomeView props to remove tutorial-related props (seenTooltips, showTutorial, onTooltipClose)

# 2026-02-12 11:57
- **🐛 Login Redirect Fix (New Google Accounts)**:
  - **`views/LoginView.jsx`**: Fixed critical bug where new Google sign-in users were stuck on step 0 (Google/Guest buttons) instead of advancing to registration steps (name → age/gender → governorate)
    - **Root cause**: `useState` initializer only runs once at mount. When `initialData` arrived later via `onAuthStateChange`, the step stayed stuck at 0
    - **Fix**: Extracted `getStepFromData()` helper + added `useEffect` watching `initialData` changes that jumps to correct step and pre-fills form
- **🎮 MonsterCard Guest State**:
  - **`views/MonsterCard.jsx`**: Added `isGuest` prop — shows Lock icon, greyed-out card, score "0", subtitle "سجل لفتح التحدي", and pinging red dot for guest users

# 2026-02-12 11:15
- **⚔️ BattleArenaModal — Progression Logic & Dynamic Chapters**:
  - **`views/BattleArenaModal.jsx`**: Complete rewrite with sequential progression enforcement
    - **Dynamic chapters**: Fetches real parts from `{subject}_chapters` Supabase tables (24 for English, 12 for Biology) — no hardcoded numbers
    - **Progression states**: Three card states derived from `monster_challenge_progress`:
      - ✅ **Completed** (part < currentPart): Green star badge, replayable, VS share button visible
      - ▶️ **Current** (part == currentPart): Blue highlighted card with "ابدأ" play button
      - 🔒 **Locked** (part > currentPart): Greyed out, opacity 40%, lock icon, toast warning on click
    - **Per-chapter high scores**: Queries `game_sessions` table by `user_id`, `subject`, `question_type='chapters'`, `part_number` — groups by part, takes highest score
    - **Progress fetching**: Uses existing `getUserProgress()` from monsterChallengeService to read `users.monster_challenge_progress` JSONB
    - **VS Share**: Share button appears only on completed chapters with scores — "تحدى صديقك!" bounce tooltip on first scored chapter
    - **Theme tokens**: `isDarkMode` prop drives full light/dark token object (`t.modal`, `t.cardCompleted`, `t.cardLocked`, etc.) — no Tailwind `dark:` prefix needed
    - **Scrollable grid**: `max-h-[55vh] overflow-y-auto` for subjects with many chapters
    - **CTA**: "التحدي الشامل" starts fullyear mode, shows dynamic total XP from scored chapters

# 2026-02-11 19:50
- **🎯 Tutorial Hand Animation Fix (Banner Spotlight)**:
  - **`keyframes.css`**: Rewrote `@keyframes pulse-ring` — old version scaled element to 2x and faded to opacity 0 (making it invisible). New version uses `box-shadow` yellow glow pulse that keeps the element visible while creating an attention-grabbing pulsing ring
  - **`keyframes.css`**: Added missing `@keyframes bounce` (translateY -25% ↔ 0) for the TutorialHand's cursor icon
  - **`animations.css`**: Updated `.animate-pulse-ring` timing from `1s ease-out` to `2s cubic-bezier(0.4, 0, 0.6, 1)` matching reference design
  - **`animations.css`**: Added missing `.animate-bounce` class (`animation: bounce 1s infinite`)
  - **`App.jsx`**: Added `setTimeout(() => setShowTutorial(true), 500)` in 3 login flows:
    - `handleGuestLogin` — guest users
    - `handleLoginSuccess` — new registered users
    - Supabase auth `SIGNED_IN` event — returning Google-authenticated users
  - **Root cause**: `showTutorial` was initialized as `false` and never set to `true`, so TutorialHand/spotlight never appeared

# 2026-02-11 19:19
- **🎨 TopNav Complete Redesign (Reference Design Match)**:
  - **`TopNav.jsx`**: Completely rewritten to match reference design
    - Left side: Subject selector dropdown (English / الأحياء) with chevron, badge, and smooth dropdown
    - Right side: Profile icon button with settings dropdown (Night mode, Fullscreen, Logout)
    - Removed old 3-icon buttons (theme, audio, settings) and user info bar
    - Added outside-click handlers for dropdown dismissal
  - **`HomeView.jsx`**: Updated welcome header
    - Centered "هلا بالبطل" large bold heading
    - Subtitle: "نسخة التجربه (ضيف)" for guests / personalized for logged-in users
    - Banner text: "جرب التحدي مجاناً 🎮" for guests / "تابع رحلتك 🚀" for users
    - Removed old gradient "ختمتها" logo text
  - **`App.jsx`**: Integrated new TopNav props
    - Added `currentSubject` state + `handleSubjectChange` handler
    - Added `handleFullscreenToggle` using Fullscreen API
    - Removed old `isMuted`, `onMuteToggle`, `onSettingsClick`, `userAvatar` TopNav props
    - Subject now flows from TopNav dropdown → ChaptersView, LevelsView, ReviewsView

# 2026-02-11 18:45
- **🔧 Atomic Daily Task Increment**:
  - Created `increment_daily_task` Supabase RPC (Postgres function) — atomic UPSERT + increment in one transaction
  - **`services/userProgressService.js`**: Replaced 3-query race-prone pattern (upsert → select → update) with single `rpc('increment_daily_task')` call
- **🔁 Guest Login Restored**:
  - **`services/guestService.js`** (NEW): Guest session management — ID generation via `crypto.randomUUID()`, localStorage persistence, Supabase `guest_sessions` tracking, cleanup on sign-out
  - **`LoginView.jsx`**: Added "التسجيل كضيف" button below Google sign-in (step 0 card)
  - **`App.jsx`**: Added `handleGuestLogin` handler, imports `guestService`, passes `onGuestLogin` prop to `LoginView`
- **🐛 Bug Fixes**:
  - **`App.jsx`**: Wrapped `handleContinueJourney` → `getLastPlayedPart` in `try/catch` with fallback to chapter 1 part 1
  - **`components/ui/StatsHUD.jsx`**: Compact mode click handlers now use `() => onFlameClick?.()` / `onQuestionsClick?.()` instead of direct prop references
  - **`views/HomeView.jsx`**: Added `?.` and `?? 0` null safety to `userStats.streakDays`, `.totalQuestions`, `.totalXP` props
  - **`docs/project_structure.md`**: Removed stray blank line in services section, added `guestService.js` entry
- **🐛 Bug Fixes & Robustness Pass (17 fixes across 13 files)**:
  - **`hooks/index.js`**: Fixed `useDarkMode` — wrapped `localStorage` reads in `try/catch` for private browsing safety; Fixed `useToast` — timer now uses `useRef` to prevent stale closures and race conditions, with cleanup on unmount
  - **`lib/auth.js`**: Wrapped `onAuthStateChange` in `try/catch` to prevent crash if Supabase client isn't initialized
  - **`services/messagesService.js`**: Clamped `streakCount` to minimum 1 to prevent negative array index
  - **`services/monsterChallengeService.js`**: Added null safety for `progress` and `progress[subject]` in `updateUserProgress`
  - **`services/userProgressService.js`**: Fixed broken `supabase.rpc('increment')` in `completeDailyTask` — replaced with fetch-then-increment pattern
  - **`services/wrongAnswersService.js`**: Three fixes — null-check `correct_answer` before `.toLowerCase()`; Fixed `getRandomQuestionsFromSameChapter` field mapping (was using transformed names `q.question`/`q.options.a` on raw DB rows, corrected to `q.question_text`/`q.option_a`); Added case-insensitive correct index lookup
  - **`components/game/MonsterChallengeLoader.jsx`**: Added `try/catch` around `supabase.auth.getUser()` call
  - **`components/game/GameHUD.jsx`**: Added default value `lives = 3` to prevent undefined display
  - **`components/ui/StatsHUD.jsx`**: Added null-safe `onClick?.()` handlers; Added fallback for unknown subject in `QUESTION_TOTALS`
  - **`components/ui/TooltipOverlay.jsx`**: Removed unused `targetRef` prop
  - **`components/ui/ToastNotification.jsx`**: Fixed CSS `cubic-bezier` — moved to `transitionTimingFunction` inline style
  - **`components/layout/BottomDock.jsx`**: Improved `handleDelete` with optimistic update and error rollback
  - **`utils/helpers.js`**: Fixed `debounce` — changed arrow function to regular function for correct `this` context
  - **`utils/audio.js`**: Made `playBeep` async and awaited `ctx.resume()` for suspended AudioContext
  - **`styles/animations.css`**: Corrected `.fever-mode` animation name from `neonPulse` to `neon-pulse`

# 2026-02-11 18:30
- **🗑️ Removed Guest User Feature (Complete)**:
  - Deleted `guestTrackingService.js` — entire guest analytics service removed
  - **`App.jsx`**: Removed `isGuest` state, `guest_mode` localStorage logic, guest toast messages, and guest-gated feature routing
  - **`LoginView.jsx`**: Removed `handleGuestLogin` function and "الدخول كضيف" button
  - **`TopNav.jsx`**: Removed `isGuest` prop and conditional guest "تسجيل" button
  - **`HomeView.jsx`**: Removed `isGuest` prop, guest-specific text on journey card, and conditional stat hiding
  - **`MonsterCard.jsx`**: Removed `isGuest` prop, locked/dimmed guest state, and guest-only text
  - **`StatsHUD.jsx`**: Removed `isGuest` prop and zeroed-out stats logic for guests
  - **`ChaptersView.jsx`**: Removed `isGuest` prop, "سجل لفتح" labels, and guest lock overrides
  - **`LevelsView.jsx`**: Removed `isGuest` prop and login redirect for locked levels
  - **`ReviewsView.jsx`**: Removed `isGuest` prop and subscriber-only gate screen
  - **`auth.js`**: Removed `guest_mode` from `signOut` localStorage cleanup
  - Updated `docs/project_structure.md` to reflect deletion

# 2026-02-09 23:45
- **🎯 Guest Tracking System**:
  - Created `guest_sessions` table in Supabase with indexes and RLS policies
  - Created `guestTrackingService.js` with comprehensive guest analytics:
    - `getOrCreateGuestId()`: Generate/retrieve guest UUID from localStorage
    - `trackGuestSession()`: Log guest game sessions to Supabase
    - `getGuestStats()`: Aggregate statistics for individual guests
    - `getGlobalGuestAnalytics()`: Dashboard metrics for Abdullah
    - `syncLocalSessions()`: Offline fallback with localStorage
    - `isGuestUser()`: Check authentication status
  - Features:
    - Persistent guest IDs using crypto.randomUUID()
    - Offline session storage with auto-sync
    - Global analytics: unique guests, win rates, popular subjects
    - Conversion tracking structure (ready for signup integration)
- **📊 Analytics Service**:
  - Created `analyticsService.js` for performance insights:
    - `getMostWrongQuestions()`: Top errors per user with review flags
    - `getGlobalMostWrongQuestions()`: Aggregate wrong answers across all users
    - `getWrongQuestionsByPart()`: Targeted review by part number
    - `getAverageTimePerStage()`: Duration analysis grouped by part
    - `getAverageAnswerSpeed()`: Seconds per question with rating system
    - `getGlobalAverageAnswerSpeed()`: Platform-wide speed benchmarks
    - `getPerformanceTrends()`: 7-day accuracy and score trends
    - `getUserAnalyticsDashboard()`: Comprehensive dashboard with parallel queries
  - Features:
    - Smart aggregation using reduce for client-side grouping
    - Performance ratings (سريع جداً, سريع, متوسط, بطيء, بطيء جداً)
    - Critical question flagging (3+ errors = needs review)
    - Difficulty scoring for global questions
    - Subject-specific breakdowns
- **Database Updates**:
  - Applied migration: `create_guest_sessions_table`
  - Indexes: guest_id, subject, created_at for optimized queries
  - RLS policies: anonymous insert allowed, universal read access

# 2026-02-09 22:00
- **Daily Tracking UI System (4 Components)**:
  - Created `DailyTasksWidget.jsx`: Daily goal tracker showing 2 stages/day target
    - Green indicator for 2+ stages completed
    - Red indicator for 0-1 stages completed
    - Progress bar with motivational messages
    - Fetches data from user_daily_activity table
  - Created `StreakDisplay.jsx`: 7-day streak calendar visualization
    - Fire icons 🔥 for completed days
    - Gray circles for missed days
    - Current streak number prominently displayed
    - Max streak badge when current = max
    - Shows last 7 days with Arabic day names
  - Created `CompletionProgress.jsx`: Curriculum completion percentage
    - Circular progress indicator with color coding
    - Green (75%+), Blue (50-74%), Orange (25-49%), Red (<25%)
    - Displays X/682 questions (or subject-specific totals)
    - Linear progress bar at bottom
    - Subject-aware: English (348), Biology (334), Combined (682)
  - Updated `StatsHUD.jsx`: Added question counter with subject totals
    - Now shows "X من 348" for English, "X من 334" for Biology
    - Dynamic total based on preferred_subject prop
- **HomeView Integration**:
  - Added all 4 tracking widgets to HomeView
  - Widgets only visible for logged-in users (not guests)
  - Proper spacing and RTL support
- **Exports Updated**:
  - Added new components to ui/index.js
  - All components ready for import

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

# 2026-02-12 19:30
- **PDF Issues Fixes - Multiple Improvements**:
  - **Toast Notification Theme**: Fixed toast notifications to respect dark/light mode
  - **Game Button Animations**: Enhanced answer buttons with haptic feedback and better animations
  - **Heart Count Fix**: Changed game to use 3 hearts instead of 10 for trial/demo stage
  - **Power-up Spacing**: Increased spacing between bomb/freeze icons and answer buttons
  - **Reviews Interface**: Added "حقيبة الأخطاء" (Wrong Answers) button to Reviews view
  - **Demo Stage**: Added "المرحلة التجريبية" (Demo Stage) button to chapter map
  - **Daily Task Refresh**: Fixed daily task button to refresh after completing games

# 2026-02-12 19:10
- **Login/Registration Redirect Fix**:
  - Fixed issue where users were redirected back to login after completing registration
  - Enhanced `handleLoginSuccess` to navigate to home immediately without waiting for profile sync
  - Improved auth state change listener to handle edge cases properly
  - Added better error handling to prevent blocking on profile sync failures
  - Logic now properly checks: hasCompleteProfile → home, isReturningUser → home, new user → login

# 2026-02-12 19:00
- **Game Screen Button Dark Mode Fix**:
  - Fixed pause and fullscreen buttons in GameHUD to properly respect light/dark mode
  - Replaced raw button elements with TactileButton components
  - Removed hardcoded dark: classes, using conditional isDark prop instead
  - Ensured consistent styling with powerup buttons in the game UI

# 2026-02-12 18:50
- **First-Time User Demo Experience Enhanced**:
  - Updated Continue Journey banner to show "الفصل 1 - الدرس 1" for new users instead of generic text
  - Added 5% initial progress for first-time users to indicate demo stage
  - Improved onboarding experience with clear starting point
  - Maintains proper tracking for returning users

# 2026-02-12 18:45
- **StatsHUD XP Click Handler Added**:
  - Added click handlers to XP stats in both compact and full modes
  - XP clicks now show the same notification as questions: "المجموع الكلّي لاسئلة المنهج 🎯"
  - All three stats (flame/days, questions, XP) now show explanatory notifications
  - Enhanced user experience with consistent feedback across all stats

# 2026-02-12 18:40
- **StatsHUD Navigation Fix**:
  - Fixed StatsHUD click handlers to show toast notifications instead of navigating to other views
  - Updated App.jsx to pass showToast function instead of navigation functions
  - Flame click now shows: "العب 7 أيام متواصلة بدون تسطيح حتى تحصل شعلة 🔥"
  - Questions click now shows: "المجموع الكلّي لاسئلة المنهج 🎯"
  - Restored original behavior from code.txt implementation

# 2026-02-12 18:35
- **StatsHUD Icon Import Fix**:
  - Added missing Flame and Target icon imports to HomeView, ChaptersView, ReviewsView, and App.jsx
  - Fixed "ReferenceError: Flame is not defined" runtime errors
  - StatsHUD click handlers now work properly with toast notifications

# 2026-02-12 18:30
- **StatsHUD Click Handler Fix**:
  - Fixed flame and questions stats to show toast notifications on click
  - Updated HomeView, ChaptersView, and ReviewsView to pass proper toast functions
  - Flame click now shows: "العب 7 أيام متواصلة بدون تسطيح حتى تحصل شعلة 🔥"
  - Questions click now shows: "المجموع الكلّي لاسئلة المنهج 🎯"
  - Restored original behavior from code.txt implementation

# 2026-02-12 18:15
- **Feedback Popup Validation Fix**:
  - Added state management for feedback textarea value
  - Implemented validation to prevent sending empty messages
  - Disabled send button when textarea is empty
  - Changed button text to "اكتب شيئاً أولاً" when empty
  - Added visual feedback with disabled state styling
  - Clear textarea after successful submission

# 2026-02-12 18:00
- **Comprehensive Dark Mode Audit & Fixes**:
  - Fixed PauseMenuModal dropdown buttons to properly respect dark/light mode
  - Updated speed selection dropdown styling to use conditional classes
  - Ensured consistent dark mode handling across all UI components
  - Verified all components use proper isDark/isDarkMode props consistently
  - Fixed modal background and border colors

# 2026-02-12 17:40
- **Power-up Button Dark Mode Fix**:
  - Fixed bomb and freeze power-up buttons in dark mode by replacing raw button elements with TactileButton components.
  - Properly implemented dark mode styling using isDark prop for consistent background and border colors.
  - Added variant="primary" to ensure proper styling inheritance in TactileButton component.
  - Maintained haptic feedback and tactile interaction behavior.

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
