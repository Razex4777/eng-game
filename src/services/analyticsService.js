/**
 * Analytics Service
 * Provides analytics and insights for user performance
 * - Most wrong questions (per user and globally)
 * - Time spent per stage/part
 * - Average answer speed
 */

import { supabase } from '../lib/supabase';

// ===============================================
// Most Wrong Questions Analytics
// ===============================================

/**
 * Get most frequently wrong questions for a specific user
 * @param {string} userId - The auth user ID
 * @param {string} subject - Subject filter (biology/english)
 * @param {number} limit - Number of questions to return (default: 10)
 * @returns {Promise<{data: array, error: object|null}>}
 */
export const getMostWrongQuestions = async (userId, subject, limit = 10) => {
    if (!userId) {
        return { data: [], error: 'No user ID provided' };
    }

    try {
        let query = supabase
            .from('wrong_answers_inventory')
            .select('*')
            .eq('user_id', userId);

        // Apply subject filter if provided
        if (subject) {
            query = query.eq('subject', subject);
        }

        // Order by times_wrong descending and limit results
        query = query
            .order('times_wrong', { ascending: false })
            .limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('[analyticsService] Error fetching most wrong questions:', error);
            return { data: [], error };
        }

        // Enrich data with additional metrics
        const enrichedData = data.map(item => ({
            ...item,
            error_rate: item.times_wrong, // Direct count
            question_preview: item.question_text?.substring(0, 100) + '...',
            needs_review: item.times_wrong >= 3 // Flag questions wrong 3+ times
        }));

        console.log(`[analyticsService] Found ${enrichedData.length} most wrong questions for user`);
        return { data: enrichedData, error: null };

    } catch (error) {
        console.error('[analyticsService] Unexpected error:', error);
        return { data: [], error };
    }
};

/**
 * Get globally most wrong questions across all users
 * Helps identify problematic questions for Abdullah to review
 * @param {string} subject - Subject filter (biology/english)
 * @param {number} limit - Number of questions to return (default: 10)
 * @returns {Promise<{data: array, error: object|null}>}
 */
export const getGlobalMostWrongQuestions = async (subject, limit = 10) => {
    try {
        // Build query to aggregate wrong answers across all users
        let query = supabase
            .from('wrong_answers_inventory')
            .select('question_id, question_text, subject, question_type, part_number, correct_answer, options, times_wrong');

        // Apply subject filter if provided
        if (subject) {
            query = query.eq('subject', subject);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[analyticsService] Error fetching global wrong questions:', error);
            return { data: [], error };
        }

        // Aggregate by question_id (same question answered wrong by multiple users)
        const aggregated = data.reduce((acc, item) => {
            const key = `${item.subject}_${item.question_type}_${item.part_number}_${item.question_id}`;

            if (!acc[key]) {
                acc[key] = {
                    question_id: item.question_id,
                    question_text: item.question_text,
                    subject: item.subject,
                    question_type: item.question_type,
                    part_number: item.part_number,
                    correct_answer: item.correct_answer,
                    options: item.options,
                    total_wrong_count: 0,
                    affected_users: 0,
                    user_ids: new Set()
                };
            }

            acc[key].total_wrong_count += item.times_wrong;
            acc[key].affected_users = acc[key].user_ids.size + 1;

            return acc;
        }, {});

        // Convert to array and sort by total wrong count
        const sortedData = Object.values(aggregated)
            .map(item => ({
                ...item,
                user_ids: undefined, // Remove Set from output
                difficulty_score: item.total_wrong_count / Math.max(item.affected_users, 1), // Average wrong per user
                is_critical: item.total_wrong_count >= 10 // Flag if >10 total errors
            }))
            .sort((a, b) => b.total_wrong_count - a.total_wrong_count)
            .slice(0, limit);

        console.log(`[analyticsService] Found ${sortedData.length} globally most wrong questions`);
        return { data: sortedData, error: null };

    } catch (error) {
        console.error('[analyticsService] Error calculating global wrong questions:', error);
        return { data: [], error };
    }
};

