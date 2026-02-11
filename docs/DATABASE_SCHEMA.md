# Database Schema Documentation

## Overview
This document describes the complete Supabase database schema for the English/Biology game application.

## Tables

### 1. users
**Purpose:** Core user data and authentication

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id TEXT UNIQUE NOT NULL,  -- Supabase Auth ID
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female')),
    region TEXT,
    preferred_subject TEXT DEFAULT 'english' CHECK (preferred_subject IN ('english', 'biology')),
    monster_challenge_progress JSONB DEFAULT '{}',  -- { "english": { "fullyear": 1 }, "biology": { "fullyear": 1 } }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth_id = auth.uid()::text);

CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth_id = auth.uid()::text);
```

**Current Data:** 1,056 rows

---

### 2. user_stats
**Purpose:** User progress tracking, XP, streaks, and subject-specific progress

```sql
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_questions_answered INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0,
    subject_progress JSONB DEFAULT '{}',  -- { "english": { "chapters": {...}, "halfyear": {...}, "fullyear": {...} } }
    achievements_unlocked TEXT[] DEFAULT '{}',
    total_play_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_streak ON user_stats(streak_days DESC);
CREATE INDEX idx_user_stats_xp ON user_stats(total_xp DESC);

-- RLS Policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
    ON user_stats FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));

CREATE POLICY "Users can update own stats"
    ON user_stats FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));
```

**subject_progress JSONB Structure:**
```json
{
  "english": {
    "chapters": {
      "1": { "part": 5, "completed": false, "stars": 2 },
      "2": { "part": 1, "completed": false, "stars": 0 }
    },
    "halfyear": { "part": 3, "completed": false },
    "fullyear": { "part": 8, "completed": false }
  },
  "biology": {
    "chapters": {},
    "halfyear": {},
    "fullyear": {}
  }
}
```

---

### 3. game_sessions
**Purpose:** Detailed per-game tracking

```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('english', 'biology')),
    game_type TEXT NOT NULL CHECK (game_type IN ('chapters', 'halfyear', 'fullyear', 'monster')),
    chapter_number INTEGER,  -- NULL for reviews/monster
    part_number INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    accuracy_percentage DECIMAL(5,2),
    duration_seconds INTEGER,
    xp_earned INTEGER DEFAULT 0,
    combo_max INTEGER DEFAULT 0,
    powerups_used JSONB DEFAULT '{}',  -- { "freeze": 2, "bomb": 1 }
    mistakes_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX idx_game_sessions_subject ON game_sessions(subject);

-- RLS Policies
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
    ON game_sessions FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));

CREATE POLICY "Users can insert own sessions"
    ON game_sessions FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));
```

**Current Data:** 2 rows

---

### 4. wrong_answers_inventory
**Purpose:** Track wrong answers for review and spaced repetition

```sql
CREATE TABLE wrong_answers_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('english', 'biology')),
    question_type TEXT NOT NULL CHECK (question_type IN ('chapters', 'halfyear', 'fullyear')),
    part_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    user_answer TEXT,
    options JSONB NOT NULL,  -- ["A", "B", "C", "D"]
    explanation TEXT,
    review_count INTEGER DEFAULT 0,  -- How many times reviewed
    next_review_at TIMESTAMPTZ,  -- Spaced repetition scheduler
    mastered BOOLEAN DEFAULT FALSE,  -- After 4 successful reviews
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_wrong_answers_user_id ON wrong_answers_inventory(user_id);
CREATE INDEX idx_wrong_answers_subject_part ON wrong_answers_inventory(subject, part_number);
CREATE INDEX idx_wrong_answers_next_review ON wrong_answers_inventory(next_review_at);

-- RLS Policies
ALTER TABLE wrong_answers_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wrong answers"
    ON wrong_answers_inventory FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));

CREATE POLICY "Users can manage own wrong answers"
    ON wrong_answers_inventory FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));
```

**Current Data:** 10 rows

**Spaced Repetition Logic:**
- 1st review: +3 hours
- 2nd review: +1 day
- 3rd review: +3 days
- 4th review: +7 days
- After 4 successful reviews: `mastered = true`

---

### 5. encouragement_messages
**Purpose:** Dynamic motivational messages

```sql
CREATE TABLE encouragement_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_ar TEXT NOT NULL,  -- Arabic text
    message_en TEXT,  -- Optional English
    context TEXT NOT NULL CHECK (context IN ('win', 'loss', 'streak', 'level_up', 'combo')),
    min_streak INTEGER DEFAULT 0,  -- Minimum streak for message to appear
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS (public read)
ALTER TABLE encouragement_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages"
    ON encouragement_messages FOR SELECT
    TO PUBLIC
    USING (true);
