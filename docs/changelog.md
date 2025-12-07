# 📝 Changelog - English Mastery Battle

---

## 2025-12-07 19:05 - Questions & Progress System Complete

### Questions Loading
- ✅ Real questions loading from `questions-part1/2/3.js`
- ✅ Stages 1-30 use actual ministerial questions
- ✅ Golden questions highlighted (repeat >= 5)
- ✅ Repeat count displayed (e.g., 12x)
- ✅ Questions shuffled for variety

### Retry Mode (إعادة الأسئلة الخاطئة)
- ✅ Wrong questions re-appear at end of level
- ✅ Visual notification for retry mode
- ✅ Unique questions only (no duplicates)
- ✅ Final results after all questions answered correctly

### Progress Saving to Supabase
- ✅ `saveStageProgress()` - saves score, stars, XP, accuracy
- ✅ `updateUserStats()` - updates total XP, current level
- ✅ `saveWrongAnswer()` - saves wrong answers for analytics
- ✅ LocalStorage backup for offline support

### State Updates
- ✅ Added `retryMode` flag
- ✅ Added `currentUserData` for Supabase operations
- ✅ User data preserved during gameplay

---

## 2025-12-07 18:35 - Full Project Modularization

### Game Module
- ✅ Created `game/` folder with modular structure
- ✅ Split `game.html` (2500+ lines) into 9 files
- ✅ Moved original to `backup/game.html`

### Index Module
- ✅ Created `index/` folder with modular structure
- ✅ Split `index.html` (600+ lines) into 6 files:
  - `index/index.html` - Clean HTML only
  - `index/css/index.css` - All styles
  - `index/js/index-config.js` - Config, state
  - `index/js/index-auth.js` - Auth functions
  - `index/js/index-ui.js` - UI functions
  - `index/js/index-init.js` - Initialization
- ✅ Moved original to `backup/index.html`
- ✅ Created redirect `index.html` at root

### Login Fixes
- ✅ Fixed duplicate email constraint error
- ✅ Auto-extract name & picture from Google profile
- ✅ Fixed OAuth redirect URL handling

---

## 2025-12-07 17:45 - Firebase Removal Complete
- ✅ Removed ALL Firebase code from project
- ✅ Updated `index.html` to use Supabase only
- ✅ Updated `game.html` to use Supabase only
- ✅ Updated `questions.js` - removed Firebase, added stubs
- ✅ Removed old auth overlay from `index.html`
- ✅ Login only via `login.html` now
- ✅ Added Google Analytics (G-H90E46NFQT) to all pages

---

## 2025-12-07 11:55 - New Supabase Project (Abdullah's Account)
- ✅ Created NEW Supabase project: `english-mastery-battle`
- ✅ Project ID: `judlqxxkbptuauaexjxu`
- ✅ Organization: `abdullahqais1's Org`
- ✅ Created all database tables (users, progress, suggestions, wrong_answers, analytics)
- ✅ Updated `js/supabase-config.js` with new credentials
- ✅ Updated `docs/GOOGLE_OAUTH_SETUP.md` with new callback URL
- ✅ Google OAuth configured and working

---

## 2025-12-06 21:45 - Supabase Setup & Login System (OLD - Gasmi's Account)
- ✅ Created Supabase project: `english-mastery-game` (ID: `scoztdqiqirmjubsachh`)
- ✅ Created database tables:
  - `users` - المستخدمين
  - `user_progress` - تقدم المستخدم
  - `suggestions` - المقترحات
  - `wrong_answers` - الأسئلة الخاطئة
  - `daily_analytics` - الإحصائيات
  - `daily_active_users` - المستخدمين النشطين
- ✅ Created `js/supabase-config.js` - Supabase client & functions
- ✅ Created `login.html` - New login page with Supabase Auth
- ⏳ Pending: Google OAuth setup in Google Cloud Console

---

## 2025-12-06 21:10 - Project Setup
- ✅ Created `docs/` folder
- ✅ Created `docs/project_structure.md`
- ✅ Created `docs/project_tasks.md` with full task list
- ✅ Created `docs/changelog.md`
- 📋 Analyzed client requirements (14 tasks identified)
- 📋 Reviewed existing codebase (Firebase → Supabase migration needed)

---

## Pending Tasks

### High Priority
- [ ] Create Supabase project
- [ ] Setup database tables (users, progress, suggestions, wrong_answers)
- [ ] Migrate Firebase Auth to Supabase Auth
- [ ] Load questions from part1/2/3 files instead of demo

### Medium Priority
- [ ] Implement wrong answer retry at stage end
- [ ] Enable suggestions box
- [ ] Guest mode (Demo only)

### Low Priority (UI)
- [ ] Remove flame icon
- [ ] Add exit button
- [ ] Fix X button overlap
- [ ] Fix dark mode XP color

---

*Maintained by: Gasmi | Client: Abdullah*
