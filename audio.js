/**
 * VantaLumen Studio-Grade Procedural Web Audio Engine v3
 * - Mastering Chain: Warm Tape Saturation -> Dual Shelf EQ -> Dynamics Compressor
 * - Spatial Bus: Stereo Ping-Pong Echo (310ms/465ms) + 4.8s Velvet Cosmic Convolver Reverb
 * - FM Glass/Celesta Acoustic Modeling + Normalized Multi-Band Organic Foley
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.reverbNode = null;
    this.reverbSend = null;
    this.delaySend = null;
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
    this.gritBuffer = null;
    this._lastGravelTime = 0;
    this._lastSandTime = 0;
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

    // 1. Master Mastering Chain: Soft Tape Saturator -> Warm EQ -> Compressor -> Destination
    const lowShelf = this.ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 95;
    lowShelf.gain.value = 2.4;

    const highShelf = this.ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 5600;
    highShelf.gain.value = 2.2;

    const tapeShaper = this.ctx.createWaveShaper();
    tapeShaper.curve = this._createWarmTapeCurve(1.4);
    tapeShaper.oversample = '2x';

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -13;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 3.2;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.24;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.94;

    this.masterGain.connect(lowShelf);
    lowShelf.connect(highShelf);
    highShelf.connect(tapeShaper);
    tapeShaper.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // 2. Normalized Pink Noise (audible!) + Crisp Granular Grit Buffer
    this.noiseBuffer = this._createPinkNoiseBuffer(3.0);
    this.gritBuffer = this._createGranularGritBuffer(2.0);

    // 3. "Empty Space" Stereo Algorithmic Convolver Reverb (4.8s velvet tail)
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this._createCosmicImpulse(4.8, 2.35);

    const reverbFilter = this.ctx.createBiquadFilter();
    reverbFilter.type = 'lowpass';
    reverbFilter.frequency.value = 4400;

    this.reverbSend = this.ctx.createGain();
    this.reverbSend.gain.value = 0.46;
    this.reverbSend.connect(reverbFilter);
    reverbFilter.connect(this.reverbNode);
    this.reverbNode.connect(this.masterGain);

    // 4. Stereo Ping-Pong Shimmer Delay (310ms L / 465ms R -> Reverb + Master)
    this.delaySend = this.ctx.createGain();
    this.delaySend.gain.value = 0.24;
    const delayL = this.ctx.createDelay(1.0);
    const delayR = this.ctx.createDelay(1.0);
    delayL.delayTime.value = 0.31;
    delayR.delayTime.value = 0.465;

    const fbFilter = this.ctx.createBiquadFilter();
    fbFilter.type = 'lowpass';
    fbFilter.frequency.value = 2100;

    const fbGain = this.ctx.createGain();
    fbGain.gain.value = 0.34;

    const panL = this._createPanner(-0.65);
    const panR = this._createPanner(0.65);

    this.delaySend.connect(delayL);
    delayL.connect(panL);
    delayL.connect(delayR);
    delayR.connect(panR);
    delayR.connect(fbFilter);
    fbFilter.connect(fbGain);
    fbGain.connect(delayL);

    panL.connect(this.masterGain);
    panR.connect(this.masterGain);
    panL.connect(this.reverbSend);
    panR.connect(this.reverbSend);

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
      this.ambientPadGain.gain.linearRampToValueAtTime(0.068, now + 1.8);
    }
  }

  _createWarmTapeCurve(drive = 1.4) {
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
    }
    return curve;
  }

  _createPinkNoiseBuffer(seconds) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(1, len, rate);
    const output = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let maxVal = 0.001;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const sample = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      output[i] = sample;
      if (Math.abs(sample) > maxVal) maxVal = Math.abs(sample);
    }
    const norm = 0.82 / maxVal;
    for (let i = 0; i < len; i++) output[i] *= norm;
    return buf;
  }

  _createGranularGritBuffer(seconds) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(1, len, rate);
    const output = buf.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < len; i++) {
      const grain = Math.random() > 0.82 ? (Math.random() * 2 - 1) : (Math.random() * 2 - 1) * 0.22;
      const hp = grain - prev * 0.65;
      prev = grain;
      output[i] = Math.max(-1, Math.min(1, hp * 0.75));
    }
    return buf;
  }

  _createCosmicImpulse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const fadeIn = Math.min(1, i / (rate * 0.028));
        const raw = (Math.random() * 2 - 1) * fadeIn * Math.pow(1 - t, decay);
        lp = lp * 0.55 + raw * 0.45;
        data[i] = lp * 0.6;
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
    return this.ctx.createGain();
  }

  _initContinuousWind() {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 340;
    this.windFilter.Q.value = 1.35;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.0001;

    src.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    this.windGain.connect(this.reverbSend);
    src.start(0);
  }

  _initDeepSpaceDrone() {
    // Lush Cosmic Ambient Pad (C2 + G2 + warm D3 + subtle F3 breath)
    const now = this.ctx.currentTime;
    const freqs = [
      { f: 65.41, type: 'sine', amp: 0.42 },
      { f: 98.00, type: 'triangle', amp: 0.24 },
      { f: 146.83, type: 'sine', amp: 0.16 },
      { f: 174.61, type: 'sine', amp: 0.08 }
    ];

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 210;
    filter.Q.value = 0.8;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 65;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.ambientPadGain = this.ctx.createGain();
    this.ambientPadGain.gain.setValueAtTime(0.0001, now);
    this.ambientPadGain.gain.linearRampToValueAtTime(0.068, now + 2.4);

    freqs.forEach(item => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = item.type;
      osc.frequency.value = item.f;
      g.gain.value = item.amp;
      osc.connect(g);
      g.connect(filter);
      osc.start(now);
    });

    filter.connect(this.ambientPadGain);
    this.ambientPadGain.connect(this.masterGain);
    this.ambientPadGain.connect(this.reverbSend);
    lfo.start(now);
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.94, this.ctx.currentTime, 0.04);
    }
    return this.muted;
  }

  /**
   * Studio FM Glass / Celesta Acoustic Voice
   * Produces rich bell/crystal partials instead of flat raw sine/triangle waves.
   */
  _playFMVoice(freq, {
    volume = 0.14,
    duration = 1.4,
    delaySec = 0,
    modRatio = 2.0,
    modDepth = 1.8,
    pan = 0,
    sendDelay = true,
    attack = 0.008
  } = {}) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime + delaySec;

    const carrier = this.ctx.createOscillator();
    const shimmer = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, now);

    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(freq * 1.0035, now);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(freq * modRatio, now);

    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(freq * modDepth, now);
    modGain.gain.exponentialRampToValueAtTime(Math.max(1, freq * 0.04), now + Math.min(0.45, duration * 0.35));

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    const shimmerGain = this.ctx.createGain();
    shimmerGain.gain.value = 0.38;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(Math.min(7200, freq * 7), now);
    lpf.frequency.exponentialRampToValueAtTime(Math.max(420, freq * 1.6), now + duration * 0.75);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(volume, now + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const panner = this._createPanner(pan);

    carrier.connect(lpf);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(lpf);
    lpf.connect(env);
    env.connect(panner);
    panner.connect(this.masterGain);
    panner.connect(this.reverbSend);
    if (sendDelay && this.delaySend) panner.connect(this.delaySend);

    carrier.start(now);
    shimmer.start(now);
    modulator.start(now);
    const stopAt = now + duration + 0.08;
    carrier.stop(stopAt);
    shimmer.stop(stopAt);
    modulator.stop(stopAt);
  }

  // Tactile Liquid Glass micro-droplet click (no 90s beep)
  playUITick() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // 1. Sub-14ms damped wood/glass droplet transient
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1650, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.016);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.075, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.032);

    // 2. Micro-crystalline air flick
    if (this.gritBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.gritBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3200;
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.045, now);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
      src.connect(hp);
      hp.connect(ng);
      ng.connect(this.masterGain);
      src.start(now, Math.random() * 1.2, 0.025);
    }
  }

  // Delicate 2-voice FM crystal UI chime
  playUIChime(pitchIdx = 5) {
    if (!this.ctx || this.muted) return;
    const f1 = this.pentatonic[pitchIdx % this.pentatonic.length];
    const f2 = this.pentatonic[(pitchIdx + 2) % this.pentatonic.length];
    this._playFMVoice(f1, { volume: 0.095, duration: 0.85, modRatio: 2.0, modDepth: 1.4, pan: -0.2 });
    this._playFMVoice(f2, { volume: 0.075, duration: 0.95, delaySec: 0.045, modRatio: 3.0, modDepth: 1.1, pan: 0.22 });
  }

  // Liquid Glass Modal Open: silky stereo air-cushion bloom + rising FM glass harmonic chord
  playModalOpen() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(280, now);
      bp.frequency.exponentialRampToValueAtTime(2200, now + 0.2);

      const pan = this._createPanner(-0.28);
      if (pan.pan) pan.pan.linearRampToValueAtTime(0.28, now + 0.22);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.09, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      src.connect(bp);
      bp.connect(g);
      g.connect(pan);
      pan.connect(this.masterGain);
      pan.connect(this.reverbSend);
      src.start(now, Math.random() * 1.5, 0.28);
    }

    // Lush rising FM glass chord (F4 -> C5 -> G5)
    this._playFMVoice(349.23, { volume: 0.075, duration: 0.75, delaySec: 0.00, modRatio: 2.0, modDepth: 1.1, pan: -0.35 });
    this._playFMVoice(523.25, { volume: 0.08,  duration: 0.9,  delaySec: 0.04, modRatio: 3.0, modDepth: 1.3, pan: 0.0 });
    this._playFMVoice(783.99, { volume: 0.055, duration: 1.1,  delaySec: 0.085, modRatio: 2.0, modDepth: 0.9, pan: 0.35 });
  }

  // Liquid Glass Modal Close: soft pneumatic seal + descending warm velvet glass tuck
  playModalClose() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 1.1;
      lp.frequency.setValueAtTime(1600, now);
      lp.frequency.exponentialRampToValueAtTime(220, now + 0.16);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.085, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      src.connect(lp);
      lp.connect(g);
      g.connect(this.masterGain);
      g.connect(this.reverbSend);
      src.start(now, Math.random() * 1.5, 0.2);
    }

    this._playFMVoice(587.33, { volume: 0.065, duration: 0.42, delaySec: 0.0,  modRatio: 2.0, modDepth: 0.7, pan: 0.2,  sendDelay: false });
    this._playFMVoice(392.00, { volume: 0.06,  duration: 0.55, delaySec: 0.04, modRatio: 2.0, modDepth: 0.5, pan: -0.2, sendDelay: false });
  }

  // Celestial Constellation Switch Swell
  playStageSwitch(stageIdx = 0) {
    if (!this.ctx || this.muted) return;
    const base = this.pentatonic[(stageIdx + 2) % 6];
    this._playFMVoice(base * 0.5, { volume: 0.09, duration: 1.4, modRatio: 1.0, modDepth: 0.4, attack: 0.04, pan: -0.25 });
    this._playFMVoice(base * 1.5, { volume: 0.065, duration: 1.6, delaySec: 0.06, modRatio: 2.0, modDepth: 1.0, pan: 0.25 });
  }

  // Warm 4-note cosmic bloom when unlocking a shard or answering correctly
  playSuccessBloom() {
    if (!this.ctx || this.muted) return;
    const notes = [349.23, 440.00, 523.25, 783.99];
    notes.forEach((f, i) => {
      this._playFMVoice(f, {
        volume: 0.11,
        duration: 2.1,
        delaySec: i * 0.08,
        modRatio: i % 2 === 0 ? 2.0 : 3.0,
        modDepth: 1.5,
        pan: (i - 1.5) * 0.28
      });
    });
  }

  // Modulate Martian wind & brush hiss by pointer velocity
  setBrushWind(intensity, speedNorm = 0.5) {
    if (!this.ctx || !this.windGain) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0.0001, Math.min(0.24, intensity * 0.18));
    const freq = 240 + speedNorm * 1350;
    this.windGain.gain.setTargetAtTime(clamped, now, 0.045);
    this.windFilter.frequency.setTargetAtTime(freq, now, 0.055);
  }

  // Game 1: Crisp organic multi-grain Martian saltation sand whisper
  playSandTick() {
    if (!this.ctx || this.muted || !this.gritBuffer) return;
    const now = this.ctx.currentTime;
    if (now - this._lastSandTime < 0.032) return;
    this._lastSandTime = now;

    const src = this.ctx.createBufferSource();
    src.buffer = this.gritBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 2100 + Math.random() * 2400;
    bpf.Q.value = 2.6;

    const panner = this._createPanner((Math.random() - 0.5) * 0.75);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065 + Math.random() * 0.035, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    panner.connect(this.reverbSend);
    src.start(now, Math.random() * 1.4, 0.055);
  }

  // Game 1: Deep Cinematic "Lub-Dub" Planetary Seismic Heartbeat
  playHeartbeat(warmth = 0.3) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const baseFreq = 44 + warmth * 14;
    const vol = 0.28 + warmth * 0.38;

    this._triggerHeartbeatPulse(now, baseFreq, 0.19, vol);
    this._triggerHeartbeatPulse(now + 0.21, baseFreq * 1.16, 0.16, vol * 0.72);
  }

  _triggerHeartbeatPulse(startTime, freq, dur, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.85, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq * 0.58), startTime + dur);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.016);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverbSend);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.04);

    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const lpf = this.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 135;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.001, startTime);
      nGain.gain.linearRampToValueAtTime(volume * 0.28, startTime + 0.012);
      nGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);

      noise.connect(lpf);
      lpf.connect(nGain);
      nGain.connect(this.masterGain);
      noise.start(startTime, Math.random(), 0.12);
    }
  }

  // Signature 3-Note Ascending Warm Celesta/Rhodes Motif (Shared Anchor across all 6 games)
  playSignatureMotif(baseIndex = 2) {
    if (!this.ctx || this.muted) return;
    const indices = [baseIndex, baseIndex + 2, baseIndex + 4];
    indices.forEach((idx, step) => {
      const f = this.pentatonic[idx % this.pentatonic.length];
      this._playFMVoice(f, {
        volume: 0.15,
        duration: 2.5,
        delaySec: step * 0.22,
        modRatio: 2.0,
        modDepth: 1.4,
        pan: (step - 1) * 0.25
      });
    });
  }

  // Acoustic FM Celesta/Electric-Piano Pentatonic Note
  playPentatonicNote(index, volume = 0.18, duration = 1.6, delaySec = 0, type = 'sine') {
    if (!this.ctx || this.muted) return;
    const safeIdx = ((index % this.pentatonic.length) + this.pentatonic.length) % this.pentatonic.length;
    const freq = this.pentatonic[safeIdx];
    const modRatio = type === 'triangle' ? 3.0 : 2.0;
    const modDepth = type === 'triangle' ? 1.6 : 1.05;
    this._playFMVoice(freq, {
      volume: Math.min(0.24, volume * 0.82),
      duration,
      delaySec,
      modRatio,
      modDepth,
      pan: ((safeIdx - 4.5) / 5) * 0.4
    });
  }

  // Game 2: Observatory Shutter Clack + Sub-Capacitor Discharge + Photonic Beam Shimmer
  playLaserLaunch() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // 1. Sub-capacitor discharge thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.42);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverbSend);
    osc.start(now);
    osc.stop(now + 0.48);

    // 2. Crisp mechanical aperture click
    if (this.gritBuffer) {
      const click = this.ctx.createBufferSource();
      click.buffer = this.gritBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1900;
      bp.Q.value = 2.2;
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(0.16, now);
      cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      click.connect(bp);
      bp.connect(cg);
      cg.connect(this.masterGain);
      click.start(now, Math.random(), 0.04);
    }

    // 3. Upward photonic beam sweep
    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bpf = this.ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.setValueAtTime(750, now);
      bpf.frequency.exponentialRampToValueAtTime(4800, now + 0.2);
      bpf.Q.value = 3.2;

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.001, now);
      nGain.gain.linearRampToValueAtTime(0.16, now + 0.025);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

      src.connect(bpf);
      bpf.connect(nGain);
      nGain.connect(this.masterGain);
      nGain.connect(this.reverbSend);
      src.start(now, Math.random(), 0.28);
    }

    this._playFMVoice(880, { volume: 0.055, duration: 0.45, modRatio: 2.5, modDepth: 1.9, pan: 0 });
  }

  // Game 2: Haunting Lunar Quartz Retroreflector Bell + Stereo Fifth Ping-Pong Echo
  playGlassEcho(targetIndex = 0) {
    if (!this.ctx || this.muted) return;
    const idx = 5 + (targetIndex % 4);
    const baseFreq = this.pentatonic[idx];

    this._playFMVoice(baseFreq, { volume: 0.16, duration: 3.4, modRatio: 2.756, modDepth: 2.2, pan: -0.25 });
    this._playFMVoice(baseFreq * 1.5, { volume: 0.09, duration: 2.8, delaySec: 0.12, modRatio: 2.0, modDepth: 1.3, pan: 0.35 });
    this._playFMVoice(baseFreq * 2.0, { volume: 0.045, duration: 2.2, delaySec: 0.24, modRatio: 3.0, modDepth: 0.8, pan: -0.15 });
  }

  // Game 3: Tactile Dual-Layer Martian Regolith Crunch + Subtle Rover Wheel Grit
  playGravelCrunch() {
    if (!this.ctx || this.muted || !this.gritBuffer) return;
    const now = this.ctx.currentTime;
    if (now - this._lastGravelTime < 0.065) return;
    this._lastGravelTime = now;

    // Layer 1: Low basalt crunch body
    const body = this.ctx.createBufferSource();
    body.buffer = this.noiseBuffer;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'bandpass';
    lp.frequency.value = 260 + Math.random() * 240;
    lp.Q.value = 1.4;
    const bg = this.ctx.createGain();
    bg.gain.setValueAtTime(0.001, now);
    bg.gain.linearRampToValueAtTime(0.11, now + 0.01);
    bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    body.connect(lp);
    lp.connect(bg);
    bg.connect(this.masterGain);
    body.start(now, Math.random() * 1.4, 0.11);

    // Layer 2: Crisp high-frequency silica pebbles
    const grit = this.ctx.createBufferSource();
    grit.buffer = this.gritBuffer;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.value = 1400 + Math.random() * 1600;
    hp.Q.value = 2.1;
    const pan = this._createPanner((Math.random() - 0.5) * 0.45);
    const gg = this.ctx.createGain();
    gg.gain.setValueAtTime(0.001, now);
    gg.gain.linearRampToValueAtTime(0.075, now + 0.006);
    gg.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    grit.connect(hp);
    hp.connect(gg);
    gg.connect(pan);
    pan.connect(this.masterGain);
    grit.start(now, Math.random(), 0.08);
  }

  // Game 4: Authentic UHF Telemetry Lock + Airy Uplink Sweep
  playTapeWhoosh() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    if (this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(2100, now + 0.22);
      filter.frequency.exponentialRampToValueAtTime(480, now + 0.58);
      filter.Q.value = 2.4;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.reverbSend);
      src.start(now, Math.random(), 0.65);
    }

    // Dual-tone NASA Quindar/Telemetry confirmation harmonic
    this._playFMVoice(587.33, { volume: 0.085, duration: 0.9, delaySec: 0.14, modRatio: 2.0, modDepth: 0.8, pan: -0.2 });
    this._playFMVoice(880.00, { volume: 0.075, duration: 1.1, delaySec: 0.22, modRatio: 2.0, modDepth: 0.7, pan: 0.2 });
  }

  // Game 5: Rich Lunar Singing Bowl vs Dense Earth Mud-Thud
  playSingingBowl(noteIndex, isEarth = false) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const freq = this.pentatonic[noteIndex % this.pentatonic.length];

    if (isEarth) {
      this._triggerHeartbeatPulse(now, 84, 0.18, 0.36);
      return;
    }

    const duration = 7.5;
    const partials = [
      { mult: 1.0, detune: 0,    amp: 0.14 },
      { mult: 1.0, detune: 1.1,  amp: 0.085 },
      { mult: 1.0, detune: -0.8, amp: 0.08 },
      { mult: 2.0, detune: 1.9,  amp: 0.048 },
      { mult: 2.98, detune: -1.4, amp: 0.025 }
    ];
    partials.forEach((p, i) => {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      const panner = this._createPanner((i - 2) * 0.22);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p.mult + p.detune, now);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(p.amp, now + 0.055);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(env);
      env.connect(panner);
      panner.connect(this.masterGain);
      panner.connect(this.reverbSend);
      osc.start(now);
      osc.stop(now + duration + 0.06);
    });
  }

  // Game 6: Dry Intimate Pressurized Boot Regolith Compression (Zero Reverb)
  playHelmetStep() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // 1. Inside-suit sub-bass boot impact (dry, zero reverb)
    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(98, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.15);
    og.gain.setValueAtTime(0.001, now);
    og.gain.linearRampToValueAtTime(0.38, now + 0.012);
    og.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
    osc.connect(og);
    og.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.19);

    // 2. Lunar regolith electrostatic dust crush
    const buf = this.gritBuffer || this.noiseBuffer;
    if (buf) {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const lpf = this.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(760, now);
      lpf.frequency.exponentialRampToValueAtTime(160, now + 0.16);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      src.connect(lpf);
      lpf.connect(gain);
      gain.connect(this.masterGain);
      src.start(now, Math.random(), 0.2);
    }
  }
}

window.soundEngine = new SoundEngine();
