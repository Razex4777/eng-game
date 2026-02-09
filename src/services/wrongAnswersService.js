/**
 * Wrong Answers Inventory Service
 * Manages storage and retrieval of wrong answers for user revision
 */

import { supabase } from '../lib/supabase';

/**
 * Get all wrong answers for a user
 * @param {string} userId - The auth user ID
 * @param {string} subject - Optional filter by subject (biology/english)
 */
export const getWrongAnswers = async (userId, subject = null) => {
    if (!userId) return { data: [], error: 'No user ID provided' };

    let query = supabase
        .from('wrong_answers_inventory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (subject) {
        query = query.eq('subject', subject);
    }

    const { data, error } = await query;
    return { data: data || [], error };
};

/**
 * Get wrong answers count for a user
 * @param {string} userId - The auth user ID
 */
export const getWrongAnswersCount = async (userId) => {
    if (!userId) return { count: 0, error: 'No user ID provided' };

    const { count, error } = await supabase
        .from('wrong_answers_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    return { count: count || 0, error };
};

/**
 * Get wrong answers for a specific part
 * @param {string} userId - The auth user ID
 * @param {string} subject - Subject (biology/english)
 * @param {string} questionType - Type (chapters/fullyear/halfyear)
 * @param {number} partNumber - Part number
 */
export const getWrongAnswersForPart = async (userId, subject, questionType, partNumber) => {
    if (!userId) return { data: [], error: 'No user ID provided' };

    const { data, error } = await supabase
        .from('wrong_answers_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('question_type', questionType)
        .eq('part_number', partNumber)
        .order('times_wrong', { ascending: false });

    return { data: data || [], error };
};

/**
 * Add or update a wrong answer in the inventory
 * If the question already exists, increment times_wrong
 * @param {object} wrongAnswer - The wrong answer details
 */
export const addWrongAnswer = async (wrongAnswer) => {
    const {
        userId,
        subject,
        questionType,
        partNumber,
        questionId,
        questionText,
        correctAnswer,
        userAnswer,
        options,
        explanation
    } = wrongAnswer;

    if (!userId) return { error: 'No user ID provided' };

    // Try to upsert (insert or update if exists)
    const { data, error } = await supabase
        .from('wrong_answers_inventory')
        .upsert({
            user_id: userId,
            subject,
            question_type: questionType,
            part_number: partNumber,
            question_id: questionId,
            question_text: questionText,
            correct_answer: correctAnswer,
            user_answer: userAnswer,
            options: JSON.stringify(options),
            explanation,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,subject,question_type,part_number,question_id',
            ignoreDuplicates: false
        })
        .select()
        .single();

    // If it was an update (question already existed), increment times_wrong
    if (data && !error) {
        await supabase
            .from('wrong_answers_inventory')
            .update({
                times_wrong: (data.times_wrong || 1) + 1,
                user_answer: userAnswer,
                updated_at: new Date().toISOString()
            })
            .eq('id', data.id);
    }

    return { data, error };
};

/**
 * Add multiple wrong answers at once (batch insert)
 * @param {string} userId - The auth user ID
 * @param {string} subject - Subject
 * @param {string} questionType - Question type
 * @param {number} partNumber - Part number
 * @param {array} wrongAnswers - Array of wrong answer objects
 */
export const addWrongAnswersBatch = async (userId, subject, questionType, partNumber, wrongAnswers) => {
    console.log('[wrongAnswersService] addWrongAnswersBatch called:', {
        userId,
        subject,
        questionType,
        partNumber,
        wrongAnswersCount: wrongAnswers?.length
    });

    if (!userId || !wrongAnswers?.length) {
        console.warn('[wrongAnswersService] Invalid parameters - userId:', userId, 'wrongAnswers:', wrongAnswers?.length);
        return { error: 'Invalid parameters' };
    }

    const records = wrongAnswers.map((wa, index) => {
        // Ensure question_id is a valid integer
        let questionId = wa.question?.id || wa.questionId;
        if (typeof questionId !== 'number' || !Number.isInteger(questionId)) {
            questionId = index + 1; // Fallback to index-based ID
        }

        const record = {
            user_id: userId,
            subject,
            question_type: questionType,
            part_number: partNumber,
            question_id: questionId,
            question_text: wa.question?.text || wa.question?.q || wa.questionText || 'Unknown',
            correct_answer: wa.question?.options?.[wa.question?.correct] || wa.correctAnswer || 'Unknown',
            user_answer: wa.userAnswer || 'No answer',
            options: JSON.stringify(wa.question?.options || wa.options || []),
            explanation: wa.question?.explanation || wa.explanation || null
        };

        console.log('[wrongAnswersService] Record prepared:', record);
        return record;
    });

    console.log('[wrongAnswersService] Inserting records:', records.length);

    const { data, error } = await supabase
        .from('wrong_answers_inventory')
        .upsert(records, {
            onConflict: 'user_id,subject,question_type,part_number,question_id',
            ignoreDuplicates: false
        });

    if (error) {
        console.error('[wrongAnswersService] Supabase error:', error);
    } else {
        console.log('[wrongAnswersService] Insert successful:', data);
    }

    return { data, error };
};

/**
 * Clear all wrong answers for a specific part (when user wins)
 * @param {string} userId - The auth user ID
 * @param {string} subject - Subject
 * @param {string} questionType - Question type
 * @param {number} partNumber - Part number
 */
export const clearWrongAnswersForPart = async (userId, subject, questionType, partNumber) => {
    if (!userId) return { error: 'No user ID provided' };

    // Use the SQL function for atomic deletion
    const { data, error } = await supabase
        .rpc('clear_wrong_answers_for_part', {
            p_user_id: userId,
            p_subject: subject,
            p_question_type: questionType,
            p_part_number: partNumber
        });

    return { deletedCount: data || 0, error };
};

/**
 * Delete a specific wrong answer
 * @param {string} wrongAnswerId - The wrong answer record ID
 */
export const deleteWrongAnswer = async (wrongAnswerId) => {
    const { error } = await supabase
        .from('wrong_answers_inventory')
        .delete()
        .eq('id', wrongAnswerId);

    return { error };
};

/**
 * Clear all wrong answers for a user
 * @param {string} userId - The auth user ID
 */
export const clearAllWrongAnswers = async (userId) => {
    if (!userId) return { error: 'No user ID provided' };

    const { error } = await supabase
        .from('wrong_answers_inventory')
        .delete()
        .eq('user_id', userId);

    return { error };
};
