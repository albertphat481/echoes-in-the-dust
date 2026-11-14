/**
 * Minigame 7: RISE IN ZERO-G (NASA Artemis II Zero-Gravity Indicator)
 */

// =========================================================================
// MINIGAME 7: RISE IN ZERO-G (VantaLumen Zero-G Plushie Indicator)
// =========================================================================
class RiseZeroGGame {
  constructor(host) {
    this.host = host;
    this.elapsed = 0;
    this.maxDuration = 22.0;
    this.completed = false;
    this.ending = false;
    this.finaleTimer = 0;
    this.ghostAlpha = 0.85;

    this.targetChimes = 7;
    this.chimesCollected = 0;
    this.petCount = 0;
    this.joyPulse = 0;
    this.isDragging = false;

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.plush = {
      x: w * 0.5,
      y: h * 0.48,
      vx: 26,
      vy: -18,
      angle: 0,
      vAngle: 0.18,
      r: Math.min(w, h) * 0.145
    };
    this.pointer = { x: w * 0.5, y: h * 0.48, active: false };

    // Dual-deck seamless crossfade video engine (assets/rise_plushie.mp4)
    // Uses two synchronized <video> decks so when Deck A nears its end, Deck B starts at 0.0s
    // and smoothly crossfades over 1.35 seconds — completely hiding the loop seam!
    this.crossfadeWindow = 1.35;
    this.videoA = this._createVideoDeck(false);
    this.videoB = this._createVideoDeck(true);
    this.primaryVideo = this.videoA;
    this.secondaryVideo = this.videoB;
    this.crossfading = false;
    this.crossfadeAlpha = 0;
    this._startVideoPlayback(false);

    // 7 Orbital Music-Box Star Notes floating inside the Cupola
    this.starNotes = [];
    this._initStarNotes(w, h);

    this.sparkles = [];
    this.ripples = [];
  }

  _createVideoDeck(forceMuted = false) {
    const v = document.createElement('video');
    v.src = 'assets/rise_plushie.mp4';
    v.loop = false;
    v.playsInline = true;
    v.preload = 'auto';
    v.muted = forceMuted || !!(window.soundEngine && window.soundEngine.muted);
    v.volume = forceMuted ? 0 : 0.85;
    return v;
  }

  _playDeckSafe(v, allowAudio = false) {
    if (!v) return;
    try {
      const isMuted = !!(window.soundEngine && window.soundEngine.muted);
      v.muted = !allowAudio || isMuted;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    } catch {}
  }

  _startVideoPlayback(fromUserGesture = false) {
    if (!this.primaryVideo) return;
    if (fromUserGesture) this._userAudioUnlocked = true;
    this._playDeckSafe(this.primaryVideo, !!this._userAudioUnlocked);
    if (this.crossfading && this.secondaryVideo) {
      this._playDeckSafe(this.secondaryVideo, !!this._userAudioUnlocked);
    }
  }

