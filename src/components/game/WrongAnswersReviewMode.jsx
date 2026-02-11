import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { SoftBackground } from '../ui';
import GameContainer from './GameContainer';
import { buildReviewSession, updateReviewProgress } from '../../services/wrongAnswersService';

/**
 * WrongAnswersReviewMode Component
 * Wrapper that loads review session and launches GameContainer
 * Handles spaced repetition progress tracking
 */
const WrongAnswersReviewMode = ({
    userId,
    wrongAnswerId,
    onComplete,
    onExit,
    isDark,
    isMuted,
    setIsMuted,
    setIsDark
}) => {
    const [loading, setLoading] = useState(true);
    const [reviewSession, setReviewSession] = useState(null);
    const [error, setError] = useState(null);

    // Load review session on mount
    useEffect(() => {
        const loadSession = async () => {
            console.log('[WrongAnswersReviewMode] Loading review session for:', wrongAnswerId);
            setLoading(true);
            setError(null);

            try {
                const { questions, wrongAnswerIndex, reviewData, error: sessionError } =
                    await buildReviewSession(wrongAnswerId);

                if (sessionError) {
                    throw new Error(sessionError);
                }

                if (!questions || questions.length === 0) {
                    throw new Error('لم يتم العثور على أسئلة للمراجعة');
                }

                console.log('[WrongAnswersReviewMode] Session loaded:', {
                    totalQuestions: questions.length,
                    wrongAnswerIndex,
                    reviewData
                });

                setReviewSession({ questions, wrongAnswerIndex, reviewData });
            } catch (err) {
                console.error('[WrongAnswersReviewMode] Failed to load session:', err);
                setError(err.message || 'خطأ في تحميل المراجعة');
            } finally {
                setLoading(false);
            }
        };

        if (wrongAnswerId) {
            loadSession();
        }
    }, [wrongAnswerId]);

    // Handle game end - update review progress
    const handleGameEnd = async (results) => {
        console.log('[WrongAnswersReviewMode] Game ended:', results);

        if (!reviewSession) {
            console.error('[WrongAnswersReviewMode] No review session available');
            onComplete?.({ success: false, results });
            return;
        }

        try {
            // Find the wrong answer question in results
            const wrongAnswerQuestion = reviewSession.questions[reviewSession.wrongAnswerIndex];

            // Check if user answered it correctly
            const userAnsweredCorrectly = results.correctAnswers?.some(
                ca => ca.question?.id === wrongAnswerQuestion.id ||
                      ca.question?.text === wrongAnswerQuestion.text
            );

            console.log('[WrongAnswersReviewMode] Wrong answer status:', {
                questionId: wrongAnswerQuestion.id,
                userAnsweredCorrectly,
                correctAnswersCount: results.correctAnswers?.length
            });

            // Update review progress in database
            const { success, mastered, error: updateError } = await updateReviewProgress(
                wrongAnswerId,
                userAnsweredCorrectly
            );

            if (updateError) {
                console.error('[WrongAnswersReviewMode] Failed to update progress:', updateError);
            }

            console.log('[WrongAnswersReviewMode] Progress updated:', { success, mastered });

            // Notify parent component
            onComplete?.({
                success: userAnsweredCorrectly,
                mastered,
                results
            });
        } catch (err) {
            console.error('[WrongAnswersReviewMode] Error in handleGameEnd:', err);
            onComplete?.({ success: false, results });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <SoftBackground isDark={isDark} opacity={0.95} />
                <div className="relative z-10 text-center">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-500" />
                    <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        جاري تحميل المراجعة...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <SoftBackground isDark={isDark} opacity={0.95} />
                <div className="relative z-10 max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-2xl font-bold text-center mb-4 text-slate-800 dark:text-slate-100">
                        خطأ في التحميل
                    </h3>
                    <p className="text-center text-slate-600 dark:text-slate-300 mb-6">
                        {error}
                    </p>
                    <button
                        onClick={onExit}
                        className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                    >
                        العودة
                    </button>
                </div>
            </div>
        );
    }

    // Render GameContainer with review questions
    if (!reviewSession) return null;

    return (
        <GameContainer
            initialQuestions={reviewSession.questions}
            initialMode="finite"
            gameConfig={{
                subject: reviewSession.reviewData.subject,
                type: 'review', // NEW TYPE - distinguishes review from normal gameplay
                part: reviewSession.reviewData.part
            }}
            userId={userId}
            onExit={onExit}
            isDark={isDark}
            setIsDark={setIsDark}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onGameEnd={handleGameEnd}
        />
    );
};

export default WrongAnswersReviewMode;
