# API Reference

## Service Layer Documentation

This document describes all service functions for interacting with Supabase backend.

---

## chaptersService.js

### fetchQuestionsForPart()
Fetches questions for a specific part from the database.

```javascript
fetchQuestionsForPart(subject, type, part)
```

**Parameters:**
- `subject` (string): 'english' or 'biology'
- `type` (string): 'chapters', 'halfyear', or 'fullyear'
- `part` (number): Part number (1-12)

**Returns:**
```javascript
{
  success: boolean,
  questions: Array<{
    id: string,
    question: string,
    option_a: string,
    option_b: string,
    option_c: string,
    option_d: string,
    correct_answer: string,
    explanation: string
  }>,
  error?: string
}
```

---

### getChaptersStructure()
Gets chapter structure with part counts.

```javascript
getChaptersStructure(subject)
```

**Parameters:**
- `subject` (string): 'english' or 'biology'

**Returns:**
```javascript
{
  success: boolean,
  chapters: Array<{
    number: number,
    totalParts: number,
    totalQuestions: number
  }>,
  error?: string
}
```

---

### getUserChapterProgress()
Gets user's progress for all chapters.

```javascript
getUserChapterProgress(userId, subject)
```

**Parameters:**
- `userId` (string): User UUID
- `subject` (string): 'english' or 'biology'

**Returns:**
```javascript
{
  success: boolean,
  progress: {
    [chapterNumber]: {
      part: number,
      completed: boolean,
      stars: number
    }
  },
  error?: string
}
```

---

### updatePartProgress()
Updates user progress after completing a part.

```javascript
updatePartProgress(userId, subject, type, part, data)
```

**Parameters:**
- `userId` (string): User UUID
- `subject` (string): 'english' or 'biology'
- `type` (string): 'chapters', 'halfyear', or 'fullyear'
- `part` (number): Part number
- `data` (object): { stars, completed }

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

## monsterChallengeService.js

### getUserProgress()
Gets user's Monster Challenge progress.

```javascript
getUserProgress(authId)
```

**Parameters:**
- `authId` (string): Supabase Auth ID

**Returns:**
```javascript
{
  success: boolean,
  progress: {
    english: { fullyear: number },
    biology: { fullyear: number }
  },
  error?: string
}
```

---

### getAllPartCounts()
Gets total part counts for all subjects and types.

```javascript
getAllPartCounts()
```

**Returns:**
```javascript
{
  success: boolean,
  counts: {
    english: {
      chapters: number,
      halfyear: number,
      fullyear: number
    },
    biology: { ... }
  },
  error?: string
}
```

---

### getLastAttemptScore()
Gets user's last attempt score for a specific challenge.

```javascript
getLastAttemptScore(userId, subject, type)
```

**Parameters:**
- `userId` (string): User UUID
- `subject` (string): 'english' or 'biology'
- `type` (string): 'fullyear' (Monster Challenge only)

**Returns:**
```javascript
{
  success: boolean,
  score: number,
  error?: string
}
```

---

### getHighScore()
Gets user's highest score for a specific challenge.

```javascript
getHighScore(userId, subject, type)
```

**Parameters:**
- `userId` (string): User UUID
- `subject` (string): 'english' or 'biology'
- `type` (string): 'fullyear'

**Returns:**
```javascript
{
  success: boolean,
  highScore: number,
  error?: string
}
```

---

## userProgressService.js

### getUserDashboardStats()
Gets comprehensive dashboard statistics for a user.

```javascript
getUserDashboardStats(userId)
```

**Parameters:**
- `userId` (string): User UUID

**Returns:**
```javascript
{
  success: boolean,
  stats: {
    totalXP: number,
    currentLevel: number,
    streakDays: number,
    totalQuestions: number,
    accuracy: number,
    lastPlayedPart: {
      subject: string,
      type: string,
      chapterNumber: number,
      part: number
    },
    overallProgress: number  // 0-100%
  },
  error?: string
}
```

---

### initializeUserStats()
Initializes stats for a new user.

```javascript
initializeUserStats(userId)
```

**Parameters:**
- `userId` (string): User UUID

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

### recordGameSession()
Records a completed game session.

```javascript
recordGameSession(userId, sessionData)
```

