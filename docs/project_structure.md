# 📁 Project Structure - English Mastery Battle

```
mql/
├── 📄 index.html                    # Redirect to index/index.html
├── 📄 login.html                    # Supabase login (Google + Phone + Name)
├── 📄 questions.js                  # Questions merger + helper functions
├── 📄 questions-part1.js            # Questions: Stages 1-10 (180 questions)
├── 📄 questions-part2.js            # Questions: Stages 11-20 (180 questions)
├── 📄 questions-part3.js            # Questions: Stages 21-30 (180 questions)
├── 📁 js/                           # Shared JavaScript modules
│   └── 📄 supabase-config.js        # Supabase client + auth + DB functions
├── 📁 index/                        # Index module (refactored)
│   ├── 📄 index.html                # Main stages page (30 stages grid)
│   ├── 📁 css/                      # Index styles
│   │   └── 📄 index.css             # All index CSS
│   └── 📁 js/                       # Index scripts (modular)
│       ├── 📄 index-config.js       # Configuration, state
│       ├── 📄 index-auth.js         # Auth functions
│       ├── 📄 index-ui.js           # UI functions, level rendering
│       └── 📄 index-init.js         # Initialization
├── 📁 game/                         # Game module (refactored)
│   ├── 📄 game.html                 # Main game page
│   ├── 📁 css/                      # Game styles
│   │   └── 📄 game.css              # All game CSS (750+ lines)
│   └── 📁 js/                       # Game scripts (modular)
│       ├── 📄 game-config.js        # Configuration, stubs, demo data
│       ├── 📄 game-state.js         # State management, session tracking
│       ├── 📄 game-audio.js         # Audio system
│       ├── 📄 game-ui.js            # UI functions, animations
│       ├── 📄 game-core.js          # Core game logic
│       ├── 📄 game-controls.js      # Controls, powerups, fullscreen
│       └── 📄 game-init.js          # Initialization
├── 📁 backup/                       # Original files backup
│   ├── 📄 game.html                 # Original game.html
│   └── 📄 index.html                # Original index.html
├── 📁 docs/                         # Documentation folder
│   ├── 📄 project_structure.md      # This file - current structure
│   ├── 📄 project_tasks.md          # Task list and requirements
│   └── 📄 changelog.md              # Change history
└── 📁 mostaql_summery/              # Client conversation summary
    ├── 📄 offer.md                  # Original offer details
    └── 📄 conversation.md           # Full conversation with client
```

---

## 📊 File Details

| File | Purpose |
|------|---------|
| `index.html` | Stage selection UI, XP display, Supabase auth |
| `login.html` | Google Sign-In + Phone + Name registration |
| `game/game.html` | Quiz game (modular structure) |
| `game/css/game.css` | All game styles (750+ lines) |
| `game/js/game-*.js` | Game logic split into 7 modules |
| `questions.js` | Merges part1/2/3, helper functions |
| `questions-part*.js` | Questions arrays (540 total) |

---

## 🔧 Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript + TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **Hosting**: Static files (no server required)

---

*Last updated: December 7, 2025*
