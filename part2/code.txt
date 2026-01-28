import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Pause, Volume2, VolumeX, Moon, Sun, Play, RotateCcw, Home, Maximize, Minimize,
  LogOut, Zap, Skull, Baby, Footprints, ChevronDown, X, Settings, Gauge, Ghost, Heart
} from 'lucide-react';

// =================================================================
// 🛠️ مكونات التصميم (UI Components)
// =================================================================

const triggerHaptic = (duration = 15) => { 
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration); 
  }
};

// زر بتصميم ملموس (Tactile)
const TactileButton = ({ children, onClick, className, colorClass, borderClass, shadowColor = "", disabled, activeScale = true }) => {
  return (
    <button 
      disabled={disabled}
      onClick={(e) => { triggerHaptic(); if(onClick) onClick(e); }}
      className={`
        relative group transition-all duration-150 ease-out
        border-2 border-b-[6px] 
        ${activeScale ? 'active:border-b-2 active:translate-y-[4px] active:scale-[0.98]' : ''}
        rounded-[20px] flex items-center justify-center
        ${disabled ? 'opacity-80 pointer-events-none' : ''}
        ${className}
        ${colorClass}
        ${borderClass}
        ${shadowColor}
        shadow-sm
      `}
    >
      {children}
    </button>
  );
};

