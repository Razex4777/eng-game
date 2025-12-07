// ====================================
// AUDIO SYSTEM
// English Mastery Battle
// ====================================

const AudioSys = {
    ctx: null,
    
    init: () => {
        if (!AudioSys.ctx) {
            AudioSys.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (AudioSys.ctx.state === 'suspended') {
            AudioSys.ctx.resume();
        }
    },
    
    play: (freq, type, dur, vol = 0.1) => {
        if (state.muted) return;
        if (!AudioSys.ctx) return;
        
        const osc = AudioSys.ctx.createOscillator();
        const gain = AudioSys.ctx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, AudioSys.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, AudioSys.ctx.currentTime + dur);
        
        osc.connect(gain);
        gain.connect(AudioSys.ctx.destination);
        osc.start();
        osc.stop(AudioSys.ctx.currentTime + dur);
    },
    
    correct: () => { 
        AudioSys.init(); 
        AudioSys.play(800, 'sine', 0.1); 
        setTimeout(() => AudioSys.play(1200, 'sine', 0.1), 80); 
    },
    
    wrong: () => { 
        AudioSys.init(); 
        AudioSys.play(200, 'sawtooth', 0.2); 
    },
    
    pop: () => { 
        AudioSys.init(); 
        AudioSys.play(400, 'triangle', 0.1); 
    },
    
    freeze: () => { 
        AudioSys.init(); 
        AudioSys.play(800, 'sine', 0.5); 
    }
};
