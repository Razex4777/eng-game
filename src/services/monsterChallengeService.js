/**
 * Monster Challenge Service
 * Handles fetching questions from Supabase and managing user progress
 */
import { supabase } from '../lib/supabase';

// Get table name based on subject and type
const getTableName = (subject, type) => {
    const validSubjects = ['biology', 'english'];
    const validTypes = ['chapters', 'fullyear', 'halfyear'];

    if (!validSubjects.includes(subject) || !validTypes.includes(type)) {
        throw new Error(`Invalid subject/type: ${subject}/${type}`);
    }

    return `${subject}_${type}`;
};

/**
 * Fetch questions for Monster Challenge from database
 * @param {string} subject - 'biology' or 'english'
 * @param {string} type - 'chapters', 'fullyear', or 'halfyear'
 * @param {number} part - The part number to fetch
 * @param {number} limit - Optional limit on questions (default: all questions in that part)
 * @returns {Promise<{questions: Array, error: Error|null}>}
 */
export const fetchMonsterChallengeQuestions = async (subject, type, part, limit = null) => {
    try {
        const tableName = getTableName(subject, type);

        let query = supabase
            .from(tableName)
            .select('*')
            .eq('part', part)
            .order('question_number', { ascending: true });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

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

        // Shuffle the questions for variety
        const shuffled = shuffleArray(questions);

        return { questions: shuffled, error: null };
    } catch (error) {
        console.error('Error fetching monster challenge questions:', error);
        return { questions: [], error };
    }
};

/**
 * Get user's monster challenge progress
 * @param {string} authId - User's auth ID
 * @returns {Promise<{progress: Object, error: Error|null}>}
 */
export const getUserProgress = async (authId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('monster_challenge_progress, preferred_subject')
            .eq('auth_id', authId)
            .single();

        if (error) throw error;

        return {
            progress: data.monster_challenge_progress,
            preferredSubject: data.preferred_subject,
            error: null
        };
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return { progress: null, preferredSubject: null, error };
    }
};

/**
 * Update user's monster challenge progress after completing a part
 * @param {string} authId - User's auth ID
 * @param {string} subject - 'biology' or 'english'
 * @param {string} type - 'chapters', 'fullyear', or 'halfyear'
 * @param {number} newPart - The new part number to set
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updateUserProgress = async (authId, subject, type, newPart) => {
    try {
        // First, get current progress
        const { progress, error: fetchError } = await getUserProgress(authId);

        if (fetchError) throw fetchError;

        // Update the specific subject/type part
        const updatedProgress = {
            ...progress,
            [subject]: {
                ...progress[subject],
                [type]: newPart
            }
        };

        const { error } = await supabase
            .from('users')
            .update({ monster_challenge_progress: updatedProgress })
            .eq('auth_id', authId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating user progress:', error);
        return { success: false, error };
    }
};

/**
 * Get maximum part number for a subject/type
 * @param {string} subject - 'biology' or 'english'
 * @param {string} type - 'chapters', 'fullyear', or 'halfyear'
 * @returns {Promise<{maxPart: number, error: Error|null}>}
 */
export const getMaxPart = async (subject, type) => {
    try {
        const tableName = getTableName(subject, type);

        const { data, error } = await supabase
            .from(tableName)
            .select('part')
            .order('part', { ascending: false })
            .limit(1);

        if (error) throw error;

        return { maxPart: data?.[0]?.part || 1, error: null };
    } catch (error) {
        console.error('Error fetching max part:', error);
        return { maxPart: 1, error };
    }
};

/**
 * Get part counts for all subject/type combinations
 * For displaying progress to user
 * @returns {Promise<{counts: Object, error: Error|null}>}
 */
export const getAllPartCounts = async () => {
    try {
        // Fetch max parts for each table
        const tables = [
            'biology_chapters', 'biology_fullyear', 'biology_halfyear',
            'english_chapters', 'english_fullyear', 'english_halfyear'
        ];

        const counts = {};

        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('part')
                .order('part', { ascending: false })
                .limit(1);

            if (error) throw error;

            const [subject, type] = table.split('_');
            if (!counts[subject]) counts[subject] = {};
            counts[subject][type] = data?.[0]?.part || 1;
        }

        return { counts, error: null };
    } catch (error) {
        console.error('Error fetching part counts:', error);
        return { counts: null, error };
    }
};

/**
 * Update user analytics after answering a question
 * @param {string} authId - User's auth ID
 * @param {string} subject - 'biology' or 'english'
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const updateUserAnalytics = async (authId, subject, isCorrect) => {
    try {
        // Build the update object dynamically based on subject
        const updateFields = {
            total_questions_answered: supabase.rpc('increment', { x: 1 }),
        };

        if (isCorrect) {
            updateFields.total_correct_answers = supabase.rpc('increment', { x: 1 });
            if (subject === 'biology') {
                updateFields.biology_correct_answers = supabase.rpc('increment', { x: 1 });
            } else if (subject === 'english') {
                updateFields.english_correct_answers = supabase.rpc('increment', { x: 1 });
            }
        } else {
            updateFields.total_wrong_answers = supabase.rpc('increment', { x: 1 });
        }

        if (subject === 'biology') {
            updateFields.biology_questions_answered = supabase.rpc('increment', { x: 1 });
        } else if (subject === 'english') {
            updateFields.english_questions_answered = supabase.rpc('increment', { x: 1 });
        }

        // Use raw SQL for atomic increments
        const { error } = await supabase.rpc('update_user_analytics', {
            p_auth_id: authId,
            p_subject: subject,
            p_is_correct: isCorrect
        });

        if (error) throw error;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error updating analytics:', error);
        return { success: false, error };
    }
};

// Helper function to shuffle array
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export default {
    fetchMonsterChallengeQuestions,
    getUserProgress,
    updateUserProgress,
    getMaxPart,
    getAllPartCounts,
    updateUserAnalytics
};
