// ====================================
// ENGLISH MASTERY BATTLE - COMPLETE QUESTIONS DATABASE
// ====================================
// 30 Stages - 540 Questions Total
// Iraqi Ministry Curriculum - 6th Grade Preparatory
// Auto-generated from ministerial exam questions (2014-2024)
// ====================================

// This file provides the structure to merge all 3 parts
// Load questions-part1.js, questions-part2.js, questions-part3.js first
// Then this file will combine them automatically

const questionsData = {};

// Function to merge all parts when loaded
function initializeQuestionsDatabase() {
    // Merge all parts into one object
    if (typeof questionsPart1 !== 'undefined') {
        Object.assign(questionsData, questionsPart1);
    }
    if (typeof questionsPart2 !== 'undefined') {
        Object.assign(questionsData, questionsPart2);
    }
    if (typeof questionsPart3 !== 'undefined') {
        Object.assign(questionsData, questionsPart3);
    }
    
    console.log('✅ Questions Database Initialized');
    console.log(`📊 Total Stages: ${Object.keys(questionsData).length}`);
    console.log(`📊 Total Questions: ${getTotalQuestions()}`);
    
    return questionsData;
}

// ====================================
// HELPER FUNCTIONS
// ====================================

function getStageQuestions(stageNumber) {
    const stageKey = `stage${stageNumber}`;
    return questionsData[stageKey] || [];
}

function getGoldenQuestions(stageNumber) {
    const questions = getStageQuestions(stageNumber);
    return questions.filter(q => q.golden === 1);
}

function getMostRepeatedQuestions(stageNumber, minRepeat = 3) {
    const questions = getStageQuestions(stageNumber);
    return questions.filter(q => q.repeat >= minRepeat);
}

function getAllGoldenQuestions() {
    let allGolden = [];
    for (let i = 1; i <= 30; i++) {
        allGolden = allGolden.concat(getGoldenQuestions(i));
    }
    return allGolden;
}

function getTotalQuestions() {
    let total = 0;
    for (let i = 1; i <= 30; i++) {
        total += getStageQuestions(i).length;
    }
    return total;
}

function getRandomQuestions(stageNumber, count = 10) {
    const questions = getStageQuestions(stageNumber);
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// ====================================
// LEGACY FUNCTIONS (Stubs - Firebase removed)
// Data now saved via Supabase in game.html
// ====================================

// Stub functions for backward compatibility
async function saveUserProgress(userId, stageNumber, score, xp, stars) {
    console.log(`📝 [Stub] Progress would be saved: Stage ${stageNumber}`);
    // Actual saving is done via Supabase in game.html
}

async function loadUserProgress(userId) {
    console.log('📥 [Stub] Progress would be loaded');
    return null; // Loaded via Supabase in index.html
}

async function saveUserStats(userId, totalXP, currentStage) {
    console.log('📝 [Stub] Stats would be saved');
    // Actual saving is done via Supabase
}

// ====================================
// EXPORT
// ====================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        questionsData,
        initializeQuestionsDatabase,
        getStageQuestions, 
        getGoldenQuestions, 
        getMostRepeatedQuestions,
        getAllGoldenQuestions,
        getTotalQuestions,
        getRandomQuestions,
        saveUserProgress,
        loadUserProgress,
        saveUserStats
    };
}
