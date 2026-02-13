import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useGameLogic } from '../../hooks';
import GameHUD from './GameHUD';
import AnswerButtons, { FlyingButton } from './AnswerButtons';
import QuestionCard from './QuestionCard';
import FeedbackOverlay from './FeedbackOverlay';
import PauseMenuModal from './PauseMenuModal';
import ResultsScreen from './ResultsScreen';
import { SoftBackground } from '../ui';
import confetti from 'canvas-confetti';
import { addWrongAnswersBatch, clearWrongAnswersForPart } from '../../services/wrongAnswersService';
import { recordGameSession, updateStatsAfterGame } from '../../services/userProgressService';

/**
 * GameContainer Component
 * Orchestrates the game experience using useGameLogic hook
 */
const GameContainer = ({
    initialQuestions = [],
    initialMode = 'finite',
    onExit,
    isDark,
    setIsDark,
    isMuted,
    setIsMuted,
    gameConfig = {}, // { subject, type, part }
    userId = null
}) => {
    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    // Correct questions prop name for useGameLogic is 'questions'
    const {
        gameState,
        score,
        lives,
        combo,
        progress,
        currentQuestion,
        questionY,
        shakeQuestion,
        shakeScreen,
        powerups,
        frozen,
        disabledOptions,
        feedback,
        flyingBtn,
        correctAnswers,
        wrongAnswers,
        speedMode,
        gameAreaRef,
        questionRef,
        startGame,
        handleAnswer,
        useFreeze,
        useBomb,
        pauseGame,
        resumeGame,
        exitToMenu,
        setSpeedMode,
        isInfiniteMode,
        initialLives,
        questionIndex,
        gameQuestions
    } = useGameLogic(initialQuestions, {
        mode: initialMode,
        onGameEnd: async (results) => {
            console.log('[GameContainer] Game ended:', results);

            // Save wrong answers to Supabase if user is logged in
            if (userId && gameConfig.subject && results.wrongAnswers?.length > 0) {
                try {
                    await addWrongAnswersBatch(
                        userId,
                        gameConfig.subject,
                        gameConfig.type || 'fullyear',
                        gameConfig.part || 1,
                        results.wrongAnswers
                    );
                    console.log('[GameContainer] Wrong answers saved:', results.wrongAnswers.length);
                } catch (err) {
                    console.error('[GameContainer] Failed to save wrong answers:', err);
                }
            }

            // If user won (no wrong answers), clear old mistakes for this part
            if (userId && gameConfig.subject && results.wrongAnswers?.length === 0) {
                try {
                    const { deletedCount } = await clearWrongAnswersForPart(
                        userId,
                        gameConfig.subject,
                        gameConfig.type || 'fullyear',
                        gameConfig.part || 1
                    );
                    console.log('[GameContainer] Cleared wrong answers on win:', deletedCount);
                } catch (err) {
                    console.error('[GameContainer] Failed to clear wrong answers:', err);
                }
            }

            // Record game session and update user stats
            if (userId && gameConfig.subject) {
                const questionsCorrect = results.correctAnswers?.length || 0;
                const questionsWrong = results.wrongAnswers?.length || 0;
                const questionsTotal = questionsCorrect + questionsWrong;
                const won = questionsWrong === 0 && questionsTotal > 0;

                // Calculate XP earned (10 base + 5 per correct answer + bonus for winning)
                const xpEarned = results.score + (won ? 50 : 0);

                try {
                    // Record the game session
                    await recordGameSession(userId, {
                        subject: gameConfig.subject,
                        questionType: gameConfig.type || 'fullyear',
                        partNumber: gameConfig.part || 1,
                        gameMode: 'monster',
                        score: results.score,
                        questionsTotal,
                        questionsCorrect,
                        questionsWrong,
                        xpEarned,
                        durationSeconds: 0, // TODO: Track game duration
                        won
                    });
                    console.log('[GameContainer] Game session recorded');

                    // Update user stats (streak, XP, progress)
                    const statsResult = await updateStatsAfterGame(userId, {
                        subject: gameConfig.subject,
                        questionType: gameConfig.type || 'fullyear',
                        partNumber: gameConfig.part || 1,
                        score: results.score,
                        questionsCorrect,
                        questionsTotal,
                        xpEarned,
                        durationSeconds: 0,
                        won
                    });
                    console.log('[GameContainer] User stats updated:', statsResult.data);
                } catch (err) {
                    console.error('[GameContainer] Failed to record session/stats:', err);
                }
            }

            // Confetti for good performance
            if (results.score > 100) {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }
        }
    });

    // Start game on mount
    useEffect(() => {
        startGame();
    }, [startGame]);

    // Handle exit
    const handleExit = () => {
        exitToMenu();
        onExit?.();
    };

    if (gameState === 'menu') return null;

    if (gameState === 'results') {
        return (
            <ResultsScreen
                score={score}
                correctAnswers={correctAnswers}
                wrongAnswers={wrongAnswers}
                onPlayAgain={startGame}
                onGoToMenu={handleExit}
                isDark={isDark}
            />
        );
    }

    // Determine if this is monster mode (for hiding progress bar)
    const gameType = gameConfig?.type || gameConfig?.gameMode;
    const isMonsterMode = gameType === 'fullyear' || gameType === 'monster' || gameConfig?.gameMode === 'infinite';

    return (
        <div
            className={`fixed inset-0 overflow-hidden ${shakeScreen === 1 ? 'animate-shake' : shakeScreen === 2 ? 'animate-hardShake' : ''}`}
            ref={gameAreaRef}
        >
            <SoftBackground isDarkMode={isDark} />

            {/* Game Card Wrapper - White card containing all game elements */}
            {/* In monster mode, card starts lower to not cover HUD */}
            <div className={`absolute ${isMonsterMode ? 'top-24' : 'inset-4'} rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`} style={isMonsterMode ? { bottom: '1rem', left: '1rem', right: '1rem' } : {}}>
                
                {/* Top Bar: Fullscreen (left), Hearts+Score (right) - Only in monster mode */}
                {isMonsterMode && (
                <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-20">
                    {/* Fullscreen Button - Top Left inside card */}
                    <button
                        onClick={() => {
                            if (document.fullscreenElement) {
                                document.exitFullscreen();
                            } else {
                                document.documentElement.requestFullscreen();
                            }
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                    >
                        {isFullscreen ? 
                            <svg className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                            : 
                            <svg className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        }
                    </button>

                    {/* Hearts + Score - Top Right inside card */}
                    <div className="flex items-center gap-3">
                        {/* Lives */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                            <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{lives}</span>
                        </div>
                        {/* Score */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="text-yellow-500 text-xs font-black">XP</span>
                            <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{(score ?? 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                )}

                {/* Falling Question Area */}
                <div className={`relative h-full w-full pointer-events-none ${isMonsterMode ? 'pt-4 pb-40' : 'pt-4 pb-40'}`}>
                    {currentQuestion && (
                        <QuestionCard
                            ref={questionRef}
                            question={currentQuestion}
                            position={questionY}
                            shaking={shakeQuestion}
                            frozen={frozen}
                            isDark={isDark}
                            currentIndex={questionIndex + 1}
                            totalQuestions={gameQuestions.length}
                        />
                    )}
                </div>

                {/* Answer Controls - Inside card at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-50 pb-4">
                    {currentQuestion && (
                        <AnswerButtons
                            options={currentQuestion.options}
                            onAnswer={handleAnswer}
                            disabledOptions={disabledOptions}
                            disabled={feedback.show || gameState !== 'playing'}
                            isDark={isDark}
                        />
                    )}
                </div>
            </div>

            {/* HUD - Only pause button outside card */}
            <GameHUD
                score={score}
                lives={lives}
                progress={progress}
                showProgress={!isMonsterMode}
                minimal={isMonsterMode} // Use minimal mode in monster - elements are inside card
                onPause={pauseGame}
                onToggleFullScreen={() => {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        document.documentElement.requestFullscreen();
                    }
                }}
                isFullscreen={isFullscreen}
                isDark={isDark}
                powerups={powerups}
                onFreeze={useFreeze}
                onBomb={useBomb}
                frozen={frozen}
            />

            {/* Feedback Overlay */}
            <FeedbackOverlay
                show={feedback.show}
                correct={feedback.correct}
                message={feedback.message}
            />

            {/* Flying Animation */}
            {flyingBtn && (
                <FlyingButton
                    text={flyingBtn.text}
                    correct={flyingBtn.correct}
                    startPosition={flyingBtn.start}
                    targetPosition={flyingBtn.target}
                />
            )}

            {/* Combo Indicator - Bottom Right */}
            {combo > 0 && (
                <div className="fixed bottom-32 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-xl border-2 border-white dark:border-slate-800 animate-pulse">
                    <span className="text-3xl">🔥</span>
                    <span className="text-2xl font-black text-white">{combo}</span>
                </div>
            )}

            {/* Pause Menu */}
            <PauseMenuModal
                isOpen={gameState === 'paused'}
                onResume={resumeGame}
                onExit={handleExit}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isDark={isDark}
                setIsDark={setIsDark}
                currentSpeedMode={speedMode}
                setSpeedMode={setSpeedMode}
            />
        </div>
    );
};

export default GameContainer;
