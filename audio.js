/**
 * VantaLumen Studio-Grade Procedural Web Audio Engine
 * - Master DynamicsCompressor + Warm Aerospace EQ bus
 * - Shared Pentatonic Scale (C4..A5) & Lush 4.6s Cosmic Convolver Reverb
 * - Persistent Deep-Space Ambient Pad (breathing sub-harmonics)
 * - Realistic multi-layered Foley synthesis for all 6 NASA hardware experiences
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.reverbNode = null;
    this.reverbSend = null;
    this.muted = false;
    this.unlocked = false;

    // Shared Pentatonic Frequencies (C4, D4, F4, G4, A4, C5, D5, F5, G5, A5)
    this.pentatonic = [
      261.63, 293.66, 349.23, 392.00, 440.00,
      523.25, 587.33, 698.46, 783.99, 880.00
    ];

    this.windGain = null;
    this.windFilter = null;
    this.ambientPadGain = null;
    this.noiseBuffer = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.unlocked = true;
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx({ latencyHint: 'interactive' });

    // Master Bus -> Compressor -> Destination (Prevents clipping on lush chords)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.25;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.9;
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // Pre-generate 3s Pink Noise buffer for wind, gravel crunch, sand ticks, tape hiss
    this.noiseBuffer = this._createPinkNoiseBuffer(3.0);

    // "Empty Space" Stereo Algorithmic Convolver Reverb (4.6s tail)
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this._createCosmicImpulse(4.6, 2.3);

    const reverbFilter = this.ctx.createBiquadFilter();
    reverbFilter.type = 'lowpass';
    reverbFilter.frequency.value = 4200; // Warm cosmic damping

    this.reverbSend = this.ctx.createGain();
    this.reverbSend.gain.value = 0.58;
    this.reverbSend.connect(reverbFilter);
    reverbFilter.connect(this.reverbNode);
    this.reverbNode.connect(this.masterGain);

    this._initContinuousWind();
    this._initDeepSpaceDrone();
    this.unlocked = true;
  }

  _createPinkNoiseBuffer(seconds) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(1, len, rate);
    const output = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buf;
  }

  _createCosmicImpulse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // Soft pre-delay fade in (first 25ms) + exponential cosmic tail
        const fadeIn = Math.min(1, i / (rate * 0.025));
        data[i] = (Math.random() * 2 - 1) * fadeIn * Math.pow(1 - t, decay) * 0.55;
      }
    }
    return impulse;
  }

  _initContinuousWind() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 380;
    this.windFilter.Q.value = 1.6;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.0001;

    src.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    this.windGain.connect(this.reverbSend);
    src.start(0);
  }

  _initDeepSpaceDrone() {
    // Ultra-subtle breathing space drone (C2 = 65.4Hz & G2 = 98Hz)
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.value = 65.41;
    osc2.type = 'triangle';
    osc2.frequency.value = 98.0;

    filter.type = 'lowpass';
    filter.frequency.value = 180;

    lfo.type = 'sine';
    lfo.frequency.value = 0.11; // Slow 9-second cosmic breath
    lfoGain.gain.value = 60;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.ambientPadGain = this.ctx.createGain();
    this.ambientPadGain.gain.setValueAtTime(0.0001, now);
    this.ambientPadGain.gain.linearRampToValueAtTime(0.055, now + 2.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambientPadGain);
    this.ambientPadGain.connect(this.masterGain);
    this.ambientPadGain.connect(this.reverbSend);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  // Subtle glassy UI micro-chime
  playUIChime(pitchIdx = 5) {
    if (!this.ctx) return;
    this.playPentatonicNote(pitchIdx, 0.08, 0.55, 0, 'sine');
  }

  // Modulate Martian wind & dust hiss by pointer velocity
  setBrushWind(intensity, speedNorm = 0.5) {
    if (!this.ctx || !this.windGain) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0.0001, Math.min(0.65, intensity * 0.5));
    const freq = 240 + speedNorm * 1250;
    this.windGain.gain.setTargetAtTime(clamped, now, 0.035);
    this.windFilter.frequency.setTargetAtTime(freq, now, 0.045);
  }

  // Game 1: Crystalline sand grain ticks scraping across glass solar array
  playSandTick() {
    if (!this.ctx || Math.random() > 0.35) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800 + Math.random() * 1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.025);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  // Game 1: Multi-layered Planetary Heartbeat ("Lub-Dub" sub-bass + muffled seismic membrane)
  playHeartbeat(warmth = 0.3) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = 44 + warmth * 15;
    const vol = 0.28 + warmth * 0.45;

    this._triggerHeartbeatPulse(now, baseFreq, 0.16, vol);
    this._triggerHeartbeatPulse(now + 0.18, baseFreq * 1.14, 0.14, vol * 0.78);
  }

  _triggerHeartbeatPulse(startTime, freq, dur, volume) {
    // Sub-bass sine
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.4, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, startTime + dur);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.03);

    // Filtered low-end thump layer
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 110;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.001, startTime);
    nGain.gain.linearRampToValueAtTime(volume * 0.55, startTime + 0.01);
    nGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09);

    noise.connect(lpf);
    lpf.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(startTime);
    noise.stop(startTime + 0.1);
  }

  // Signature 3-Note Ascending Warm Piano/Celesta Motif (Shared Anchor across all 6 games)
  playSignatureMotif(baseIndex = 2) {
    if (!this.ctx) return;
    const indices = [baseIndex, baseIndex + 2, baseIndex + 4];
    indices.forEach((idx, step) => {
      this.playPentatonicNote(idx % this.pentatonic.length, 0.2, 2.2, step * 0.24, 'triangle');
    });
  }

  // Warm Electric-Piano / Music-Box Pentatonic Note with Overtones & Reverb
  playPentatonicNote(index, volume = 0.2, duration = 1.6, delaySec = 0, type = 'sine') {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delaySec;
    const safeIdx = ((index % this.pentatonic.length) + this.pentatonic.length) % this.pentatonic.length;
    const freq = this.pentatonic[safeIdx];

    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Subtle bell/celesta 2nd harmonic shimmer
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.0, now);

    // Warm sub-octave body
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq * 0.5, now);

    const overGain = this.ctx.createGain();
    overGain.gain.setValueAtTime(0.28, now);
    overGain.gain.exponentialRampToValueAtTime(0.02, now + duration * 0.5);

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.25;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(volume, now + 0.018);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(env);
    overtone.connect(overGain);
    overGain.connect(env);
    sub.connect(subGain);
    subGain.connect(env);

    env.connect(this.masterGain);
    env.connect(this.reverbSend);

    osc.start(now);
    overtone.start(now);
    sub.start(now);
    osc.stop(now + duration + 0.05);
    overtone.stop(now + duration + 0.05);
    sub.stop(now + duration + 0.05);
  }

  // Game 2: Deep Laser Pulse Capacitor Launch + Atmospheric High-Frequency Zipp
  playLaserLaunch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Deep sub-thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.42);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverbSend);
    osc.start(now);
    osc.stop(now + 0.48);

    // High photonic zipp upward
    const zip = this.ctx.createOscillator();
    const zipGain = this.ctx.createGain();
    zip.type = 'sine';
    zip.frequency.setValueAtTime(880, now);
    zip.frequency.exponentialRampToValueAtTime(3200, now + 0.14);
    zipGain.gain.setValueAtTime(0.06, now);
    zipGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    zip.connect(zipGain);
    zipGain.connect(this.reverbSend);
    zip.start(now);
    zip.stop(now + 0.18);
  }

  // Game 2: Crystalline Quartz Glass Bell Echo (Multi-partial FM resonance)
  playGlassEcho(targetIndex = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = this.pentatonic[5 + (targetIndex % 4)];

    const partials = [
      { ratio: 1.0, amp: 0.25, dur: 3.6 },
      { ratio: 2.756, amp: 0.1, dur: 2.1 },
      { ratio: 5.404, amp: 0.04, dur: 1.2 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(p.amp, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

      osc.connect(env);
      env.connect(this.masterGain);
      env.connect(this.reverbSend);
      osc.start(now);
      osc.stop(now + p.dur + 0.05);
    });
  }

  // Game 3: Granular Martian Gravel Crunch under Spirit's dragging wheel
  playGravelCrunch() {
    if (!this.ctx || Math.random() > 0.28) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 650 + Math.random() * 550;
    bpf.Q.value = 2.4;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.masterGain);
    src.start(now, Math.random() * 1.5, 0.07);
  }

  // Game 4: Analog Magnetic Tape Whoosh when uploading Polaroid
  playTapeWhoosh() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1900, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(480, now + 0.65);
    filter.Q.value = 3.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.reverbSend);
    src.start(now, 0, 0.7);
  }

  // Game 5: Tibetan Singing Bowl (4-partial lunar ring-down) vs Dry Earth Thud
  playSingingBowl(noteIndex, isEarth = false) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freq = this.pentatonic[noteIndex % this.pentatonic.length];

    if (isEarth) {
      // Damped wet-mantle thud on Earth (very short)
      this._triggerHeartbeatPulse(now, 95, 0.2, 0.42);
      return;
    }

    const duration = 8.5;
    const detunes = [0, 1.1, -0.8, 2.3];
    detunes.forEach((dtHz, i) => {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'sine';
      const mult = i === 3 ? 2.0 : 1.0;
      osc.frequency.setValueAtTime(freq * mult + dtHz, now);

      const amp = i === 0 ? 0.16 : i === 3 ? 0.05 : 0.09;
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(amp, now + 0.035);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(env);
      env.connect(this.masterGain);
      env.connect(this.reverbSend);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }

  // Game 6: Inside-Helmet Pressurized Boot Step (Dry, zero reverb, tactile regolith crunch)
  playHelmetStep() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._triggerHeartbeatPulse(now, 74, 0.18, 0.48);

    // Dry regolith boot compression sound (strictly NO reverb to simulate vacuum + spacesuit)
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(480, now);
    lpf.frequency.exponentialRampToValueAtTime(160, now + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    src.connect(lpf);
    lpf.connect(gain);
    gain.connect(this.masterGain);
    src.start(now, Math.random(), 0.17);
  }
}

window.soundEngine = new SoundEngine();
