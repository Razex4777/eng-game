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

    // First, check if record already exists
    const { data: existing } = await supabase
        .from('wrong_answers_inventory')
        .select('id, times_wrong')
        .eq('user_id', userId)
        .eq('subject', subject)
        .eq('question_type', questionType)
        .eq('part_number', partNumber)
        .eq('question_id', questionId)
        .single();

    if (existing) {
        // UPDATE: Increment times_wrong for existing record
        const { data, error } = await supabase
            .from('wrong_answers_inventory')
            .update({
                times_wrong: (existing.times_wrong || 1) + 1,
                user_answer: userAnswer,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

        return { data, error };
    } else {
        // INSERT: Create new record with times_wrong = 1
        const { data, error } = await supabase
            .from('wrong_answers_inventory')
            .insert({
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
                times_wrong: 1,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        return { data, error };
    }
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
        // Use question_number from the database (integer ID)
        let questionId = wa.question?.question_number || wa.question?.id;
        if (typeof questionId !== 'number' || !Number.isInteger(questionId)) {
            console.warn('[wrongAnswersService] Missing question_number, using index:', wa);
            questionId = index + 1; // Fallback to index-based ID
        }

        // CRITICAL FIX: Store the original database letter (a/b/c/d) instead of shuffled text
        // This allows us to fetch the REAL correct answer from database later
        const correctAnswerLetter = wa.question?.correctAnswer || wa.question?.correct_answer;

        // Also store the text for backward compatibility
        const correctAnswerText = wa.question?.options?.[wa.question?.correct];

        const record = {
            user_id: userId,
            subject,
            question_type: questionType,
            part_number: partNumber,
            question_id: questionId, // This is question_number (integer)
            question_text: wa.question?.text || wa.question?.q || wa.questionText || 'Unknown',
            correct_answer: correctAnswerLetter || correctAnswerText || 'Unknown', // Store letter (a/b/c/d)
            user_answer: wa.userAnswer || 'No answer',
            options: JSON.stringify(wa.question?.options || wa.options || []), // Store shuffled options for reference
            explanation: wa.question?.explanation || wa.explanation || null
        };

        console.log('[wrongAnswersService] Record prepared:', {
            questionText: record.question_text,
            questionNumber: questionId,
            correctAnswerLetter: correctAnswerLetter,
            correctAnswerText: correctAnswerText,
            userAnswer: record.user_answer
        });
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

/**
 * Get the REAL correct answer from the original database question
 * This prevents corruption from shuffled options
 * @param {string} subject - Subject (biology/english)
 * @param {string} questionType - Type (chapters/fullyear/halfyear)
 * @param {number} questionNumber - Question number from database
 * @returns {object} { correctAnswerText, explanation, options }
 */
export const getRealCorrectAnswer = async (subject, questionType, questionNumber) => {
    console.log('[wrongAnswersService] getRealCorrectAnswer:', { subject, questionType, questionNumber });

    try {
        const tableName = `${subject}_${questionType}`;

        const { data, error } = await supabase
            .from(tableName)
            .select('option_a, option_b, option_c, option_d, correct_answer, explanation')
            .eq('question_number', questionNumber)
            .single();

        if (error || !data) {
            console.error('[wrongAnswersService] Failed to fetch real answer:', error);
            return { correctAnswerText: null, explanation: null, options: [] };
        }

        // Map the letter (a/b/c/d) to the actual text
        const optionsMap = {
            'a': data.option_a,
            'b': data.option_b,
            'c': data.option_c,
            'd': data.option_d
        };

        const correctAnswerLetter = (data.correct_answer || 'a').toLowerCase(); // Handle case insensitivity + null safety
        const correctAnswerText = optionsMap[correctAnswerLetter];

        console.log('[wrongAnswersService] Real answer fetched:', {
            letter: correctAnswerLetter,
            text: correctAnswerText
        });

        return {
            correctAnswerText,
            explanation: data.explanation,
            options: [data.option_a, data.option_b, data.option_c, data.option_d],
            correctAnswerLetter
        };
    } catch (err) {
        console.error('[wrongAnswersService] getRealCorrectAnswer exception:', err);
        return { correctAnswerText: null, explanation: null, options: [] };
    }
};



/**
 * Get due reviews for a user (spaced repetition)
 * @param {string} userId - The auth user ID
 * @param {string} subject - Optional filter by subject (biology/english)
 * @param {number} limit - Maximum number of reviews to return
 * @returns {object} { data: reviews[], error }
 */
export const getDueReviews = async (userId, subject = null, limit = 50) => {
    console.log('[wrongAnswersService] getDueReviews called:', { userId, subject, limit });

    if (!userId) return { data: [], error: 'No user ID provided' };

    try {
        const now = new Date().toISOString();

        let query = supabase
            .from('wrong_answers_inventory')
            .select('*')
            .eq('user_id', userId)
            .lt('repetition_count', 4)
            .or(`next_review_at.is.null,next_review_at.lte.${now}`)
            .order('next_review_at', { ascending: true, nullsFirst: true })
            .limit(limit);

        if (subject) {
            query = query.eq('subject', subject);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[wrongAnswersService] getDueReviews error:', error);
            return { data: [], error };
        }

        console.log('[wrongAnswersService] getDueReviews success:', data?.length);
        return { data: data || [], error: null };
    } catch (err) {
        console.error('[wrongAnswersService] getDueReviews exception:', err);
        return { data: [], error: err.message };
    }
};

/**
 * Get random questions from the same chapter (excluding already wrong ones)
 * @param {string} subject - Subject (biology/english)
 * @param {string} questionType - Type (chapters/fullyear/halfyear)
 * @param {number} partNumber - Part number
 * @param {array} excludeQuestionIds - Question IDs to exclude
 * @param {number} count - Number of questions to return
 * @returns {object} { questions: [], error }
 */
export const getRandomQuestionsFromSameChapter = async (
    subject,
    questionType,
    partNumber,
    excludeQuestionIds = [],
    count = 5
) => {
    console.log('[wrongAnswersService] getRandomQuestionsFromSameChapter:', {
        subject,
        questionType,
        partNumber,
        excludeQuestionIds,
        count
    });

    try {
        const tableName = `${subject}_${questionType}`;

        let query = supabase
            .from(tableName)
            .select('*')
            .eq('part', partNumber);

        // Exclude questions that are already in wrong answers
        // Use question_number (integer) not id (UUID)
        if (excludeQuestionIds.length > 0) {
            query = query.not('question_number', 'in', `(${excludeQuestionIds.join(',')})`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[wrongAnswersService] getRandomQuestionsFromSameChapter error:', error);
            return { questions: [], error };
        }

        if (!data || data.length === 0) {
            console.warn('[wrongAnswersService] No questions found in this part');
            return { questions: [], error: null };
        }

        // Import shuffleArray dynamically
        const { shuffleArray } = await import('../utils/helpers.js');

        // Shuffle and take first 'count' items
        const shuffled = shuffleArray(data);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        // Transform to game format (raw DB columns: question_text, option_a, correct_answer, etc.)
        const transformedQuestions = selected.map(q => ({
            id: q.id,
            q: q.question_text,
            text: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correct: ['a', 'b', 'c', 'd'].indexOf((q.correct_answer || 'a').toLowerCase()),
            explanation: q.explanation,
            type: q.question_type || 'text',
            difficulty: 'medium'
        }));

        console.log('[wrongAnswersService] Selected random questions:', transformedQuestions.length);
        return { questions: transformedQuestions, error: null };
    } catch (err) {
        console.error('[wrongAnswersService] getRandomQuestionsFromSameChapter exception:', err);
        return { questions: [], error: err.message };
    }
};

/**
 * Update review progress after reviewing a wrong answer
 * @param {string} wrongAnswerId - The wrong answer record ID
 * @param {boolean} wasCorrect - Whether the user answered correctly
 * @returns {object} { success: boolean, mastered: boolean, error }
 */
export const updateReviewProgress = async (wrongAnswerId, wasCorrect) => {
    console.log('[wrongAnswersService] updateReviewProgress:', { wrongAnswerId, wasCorrect });

    try {
        // 1. Fetch current record
        const { data: current, error: fetchError } = await supabase
            .from('wrong_answers_inventory')
            .select('consecutive_correct, repetition_count, times_wrong')
            .eq('id', wrongAnswerId)
            .single();

        if (fetchError || !current) {
            console.error('[wrongAnswersService] Failed to fetch current record:', fetchError);
            return { success: false, mastered: false, error: fetchError };
        }

        // 2. Calculate new values
        const newConsecutive = wasCorrect ? (current.consecutive_correct + 1) : 0;
        const newRepetition = current.repetition_count + 1;
        const newTimesWrong = wasCorrect ? current.times_wrong : (current.times_wrong + 1);
        const nextReview = new Date(Date.now() + 3 * 60 * 60 * 1000); // +3 hours

        // 3. Check if mastered (4 consecutive correct)
        if (newConsecutive >= 4) {
            console.log('[wrongAnswersService] Question mastered! Deleting from inventory.');
            const { error: deleteError } = await supabase
                .from('wrong_answers_inventory')
                .delete()
                .eq('id', wrongAnswerId);

            if (deleteError) {
                console.error('[wrongAnswersService] Failed to delete mastered question:', deleteError);
                return { success: false, mastered: false, error: deleteError };
            }

            return { success: true, mastered: true, error: null };
        }

        // 4. Update progress
        const { error: updateError } = await supabase
            .from('wrong_answers_inventory')
            .update({
                consecutive_correct: newConsecutive,
                repetition_count: newRepetition,
                times_wrong: newTimesWrong,
                last_reviewed_at: new Date().toISOString(),
                next_review_at: nextReview.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', wrongAnswerId);

        if (updateError) {
            console.error('[wrongAnswersService] Failed to update progress:', updateError);
            return { success: false, mastered: false, error: updateError };
        }

        console.log('[wrongAnswersService] Progress updated successfully:', {
            consecutive: newConsecutive,
            repetition: newRepetition
        });

        return { success: true, mastered: false, error: null };
    } catch (err) {
        console.error('[wrongAnswersService] updateReviewProgress exception:', err);
        return { success: false, mastered: false, error: err.message };
    }
};

/**
 * Get review statistics for a user
 * @param {string} userId - The auth user ID
 * @returns {object} { totalWrongAnswers, dueReviews, bySubject: {...} }
 */
export const getReviewStats = async (userId) => {
    console.log('[wrongAnswersService] getReviewStats called:', userId);

    if (!userId) return { totalWrongAnswers: 0, dueReviews: 0, bySubject: {} };

    try {
        // Fetch all wrong answers for the user
        const { data: allWrongAnswers, error } = await supabase
            .from('wrong_answers_inventory')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('[wrongAnswersService] getReviewStats error:', error);
            return { totalWrongAnswers: 0, dueReviews: 0, bySubject: {} };
        }

        const now = new Date();
        const stats = {
            totalWrongAnswers: allWrongAnswers?.length || 0,
            dueReviews: 0,
            bySubject: {}
        };

        // Process each wrong answer
        allWrongAnswers?.forEach(wa => {
            const isDue = !wa.next_review_at || new Date(wa.next_review_at) <= now;
            const subject = wa.subject;

            // Initialize subject if not exists
            if (!stats.bySubject[subject]) {
                stats.bySubject[subject] = {
                    total: 0,
                    due: 0,
                    byChapter: {}
                };
            }

            // Calculate chapter from part_number
            // English: 24 parts, 8 chapters (3 parts each) -> Math.ceil(part/3)
            // Biology: 12 parts, 8 chapters (variable) -> approximate
            const chapter = Math.ceil(wa.part_number / 3);

            // Initialize chapter if not exists
            if (!stats.bySubject[subject].byChapter[chapter]) {
                stats.bySubject[subject].byChapter[chapter] = {
                    total: 0,
                    due: 0
                };
            }

            // Update counts
            stats.bySubject[subject].total++;
            stats.bySubject[subject].byChapter[chapter].total++;

            if (isDue) {
                stats.dueReviews++;
                stats.bySubject[subject].due++;
                stats.bySubject[subject].byChapter[chapter].due++;
            }
        });

        console.log('[wrongAnswersService] getReviewStats result:', stats);
        return stats;
    } catch (err) {
        console.error('[wrongAnswersService] getReviewStats exception:', err);
        return { totalWrongAnswers: 0, dueReviews: 0, bySubject: {} };
    }
};

/**
 * Build a review session (1 wrong answer + 5 random questions from same chapter)
 * @param {string} wrongAnswerId - The wrong answer record ID
 * @returns {object} { questions: [], wrongAnswerIndex: number, reviewData: {...}, error }
 */
export const buildReviewSession = async (wrongAnswerId) => {
    console.log('[wrongAnswersService] buildReviewSession called:', wrongAnswerId);

    try {
        // 1. Fetch the wrong answer record
        const { data: wrongAnswer, error: fetchError } = await supabase
            .from('wrong_answers_inventory')
            .select('*')
            .eq('id', wrongAnswerId)
            .single();

        if (fetchError || !wrongAnswer) {
            console.error('[wrongAnswersService] Failed to fetch wrong answer:', fetchError);
            return { questions: [], wrongAnswerIndex: -1, reviewData: null, error: fetchError };
        }

        // 2. Transform wrong answer to game format
        const wrongAnswerQuestion = {
            id: wrongAnswer.question_id,
            q: wrongAnswer.question_text,
            text: wrongAnswer.question_text,
            options: JSON.parse(wrongAnswer.options),
            correct: JSON.parse(wrongAnswer.options).indexOf(wrongAnswer.correct_answer),
            explanation: wrongAnswer.explanation,
            type: 'text',
            difficulty: 'medium',
            isWrongAnswer: true // Flag to identify the actual wrong answer
        };

        // 3. Get +5 random questions from same chapter
        const { questions: randomQuestions, error: randomError } = await getRandomQuestionsFromSameChapter(
            wrongAnswer.subject,
            wrongAnswer.question_type,
            wrongAnswer.part_number,
            [wrongAnswer.question_id], // Exclude the wrong answer itself
            5
        );

        if (randomError) {
            console.error('[wrongAnswersService] Failed to get random questions:', randomError);
            // Continue with just the wrong answer if we can't get random ones
        }

        // 4. Combine all questions (wrong answer + random)
        const allQuestions = [wrongAnswerQuestion, ...(randomQuestions || [])];

        // 5. Shuffle questions
        const { shuffleArray } = await import('../utils/helpers.js');
        const shuffledQuestions = shuffleArray(allQuestions);

        // 6. Find index of wrong answer after shuffle
        const wrongAnswerIndex = shuffledQuestions.findIndex(q => q.isWrongAnswer === true);

        // 7. Remove the flag from questions (clean up)
        shuffledQuestions.forEach(q => delete q.isWrongAnswer);

        const reviewData = {
            wrongAnswerId: wrongAnswer.id,
            subject: wrongAnswer.subject,
            type: wrongAnswer.question_type,
            part: wrongAnswer.part_number
        };

        console.log('[wrongAnswersService] Review session built:', {
            totalQuestions: shuffledQuestions.length,
            wrongAnswerIndex,
            reviewData
        });

        return {
            questions: shuffledQuestions,
            wrongAnswerIndex,
            reviewData,
            error: null
        };
    } catch (err) {
        console.error('[wrongAnswersService] buildReviewSession exception:', err);
        return { questions: [], wrongAnswerIndex: -1, reviewData: null, error: err.message };
    }
};