  /**
   * Seamless loop controller. Shortly before the primary deck reaches its end,
   * the secondary deck starts from 0s underneath and is blended in (video + audio)
   * across `crossfadeWindow` seconds; then the decks swap roles. Because the blend
   * is driven by the primary deck's real playback clock, it stays in sync even
   * when frames are dropped.
   */
  _updateSeamlessVideoLoop() {
    const a = this.primaryVideo;
    const b = this.secondaryVideo;
    if (!a || !b) return;

    const isMuted = !!(window.soundEngine && window.soundEngine.muted);
    const audioOn = !!this._userAudioUnlocked && !isMuted;
    const baseVol = 0.85;
    const dur = a.duration;

    // Primary deck hit the end without a blend (e.g. tab was hidden): restart quietly
    if (a.ended && !this.crossfading) {
      try { a.currentTime = 0; } catch {}
      this._playDeckSafe(a, !!this._userAudioUnlocked);
    }

    if (!isFinite(dur) || dur <= 0 || (a.paused && !this.crossfading)) {
      a.muted = !audioOn;
      a.volume = baseVol;
      return;
    }

    // Keep the window sane for very short clips
    const win = Math.min(this.crossfadeWindow, dur * 0.3);
    const remaining = dur - a.currentTime;

    if (!this.crossfading && remaining <= win) {
      this.crossfading = true;
      this.crossfadeAlpha = 0;
      try { b.currentTime = 0; } catch {}
      b.volume = 0;
      this._playDeckSafe(b, !!this._userAudioUnlocked);
    }

    if (this.crossfading) {
      this.crossfadeAlpha = a.ended ? 1 : Math.max(0, Math.min(1, 1 - remaining / win));
      const t = 0.5 - 0.5 * Math.cos(this.crossfadeAlpha * Math.PI);

      // Equal-power audio crossfade so loudness never dips at the seam
      a.muted = !audioOn;
      b.muted = !audioOn;
      a.volume = baseVol * Math.cos(t * Math.PI * 0.5);
      b.volume = baseVol * Math.sin(t * Math.PI * 0.5);

      // Only swap once the incoming deck actually has a frame to show
      if (this.crossfadeAlpha >= 1 && b.readyState >= 2) {
        try { a.pause(); } catch {}
        try { a.currentTime = 0; } catch {}
        a.volume = 0;
        a.muted = true;
        b.volume = baseVol;
        this.primaryVideo = b;
        this.secondaryVideo = a;
        this.crossfading = false;
        this.crossfadeAlpha = 0;
      }
    } else {
      a.muted = !audioOn;
      a.volume = baseVol;
    }
  }

  destroy() {
    [this.videoA, this.videoB].forEach(v => {
      if (v) {
        try {
          v.pause();
        } catch {}
      }
    });
  }