**Parameters:**
- `userId` (string): User UUID
- `sessionData` (object):
```javascript
{
  subject: string,
  gameType: string,  // 'chapters', 'halfyear', 'fullyear', 'monster'
  chapterNumber: number,  // null for reviews
  partNumber: number,
  score: number,
  totalQuestions: number,
  correctAnswers: number,
  wrongAnswers: number,
  accuracy: number,
  duration: number,  // seconds
  xpEarned: number,
  comboMax: number,
  powerupsUsed: { freeze: number, bomb: number },
  mistakesCount: number,
  completed: boolean
}
```

**Returns:**
```javascript
{
  success: boolean,
  sessionId: string,
  error?: string
}
```

---

### updateStatsAfterGame()
Updates user stats after game completion (XP, streak, progress).

```javascript
updateStatsAfterGame(userId, gameData)
```

**Parameters:**
- `userId` (string): User UUID
- `gameData` (object):
```javascript
{
  xpEarned: number,
  questionsAnswered: number,
  correctAnswers: number,
  subject: string,
  type: string,
  part: number,
  completed: boolean
}
```

**Returns:**
```javascript
{
  success: boolean,
  newLevel?: number,  // If leveled up
  error?: string
}
```

---

### getLastPlayedPart()
Gets the last played part for Continue Journey feature.

```javascript
getLastPlayedPart(userId, subject)
```

**Parameters:**
- `userId` (string): User UUID
- `subject` (string): 'english' or 'biology'

**Returns:**
```javascript
{
  success: boolean,
  part: {
    type: string,
    chapterNumber: number,
    part: number
  },
  error?: string
}
```

---

### getOverallProgress()
Calculates overall completion percentage.

```javascript
getOverallProgress(userId)
```

**Parameters:**
- `userId` (string): User UUID

**Returns:**
```javascript
{
  success: boolean,
  progress: number,  // 0-100
  error?: string
}
```

---

### checkAndUpdateStreak()
Checks and updates user's daily streak.

```javascript
checkAndUpdateStreak(userId)
```

**Parameters:**
- `userId` (string): User UUID

**Returns:**
```javascript
{
  success: boolean,
  streakDays: number,
  streakBroken: boolean,
  error?: string
}
```

---

### getTodayActivity()
Gets today's activity for daily tasks.

```javascript
getTodayActivity(userId)
```

**Parameters:**
- `userId` (string): User UUID

**Returns:**
```javascript
{
  success: boolean,
  activity: {
    questionsAnswered: number,
    xpEarned: number,
    tasksCompleted: string[],
    dailyGoalReached: boolean
  },
  error?: string
}
```

---

### completeDailyTask()
Marks a daily task as completed.

```javascript
completeDailyTask(userId, taskId)
```

**Parameters:**
- `userId` (string): User UUID
- `taskId` (string): 'stage1' or 'stage2'

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

### unlockAchievement()
Unlocks an achievement for a user.

```javascript
unlockAchievement(userId, achievementId)
```

**Parameters:**
- `userId` (string): User UUID
- `achievementId` (string): Achievement identifier

**Returns:**
```javascript
{
  success: boolean,
  xpReward: number,
  error?: string
}
```

---

### getUserAchievements()
Gets all unlocked achievements.

```javascript
getUserAchievements(userId)
```

**Returns:**
```javascript
{
  success: boolean,
  achievements: Array<{
    id: string,
    unlockedAt: timestamp,
    xpReward: number
  }>,
  error?: string
}
```

---

### getRecentGames()
Gets recent game sessions.

```javascript
getRecentGames(userId, limit = 10)
```

**Returns:**
```javascript
{
  success: boolean,
  sessions: Array<GameSession>,
  error?: string
}
```

---

### getBestScores()
Gets best scores by subject.

```javascript
getBestScores(userId, subject)
```

**Returns:**
```javascript
{
  success: boolean,
  scores: {
    chapters: number,
    halfyear: number,
    fullyear: number
  },
  error?: string
}
```

---

## wrongAnswersService.js

### getWrongAnswers()
Gets all wrong answers for a user with optional filters.

```javascript
getWrongAnswers(userId, filters)
```

**Parameters:**
- `userId` (string): User UUID
- `filters` (object, optional):
```javascript
{
  subject?: string,
  questionType?: string,
  partNumber?: number
}
```

**Returns:**
```javascript
{
  success: boolean,
  wrongAnswers: Array<{
    id: string,
    subject: string,
    questionType: string,
    partNumber: number,
    questionText: string,
    correctAnswer: string,
    userAnswer: string,
    options: string[],
    explanation: string,
    reviewCount: number,
    mastered: boolean
  }>,
  error?: string
}
```

---

### addWrongAnswer()
Adds a single wrong answer to inventory.

