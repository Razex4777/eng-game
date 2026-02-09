import { useState, useRef, useEffect, useCallback } from 'react';
import { shuffleArray } from '../utils/helpers';
import {
    getRandomCorrectMessage,
    getRandomWrongMessage,
    getStreakMessage,
    getFinalCountdownMessage
} from '../services/messagesService';
import { SPEED_MODES } from '../services/gameSettingsService';
import {
    playCorrectSound,
    playWrongSound,
    playComboSound,
    playFreezeSound,
    playBombSound
} from '../utils/audio';
import {
    hapticSuccess,
    hapticError,
    hapticCombo,
    hapticPowerUp
} from '../utils/haptics';

/**
 * useGameLogic Hook
 * Core game logic for both finite and infinite game modes
 */
const useGameLogic = (questions, options = {}) => {
    const {
        mode = 'finite', // 'finite' or 'infinite'
        initialLives = mode === 'infinite' ? 10 : 3,
        baseSpeed = 2000, // Base fall duration in ms
        freezeDuration = 5000,
        streakTimeout = 5000,
        onGameEnd,
    } = options;

    // Game State
    const [gameState, setGameState] = useState('menu'); // menu, playing, paused, results
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(initialLives);
    const [combo, setCombo] = useState(0);
    const [progress, setProgress] = useState(0);

    // Streak State
    const [streak, setStreak] = useState({
        active: false,
        count: 0,
        multiplier: 1,
        timeLeft: streakTimeout,
        maxTime: streakTimeout
    });

    // Question State
    const [questionIndex, setQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionY, setQuestionY] = useState(0);
    const [shakeQuestion, setShakeQuestion] = useState(false);
    const [shakeScreen, setShakeScreen] = useState(0); // 0: none, 1: shake, 2: hardShake
    const [gameQuestions, setGameQuestions] = useState([]);

    // Power-ups
    const [powerups, setPowerups] = useState({ freeze: 2, bomb: 1 });
    const [frozen, setFrozen] = useState(false);
    const [disabledOptions, setDisabledOptions] = useState([]);

    // Feedback
    const [feedback, setFeedback] = useState({ show: false, correct: false, message: '' });

    // Flying button animation
    const [flyingBtn, setFlyingBtn] = useState(null);

    // Results tracking
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [wrongAnswers, setWrongAnswers] = useState([]);

    // Speed mode - uses SPEED_MODES from gameSettingsService for consistency
    const [speedMode, setSpeedMode] = useState('teen');

    // Refs
    const gameAreaRef = useRef(null);
    const questionRef = useRef(null);
    const animationRef = useRef(null);
    const streakTimerRef = useRef(null);
    const handleMissRef = useRef(null);
    const getCurrentSpeedRef = useRef(null);
    const nextQuestionRef = useRef(null);
    const showFeedbackRef = useRef(null);

    // Refs to track current state for onGameEnd callback (fixes stale closure)
    const scoreRef = useRef(0);
    const correctAnswersRef = useRef([]);
    const wrongAnswersRef = useRef([]);
    const onGameEndRef = useRef(onGameEnd);

    // Calculate current speed using centralized SPEED_MODES config
    const getCurrentSpeed = useCallback(() => {
        const modeConfig = SPEED_MODES[speedMode] || SPEED_MODES.teen;
        return baseSpeed * modeConfig.multiplier;
    }, [baseSpeed, speedMode]);

    // Start Game
    const startGame = useCallback(() => {
        const shuffled = shuffleArray([...questions]).map(q => ({
            ...q,
            options: shuffleArray([...q.options])
        }));

        setGameQuestions(shuffled);
        setScore(0);
        setLives(initialLives);
        setCombo(0);
        setProgress(0);
        setStreak({ active: false, count: 0, multiplier: 1, timeLeft: streakTimeout, maxTime: streakTimeout });
        setPowerups({ freeze: 2, bomb: 1 });
        setFrozen(false);
        setDisabledOptions([]);
        setCorrectAnswers([]);
        setWrongAnswers([]);
        setQuestionIndex(0);
        setCurrentQuestion(shuffled[0]);
        setQuestionY(0);
        setFeedback({ show: false, correct: false, message: '' });
        setFlyingBtn(null);
        setShakeScreen(0);
        setGameState('playing');
    }, [questions, initialLives, streakTimeout]);

    // Handle correct answer
    const handleCorrectAnswer = useCallback((answer, answerIndex) => {
        hapticSuccess();
        playCorrectSound();

        // Calculate score with multiplier
        const basePoints = currentQuestion?.golden ? 50 : 10;
        const multiplier = streak.active ? streak.multiplier : 1;
        const points = basePoints * multiplier;

        setScore(prev => {
            const newScore = prev + points;
            scoreRef.current = newScore;
            return newScore;
        });
        setCombo(prev => prev + 1);
        setCorrectAnswers(prev => {
            const updated = [...prev, { question: currentQuestion, userAnswer: answer }];
            correctAnswersRef.current = updated;
            return updated;
        });

        // Update streak
        const newCount = streak.count + 1;
        const newMultiplier = Math.min(Math.floor(newCount / 3) + 1, 5);

        if (newMultiplier > streak.multiplier) {
            hapticCombo();
            playComboSound();
        }

        setStreak({
            active: true,
            count: newCount,
            multiplier: newMultiplier,
            timeLeft: streakTimeout,
            maxTime: streakTimeout
        });

        // Show feedback
        const message = newMultiplier >= 3
            ? getStreakMessage(newCount)
            : getRandomCorrectMessage();

        showFeedbackRef.current?.(true, message);
    }, [currentQuestion, streak, streakTimeout]);

    // Handle wrong answer
    const handleWrongAnswer = useCallback((answer) => {
        hapticError();
        playWrongSound();

        setShakeQuestion(true);
        setShakeScreen(2); // Hard shake for wrong answer
        setTimeout(() => {
            setShakeQuestion(false);
            setShakeScreen(0);
        }, 500);

        setLives(prev => Math.max(0, prev - 1)); // Prevent going below 0
        setCombo(0);
        setStreak({ active: false, count: 0, multiplier: 1, timeLeft: streakTimeout, maxTime: streakTimeout });
        setWrongAnswers(prev => {
            const updated = [...prev, { question: currentQuestion, userAnswer: answer }];
            wrongAnswersRef.current = updated;
            return updated;
        });

        showFeedbackRef.current?.(false, getRandomWrongMessage());
    }, [currentQuestion, streakTimeout]);

    // Handle answer selection
    const handleAnswer = useCallback((answer, answerIndex) => {
        if (feedback.show || flyingBtn !== null) return;

        const correctAnswer = currentQuestion?.options[currentQuestion?.correct];
        const isCorrect = answer === correctAnswer;

        if (isCorrect) {
            handleCorrectAnswer(answer, answerIndex);
        } else {
            handleWrongAnswer(answer);
        }
    }, [currentQuestion, feedback.show, flyingBtn, handleCorrectAnswer, handleWrongAnswer]);

    // Handle question miss (fell off screen)
    const handleMiss = useCallback(() => {
        hapticError();
        playWrongSound();

        setShakeScreen(1); // Normal shake for miss
        setTimeout(() => setShakeScreen(0), 500);

        setLives(prev => Math.max(0, prev - 1)); // Prevent going below 0
        setCombo(0);
        setStreak({ active: false, count: 0, multiplier: 1, timeLeft: streakTimeout, maxTime: streakTimeout });
        setWrongAnswers(prev => {
            const updated = [...prev, { question: currentQuestion, userAnswer: null }];
            wrongAnswersRef.current = updated;
            return updated;
        });

        showFeedbackRef.current?.(false, 'خلصّ الوقت! ⏰');
    }, [currentQuestion, streakTimeout]);

    // Keep refs updated with latest callbacks and values
    useEffect(() => {
        handleMissRef.current = handleMiss;
        getCurrentSpeedRef.current = getCurrentSpeed;
        nextQuestionRef.current = nextQuestion;
        showFeedbackRef.current = showFeedback;
        onGameEndRef.current = onGameEnd;
    });

    // Show feedback modal
    const showFeedback = useCallback((correct, message) => {
        setFeedback({ show: true, correct, message });
        // Short delay to show feedback, then move to next question
        setTimeout(() => {
            setFeedback({ show: false, correct: false, message: '' });
            nextQuestionRef.current?.();
        }, 800);
    }, []);

    // Next question - also handles game over check
    const nextQuestion = useCallback(() => {
        // Check for game over FIRST (lives depleted)
        // Using functional update pattern to get latest lives value
        setLives(currentLives => {
            if (currentLives <= 0) {
                // Trigger game over - use refs for latest state values
                setGameState('results');
                onGameEndRef.current?.({
                    score: scoreRef.current,
                    correctAnswers: correctAnswersRef.current,
                    wrongAnswers: wrongAnswersRef.current
                });
                return currentLives;
            }
            return currentLives;
        });

        const nextIdx = questionIndex + 1;

        if (mode === 'finite') {
            setProgress((nextIdx / gameQuestions.length) * 100);

            // Check for game completion
            if (nextIdx >= gameQuestions.length) {
                setGameState('results');
                onGameEndRef.current?.({
                    score: scoreRef.current,
                    correctAnswers: correctAnswersRef.current,
                    wrongAnswers: wrongAnswersRef.current
                });
                return;
            }

            // Final countdown messages
            const remaining = gameQuestions.length - nextIdx;
            if (remaining <= 3 && remaining > 0) {
                const countdownMsg = getFinalCountdownMessage(remaining);
                if (countdownMsg) {
                    // Could trigger a special UI notification here
                }
            }
        } else {
            // Infinite mode - regenerate questions when running low
            if (nextIdx >= gameQuestions.length - 1) {
                const moreQuestions = questions.map(q => ({
                    ...q,
                    id: q.id + Date.now(),
                    options: shuffleArray([...q.options])
                }));
                setGameQuestions(prev => [...prev, ...moreQuestions]);
            }
        }

        setQuestionIndex(nextIdx);
        setCurrentQuestion(gameQuestions[nextIdx] || gameQuestions[0]);
        setQuestionY(0);
        setDisabledOptions([]);
        setFrozen(false);
    }, [questionIndex, gameQuestions, mode, questions, score, correctAnswers, wrongAnswers, onGameEnd]);

    // Use Freeze power-up
    const useFreeze = useCallback(() => {
        if (powerups.freeze <= 0 || frozen) return;

        hapticPowerUp();
        playFreezeSound();

        setPowerups(prev => ({ ...prev, freeze: prev.freeze - 1 }));
        setFrozen(true);

        setTimeout(() => {
            setFrozen(false);
        }, freezeDuration);
    }, [powerups.freeze, frozen, freezeDuration]);

    // Use Bomb power-up
    const useBomb = useCallback(() => {
        if (powerups.bomb <= 0 || !currentQuestion) return;

        hapticPowerUp();
        playBombSound();

        setPowerups(prev => ({ ...prev, bomb: prev.bomb - 1 }));

        // Disable two wrong answers
        const correctAnswer = currentQuestion.options[currentQuestion.correct];
        const wrongOptions = currentQuestion.options.filter(opt => opt !== correctAnswer);
        const toDisable = shuffleArray(wrongOptions).slice(0, 2);

        setDisabledOptions(toDisable);
    }, [powerups.bomb, currentQuestion]);

    // Game loop - animate falling question
    // Uses refs to avoid dependency on callbacks that change frequently
    useEffect(() => {
        if (gameState !== 'playing' || !currentQuestion || feedback.show || frozen) {
            return;
        }

        const gameAreaHeight = gameAreaRef.current?.clientHeight || 400;
        const speed = getCurrentSpeedRef.current ? getCurrentSpeedRef.current() : baseSpeed;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / speed;
            const newY = progress * (gameAreaHeight - 100);

            if (newY >= gameAreaHeight - 50) {
                handleMissRef.current?.();
                return;
            }

            setQuestionY(newY);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
        // Using questionIndex to restart animation when question changes, rather than currentQuestion object
        // Also watching currentQuestion to trigger when it first becomes available
    }, [gameState, questionIndex, !!currentQuestion, feedback.show, frozen, baseSpeed]);

    // Streak timer
    useEffect(() => {
        if (!streak.active || gameState !== 'playing') return;

        streakTimerRef.current = setInterval(() => {
            setStreak(prev => {
                const newTimeLeft = prev.timeLeft - 100;
                if (newTimeLeft <= 0) {
                    return { active: false, count: 0, multiplier: 1, timeLeft: streakTimeout, maxTime: streakTimeout };
                }
                return { ...prev, timeLeft: newTimeLeft };
            });
        }, 100);

        return () => {
            if (streakTimerRef.current) {
                clearInterval(streakTimerRef.current);
            }
        };
    }, [streak.active, gameState, streakTimeout]);

    // Pause/Resume
    const pauseGame = useCallback(() => setGameState('paused'), []);
    const resumeGame = useCallback(() => setGameState('playing'), []);
    const exitToMenu = useCallback(() => setGameState('menu'), []);

    return {
        // State
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

        // Refs
        gameAreaRef,
        questionRef,

        // Actions
        startGame,
        handleAnswer,
        useFreeze,
        useBomb,
        pauseGame,
        resumeGame,
        exitToMenu,
        setSpeedMode,
        setGameState,

        // Derived
        isInfiniteMode: mode === 'infinite',
        initialLives
    };
};

export default useGameLogic;