/**
 * Get wrong questions by part number (for targeted review)
 * @param {string} userId - The auth user ID
 * @param {string} subject - Subject (biology/english)
 * @param {string} questionType - Question type (chapters/fullyear/halfyear)
 * @param {number} partNumber - Specific part number
 * @returns {Promise<{data: array, error: object|null}>}
 */
export const getWrongQuestionsByPart = async (userId, subject, questionType, partNumber) => {
    if (!userId) {
        return { data: [], error: 'No user ID provided' };
    }

    try {
        const { data, error } = await supabase
            .from('wrong_answers_inventory')
            .select('*')
            .eq('user_id', userId)
            .eq('subject', subject)
            .eq('question_type', questionType)
            .eq('part_number', partNumber)
            .order('times_wrong', { ascending: false });

        if (error) {
            console.error('[analyticsService] Error fetching part-specific wrong questions:', error);
            return { data: [], error };
        }

        return { data: data || [], error: null };

    } catch (error) {
        console.error('[analyticsService] Unexpected error:', error);
        return { data: [], error };
    }
};

// ===============================================
// Time & Speed Analytics
// ===============================================

/**
 * Get average time spent per stage/part for a user
 * @param {string} userId - The auth user ID
 * @param {string} subject - Subject filter
 * @param {string} questionType - Type filter (chapters/fullyear/halfyear)
 * @returns {Promise<{data: array, error: object|null}>}
 */
export const getAverageTimePerStage = async (userId, subject, questionType) => {
    if (!userId) {
        return { data: [], error: 'No user ID provided' };
    }

    try {
        let query = supabase
            .from('game_sessions')
            .select('part_number, duration_seconds, questions_total, created_at')
            .eq('user_id', userId);

        // Apply filters
        if (subject) {
            query = query.eq('subject', subject);
        }

        if (questionType) {
            query = query.eq('question_type', questionType);
        }

        const { data: sessions, error } = await query;

        if (error) {
            console.error('[analyticsService] Error fetching time per stage:', error);
            return { data: [], error };
        }

        // Group by part_number and calculate averages
        const partStats = sessions.reduce((acc, session) => {
            const part = session.part_number;

            if (!acc[part]) {
                acc[part] = {
                    part_number: part,
                    total_duration: 0,
                    total_questions: 0,
                    session_count: 0,
                    sessions: []
                };
            }

            acc[part].total_duration += session.duration_seconds || 0;
            acc[part].total_questions += session.questions_total || 0;
            acc[part].session_count += 1;
            acc[part].sessions.push({
                duration: session.duration_seconds,
                date: session.created_at
            });

            return acc;
        }, {});

        // Calculate averages and format output
        const result = Object.values(partStats).map(stat => ({
            part_number: stat.part_number,
            average_duration_seconds: Math.round(stat.total_duration / stat.session_count),
            average_duration_minutes: (stat.total_duration / stat.session_count / 60).toFixed(2),
            total_sessions: stat.session_count,
            total_questions: stat.total_questions,
            average_questions_per_session: Math.round(stat.total_questions / stat.session_count),
            fastest_session: Math.min(...stat.sessions.map(s => s.duration)),
            slowest_session: Math.max(...stat.sessions.map(s => s.duration))
        })).sort((a, b) => a.part_number - b.part_number);

        console.log(`[analyticsService] Calculated time stats for ${result.length} parts`);
        return { data: result, error: null };

    } catch (error) {
        console.error('[analyticsService] Error calculating time per stage:', error);
        return { data: [], error };
    }
};

/**
 * Get average answer speed for a user (seconds per question)
 * @param {string} userId - The auth user ID
 * @param {string} subject - Optional subject filter
 * @returns {Promise<{data: object, error: object|null}>}
 */
