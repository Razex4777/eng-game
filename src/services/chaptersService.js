/**
 * Chapters & Reviews Service
 * Handles fetching questions for Chapters (الفصول) and Reviews (المراجعات)
 * Maps Supabase tables to UI structure
 */
import { supabase } from '../lib/supabase';

// ===== CONFIGURATION =====

// Maps UI chapters to database parts for each subject
// This can be managed from Supabase later for dynamic configuration
const CHAPTER_CONFIG = {
    english: {
        // For english_chapters: 24 parts, grouped into 8 chapters (3 parts each)
        chapters: {
            1: { parts: [1, 2, 3], name: 'الفصل الأول' },
            2: { parts: [4, 5, 6], name: 'الفصل الثاني' },
            3: { parts: [7, 8, 9], name: 'الفصل الثالث' },
            4: { parts: [10, 11, 12], name: 'الفصل الرابع' },
            5: { parts: [13, 14, 15], name: 'الفصل الخامس' },
            6: { parts: [16, 17, 18], name: 'الفصل السادس' },
            7: { parts: [19, 20, 21], name: 'الفصل السابع' },
            8: { parts: [22, 23, 24], name: 'الفصل الثامن' }
        },
        halfyear: { totalParts: 13, name: 'مراجعة نصف السنة' },
        fullyear: { totalParts: 25, name: 'المراجعة الشاملة' }
    },
    biology: {
        // For biology_chapters: 12 parts, grouped into 8 chapters
        chapters: {
            1: { parts: [1, 2], name: 'الفصل الأول' },
            2: { parts: [3], name: 'الفصل الثاني' },
            3: { parts: [4], name: 'الفصل الثالث' },
            4: { parts: [5, 6], name: 'الفصل الرابع' },
            5: { parts: [7], name: 'الفصل الخامس' },
            6: { parts: [8, 9], name: 'الفصل السادس' },
            7: { parts: [10, 11], name: 'الفصل السابع' },
            8: { parts: [12], name: 'الفصل الثامن' }
        },
        halfyear: { totalParts: 8, name: 'مراجعة نصف السنة' },
        fullyear: { totalParts: 10, name: 'المراجعة الشاملة' }
    }
};

// ===== TABLE HELPERS =====

const getTableName = (subject, type) => {
    const validSubjects = ['biology', 'english'];
    const validTypes = ['chapters', 'fullyear', 'halfyear'];

    if (!validSubjects.includes(subject) || !validTypes.includes(type)) {
        throw new Error(`Invalid subject/type: ${subject}/${type}`);
    }

    return `${subject}_${type}`;
};

// ===== QUESTION FETCHING =====

/**
 * Fetch questions for a specific part (level/stage)
 * @param {string} subject - 'biology' or 'english'
 * @param {string} type - 'chapters', 'fullyear', or 'halfyear'
 * @param {number} part - The part number to fetch
 * @returns {Promise<{questions: Array, error: Error|null}>}
 */
export const fetchQuestionsForPart = async (subject, type, part) => {
    try {
        const tableName = getTableName(subject, type);

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('part', part)
            .order('question_number', { ascending: true });

        if (error) throw error;

        // Transform to game-ready format
        const questions = data.map(q => ({
            id: q.id,
            questionNumber: q.question_number,
            question: q.question_text,
            type: q.question_type,
            options: {
                a: q.option_a,
                b: q.option_b,
                c: q.option_c,
                d: q.option_d
            },
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            part: q.part
        }));

        return { questions, error: null };
    } catch (error) {
        console.error('Error fetching questions:', error);
        return { questions: [], error };
    }
};

/**
 * Fetch all questions for a chapter (all parts in that chapter)
 * @param {string} subject - 'biology' or 'english'
 * @param {number} chapterNum - Chapter number (1-8)
 * @returns {Promise<{questions: Array, parts: number[], error: Error|null}>}
 */