// قائمة التوقف الجديدة
const PauseMenuModal = ({ isOpen, onClose, onResume, onExit, currentSpeedMode, setSpeedMode, isMuted, setIsMuted, isDark, setIsDark }) => {
  const [speedOpen, setSpeedOpen] = useState(false);

  // إعدادات السرعة
  const speeds = {
    'baby': { 
        id: 'baby',
        val: 0.3,
        label: 'وضع الرضيع 👶', 
        desc: 'رحلة الألف ميل تبدأ بخطوة', 
        color: 'bg-blue-100 text-blue-600',
        border: 'border-blue-200'
    },
    'teen': { 
        id: 'teen',
        val: 0.5,
        label: 'فتى (متوسط) 👱', 
        desc: 'للناس اللي قطعت شوط (هرولة)', 
        color: 'bg-orange-100 text-orange-600',
        border: 'border-orange-200'
    },
    'beast': { 
        id: 'beast',
        val: 0.8,
        label: 'وضع الوحش 👹', 
        desc: 'للأبطال اللي يمشون ميل ميل!', 
        color: 'bg-red-100 text-red-600',
        border: 'border-red-200'
    }
  };

  const selectedSpeedConfig = speeds[currentSpeedMode] || speeds['teen'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-5 font-['Cairo']">
      {/* خلفية معتمة */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onResume}></div>
      
      {/* جسم القائمة */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border-4 border-slate-200 dark:border-slate-700 shadow-2xl animate-pop-in overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* عنوان القائمة */}
        <div className="text-center mb-6 shrink-0 pt-2">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">استراحة محارب 🛑</h2>
            <p className="text-sm font-bold text-slate-400">خذ نفس وكمل الطريق</p>
        </div>

        <div className="space-y-3 overflow-y-auto hide-scrollbar px-1 pb-2">
            {/* 1. زر الاستئناف */}
            <TactileButton 
                onClick={onResume}
                className="w-full py-4 rounded-2xl gap-3 text-lg shrink-0"
                colorClass="bg-yellow-400"
                borderClass="border-yellow-600"
            >
                <Play className="w-6 h-6 fill-current text-yellow-900" />
                <span className="font-black text-yellow-900">استئناف اللعب</span>
            </TactileButton>

            {/* 2. زر التحكم بالسرعة */}
            <div className="relative shrink-0">
                <TactileButton 
                    onClick={() => setSpeedOpen(!speedOpen)}
                    className="w-full p-4 rounded-2xl justify-between"
                    colorClass="bg-slate-50 dark:bg-slate-800"
                    borderClass="border-slate-200 dark:border-slate-700"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${selectedSpeedConfig.color}`}>
                            {selectedSpeedConfig.label.split(' ').pop()} 
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-slate-400">سرعة اللعبة</span>
                            <span className="font-black text-slate-800 dark:text-white">{selectedSpeedConfig.label.replace(/ .*/,'') + ' ' + selectedSpeedConfig.label.split(' ')[1]}</span>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${speedOpen ? 'rotate-180' : ''}`} />
                </TactileButton>

                {/* القائمة المنسدلة */}
                {speedOpen && (
                    <div className="mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-[3px] border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden animate-slide-down">
                        <div className="p-2 grid gap-2">
                            {Object.values(speeds).map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => { setSpeedMode(s.id); setSpeedOpen(false); triggerHaptic(); }}
                                    className={`w-full p-3 rounded-xl flex items-start gap-3 transition-all border
                                        ${currentSpeedMode === s.id 
                                            ? 'bg-white dark:bg-slate-700 border-yellow-400 shadow-md ring-2 ring-yellow-400/20' 
                                            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 mt-1 ${s.color.split(' ')[0]} bg-opacity-20`}>
                                        {s.label.split(' ').pop()}
                                    </div>
                                    <div className="text-right flex-1 pt-0.5">
                                        <div className={`font-black text-base mb-0.5 ${currentSpeedMode === s.id ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {s.label.replace(/ .*/,'') + ' ' + (s.label.split(' ')[1] || '')}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight">
                                            {s.desc}
                                        </div>
                                    </div>
                                    {currentSpeedMode === s.id && <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. صف الأزرار (صوت + وضع ليلي + خروج) */}
            <div className="flex gap-2 shrink-0">
                {/* زر الصوت */}
                <TactileButton 
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex-1 p-3 rounded-2xl gap-1"
                    colorClass={!isMuted ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}
                    borderClass={!isMuted ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'}
                >
                    {!isMuted ? <Volume2 className="w-5 h-5 text-indigo-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                </TactileButton>

                {/* زر الوضع الليلي */}
                <TactileButton 
                    onClick={() => setIsDark(!isDark)}
                    className="flex-1 p-3 rounded-2xl gap-1"
                    colorClass={isDark ? 'bg-slate-700' : 'bg-orange-50'}
                    borderClass={isDark ? 'border-slate-600' : 'border-orange-200'}
                >
                    {isDark ? <Moon className="w-5 h-5 text-yellow-300" /> : <Sun className="w-5 h-5 text-orange-500" />}
                </TactileButton>

                {/* زر الخروج */}
                <TactileButton 
                    onClick={onExit}
                    className="flex-1 p-3 rounded-2xl gap-1"
                    colorClass="bg-rose-50 dark:bg-rose-900/20"
                    borderClass="border-rose-200 dark:border-rose-800"
                >
                    <LogOut className="w-5 h-5 text-rose-500" />
                </TactileButton>
            </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 📝 منطقة تعديل النصوص والرسائل
// =================================================================
const MESSAGES = {
  // التشجيع (عام)
  correct: [
    "👏 إمتاز! استمر هيج",
    "🌟 وحش ابو جاسم",
    "⚡ انت شكاكي",
    "🌟 جينات اينشتاين عندك؟",
    "رح تشكهم بالوزاري",
    "🔥 بطل",
    "💯 ممتاز!",
    "👏 ممتاز! استمر هيج!",
    "💪 ما تتوقف!",
    "🔥 عفية عليك!",
    "🚀 إشكلك مخلص المنهج قبل الأستاذ!",
    "🔥 الله يزوجك 4"
  ],
  // الذم (عام)
  wrong: [
    "🙄 السؤال يگلك: أرجوك بعد لا تجاوبني!",
    "⚡ بهاي السرعة جاوبت... شكلك مستغني عن الدرجة!",
    "💔 راح تبقى الإجابة بذاكرتك كصدمة عاطفية!",
    "🤦‍♂️ لو تخلي إيدك على عينك جان جاوبت صح",
    "😭 من جاوبت، الجملة جانت تبجي وتصيح: مو هيج الحل",
    "😅 همزين مو بالوزاري!",
    "🤣 بعدك بالسادس لو حوّلوك ابتدائي؟",
    "😳 جاوبت من جيبك؟ لأن الكتاب مابي هيج شي",
    "😬 آخ... طارت الدرجة!"
  ],
  // تمت إزالة finalCountdown لأن المرحلة لا نهائية
  streak: ["🔥🔥 ON FIRE!", "⚡ UNSTOPPABLE!", "💪 GODLIKE!", "🌟 LEGEND!"]
};

// Sample Questions with Explanation
const QUESTIONS = [
  { 
    id: 1, 
    q: "I ______ to the store yesterday.", 
    options: ["go", "went", "gone", "going"], 
    a: "went", 
    explanation: "نستخدم الماضي البسيط (went) لأن الجملة تحتوي على 'yesterday'.",
    golden: false 
  },
  { 
    id: 2, 
    q: "She ______ glasses before.", 
    options: ["wear", "used to wear", "wears", "wearing"], 
    a: "used to wear", 
    explanation: "نستخدم 'used to' للتعبير عن عادة في الماضي لم تعد موجودة.",
    golden: true 
  },
  { 
    id: 3, 
    q: "How ______ exercise does he take?", 
    options: ["many", "much", "more", "most"], 
    a: "much", 
    explanation: "كلمة 'exercise' هنا غير معدودة (uncountable)، فنستخدم 'much'.",
    golden: false 
  },
  { 
    id: 4, 
    q: "If I ______ you, I would study.", 
    options: ["am", "was", "were", "be"], 
    a: "were", 
    explanation: "في الحالة الشرطية الثانية للنصيحة، نستخدم 'If I were you'.",
    golden: true 
  },
  { 
    id: 5, 
    q: "The story was ______ written.", 
    options: ["beautiful", "beautifully", "beauty", "beautify"], 
    a: "beautifully", 
    explanation: "نحتاج لظرف (Adverb) لوصف الفعل 'written'، لذا نختار 'beautifully'.",
    golden: false 
  },
];

export default function App() {
  const [gameState, setGameState] = useState('menu');
  const [isDark, setIsDark] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Game Data
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(10); // START WITH 10 LIVES
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState({ active: false, multiplier: 1, timeLeft: 0, maxTime: 5000 });
  const [powerups, setPowerups] = useState({ freeze: 2, bomb: 1 });
  const [frozen, setFrozen] = useState(false);
  // const [progress, setProgress] = useState(0); // Progress not needed for infinite mode visual
  
  // Settings
  const [speedMode, setSpeedMode] = useState('teen');
  
  // Question State
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
  const [showComboFire, setShowComboFire] = useState(false);
  const [particles, setParticles] = useState([]);
  const [scorePopup, setScorePopup] = useState(null);
  
  // Results
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  
  // Feedback
  const [feedback, setFeedback] = useState({ show: false, correct: false, message: '' });
  
  // Refs - Moved here to fix ReferenceError
  const gameAreaRef = useRef(null);
  const questionRef = useRef(null);
  const optionRefs = useRef([]);
  const animFrameRef = useRef(null);
  const streakTimerRef = useRef(null);
  const freezeTimerRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Initialize/Resume Audio Context
  const initAudio = () => {
    if (!audioCtxRef.current) {
        try {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { console.error("Audio API not supported"); }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
  };

  // Audio System
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
      
      // Punchier envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01); 
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }, [isMuted]);

  const playCorrectSound = (multiplier) => {
    // 🔥 Heavy Impact Sound + Chime
    playSound(100, 'sawtooth', 0.4, 0.1); 
    setTimeout(() => {
        const baseFreq = 600 + (multiplier * 150);
        playSound(baseFreq, 'square', 0.15, 0.1);
        playSound(baseFreq * 1.5, 'sine', 0.2, 0.2);
    }, 50);
  };

  const playWrongSound = () => {
    playSound(150, 'sawtooth', 0.4, 0.4);
    setTimeout(() => playSound(100, 'sawtooth', 0.4, 0.4), 100);
  };

  // Spawn Particles
  const spawnParticles = (x, y, type = 'confetti', count = 15) => {
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
  };

  // Full Screen Handler (Fixed)
  const toggleFullScreen = () => {
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement;
        const requestFS = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
        
        if (requestFS) {
          requestFS.call(elem)
            .then(() => setIsFullscreen(true))
            .catch(err => {
              console.warn("Full screen error:", err);
            });
        }
      } else {
        const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exitFS) {
          exitFS.call(document)
            .then(() => setIsFullscreen(false))
            .catch(err => console.warn(err));
        }
      }
    } catch (e) {
      console.warn("Fullscreen API error:", e);
    }
  };

  // Initialize Game
  const startGame = () => {
    initAudio(); // Initialize audio context on first interaction
    const preparedQuestions = QUESTIONS.map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5) 
    }));

    setQuestions(preparedQuestions);
    setCurrentQ(preparedQuestions[0]);
    setQIndex(0);
    setQY(100);
    setScore(0);
    setLives(10); // START WITH 10 LIVES
    setCombo(0);
    setStreak({ active: false, multiplier: 1, timeLeft: 0, maxTime: 5000 });
    setPowerups({ freeze: 2, bomb: 1 });
    setFrozen(false);
    setDisabledOptions([]);
    setCorrectAnswers([]);
    setWrongAnswers([]);
    setAnsweredCorrectly(new Set());
    // setProgress(0); // No progress bar
    setFeedback({ show: false, correct: false, message: '' });
    setParticles([]);
    setShakeScreen(0);
    setGameState('playing');
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing' || feedback.show || frozen) return;
    
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = (time - lastTime) / 16.67;
      lastTime = time;

      setQY(prev => {
        // Speed Mapping
        const speedMap = { 'baby': 0.3, 'teen': 0.5, 'beast': 0.8 };
        const currentBaseSpeed = speedMap[speedMode] || 0.5;

        const currentSpeed = currentBaseSpeed * 1.5; 
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
  }, [gameState, feedback.show, frozen, speedMode, streak.active, combo]);

  // Particle Animation
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

  const isInUpperHalf = () => {
    const gameH = gameAreaRef.current?.offsetHeight || 600;
    const headerOffset = 100;
    return qY < (gameH / 2) + headerOffset; 
  };

  const handleAnswer = (answer, btnIndex) => {
    if (gameState !== 'playing' || feedback.show || !currentQ || flyingBtn !== null) return;
    
    initAudio(); 
    
    const isCorrect = answer === currentQ.a;
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
        
        const basePoints = currentQ.golden ? 20 : 10;
        let finalPoints = basePoints;
        let currentMult = streak.multiplier;
        
        if (isInUpperHalf()) {
            if (streak.active) {
                // Already active: increase multiplier up to 5, reset timer
                const newMult = Math.min(streak.multiplier + 1, 5);
                setStreak(prev => ({ ...prev, active: true, multiplier: newMult, timeLeft: 5000, maxTime: 5000 }));
                finalPoints = basePoints * newMult;
                currentMult = newMult;
            } else {
                // Start new streak: 2x multiplier
                setStreak({ active: true, multiplier: 2, timeLeft: 5000, maxTime: 5000 });
                finalPoints = basePoints * 2;
                currentMult = 2;
            }
        } else {
            // Lower half: apply current multiplier but let timer run
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
          setScorePopup({ x: qRect.left + qRect.width / 2, y: qRect.top, points: finalPoints, streak: streak.active });
          spawnParticles(qRect.left + qRect.width / 2, qRect.top + qRect.height / 2, 'confetti', 15);
          spawnParticles(qRect.left + qRect.width / 2, qRect.top + qRect.height / 2, 'coin', 8);
        }
        
        if (currentMult >= 2) setShowComboFire(true);
        
        // --- 🤖 Feedback Message Logic (Infinite Mode) ---
        let msg = "";
        // No final countdown logic here
        
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
        setStreak({ active: false, multiplier: 1, timeLeft: 0, maxTime: 5000 }); 
        setShowComboFire(false);
        
        // RE-QUEUE WRONG QUESTION (Retry logic)
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
  };

  const handleMiss = () => {
    playWrongSound();
    triggerHaptic(200);
    setShakeScreen(1);
    setLives(prev => prev - 1);
    setCombo(0);
    setStreak({ active: false, multiplier: 1, timeLeft: 0, maxTime: 5000 });
    setShowComboFire(false);
    
    // RE-QUEUE MISSED QUESTION
    if (!answeredCorrectly.has(currentQ.id)) {
      setQuestions(prev => [...prev, currentQ]);
    }
    
    setWrongAnswers(prev => [...prev, { question: currentQ, userAnswer: null }]);
    showFeedbackModal(false, "⏰ خلص الوقت!");
    setTimeout(() => setShakeScreen(0), 500);
  };

  const showFeedbackModal = (correct, message) => {
    setFeedback({ show: true, correct, message });
    setTimeout(() => {
      setFeedback({ show: false, correct: false, message: '' });
      if (lives <= 1 && !correct) {
        setGameState('results');
      } else {
        nextQuestion();
      }
    }, 1000);
  };

  const nextQuestion = () => {
    let nextIdx = qIndex + 1;
    // setProgress((nextIdx / questions.length) * 100); // Removed progress bar logic

    // INFINITE MODE LOGIC:
    // If we reach the end of the array, shuffle and start again (or just loop)
    // Since we append wrong/missed questions to the end, the array grows.
    // If we truly cleared everything, we might want to restart with full shuffle.
    // But basic infinite here means: keep going until lives run out.
    
    if (nextIdx >= questions.length) {
       // If all answered correctly and array ended (unlikely with retry logic unless perfect)
       // Let's reshuffle and restart index to keep it going "Infinite"
       const reShuffled = QUESTIONS.map(q => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5) 
       })).sort(() => Math.random() - 0.5); // Shuffle order too
       
       setQuestions(prev => [...prev, ...reShuffled]); // Append new batch
       // qIndex continues to increment
    }
    
    setQIndex(nextIdx);
    // Safety check if nextIdx is valid
    if (questions[nextIdx]) {
        setCurrentQ(questions[nextIdx]);
    } else {
        // Fallback if needed, though append logic above handles it
        // If we are here, we might need to set currentQ from the newly appended items
        // but react state update is async. For this simple logic, let's trust the effect or simple loop
    }
    
    // Actually, simpler infinite logic for this demo without complex pagination:
    // Just wrap around if we exceed length, but we want unique randomized experience.
    // The append logic above is fine.
    
    // We need to set currentQ from the updated state, which is tricky in one go.
    // Let's use a simpler approach: If nextIdx >= length, grab from start (modulo) but re-randomize options?
    // Or just rely on the re-queue logic.
    
    // Correct approach for infinite stream:
    // When near end, append more.
    if (nextIdx >= questions.length - 1) {
         const moreQuestions = QUESTIONS.map(q => ({
            ...q,
            id: q.id + Date.now(), // Unique ID
            options: [...q.options].sort(() => Math.random() - 0.5) 
         }));
         setQuestions(prev => [...prev, ...moreQuestions]);
    }
    
    setCurrentQ(questions[nextIdx] || questions[0]); // Fallback
    setQY(100);
    setDisabledOptions([]);
  };

  const useFreeze = () => {
    if (powerups.freeze <= 0 || frozen || gameState !== 'playing' || feedback.show) return;
    triggerHaptic(50);
    playSound(600, 'sine', 0.2, 0.5);
    setPowerups(prev => ({ ...prev, freeze: prev.freeze - 1 }));
    setFrozen(true);
    freezeTimerRef.current = setTimeout(() => setFrozen(false), 5000);
  };

  const useBomb = () => {
    if (powerups.bomb <= 0 || gameState !== 'playing' || feedback.show || !currentQ) return;
    triggerHaptic(50);
    playSound(400, 'square', 0.15, 0.2);
    setPowerups(prev => ({ ...prev, bomb: prev.bomb - 1 }));
    const wrongOptions = currentQ.options.filter(o => o !== currentQ.a);
    const toDisable = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledOptions(toDisable);
  };

  useEffect(() => {
    if (!streak.active || gameState !== 'playing') return;
    streakTimerRef.current = setInterval(() => {
      setStreak(prev => {
        const newTime = prev.timeLeft - 50;
        if (newTime <= 0) {
          clearInterval(streakTimerRef.current);
          return { active: false, multiplier: 1, timeLeft: 0, maxTime: 5000 };
        }
        return { ...prev, timeLeft: newTime };
      });
    }, 50);
    return () => clearInterval(streakTimerRef.current);
  }, [streak.active, gameState]);

  const bg = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const text = isDark ? 'text-white' : 'text-slate-800';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-[100dvh] w-full ${bg} overflow-hidden select-none ${shakeScreen === 1 ? 'animate-shake' : shakeScreen === 2 ? 'animate-hardShake' : ''}`} style={{ fontFamily: "'Cairo', sans-serif", fontWeight: '700', touchAction: 'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Nunito:wght@400;700;900&family=Tajawal:wght@400;700;900&display=swap');
        
        /* Animations */
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }
        @keyframes hardShake { 0%, 100% { transform: translate(0,0); } 10% { transform: translate(-10px,-10px); } 30% { transform: translate(10px,10px); } 50% { transform: translate(-10px,5px); } 70% { transform: translate(10px,-10px); } 90% { transform: translate(-5px,10px); } }
        @keyframes shakeQ { 0%, 100% { transform: translateX(-50%) scale(1); } 20% { transform: translateX(calc(-50% - 10px)) scale(1.02); } 40% { transform: translateX(calc(-50% + 10px)) scale(0.98); } 60% { transform: translateX(calc(-50% - 8px)) scale(1.01); } 80% { transform: translateX(calc(-50% + 8px)) scale(0.99); } }
        @keyframes popIn { 0% { transform: scale(0) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.1) rotate(5deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes fire { 0%, 100% { transform: scale(1) rotate(-3deg); filter: brightness(1); } 50% { transform: scale(1.2) rotate(3deg); filter: brightness(1.3); } }
        @keyframes goldenPulse { 0%, 100% { box-shadow: 0 8px 0 #d97706, 0 0 30px rgba(251,191,36,0.5); } 50% { box-shadow: 0 8px 0 #d97706, 0 0 50px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.4); } }
        @keyframes scoreUp { 0% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -150%) scale(1.5); } }
        @keyframes spinProjectile { 0% { transform: translate(0,0) rotate(0deg); } 100% { transform: translate(var(--tx), var(--ty)) rotate(360deg) scale(0.5); } }
        @keyframes neonPulse { 0%, 100% { box-shadow: inset 0 0 20px rgba(236, 72, 153, 0.5); } 50% { box-shadow: inset 0 0 50px rgba(168, 85, 247, 0.8); } }
        
        /* Modal Animations */
        .animate-pop-in { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 300px; } }
        
        /* Utility */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .animate-shake { animation: shake 0.5s ease-out; }
        .animate-hardShake { animation: hardShake 0.4s ease-in-out; }
        .animate-shakeQ { animation: shakeQ 0.4s ease-out; }
        .animate-popIn { animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-fire { animation: fire 0.3s infinite; }
        .animate-scoreUp { animation: scoreUp 0.8s ease-out forwards; }
        .fever-mode { animation: neonPulse 1s infinite alternate; }
      `}</style>

      {/* Dynamic Background */}
      <div className={`fixed inset-0 pointer-events-none transition-all duration-300 ${isDark ? 'bg-slate-900' : 'bg-sky-50'} ${streak.active && streak.multiplier >= 5 ? 'fever-mode' : ''}`}>
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
      </div>

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} className="fixed pointer-events-none z-[500]" style={{
          left: p.x, top: p.y, width: p.size, height: p.size,
          backgroundColor: p.color, opacity: p.life,
          transform: `scale(${p.life}) rotate(${p.rotation}deg)`,
          borderRadius: p.type === 'coin' ? '50%' : '2px',
          boxShadow: p.type === 'coin' ? '0 0 10px #fbbf24' : 'none',
          border: p.type === 'coin' ? '2px solid #f59e0b' : 'none'
        }}>
            {p.type === 'coin' && <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-yellow-700">$</div>}
        </div>
      ))}

      {/* Score Popup */}
      {scorePopup && (
        <div className="fixed z-[400] pointer-events-none font-black text-4xl animate-scoreUp" style={{ left: scorePopup.x, top: scorePopup.y, transform: 'translate(-50%, -50%)' }}>
          <span className={scorePopup.streak ? 'text-orange-500' : 'text-emerald-500'} style={{ textShadow: '2px 2px 0px white, 0 0 20px currentColor' }}>
            +{scorePopup.points}
          </span>
        </div>
      )}

      {/* ============ MENU SCREEN ============ */}
      {gameState === 'menu' && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-sm p-6 rounded-[2rem] shadow-2xl border-4 ${card} relative overflow-hidden flex flex-col`}>
            
            {/* الخلفية المتحركة */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute w-32 h-32 bg-yellow-400 rounded-full blur-3xl -top-10 -right-10 animate-pulse" />
              <div className="absolute w-32 h-32 bg-blue-400 rounded-full blur-3xl -bottom-10 -left-10 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              {/* الشعار والعنوان */}
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg animate-bounce">
                  <span className="text-4xl">🎮</span>
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-1" style={{ fontFamily: 'Nunito' }}>KHTMTHA</h1>
                <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: 'Tajawal' }}>
                  أجب قبل ما يوصل السؤال!
                </p>
              </div>

              {/* قائمة الشرح والقواعد */}
              <div className="space-y-2 mb-6 text-sm" style={{ fontFamily: 'Tajawal' }}>
                {[
                  { icon: '⚡', title: 'COMBO', desc: 'جاوب بالنصف العلوي!', color: 'from-amber-500/20 to-orange-500/20' },
                  { icon: '❄️', title: 'تجميد', desc: '5 ثواني توقف (2x)', color: 'from-cyan-100 to-cyan-50 border-cyan-200 text-cyan-600' }, // ICE BLUE
                  { icon: '💣', title: 'قنبلة', desc: 'احذف جوابين (1x)', color: 'from-red-100 to-rose-100 border-red-200 text-red-600' }, // RED
                  { icon: '⭐', title: 'XP', desc: 'عادي = 10 نقاط', color: 'from-yellow-100 to-amber-100 border-yellow-200 text-amber-600' }, // YELLOW
                  { icon: '💔', title: '10 أرواح ', desc: 'المرحلة لا نهائية!', color: 'from-blue-50 to-slate-50 border-blue-100 text-blue-500' }, // UPDATED TEXT
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r ${item.color}`}>
                    <span className="text-xl w-8 text-center">{item.icon}</span>
                    <div className="flex-1 text-right" dir="rtl">
                      <span className={`font-black ml-2`}>{item.title}</span>
                      <span className="opacity-80">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* زر ابدأ اللعب */}
              <button 
                onClick={startGame} 
                className="w-full py-4 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-xl border-b-[6px] border-emerald-600 active:border-b-0 active:translate-y-[6px] transition-all duration-75 relative overflow-hidden group mt-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2" style={{ fontFamily: 'Tajawal' }}>
                  <Play className="w-6 h-6 fill-white" /> ابدأ اللعب!
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-active:translate-y-0 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ GAME SCREEN ============ */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="h-screen flex flex-col relative z-10">
          
          {/* HEADER (HUD) */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-50 h-24">
            
            {/* Left: Pause & Fullscreen Buttons */}
            <div className="flex gap-2 shrink-0">
                <button 
                    onClick={() => setGameState('paused')} 
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-md flex items-center justify-center border-b-4 border-slate-200 dark:border-slate-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <Pause className="w-6 h-6 text-slate-700 dark:text-slate-200 fill-current" />
                </button>
                <button 
                    onClick={toggleFullScreen} 
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-md flex items-center justify-center border-b-4 border-slate-200 dark:border-slate-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    {isFullscreen ? <Minimize className="w-6 h-6 text-slate-700 dark:text-slate-200" /> : <Maximize className="w-6 h-6 text-slate-700 dark:text-slate-200" />}
                </button>
            </div>

            {/* Right: Score + Lives */}
            <div className="flex flex-col items-end gap-1 shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border-2 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} shadow-sm`}>
                    <span className="text-yellow-500 text-xs font-black">XP</span>
                    <span className={`text-xl font-black ${text}`}>{score.toLocaleString()}</span>
                </div>
                {/* Lives (Single Heart with Number) */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'} shadow-sm`}>
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <span className={`text-lg font-black ${text}`}>{lives}</span>
                </div>
            </div>
          </div>

          {/* Game Area */}
          <div ref={gameAreaRef} className="flex-1 relative overflow-visible">
            
            {/* Streak Counter Display (BOTTOM LEFT) */}
            {streak.active && (
              <div className="absolute bottom-32 left-4 z-30 animate-popIn">
                <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 relative overflow-hidden ${
                  streak.multiplier >= 5 ? 'bg-gradient-to-br from-red-600 to-orange-600 border-orange-400' :
                  streak.multiplier >= 4 ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-amber-300' :
                  'bg-gradient-to-br from-blue-500 to-indigo-500 border-indigo-300'
                }`}>
                  <span className="text-white text-xl font-black leading-none">{streak.multiplier}X</span>
                  <span className="text-[9px] font-bold text-white/90">COMBO</span>
                  {/* Timer Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={175} strokeDashoffset={175 - (175 * streak.timeLeft / streak.maxTime)} />
                  </svg>
                </div>
              </div>
            )}

            {/* Combo Display (BOTTOM RIGHT) */}
            {combo >= 2 && (
              <div className="absolute bottom-32 right-4 z-30 flex flex-col items-center animate-popIn">
                <div className="relative">
                   <span className="text-5xl block animate-fire filter drop-shadow-md">🔥</span>
                   <span className="absolute top-full left-1/2 -translate-x-1/2 text-white bg-orange-500 text-xs font-black px-2 py-0.5 rounded rotate-3 whitespace-nowrap border border-white shadow-lg">
                      {combo}x
                   </span>
                </div>
              </div>
            )}

            {/* Falling Question */}
            {currentQ && (
              <div
                ref={questionRef}
                className={`absolute left-1/2 -translate-x-1/2 w-[90%] max-w-sm p-6 rounded-3xl text-center transition-transform ${shakeQuestion ? 'animate-shakeQ' : ''} ${
                  frozen ? 'bg-cyan-500 border-cyan-300' :
                  currentQ.golden ? 'bg-amber-400 border-amber-200' :
                  (isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200')
                } border-b-[8px] border-x-2 border-t-2`}
                style={{
                  top: qY,
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                  animation: currentQ.golden && !frozen ? 'goldenPulse 1.5s infinite' : undefined
                }}
              >
                {/* Badges */}
                <div className="absolute -top-4 left-0 right-0 flex justify-center gap-2">
                    {currentQ.golden && <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-yellow-300">GOLDEN</span>}
                    {frozen && <span className="bg-cyan-100 text-cyan-800 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-cyan-300 animate-pulse">FROZEN</span>}
                </div>

                <p className={`text-xl font-black leading-snug ${frozen ? 'text-white' : currentQ.golden ? 'text-amber-900' : text}`}>
                  {currentQ.q}
                </p>
              </div>
            )}
          </div>

          {/* Powerups */}
          <div className="flex justify-center gap-6 pb-2 relative z-20">
            <button
              onClick={useFreeze}
              disabled={powerups.freeze <= 0 || frozen}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 transition-all active:scale-90 ${
                powerups.freeze <= 0 || frozen ? 'opacity-30 grayscale scale-90' : 'hover:scale-105 hover:-translate-y-1'
              } ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}
            >
              ❄️
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow">{powerups.freeze}</span>
            </button>
            <button
              onClick={useBomb}
              disabled={powerups.bomb <= 0}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 transition-all active:scale-90 ${
                powerups.bomb <= 0 ? 'opacity-30 grayscale scale-90' : 'hover:scale-105 hover:-translate-y-1'
              } ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`}
            >
              💣
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow">{powerups.bomb}</span>
            </button>
          </div>

          {/* GLASSMORPHISM BUTTONS CONTAINER */}
          <div className={`p-4 pb-8 rounded-t-[3rem] border-t backdrop-blur-md ${isDark ? 'bg-slate-800/40 border-white/5' : 'bg-white/40 border-white/40'}`}>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {currentQ?.options.map((opt, idx) => {
                const isDisabled = disabledOptions.includes(opt);
                const isFlying = flyingBtn?.index === idx;
                
                return (
                  <button
                    key={idx}
                    ref={el => optionRefs.current[idx] = el}
                    onClick={() => !isDisabled && handleAnswer(opt, idx)}
                    disabled={isDisabled || feedback.show || flyingBtn !== null}
                    className={`relative py-5 px-3 rounded-2xl font-black text-lg tracking-wide transition-all border-b-[6px] active:border-b-0 active:translate-y-[6px] active:scale-95 duration-75 ${
                      isFlying ? 'opacity-0' :
                      isDisabled 
                        ? 'opacity-30 grayscale pointer-events-none scale-90' 
                        : isDark 
                          ? 'bg-slate-700 text-white border-slate-900 shadow-slate-900/50 hover:bg-slate-600' 
                          : 'bg-white text-slate-800 border-slate-300 shadow-slate-200 hover:bg-slate-50'
                    } shadow-xl`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flying Button Animation */}
          {flyingBtn && (
            <div
              className={`fixed z-[300] rounded-2xl font-black text-lg flex items-center justify-center border-4 ${
                flyingBtn.correct 
                  ? 'bg-emerald-500 text-white border-emerald-600' 
                  : 'bg-rose-500 text-white border-rose-600'
              }`}
              style={{
                left: flyingBtn.startX,
                top: flyingBtn.startY,
                width: flyingBtn.startW,
                height: flyingBtn.startH,
                '--tx': `${flyingBtn.targetX - flyingBtn.startX}px`,
                '--ty': `${flyingBtn.targetY - flyingBtn.startY}px`,
                animation: 'spinProjectile 0.35s ease-in forwards',
                boxShadow: '0 0 40px rgba(0,0,0,0.3)'
              }}
            >
              {flyingBtn.text}
            </div>
          )}
        </div>
      )}

      {/* ============ PAUSE MENU MODAL (Using the New Component) ============ */}
      <PauseMenuModal 
        isOpen={gameState === 'paused'}
        onClose={() => setGameState('playing')}
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
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-popIn">
            <div className={`w-full max-w-sm p-6 rounded-[2rem] shadow-2xl border-2 ${card}`}>
                <div className="text-center mb-6">
                    <span className="text-6xl block mb-2">{score > 50 ? '👑' : '😎'}</span>
                    <h2 className={`text-3xl font-black ${text}`} style={{ fontFamily: "'Cairo', sans-serif" }}>النتيجة النهائية</h2>
                </div>
                
                {/* Total Score */}
                <div className="bg-slate-200 p-6 rounded-2xl mb-6 text-center shadow-inner">
                    <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">Total Score</span>
                    <div className="text-6xl font-black text-slate-800 mt-2">{score}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-100 p-3 rounded-xl text-center border-2 border-green-200">
                        <span className="block text-xs font-bold text-green-700 mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إجابات صحيحة</span>
                        <span className="text-3xl font-black text-green-600">{correctAnswers.length}</span>
                    </div>
                    <div className="bg-red-100 p-3 rounded-xl text-center border-2 border-red-200">
                        <span className="block text-xs font-bold text-red-700 mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إجابات خاطئة</span>
                        <span className="text-3xl font-black text-red-600">{wrongAnswers.length}</span>
                    </div>
                </div>

                {/* Error Review with Explanation */}
                {wrongAnswers.length > 0 && (
                    <div className="mb-4 max-h-40 overflow-y-auto bg-white rounded-xl p-3 border border-slate-200">
                        <h3 className="font-bold text-red-500 mb-2 text-base text-right font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>الأخطاء ({wrongAnswers.length})</h3>
                        {wrongAnswers.map((item, i) => (
                            <div key={i} className="text-right text-sm border-b border-slate-100 last:border-0 py-3">
                                <p className="font-black mb-1 text-slate-800 text-base">{item.question.q}</p>
                                <div className="flex justify-end gap-2 mb-1">
                                    <span className="text-green-600 font-black text-sm bg-green-100 px-2 py-0.5 rounded">{item.question.a} ✓</span>
                                    <span className="text-red-500 font-bold line-through opacity-70">{item.userAnswer || 'وقت'}</span>
                                </div>
                                <p className="text-slate-600 italic bg-slate-50 p-2 rounded font-bold text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>💡 {item.question.explanation || 'لا يوجد شرح متاح.'}</p>
                            </div>
                        ))}
                    </div>
                )}
                
                <button onClick={startGame} className="w-full py-4 rounded-xl font-black text-xl text-white bg-emerald-500 shadow-lg shadow-emerald-500/30 mb-3 hover:scale-105 transition-transform" style={{ fontFamily: "'Cairo', sans-serif" }}>لعب مرة أخرى</button>
                <button onClick={() => setGameState('menu')} className={`w-full py-4 rounded-xl font-bold transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`} style={{ fontFamily: "'Cairo', sans-serif" }}>القائمة الرئيسية</button>
            </div>
         </div>
      )}

      {/* ============ FEEDBACK OVERLAY ============ */}
      {feedback.show && (
        <div className="fixed inset-0 flex items-center justify-center z-[400] pointer-events-none px-4">
          <div className={`
            relative
            transform transition-all duration-300
            scale-100 md:scale-125 lg:scale-150 /* Responsive scaling */
            p-6 md:p-8 /* Responsive padding */
            rounded-[2rem] md:rounded-[3rem] 
            shadow-2xl text-center border-4 md:border-8 
            animate-popIn 
            max-w-[90vw] /* Prevent overflow width */
            ${
            feedback.correct 
              ? 'bg-emerald-500 border-white text-white rotate-2 md:rotate-3'
              : 'bg-rose-500 border-white text-white -rotate-2 md:-rotate-3'
          }`}>
            <div className="text-6xl md:text-8xl mb-2 md:mb-4 drop-shadow-md"> {/* Responsive emoji size */}
              {feedback.correct ? '🤩' : '😱'}
            </div>
            <p className="text-xl md:text-3xl font-black whitespace-pre-line drop-shadow-md leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {feedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}