export const getAverageAnswerSpeed = async (userId, subject = null) => {
    if (!userId) {
        return { data: null, error: 'No user ID provided' };
    }

    try {
        let query = supabase
            .from('game_sessions')
            .select('duration_seconds, questions_total, questions_correct, created_at, subject')
            .eq('user_id', userId);

        if (subject) {
            query = query.eq('subject', subject);
        }

        const { data: sessions, error } = await query;

        if (error) {
            console.error('[analyticsService] Error fetching answer speed:', error);
            return { data: null, error };
        }

        if (sessions.length === 0) {
            return {
                data: {
                    average_seconds_per_question: 0,
                    total_questions: 0,
                    total_time_seconds: 0,
                    sessions_analyzed: 0
                },
                error: null
            };
        }

        // Calculate totals
        const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        const totalQuestions = sessions.reduce((sum, s) => sum + (s.questions_total || 0), 0);

        // Calculate average speed
        const averageSpeed = totalQuestions > 0 ? totalDuration / totalQuestions : 0;

        // Calculate speed by subject if not filtered
        let speedBySubject = {};
        if (!subject) {
            speedBySubject = sessions.reduce((acc, s) => {
                if (!acc[s.subject]) {
                    acc[s.subject] = { duration: 0, questions: 0 };
                }
                acc[s.subject].duration += s.duration_seconds || 0;
                acc[s.subject].questions += s.questions_total || 0;
                return acc;
            }, {});

            speedBySubject = Object.entries(speedBySubject).reduce((acc, [subj, stats]) => {
                acc[subj] = stats.questions > 0 ? (stats.duration / stats.questions).toFixed(2) : 0;
                return acc;
            }, {});
        }

        const result = {
            average_seconds_per_question: averageSpeed.toFixed(2),
            average_minutes_per_question: (averageSpeed / 60).toFixed(2),
            total_questions: totalQuestions,
            total_time_seconds: totalDuration,
            total_time_minutes: Math.round(totalDuration / 60),
            sessions_analyzed: sessions.length,
            speed_by_subject: speedBySubject,
            performance_rating: getSpeedRating(averageSpeed)
        };

        console.log('[analyticsService] Average answer speed calculated:', result.average_seconds_per_question);
        return { data: result, error: null };

    } catch (error) {
        console.error('[analyticsService] Error calculating answer speed:', error);
        return { data: null, error };
    }
};

/**
 * Get global average answer speed across all users
 * @param {string} subject - Optional subject filter
 * @returns {Promise<{data: object, error: object|null}>}
 */
export const getGlobalAverageAnswerSpeed = async (subject = null) => {
    try {
        let query = supabase
            .from('game_sessions')
            .select('duration_seconds, questions_total, subject');

        if (subject) {
            query = query.eq('subject', subject);
        }

        const { data: sessions, error } = await query;

        if (error) {
            console.error('[analyticsService] Error fetching global answer speed:', error);
            return { data: null, error };
        }

        if (sessions.length === 0) {
            return {
                data: {
                    global_average_seconds_per_question: 0,
                    total_questions_analyzed: 0,
                    total_sessions: 0
                },
                error: null
            };
        }

        const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
        const totalQuestions = sessions.reduce((sum, s) => sum + (s.questions_total || 0), 0);

        const globalAverage = totalQuestions > 0 ? totalDuration / totalQuestions : 0;

        // Calculate by subject
        const bySubject = sessions.reduce((acc, s) => {
            if (!acc[s.subject]) {
                acc[s.subject] = { duration: 0, questions: 0, sessions: 0 };
            }
            acc[s.subject].duration += s.duration_seconds || 0;
            acc[s.subject].questions += s.questions_total || 0;
            acc[s.subject].sessions += 1;
            return acc;
        }, {});

        const subjectBreakdown = Object.entries(bySubject).reduce((acc, [subj, stats]) => {
            acc[subj] = {
                average_speed: stats.questions > 0 ? (stats.duration / stats.questions).toFixed(2) : 0,
                total_questions: stats.questions,
                total_sessions: stats.sessions
            };
            return acc;
        }, {});

        const result = {
            global_average_seconds_per_question: globalAverage.toFixed(2),
            global_average_minutes_per_question: (globalAverage / 60).toFixed(2),
            total_questions_analyzed: totalQuestions,
            total_sessions: sessions.length,
            breakdown_by_subject: subjectBreakdown
        };

        console.log('[analyticsService] Global average speed calculated:', result.global_average_seconds_per_question);
        return { data: result, error: null };

    } catch (error) {
        console.error('[analyticsService] Error calculating global answer speed:', error);
        return { data: null, error };
    }
};

