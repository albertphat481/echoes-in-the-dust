/**
 * VantaLumen — Minigames 1–3 (High-Craft Cinematic Edition)
 * 1. UNDER THE DUST: Photorealistic macro InSight UltraFlex Solar Wing + wind-rippled Martian dust
 * 2. STILL THERE: Procedural cratered Moon + atmospheric Milky Way + observatory laser scattering
 * 3. ONE WHEEL LEFT: Alto/Journey-inspired Martian canyon mesas + detailed Spirit Rover + glowing Silica
 */

function drawGhostHand(ctx, x, y, alpha, scale = 1, isHolding = false) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  const pulse = 0.85 + 0.15 * Math.sin(performance.now() * 0.006);
  ctx.beginPath();
  ctx.arc(0, 0, (isHolding ? 18 : 26) * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(254, 243, 199, 0.78)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  if (isHolding) {
    ctx.beginPath();
    ctx.arc(0, 0, 34 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(254, 243, 199, 0.92)';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.9)';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(254, 243, 199, 0.65)';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.quadraticCurveTo(6, 18, 17, 26);
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
    this.duration = 28;
    this.cleanRatio = 0;
    this.motifPlayed = false;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.88;

    this.heartbeatTimer = 0;
    this.heartPulseVisual = 0;

    this.sandGrains = [];
    this.windParticles = [];
    this.swirls = [];
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

    const pctx = this.panelCtx;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.min(w, h) * 0.37;
    this.panelGeometry = { cx, cy, radius };

    // 1. Martian Elysium Planitia Ground Backdrop with rocks & cast shadows
    const bgGrad = pctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, Math.max(w, h) * 0.85);
    bgGrad.addColorStop(0, '#2a1810');
    bgGrad.addColorStop(0.55, '#160e0b');
    bgGrad.addColorStop(1, '#06080f');
    pctx.fillStyle = bgGrad;
    pctx.fillRect(0, 0, w, h);

    // Procedural Martian pebbles outside the solar wing
    for (let i = 0; i < 95; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = radius * (1.06 + Math.random() * 0.85);
      const rx = cx + Math.cos(ang) * dist;
      const ry = cy + Math.sin(ang) * dist;
      const rw = 3 + Math.random() * 14;
      const rh = rw * (0.55 + Math.random() * 0.35);

      // Cast shadow from low Martian sun
      pctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      pctx.beginPath();
      pctx.ellipse(rx + 4, ry + 3, rw, rh, ang, 0, Math.PI * 2);
      pctx.fill();

      // Rock body with warm top rim
      const rGrad = pctx.createLinearGradient(rx - rw, ry - rh, rx + rw, ry + rh);
      rGrad.addColorStop(0, '#6b3b24');
      rGrad.addColorStop(1, '#1c100c');
      pctx.fillStyle = rGrad;
      pctx.beginPath();
      pctx.ellipse(rx, ry, rw, rh, ang, 0, Math.PI * 2);
      pctx.fill();
    }

    // 2. Drop shadow beneath the UltraFlex Decagonal Solar Wing
    pctx.save();
    pctx.translate(cx + 12, cy + 16);
    pctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
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
    pctx.fill();
    pctx.restore();

    // 3. Detailed InSight UltraFlex Decagonal Solar Array
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
    pctx.closePath();
    pctx.clip();

    // Rich Cobalt-Teal-Amber Photovoltaic Silicon Base
    const cellGrad = pctx.createLinearGradient(-radius, -radius, radius, radius);
    cellGrad.addColorStop(0, '#071b2e');
    cellGrad.addColorStop(0.35, '#0c3547');
    cellGrad.addColorStop(0.68, '#174954');
    cellGrad.addColorStop(1, '#3d250d');
    pctx.fillStyle = cellGrad;
    pctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    // Draw individual triangular sector wafers with micro-busbars
    for (let s = 0; s < sides; s++) {
      const a0 = (s / sides) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((s + 1) / sides) * Math.PI * 2 - Math.PI / 2;
      const aMid = (a0 + a1) * 0.5;

      // Subtle alternating wafer sheen per gore sector
      pctx.fillStyle = s % 2 === 0 ? 'rgba(56, 189, 248, 0.05)' : 'rgba(245, 158, 11, 0.04)';
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(Math.cos(a0) * radius, Math.sin(a0) * radius);
      pctx.lineTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
      pctx.closePath();
      pctx.fill();

      // Concentric gold solar-cell string traces inside each sector
      pctx.strokeStyle = 'rgba(252, 211, 77, 0.22)';
      pctx.lineWidth = 0.9;
      for (let ring = 0.24; ring < 0.96; ring += 0.12) {
        pctx.beginPath();
        pctx.moveTo(Math.cos(a0) * radius * ring, Math.sin(a0) * radius * ring);
        pctx.lineTo(Math.cos(a1) * radius * ring, Math.sin(a1) * radius * ring);
        pctx.stroke();
      }

      // Fine silver micro-fingers perpendicular to rings
      pctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
      pctx.lineWidth = 0.6;
      for (let f = -0.35; f <= 0.35; f += 0.175) {
        const fa = aMid + f * ((Math.PI * 2) / sides);
        pctx.beginPath();
        pctx.moveTo(Math.cos(fa) * radius * 0.2, Math.sin(fa) * radius * 0.2);
        pctx.lineTo(Math.cos(fa) * radius * 0.96, Math.sin(fa) * radius * 0.96);
        pctx.stroke();
      }
    }

    // 3D Beveled Carbon-Fiber Radial Spars
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const ex = Math.cos(a) * radius;
      const ey = Math.sin(a) * radius;

      // Spar shadow
      pctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      pctx.lineWidth = 5;
      pctx.beginPath();
      pctx.moveTo(2, 2);
      pctx.lineTo(ex + 2, ey + 2);
      pctx.stroke();

      // Spar amber metallic highlight
      pctx.strokeStyle = 'rgba(245, 158, 11, 0.72)';
      pctx.lineWidth = 2.2;
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(ex, ey);
      pctx.stroke();
    }

    // Diagonal glass specular reflection streak across the solar array
    const specGrad = pctx.createLinearGradient(-radius, -radius * 0.6, radius * 0.5, radius);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    specGrad.addColorStop(0.45, 'rgba(254, 243, 199, 0.08)');
    specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.16)');
    specGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.06)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pctx.fillStyle = specGrad;
    pctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    // Human assembly traces under the dust: wrench scratch & handwritten JPL serial stencil
    pctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
    pctx.lineWidth = 1.4;
    pctx.beginPath();
    pctx.moveTo(-radius * 0.46, -radius * 0.24);
    pctx.bezierCurveTo(-radius * 0.3, -radius * 0.3, -radius * 0.18, -radius * 0.14, -radius * 0.08, -radius * 0.26);
    pctx.stroke();

    pctx.font = '600 12px "JetBrains Mono", monospace';
    pctx.fillStyle = 'rgba(252, 211, 77, 0.6)';
    pctx.fillText('JPL-NSY-04 // ♥ E.K.', radius * 0.16, radius * 0.42);
    pctx.fillText('SN-1805-INSIGHT', -radius * 0.58, radius * 0.31);

    // Center Titanium Gimbal Hub with 8 machined bolts
    const hubR = radius * 0.15;
    const hubGrad = pctx.createRadialGradient(-hubR * 0.25, -hubR * 0.25, 2, 0, 0, hubR);
    hubGrad.addColorStop(0, '#475569');
    hubGrad.addColorStop(0.7, '#1e293b');
    hubGrad.addColorStop(1, '#090d16');
    pctx.beginPath();
    pctx.arc(0, 0, hubR, 0, Math.PI * 2);
    pctx.fillStyle = hubGrad;
    pctx.fill();
    pctx.strokeStyle = '#fcd34d';
    pctx.lineWidth = 2.4;
    pctx.stroke();

    for (let b = 0; b < 8; b++) {
      const ba = (b / 8) * Math.PI * 2;
      pctx.fillStyle = '#fcd34d';
      pctx.beginPath();
      pctx.arc(Math.cos(ba) * hubR * 0.68, Math.sin(ba) * hubR * 0.68, 2, 0, Math.PI * 2);
      pctx.fill();
    }
    pctx.restore();

    // Outer Gold-Anodized Perimeter Frame
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
    pctx.strokeStyle = 'rgba(245, 158, 11, 0.78)';
    pctx.lineWidth = 3.5;
    pctx.stroke();
    pctx.restore();

    // 4. Sculpted Wind-Swept Martian Dust Layer onto maskCanvas
    const mctx = this.maskCtx;
    mctx.globalCompositeOperation = 'source-over';
    const dustGrad = mctx.createLinearGradient(0, 0, w, h);
    dustGrad.addColorStop(0, '#6e3214');
    dustGrad.addColorStop(0.45, '#52240f');
    dustGrad.addColorStop(1, '#261108');
    mctx.fillStyle = dustGrad;
    mctx.fillRect(0, 0, w, h);

    // Wind-rippled Martian dune bands across the dust blanket
    for (let y = -40; y < h + 40; y += 22) {
      mctx.strokeStyle = y % 44 === 0 ? 'rgba(194, 88, 26, 0.22)' : 'rgba(20, 9, 4, 0.28)';
      mctx.lineWidth = 10;
      mctx.beginPath();
      for (let x = 0; x <= w; x += 40) {
        const wy = y + Math.sin(x * 0.012 + y * 0.04) * 9;
        if (x === 0) mctx.moveTo(x, wy);
        else mctx.lineTo(x, wy);
      }
      mctx.stroke();
    }

    // Fine mineral dust speckles
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 2.2 + 0.4;
      mctx.fillStyle = i % 3 === 0 ? 'rgba(217, 119, 6, 0.25)' : 'rgba(28, 12, 6, 0.34)';
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
      this._eraseDustAt(x, y, 56, 0.92);
      this.heartPulseVisual = 1.0;
      window.soundEngine.playHeartbeat(0.6);
      window.soundEngine.playPentatonicNote(2, 0.14, 1.2);
    } else {
      this._eraseDustAt(x, y, 38, 0.7);
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
      const radius = Math.min(84, 36 + speed * 28);
      this._eraseDustAt(x, y, radius, 0.68);

      window.soundEngine.setBrushWind(Math.min(1, speed * 0.65), Math.min(1, speed * 0.45));

      for (const g of this.sandGrains) {
        const dist = Math.hypot(g.x - x, g.y - y);
        if (dist < 160) {
          g.vx += vx * 0.58 + (Math.random() - 0.5) * 2.2;
          g.vy += vy * 0.58 + (Math.random() - 0.5) * 2.2;
          g.bouncing = true;
        }
      }

      // Luminous dust plume streaks
      for (let i = 0; i < 4; i++) {
        this.windParticles.push({
          x: x + (Math.random() - 0.5) * 32,
          y: y + (Math.random() - 0.5) * 32,
          vx: vx * 0.38 + (Math.random() - 0.5) * 1.6,
          vy: vy * 0.38 + (Math.random() - 0.5) * 1.6,
          life: 1.0,
          size: Math.random() * 3.2 + 1.4
        });
      }

      if (speed > 0.7 && this.swirls.length < 16) {
        this.swirls.push({ x, y, r: 10, alpha: 0.4, angle: Math.atan2(vy, vx) });
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
    const grad = mctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
    grad.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    mctx.fillStyle = grad;
    mctx.beginPath();
    mctx.arc(x, y, radius, 0, Math.PI * 2);
    mctx.fill();
    mctx.restore();

    const { cx, cy, radius: pr } = this.panelGeometry;
    const distFromPanel = Math.hypot(x - cx, y - cy);
    if (distFromPanel < pr * 1.15) {
      const areaGain = (radius * radius) / (pr * pr * 135);
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

    if (this.isDown) {
      this.holdTime += dt;
      if (this.holdTime > 0.25 && this.sandGrains.length < 95) {
        for (let i = 0; i < 2; i++) {
          this.sandGrains.push({
            x: this.pointer.x + (Math.random() - 0.5) * 28,
            y: this.pointer.y + (Math.random() - 0.5) * 28,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            bouncing: false,
            life: 6.0
          });
        }
      }
    }

    for (let i = this.sandGrains.length - 1; i >= 0; i--) {
      const g = this.sandGrains[i];
      g.x += g.vx;
      g.y += g.vy;
      g.vx *= 0.94;
      g.vy *= 0.94;
      g.life -= dt;

      const speed = Math.hypot(g.vx, g.vy);
      if (speed > 1.2) {
        this._eraseDustAt(g.x, g.y, 19, 0.85);
        window.soundEngine.playSandTick();
      }
      if (g.life <= 0) this.sandGrains.splice(i, 1);
    }

    for (let i = this.windParticles.length - 1; i >= 0; i--) {
      const p = this.windParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 1.4;
      if (p.life <= 0) this.windParticles.splice(i, 1);
    }

    for (let i = this.swirls.length - 1; i >= 0; i--) {
      const s = this.swirls[i];
      s.r += dt * 70;
      s.alpha -= dt * 0.9;
      if (s.alpha <= 0) this.swirls.splice(i, 1);
    }

    const sunsetProgress = Math.max(0, (this.elapsed - (this.duration - 6)) / 6);
    if (sunsetProgress > 0) {
      const mctx = this.maskCtx;
      mctx.save();
      mctx.globalCompositeOperation = 'source-over';
      mctx.fillStyle = `rgba(35, 16, 8, ${dt * 0.14})`;
      mctx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
      mctx.restore();
    }

    const vitality = sunsetProgress > 0
      ? Math.max(0.1, this.cleanRatio * (1 - sunsetProgress * 0.8))
      : this.cleanRatio;
    const beatInterval = 1.45 - vitality * 0.72;
    this.heartbeatTimer += dt;
    if (this.heartbeatTimer >= beatInterval) {
      this.heartbeatTimer = 0;
      this.heartPulseVisual = 1.0;
      window.soundEngine.playHeartbeat(vitality);
    }
    this.heartPulseVisual = Math.max(0, this.heartPulseVisual - dt * 2.8);

    if (this.elapsed >= this.duration && !this.completed) {
      this.completed = true;
      window.soundEngine.setBrushWind(0);
      if (!this.motifPlayed) window.soundEngine.playSignatureMotif(2);
      this.host.completeCurrentGame();
    }
  }

  render(ctx, w, h) {
    ctx.drawImage(this.panelCanvas, 0, 0);

    const { cx, cy, radius } = this.panelGeometry;
    const amberIntensity = this.cleanRatio * 0.6 + this.heartPulseVisual * 0.24;
    if (amberIntensity > 0.01) {
      ctx.save();
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius * 1.22);
      glow.addColorStop(0, `rgba(252, 211, 77, ${amberIntensity * 0.7})`);
      glow.addColorStop(0.55, `rgba(245, 158, 11, ${amberIntensity * 0.35})`);
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(this.maskCanvas, 0, 0);

    // Volumetric Martian Sunbeams
    const sunFade = Math.max(0, 1 - Math.max(0, (this.elapsed - 16) / 12));
    if (sunFade > 0.02) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const rayGrad = ctx.createLinearGradient(0, 0, w * 0.8, h * 0.85);
      rayGrad.addColorStop(0, `rgba(252, 211, 77, ${0.15 * sunFade})`);
      rayGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.06 * sunFade})`);
      rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.48, 0);
      ctx.lineTo(w, h * 0.9);
      ctx.lineTo(w * 0.22, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Wind Swirl arcs
    for (const s of this.swirls) {
      ctx.strokeStyle = `rgba(254, 243, 199, ${s.alpha})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, s.angle - 0.8, s.angle + 0.8);
      ctx.stroke();
    }

    // Saltating Sand Grains with tiny cast shadow
    for (const g of this.sandGrains) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.arc(g.x + 2, g.y + 2, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blowing Dust Motes
    for (const p of this.windParticles) {
      ctx.fillStyle = `rgba(251, 146, 60, ${p.life * 0.65})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heartbeat Pulse Ripple Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (0.15 + (1 - this.heartPulseVisual) * 0.26), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(252, 211, 77, ${this.heartPulseVisual * (0.35 + this.cleanRatio * 0.55)})`;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.restore();

    const dusk = Math.max(0, (this.elapsed - 18) / 10);
    if (dusk > 0) {
      ctx.fillStyle = `rgba(5, 8, 17, ${dusk * 0.65})`;
      ctx.fillRect(0, 0, w, h);
    }

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
 * 2. STILL THERE — Vẫn còn ở đó (High-Craft Lunar Observatory & 2.5s Laser Echo)
 * ==========================================================================*/
class StillThereGame {
  constructor(host) {
    this.host = host;
    this.moonCanvas = document.createElement('canvas');
    this.moonCtx = this.moonCanvas.getContext('2d');
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.duration = 34;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.88;

    this.sites = [
      { id: 0, u: 0.28, v: 0.06, lit: false, glow: 0, echoes: 0 },
      { id: 1, u: -0.22, v: 0.14, lit: false, glow: 0, echoes: 0 },
      { id: 2, u: 0.06, v: -0.28, lit: false, glow: 0, echoes: 0 }
    ];

    this.aim = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
    this.isCharging = false;
    this.chargePhase = 0;
    this.beams = [];
    this.pendingEchoes = [];
    this.echoRipples = [];

    this.stars = Array.from({ length: 210 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.88,
      s: Math.random() * 1.9 + 0.35,
      p: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.7 ? '#fcd34d' : (Math.random() > 0.5 ? '#bae6fd' : '#f8fafc')
    }));

    this._renderProceduralMoon();
  }

  _renderProceduralMoon() {
    const size = 512;
    this.moonCanvas.width = size;
    this.moonCanvas.height = size;
    const mctx = this.moonCtx;
    const c = size * 0.5;
    const r = size * 0.46;

    mctx.clearRect(0, 0, size, size);
    mctx.save();
    mctx.beginPath();
    mctx.arc(c, c, r, 0, Math.PI * 2);
    mctx.clip();

    // Base lunar regolith illumination gradient (sunlit from upper-left)
    const base = mctx.createRadialGradient(c - r * 0.35, c - r * 0.35, r * 0.08, c, c, r * 1.2);
    base.addColorStop(0, '#94a3b8');
    base.addColorStop(0.55, '#475569');
    base.addColorStop(0.88, '#1e293b');
    base.addColorStop(1, '#0b1120');
    mctx.fillStyle = base;
    mctx.fillRect(0, 0, size, size);

    // Lunar Maria (dark basalt plains)
    const maria = [
      { x: 0.25, y: 0.04, rx: 0.28, ry: 0.22, rot: 0.2 },
      { x: -0.26, y: -0.18, rx: 0.32, ry: 0.28, rot: -0.4 },
      { x: -0.14, y: 0.22, rx: 0.22, ry: 0.16, rot: 0.5 },
      { x: 0.06, y: -0.26, rx: 0.24, ry: 0.18, rot: 0.1 },
      { x: 0.36, y: -0.15, rx: 0.15, ry: 0.14, rot: 0 }
    ];
    for (const m of maria) {
      mctx.save();
      mctx.translate(c + m.x * r, c + m.y * r);
      mctx.rotate(m.rot);
      const mg = mctx.createRadialGradient(0, 0, 2, 0, 0, m.rx * r);
      mg.addColorStop(0, 'rgba(15, 23, 42, 0.58)');
      mg.addColorStop(0.7, 'rgba(15, 23, 42, 0.35)');
      mg.addColorStop(1, 'rgba(15, 23, 42, 0)');
      mctx.fillStyle = mg;
      mctx.beginPath();
      mctx.ellipse(0, 0, m.rx * r, m.ry * r, 0, 0, Math.PI * 2);
      mctx.fill();
      mctx.restore();
    }

    // 75 Realistic Shaded Impact Craters (bright rim + dark interior shadow)
    for (let i = 0; i < 75; i++) {
      const ang = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r * 0.92;
      const cx = c + Math.cos(ang) * d;
      const cy = c + Math.sin(ang) * d;
      const cr = 3 + Math.pow(Math.random(), 2.2) * 24;

      // Dark crater bowl shadow
      mctx.fillStyle = 'rgba(10, 15, 28, 0.36)';
      mctx.beginPath();
      mctx.arc(cx, cy, cr, 0, Math.PI * 2);
      mctx.fill();

      // Sunlit lower-right / upper-left rim highlight
      mctx.strokeStyle = 'rgba(226, 232, 240, 0.28)';
      mctx.lineWidth = Math.max(0.8, cr * 0.12);
      mctx.beginPath();
      mctx.arc(cx, cy, cr, -Math.PI * 0.9, -Math.PI * 0.1);
      mctx.stroke();
    }

    // Tycho-style bright ejecta ray burst near bottom
    mctx.strokeStyle = 'rgba(226, 232, 240, 0.14)';
    mctx.lineWidth = 1.2;
    const tx = c - r * 0.15;
    const ty = c + r * 0.52;
    for (let ray = 0; ray < 9; ray++) {
      const ra = (ray / 9) * Math.PI * 2;
      mctx.beginPath();
      mctx.moveTo(tx, ty);
      mctx.lineTo(tx + Math.cos(ra) * r * 0.35, ty + Math.sin(ra) * r * 0.35);
      mctx.stroke();
    }

    // Warm Amber Terminator Rim Glow
    mctx.strokeStyle = 'rgba(252, 211, 77, 0.55)';
    mctx.lineWidth = 4;
    mctx.beginPath();
    mctx.arc(c, c, r - 1, -Math.PI * 0.85, Math.PI * 0.15);
    mctx.stroke();

    mctx.restore();
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
    if (!this.hasInteracted) this.hasInteracted = true;
  }

  onPointerMove(x, y) {
    const { cx, cy, r } = this._getMoonGeometry(window.innerWidth, window.innerHeight);
    let tx = x;
    let ty = y;
    for (const s of this.sites) {
      const sx = cx + s.u * r;
      const sy = cy + s.v * r;
      if (Math.hypot(x - sx, y - sy) < 64) {
        tx = x * 0.48 + sx * 0.52;
        ty = y * 0.48 + sy * 0.52;
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

    const waveQuality = 1 - Math.abs(this.chargePhase - 0.72);
    const hitSite = bestSite && minDist < r * 0.42 && (waveQuality > 0.25 || !this.sites.some(s => s.lit));

    const targetX = hitSite ? bestSite.sx : this.aim.x;
    const targetY = hitSite ? bestSite.sy : this.aim.y;

    window.soundEngine.playLaserLaunch();
    this.beams.push({
      x0: w * 0.5,
      y0: h * 0.9,
      x1: targetX,
      y1: targetY,
      life: 1.0
    });

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
      this.beams[i].life -= dt * 2.0;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }

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

          const prev = Number(localStorage.getItem('vantalumen_lunar_pings') || '148920');
          localStorage.setItem('vantalumen_lunar_pings', String(prev + 1));

          this.echoRipples.push({ x: e.x, y: e.y, r: 4, alpha: 1.0 });

          if (this.sites.every(s => s.lit) && !this.completed) {
            setTimeout(() => window.soundEngine.playSignatureMotif(4), 600);
          }
        }
      }
    }

    for (let i = this.echoRipples.length - 1; i >= 0; i--) {
      const rp = this.echoRipples[i];
      rp.r += dt * 75;
      rp.alpha -= dt * 0.5;
      if (rp.alpha <= 0) this.echoRipples.splice(i, 1);
    }

    for (const s of this.sites) {
      if (s.lit) s.glow = Math.max(0.55, s.glow - dt * 0.25);
    }

    const allLit = this.sites.every(s => s.lit);
    if ((this.elapsed >= this.duration || (allLit && this.elapsed > 14 && this.pendingEchoes.length === 0)) && !this.completed) {
      this.completed = true;
      this.host.completeCurrentGame();
    }
  }

  render(ctx, w, h) {
    // 1. Deep Navy Night Sky + Milky Way Nebula Band
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#02050d');
    sky.addColorStop(0.55, '#071022');
    sky.addColorStop(1, '#0f1b33');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Subtle diagonal Milky Way glow
    ctx.save();
    const neb = ctx.createLinearGradient(0, h * 0.1, w, h * 0.7);
    neb.addColorStop(0, 'rgba(56, 189, 248, 0)');
    neb.addColorStop(0.5, 'rgba(56, 189, 248, 0.065)');
    neb.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 2. Twinkling Colored Starfield
    const now = performance.now() * 0.001;
    for (const st of this.stars) {
      const tw = 0.35 + 0.65 * Math.sin(now * 2.2 + st.p);
      ctx.globalAlpha = tw * 0.8;
      ctx.fillStyle = st.hue;
      ctx.beginPath();
      ctx.arc(st.x * w, st.y * h, st.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Detailed Procedural Moon with Atmospheric Amber Corona
    const { cx, cy, r } = this._getMoonGeometry(w, h);
    const halo = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.45);
    halo.addColorStop(0, 'rgba(245, 158, 11, 0.24)');
    halo.addColorStop(0.6, 'rgba(56, 189, 248, 0.06)');
    halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.45, 0, Math.PI * 2);
    ctx.fill();

    // Blit high-res procedural cratered Moon sprite
    const drawR = r / 0.46;
    ctx.drawImage(this.moonCanvas, cx - drawR * 0.5, cy - drawR * 0.5, drawR, drawR);

    // 4. Apollo Retroreflector Sites & Constellation Lines
    for (const s of this.sites) {
      const sx = cx + s.u * r;
      const sy = cy + s.v * r;
      const pulse = 0.4 + 0.6 * Math.sin(now * 3 + s.id * 2);

      if (s.lit) {
        const g = ctx.createRadialGradient(sx, sy, 1, sx, sy, 32);
        g.addColorStop(0, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.28, 'rgba(252, 211, 77, 0.85)');
        g.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, 32, 0, Math.PI * 2);
        ctx.fill();

        // 4-point star flare on lit Apollo mirrors
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx - 11, sy); ctx.lineTo(sx + 11, sy);
        ctx.moveTo(sx, sy - 11); ctx.lineTo(sx, sy + 11);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(252, 211, 77, ${0.25 + pulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const litSites = this.sites.filter(s => s.lit);
    if (litSites.length >= 2) {
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.48)';
      ctx.lineWidth = 1.4;
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

    // 5. Echo Ripples
    for (const rp of this.echoRipples) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${rp.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. Active Laser Beams + Atmospheric Scattering Cone + 2.5s Traveling Photon Pulse
    for (const b of this.beams) {
      ctx.save();
      // Atmospheric beam scatter halo
      ctx.strokeStyle = `rgba(245, 158, 11, ${b.life * 0.25})`;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(b.x0, b.y0);
      ctx.lineTo(b.x1, b.y1);
      ctx.stroke();

      // Core laser filament
      ctx.strokeStyle = `rgba(254, 243, 199, ${b.life})`;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(b.x0, b.y0);
      ctx.lineTo(b.x1, b.y1);
      ctx.stroke();
      ctx.restore();
    }

    for (const e of this.pendingEchoes) {
      const progress = 1 - e.timer / 2.5;
      const isOutbound = progress < 0.5;
      const t = isOutbound ? progress * 2 : (1 - progress) * 2;
      const px = w * 0.5 + (e.x - w * 0.5) * t;
      const py = h * 0.9 + (e.y - h * 0.9) * t;
      ctx.save();
      ctx.fillStyle = isOutbound ? '#fef3c7' : (e.site ? '#fcd34d' : 'rgba(148,163,184,0.4)');
      ctx.shadowColor = isOutbound ? '#f59e0b' : '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(px, py, isOutbound ? 3.5 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Aerospace Telemetry Reticle
    const driftX = Math.sin(now * 1.9) * 5;
    const driftY = Math.cos(now * 1.4) * 5;
    const rx = this.aim.x + driftX;
    const ry = this.aim.y + driftY;

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(now * 0.35);
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (this.isCharging) {
      const waveR = this.chargePhase * 38;
      const nearCrest = Math.abs(this.chargePhase - 0.72) < 0.18;
      ctx.strokeStyle = nearCrest ? '#fcd34d' : 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = nearCrest ? 3.2 : 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, waveR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 8. Detailed Observatory Dome Silhouette & Telescope Barrel at bottom
    ctx.save();
    ctx.fillStyle = '#03060d';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 1.02, w * 0.38, h * 0.12, 0, Math.PI, 0);
    ctx.fill();
    // Telescope slit & barrel pointing at aim
    const aimAngle = Math.atan2(ry - h * 0.9, rx - w * 0.5);
    ctx.translate(w * 0.5, h * 0.92);
    ctx.rotate(aimAngle);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(0, -6, 38, 12);
    ctx.strokeRect(0, -6, 38, 12);
    ctx.restore();

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
 * 3. ONE WHEEL LEFT — Một bánh còn lại (Spirit Rover, Martian Mesas & Silica)
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
    this.ghostAlpha = 0.88;

    this.roverX = 120;
    this.roverSpeed = 0;
    this.isPushing = false;
    this.continuousPushTime = 0;
    this.isBogged = false;
    this.shakeCount = 0;

    this.cameraZoomOut = 0;
    this.trenchPoints = [];
    this.silicaSparkles = [];
    this.noteMilestone = 180;
    this.noteIdx = 0;
  }

  onResize() {}

  _terrainHeight(worldX, h) {
    return (
      h * 0.69 +
      Math.sin(worldX * 0.0045) * 30 +
      Math.cos(worldX * 0.011) * 14
    );
  }

  onPointerDown() {
    if (!this.hasInteracted) this.hasInteracted = true;

    if (this.isBogged) {
      this.shakeCount++;
      window.soundEngine.playPentatonicNote(1 + (this.shakeCount % 3), 0.14, 0.4, 0, 'triangle');
      if (this.shakeCount >= 2) {
        this.isBogged = false;
        this.continuousPushTime = 0;
        this.roverSpeed = 72;
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
        this.roverSpeed = Math.min(120, this.roverSpeed + dt * 150);

        if (this.continuousPushTime > 5.5) {
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
    if (this.roverSpeed > 18) window.soundEngine.playGravelCrunch();

    if (this.roverSpeed > 8) {
      const last = this.trenchPoints[this.trenchPoints.length - 1];
      if (!last || this.roverX - last.x > 10) {
        this.trenchPoints.push({ x: this.roverX - 30, glow: 1.0 });
        this.silicaSparkles.push({
          x: this.roverX - 30,
          vy: -18 - Math.random() * 25,
          yOff: 0,
          life: 1.0
        });
      }
    }

    for (let i = this.silicaSparkles.length - 1; i >= 0; i--) {
      const sp = this.silicaSparkles[i];
      sp.yOff += sp.vy * dt;
      sp.life -= dt * 0.8;
      if (sp.life <= 0) this.silicaSparkles.splice(i, 1);
    }

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
    // 1. Atmospheric Martian Sunset Sky (Indigo -> Dusty Rose -> Teal Horizon -> Amber Glow)
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.74);
    sky.addColorStop(0, '#0c0b1d');
    sky.addColorStop(0.45, '#4c2335');
    sky.addColorStop(0.78, '#265466');
    sky.addColorStop(1, '#e07a19');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Subtle twilight stars & tiny Martian moon Phobos
    ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
    ctx.beginPath();
    ctx.arc(w * 0.22, h * 0.18, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Setting Martian Sun (iconic cool-blue core halo on Mars!)
    const sunY = h * (0.43 + (this.elapsed / this.duration) * 0.23);
    const sunGrad = ctx.createRadialGradient(w * 0.74, sunY, 5, w * 0.74, sunY, 150);
    sunGrad.addColorStop(0, '#f0f9ff');
    sunGrad.addColorStop(0.18, '#bae6fd');
    sunGrad.addColorStop(0.45, 'rgba(252, 211, 77, 0.42)');
    sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.74, sunY, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const zoom = 1 - this.cameraZoomOut * 0.48;
    ctx.translate(w * 0.5, h * 0.65);
    ctx.scale(zoom, zoom);
    ctx.translate(-w * 0.5, -h * 0.65);

    const camX = this.roverX - w * 0.45;

    // 2a. Far Mesa Canyon Silhouettes (Columbia Hills)
    ctx.fillStyle = '#241727';
    ctx.beginPath();
    ctx.moveTo(-w, h);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 55) {
      const wx = sx + camX * 0.12;
      const py = h * 0.49 + Math.sin(wx * 0.0015) * 48 + Math.cos(wx * 0.004) * 15;
      ctx.lineTo(sx, py);
    }
    ctx.lineTo(w * 1.5, h);
    ctx.closePath();
    ctx.fill();

    // 2b. Mid Dunes Layer
    ctx.fillStyle = '#361a24';
    ctx.beginPath();
    ctx.moveTo(-w, h);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 40) {
      const wx = sx + camX * 0.3;
      const py = h * 0.58 + Math.sin(wx * 0.0024) * 34 + Math.cos(wx * 0.006) * 14;
      ctx.lineTo(sx, py);
    }
    ctx.lineTo(w * 1.5, h);
    ctx.closePath();
    ctx.fill();

    // 3. Foreground Sculpted Martian Regolith Plain with sunlit top rim
    const groundGrad = ctx.createLinearGradient(0, h * 0.65, 0, h * 1.2);
    groundGrad.addColorStop(0, '#54261a');
    groundGrad.addColorStop(0.35, '#331712');
    groundGrad.addColorStop(1, '#12090a');
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h * 1.3);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 18) {
      const wx = sx + camX;
      const py = this._terrainHeight(wx, h);
      ctx.lineTo(sx, py);
    }
    ctx.lineTo(w * 1.5, h * 1.3);
    ctx.closePath();
    ctx.fill();

    // Sunlit ridge stroke
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 18) {
      const wx = sx + camX;
      const py = this._terrainHeight(wx, h);
      if (sx === -w * 0.5) ctx.moveTo(sx, py);
      else ctx.lineTo(sx, py);
    }
    ctx.stroke();

    // 4. Predecessors' Tracks during orbital pull-back
    if (this.cameraZoomOut > 0.05) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${this.cameraZoomOut * 0.35})`;
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

    // 5. Luminous White-Blue Silica Trench & Floating Crystal Sparkles
    if (this.trenchPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#a5f3fc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 6.5;
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

    for (const sp of this.silicaSparkles) {
      ctx.fillStyle = `rgba(165, 243, 252, ${sp.life * 0.85})`;
      ctx.beginPath();
      ctx.arc(sp.x - camX, this._terrainHeight(sp.x, h) + sp.yOff, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Detailed NASA Spirit Rover (MER-A)
    const rx = this.roverX - camX;
    const ry = this._terrainHeight(this.roverX, h);
    const nextY = this._terrainHeight(this.roverX + 10, h);
    const slopeAngle = Math.atan2(nextY - ry, 10);
    const bogSink = this.isBogged ? 7 : 0;
    const shakeOffset = this.isBogged ? Math.sin(performance.now() * 0.04) * 3 : 0;

    ctx.save();
    ctx.translate(rx + shakeOffset, ry + bogSink);
    ctx.rotate(slopeAngle);

    // Long dramatic Martian sunset ground shadow
    ctx.fillStyle = 'rgba(8, 5, 10, 0.65)';
    ctx.beginPath();
    ctx.ellipse(-20, 4, 52, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Titanium Rocker-Bogie Suspension Frame
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-28, -6); ctx.lineTo(-15, -20); ctx.lineTo(0, -10);
    ctx.moveTo(-15, -20); ctx.lineTo(18, -20); ctx.lineTo(28, -6);
    ctx.stroke();

    // Gold-Foil Warm Electronics Box + Angled Solar Wing Deck
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-20, -30, 40, 12);
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-20, -30, 40, 12);

    // Solar Deck Wing Plate
    ctx.fillStyle = '#0f2942';
    ctx.beginPath();
    ctx.moveTo(-30, -31); ctx.lineTo(30, -31); ctx.lineTo(24, -27); ctx.lineTo(-24, -27);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // High-Gain Dish Antenna at rear
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-14, -31); ctx.lineTo(-20, -45);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-22, -46, 8, -Math.PI * 0.75, Math.PI * 0.25);
    ctx.stroke();

    // Pancam Stereo Mast looking back toward its Silica discovery
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(14, -31); ctx.lineTo(18, -56);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(10, -63, 17, 9);
    // Glowing cyan Pancam lens eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(13, -58.5, 2.2, 0, Math.PI * 2);
    ctx.arc(21, -58.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 3 Detailed Machined Wheels (-28 is the dragged stuck wheel!)
    const wheelRot = this.roverX * 0.08;
    const wheels = [
      { x: -28, broken: true },
      { x: 0, broken: false },
      { x: 28, broken: false }
    ];
    for (const wh of wheels) {
      ctx.save();
      ctx.translate(wh.x, -4);
      if (!wh.broken) ctx.rotate(wheelRot);
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#090d16';
      ctx.fill();
      ctx.strokeStyle = wh.broken ? '#67e8f9' : '#fcd34d';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Wheel cleats
      ctx.lineWidth = 1.4;
      for (let sp = 0; sp < 4; sp++) {
        const a = (sp / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * -8, Math.sin(a) * -8);
        ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Silica dust plumes kicking up under dragged wheel
    if (this.roverSpeed > 15 || this.isBogged) {
      ctx.fillStyle = 'rgba(165, 243, 252, 0.8)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-32 - Math.random() * 18, -2 - Math.random() * 12, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.restore();

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
