eng-game-main/
├── 📄 .gitignore
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 package.json
├── 📄 postcss.config.js
├── 📄 tailwind.config.js
├── 📄 vite.config.js
├── 📁 public/
│   └── 📁 icons/
├── 📁 src/
│   ├── 📄 App.jsx                       # Main app with navigation and state management
│   ├── 📄 index.css                     # Main CSS entry - imports modular styles
│   ├── 📄 main.jsx                      # Vite entry point
│   ├── 📁 styles/                       # Modular CSS organization
│   │   ├── 📄 variables.css             # CSS variables and design tokens
│   │   ├── 📄 base.css                  # Base styles, resets, scrollbars
│   │   ├── 📄 keyframes.css             # All @keyframes animation definitions
│   │   ├── 📄 animations.css            # Animation utility classes
│   │   └── 📄 components.css            # Component-specific styles (glass, gradients)
│   ├── 📁 assets/
│   │   └── 📁 icons/
│   │       ├── 📄 audio_icon.png
│   │       ├── 📄 settings_icon.png
│   │       └── 📄 theme_icon.png
│   ├── 📁 components/
│   │   ├── 📁 game/
│   │   │   ├── 📄 AnswerButtons.jsx
│   │   │   ├── 📄 FeedbackOverlay.jsx
│   │   │   ├── 📄 GameContainer.jsx
│   │   │   ├── 📄 GameHUD.jsx
│   │   │   ├── 📄 GameMenu.jsx
│   │   │   ├── 📄 index.js
│   │   │   ├── 📄 MonsterChallengeLoader.jsx # Questions loader with Supabase fetch
│   │   │   ├── 📄 PauseMenuModal.jsx
│   │   │   ├── 📄 QuestionCard.jsx
│   │   │   ├── 📄 ResultsScreen.jsx
│   │   │   └── 📄 WrongAnswersReviewMode.jsx
│   │   ├── 📁 layout/
│   │   │   ├── 📄 BottomDock.jsx
│   │   │   ├── 📄 index.js
│   │   │   └── 📄 TopNav.jsx
│   │   ├── 📁 settings/
│   │   │   ├── 📄 index.js
│   │   │   └── 📄 SettingsModal.jsx     # User settings with subject preference
│   │   └── 📁 ui/
│   │       ├── 📄 index.js
│   │       ├── 📄 CompletionProgress.jsx     # Curriculum completion % with circular progress
│   │       ├── 📄 DailyTasksWidget.jsx       # Daily goal tracker: 2 stages/day indicator
│   │       ├── 📄 SharePopup.jsx             # Social sharing popup component
│   │       ├── 📄 SoftBackground.jsx
│   │       ├── 📄 StatsHUD.jsx               # Main stats display with question counter
│   │       ├── 📄 StreakDisplay.jsx           # 7-day streak calendar with fire icons
│   │       ├── 📄 TactileButton.jsx
│   │       ├── 📄 ToastNotification.jsx
│   │       ├── 📄 TooltipOverlay.jsx
│   │       └── 📄 TutorialHand.jsx
│   ├── 📁 hooks/
│   │   ├── 📄 index.js
│   │   └── 📄 useGameLogic.js
│   ├── 📁 lib/
│   │   ├── 📄 auth.js
│   │   └── 📄 supabase.js
│   ├── 📁 services/                     # Service layer for API calls
│   │   ├── 📄 analyticsService.js       # Analytics: most wrong questions, time/speed metrics
│   │   ├── 📄 chaptersService.js        # Chapters & Reviews structure, questions, progress
│   │   ├── 📄 gameSettingsService.js    # Game settings CRUD with Supabase

│   │   ├── 📄 messagesService.js        # Encouragement messages from Supabase
│   │   ├── 📄 monsterChallengeService.js # Monster Challenge Supabase queries
│   │   ├── 📄 userProgressService.js    # User stats, streaks, achievements, game sessions
│   │   └── 📄 wrongAnswersService.js    # Wrong answers inventory CRUD
│   ├── 📁 utils/
│   │   ├── 📄 audio.js
│   │   ├── 📄 haptics.js
│   │   ├── 📄 helpers.js                # Utility functions (shuffleArray, etc.)
│   │   └── 📄 sharing.js
│   └── 📁 views/
│       ├── 📄 BattleArenaModal.jsx      # Monster Challenge selection modal (refactored)
│       ├── 📄 ChaptersView.jsx
│       ├── 📄 HomeView.jsx              # Home screen navigation cards (extracted)
│       ├── 📄 index.js
│       ├── 📄 LevelsView.jsx
│       ├── 📄 LoginView.jsx
│       ├── 📄 MonsterCard.jsx
│       └── 📄 ReviewsView.jsx
├── 📁 ALL_FILES_MARKDOWN/               # Question content source files
│   ├── 📁 Biology/
│   │   ├── 📁 Chapters_Review/          # 12 part files per chapter
│   │   ├── 📁 FullYear/                 # 10 full year review parts
│   │   └── 📁 HalfYear/                 # 8 half year review parts
│   └── 📁 English/
│       ├── 📁 Chapters_Review/          # 12 part files per chapter
│       ├── 📁 FullYear/                 # 10 full year review parts
│       └── 📁 HalfYear/                 # 8 half year review parts
└── 📁 docs/
    ├── 📄 project_structure.md
    └── 📄 changelog.md