/**
 * Rate answer speed performance
 * @param {number} averageSpeed - Average seconds per question
 * @returns {string} Performance rating
 */
const getSpeedRating = (averageSpeed) => {
    if (averageSpeed < 10) return 'سريع جداً';
    if (averageSpeed < 20) return 'سريع';
    if (averageSpeed < 30) return 'متوسط';
    if (averageSpeed < 45) return 'بطيء';
    return 'بطيء جداً';
};

// ===============================================
// Advanced Analytics
// ===============================================

/**
 * Get user performance trends over time
 * @param {string} userId - The auth user ID
 * @param {number} days - Number of days to analyze (default: 7)
 * @returns {Promise<{data: array, error: object|null}>}
 */
export const getPerformanceTrends = async (userId, days = 7) => {
    if (!userId) {
        return { data: [], error: 'No user ID provided' };
    }

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data: sessions, error } = await supabase
            .from('game_sessions')
            .select('created_at, accuracy, score, questions_correct, questions_total')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[analyticsService] Error fetching performance trends:', error);
            return { data: [], error };
        }

        // Group by date
        const trendsByDate = sessions.reduce((acc, session) => {
            const date = session.created_at.split('T')[0];

            if (!acc[date]) {
                acc[date] = {
                    date,
                    sessions: 0,
                    total_accuracy: 0,
                    total_score: 0,
                    total_correct: 0,
                    total_questions: 0
                };
            }

            acc[date].sessions += 1;
            acc[date].total_accuracy += parseFloat(session.accuracy || 0);
            acc[date].total_score += session.score || 0;
            acc[date].total_correct += session.questions_correct || 0;
            acc[date].total_questions += session.questions_total || 0;

            return acc;
        }, {});

        const trends = Object.values(trendsByDate).map(day => ({
            date: day.date,
            sessions: day.sessions,
            average_accuracy: (day.total_accuracy / day.sessions).toFixed(2),
            total_score: day.total_score,
            questions_answered: day.total_questions,
            correct_answers: day.total_correct
        }));

        return { data: trends, error: null };

    } catch (error) {
        console.error('[analyticsService] Error calculating performance trends:', error);
        return { data: [], error };
    }
};

/**
 * Get comprehensive user analytics dashboard
 * @param {string} userId - The auth user ID
 * @returns {Promise<{data: object, error: object|null}>}
 */
export const getUserAnalyticsDashboard = async (userId) => {
    if (!userId) {
        return { data: null, error: 'No user ID provided' };
    }

    try {
        // Fetch all required data in parallel
        const [
            mostWrong,
            answerSpeed,
            trends
        ] = await Promise.all([
            getMostWrongQuestions(userId, null, 5),
            getAverageAnswerSpeed(userId),
            getPerformanceTrends(userId, 7)
        ]);

        const dashboard = {
            most_wrong_questions: mostWrong.data,
            answer_speed: answerSpeed.data,
            weekly_trends: trends.data,
            generated_at: new Date().toISOString()
        };

        return { data: dashboard, error: null };

    } catch (error) {
        console.error('[analyticsService] Error building analytics dashboard:', error);
        return { data: null, error };
    }
};

// ===============================================
// Export All Functions
// ===============================================

export default {
    getMostWrongQuestions,
    getGlobalMostWrongQuestions,
    getWrongQuestionsByPart,
    getAverageTimePerStage,
    getAverageAnswerSpeed,
    getGlobalAverageAnswerSpeed,
    getPerformanceTrends,
    getUserAnalyticsDashboard
};
