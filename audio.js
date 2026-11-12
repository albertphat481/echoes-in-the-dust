/**
 * Shared Procedural Web Audio Engine
 * - Single shared pentatonic scale: C4, D4, F4, G4, A4, C5, D5, F5, G5, A5
 * - Shared "Empty Space" algorithmic impulse response reverb bus
 * - Signature 3-note ascending motif on completion/discovery
 * - Procedural synthesis for heartbeat, wind/dust brush, sonar ping, crystal echo,
 *   music-box rover notes, polaroid tape whoosh, FM singing bowl, and helmet thump.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.reverbSend = null;
    this.muted = false;
    this.unlocked = false;

    // Shared Pentatonic Frequencies (F Major / D Minor Pentatonic in warm register)
    this.pentatonic = [
      261.63, // C4
      293.66, // D4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      698.46, // F5
      783.99, // G5
      880.00  // A5
    ];

    // Continuous brush noise nodes
    this.windGain = null;
    this.windFilter = null;
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
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.85;
    this.masterGain.connect(this.ctx.destination);

    // Create "Empty Space" algorithmic Convolver Reverb (4.2 seconds lush cosmic tail)
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this._createCosmicImpulse(4.2, 2.4);

    this.reverbSend = this.ctx.createGain();
    this.reverbSend.gain.value = 0.55;
    this.reverbSend.connect(this.reverbNode);
    this.reverbNode.connect(this.masterGain);

    this._initContinuousWind();
    this.unlocked = true;
  }

  _createCosmicImpulse(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * 0.5;
      }
    }
    return impulse;
  }

  _initContinuousWind() {
    const rate = this.ctx.sampleRate;
    const bufferSize = rate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, rate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 400;
    this.windFilter.Q.value = 1.4;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.0001;

    whiteNoise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    this.windGain.connect(this.reverbSend);
    whiteNoise.start(0);
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  // Modulate wind/brush intensity by pointer velocity (0..1)
  setBrushWind(intensity, speedNorm = 0.5) {
    if (!this.ctx || !this.windGain) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0.0001, Math.min(0.45, intensity * 0.35));
    const freq = 260 + speedNorm * 950;
    this.windGain.gain.setTargetAtTime(clamped, now, 0.04);
    this.windFilter.frequency.setTargetAtTime(freq, now, 0.05);
  }

  // Game 1: Planetary Heartbeat ("lub-dub" sub-bass pulse)
  playHeartbeat(warmth = 0.3) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = 46 + warmth * 14; // 46Hz cold -> 60Hz warm
    const vol = 0.25 + warmth * 0.45;

    // First pulse ("Lub")
    this._triggerPulse(now, baseFreq, baseFreq * 0.65, 0.14, vol);
    // Second pulse ("Dub")
    this._triggerPulse(now + 0.17, baseFreq * 1.12, baseFreq * 0.7, 0.12, vol * 0.78);
  }

  _triggerPulse(startTime, startFreq, endFreq, duration, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  // Signature 3-Note Ascending Motif (Shared Emotional Anchor across all 6 games)
  playSignatureMotif(baseIndex = 2) {
    if (!this.ctx) return;
    const indices = [baseIndex, baseIndex + 2, baseIndex + 4];
    indices.forEach((idx, step) => {
      const freq = this.pentatonic[idx % this.pentatonic.length];
      this.playPentatonicNote(idx % this.pentatonic.length, 0.22, 1.8, step * 0.24, 'triangle');
    });
  }

  // Play a warm pentatonic note with cosmic reverb
  playPentatonicNote(index, volume = 0.2, duration = 1.4, delaySec = 0, type = 'sine') {
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delaySec;
    const freq = this.pentatonic[((index % this.pentatonic.length) + this.pentatonic.length) % this.pentatonic.length];

    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq * 0.5, now);

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.25;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    sub.connect(subGain);
    subGain.connect(gain);

    gain.connect(this.masterGain);
    gain.connect(this.reverbSend);

    osc.start(now);
    sub.start(now);
    osc.stop(now + duration + 0.05);
    sub.stop(now + duration + 0.05);
  }

  // Game 2: Deep Laser Pulse Launch ("thump" into the sky)
  playLaserLaunch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.reverbSend);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Game 2: Glass Bell Lunar Echo (2.5s after launch)
  playGlassEcho(targetIndex = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = this.pentatonic[5 + (targetIndex % 4)];

    // Carrier + FM modulator for crystalline glass bell
    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(baseFreq, now);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(baseFreq * 2.756, now); // Inharmonic glass partial
    modGain.gain.setValueAtTime(baseFreq * 0.8, now);
    modGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.28, now + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(env);
    env.connect(this.masterGain);
    env.connect(this.reverbSend);

    carrier.start(now);
    mod.start(now);
    carrier.stop(now + 3.3);
    mod.stop(now + 3.3);
  }

  // Game 5: Moon Singing Bowl (Long ring-down vs short Earth thud)
  playSingingBowl(noteIndex, isEarth = false) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freq = this.pentatonic[noteIndex % this.pentatonic.length];

    if (isEarth) {
      // Short dry damped thud on Earth
      this._triggerPulse(now, 140, 48, 0.22, 0.38);
      return;
    }

    // Lunar Singing Bowl: 2 slightly detuned oscillators for gentle beating + FM shimmer
    const duration = 7.5;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc2.type = 'sine';
    harmonic.type = 'sine';

    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq + 1.4, now); // 1.4 Hz warm beating
    harmonic.frequency.setValueAtTime(freq * 2.0, now);

    const env = this.ctx.createGain();
    const harmGain = this.ctx.createGain();
    harmGain.gain.value = 0.18;

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.2, now + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(env);
    osc2.connect(env);
    harmonic.connect(harmGain);
    harmGain.connect(env);

    env.connect(this.masterGain);
    env.connect(this.reverbSend);

    osc1.start(now);
    osc2.start(now);
    harmonic.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
    harmonic.stop(now + duration + 0.1);
  }

  // Game 6: Muffled Helmet Boot Step (Dry, intimate inside-suit thump)
  playHelmetStep() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Low muffled thump (no reverb!)
    this._triggerPulse(now, 92, 34, 0.19, 0.48);

    // Subtle crunch of lunar regolith filtered at 320Hz
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * 0.14);
    const buf = this.ctx.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.35));
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 340;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.25;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }
}

window.soundEngine = new SoundEngine();