```javascript
addWrongAnswer(userId, answerData)
```

**Parameters:**
- `userId` (string): User UUID
- `answerData` (object):
```javascript
{
  subject: string,
  questionType: string,
  partNumber: number,
  questionText: string,
  correctAnswer: string,
  userAnswer: string,
  options: string[],
  explanation: string
}
```

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

### addWrongAnswersBatch()
Adds multiple wrong answers at once.

```javascript
addWrongAnswersBatch(userId, answers)
```

**Parameters:**
- `userId` (string): User UUID
- `answers` (array): Array of answerData objects

**Returns:**
```javascript
{
  success: boolean,
  count: number,
  error?: string
}
```

---

### clearWrongAnswersForPart()
Clears wrong answers after winning a part.

```javascript
clearWrongAnswersForPart(userId, subject, partNumber)
```

**Returns:**
```javascript
{
  success: boolean,
  deletedCount: number,
  error?: string
}
```

---

### deleteWrongAnswer()
Deletes a specific wrong answer.

```javascript
deleteWrongAnswer(wrongAnswerId)
```

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

## gameSettingsService.js

### SPEED_MODES
Configuration object for game speed multipliers.

```javascript
const SPEED_MODES = {
  slow: { multiplier: 1.5, label: '🐢 بطيء' },
  normal: { multiplier: 1.0, label: '⚡ عادي' },
  fast: { multiplier: 0.7, label: '🚀 سريع' },
  insane: { multiplier: 0.4, label: '🤯 جنوني' }
};
```

---

### getGameSettings()
Gets user's game settings.

```javascript
getGameSettings(userId)
```

**Returns:**
```javascript
{
  success: boolean,
  settings: {
    soundEnabled: boolean,
    hapticsEnabled: boolean,
    gameSpeed: string,
    theme: string
  },
  error?: string
}
```

---

### updateGameSettings()
Updates user's game settings.

```javascript
updateGameSettings(userId, settings)
```

**Parameters:**
- `userId` (string): User UUID
- `settings` (object): Partial settings object

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

## messagesService.js

### fetchEncouragementMessages()
Fetches all encouragement messages from database.

```javascript
fetchEncouragementMessages()
```

**Returns:**
```javascript
{
  success: boolean,
  messages: Array<{
    id: string,
    messageAr: string,
    messageEn: string,
    context: string,
    minStreak: number
  }>,
  error?: string
}
```

---

## guestTrackingService.js

### trackGuestSession()
Tracks anonymous guest session data.

```javascript
trackGuestSession(sessionData)
```

**Parameters:**
- `sessionData` (object):
```javascript
{
  sessionId: string,  // Browser fingerprint
  subject: string,
  questionsAnswered: number,
  correctAnswers: number
}
```

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

### getGuestAnalytics()
Gets aggregated guest analytics.

```javascript
getGuestAnalytics()
```

**Returns:**
```javascript
{
  success: boolean,
  analytics: {
    totalSessions: number,
    averageAccuracy: number,
    popularSubject: string
  },
  error?: string
}
```

---

## analyticsService.js

### getMostWrongQuestions()
Gets the most frequently answered incorrectly questions.

```javascript
getMostWrongQuestions(limit = 10)
```

**Parameters:**
- `limit` (number): Number of questions to return

**Returns:**
```javascript
{
  success: boolean,
  questions: Array<{
    questionText: string,
    wrongCount: number,
    subject: string
  }>,
  error?: string
}
```

---

### trackQuestionAnalytics()
Tracks question performance for analytics.

```javascript
trackQuestionAnalytics(questionId, correct)
```

**Parameters:**
- `questionId` (string): Question UUID
- `correct` (boolean): Whether user answered correctly

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

## Error Handling

All service functions follow a consistent error handling pattern:

```javascript
try {
  // Operation
  return { success: true, data: result };
} catch (error) {
  console.error('Service error:', error);
  return {
    success: false,
    error: error.message || 'Unknown error'
  };
}
```

**Client Usage:**
```javascript
const result = await serviceFunction(params);

if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  showToast(result.error, 'error');
}
```

---

## Rate Limiting & Performance

- All queries use Supabase's built-in connection pooling
- Batch operations preferred over multiple single queries
- Index usage optimized for common query patterns
- RLS policies enforced at database level for security

**Best Practices:**
1. Always handle errors gracefully
2. Show loading states during async operations
3. Cache frequently accessed data (e.g., SPEED_MODES)
4. Use optimistic UI updates where possible
5. Batch database writes when applicable
