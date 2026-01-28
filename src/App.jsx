import React, { useState, useEffect, useRef, useCallback } from 'react';

// Import Components
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import PauseMenuModal from './components/PauseMenuModal';
import FeedbackOverlay from './components/FeedbackOverlay';
import LoginScreen from './components/LoginScreen';
import SubjectSelectScreen from './components/SubjectSelectScreen';
import CategorySelectScreen from './components/CategorySelectScreen';
import StageSelectScreen from './components/StageSelectScreen';
import { ParticleSystem, ScorePopup } from './components/GameEffects';

// Import Auth & Supabase
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';

// Import Data & Utils
import { MESSAGES, SPEED_MODES, GAME_CONSTANTS } from './data/gameData';
import { triggerHaptic } from './utils/haptic';


/**
 * useAudio - Custom hook for audio management
 */
function useAudio(isMuted) {
    const audioCtxRef = useRef(null);

    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            try {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Audio API not supported");
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }, []);

    const playSound = useCallback((freq, type = 'sine', vol = 0.3, dur = 0.15) => {
        if (isMuted) return;
        initAudio();
        if (!audioCtxRef.current) return;

        try {
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = type;

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

            osc.start();
            osc.stop(ctx.currentTime + dur);
        } catch (e) {
            console.warn("Audio play failed", e);
        }
    }, [isMuted, initAudio]);

    const playCorrectSound = useCallback((multiplier) => {
        playSound(100, 'sawtooth', 0.4, 0.1);
        setTimeout(() => {
            const baseFreq = 600 + (multiplier * 150);
            playSound(baseFreq, 'square', 0.15, 0.1);
            playSound(baseFreq * 1.5, 'sine', 0.2, 0.2);
        }, 50);
    }, [playSound]);

    const playWrongSound = useCallback(() => {
        playSound(150, 'sawtooth', 0.4, 0.4);
        setTimeout(() => playSound(100, 'sawtooth', 0.4, 0.4), 100);
    }, [playSound]);

    return { initAudio, playSound, playCorrectSound, playWrongSound };
}

/**
 * useFullscreen - Custom hook for fullscreen management
 */
function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullScreen = useCallback(() => {
        try {
            if (!document.fullscreenElement) {
                const elem = document.documentElement;
                const requestFS = elem.requestFullscreen || elem.webkitRequestFullscreen ||
                    elem.mozRequestFullScreen || elem.msRequestFullscreen;
                if (requestFS) {
                    requestFS.call(elem)
                        .then(() => setIsFullscreen(true))
                        .catch(err => console.warn("Full screen error:", err));
                }
            } else {
                const exitFS = document.exitFullscreen || document.webkitExitFullscreen ||
                    document.mozCancelFullScreen || document.msExitFullscreen;
                if (exitFS) {
                    exitFS.call(document)
                        .then(() => setIsFullscreen(false))
                        .catch(err => console.warn(err));
                }
            }
        } catch (e) {
            console.warn("Fullscreen API error:", e);
        }
    }, []);

    return { isFullscreen, toggleFullScreen };
}

/**
 * Main App Component - Auth Wrapper
 */
export default function App() {
    return (
        <AuthProvider>
            <GameController />
        </AuthProvider>
    );
}

/**
 * GameController - Handles auth state and game logic
 */
