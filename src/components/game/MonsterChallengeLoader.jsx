import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SoftBackground } from '../ui';
import { GameContainer } from './index';
import { fetchMonsterChallengeQuestions } from '../../services/monsterChallengeService';
import { supabase } from '../../lib/supabase';

/**
 * MonsterChallengeLoader Component
 * Fetches questions from Supabase and renders GameContainer
 */
const MonsterChallengeLoader = ({
    gameConfig,
    isDarkMode,
    isMuted,
    onExit,
    toggleMute,
    toggleDarkMode,
    showToast,
    userId: propUserId = null
}) => {
    // Determine game mode based on gameConfig type
    // - 'chapters', 'halfyear', 'demo' = finite (3 hearts)
    // - 'fullyear' = infinite (10 hearts for comprehensive)
    // - 'monster' = infinite (10 hearts)
    const gameType = gameConfig?.type || gameConfig?.gameMode;
    const isInfinite = gameType === 'fullyear' || gameType === 'monster' || gameConfig?.gameMode === 'infinite';
    const initialMode = isInfinite ? 'infinite' : 'finite';
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    // Get current user ID
    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) setUserId(user.id);
            } catch (err) {
                console.error('[MonsterChallenge] Failed to get user:', err);
            }
        };
        getUser();
    }, []);

    // Load questions - only run once when gameConfig is stable
    useEffect(() => {
        // Skip if already loaded with same config
        if (questions.length > 0) return;

        const loadQuestions = async () => {
            setLoading(true);
            setError(null);

            console.log('[MonsterChallenge] Loading questions for:', gameConfig);

            try {
                const { questions: dbQuestions, error: fetchError } = await fetchMonsterChallengeQuestions(
                    gameConfig.subject,
                    gameConfig.type,
                    gameConfig.part
                );

                console.log('[MonsterChallenge] DB response:', { count: dbQuestions?.length, error: fetchError });

                if (fetchError) throw fetchError;

                if (!dbQuestions || dbQuestions.length === 0) {
                    throw new Error('لا توجد أسئلة في هذه المرحلة');
                }

                // Transform database format to GameContainer/QuestionCard format
                const transformedQuestions = dbQuestions.map(q => ({
                    id: q.id,
                    q: q.question,
                    text: q.question,
                    options: [q.options.a, q.options.b, q.options.c, q.options.d],
                    correct: ['a', 'b', 'c', 'd'].indexOf(q.correctAnswer),
                    explanation: q.explanation,
                    type: q.type || 'text',
                    difficulty: 'medium'
                }));

                console.log('[MonsterChallenge] Transformed questions:', transformedQuestions.length);

                setQuestions(transformedQuestions);
            } catch (err) {
                console.error('[MonsterChallenge] Error loading questions:', err);
                setError(err.message || 'خطأ في تحميل الأسئلة');
                showToast?.('خطأ في تحميل الأسئلة', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, [gameConfig]); // Removed showToast from deps to prevent re-renders

    // Loading state
    if (loading) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <SoftBackground isDarkMode={isDarkMode} />
                <div className="text-center z-10">
                    <Loader2 className={`w-16 h-16 mx-auto animate-spin ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
                    <p className={`mt-4 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        جاري تحميل الأسئلة...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <SoftBackground isDarkMode={isDarkMode} />
                <div className="text-center z-10 p-8">
                    <div className="text-6xl mb-4">😢</div>
                    <p className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {error}
                    </p>
                    <button
                        onClick={onExit}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
                    >
                        العودة
                    </button>
                </div>
            </div>
        );
    }

    // Wait for questions before rendering
    if (questions.length === 0) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <SoftBackground isDarkMode={isDarkMode} />
                <div className="text-center z-10">
                    <Loader2 className={`w-16 h-16 mx-auto animate-spin ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
                    <p className={`mt-4 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        جاري تجهيز التحدي...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <GameContainer
            // Use a stable key - only change when actual game config changes
            key={`game-${gameConfig.subject}-${gameConfig.type}-${gameConfig.part || 1}`}
            initialQuestions={questions}
            initialMode={initialMode}
            isDark={isDarkMode}
            isMuted={isMuted}
            onExit={onExit}
            setIsMuted={toggleMute}
            setIsDark={toggleDarkMode}
            gameConfig={gameConfig}
            userId={propUserId || userId}
        />
    );
};

export default MonsterChallengeLoader;
