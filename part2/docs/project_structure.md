part2/
├── 📄 .env                                # Supabase environment variables
├── 📄 .gitignore                          # Git configuration
├── 📄 eslint.config.js                    # ESLint configuration
├── 📄 index.html                          # Main HTML entry point
├── 📄 package.json                        # Dependencies and scripts
├── 📄 postcss.config.js                   # PostCSS configuration
├── 📄 tailwind.config.js                  # Tailwind CSS configuration
├── 📄 vite.config.js                      # Vite build configuration
│
├── 📁 All files excel/                    # Excel question files (imported to Supabase)
│   ├── 📁 Biology/                        # Biology subject
│   │   ├── 📁 Chapters_Review/            # 12 stages (Ch1-Ch4, 3 parts each)
│   │   ├── 📁 FullYear/                   # 10 stages
│   │   └── 📁 HalfYear/                   # 8 stages
│   └── 📁 English/                        # English subject
│       ├── 📁 Chapters_Review/            # 24 stages (Ch1-Ch8, 3 parts each)
│       ├── 📁 FullYear/                   # 25 stages
│       └── 📁 HalfYear/                   # 13 stages
│
├── 📁 docs/                               # Project documentation
│   ├── 📄 changelog.md                    # Change history
│   └── 📄 project_structure.md            # This file
│
├── 📁 scripts/                            # Utility scripts
│   └── 📄 import-excel.js                 # Excel to Supabase import script
│
└── 📁 src/                                # Source code
    ├── 📄 App.jsx                         # Main game controller with auth + navigation
    ├── 📄 index.css                       # Global styles and animations
    ├── 📄 main.jsx                        # React entry point
    │
    ├── 📁 assets/                         # Static assets
    │   └── 📄 bg.png                      # Background image
    │
    ├── 📁 components/                     # React components
    │   ├── 📄 CategorySelectScreen.jsx    # Category selection (Review/Year modes)
    │   ├── 📄 FeedbackOverlay.jsx         # Correct/wrong answer feedback
    │   ├── 📄 GameEffects.jsx             # Particles, score popups, streaks
    │   ├── 📄 GameScreen.jsx              # Main gameplay screen
    │   ├── 📄 LoginScreen.jsx             # Google OAuth login screen
    │   ├── 📄 MenuScreen.jsx              # Main menu with user profile
    │   ├── 📄 PauseMenuModal.jsx          # Pause menu overlay
    │   ├── 📄 ResultsScreen.jsx           # Game over results
    │   ├── 📄 StageSelectScreen.jsx       # Stage selection by chapter/part
    │   ├── 📄 SubjectSelectScreen.jsx     # Subject selection (Biology/English)
    │   └── 📄 TactileButton.jsx           # Reusable tactile button component
    │
    ├── 📁 context/                        # React contexts
    │   └── 📄 AuthContext.jsx             # Authentication context provider
    │
    ├── 📁 data/                           # Static data
    │   └── 📄 gameData.js                 # Game constants, speed modes, messages
    │
    ├── 📁 lib/                            # Library configurations
    │   └── 📄 supabase.js                 # Supabase client initialization
    │
    └── 📁 utils/                          # Utility functions
        └── 📄 haptic.js                   # Haptic feedback utilities
