import React, { useState, useEffect, useRef } from 'react';
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
    // Correct questions prop name for useGameLogic is 'questions'
    const {
        gameState,
        score,
        lives,
        combo,
        progress,
        streak,
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
        initialLives
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

    return (
        <div
            className={`fixed inset-0 overflow-hidden ${shakeScreen === 1 ? 'animate-shake' : shakeScreen === 2 ? 'animate-hardShake' : ''} ${streak.active && streak.multiplier >= 5 ? 'fever-mode' : ''}`}
            ref={gameAreaRef}
        >
            <SoftBackground isDarkMode={isDark} />

            <GameHUD
                score={score}
                lives={lives}
                progress={progress}
                onPause={pauseGame}
                isDark={isDark}
                powerups={powerups}
                onFreeze={useFreeze}
                onBomb={useBomb}
                frozen={frozen}
            />

            {/* Falling Question Area */}
            <div className="relative h-full w-full pointer-events-none">
                {currentQuestion && (
                    <QuestionCard
                        ref={questionRef}
                        question={currentQuestion}
                        position={questionY}
                        shaking={shakeQuestion}
                        frozen={frozen}
                        isDark={isDark}
                    />
                )}
            </div>

            {/* Feedback Overlay */}
            <FeedbackOverlay
                show={feedback.show}
                correct={feedback.correct}
                message={feedback.message}
            />

            {/* Streak Indicator */}
            {streak.active && (
                <div className="fixed top-32 right-6 z-40 animate-bounce">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-black shadow-lg border-2 border-orange-300">
                        🔥 STREAK x{streak.count} ({streak.multiplier}x)
                    </div>
                </div>
            )}

            {/* Answer Controls */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
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

            {/* Flying Animation */}
            {flyingBtn && (
                <FlyingButton
                    text={flyingBtn.text}
                    correct={flyingBtn.correct}
                    startPosition={flyingBtn.start}
                    targetPosition={flyingBtn.target}
                />
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