export const fetchQuestionsForChapter = async (subject, chapterNum) => {
    try {
        const config = CHAPTER_CONFIG[subject]?.chapters?.[chapterNum];
        if (!config) {
            throw new Error(`Invalid chapter ${chapterNum} for ${subject}`);
        }

        const tableName = getTableName(subject, 'chapters');
        const { parts } = config;

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .in('part', parts)
            .order('part', { ascending: true })
            .order('question_number', { ascending: true });

        if (error) throw error;

        // Transform to game-ready format
        const questions = data.map(q => ({
            id: q.id,
            questionNumber: q.question_number,
            question: q.question_text,
            type: q.question_type,
            options: {
                a: q.option_a,
                b: q.option_b,
                c: q.option_c,
                d: q.option_d
            },
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            part: q.part
        }));

        return { questions, parts, error: null };
    } catch (error) {
        console.error('Error fetching chapter questions:', error);
        return { questions: [], parts: [], error };
    }
};

// ===== STRUCTURE & COUNTS =====

/**
 * Get the structure of chapters for a subject
 * Returns chapter info with part counts and question counts
 * @param {string} subject - 'biology' or 'english'
 * @returns {Promise<{chapters: Object, error: Error|null}>}
 */
export const getChaptersStructure = async (subject) => {
    try {
        const config = CHAPTER_CONFIG[subject];
        if (!config) throw new Error(`Invalid subject: ${subject}`);

        const tableName = getTableName(subject, 'chapters');

        // Get question counts per part
        const { data, error } = await supabase
            .from(tableName)
            .select('part');

        if (error) throw error;

        // Count questions per part
        const partCounts = data.reduce((acc, row) => {
            acc[row.part] = (acc[row.part] || 0) + 1;
            return acc;
        }, {});

        // Build chapters object with counts
        const chapters = {};
        for (const [chapterNum, chapterConfig] of Object.entries(config.chapters)) {
            const partsInfo = chapterConfig.parts.map(part => ({
                part,
                questionCount: partCounts[part] || 0
            }));

            chapters[chapterNum] = {
                name: chapterConfig.name,
                parts: partsInfo,
                totalQuestions: partsInfo.reduce((sum, p) => sum + p.questionCount, 0)
            };
        }

        return { chapters, error: null };
    } catch (error) {
        console.error('Error fetching chapters structure:', error);
        return { chapters: {}, error };
    }
};

/**
 * Get the structure for reviews (halfyear/fullyear)
 * @param {string} subject - 'biology' or 'english'
 * @param {string} type - 'halfyear' or 'fullyear'
 * @returns {Promise<{parts: Array, error: Error|null}>}
 */
export const getReviewsStructure = async (subject, type) => {
    try {
        const tableName = getTableName(subject, type);

        // Get distinct parts and their question counts
        const { data, error } = await supabase
            .from(tableName)
            .select('part');

        if (error) throw error;

        // Count questions per part
        const partCounts = data.reduce((acc, row) => {
            acc[row.part] = (acc[row.part] || 0) + 1;
            return acc;
        }, {});

        // Build parts array
        const parts = Object.entries(partCounts)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([part, count]) => ({
                part: Number(part),
                questionCount: count
            }));

        return { parts, error: null };
    } catch (error) {
        console.error('Error fetching reviews structure:', error);
        return { parts: [], error };
    }
};

// ===== USER PROGRESS =====

/**
 * Get user's progress for chapters/reviews
 * Uses user_stats.subject_progress JSONB
 * @param {string} userId - User's UUID
 * @param {string} subject - 'biology' or 'english'
 * @returns {Promise<{progress: Object, error: Error|null}>}
 */
export const getUserChapterProgress = async (userId, subject) => {
    try {
        const { data, error } = await supabase
            .from('user_stats')
            .select('subject_progress')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

        const progress = data?.subject_progress?.[subject] || {};

        return { progress, error: null };
    } catch (error) {
        console.error('Error fetching user chapter progress:', error);
        return { progress: {}, error };
    }
};

/**
 * Calculate progress percentage for a chapter based on completed parts
 * @param {string} subject - 'biology' or 'english'
 * @param {number} chapterNum - Chapter number
 * @param {Object} userProgress - User's progress object
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateChapterProgress = (subject, chapterNum, userProgress) => {
    const config = CHAPTER_CONFIG[subject]?.chapters?.[chapterNum];
    if (!config) return 0;

    const { parts } = config;
    const chaptersProgress = userProgress?.chapters || {};

    let completedParts = 0;
    for (const part of parts) {
        if (chaptersProgress[part]?.completed) {
            completedParts++;
        }
    }

    return Math.round((completedParts / parts.length) * 100);
};

/**
 * Get the next part to play in a chapter
 * @param {string} subject - 'biology' or 'english'
 * @param {number} chapterNum - Chapter number
 * @param {Object} userProgress - User's progress object
 * @returns {number|null} - Next part number, or null if chapter is complete
 */
