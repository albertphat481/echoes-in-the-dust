/**
 * VantaLumen Studio-Grade Procedural Web Audio Engine v2
 * - Warm Aerospace Master Bus (Compressor + Gentle High-Shelf Air + Stereo Reverb)
 * - Shared Pentatonic Scale (C4..A5) & 4.8s Lush Cosmic Convolver Reverb
 * - Organic multi-layered Foley & FM/Harmonic synthesis for all 6 NASA experiences
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
        this.ctx.resume().then(() => this._onContextRunning()).catch(() => {});
      } else {
        this._onContextRunning();
      }
      this.unlocked = true;
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx({ latencyHint: 'interactive' });

    // Master Bus -> Warm Compressor -> Destination
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -14;
    this.compressor.knee.value = 20;
    this.compressor.ratio.value = 3.5;
    this.compressor.attack.value = 0.006;
    this.compressor.release.value = 0.28;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.92;
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // Pre-generate 3s Pink Noise buffer for organic wind, sand, gravel, regolith & tape
    this.noiseBuffer = this._createPinkNoiseBuffer(3.0);

    // "Empty Space" Stereo Algorithmic Convolver Reverb (4.8s velvet tail)
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this._createCosmicImpulse(4.8, 2.4);

    const reverbFilter = this.ctx.createBiquadFilter();
    reverbFilter.type = 'lowpass';
    reverbFilter.frequency.value = 3800;

    this.reverbSend = this.ctx.createGain();
    this.reverbSend.gain.value = 0.52;
    this.reverbSend.connect(reverbFilter);
    reverbFilter.connect(this.reverbNode);
    this.reverbNode.connect(this.masterGain);

    this._initContinuousWind();
    this._initDeepSpaceDrone();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this._onContextRunning()).catch(() => {});
    } else {
      this._onContextRunning();
    }
    this.unlocked = true;
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this._onContextRunning()).catch(() => {});
    }
  }

  _onContextRunning() {
    if (!this.ctx || !this.ambientPadGain) return;
    const now = this.ctx.currentTime;
    if (this.ambientPadGain.gain.value < 0.02) {
      this.ambientPadGain.gain.cancelScheduledValues(now);
      this.ambientPadGain.gain.setValueAtTime(Math.max(0.0001, this.ambientPadGain.gain.value), now);
      this.ambientPadGain.gain.linearRampToValueAtTime(0.075, now + 1.8);
    }
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
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
        const fadeIn = Math.min(1, i / (rate * 0.032));
        data[i] = (Math.random() * 2 - 1) * fadeIn * Math.pow(1 - t, decay) * 0.5;
      }
    }
    return impulse;
  }

  _createPanner(pan = 0) {
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      return p;
    }
    const g = this.ctx.createGain();
    return g;
  }

  _initContinuousWind() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 340;
    this.windFilter.Q.value = 1.4;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.0001;

    src.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    this.windGain.connect(this.reverbSend);
    src.start(0);
  }

  _initDeepSpaceDrone() {
    // Warm breathing space pad (C2 + G2 + soft D3 shimmer)
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.value = 65.41; // C2
    osc2.type = 'triangle';
    osc2.frequency.value = 98.0;  // G2
    osc3.type = 'sine';
    osc3.frequency.value = 146.83; // D3

    const g3 = this.ctx.createGain();
    g3.gain.value = 0.25;

    filter.type = 'lowpass';
    filter.frequency.value = 170;

    lfo.type = 'sine';
    lfo.frequency.value = 0.09; // 11s slow cosmic breath
    lfoGain.gain.value = 55;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.ambientPadGain = this.ctx.createGain();
    this.ambientPadGain.gain.setValueAtTime(0.0001, now);
    this.ambientPadGain.gain.linearRampToValueAtTime(0.05, now + 2.8);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(g3);
    g3.connect(filter);
    filter.connect(this.ambientPadGain);
    this.ambientPadGain.connect(this.masterGain);
    this.ambientPadGain.connect(this.reverbSend);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    lfo.start(now);
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.92, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  // Delicate 2-voice crystalline UI chime
  playUIChime(pitchIdx = 5) {
    if (!this.ctx) return;
    this.playPentatonicNote(pitchIdx, 0.075, 0.65, 0, 'sine');
    this.playPentatonicNote(pitchIdx + 2, 0.04, 0.7, 0.045, 'sine');
  }

  // Liquid Glass panel open: airy upward silk sweep + rising crystalline shimmer
  playModalOpen() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // 1. Airy glass-glide whoosh
    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.6;
      bp.frequency.setValueAtTime(340, now);
      bp.frequency.exponentialRampToValueAtTime(1900, now + 0.16);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.085, now + 0.035);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      g.connect(this.reverbSend);
      src.start(now, Math.random() * 1.2, 0.24);
    }

    // 2. Rising crystalline harmonic shimmer
    this.playPentatonicNote(5, 0.065, 0.55, 0, 'sine');
    this.playPentatonicNote(7, 0.05, 0.65, 0.045, 'sine');
    this.playPentatonicNote(9, 0.03, 0.75, 0.09, 'triangle');
  }

  // Liquid Glass panel close: soft downward air sigh + gentle glass tuck
  playModalClose() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 1.2;
      lp.frequency.setValueAtTime(1500, now);
      lp.frequency.exponentialRampToValueAtTime(260, now + 0.15);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.07, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

      src.connect(lp);
      lp.connect(g);
      g.connect(this.masterGain);
      g.connect(this.reverbSend);
      src.start(now, Math.random() * 1.2, 0.19);
    }

    this.playPentatonicNote(6, 0.045, 0.34, 0, 'sine');
    this.playPentatonicNote(3, 0.035, 0.42, 0.04, 'sine');
  }

  // Subtle crystalline micro-tick for tab / slide switching
  playUITick() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.04);
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Warm 4-note cosmic bloom when unlocking a shard or answering correctly
  playSuccessBloom() {
    if (!this.ctx) return;
    [2, 4, 5, 7].forEach((idx, i) => {
      this.playPentatonicNote(idx, 0.11, 1.8, i * 0.085, 'triangle');
    });
  }

  // Modulate Martian wind & brush hiss by pointer velocity
  setBrushWind(intensity, speedNorm = 0.5) {
    if (!this.ctx || !this.windGain) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0.0001, Math.min(0.45, intensity * 0.36));
    const freq = 260 + speedNorm * 1100;
    this.windGain.gain.setTargetAtTime(clamped, now, 0.04);
    this.windFilter.frequency.setTargetAtTime(freq, now, 0.05);
  }

  // Game 1: Organic filtered sand-grain brush whisper (no harsh electronic beeps)
  playSandTick() {
    if (!this.ctx || Math.random() > 0.42) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 1800 + Math.random() * 1900;
    bpf.Q.value = 3.5;

    const panner = this._createPanner((Math.random() - 0.5) * 0.6);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    src.start(now, Math.random() * 2.0, 0.05);
  }

  // Game 1: Warm, deep planetary "Lub-Dub" seismic heartbeat
  playHeartbeat(warmth = 0.3) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = 42 + warmth * 14;
    const vol = 0.26 + warmth * 0.4;

    this._triggerHeartbeatPulse(now, baseFreq, 0.17, vol);
    this._triggerHeartbeatPulse(now + 0.19, baseFreq * 1.15, 0.15, vol * 0.75);
  }

  _triggerHeartbeatPulse(startTime, freq, dur, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.45, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.62, startTime + dur);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.03);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 105;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.001, startTime);
    nGain.gain.linearRampToValueAtTime(volume * 0.45, startTime + 0.012);
    nGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.095);

    noise.connect(lpf);
    lpf.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(startTime, Math.random(), 0.11);
  }

  // Signature 3-Note Ascending Warm Celesta/Rhodes Motif (Shared Anchor across all 6 games)
  playSignatureMotif(baseIndex = 2) {
    if (!this.ctx) return;
    const indices = [baseIndex, baseIndex + 2, baseIndex + 4];
    indices.forEach((idx, step) => {
      this.playPentatonicNote(idx % this.pentatonic.length, 0.18, 2.3, step * 0.22, 'triangle');
    });
  }

  // Warm Electric-Piano / Celesta Pentatonic Note with Detuned Shimmer & Reverb
  playPentatonicNote(index, volume = 0.2, duration = 1.6, delaySec = 0, type = 'sine') {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delaySec;
    const safeIdx = ((index % this.pentatonic.length) + this.pentatonic.length) % this.pentatonic.length;
    const freq = this.pentatonic[safeIdx];

    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();

    oscA.type = type;
    oscA.frequency.setValueAtTime(freq, now);
    oscB.type = 'sine';
    oscB.frequency.setValueAtTime(freq * 1.003, now); // Subtle warm chorus

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.0, now);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq * 0.5, now);

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(3400, now);
    lpf.frequency.exponentialRampToValueAtTime(900, now + duration * 0.8);

    const overGain = this.ctx.createGain();
    overGain.gain.setValueAtTime(0.22, now);
    overGain.gain.exponentialRampToValueAtTime(0.015, now + duration * 0.45);

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.22;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(volume, now + 0.016);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const panner = this._createPanner(((safeIdx - 4.5) / 5) * 0.35);

    oscA.connect(lpf);
    oscB.connect(lpf);
    overtone.connect(overGain);
    overGain.connect(lpf);
    sub.connect(subGain);
    subGain.connect(lpf);

    lpf.connect(env);
    env.connect(panner);
    panner.connect(this.masterGain);
    panner.connect(this.reverbSend);

    oscA.start(now);
    oscB.start(now);
    overtone.start(now);
    sub.start(now);
    oscA.stop(now + duration + 0.06);
    oscB.stop(now + duration + 0.06);
    overtone.stop(now + duration + 0.06);
    sub.stop(now + duration + 0.06);
  }

  // Game 2: Deep Optical Capacitor Pulse + Airy Photonic Shimmer (non-piercing)
  playLaserLaunch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Warm sub-capacitor thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.38);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverbSend);
    osc.start(now);
    osc.stop(now + 0.45);

    // Soft airy photonic whoosh
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(900, now);
    bpf.frequency.exponentialRampToValueAtTime(3600, now + 0.16);
    bpf.Q.value = 3.0;

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.001, now);
    nGain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    src.connect(bpf);
    bpf.connect(nGain);
    nGain.connect(this.reverbSend);
    src.start(now, Math.random(), 0.25);
  }

  // Game 2: Lush Quartz Crystal Retroreflector Echo (Warm 2-note chime + bell partials)
  playGlassEcho(targetIndex = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const idx = 5 + (targetIndex % 4);
    const baseFreq = this.pentatonic[idx];

    const partials = [
      { ratio: 1.0, amp: 0.22, dur: 3.8 },
      { ratio: 2.0, amp: 0.10, dur: 2.6 },
      { ratio: 3.0, amp: 0.045, dur: 1.7 }
    ];

    partials.forEach((p, i) => {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      const panner = this._createPanner((i - 1) * 0.25);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(p.amp, now + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

      osc.connect(env);
      env.connect(panner);
      panner.connect(this.masterGain);
      panner.connect(this.reverbSend);
      osc.start(now);
      osc.stop(now + p.dur + 0.05);
    });

    // Subtle fifth harmony echo 140ms later
    this.playPentatonicNote((idx + 2) % this.pentatonic.length, 0.09, 2.2, 0.14, 'sine');
  }

  // Game 3: Dual-band Martian Regolith & Wheel-Grip Crunch
  playGravelCrunch() {
    if (!this.ctx || Math.random() > 0.34) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 420 + Math.random() * 620;
    bpf.Q.value = 1.8;

    const panner = this._createPanner((Math.random() - 0.5) * 0.4);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    src.start(now, Math.random() * 1.5, 0.09);
  }

  // Game 4: Warm Analog Telemetry Uplink Whoosh + Soft Lock Tone
  playTapeWhoosh() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.22);
    filter.frequency.exponentialRampToValueAtTime(420, now + 0.58);
    filter.Q.value = 2.6;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.20, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverbSend);
    src.start(now, 0, 0.65);

    // Subtle telemetry lock chime
    this.playPentatonicNote(6, 0.07, 0.9, 0.18, 'sine');
  }

  // Game 5: Rich Lunar Singing Bowl (beating bronze/crystal partials) vs Damped Earth Thud
  playSingingBowl(noteIndex, isEarth = false) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freq = this.pentatonic[noteIndex % this.pentatonic.length];

    if (isEarth) {
      this._triggerHeartbeatPulse(now, 88, 0.18, 0.36);
      return;
    }

    const duration = 7.5;
    const detunes = [0, 0.9, -0.7, 1.8];
    detunes.forEach((dtHz, i) => {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      const panner = this._createPanner((i - 1.5) * 0.22);
      osc.type = 'sine';
      const mult = i === 3 ? 2.0 : 1.0;
      osc.frequency.setValueAtTime(freq * mult + dtHz, now);

      const amp = i === 0 ? 0.15 : i === 3 ? 0.045 : 0.085;
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(amp, now + 0.045);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(env);
      env.connect(panner);
      panner.connect(this.masterGain);
      panner.connect(this.reverbSend);
      osc.start(now);
      osc.stop(now + duration + 0.06);
    });
  }

  // Game 6: Inside-Helmet Pressurized Boot Step (Dry, zero reverb, tactile regolith crunch)
  playHelmetStep() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._triggerHeartbeatPulse(now, 68, 0.16, 0.42);

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(520, now);
    lpf.frequency.exponentialRampToValueAtTime(140, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

    src.connect(lpf);
    lpf.connect(gain);
    gain.connect(this.masterGain);
    src.start(now, Math.random(), 0.18);
  }
}

window.soundEngine = new SoundEngine();
