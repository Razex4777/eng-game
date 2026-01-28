# Project Structure

eng-game/
├── 📄 .env                                # Supabase environment variables (local only)
├── 📄 .gitignore                          # Git configuration
├── 📄 index.html                          # Main HTML entry point
├── 📄 package.json                        # Dependencies and scripts
├── 📄 postcss.config.js                   # PostCSS configuration
├── 📄 tailwind.config.js                  # Tailwind CSS configuration
├── 📄 vercel.json                         # Vercel deployment configuration
├── 📄 vite.config.js                      # Vite build configuration
│
├── 📁 docs/                               # Project documentation
│   ├── 📄 changelog.md                    # Change history
│   └── 📄 project_structure.md            # This file
│
└── 📁 src/                                # Source code (React/Vite)
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