export const getNextPartInChapter = (subject, chapterNum, userProgress) => {
    const config = CHAPTER_CONFIG[subject]?.chapters?.[chapterNum];
    if (!config) return null;

    const { parts } = config;
    const chaptersProgress = userProgress?.chapters || {};

    for (const part of parts) {
        if (!chaptersProgress[part]?.completed) {
            return part;
        }
    }

    return null; // All parts completed
};

/**
 * Update user's progress after completing a part
 * @param {string} userId - User's UUID
 * @param {string} subject - 'biology' or 'english'
 * @param {string} type - 'chapters', 'halfyear', or 'fullyear'
 * @param {number} part - Part number completed
 * @param {Object} partData - Data about the completion (score, stars, etc.)
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updatePartProgress = async (userId, subject, type, part, partData) => {
    try {
        // Get current progress
        const { data: userData, error: fetchError } = await supabase
            .from('user_stats')
            .select('subject_progress')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        const currentProgress = userData?.subject_progress || {};

        // Update the nested structure
        const updatedProgress = {
            ...currentProgress,
            [subject]: {
                ...(currentProgress[subject] || {}),
                [type]: {
                    ...(currentProgress[subject]?.[type] || {}),
                    [part]: {
                        completed: true,
                        score: partData.score || 0,
                        stars: partData.stars || 0,
                        completedAt: new Date().toISOString(),
                        attempts: (currentProgress[subject]?.[type]?.[part]?.attempts || 0) + 1
                    }
                }
            }
        };

        const { error: updateError } = await supabase
            .from('user_stats')
            .upsert({
                user_id: userId,
                subject_progress: updatedProgress,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (updateError) throw updateError;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating part progress:', error);
        return { success: false, error };
    }
};

// ===== UTILS =====

/**
 * Get configuration for a specific subject
 * @param {string} subject - 'biology' or 'english'
 * @returns {Object} - Configuration object
 */
export const getSubjectConfig = (subject) => {
    return CHAPTER_CONFIG[subject] || null;
};

/**
 * Check if a chapter is unlocked based on previous chapter completion
 * @param {string} subject - 'biology' or 'english'
 * @param {number} chapterNum - Chapter to check
 * @param {Object} userProgress - User's progress object
 * @returns {boolean}
 */
export const isChapterUnlocked = (subject, chapterNum, userProgress) => {
    // Chapter 0 (Demo) is always unlocked
    if (chapterNum === 0) return true;

    // Chapter 1 is always unlocked
    if (chapterNum === 1) return true;

    // Check if previous chapter is completed
    const prevChapterProgress = calculateChapterProgress(subject, chapterNum - 1, userProgress);
    return prevChapterProgress === 100;
};

/**
 * Get user's overall subject progress percentage
 * @param {string} subject - 'biology' or 'english'
 * @param {Object} userProgress - User's progress object
 * @returns {number} - Overall progress (0-100)
 */
export const getOverallSubjectProgress = (subject, userProgress) => {
    const config = CHAPTER_CONFIG[subject];
    if (!config) return 0;

    const chapters = Object.keys(config.chapters);
    let totalParts = 0;
    let completedParts = 0;

    for (const chapterNum of chapters) {
        const chapterConfig = config.chapters[chapterNum];
        totalParts += chapterConfig.parts.length;

        for (const part of chapterConfig.parts) {
            if (userProgress?.chapters?.[part]?.completed) {
                completedParts++;
            }
        }
    }

    return totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;
};

export default {
    fetchQuestionsForPart,
    fetchQuestionsForChapter,
    getChaptersStructure,
    getReviewsStructure,
    getUserChapterProgress,
    calculateChapterProgress,
    getNextPartInChapter,
    updatePartProgress,
    getSubjectConfig,
    isChapterUnlocked,
    getOverallSubjectProgress
};