```

**Current Data:** 19 rows

**Sample Messages:**
- Win: "أحسنت! 🎉"
- Loss: "لا تستسلم، حاول مرة أخرى! 💪"
- Streak: "نار 🔥 استمر!"

---

### 6. game_settings
**Purpose:** User preferences

```sql
CREATE TABLE game_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    haptics_enabled BOOLEAN DEFAULT TRUE,
    game_speed TEXT DEFAULT 'normal' CHECK (game_speed IN ('slow', 'normal', 'fast', 'insane')),
    theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
    ON game_settings FOR ALL
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));
```

---

### 7. user_daily_activity
**Purpose:** Daily task tracking

```sql
CREATE TABLE user_daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    questions_answered INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    tasks_completed TEXT[] DEFAULT '{}',  -- ["stage1", "stage2"]
    daily_goal_reached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

-- Indexes
CREATE INDEX idx_daily_activity_user_date ON user_daily_activity(user_id, activity_date DESC);

-- RLS Policies
ALTER TABLE user_daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily activity"
    ON user_daily_activity FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));
```

---

### 8. user_achievements
**Purpose:** Unlockable achievements

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,  -- "first_win", "streak_7", etc.
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    xp_reward INTEGER DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

-- RLS Policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text));
```

---

### 9. guest_sessions
**Purpose:** Anonymous user tracking

```sql
CREATE TABLE guest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,  -- Browser fingerprint or localStorage ID
    subject TEXT CHECK (subject IN ('english', 'biology')),
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    first_visit TIMESTAMPTZ DEFAULT NOW(),
    last_visit TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS (public)
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage guest sessions"
    ON guest_sessions FOR ALL
    TO PUBLIC
    USING (true);
```

---

### 10. Question Tables

**Structure (same for all 6 tables):**
```sql
-- english_chapters, english_halfyear, english_fullyear
-- biology_chapters, biology_halfyear, biology_fullyear

CREATE TABLE english_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter INTEGER NOT NULL,
    part INTEGER NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT
);

-- Indexes
CREATE INDEX idx_english_chapters_chapter_part ON english_chapters(chapter, part);
```

**Question Counts:**
- english_chapters: ~288 questions (8 chapters × 12 parts × 3 questions)
- english_halfyear: ~72 questions (8 parts × 9 questions)
- english_fullyear: ~108 questions (12 parts × 9 questions)
- biology_chapters: ~288 questions
- biology_halfyear: ~72 questions
- biology_fullyear: ~90 questions (10 parts × 9 questions)

**Total:** 682 questions

---

## Database Functions

### update_user_stats_after_game()
**Purpose:** Atomically update stats after game completion

```sql
CREATE OR REPLACE FUNCTION update_user_stats_after_game(
    p_user_id UUID,
    p_xp INTEGER,
    p_questions INTEGER,
    p_correct INTEGER
)
RETURNS void AS $$
BEGIN
    UPDATE user_stats
    SET
        total_xp = total_xp + p_xp,
        total_questions_answered = total_questions_answered + p_questions,
        total_correct_answers = total_correct_answers + p_correct,
        accuracy_percentage = ROUND(
            (total_correct_answers + p_correct)::DECIMAL /
            (total_questions_answered + p_questions)::DECIMAL * 100,
            2
        ),
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Relationships

```
users (1) ──── (1) user_stats
  │
  ├── (many) game_sessions
  ├── (many) wrong_answers_inventory
  ├── (1) game_settings
  ├── (many) user_daily_activity
  └── (many) user_achievements
```

---

## Backup and Maintenance

**Recommended Backups:**
- Daily: All user data tables
- Weekly: Full database dump
- Monthly: Archive old game_sessions (>3 months)

**Cleanup Queries:**
```sql
-- Archive old guest sessions (>30 days)
DELETE FROM guest_sessions WHERE last_visit < NOW() - INTERVAL '30 days';

-- Clear mastered wrong answers (>6 months)
DELETE FROM wrong_answers_inventory
WHERE mastered = true AND last_reviewed_at < NOW() - INTERVAL '6 months';
```

---

## Migration History

1. **2026-01-29:** Initial schema creation
2. **2026-01-31:** Added monster_challenge_progress to users
3. **2026-02-01:** Created user_stats, user_daily_activity, game_sessions, user_achievements
4. **2026-02-01:** Created wrong_answers_inventory with spaced repetition
5. **2026-02-09:** Created guest_sessions for anonymous tracking
