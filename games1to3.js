/**
 * Minigames 1–3 Implementation
 * - Rules: No text, no % bars, no Game Over during gameplay.
 * - Ghost Hand ("bàn tay ma") guides the first gesture and disappears immediately on first touch.
 * - Warm amber (#f59e0b / #fcd34d) = remembered; Cold slate/dust = forgotten.
 */

// Shared helper to draw the translucent Ghost Hand tutorial
function drawGhostHand(ctx, x, y, alpha, scale = 1, isHolding = false) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  // Soft pulsing ring around touch point
  ctx.beginPath();
  ctx.arc(0, 0, isHolding ? 18 : 26, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (isHolding) {
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Minimalist luminous hand silhouette
  ctx.fillStyle = 'rgba(254, 243, 199, 0.85)';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Finger/palm trail
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(8, 22);
  ctx.lineTo(18, 28);
  ctx.stroke();

  ctx.restore();
}

/* ============================================================================
 * 1. UNDER THE DUST — Nhịp tim dưới lớp bụi (InSight Solar Panel & Saltation)
 * ==========================================================================*/
class UnderTheDustGame {
  constructor(host) {
    this.host = host;
    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d');
    this.panelCanvas = document.createElement('canvas');
    this.panelCtx = this.panelCanvas.getContext('2d');
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.duration = 28; // 28s until Martian sunset
    this.cleanRatio = 0;
    this.motifPlayed = false;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.85;

    this.heartbeatTimer = 0;
    this.heartPulseVisual = 0;

    this.sandGrains = []; // Saltation sand grains dropped by holding
    this.windParticles = []; // Blowing dust motes
    this.holdTime = 0;
    this.isDown = false;
    this.pointer = { x: 0, y: 0, vx: 0, vy: 0 };

    this._initCanvases();
  }

  _initCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.maskCanvas.width = w;
    this.maskCanvas.height = h;
    this.panelCanvas.width = w;
    this.panelCanvas.height = h;

    // 1. Pre-render underlying Solar Panel with human assembly traces
    const pctx = this.panelCtx;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.min(w, h) * 0.36;
    this.panelGeometry = { cx, cy, radius };

    // Martian ground backdrop
    const bgGrad = pctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, Math.max(w, h) * 0.8);
    bgGrad.addColorStop(0, '#1e1610');
    bgGrad.addColorStop(1, '#080b12');
    pctx.fillStyle = bgGrad;
    pctx.fillRect(0, 0, w, h);

    // Draw decagonal InSight solar wing
    pctx.save();
    pctx.translate(cx, cy);
    pctx.beginPath();
    const sides = 10;
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      if (i === 0) pctx.moveTo(px, py);
      else pctx.lineTo(px, py);
    }
    pctx.closePath();
    pctx.clip();

    // Photovoltaic cells with teal-amber iridescence
    const cellGrad = pctx.createLinearGradient(-radius, -radius, radius, radius);
    cellGrad.addColorStop(0, '#0f293a');
    cellGrad.addColorStop(0.5, '#163b47');
    cellGrad.addColorStop(1, '#3b2812');
    pctx.fillStyle = cellGrad;
    pctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    // Individual solar wafer grid lines (warm gold busbars)
    pctx.strokeStyle = 'rgba(245, 158, 11, 0.38)';
    pctx.lineWidth = 1.2;
    const step = radius / 5;
    for (let x = -radius; x <= radius; x += step) {
      pctx.beginPath();
      pctx.moveTo(x, -radius);
      pctx.lineTo(x, radius);
      pctx.stroke();
    }
    for (let y = -radius; y <= radius; y += step) {
      pctx.beginPath();
      pctx.moveTo(-radius, y);
      pctx.lineTo(radius, y);
      pctx.stroke();
    }

    // Radial ribs of the ultraflex solar fan
    pctx.strokeStyle = 'rgba(252, 211, 77, 0.55)';
    pctx.lineWidth = 2;
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      pctx.stroke();
    }

    // Human assembly traces under the dust: wrench scratch & handwritten serial stencil
    pctx.strokeStyle = 'rgba(254, 243, 199, 0.42)';
    pctx.lineWidth = 1.3;
    pctx.beginPath();
    pctx.moveTo(-radius * 0.45, -radius * 0.22);
    pctx.bezierCurveTo(-radius * 0.3, -radius * 0.28, -radius * 0.18, -radius * 0.14, -radius * 0.08, -radius * 0.25);
    pctx.stroke();

    // Subtle human fingerprint smudges and JPL serial markings etched on rim
    pctx.font = '13px "JetBrains Mono", monospace';
    pctx.fillStyle = 'rgba(252, 211, 77, 0.48)';
    pctx.fillText('JPL-NSY-04 // ♥ E.K.', radius * 0.15, radius * 0.38);
    pctx.fillText('SN-1805-MARS', -radius * 0.56, radius * 0.28);

    // Center hub
    pctx.beginPath();
    pctx.arc(0, 0, radius * 0.14, 0, Math.PI * 2);
    pctx.fillStyle = '#1e293b';
    pctx.fill();
    pctx.strokeStyle = '#fcd34d';
    pctx.lineWidth = 2.5;
    pctx.stroke();
    pctx.restore();

    // Outer metallic rim
    pctx.save();
    pctx.translate(cx, cy);
    pctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      if (i === 0) pctx.moveTo(px, py);
      else pctx.lineTo(px, py);
    }
    pctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
    pctx.lineWidth = 4;
    pctx.stroke();
    pctx.restore();

    // 2. Render thick Martian orange-rust dust layer onto maskCanvas
    const mctx = this.maskCtx;
    mctx.globalCompositeOperation = 'source-over';
    const dustGrad = mctx.createLinearGradient(0, 0, w, h);
    dustGrad.addColorStop(0, '#5c2d16');
    dustGrad.addColorStop(0.5, '#4a2311');
    dustGrad.addColorStop(1, '#2b140a');
    mctx.fillStyle = dustGrad;
    mctx.fillRect(0, 0, w, h);

    // Procedural dust texture speckles
    for (let i = 0; i < 2200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 2.5 + 0.5;
      mctx.fillStyle = i % 2 === 0 ? 'rgba(180, 83, 9, 0.28)' : 'rgba(30, 15, 8, 0.35)';
      mctx.beginPath();
      mctx.arc(x, y, r, 0, Math.PI * 2);
      mctx.fill();
    }
  }

  onResize() {
    this._initCanvases();
  }

  onPointerDown(x, y) {
    this.isDown = true;
    this.holdTime = 0;
    this.pointer.x = x;
    this.pointer.y = y;

    if (!this.hasInteracted) {
      this.hasInteracted = true;
      // 5-second hook: First touch immediately bursts open a warm streak + heartbeat thump
      this._eraseDustAt(x, y, 52, 0.9);
      this.heartPulseVisual = 1.0;
      window.soundEngine.playHeartbeat(0.6);
      window.soundEngine.playPentatonicNote(2, 0.14, 1.2);
    } else {
      this._eraseDustAt(x, y, 36, 0.65);
    }
  }

  onPointerMove(x, y, vx, vy) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.vx = vx;
    this.pointer.vy = vy;

    const speed = Math.hypot(vx, vy);
    if (this.isDown || speed > 0.15) {
      if (!this.hasInteracted && speed > 0.4) {
        this.hasInteracted = true;
        window.soundEngine.playHeartbeat(0.5);
      }

      this.holdTime = 0;
      const radius = Math.min(68, 28 + speed * 25);
      this._eraseDustAt(x, y, radius, 0.55);

      // Modulate brush wind sound
      window.soundEngine.setBrushWind(Math.min(1, speed * 0.6), Math.min(1, speed * 0.4));

      // Push saltating sand grains along the wind vector!
      for (const g of this.sandGrains) {
        const dist = Math.hypot(g.x - x, g.y - y);
        if (dist < 150) {
          g.vx += vx * 0.55 + (Math.random() - 0.5) * 2;
          g.vy += vy * 0.55 + (Math.random() - 0.5) * 2;
          g.bouncing = true;
        }
      }

      // Spawn blowing dust particles
      for (let i = 0; i < 3; i++) {
        this.windParticles.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          vx: vx * 0.35 + (Math.random() - 0.5) * 1.5,
          vy: vy * 0.35 + (Math.random() - 0.5) * 1.5,
          life: 1.0,
          size: Math.random() * 3 + 1.5
        });
      }
    }
  }

  onPointerUp() {
    this.isDown = false;
    this.holdTime = 0;
    window.soundEngine.setBrushWind(0);
  }

  _eraseDustAt(x, y, radius, strength = 0.7) {
    const mctx = this.maskCtx;
    mctx.save();
    mctx.globalCompositeOperation = 'destination-out';
    const grad = mctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    grad.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    mctx.fillStyle = grad;
    mctx.beginPath();
    mctx.arc(x, y, radius, 0, Math.PI * 2);
    mctx.fill();
    mctx.restore();

    // Update clean ratio estimate smoothly
    const { cx, cy, radius: pr } = this.panelGeometry;
    const distFromPanel = Math.hypot(x - cx, y - cy);
    if (distFromPanel < pr * 1.15) {
      const areaGain = (radius * radius) / (pr * pr * 140);
      this.cleanRatio = Math.min(1, this.cleanRatio + areaGain * strength);

      if (this.cleanRatio >= 0.6 && !this.motifPlayed) {
        this.motifPlayed = true;
        window.soundEngine.playSignatureMotif(2);
      }
    }
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    // Hold gesture: Pour coarse sand grains onto the panel for saltation
    if (this.isDown) {
      this.holdTime += dt;
      if (this.holdTime > 0.25 && this.sandGrains.length < 90) {
        for (let i = 0; i < 2; i++) {
          this.sandGrains.push({
            x: this.pointer.x + (Math.random() - 0.5) * 26,
            y: this.pointer.y + (Math.random() - 0.5) * 26,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            bouncing: false,
            life: 6.0
          });
        }
      }
    }

    // Update saltating sand grains (bouncing grains scrape stubborn dust!)
    for (let i = this.sandGrains.length - 1; i >= 0; i--) {
      const g = this.sandGrains[i];
      g.x += g.vx;
      g.y += g.vy;
      g.vx *= 0.94;
      g.vy *= 0.94;
      g.life -= dt;

      const speed = Math.hypot(g.vx, g.vy);
      if (speed > 1.2) {
        this._eraseDustAt(g.x, g.y, 18, 0.85);
      }
      if (g.life <= 0) {
        this.sandGrains.splice(i, 1);
      }
    }

    // Update wind dust motes
    for (let i = this.windParticles.length - 1; i >= 0; i--) {
      const p = this.windParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 1.4;
      if (p.life <= 0) this.windParticles.splice(i, 1);
    }

    // Sunset phase in the last 5 seconds: dusk falls, dust gently settles back
    const sunsetProgress = Math.max(0, (this.elapsed - (this.duration - 6)) / 6);
    if (sunsetProgress > 0) {
      const mctx = this.maskCtx;
      mctx.save();
      mctx.globalCompositeOperation = 'source-over';
      mctx.fillStyle = `rgba(35, 16, 8, ${dt * 0.14})`;
      mctx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      mctx.restore();
    }

    // Planetary Heartbeat cadence: faster & fuller as panel is cleaned, slows to rest at sunset
    const vitality = sunsetProgress > 0
      ? Math.max(0.1, this.cleanRatio * (1 - sunsetProgress * 0.8))
      : this.cleanRatio;
    const beatInterval = 1.45 - vitality * 0.72; // 1.45s cold -> 0.73s warm
    this.heartbeatTimer += dt;
    if (this.heartbeatTimer >= beatInterval) {
      this.heartbeatTimer = 0;
      this.heartPulseVisual = 1.0;
      window.soundEngine.playHeartbeat(vitality);
    }
    this.heartPulseVisual = Math.max(0, this.heartPulseVisual - dt * 2.8);

    // End at Martian sunset (no Game Over!)
    if (this.elapsed >= this.duration && !this.completed) {
      this.completed = true;
      window.soundEngine.setBrushWind(0);
      if (!this.motifPlayed) window.soundEngine.playSignatureMotif(2);
      this.host.completeCurrentGame();
    }
  }

  render(ctx, w, h) {
    // 1. Draw underlying solar panel
    ctx.drawImage(this.panelCanvas, 0, 0);

    // 2. Warm amber glow radiating from cleaned solar cells & heartbeat
    const { cx, cy, radius } = this.panelGeometry;
    const amberIntensity = this.cleanRatio * 0.55 + this.heartPulseVisual * 0.22;
    if (amberIntensity > 0.01) {
      ctx.save();
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius * 1.15);
      glow.addColorStop(0, `rgba(252, 211, 77, ${amberIntensity * 0.65})`);
      glow.addColorStop(0.6, `rgba(245, 158, 11, ${amberIntensity * 0.35})`);
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw dust mask on top
    ctx.drawImage(this.maskCanvas, 0, 0);

    // 4. Draw saltation sand grains (amber-gold coarse grains)
    for (const g of this.sandGrains) {
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw blowing dust motes
    for (const p of this.windParticles) {
      ctx.fillStyle = `rgba(245, 158, 11, ${p.life * 0.55})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Subtle Heartbeat Ring around center hub (no % bars or text)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (0.14 + (1 - this.heartPulseVisual) * 0.18), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(252, 211, 77, ${this.heartPulseVisual * (0.3 + this.cleanRatio * 0.5)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 7. Martian Dusk Lighting Overlay as time progresses
    const dusk = Math.max(0, (this.elapsed - 18) / 10);
    if (dusk > 0) {
      ctx.fillStyle = `rgba(6, 9, 20, ${dusk * 0.58})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 8. Ghost Hand before first gesture
    if (this.ghostAlpha > 0.01) {
      const t = performance.now() * 0.0025;
      const gx = cx + Math.sin(t) * (radius * 0.45);
      const gy = cy + Math.cos(t * 2) * (radius * 0.18);
      drawGhostHand(ctx, gx, gy, this.ghostAlpha, 1, false);
    }
  }

  getSessionMetric() {
    const pct = Math.min(100, Math.round(Math.max(0.18, this.cleanRatio) * 100));
    return `${pct}% Bề mặt sạch • ${Math.round(52 + pct * 0.45)} BPM`;
  }
}

/* ============================================================================
 * 2. STILL THERE — Vẫn còn ở đó (Apollo Lunar Laser Retroreflectors & 2.5s Echo)
 * ==========================================================================*/
class StillThereGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.duration = 34;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.85;

    // 3 real Apollo Retroreflector sites (Apollo 11 Mare Tranquillitatis, Apollo 14 Fra Mauro, Apollo 15 Hadley Rille)
    this.sites = [
      { id: 0, u: 0.28, v: 0.06, lit: false, glow: 0, echoes: 0 }, // Apollo 11
      { id: 1, u: -0.22, v: 0.14, lit: false, glow: 0, echoes: 0 }, // Apollo 14
      { id: 2, u: 0.06, v: -0.28, lit: false, glow: 0, echoes: 0 }  // Apollo 15
    ];

    this.aim = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
    this.isCharging = false;
    this.chargePhase = 0; // 0..1 wave ring
    this.beams = [];
    this.pendingEchoes = []; // { timer: 2.5, site, x, y, accurate }
    this.echoRipples = [];

    // Stars background
    this.stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.85,
      s: Math.random() * 1.8 + 0.4,
      p: Math.random() * Math.PI * 2
    }));
  }

  onResize() {}

  _getMoonGeometry(w, h) {
    const cx = w * 0.5;
    const cy = h * 0.42;
    const r = Math.min(w, h) * 0.25;
    return { cx, cy, r };
  }

  onPointerDown(x, y) {
    this.isCharging = true;
    this.chargePhase = 0;
    this.aim.x = x;
    this.aim.y = y;
    if (!this.hasInteracted) {
      this.hasInteracted = true;
    }
  }

  onPointerMove(x, y) {
    // Gentle magnetic pull toward nearest Apollo retroreflector site
    const { cx, cy, r } = this._getMoonGeometry(window.innerWidth, window.innerHeight);
    let tx = x;
    let ty = y;
    for (const s of this.sites) {
      const sx = cx + s.u * r;
      const sy = cy + s.v * r;
      const d = Math.hypot(x - sx, y - sy);
      if (d < 48) {
        tx = x * 0.55 + sx * 0.45;
        ty = y * 0.55 + sy * 0.45;
        break;
      }
    }
    this.aim.x = tx;
    this.aim.y = ty;
  }

  onPointerUp() {
    if (!this.isCharging) return;
    this.isCharging = false;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { cx, cy, r } = this._getMoonGeometry(w, h);

    // Check proximity to any of the 3 Apollo sites + generous wave crest window
    let bestSite = null;
    let minDist = Infinity;
    for (const s of this.sites) {
      const sx = cx + s.u * r;
      const sy = cy + s.v * r;
      const d = Math.hypot(this.aim.x - sx, this.aim.y - sy);
      if (d < minDist) {
        minDist = d;
        bestSite = { site: s, sx, sy };
      }
    }

    // Forgiving timing & aim so first release feels magical
    const waveQuality = 1 - Math.abs(this.chargePhase - 0.72);
    const hitSite = bestSite && minDist < r * 0.34 && (waveQuality > 0.35 || !this.sites.some(s => s.lit));

    const targetX = hitSite ? bestSite.sx : this.aim.x;
    const targetY = hitSite ? bestSite.sy : this.aim.y;

    // Fire slender laser beam from observatory dome at bottom
    window.soundEngine.playLaserLaunch();
    this.beams.push({
      x0: w * 0.5,
      y0: h * 0.92,
      x1: targetX,
      y1: targetY,
      life: 1.0
    });

    // Queue 2.5-second light-travel time echo!
    this.pendingEchoes.push({
      timer: 2.5,
      site: hitSite ? bestSite.site : null,
      x: targetX,
      y: targetY
    });
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    if (this.isCharging) {
      this.chargePhase = (this.chargePhase + dt * 0.85) % 1.0;
    }

    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt * 2.2;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }

    // Process 2.5s light round-trip echoes
    for (let i = this.pendingEchoes.length - 1; i >= 0; i--) {
      const e = this.pendingEchoes[i];
      e.timer -= dt;
      if (e.timer <= 0) {
        this.pendingEchoes.splice(i, 1);
        if (e.site) {
          e.site.lit = true;
          e.site.glow = 1.0;
          e.site.echoes += 1;
          window.soundEngine.playGlassEcho(e.site.id);

          // Increment Global Space Engineer Network Counter
          const prev = Number(localStorage.getItem('vantalumen_lunar_pings') || '148920');
          localStorage.setItem('vantalumen_lunar_pings', String(prev + 1));

          this.echoRipples.push({ x: e.x, y: e.y, r: 4, alpha: 1.0 });

          // If all 3 Apollo retroreflectors have responded, play the 3-note signature motif!
          if (this.sites.every(s => s.lit) && !this.completed) {
            setTimeout(() => window.soundEngine.playSignatureMotif(4), 600);
          }
        }
      }
    }

    for (let i = this.echoRipples.length - 1; i >= 0; i--) {
      const rp = this.echoRipples[i];
      rp.r += dt * 75;
      rp.alpha -= dt * 0.55;
      if (rp.alpha <= 0) this.echoRipples.splice(i, 1);
    }

    for (const s of this.sites) {
      if (s.lit) {
        s.glow = Math.max(0.55, s.glow - dt * 0.25);
      }
    }

    const allLit = this.sites.every(s => s.lit);
    if ((this.elapsed >= this.duration || (allLit && this.elapsed > 14 && this.pendingEchoes.length === 0)) && !this.completed) {
      this.completed = true;
      this.host.completeCurrentGame();
    }
  }

  render(ctx, w, h) {
    // 1. Deep navy night sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#040814');
    sky.addColorStop(0.65, '#0b1528');
    sky.addColorStop(1, '#111c33');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 2. Starfield + Constellation of Signals
    const now = performance.now() * 0.001;
    for (const st of this.stars) {
      const tw = 0.4 + 0.6 * Math.sin(now * 2 + st.p);
      ctx.fillStyle = `rgba(226, 232, 240, ${tw * 0.65})`;
      ctx.beginPath();
      ctx.arc(st.x * w, st.y * h, st.s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Procedural Shader-like Moon with warm amber rim
    const { cx, cy, r } = this._getMoonGeometry(w, h);
    ctx.save();
    // Amber outer atmosphere halo
    const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.35);
    halo.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Moon sphere
    const moonGrad = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.25, r * 0.1, cx, cy, r);
    moonGrad.addColorStop(0, '#475569');
    moonGrad.addColorStop(0.7, '#1e293b');
    moonGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Subtle lunar mare craters
    ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
    const mares = [
      { x: 0.22, y: 0.02, rad: 0.24 },
      { x: -0.25, y: -0.15, rad: 0.28 },
      { x: -0.12, y: 0.22, rad: 0.18 },
      { x: 0.08, y: -0.26, rad: 0.19 }
    ];
    for (const m of mares) {
      ctx.beginPath();
      ctx.arc(cx + m.x * r, cy + m.y * r, m.rad * r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Amber rim stroke
    ctx.strokeStyle = 'rgba(252, 211, 77, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.85, Math.PI * 0.15);
    ctx.stroke();
    ctx.restore();

    // 4. Draw the 3 Apollo Retroreflector sites
    for (const s of this.sites) {
      const sx = cx + s.u * r;
      const sy = cy + s.v * r;

      // Faint pulse before discovery, warm amber star after echo returns
      const pulse = 0.4 + 0.6 * Math.sin(now * 3 + s.id * 2);
      if (s.lit) {
        const g = ctx.createRadialGradient(sx, sy, 1, sx, sy, 28);
        g.addColorStop(0, 'rgba(254, 243, 199, 1)');
        g.addColorStop(0.35, 'rgba(245, 158, 11, 0.75)');
        g.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, 28, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(252, 211, 77, ${0.22 + pulse * 0.28})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Connect lit retroreflectors into a golden lunar triangle
    const litSites = this.sites.filter(s => s.lit);
    if (litSites.length >= 2) {
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      litSites.forEach((s, i) => {
        const sx = cx + s.u * r;
        const sy = cy + s.v * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      if (litSites.length === 3) ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Echo Ripples returning from the Moon
    for (const rp of this.echoRipples) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${rp.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. Active Laser Beams
    for (const b of this.beams) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${b.life})`;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(b.x0, b.y0);
      ctx.lineTo(b.x1, b.y1);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 7. Atmospheric drifting reticle & wave-crest charge rings
    const driftX = Math.sin(now * 1.9) * 5;
    const driftY = Math.cos(now * 1.4) * 5;
    const rx = this.aim.x + driftX;
    const ry = this.aim.y + driftY;

    ctx.save();
    ctx.translate(rx, ry);
    // Outer target ring (crest target at radius 28)
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();

    if (this.isCharging) {
      const waveR = this.chargePhase * 38;
      const nearCrest = Math.abs(this.chargePhase - 0.72) < 0.18;
      ctx.strokeStyle = nearCrest ? '#fcd34d' : 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = nearCrest ? 3 : 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, waveR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 8. Observatory Dome Silhouette at bottom of screen
    ctx.fillStyle = '#03060c';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 1.02, w * 0.42, h * 0.14, 0, Math.PI, 0);
    ctx.fill();

    // 9. Ghost Hand before first gesture (pointing at Apollo 11 site)
    if (this.ghostAlpha > 0.01) {
      const gx = cx + this.sites[0].u * r;
      const gy = cy + this.sites[0].v * r;
      drawGhostHand(ctx, gx, gy, this.ghostAlpha, 1, Math.sin(now * 3) > 0);
    }
  }

  getSessionMetric() {
    const total = Number(localStorage.getItem('vantalumen_lunar_pings') || '148921');
    const litCount = this.sites.filter(s => s.lit).length;
    return `${litCount}/3 Gương Apollo • #${total.toLocaleString('vi-VN')} Ping`;
  }
}

/* ============================================================================
 * 3. ONE WHEEL LEFT — Một bánh còn lại (Spirit Rover Dragging Wheel & Silica)
 * ==========================================================================*/
class OneWheelLeftGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.duration = 32;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.85;

    this.roverX = 120;
    this.roverSpeed = 0;
    this.isPushing = false;
    this.continuousPushTime = 0;
    this.isBogged = false;
    this.shakeCount = 0;

    this.cameraZoomOut = 0; // 0 = close side view, 1 = orbital pull-back at sunset
    this.trenchPoints = [];
    this.noteMilestone = 180;
    this.noteIdx = 0;
  }

  onResize() {}

  _terrainHeight(worldX, h) {
    return (
      h * 0.68 +
      Math.sin(worldX * 0.0045) * 32 +
      Math.cos(worldX * 0.011) * 14
    );
  }

  onPointerDown() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
    }

    if (this.isBogged) {
      // Rhythmic tap to shake loose from soft sand (never Game Over!)
      this.shakeCount++;
      window.soundEngine.playPentatonicNote(1 + (this.shakeCount % 3), 0.14, 0.4, 0, 'triangle');
      if (this.shakeCount >= 3) {
        this.isBogged = false;
        this.continuousPushTime = 0;
        this.roverSpeed = 65;
      }
      return;
    }

    this.isPushing = true;
  }

  onPointerMove() {}

  onPointerUp() {
    this.isPushing = false;
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    const sunsetPhase = Math.max(0, (this.elapsed - (this.duration - 6)) / 6);
    if (sunsetPhase > 0) {
      this.cameraZoomOut = Math.min(1, sunsetPhase);
    }

    if (!this.isBogged && sunsetPhase < 0.7) {
      if (this.isPushing) {
        this.continuousPushTime += dt;
        this.roverSpeed = Math.min(115, this.roverSpeed + dt * 140);

        // Holding too long (> 4.2s) boggs the wheel into loose sand
        if (this.continuousPushTime > 4.2) {
          this.isBogged = true;
          this.isPushing = false;
          this.shakeCount = 0;
          this.roverSpeed = 0;
        }
      } else {
        this.continuousPushTime = Math.max(0, this.continuousPushTime - dt * 1.8);
        this.roverSpeed *= Math.pow(0.18, dt);
      }
    } else {
      this.roverSpeed *= Math.pow(0.08, dt);
    }

    this.roverX += this.roverSpeed * dt;

    // Carve glowing white-blue silica trench behind the dragged wheel
    if (this.roverSpeed > 8) {
      const last = this.trenchPoints[this.trenchPoints.length - 1];
      if (!last || this.roverX - last.x > 10) {
        this.trenchPoints.push({
          x: this.roverX - 28,
          glow: 1.0
        });
      }
    }

    // Play a music-box pentatonic note for each silica patch uncovered
    if (this.roverX >= this.noteMilestone) {
      this.noteMilestone += 110;
      window.soundEngine.playPentatonicNote(this.noteIdx % 8, 0.18, 1.5, 0, 'triangle');
      this.noteIdx++;
    }

    if (this.elapsed >= this.duration && !this.completed) {
      this.completed = true;
      window.soundEngine.playSignatureMotif(3);
      this.host.completeCurrentGame();
    }
  }

  render(ctx, w, h) {
    // 1. Martian Sunset Sky (Dusty Rose -> Teal Horizon -> Deep Indigo)
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
    sky.addColorStop(0, '#141229');
    sky.addColorStop(0.5, '#5b2c38');
    sky.addColorStop(0.82, '#28596b');
    sky.addColorStop(1, '#d97706');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Setting Sun on the Martian horizon
    const sunY = h * (0.42 + (this.elapsed / this.duration) * 0.24);
    const sunGrad = ctx.createRadialGradient(w * 0.72, sunY, 6, w * 0.72, sunY, 130);
    sunGrad.addColorStop(0, '#fef3c7');
    sunGrad.addColorStop(0.35, 'rgba(252, 211, 77, 0.55)');
    sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.72, sunY, 130, 0, Math.PI * 2);
    ctx.fill();

    // Camera zoom transform (pulls back toward orbit at the end)
    ctx.save();
    const zoom = 1 - this.cameraZoomOut * 0.48;
    ctx.translate(w * 0.5, h * 0.65);
    ctx.scale(zoom, zoom);
    ctx.translate(-w * 0.5, -h * 0.65);

    const camX = this.roverX - w * 0.45;

    // 2. Parallax Distant Ridges (Gusev Crater / Husband Hill)
    ctx.fillStyle = '#291a24';
    ctx.beginPath();
    ctx.moveTo(-w, h);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 40) {
      const wx = sx + camX * 0.25;
      const py = h * 0.56 + Math.sin(wx * 0.002) * 45 + Math.cos(wx * 0.005) * 20;
      ctx.lineTo(sx, py);
    }
    ctx.lineTo(w * 1.5, h);
    ctx.closePath();
    ctx.fill();

    // 3. Foreground Martian Plain
    ctx.fillStyle = '#3b1d16';
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h * 1.3);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 20) {
      const wx = sx + camX;
      const py = this._terrainHeight(wx, h);
      ctx.lineTo(sx, py);
    }
    ctx.lineTo(w * 1.5, h * 1.3);
    ctx.closePath();
    ctx.fill();

    // 4. Faint tracks of predecessors (visible during orbital pull-back)
    if (this.cameraZoomOut > 0.05) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${this.cameraZoomOut * 0.32})`;
      ctx.lineWidth = 3;
      for (const offset of [-65, 55, 115]) {
        ctx.beginPath();
        for (let sx = -w * 0.4; sx <= w * 1.4; sx += 30) {
          const wx = sx + camX;
          const py = this._terrainHeight(wx, h) + offset;
          if (sx === -w * 0.4) ctx.moveTo(sx, py);
          else ctx.lineTo(sx, py);
        }
        ctx.stroke();
      }
    }

    // 5. Luminous White-Blue Silica Trench carved by Spirit's dragged wheel
    if (this.trenchPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#a5f3fc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      this.trenchPoints.forEach((pt, idx) => {
        const sx = pt.x - camX;
        const sy = this._terrainHeight(pt.x, h) + 3;
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw Spirit Rover (driving backward, dragging its stuck front wheel)
    const rx = this.roverX - camX;
    const ry = this._terrainHeight(this.roverX, h);
    const nextY = this._terrainHeight(this.roverX + 10, h);
    const slopeAngle = Math.atan2(nextY - ry, 10);
    const bogSink = this.isBogged ? 7 : 0;
    const shakeOffset = this.isBogged ? Math.sin(performance.now() * 0.04) * 3 : 0;

    ctx.save();
    ctx.translate(rx + shakeOffset, ry + bogSink);
    ctx.rotate(slopeAngle);

    // Warm amber silhouette & rim light
    ctx.strokeStyle = '#fcd34d';
    ctx.fillStyle = '#1e293b';
    ctx.lineWidth = 2;

    // Rocker-bogie suspension legs
    ctx.beginPath();
    ctx.moveTo(-26, -6);
    ctx.lineTo(-14, -18);
    ctx.lineTo(18, -18);
    ctx.lineTo(26, -6);
    ctx.stroke();

    // Rover warm deck
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-24, -26, 48, 11);
    ctx.strokeRect(-24, -26, 48, 11);

    // Pancam mast (tilted slightly, looking back at its silica trench)
    ctx.beginPath();
    ctx.moveTo(14, -26);
    ctx.lineTo(18, -48);
    ctx.stroke();
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(11, -53, 14, 7);

    // 3 wheels: Left (-26) is the dragged broken wheel!
    const wheelRot = this.roverX * 0.08;
    const wheels = [
      { x: -26, broken: true },
      { x: 0, broken: false },
      { x: 26, broken: false }
    ];
    for (const wh of wheels) {
      ctx.save();
      ctx.translate(wh.x, -4);
      if (!wh.broken) ctx.rotate(wheelRot);
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = wh.broken ? '#67e8f9' : '#fcd34d';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Wheel cleat spokes
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.stroke();
      ctx.restore();
    }

    // Silica sparks kicking up under the dragged wheel (-26)
    if (this.roverSpeed > 15 || this.isBogged) {
      ctx.fillStyle = '#e0f2fe';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-30 - Math.random() * 14, -2 - Math.random() * 10, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.restore();

    // 7. Ghost Hand before first gesture
    if (this.ghostAlpha > 0.01) {
      drawGhostHand(ctx, w * 0.5, h * 0.76, this.ghostAlpha, 1, true);
    }
  }

  getSessionMetric() {
    const meters = Math.max(1.2, ((this.roverX - 120) * 0.045)).toFixed(1);
    return `${meters}m Rãnh Silica • ${this.noteIdx} Nốt phổ`;
  }
}

window.UnderTheDustGame = UnderTheDustGame;
window.StillThereGame = StillThereGame;
window.OneWheelLeftGame = OneWheelLeftGame;