  _initStarNotes(w, h) {
    const cx = w * 0.5;
    const cy = h * 0.48;
    const rx = Math.min(w * 0.35, 355);
    const ry = Math.min(h * 0.29, 235);
    const tags = [
      '★ EARTHRISE 1968',
      '★ APOLLO 11',
      '★ LUCAS YE',
      '★ EARTH CAP',
      '★ 7 STARS',
      '★ ORION MPCV',
      '★ ARTEMIS II'
    ];
    const meanings = [
      '1968 APOLLO 8 EARTHRISE • Cảm hứng bức ảnh Trái Đất mọc lịch sử',
      '1969 APOLLO 11 FOOTPRINT • Dấu chân xám sau lưng nối tiếp di sản Mặt Trăng',
      'LUCAS YE (8 TUỔI) • Nhà thiết kế nhí chiến thắng cuộc thi linh vật NASA',
      'THE EARTH CAP • Mũ đại dương xanh & lục địa nhắc nhớ ngôi nhà chung',
      '7 STARS & 2 ROCKETS • Vành mũ đen thêu 7 ngôi sao & 2 tên lửa khát vọng',
      'ORION ZERO-G INDICATOR • Vật chỉ thị trạng thái không trọng lực (0.00 G)',
      '2026 ARTEMIS II • Hành trình đưa phi hành đoàn bay vòng quanh Mặt Trăng'
    ];
    this.activeBanner = null;
    this.starNotes = Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
      return {
        baseAngle: a,
        rx,
        ry,
        x: cx + Math.cos(a) * rx,
        y: cy + Math.sin(a) * ry,
        glyph: '★',
        tag: tags[i],
        meaning: meanings[i],
        collected: false,
        bloom: 0,
        phase: i * 0.95
      };
    });
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.plush.r = Math.max(68, Math.min(128, Math.min(w, h) * 0.145));
    this.plush.x = Math.max(this.plush.r, Math.min(w - this.plush.r, this.plush.x));
    this.plush.y = Math.max(this.plush.r, Math.min(h - this.plush.r, this.plush.y));
    const cx = w * 0.5;
    const cy = h * 0.48;
    const rx = Math.min(w * 0.34, 340);
    const ry = Math.min(h * 0.28, 230);
    this.starNotes.forEach(n => {
      n.rx = rx;
      n.ry = ry;
      n.x = cx + Math.cos(n.baseAngle) * rx;
      n.y = cy + Math.sin(n.baseAngle) * ry;
    });
  }

  _triggerJoyBurst(x, y, noteIdx = 0) {
    this.joyPulse = 1.0;
    if (window.soundEngine) {
      window.soundEngine.playPentatonicNote(noteIdx % 5, 0.22, 0.45, 0, 'triangle');
    }
    this.ripples.push({
      x,
      y,
      r: 16,
      maxR: 135,
      alpha: 0.85
    });
    const colors = ['#f472b6', '#fcd34d', '#38bdf8', '#fef3c7'];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
      const spd = 55 + Math.random() * 115;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 20,
        life: 1.0,
        size: 3 + Math.random() * 4,
        color: colors[i % colors.length],
        isHeart: i % 3 === 0
      });
    }
  }

  _collectNextChime(x, y) {
    if (this.ending || this.completed) return;
    const uncollected = this.starNotes.find(n => !n.collected);
    if (uncollected) {
      uncollected.collected = true;
      uncollected.bloom = 1.0;
      this.activeBanner = { text: uncollected.meaning, alpha: 1.0 };
    }
    this.chimesCollected = Math.min(this.targetChimes, this.chimesCollected + 1);
    this._triggerJoyBurst(x, y, this.chimesCollected);

    if (this.chimesCollected >= this.targetChimes && !this.ending) {
      this.ending = true;
      if (window.soundEngine) window.soundEngine.playSignatureMotif(3);
    }
  }

  onPointerDown(x, y) {
    if (this.completed || this.ending) return;
    this.ghostAlpha = 0;
    this.pointer = { x, y, active: true };
    this._startVideoPlayback(true);

    const distToPlush = Math.hypot(x - this.plush.x, y - this.plush.y);
    if (distToPlush <= this.plush.r * 1.45) {
      // Petting / grabbing Rise directly!
      this.isDragging = true;
      this.petCount++;
      this.plush.vAngle = (Math.random() - 0.5) * 1.4;
      this._collectNextChime(this.plush.x, this.plush.y - this.plush.r * 0.4);
      return;
    }

    // Check if user tapped directly on a floating Star Note
    const hitNote = this.starNotes.find(n => !n.collected && Math.hypot(x - n.x, y - n.y) < 74);
    if (hitNote) {
      hitNote.collected = true;
      hitNote.bloom = 1.0;
      this.activeBanner = { text: hitNote.meaning, alpha: 1.0 };
      // Gently propel Rise toward that note in Zero-G
      const dx = hitNote.x - this.plush.x;
      const dy = hitNote.y - this.plush.y;
      this.plush.vx = dx * 2.2;
      this.plush.vy = dy * 2.2;
      this.chimesCollected = Math.min(this.targetChimes, this.chimesCollected + 1);
      this._triggerJoyBurst(hitNote.x, hitNote.y, this.chimesCollected);
      if (this.chimesCollected >= this.targetChimes && !this.ending) {
        this.ending = true;
        if (window.soundEngine) window.soundEngine.playSignatureMotif(3);
      }
      return;
    }

    // Otherwise give Rise a smooth Zero-G attraction toward the tap point
    const dx = x - this.plush.x;
    const dy = y - this.plush.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    this.plush.vx += (dx / len) * 165;
    this.plush.vy += (dy / len) * 165;
    this.plush.vAngle = (dx / len) * 0.65;
    if (window.soundEngine) window.soundEngine.playUITick();
  }

  onPointerMove(x, y, vx = 0, vy = 0) {
    if (this.completed || this.ending) return;
    this.pointer.x = x;
    this.pointer.y = y;

    if (this.isDragging) {
      this.plush.x += (x - this.plush.x) * 0.35;
      this.plush.y += (y - this.plush.y) * 0.35;
      this.plush.vx = vx * 240;
      this.plush.vy = vy * 240;
    } else {
      // Gentle magnetic Zero-G wake when cursor passes near Rise
      const d = Math.hypot(x - this.plush.x, y - this.plush.y);
      if (d < this.plush.r * 1.9 && d > 8) {
        this.plush.vx += ((x - this.plush.x) / d) * 4.5;
        this.plush.vy += ((y - this.plush.y) / d) * 4.5;
      }
    }
  }

  onPointerUp() {
    this.isDragging = false;
    this.pointer.active = false;
  }

  onKeyDown(e) {
    if (this.completed || this.ending) return false;
    this._startVideoPlayback(true);
    if (e.code === 'Space') {
      this.petCount++;
      this.plush.vy -= 95;
      this.plush.vAngle = 0.7;
      this._collectNextChime(this.plush.x, this.plush.y);
      return true;
    }
    const impulse = 140;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.plush.vx -= impulse;
      return true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.plush.vx += impulse;
      return true;
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      this.plush.vy -= impulse;
      return true;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.plush.vy += impulse;
      return true;
    }
    return false;
  }

  onKeyUp() {
    return false;
  }

  update(dt) {
    this.elapsed += dt;
    this.joyPulse = Math.max(0, this.joyPulse - dt * 2.2);

    // Seamless Dual-Deck Video Loop & Audio Crossfade Controller
    this._updateSeamlessVideoLoop();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w * 0.5;
    const cy = h * 0.48;

    // Update orbiting Star Notes
    this.starNotes.forEach((n, idx) => {
      const a = n.baseAngle + Math.sin(this.elapsed * 0.55 + idx) * 0.12;
      n.x = cx + Math.cos(a) * n.rx;
      n.y = cy + Math.sin(a) * n.ry + Math.sin(this.elapsed * 1.6 + n.phase) * 8;
      if (n.bloom > 0) n.bloom = Math.max(0, n.bloom - dt * 1.4);

      // Check collision between floating Rise plushie and uncollected Star Note
      if (!n.collected && !this.ending) {
        const d = Math.hypot(this.plush.x - n.x, this.plush.y - n.y);
        if (d < this.plush.r + 34) {
          n.collected = true;
          n.bloom = 1.0;
          this.activeBanner = { text: n.meaning, alpha: 1.0 };
          this.chimesCollected = Math.min(this.targetChimes, this.chimesCollected + 1);
          this._triggerJoyBurst(n.x, n.y, this.chimesCollected);
          if (this.chimesCollected >= this.targetChimes && !this.ending) {
            this.ending = true;
            if (window.soundEngine) window.soundEngine.playSignatureMotif(3);
          }
        }
      }
    });

    if (this.activeBanner && this.activeBanner.alpha > 0) {
      this.activeBanner.alpha = Math.max(0, this.activeBanner.alpha - dt * 0.28);
    }

    // Zero-G Physics for Rise
    if (!this.isDragging && !this.ending) {
      // Gentle microgravity drift + soft umbilical spring back toward cupola center
      this.plush.vx += Math.sin(this.elapsed * 0.9) * 12 * dt;
      this.plush.vy += Math.cos(this.elapsed * 1.1) * 12 * dt;
      this.plush.vx += (cx - this.plush.x) * 0.14 * dt;
      this.plush.vy += (cy - this.plush.y) * 0.14 * dt;

      this.plush.vx *= Math.pow(0.985, dt * 60);
      this.plush.vy *= Math.pow(0.985, dt * 60);

      this.plush.x += this.plush.vx * dt;
      this.plush.y += this.plush.vy * dt;

      // Soft elastic bounce off Cupola viewport boundaries
      const pad = this.plush.r + 44;
      if (this.plush.x < pad) {
        this.plush.x = pad;
        this.plush.vx = Math.abs(this.plush.vx) * 0.78;
        this.plush.vAngle = 0.4;
      } else if (this.plush.x > w - pad) {
        this.plush.x = w - pad;
        this.plush.vx = -Math.abs(this.plush.vx) * 0.78;
        this.plush.vAngle = -0.4;
      }
      if (this.plush.y < pad + 30) {
        this.plush.y = pad + 30;
        this.plush.vy = Math.abs(this.plush.vy) * 0.78;
      } else if (this.plush.y > h - pad - 20) {
        this.plush.y = h - pad - 20;
        this.plush.vy = -Math.abs(this.plush.vy) * 0.78;
      }
    }

    // Gentle Zero-G rotational bobbing (keeps Rise mostly upright so face is clear)
    this.plush.angle += this.plush.vAngle * dt;
    this.plush.vAngle *= Math.pow(0.94, dt * 60);
    const targetTilt = Math.max(-0.28, Math.min(0.28, this.plush.vx * 0.0012)) + Math.sin(this.elapsed * 1.5) * 0.06;
    this.plush.angle += (targetTilt - this.plush.angle) * dt * 4.0;

    // Update particles & ripples
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.97;
      s.vy *= 0.97;
      s.life -= dt * 1.15;
      if (s.life <= 0) this.sparkles.splice(i, 1);
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i];
      rp.r += dt * 145;
      rp.alpha -= dt * 0.85;
      if (rp.alpha <= 0 || rp.r >= rp.maxR) this.ripples.splice(i, 1);
    }

    // Fallback completion after maxDuration
    if (!this.ending && this.elapsed >= this.maxDuration) {
      this.ending = true;
      this.chimesCollected = this.targetChimes;
      if (window.soundEngine) window.soundEngine.playSignatureMotif(3);
    }

    if (this.ending && !this.completed) {
      this.finaleTimer += dt;
      this.plush.x += (cx - this.plush.x) * dt * 3.5;
      this.plush.y += (cy - this.plush.y) * dt * 3.5;
      this.plush.angle += (0 - this.plush.angle) * dt * 5.0;
      if (this.finaleTimer >= 1.9) {
        this.completed = true;
        this.destroy();
        this.host.completeCurrentGame();
      }
    }
  }

  _drawFallbackPlushieFace(ctx, r) {
    // Ivory Moon plush head ("A Little Moon With a Big Dream")
    const headGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.1, r * 0.1, 0, r * 0.1, r);
    headGrad.addColorStop(0, '#fffdf7');
    headGrad.addColorStop(0.75, '#f5eedc');
    headGrad.addColorStop(1, '#e2d6be');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, r * 0.08, r * 0.92, 0, Math.PI * 2);
    ctx.fill();

    // 1. The Earth Cap (Blue oceans + Green continents)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.38, r * 0.88, r * 0.58, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-r, -r, r * 2, r);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, -r * 0.55, r * 0.34, r * 0.22, -0.3, 0, Math.PI * 2);
    ctx.ellipse(r * 0.32, -r * 0.48, r * 0.28, r * 0.2, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2 & 3. Black Cap Brim with 7 Stars & 2 Rocket Motifs
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.36, r * 0.84, r * 0.24, -0.04, 0, Math.PI * 2);
    ctx.fillStyle = '#18181b';
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 7 Golden Stars across brim
    ctx.fillStyle = '#fcd34d';
    for (let s = -3; s <= 3; s++) {
      const sx = s * r * 0.16;
      const sy = -r * 0.38 + Math.abs(s) * r * 0.015;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.032, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Rosy Pink Embroidered Cheeks
    ctx.fillStyle = '#f472b6';
    [-r * 0.48, r * 0.48].forEach(cx => {
      ctx.beginPath();
      ctx.arc(cx, r * 0.22, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    });

    // Big Sparkling Plushie Eyes
    [-r * 0.28, r * 0.28].forEach(ex => {
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(ex, r * 0.06, r * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - r * 0.035, r * 0.02, r * 0.042, 0, Math.PI * 2);
      ctx.fill();
    });

    // Happy plush smile
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, r * 0.14, r * 0.15, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  render(ctx, w, h) {
    const cx = w * 0.5;
    const cy = h * 0.48;

    // 1. Deep Lunar Orbit Space + VantaLumen GLSL Nebula Backdrop
    const bg = ctx.createRadialGradient(cx, h * 0.82, 40, cx, cy, Math.max(w, h) * 0.9);
    bg.addColorStop(0, '#0d2242');
    bg.addColorStop(0.48, '#060f20');
    bg.addColorStop(1, '#02050c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: 0.78,
        lumen: 0.95,
        cyan: 0.85,
        stars: 0.82
      });
    }

    if (window.VantaGfx) {
      if (!this._stars) this._stars = window.VantaGfx.createStarfield(135, 0.9);
      window.VantaGfx.drawStarfield(ctx, this._stars, w, h, this.elapsed, 0.92);
    }

    // 2. Iconic EARTHRISE (Trái Đất Mọc — Apollo 8 1968 -> Artemis II 2026) above the Lunar Horizon
    ctx.save();
    const earthRiseX = cx + Math.min(w, h) * 0.24;
    const earthRiseY = h * 0.76;
    const earthRiseR = Math.min(w, h) * 0.13;
    const earthGlow = ctx.createRadialGradient(earthRiseX, earthRiseY, earthRiseR * 0.5, earthRiseX, earthRiseY, earthRiseR * 1.65);
    earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    earthGlow.addColorStop(0.6, 'rgba(14, 165, 233, 0.15)');
    earthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(earthRiseX, earthRiseY, earthRiseR * 1.65, 0, Math.PI * 2);
    ctx.fill();

    // Earthrise Globe (Blue oceans + Green continents + White cloud swirls)
    ctx.save();
    ctx.beginPath();
    ctx.arc(earthRiseX, earthRiseY, earthRiseR, 0, Math.PI * 2);
    ctx.clip();
    const oceanGrad = ctx.createRadialGradient(
      earthRiseX - earthRiseR * 0.3,
      earthRiseY - earthRiseR * 0.3,
      earthRiseR * 0.1,
      earthRiseX,
      earthRiseY,
      earthRiseR
    );
    oceanGrad.addColorStop(0, '#38bdf8');
    oceanGrad.addColorStop(0.55, '#0284c7');
    oceanGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(earthRiseX - earthRiseR, earthRiseY - earthRiseR, earthRiseR * 2, earthRiseR * 2);

    ctx.fillStyle = 'rgba(34, 197, 94, 0.72)';
    ctx.beginPath();
    ctx.ellipse(earthRiseX - earthRiseR * 0.22, earthRiseY - earthRiseR * 0.18, earthRiseR * 0.42, earthRiseR * 0.25, -0.35, 0, Math.PI * 2);
    ctx.ellipse(earthRiseX + earthRiseR * 0.28, earthRiseY + earthRiseR * 0.12, earthRiseR * 0.32, earthRiseR * 0.22, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(earthRiseX - earthRiseR * 0.1, earthRiseY - earthRiseR * 0.38, earthRiseR * 0.55, earthRiseR * 0.12, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sculpted Gray-Ivory Lunar Horizon Curve at Bottom ("A Little Moon With a Big Dream")
    const moonR = Math.max(w, h) * 1.45;
    const moonY = h + moonR * 0.84;
    const moonGrad = ctx.createRadialGradient(cx, moonY - moonR * 0.98, 10, cx, moonY, moonR * 1.02);
    moonGrad.addColorStop(0, '#94a3b8');
    moonGrad.addColorStop(0.35, '#475569');
    moonGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.32)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 3. Orion Spacecraft Cabin Window Frame (Artemis II Lunar Flyby)
    const cupR = Math.min(w, h) * 0.44;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(a) * cupR;
      const py = Math.sin(a) * cupR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Radial window struts
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.11)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * cupR, Math.sin(a) * cupR);
      ctx.lineTo(Math.cos(a) * cupR * 1.45, Math.sin(a) * cupR * 1.45);
      ctx.stroke();
    }

    // Artemis II & Lucas Ye Telemetry Inscription
    ctx.fillStyle = 'rgba(226, 232, 240, 0.56)';
    ctx.font = w < 640 ? '500 9.5px "JetBrains Mono", monospace' : '500 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const cupTelemetry = w < 640
      ? 'ARTEMIS II // ORION ZERO-G: "RISE" (BY LUCAS YE)'
      : 'NASA ARTEMIS II  //  ORION ZERO-G INDICATOR: "RISE" (BY LUCAS YE)  //  EARTHRISE • 0.00 G';
    ctx.fillText(cupTelemetry, 0, cupR + 24);
    ctx.restore();

    // 4. Flexible Gold-Kapton Zero-G Tether connecting Orion cabin anchor to Rise
    ctx.save();
    ctx.strokeStyle = 'rgba(252, 211, 77, 0.34)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy + cupR * 0.88);
    const midX = (cx + this.plush.x) * 0.5 + Math.sin(this.elapsed * 2) * 28;
    const midY = (cy + cupR * 0.88 + this.plush.y) * 0.5;
    ctx.quadraticCurveTo(midX, midY, this.plush.x, this.plush.y + this.plush.r * 0.9);
    ctx.stroke();
    ctx.restore();

    // 5. Floating 7 Stars of Rise's Cap Brim (Seven Stars Symbolism)
    this.starNotes.forEach((n, idx) => {
      if (n.collected && n.bloom <= 0.02) return;
      const alpha = n.collected ? n.bloom : 0.94;
      const pulse = 1 + Math.sin(this.elapsed * 3.2 + n.phase) * 0.12;

      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.scale(pulse, pulse);

      const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 36);
      halo.addColorStop(0, `rgba(252, 211, 77, ${0.48 * alpha})`);
      halo.addColorStop(0.5, `rgba(56, 189, 248, ${0.22 * alpha})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(252, 211, 77, ${0.72 * alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(254, 243, 199, ${alpha})`;
      ctx.font = '600 16px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.glyph, 0, 0);

      if (n.tag) {
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha * 0.78})`;
        ctx.fillText(n.tag.replace('★ ', ''), 0, 28);
      }
      ctx.restore();
    });

    // 6. Joy Ripples
    this.ripples.forEach(rp => {
      ctx.save();
      ctx.strokeStyle = `rgba(252, 211, 77, ${rp.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 7. RISE — ARTEMIS II ZERO-G INDICATOR (Full Earth Cap + Rockets + 7 Stars Video Portrait)
    const pr = this.plush.r * (1 + this.joyPulse * 0.08);
    ctx.save();
    ctx.translate(this.plush.x, this.plush.y);
    ctx.rotate(this.plush.angle);

    // Outer warm lunar-gold & Earth-blue aura around Rise
    const auraR = pr * (this.ending ? 2.15 : 1.6);
    const aura = ctx.createRadialGradient(0, 0, pr * 0.6, 0, 0, auraR);
    aura.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
    aura.addColorStop(0.5, 'rgba(252, 211, 77, 0.22)');
    aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, auraR, 0, Math.PI * 2);
    ctx.fill();

    // Cute Plush Little Arms with subtle Apollo 11 Footprint badge hint
    const armWave = Math.sin(this.elapsed * 3.8 + this.joyPulse * 4) * 0.22;
    [-1, 1].forEach(dir => {
      ctx.save();
      ctx.translate(dir * pr * 0.92, pr * 0.34);
      ctx.rotate(dir * (0.45 + armWave));
      ctx.fillStyle = '#f5eedc';
      ctx.strokeStyle = 'rgba(226, 214, 190, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 0.24, pr * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Generous Rounded-Squircle Orion Viewport Medallion so 100% of Rise's Earth Cap, Rockets & 7 Stars Brim is visible (while cropping out bottom-right watermark)
    const boxW = pr * 2.18;
    const boxH = pr * 2.14;
    const cornerR = pr * 0.86;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-boxW * 0.5, -boxH * 0.52, boxW, boxH, cornerR);
    ctx.clip();

    if (this.primaryVideo && this.primaryVideo.readyState >= 2 && this.primaryVideo.videoWidth > 0) {
      const drawDeckFrame = (v, alpha) => {
        if (!v || v.readyState < 2 || v.videoWidth <= 0 || alpha <= 0.001) return;
        const vw = v.videoWidth;
        const vh = v.videoHeight;
        // Central region (x: 19%..81%, y: 0%..100%) preserves 100% of the Earth Cap, rocket motifs & 7 stars on the brim while excluding the watermark at x~90%
        const sx = vw * 0.19;
        const sy = 0;
        const sw = vw * 0.62;
        const sh = vh;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(v, sx, sy, sw, sh, -boxW * 0.52, -boxH * 0.54, boxW * 1.04, boxH * 1.04);
        ctx.restore();
      };

      if (this.crossfading && this.secondaryVideo && this.secondaryVideo.readyState >= 2) {
        // Cosine smoothstep blend so there is never a hard cut or brightness dip
        const t = Math.max(0, Math.min(1, this.crossfadeAlpha));
        const smoothT = 0.5 - 0.5 * Math.cos(t * Math.PI);
        drawDeckFrame(this.primaryVideo, 1);
        drawDeckFrame(this.secondaryVideo, smoothT);
      } else {
        drawDeckFrame(this.primaryVideo, 1);
      }
    } else {
      this._drawFallbackPlushieFace(ctx, pr);
    }

    // Soft optical edge blend inside the Zero-G bubble
    const innerShade = ctx.createRadialGradient(0, -pr * 0.1, pr * 0.68, 0, 0, pr * 1.15);
    innerShade.addColorStop(0, 'rgba(255, 255, 255, 0)');
    innerShade.addColorStop(0.78, 'rgba(8, 14, 28, 0.08)');
    innerShade.addColorStop(1, 'rgba(6, 11, 24, 0.52)');
    ctx.fillStyle = innerShade;
    ctx.fillRect(-boxW * 0.55, -boxH * 0.55, boxW * 1.1, boxH * 1.1);
    ctx.restore();

    // Orion Zero-G Medallion Rim & Specular Highlight
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.52)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-boxW * 0.5, -boxH * 0.52, boxW, boxH, cornerR);
    ctx.stroke();

    // Golden 7-Star Orbital Progress Ring around Rise
    const progress = this.chimesCollected / this.targetChimes;
    if (progress > 0) {
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -pr * 0.02, pr * 1.18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    }

    // "RISE // ARTEMIS II" Nameplate Badge at Bottom
    ctx.fillStyle = 'rgba(9, 14, 26, 0.9)';
    ctx.strokeStyle = 'rgba(252, 211, 77, 0.72)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-64, pr * 0.92, 128, 22, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RISE // ARTEMIS II', 0, pr * 0.92 + 11);

    ctx.restore();

    // 8. Joy Sparkles & Hearts
    this.sparkles.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      if (s.isHeart) {
        ctx.font = `${Math.round(s.size * 3.8)}px "Be Vietnam Pro", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('★', s.x, s.y);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 9. Floating Symbolism Callout Pill when a Star Note is collected
    if (this.activeBanner && this.activeBanner.alpha > 0.02) {
      const a = Math.min(1, this.activeBanner.alpha * 1.4);
      const pillY = Math.max(106, cy - cupR * 0.82);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = w < 640 ? '600 11px "Be Vietnam Pro", sans-serif' : '600 12.5px "Be Vietnam Pro", sans-serif';
      const tw = Math.min(w - 32, ctx.measureText(this.activeBanner.text).width + 32);
      ctx.fillStyle = 'rgba(8, 13, 26, 0.88)';
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(cx - tw * 0.5, pillY - 17, tw, 34, 17);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.activeBanner.text, cx, pillY, tw - 20);
      ctx.restore();
    }

    // 10. Subtle Ghost Reticle Prompt before first interaction
    if (this.ghostAlpha > 0.02 && typeof drawGhostHand === 'function') {
      drawGhostHand(ctx, this.plush.x, this.plush.y, this.ghostAlpha, 1.1, false);
    }
  }

  getSessionMetric() {
    return `Rise (Artemis II) • ${this.chimesCollected}/${this.targetChimes} Sao • 0.00 G`;
  }
}

window.RiseZeroGGame = RiseZeroGGame;