function GameController() {
    const { user, profile, loading } = useAuth();

    // ========================
    // STATE MANAGEMENT
    // ========================

    // Core States
    const [gameState, setGameState] = useState('menu');
    const [isDark, setIsDark] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Navigation State (Subject → Category → Stage)
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);

    // Game Data
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(GAME_CONSTANTS.INITIAL_LIVES);
    const [combo, setCombo] = useState(0);
    const [streak, setStreak] = useState({
        active: false,
        multiplier: 1,
        timeLeft: 0,
        maxTime: GAME_CONSTANTS.STREAK_DURATION
    });
    const [powerups, setPowerups] = useState({
        freeze: GAME_CONSTANTS.INITIAL_FREEZE,
        bomb: GAME_CONSTANTS.INITIAL_BOMB
    });
    const [frozen, setFrozen] = useState(false);

    // Settings
    const [speedMode, setSpeedMode] = useState('teen');

    // Question State (loaded from Supabase)
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [qY, setQY] = useState(100);
    const [disabledOptions, setDisabledOptions] = useState([]);
    const [answeredCorrectly, setAnsweredCorrectly] = useState(new Set());

    // Animation States
    const [flyingBtn, setFlyingBtn] = useState(null);
    const [shakeScreen, setShakeScreen] = useState(0);
    const [shakeQuestion, setShakeQuestion] = useState(false);
    const [particles, setParticles] = useState([]);
    const [scorePopup, setScorePopup] = useState(null);

    // Results
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [wrongAnswers, setWrongAnswers] = useState([]);

    // Feedback
    const [feedback, setFeedback] = useState({ show: false, correct: false, message: '' });

    // ========================
    // REFS
    // ========================
    const gameAreaRef = useRef(null);
    const questionRef = useRef(null);
    const optionRefs = useRef([]);
    const animFrameRef = useRef(null);
    const streakTimerRef = useRef(null);
    const freezeTimerRef = useRef(null);

    // ========================
    // CUSTOM HOOKS
    // ========================
    const { isFullscreen, toggleFullScreen } = useFullscreen();
    const { initAudio, playSound, playCorrectSound, playWrongSound } = useAudio(isMuted);

    // ========================
    // PARTICLE SYSTEM
    // ========================
    const spawnParticles = useCallback((x, y, type = 'confetti', count = 15) => {
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i + Math.random(),
            x, y,
            vx: (Math.random() - 0.5) * (type === 'coin' ? 15 : 20),
            vy: (Math.random() - 0.5) * (type === 'coin' ? 25 : 20) - 10,
            color: type === 'coin' ? '#fbbf24' : ['#f472b6', '#34d399', '#60a5fa', '#fcd34d'][Math.floor(Math.random() * 4)],
            size: type === 'coin' ? Math.random() * 6 + 8 : Math.random() * 8 + 4,
            life: 1,
            decay: Math.random() * 0.02 + 0.015,
            type
        }));
        setParticles(prev => [...prev, ...newParticles]);
    }, []);

    // ========================
    // GAME INITIALIZATION
    // ========================

    // Navigate to subject selection
    const handleStartGame = useCallback(() => {
        setGameState('selectSubject');
    }, []);

    // Subject selected → go to category
    const handleSelectSubject = useCallback((subject) => {
        setSelectedSubject(subject);
        setGameState('selectCategory');
    }, []);

    // Category selected → go to stage
    const handleSelectCategory = useCallback((category) => {
        setSelectedCategory(category);
        setGameState('selectStage');
    }, []);

    // Stage selected → load questions and start game
    const handleSelectStage = useCallback(async (stage) => {
        setSelectedStage(stage);

        // Fetch questions from Supabase
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('stage_id', stage.id)
            .order('question_no');

        if (error || !data || data.length === 0) {
            console.error('Failed to load questions:', error);
            return;
        }

        // Transform questions to game format
        const preparedQuestions = data.map(q => {
            const options = [q.option_a, q.option_b];
            if (q.option_c) options.push(q.option_c);
            if (q.option_d) options.push(q.option_d);

            return {
                id: q.id,
                q: q.question_text,
                options: options.filter(Boolean).sort(() => Math.random() - 0.5),
                correct: q.correct_answer || q.option_a
            };
        });

        startGameWithQuestions(preparedQuestions);
    }, []);

    // Start game with loaded questions
    const startGameWithQuestions = useCallback((preparedQuestions) => {
        initAudio();
        setQuestions(preparedQuestions);
        setCurrentQ(preparedQuestions[0]);
        setQIndex(0);
        setQY(100);
        setScore(0);
        setLives(GAME_CONSTANTS.INITIAL_LIVES);
        setCombo(0);
        setStreak({ active: false, multiplier: 1, timeLeft: 0, maxTime: GAME_CONSTANTS.STREAK_DURATION });
        setPowerups({ freeze: GAME_CONSTANTS.INITIAL_FREEZE, bomb: GAME_CONSTANTS.INITIAL_BOMB });
        setFrozen(false);
        setDisabledOptions([]);
        setCorrectAnswers([]);
        setWrongAnswers([]);
        setAnsweredCorrectly(new Set());
        setFeedback({ show: false, correct: false, message: '' });
        setParticles([]);
        setShakeScreen(0);
        setGameState('playing');
    }, [initAudio]);

    // Navigation back handlers
    const handleBackToMenu = useCallback(() => {
        setSelectedSubject(null);
        setSelectedCategory(null);
        setSelectedStage(null);
        setGameState('menu');
    }, []);

    const handleBackToSubject = useCallback(() => {
        setSelectedCategory(null);
        setSelectedStage(null);
        setGameState('selectSubject');
    }, []);

    const handleBackToCategory = useCallback(() => {
        setSelectedStage(null);
        setGameState('selectCategory');
    }, []);

    // ========================
    // GAME LOOP
    // ========================
    useEffect(() => {
        if (gameState !== 'playing' || feedback.show || frozen) return;

        let lastTime = performance.now();

        const loop = (time) => {
            const dt = (time - lastTime) / 16.67;
            lastTime = time;

            setQY(prev => {
                const speedConfig = SPEED_MODES[speedMode];
                const currentSpeed = (speedConfig?.val || 0.5) * 1.5;
                const speedMultiplier = streak.active ? 1 + (streak.multiplier * 0.05) : 1;
                const newY = prev + (currentSpeed * speedMultiplier * dt);
                const gameH = gameAreaRef.current?.offsetHeight || 600;

                if (newY > gameH + 100) {
                    handleMiss();
                    return 100;
                }
                return newY;
            });
            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [gameState, feedback.show, frozen, speedMode, streak.active, streak.multiplier]);

    // ========================
    // PARTICLE ANIMATION
    // ========================
    useEffect(() => {
        if (particles.length === 0) return;
        const interval = setInterval(() => {
            setParticles(prev => prev
                .map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    vy: p.vy + 0.8,
                    life: p.life - p.decay,
                    rotation: (p.rotation || 0) + 10
                }))
                .filter(p => p.life > 0)
            );
        }, 16);
        return () => clearInterval(interval);
    }, [particles.length]);

    // ========================
    // STREAK TIMER
    // ========================
    useEffect(() => {
        if (!streak.active || gameState !== 'playing') return;
        streakTimerRef.current = setInterval(() => {
            setStreak(prev => {
                const newTime = prev.timeLeft - 50;
                if (newTime <= 0) {
                    clearInterval(streakTimerRef.current);
                    return { active: false, multiplier: 1, timeLeft: 0, maxTime: GAME_CONSTANTS.STREAK_DURATION };
                }
                return { ...prev, timeLeft: newTime };
            });
        }, 50);
        return () => clearInterval(streakTimerRef.current);
    }, [streak.active, gameState]);

    // ========================
    // HELPER FUNCTIONS
    // ========================
    const isInUpperHalf = useCallback(() => {
        const gameH = gameAreaRef.current?.offsetHeight || 600;
        const headerOffset = 100;
        return qY < (gameH / 2) + headerOffset;
    }, [qY]);

    const nextQuestion = useCallback(() => {
        let nextIdx = qIndex + 1;

        // Check if all questions are done - game complete!
        if (nextIdx >= questions.length) {
            // All questions answered - save progress and show results
            saveProgress(true);
            setGameState('results');
            return;
        }

        setQIndex(nextIdx);
        setCurrentQ(questions[nextIdx]);
        setQY(100);
        setDisabledOptions([]);
    }, [qIndex, questions]);

    // Save user progress to database
    const saveProgress = useCallback(async (completed) => {
        if (!profile?.id || !selectedStage?.id) return;

        // Calculate stars based on accuracy
        const totalAnswered = correctAnswers.length + wrongAnswers.length;
        const accuracy = totalAnswered > 0 ? (correctAnswers.length / totalAnswered) * 100 : 0;
        let stars = 0;
        if (accuracy >= 90) stars = 3;
        else if (accuracy >= 70) stars = 2;
        else if (accuracy >= 50) stars = 1;

        try {
            // Upsert progress
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: profile.id,
                    stage_id: selectedStage.id,
                    completed: completed,
                    stars: stars,
                    best_score: score,
                    completed_at: completed ? new Date().toISOString() : null
                }, {
                    onConflict: 'user_id,stage_id',
                    ignoreDuplicates: false
                });

            if (error) console.error('Failed to save progress:', error);
        } catch (err) {
            console.error('Error saving progress:', err);
        }
    }, [profile, selectedStage, correctAnswers, wrongAnswers, score]);

    const showFeedbackModal = useCallback((correct, message) => {
        setFeedback({ show: true, correct, message });
        setTimeout(() => {
            setFeedback({ show: false, correct: false, message: '' });
            if (lives <= 1 && !correct) {
                // Game over - save progress (not completed since they ran out of lives)
                saveProgress(false);
                setGameState('results');
            } else {
                nextQuestion();
            }
        }, 1000);
    }, [lives, nextQuestion, saveProgress]);

    // ========================
    // GAME ACTIONS
    // ========================
    const handleMiss = useCallback(() => {
        playWrongSound();
        triggerHaptic(200);
        setShakeScreen(1);
        setLives(prev => prev - 1);
        setCombo(0);
        setStreak({ active: false, multiplier: 1, timeLeft: 0, maxTime: GAME_CONSTANTS.STREAK_DURATION });

        if (!answeredCorrectly.has(currentQ?.id)) {
            setQuestions(prev => [...prev, currentQ]);
        }

        setWrongAnswers(prev => [...prev, { question: currentQ, userAnswer: null }]);
        showFeedbackModal(false, "⏰ خلص الوقت!");
        setTimeout(() => setShakeScreen(0), 500);
    }, [playWrongSound, currentQ, answeredCorrectly, showFeedbackModal]);

    const handleAnswer = useCallback((answer, btnIndex) => {
        if (gameState !== 'playing' || feedback.show || !currentQ || flyingBtn !== null) return;

        initAudio();

        const isCorrect = answer === currentQ.correct;
        const btnEl = optionRefs.current[btnIndex];
        const btnRect = btnEl?.getBoundingClientRect();
        const qRect = questionRef.current?.getBoundingClientRect();

        if (btnRect && qRect) {
            triggerHaptic(50);
            setFlyingBtn({
                index: btnIndex,
                text: answer,
                startX: btnRect.left,
                startY: btnRect.top,
                startW: btnRect.width,
                startH: btnRect.height,
                targetX: qRect.left + qRect.width / 2 - btnRect.width / 2,
                targetY: qRect.top + qRect.height / 2 - btnRect.height / 2,
                correct: isCorrect
            });
        }

        setTimeout(() => {
            if (isCorrect) {
                triggerHaptic(80);

                const basePoints = currentQ.golden ?
                    GAME_CONSTANTS.GOLDEN_POINTS : GAME_CONSTANTS.BASE_POINTS;
                let finalPoints = basePoints;
                let currentMult = streak.multiplier;

                if (isInUpperHalf()) {
                    if (streak.active) {
                        const newMult = Math.min(streak.multiplier + 1, GAME_CONSTANTS.MAX_MULTIPLIER);
                        setStreak(prev => ({
                            ...prev,
                            active: true,
                            multiplier: newMult,
                            timeLeft: GAME_CONSTANTS.STREAK_DURATION,
                            maxTime: GAME_CONSTANTS.STREAK_DURATION
                        }));
                        finalPoints = basePoints * newMult;
                        currentMult = newMult;
                    } else {
                        setStreak({
                            active: true,
                            multiplier: 2,
                            timeLeft: GAME_CONSTANTS.STREAK_DURATION,
                            maxTime: GAME_CONSTANTS.STREAK_DURATION
                        });
                        finalPoints = basePoints * 2;
                        currentMult = 2;
                    }
                } else {
                    if (streak.active) {
                        finalPoints = basePoints * streak.multiplier;
                    }
                }

                playCorrectSound(currentMult);
                setScore(prev => prev + finalPoints);
                setCombo(prev => prev + 1);
                setCorrectAnswers(prev => [...prev, { question: currentQ, userAnswer: answer }]);
                setAnsweredCorrectly(prev => new Set([...prev, currentQ.id]));

                setShakeQuestion(true);
                if (qRect) {
                    setScorePopup({
                        x: qRect.left + qRect.width / 2,
                        y: qRect.top,
                        points: finalPoints,
                        streak: streak.active
                    });
                    spawnParticles(qRect.left + qRect.width / 2, qRect.top + qRect.height / 2, 'confetti', 15);
                    spawnParticles(qRect.left + qRect.width / 2, qRect.top + qRect.height / 2, 'coin', 8);
                }

                let msg = "";
                if (currentMult >= 5) {
                    msg = MESSAGES.streak[Math.floor(Math.random() * MESSAGES.streak.length)];
                } else {
                    msg = MESSAGES.correct[Math.floor(Math.random() * MESSAGES.correct.length)];
                }
                showFeedbackModal(true, msg);

            } else {
                setShakeScreen(2);
                triggerHaptic(300);
                playWrongSound();
                setLives(prev => prev - 1);
                setCombo(0);
                setStreak({ active: false, multiplier: 1, timeLeft: 0, maxTime: GAME_CONSTANTS.STREAK_DURATION });

                if (!answeredCorrectly.has(currentQ.id)) {
                    setQuestions(prev => [...prev, currentQ]);
                }

                setWrongAnswers(prev => [...prev, { question: currentQ, userAnswer: answer }]);
                if (qRect) spawnParticles(qRect.left + qRect.width / 2, qRect.top + qRect.height / 2, 'confetti', 20);

                const msg = MESSAGES.wrong[Math.floor(Math.random() * MESSAGES.wrong.length)];
                showFeedbackModal(false, msg);
            }

            setTimeout(() => {
                setShakeQuestion(false);
                setShakeScreen(0);
                setFlyingBtn(null);
                setScorePopup(null);
            }, 300);

        }, 300);
    }, [
        gameState, feedback.show, currentQ, flyingBtn, initAudio,
        streak, isInUpperHalf, playCorrectSound, playWrongSound,
        spawnParticles, showFeedbackModal, answeredCorrectly
    ]);

    // ========================
    // POWERUPS
    // ========================
    const useFreeze = useCallback(() => {
        if (powerups.freeze <= 0 || frozen || gameState !== 'playing' || feedback.show) return;
        triggerHaptic(50);
        playSound(600, 'sine', 0.2, 0.5);
        setPowerups(prev => ({ ...prev, freeze: prev.freeze - 1 }));
        setFrozen(true);
        freezeTimerRef.current = setTimeout(() => setFrozen(false), GAME_CONSTANTS.FREEZE_DURATION);
    }, [powerups.freeze, frozen, gameState, feedback.show, playSound]);

    const useBomb = useCallback(() => {
        if (powerups.bomb <= 0 || gameState !== 'playing' || feedback.show || !currentQ) return;
        triggerHaptic(50);
        playSound(400, 'square', 0.15, 0.2);
        setPowerups(prev => ({ ...prev, bomb: prev.bomb - 1 }));
        const wrongOptions = currentQ.options.filter(o => o !== currentQ.a);
        const toDisable = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
        setDisabledOptions(toDisable);
    }, [powerups.bomb, gameState, feedback.show, currentQ, playSound]);

    // ========================
    // COMPUTED VALUES
    // ========================
    const bg = isDark ? 'bg-slate-900' : 'bg-slate-50';

    // ========================
    // RENDER
    // ========================
    return (
        <div
            className={`min-h-[100dvh] w-full ${bg} overflow-hidden select-none ${shakeScreen === 1 ? 'animate-shake' : shakeScreen === 2 ? 'animate-hardShake' : ''
                }`}
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: '700', touchAction: 'none' }}
        >
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div
                    className={`absolute inset-0 bg-[#0A0A1A] transition-opacity duration-700 ${isDark ? 'opacity-100' : 'opacity-80'}`}
                />
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A1A]/40 to-[#0A0A1A] transition-all duration-500`} />
                {streak.active && streak.multiplier >= 5 && (
                    <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay animate-pulse" />
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0A0A1A]">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Particles */}
            <ParticleSystem particles={particles} />

            {/* Score Popup */}
            <ScorePopup scorePopup={scorePopup} />

            {/* ============ LOGIN SCREEN ============ */}
            {!loading && !user && (
                <LoginScreen />
            )}

            {/* ============ MENU SCREEN ============ */}
            {!loading && user && gameState === 'menu' && (
                <MenuScreen
                    isDark={isDark}
                    onStartGame={handleStartGame}
                />
            )}

            {/* ============ SUBJECT SELECT SCREEN ============ */}
            {!loading && user && gameState === 'selectSubject' && (
                <SubjectSelectScreen
                    isDark={isDark}
                    onSelectSubject={handleSelectSubject}
                    onBack={handleBackToMenu}
                />
            )}

            {/* ============ CATEGORY SELECT SCREEN ============ */}
            {!loading && user && gameState === 'selectCategory' && selectedSubject && (
                <CategorySelectScreen
                    isDark={isDark}
                    subject={selectedSubject}
                    onSelectCategory={handleSelectCategory}
                    onBack={handleBackToSubject}
                />
            )}

            {/* ============ STAGE SELECT SCREEN ============ */}
            {!loading && user && gameState === 'selectStage' && selectedSubject && selectedCategory && (
                <StageSelectScreen
                    isDark={isDark}
                    subject={selectedSubject}
                    category={selectedCategory}
                    onSelectStage={handleSelectStage}
                    onBack={handleBackToCategory}
                />
            )}

            {/* ============ GAME SCREEN ============ */}
            {(gameState === 'playing' || gameState === 'paused') && (
                <GameScreen
                    isDark={isDark}
                    score={score}
                    lives={lives}
                    combo={combo}
                    streak={streak}
                    powerups={powerups}
                    frozen={frozen}
                    currentQ={currentQ}
                    qY={qY}
                    disabledOptions={disabledOptions}
                    flyingBtn={flyingBtn}
                    shakeQuestion={shakeQuestion}
                    feedbackShow={feedback.show}
                    isFullscreen={isFullscreen}
                    gameAreaRef={gameAreaRef}
                    questionRef={questionRef}
                    optionRefs={optionRefs}
                    onPause={() => setGameState('paused')}
                    onToggleFullscreen={toggleFullScreen}
                    onFreeze={useFreeze}
                    onBomb={useBomb}
                    onAnswer={handleAnswer}
                />
            )}

            {/* ============ PAUSE MENU MODAL ============ */}
            <PauseMenuModal
                isOpen={gameState === 'paused'}
                onResume={() => setGameState('playing')}
                onExit={() => setGameState('menu')}
                currentSpeedMode={speedMode}
                setSpeedMode={setSpeedMode}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isDark={isDark}
                setIsDark={setIsDark}
            />

            {/* ============ RESULTS SCREEN ============ */}
            {gameState === 'results' && (
                <ResultsScreen
                    isDark={isDark}
                    score={score}
                    correctAnswers={correctAnswers}
                    wrongAnswers={wrongAnswers}
                    onRestart={() => selectedStage && handleSelectStage(selectedStage)}
                    onMenu={() => setGameState('selectStage')}
                />
            )}

            {/* ============ FEEDBACK OVERLAY ============ */}
            <FeedbackOverlay feedback={feedback} />
        </div>
    );
}
