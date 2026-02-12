import { useState, useRef, useEffect, useCallback } from 'react';
import { shuffleArray } from '../utils/helpers';
import {
    getRandomCorrectMessage,
    getRandomWrongMessage,
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
        initialLives = mode === 'infinite' ? 10 : 3, // 10 hearts for monster/comprehensive, 3 for chapters/demo
        baseSpeed = 2000, // Base fall duration in ms
        freezeDuration = 5000,
        onGameEnd,
    } = options;

    // Game State
    const [gameState, setGameState] = useState('menu'); // menu, playing, paused, results
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(initialLives);
    const [combo, setCombo] = useState(0);
    const [progress, setProgress] = useState(0);

    // Question State
    const [questionIndex, setQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionY, setQuestionY] = useState(120); // Start from progress bar bottom
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
        setPowerups({ freeze: 2, bomb: 1 });
        setFrozen(false);
        setDisabledOptions([]);
        setCorrectAnswers([]);
        setWrongAnswers([]);
        setQuestionIndex(0);
        setCurrentQuestion(shuffled[0]);
        setQuestionY(120); // Start from progress bar bottom
        setFeedback({ show: false, correct: false, message: '' });
        setFlyingBtn(null);
        setShakeScreen(0);
        setGameState('playing');
    }, [questions, initialLives]);

    // Handle correct answer
    const handleCorrectAnswer = useCallback((answer, answerIndex) => {
        hapticSuccess();
        playCorrectSound();

        // Calculate score with combo-based multiplier
        const basePoints = currentQuestion?.golden ? 50 : 10;
        const newCombo = combo + 1;
        const multiplier = Math.min(Math.floor(newCombo / 3) + 1, 5);
        const points = basePoints * multiplier;

        setScore(prev => {
            const newScore = prev + points;
            scoreRef.current = newScore;
            return newScore;
        });

        const oldMultiplier = Math.min(Math.floor(combo / 3) + 1, 5);
        if (multiplier > oldMultiplier) {
            hapticCombo();
            playComboSound();
        }

        setCombo(newCombo);
        setCorrectAnswers(prev => {
            const updated = [...prev, { question: currentQuestion, userAnswer: answer }];
            correctAnswersRef.current = updated;
            return updated;
        });

        // Show feedback
        showFeedbackRef.current?.(true, getRandomCorrectMessage());
    }, [currentQuestion, combo]);

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
        setWrongAnswers(prev => {
            const updated = [...prev, { question: currentQuestion, userAnswer: answer }];
            wrongAnswersRef.current = updated;
            return updated;
        });

        showFeedbackRef.current?.(false, getRandomWrongMessage());
    }, [currentQuestion]);

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
        setWrongAnswers(prev => {
            const updated = [...prev, { question: currentQuestion, userAnswer: null }];
            wrongAnswersRef.current = updated;
            return updated;
        });

        showFeedbackRef.current?.(false, 'خلصّ الوقت! ⏰');
    }, [currentQuestion]);

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

        // Monster Challenge mode: Enforce 10-error limit
        if (initialLives >= 10 && wrongAnswersRef.current.length >= 10) {
            setGameState('results');
            onGameEndRef.current?.({
                score: scoreRef.current,
                correctAnswers: correctAnswersRef.current,
                wrongAnswers: wrongAnswersRef.current
            });
            return;
        }

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
        setQuestionY(120); // Start from progress bar bottom
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

        // Fast initial descent settings
        const INITIAL_START_Y = 120; // Progress bar bottom
        const INITIAL_END_Y = 250; // Readable position
        const INITIAL_DURATION = 2500; // 2.5 seconds for fast initial descent

        const animate = () => {
            const elapsed = Date.now() - startTime;

            let newY;

            // Phase 1: Fast initial descent from progress bar to readable position
            if (elapsed < INITIAL_DURATION) {
                const initialProgress = elapsed / INITIAL_DURATION;
                newY = INITIAL_START_Y + (initialProgress * (INITIAL_END_Y - INITIAL_START_Y));
            }
            // Phase 2: Normal speed descent from readable position to bottom
            else {
                const normalStartTime = elapsed - INITIAL_DURATION;
                const normalProgress = normalStartTime / speed;
                const remainingDistance = gameAreaHeight - 100 - INITIAL_END_Y;
                newY = INITIAL_END_Y + (normalProgress * remainingDistance);
            }

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
        questionIndex,
        gameQuestions,

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
