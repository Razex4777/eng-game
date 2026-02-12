eng-game-main/
├── 📄 .gitignore                           # Git configuration and exclusions
├── 📄 code.txt                             # Reference implementation (single-file prototype)
├── 📄 eslint.config.js                     # ESLint configuration
├── 📄 index.html                           # Main application entry point
├── 📄 package.json                         # Dependency management
├── 📄 README.md                            # Project documentation
├── 📄 vercel.json                          # Vercel deployment configuration
├── 📄 vite.config.js                       # Vite build configuration
├── 📁 .agent/                              # AI agent configuration
│   └── 📁 rules/
│       └── 📄 project-rules.md
├── 📁 .claude/                             # Claude AI configuration
│   └── 📄 settings.local.json
├── 📁 .kilocode/                           # KiloCode configuration
├── 📁 ALL_FILES_MARKDOWN/                  # Question content source files
│   ├── 📁 Biology/
│   │   ├── 📁 Chapters_Review/             # 12 part files per chapter
│   │   ├── 📁 FullYear/                    # 10 full year review parts
│   │   └── 📁 HalfYear/                    # 8 half year review parts
│   └── 📁 English/
│       ├── 📁 Chapters_Review/             # 24 part files (8 chapters × 3 parts)
│       ├── 📁 FullYear/                    # 25 full year review parts
│       └── 📁 HalfYear/                    # 13 half year review parts
├── 📁 docs/
│   ├── 📄 API_REFERENCE.md                 # Service layer documentation
│   ├── 📄 changelog.md                     # Historical record of changes
│   ├── 📄 CLIENT_REQUIREMENTS.md           # Client requirements document
│   ├── 📄 DATABASE_SCHEMA.md               # Database schema documentation
│   ├── 📄 IMPLEMENTATION_STATUS.md         # Implementation progress tracking
│   └── 📄 project_structure.md             # This file
└── 📁 src/
    ├── 📄 App.jsx                          # Main app with navigation and state management
    ├── 📄 index.css                        # Main CSS entry - imports modular styles
    ├── 📄 main.jsx                         # Vite entry point
    ├── 📁 assets/
    │   └── 📁 icons/
    │       ├── 📄 audio_icon.png
    │       ├── 📄 settings_icon.png
    │       └── 📄 theme_icon.png
    ├── 📁 components/
    │   ├── 📁 game/
    │   │   ├── 📄 AnswerButtons.jsx        # Answer option buttons with feedback
    │   │   ├── 📄 FeedbackOverlay.jsx      # Correct/incorrect feedback animation
    │   │   ├── 📄 GameContainer.jsx        # Main game container with state machine
    │   │   ├── 📄 GameHUD.jsx              # Game heads-up display (lives, combo, powerups)
    │   │   ├── 📄 GameMenu.jsx             # Game mode selection menu
    │   │   ├── 📄 index.js                 # Game components barrel export
    │   │   ├── 📄 MonsterChallengeLoader.jsx # Questions loader with Supabase fetch
    │   │   ├── 📄 PauseMenuModal.jsx       # Pause menu with resume/quit options
    │   │   ├── 📄 QuestionCard.jsx         # Question display with animations
    │   │   ├── 📄 ResultsScreen.jsx        # End-game results and stats
    │   │   └── 📄 WrongAnswersReviewMode.jsx # Review mode for wrong answers
    │   ├── 📁 layout/
    │   │   ├── 📄 BottomDock.jsx           # Bottom navigation with daily tasks (simplified)
    │   │   ├── 📄 index.js                 # Layout components barrel export
    │   │   └── 📄 TopNav.jsx               # Top navigation with subject selector
    │   ├── 📁 settings/
    │   │   ├── 📄 index.js                 # Settings components barrel export
    │   │   └── 📄 SettingsModal.jsx        # User settings with subject preference
    │   └── 📁 ui/
    │       ├── 📄 CompletionProgress.jsx   # Curriculum completion % with circular progress
    │       ├── 📄 DailyTasksWidget.jsx     # Daily goal tracker: 2 stages/day indicator
    │       ├── 📄 index.js                 # UI components barrel export
    │       ├── 📄 SharePopup.jsx           # Social sharing popup component
    │       ├── 📄 SoftBackground.jsx       # Blurred background overlay
    │       ├── 📄 StatsHUD.jsx             # Main stats display with question counter
    │       ├── 📄 StreakDisplay.jsx        # 7-day streak calendar with fire icons
    │       ├── 📄 TactileButton.jsx        # Tactile feedback button component
    │       ├── 📄 ToastNotification.jsx    # Toast notification component
    │       ├── 📄 TooltipOverlay.jsx       # Tooltip overlay component
    │       └── 📄 TutorialHand.jsx         # Animated tutorial hand pointer
    ├── 📁 hooks/
    │   ├── 📄 index.js                     # Hooks barrel export
    │   └── 📄 useGameLogic.js              # Core game state machine hook
    ├── 📁 lib/
    │   ├── 📄 auth.js                      # Authentication utilities
    │   └── 📄 supabase.js                  # Supabase client configuration
    ├── 📁 services/                        # Service layer for API calls
    │   ├── 📄 analyticsService.js          # Analytics: most wrong questions, time/speed metrics
    │   ├── 📄 chaptersService.js           # Chapters & Reviews structure, questions, progress
    │   ├── 📄 gameSettingsService.js       # Game settings CRUD with Supabase
    │   ├── 📄 guestService.js              # Guest session management (localStorage + Supabase)
    │   ├── 📄 messagesService.js           # Encouragement messages from Supabase
    │   ├── 📄 monsterChallengeService.js   # Monster Challenge Supabase queries
    │   ├── 📄 userProgressService.js       # User stats, streaks, achievements, game sessions
    │   └── 📄 wrongAnswersService.js       # Wrong answers inventory CRUD
    ├── 📁 styles/                          # Modular CSS organization
    │   ├── 📄 animations.css               # Animation utility classes
    │   ├── 📄 base.css                     # Base styles, resets, scrollbars
    │   ├── 📄 components.css               # Component-specific styles (glass, gradients)
    │   ├── 📄 keyframes.css                # All @keyframes animation definitions
    │   └── 📄 variables.css                # CSS variables and design tokens
    ├── 📁 utils/
    │   ├── 📄 audio.js                     # Audio playback utilities
    │   ├── 📄 haptics.js                   # Haptic feedback utilities
    │   ├── 📄 helpers.js                   # Utility functions (shuffleArray, etc.)
    │   └── 📄 sharing.js                   # Social sharing utilities
    └── 📁 views/
        ├── 📄 BattleArenaModal.jsx         # Monster Challenge selection modal (simplified)
        ├── 📄 ChaptersView.jsx             # Chapter selection view (simplified)
        ├── 📄 HomeView.jsx                 # Home screen navigation cards (simplified)
        ├── 📄 index.js                     # Views barrel export
        ├── 📄 LevelsView.jsx               # Level selection view (simplified)
        ├── 📄 LoginView.jsx                # Login/registration view
        ├── 📄 MonsterCard.jsx              # Monster challenge card component
        └── 📄 ReviewsView.jsx              # Review mode selection view (simplified)
