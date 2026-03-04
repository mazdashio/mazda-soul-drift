/**
 * MAZDA SOUL DRIFT - Audio System
 * All sounds generated procedurally via Web Audio API
 */

var AudioManager = (function() {
  
  var audioCtx = null;
  var masterGain = null;
  var engineOsc = null;
  var engineGain = null;
  var isInitialized = false;
  
  function init() {
    // AudioContext must be created after user gesture
    if (isInitialized) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.3;
      masterGain.connect(audioCtx.destination);
      isInitialized = true;
    } catch(e) {
      console.warn('Web Audio API not available');
    }
  }
  
  function ensureContext() {
    if (!isInitialized) init();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }
  
  // Engine sound: sawtooth oscillator with frequency tied to speed
  function startEngine() {
    ensureContext();
    if (!audioCtx) return;
    
    if (engineOsc) return;
    
    engineOsc = audioCtx.createOscillator();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.value = 55;
    
    engineGain = audioCtx.createGain();
    engineGain.gain.value = 0.08;
    
    // Low-pass filter for less harsh sound
    var filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    engineOsc.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(masterGain);
    engineOsc.start();
  }
  
  function updateEngine(speedFactor) {
    if (!engineOsc) return;
    // Map speed (0.0 - 1.5) to frequency (55 - 330 Hz)
    var freq = 55 + speedFactor * 200;
    engineOsc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
  }
  
  function stopEngine() {
    if (engineOsc) {
      engineOsc.stop();
      engineOsc = null;
      engineGain = null;
    }
  }
  
  // Play a simple tone sequence
  function playTone(frequencies, durations, type) {
    ensureContext();
    if (!audioCtx) return;
    
    type = type || 'sine';
    var t = audioCtx.currentTime;
    
    for (var i = 0; i < frequencies.length; i++) {
      var osc = audioCtx.createOscillator();
      osc.type = type;
      osc.frequency.value = frequencies[i];
      
      var gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + durations[i]);
      
      t += durations[i] * 0.7; // slight overlap
    }
  }
  
  // Judgment sounds
  function playPerfect() {
    playTone([523.25, 659.25, 783.99], [0.15, 0.15, 0.3], 'sine');
  }
  
  function playGreat() {
    playTone([523.25, 659.25], [0.15, 0.25], 'sine');
  }
  
  function playGood() {
    playTone([523.25], [0.2], 'sine');
  }
  
  function playMiss() {
    playTone([329.63, 261.63], [0.2, 0.3], 'sawtooth');
  }
  
  function playLapBeep() {
    playTone([1000], [0.1], 'square');
  }
  
  function playFinalLap() {
    playTone([1000, 1000, 1000], [0.1, 0.1, 0.1], 'square');
  }
  
  function playFinish() {
    playTone([261.63, 329.63, 392.00, 523.25], [0.2, 0.2, 0.2, 0.5], 'sine');
  }
  
  function playCountdown() {
    playTone([440], [0.15], 'sine');
  }
  
  function playGo() {
    playTone([880], [0.3], 'sine');
  }
  
  // Tire squeal (white noise + bandpass)
  function playTireSqueal(duration) {
    ensureContext();
    if (!audioCtx) return;
    
    duration = duration || 0.5;
    var bufferSize = audioCtx.sampleRate * duration;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    
    var noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    var filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 2;
    
    var gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();
    noise.stop(audioCtx.currentTime + duration);
  }
  
  return {
    init: init,
    startEngine: startEngine,
    updateEngine: updateEngine,
    stopEngine: stopEngine,
    playPerfect: playPerfect,
    playGreat: playGreat,
    playGood: playGood,
    playMiss: playMiss,
    playLapBeep: playLapBeep,
    playFinalLap: playFinalLap,
    playFinish: playFinish,
    playCountdown: playCountdown,
    playGo: playGo,
    playTireSqueal: playTireSqueal
  };
})();
