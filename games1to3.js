/**
 * VantaLumen — Minigames 1–3 (Rebuilt High-Craft Responsive Edition)
 * 1. UNDER THE DUST: Responsive velvet wind brush + saltation vortex + golden orbital solar-charge ring
 * 2. STILL THERE: Precision magnetic reticle + 3 visible Apollo beacon glints + fast photonic echo constellation
 * 3. ONE WHEEL LEFT: Friction-free smooth Spirit Rover driving (Arrow/WASD/Mouse/Space) toward Sunset Silica Crest
 */

function drawGhostHand(ctx, x, y, alpha, scale = 1, isHolding = false) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha * 0.85;

  const pulse = 0.92 + 0.08 * Math.sin(performance.now() * 0.004);
  const s = (isHolding ? 13 : 17) * pulse;
  const arm = 5;

  ctx.strokeStyle = 'rgba(248, 250, 252, 0.72)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // 4 precision corner brackets (zero curved tail!)
  [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1]
  ].forEach(([dx, dy]) => {
    ctx.moveTo(dx * s, dy * (s - arm));
    ctx.lineTo(dx * s, dy * s);
    ctx.lineTo(dx * (s - arm), dy * s);
  });
  ctx.stroke();

  ctx.fillStyle = 'rgba(253, 230, 138, 0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ============================================================================
 * 1. UNDER THE DUST — Nhịp tim dưới lớp bụi (InSight Solar Wing & Saltation)
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
    this.fallbackDuration = 18;
    this.targetClean = 0.44;
    this.cleanRatio = 0;
    this.goalReached = false;
    this.finaleTimer = 0;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.9;

    this.heartbeatTimer = 0;
    this.heartPulseVisual = 0;

    this.sandGrains = [];
    this.windParticles = [];
    this.swirls = [];
    this.vortexAngle = 0;
    this.isDown = false;
    this.pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, vx: 0, vy: 0 };

    this.stars = window.VantaGfx ? window.VantaGfx.createStarfield(165, 0.31) : [];
    this.constellations = [
      {
        color: 'rgba(252, 211, 77, 0.56)',
        starColor: '#fef3c7',
        nodes: [
          { x: 0.08, y: 0.14, r: 2.3 },
          { x: 0.13, y: 0.19, r: 1.9 },
          { x: 0.19, y: 0.15, r: 2.6 },
          { x: 0.24, y: 0.22, r: 2.1 },
          { x: 0.30, y: 0.17, r: 2.4 },
          { x: 0.21, y: 0.09, r: 1.7 }
        ],
        edges: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5]]
      },
      {
        color: 'rgba(251, 191, 146, 0.52)',
        starColor: '#ffedd5',
        nodes: [
          { x: 0.70, y: 0.13, r: 2.5 },
          { x: 0.76, y: 0.10, r: 2.0 },
          { x: 0.83, y: 0.14, r: 2.2 },
          { x: 0.79, y: 0.20, r: 2.6 },
          { x: 0.74, y: 0.23, r: 1.9 },
          { x: 0.87, y: 0.21, r: 2.3 },
          { x: 0.92, y: 0.13, r: 2.0 }
        ],
        edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [3, 5], [5, 6], [2, 6]]
      },
      {
        color: 'rgba(253, 186, 116, 0.45)',
        starColor: '#fed7aa',
        nodes: [
          { x: 0.39, y: 0.22, r: 1.8 },
          { x: 0.46, y: 0.24, r: 2.1 },
          { x: 0.54, y: 0.23, r: 2.0 },
          { x: 0.61, y: 0.21, r: 1.8 }
        ],
        edges: [[0, 1], [1, 2], [2, 3]]
      }
    ];

    this._initCanvases();
  }

  _traceMarsRidge(ctx, w, horizonY, closeBottom = false, h = 0) {
    ctx.beginPath();
    ctx.moveTo(0, horizonY + Math.sin(0.4) * 7);
    const steps = 28;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = t * w;
      const ridge = Math.sin(t * Math.PI * 2.4 + 0.4) * 8 + Math.cos(t * Math.PI * 5.2) * 3.5 - Math.sin(t * Math.PI) * 14;
      ctx.lineTo(x, horizonY + ridge);
    }
    if (closeBottom) {
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
    }
  }

  _initCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.maskCanvas.width = w;
    this.maskCanvas.height = h;
    this.panelCanvas.width = w;
    this.panelCanvas.height = h;

    const pctx = this.panelCtx;
    const horizonY = Math.round(h * 0.29);
    const cx = w * 0.5;
    const cy = h * 0.59;
    const tiltY = 0.74;
    const radius = Math.min(w, h) * (w < 640 ? 0.33 : 0.30);
    this.panelGeometry = { cx, cy, radius, horizonY, tiltY };

    // 0. Authentic Martian Twilight Sky above Elysium Planitia (dusty plum-rose -> burnt copper dusk)
    const skyGrad = pctx.createLinearGradient(0, 0, 0, horizonY + 26);
    skyGrad.addColorStop(0, '#07040d');
    skyGrad.addColorStop(0.55, '#1d0d19');
    skyGrad.addColorStop(0.84, '#3f1916');
    skyGrad.addColorStop(1, '#5b2416');
    pctx.fillStyle = skyGrad;
    pctx.fillRect(0, 0, w, h);

    // Distant hazy Martian mesa silhouette layer behind main ridge
    pctx.save();
    this._traceMarsRidge(pctx, w, horizonY - 11, true, horizonY + 40);
    pctx.fillStyle = 'rgba(42, 17, 17, 0.82)';
    pctx.fill();
    pctx.restore();

    // 1. Elysium Planitia Twilight Ground with Regolith Micro-Grain (clipped below Martian dune ridge)
    pctx.save();
    this._traceMarsRidge(pctx, w, horizonY, true, h);
    pctx.clip();

    const bgGrad = pctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, Math.max(w, h) * 0.85);
    bgGrad.addColorStop(0, '#3a1f15');
    bgGrad.addColorStop(0.55, '#190f0e');
    bgGrad.addColorStop(1, '#08070c');
    pctx.fillStyle = bgGrad;
    pctx.fillRect(0, horizonY - 28, w, h - horizonY + 28);

    // Warm atmospheric dust transition mist softening the ridge into foreground regolith
    const mistGrad = pctx.createLinearGradient(0, horizonY - 18, 0, horizonY + 52);
    mistGrad.addColorStop(0, 'rgba(92, 38, 22, 0.65)');
    mistGrad.addColorStop(1, 'rgba(58, 31, 21, 0)');
    pctx.fillStyle = mistGrad;
    pctx.fillRect(0, horizonY - 18, w, 70);

    if (window.VantaGfx) {
      const grain = window.VantaGfx.getGrainPattern(pctx, 0.08, true);
      if (grain) {
        pctx.fillStyle = grain;
        pctx.fillRect(0, horizonY - 28, w, h - horizonY + 28);
      }
    }

    // Weathered Martian basalt rocks & wind-eroded dust tails
    for (let i = 0; i < 64; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = radius * (1.07 + Math.random() * 0.85);
      const rx = cx + Math.cos(ang) * dist;
      const ry = cy + Math.sin(ang) * dist * tiltY;
      if (ry < horizonY + 18) continue;
      const rw = 4 + Math.random() * 14;
      const rh = rw * (0.52 + Math.random() * 0.35);

      // Wind-tail drift shadow
      pctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
      pctx.beginPath();
      pctx.ellipse(rx + rw * 0.45, ry + rh * 0.3, rw * 1.15, rh * 0.85, 0.2, 0, Math.PI * 2);
      pctx.fill();

      // Faceted rock polygon
      pctx.save();
      pctx.translate(rx, ry);
      pctx.rotate(ang);
      const rGrad = pctx.createLinearGradient(-rw, -rh, rw, rh);
      rGrad.addColorStop(0, '#9a5233');
      rGrad.addColorStop(0.5, '#562b1a');
      rGrad.addColorStop(1, '#1a0e0b');
      pctx.fillStyle = rGrad;
      pctx.beginPath();
      const pts = 7;
      for (let k = 0; k < pts; k++) {
        const ka = (k / pts) * Math.PI * 2;
        const kr = 0.78 + 0.32 * (window.VantaGfx ? window.VantaGfx.hash2(i, k, 51) : Math.random());
        const px = Math.cos(ka) * rw * kr;
        const py = Math.sin(ka) * rh * kr;
        if (k === 0) pctx.moveTo(px, py);
        else pctx.lineTo(px, py);
      }
      pctx.closePath();
      pctx.fill();
      pctx.strokeStyle = 'rgba(253, 186, 116, 0.16)';
      pctx.lineWidth = 0.8;
      pctx.stroke();
      pctx.restore();
    }
    pctx.restore();

    // 2. Solar Wing Drop Shadow (matching 3/4 Martian plain perspective)
    pctx.save();
    pctx.translate(cx + 12, cy + 14);
    pctx.scale(1, tiltY);
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

    // 3. InSight UltraFlex Decagonal Solar Wing
    pctx.save();
    pctx.translate(cx, cy);
    pctx.scale(1, tiltY);
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

    const waferGrad = pctx.createRadialGradient(-radius * 0.28, -radius * 0.28, 12, 0, 0, radius);
    waferGrad.addColorStop(0, '#224f88');
    waferGrad.addColorStop(0.55, '#112a4f');
    waferGrad.addColorStop(1, '#071225');
    pctx.fillStyle = waferGrad;
    pctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    // Copper-gold photovoltaic traces
    pctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
    pctx.lineWidth = 1;
    for (let ring = 0.25; ring <= 0.92; ring += 0.14) {
      pctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * radius * ring;
        const py = Math.sin(a) * radius * ring;
        if (i === 0) pctx.moveTo(px, py);
        else pctx.lineTo(px, py);
      }
      pctx.stroke();
    }

    pctx.strokeStyle = 'rgba(125, 211, 252, 0.14)';
    pctx.lineWidth = 0.9;
    for (let g = -radius; g <= radius; g += 22) {
      pctx.beginPath();
      pctx.moveTo(-radius, g);
      pctx.lineTo(radius, g);
      pctx.stroke();
    }

    // 10 Spoke Spars
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const ex = Math.cos(a) * radius;
      const ey = Math.sin(a) * radius;

      pctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      pctx.lineWidth = 5;
      pctx.beginPath();
      pctx.moveTo(2, 2);
      pctx.lineTo(ex + 2, ey + 2);
      pctx.stroke();

      pctx.strokeStyle = 'rgba(251, 191, 36, 0.78)';
      pctx.lineWidth = 2.2;
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(ex, ey);
      pctx.stroke();
    }

    // Glass specular streak
    const specGrad = pctx.createLinearGradient(-radius, -radius * 0.6, radius * 0.5, radius);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    specGrad.addColorStop(0.47, 'rgba(254, 243, 199, 0.1)');
    specGrad.addColorStop(0.51, 'rgba(255, 255, 255, 0.22)');
    specGrad.addColorStop(0.56, 'rgba(56, 189, 248, 0.08)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pctx.fillStyle = specGrad;
    pctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    pctx.font = '600 11.5px "JetBrains Mono", monospace';
    pctx.fillStyle = 'rgba(252, 211, 77, 0.68)';
    pctx.fillText('JPL-NSY-04 // ♥ E.K.', radius * 0.16, radius * 0.42);
    pctx.fillText('SN-1805-INSIGHT', -radius * 0.58, radius * 0.31);

    // Center Gimbal Spindle (machined dark titanium, no stove-burner yellow dots)
    const hubR = radius * 0.13;
    const hubGrad = pctx.createRadialGradient(-hubR * 0.25, -hubR * 0.25, 2, 0, 0, hubR);
    hubGrad.addColorStop(0, '#475569');
    hubGrad.addColorStop(0.65, '#1e293b');
    hubGrad.addColorStop(1, '#090d16');
    pctx.beginPath();
    pctx.arc(0, 0, hubR, 0, Math.PI * 2);
    pctx.fillStyle = hubGrad;
    pctx.fill();
    pctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
    pctx.lineWidth = 1.2;
    pctx.stroke();

    pctx.beginPath();
    pctx.arc(0, 0, hubR * 0.42, 0, Math.PI * 2);
    pctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    pctx.lineWidth = 0.9;
    pctx.stroke();
    pctx.restore();

    // Anodized Perimeter Frame
    pctx.save();
    pctx.translate(cx, cy);
    pctx.scale(1, tiltY);
    pctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      if (i === 0) pctx.moveTo(px, py);
      else pctx.lineTo(px, py);
    }
    pctx.strokeStyle = 'rgba(217, 119, 6, 0.55)';
    pctx.lineWidth = 2.2;
    pctx.stroke();
    pctx.restore();

    // 4. Sculpted Wind-Swept Martian Dust Mask (softly feathered over dune ridge)
    const mctx = this.maskCtx;
    mctx.clearRect(0, 0, w, h);
    mctx.save();
    this._traceMarsRidge(mctx, w, horizonY, true, h);
    mctx.clip();

    mctx.globalCompositeOperation = 'source-over';
    const dustGrad = mctx.createLinearGradient(0, horizonY - 16, 0, h);
    dustGrad.addColorStop(0, 'rgba(92, 42, 20, 0)');
    dustGrad.addColorStop(0.10, 'rgba(84, 38, 18, 0.88)');
    dustGrad.addColorStop(0.45, 'rgba(64, 28, 13, 0.94)');
    dustGrad.addColorStop(1, 'rgba(32, 14, 8, 0.96)');
    mctx.fillStyle = dustGrad;
    mctx.fillRect(0, horizonY - 28, w, h - horizonY + 28);

    if (window.VantaGfx) {
      const dw = Math.max(64, Math.floor(w * 0.25));
      const dh = Math.max(64, Math.floor(h * 0.25));
      const dc = document.createElement('canvas');
      dc.width = dw;
      dc.height = dh;
      const dctx = dc.getContext('2d');
      const img = dctx.createImageData(dw, dh);
      const dd = img.data;
      for (let py = 0; py < dh; py++) {
        for (let px = 0; px < dw; px++) {
          const n = window.VantaGfx.fbm(px * 0.04 + py * 0.012, py * 0.05, 4, 202);
          const idx = (py * dw + px) * 4;
          dd[idx] = 148 + n * 42;
          dd[idx + 1] = 68 + n * 24;
          dd[idx + 2] = 32 + n * 14;
          dd[idx + 3] = Math.floor(18 + n * 38);
        }
      }
      dctx.putImageData(img, 0, 0);
      mctx.drawImage(dc, 0, 0, w, h);

      const dustGrain = window.VantaGfx.getGrainPattern(mctx, 0.08, true);
      if (dustGrain) {
        mctx.fillStyle = dustGrain;
        mctx.fillRect(0, horizonY - 24, w, h - horizonY + 24);
      }
    }
    mctx.restore();
  }

  onResize() {
    this._initCanvases();
  }

  onPointerDown(x, y) {
    this.isDown = true;
    this.pointer.x = x;
    this.pointer.y = y;

    if (!this.hasInteracted) {
      this.hasInteracted = true;
      this.heartPulseVisual = 1.0;
      window.soundEngine.playHeartbeat(0.65);
    }

    // Immediate generous wind-burst clean on click/tap
    this._eraseDustAt(x, y, 78, 0.96);
    this._spawnWindSwirl(x, y);
    for (let i = 0; i < 14; i++) {
      this._spawnDustMote(x, y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }
    window.soundEngine.playSandTick();
    window.soundEngine.setBrushWind(0.85, 0.7);
  }

  onPointerMove(x, y, vx, vy) {
    const speed = Math.hypot(vx, vy);
    const prevX = this.pointer.x || x;
    const prevY = this.pointer.y || y;
    this.pointer = { x, y, vx, vy };

    // Smooth continuous sweeping even just moving cursor or dragging!
    if (speed > 0.06 || this.isDown) {
      if (!this.hasInteracted) this.hasInteracted = true;
      const radius = this.isDown ? Math.min(98, 66 + speed * 14) : Math.min(82, 48 + speed * 12);
      const strength = this.isDown ? 0.92 : 0.72;

      const dist = Math.hypot(x - prevX, y - prevY);
      const steps = Math.max(1, Math.min(8, Math.ceil(dist / 22)));
      for (let s = 1; s <= steps; s++) {
        const ix = prevX + ((x - prevX) * s) / steps;
        const iy = prevY + ((y - prevY) * s) / steps;
        this._eraseDustAt(ix, iy, radius, strength);
      }

      window.soundEngine.setBrushWind(Math.min(1, 0.35 + speed * 0.45), Math.min(1, speed * 0.4));
      if (speed > 0.14 || this.isDown) {
        this._spawnDustMote(x, y, vx, vy);
        window.soundEngine.playSandTick();
      }
      if (Math.random() < 0.2) this._spawnWindSwirl(x, y);
    } else {
      window.soundEngine.setBrushWind(0.03, 0.1);
    }
  }

  onPointerUp() {
    this.isDown = false;
    window.soundEngine.setBrushWind(0, 0);
  }

  _eraseDustAt(x, y, r, strength = 0.9) {
    const mctx = this.maskCtx;
    mctx.save();
    mctx.globalCompositeOperation = 'destination-out';
    const g = mctx.createRadialGradient(x, y, r * 0.25, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${strength})`);
    g.addColorStop(0.65, `rgba(0,0,0,${strength * 0.65})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = g;
    mctx.beginPath();
    mctx.arc(x, y, r, 0, Math.PI * 2);
    mctx.fill();
    mctx.restore();

    if (this.panelGeometry) {
      const { cx, cy, radius } = this.panelGeometry;
      if (Math.hypot(x - cx, y - cy) < radius * 1.18) {
        const normR = r / Math.max(115, radius * 0.32);
        this.cleanRatio = Math.min(1, this.cleanRatio + normR * 0.0058);
      }
    }
  }

  _spawnWindSwirl(x, y) {
    this.swirls.push({
      x: x + (Math.random() - 0.5) * 44,
      y: y + (Math.random() - 0.5) * 44,
      r: 18 + Math.random() * 26,
      angle: Math.random() * Math.PI * 2,
      alpha: 0.48
    });
  }

  _spawnDustMote(x, y, vx, vy) {
    for (let i = 0; i < 3; i++) {
      this.windParticles.push({
        x: x + (Math.random() - 0.5) * 38,
        y: y + (Math.random() - 0.5) * 38,
        vx: (vx * 180 || (Math.random() - 0.5) * 90) + (Math.random() - 0.5) * 75,
        vy: (vy * 180 || -40 - Math.random() * 50) - 35 - Math.random() * 45,
        life: 1.0,
        size: Math.random() * 2.8 + 1.4
      });
    }
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    // Holding mouse / touch / Spacebar creates a lush orbiting saltation wind vortex!
    if (this.isDown && !this.goalReached) {
      this.vortexAngle += dt * 7.5;
      const orbitR = 45 + Math.sin(this.vortexAngle * 0.5) * 28;
      const vx = this.pointer.x + Math.cos(this.vortexAngle) * orbitR;
      const vy = this.pointer.y + Math.sin(this.vortexAngle) * orbitR;
      this._eraseDustAt(vx, vy, 74, 0.9);
      this._spawnDustMote(vx, vy, -Math.sin(this.vortexAngle) * 1.4, Math.cos(this.vortexAngle) * 1.4);
      window.soundEngine.playSandTick();
      if (Math.random() < 0.35) this._spawnWindSwirl(vx, vy);
    }

    const bpmInterval = Math.max(0.58, 1.35 - this.cleanRatio * 0.72);
    this.heartbeatTimer += dt;
    if (this.hasInteracted && this.heartbeatTimer >= bpmInterval) {
      this.heartbeatTimer = 0;
      this.heartPulseVisual = 1.0;
      window.soundEngine.playHeartbeat(0.35 + this.cleanRatio * 0.65);
      const { cx, cy, radius } = this.panelGeometry;
      for (let i = 0; i < 6 + Math.floor(this.cleanRatio * 10); i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * (0.18 + Math.random() * 0.72);
        this.sandGrains.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.2) * 120,
          vy: -85 - Math.random() * 85,
          g: 270,
          life: 1.0
        });
      }
    }

    this.heartPulseVisual = Math.max(0, this.heartPulseVisual - dt * 2.4);

    for (let i = this.sandGrains.length - 1; i >= 0; i--) {
      const g = this.sandGrains[i];
      g.vy += g.g * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.life -= dt * 1.25;
      if (g.life <= 0) this.sandGrains.splice(i, 1);
    }

    for (let i = this.windParticles.length - 1; i >= 0; i--) {
      const p = this.windParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1.35;
      if (p.life <= 0) this.windParticles.splice(i, 1);
    }

    for (let i = this.swirls.length - 1; i >= 0; i--) {
      const s = this.swirls[i];
      s.angle += dt * 4.5;
      s.r += dt * 28;
      s.alpha -= dt * 0.9;
      if (s.alpha <= 0) this.swirls.splice(i, 1);
    }

    // Complete smoothly as soon as clean target is met or gentle fallback timer ends
    if (!this.goalReached && (this.cleanRatio >= this.targetClean || this.elapsed >= this.fallbackDuration)) {
      this.goalReached = true;
      window.soundEngine.setBrushWind(0, 0);
      window.soundEngine.playSignatureMotif(2);
    }

    if (this.goalReached && !this.completed) {
      this.finaleTimer += dt;
      // Gently clear remaining mist during cosmic solar bloom
      const { cx, cy, radius } = this.panelGeometry;
      this._eraseDustAt(cx + (Math.random() - 0.5) * radius, cy + (Math.random() - 0.5) * radius, radius * 0.65, 0.4);
      if (this.finaleTimer >= 1.65) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  _drawConstellations(ctx, w, h, now, progress) {
    if (!this.constellations) return;
    const pulseBoost = 0.72 + progress * 0.28 + this.heartPulseVisual * 0.25;
    ctx.save();
    for (const c of this.constellations) {
      // Delicate glowing astrometric constellation filaments
      ctx.save();
      ctx.strokeStyle = c.color;
      ctx.globalAlpha = Math.min(1, 0.58 * pulseBoost);
      ctx.lineWidth = 1.25;
      ctx.shadowColor = c.starColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (const [a, b] of c.edges) {
        const na = c.nodes[a];
        const nb = c.nodes[b];
        ctx.moveTo(na.x * w, na.y * h);
        ctx.lineTo(nb.x * w, nb.y * h);
      }
      ctx.stroke();
      ctx.restore();

      // Luminous constellation guide stars with subtle 4-point glints
      c.nodes.forEach((n, idx) => {
        const sx = n.x * w;
        const sy = n.y * h;
        const tw = 0.72 + 0.28 * Math.sin(now * 2.1 + idx * 1.4);

        ctx.save();
        ctx.globalAlpha = Math.min(1, (0.78 + progress * 0.22) * tw);
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, n.r * 5.2);
        halo.addColorStop(0, c.starColor);
        halo.addColorStop(0.4, c.color);
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, n.r * 5.2, 0, Math.PI * 2);
        ctx.fill();

        // Crisp diffraction crosshairs on main stars
        ctx.strokeStyle = c.starColor;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(sx - n.r * 3.1, sy);
        ctx.lineTo(sx + n.r * 3.1, sy);
        ctx.moveTo(sx, sy - n.r * 3.1);
        ctx.lineTo(sx, sy + n.r * 3.1);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, n.r * 0.78, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
    ctx.restore();
  }

  render(ctx, w, h) {
    ctx.drawImage(this.panelCanvas, 0, 0);

    const { cx, cy, radius, horizonY = Math.round(h * 0.29), tiltY = 0.74 } = this.panelGeometry;
    const progress = Math.min(1, this.cleanRatio / this.targetClean);
    const now = performance.now() * 0.001;

    // Starry Martian Twilight Sky + Constellations strictly above the Martian ridge
    ctx.save();
    this._traceMarsRidge(ctx, w, horizonY + 2, false);
    ctx.lineTo(w, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.clip();

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, horizonY + 28, {
        alpha: 0.56,
        lumen: 1.15 + progress * 0.3,
        cyan: 0.12,
        stars: 0.85,
        composite: 'screen'
      });
    }
    if (window.VantaGfx && this.stars) {
      window.VantaGfx.drawStarfield(ctx, this.stars, w, h, now, 0.92);
    }
    this._drawConstellations(ctx, w, h, now, progress);
    ctx.restore();

    // Warm Solar Activation Bloom underneath dust
    if (this.cleanRatio > 0.04 || this.goalReached) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, tiltY);
      const glowAlpha = Math.min(0.65, progress * 0.42 + this.heartPulseVisual * 0.25);
      const glow = ctx.createRadialGradient(0, 0, radius * 0.08, 0, 0, radius * 1.15);
      glow.addColorStop(0, `rgba(252, 211, 77, ${glowAlpha})`);
      glow.addColorStop(0.55, `rgba(251, 146, 60, ${glowAlpha * 0.35})`);
      glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Wind-rippled Martian dust blanket (strictly over terrain & solar panel below horizon)
    ctx.drawImage(this.maskCanvas, 0, 0);

    // Wordless Golden Orbital Power Arc around center hub (aligned with 3/4 solar wing tilt)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, tiltY);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.23, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (progress > 0.01) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.23, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.strokeStyle = '#fcd34d';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();

    // Wind swirls
    for (const s of this.swirls) {
      ctx.strokeStyle = `rgba(254, 243, 199, ${s.alpha})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, s.angle - 0.9, s.angle + 0.9);
      ctx.stroke();
    }

    // Saltating sand grains
    for (const g of this.sandGrains) {
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blowing dust motes
    for (const p of this.windParticles) {
      ctx.fillStyle = `rgba(251, 146, 60, ${p.life * 0.72})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heartbeat ripple (tilted with 3/4 solar wing plane)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, tiltY);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (0.16 + (1 - this.heartPulseVisual) * 0.28), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(252, 211, 77, ${this.heartPulseVisual * (0.4 + progress * 0.55)})`;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.restore();

    if (this.finaleTimer > 0) {
      const f = Math.min(1, this.finaleTimer / 1.65);
      ctx.fillStyle = `rgba(245, 158, 11, ${Math.sin(f * Math.PI) * 0.14})`;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.ghostAlpha > 0.01) {
      const t = performance.now() * 0.0028;
      const gx = cx + Math.sin(t) * (radius * 0.48);
      const gy = cy + Math.cos(t * 1.8) * (radius * 0.2);
      drawGhostHand(ctx, gx, gy, this.ghostAlpha, 1, false);
    }
  }

  getSessionMetric() {
    const pct = Math.min(100, Math.max(25, Math.round((this.cleanRatio / this.targetClean) * 100)));
    return `${pct}% Năng lượng Khôi phục • ${Math.round(58 + pct * 0.4)} BPM`;
  }
}

/* ============================================================================
 * 2. STILL THERE — Vẫn còn ở đó (Apollo Lunar Retroreflector Constellation)
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
    this.fallbackDuration = 22;
    this.goalReached = false;
    this.finaleTimer = 0;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.9;

    // 3 Real Apollo LRRR Sites (Apollo 11, 14, 15) — gently visible beacon glints
    this.sites = [
      // Real selenographic positions projected onto the disc
      { id: 0, u: 0.40, v: -0.01, lit: false, glow: 0, echoes: 0 }, // Apollo 11 (Mare Tranquillitatis)
      { id: 1, u: -0.30, v: 0.06, lit: false, glow: 0, echoes: 0 }, // Apollo 14 (Fra Mauro)
      { id: 2, u: 0.06, v: -0.44, lit: false, glow: 0, echoes: 0 }  // Apollo 15 (Hadley-Apennine)
    ];

    this.aim = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
    this.moonSpin = 0;
    this.moonYaw = 0;
    this.moonPitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.lockedSite = null;
    this.isCharging = false;
    this.chargePhase = 0;
    this.beams = [];
    this.photonOrbs = [];
    this.echoRipples = [];

    this.stars = window.VantaGfx
      ? window.VantaGfx.createStarfield(210, 0.9)
      : [];

    if (!(window.vantaPlanetGL && window.vantaPlanetGL.ready)) {
      this._renderProceduralMoon();
    }
  }

  _renderProceduralMoon() {
    if (window.VantaGfx) {
      window.VantaGfx.renderMoonGlobe(this.moonCanvas, 512);
    }
  }

  onResize() {}

  _getMoonGeometry(w, h) {
    return { cx: w * 0.5, cy: h * 0.44, r: Math.min(w, h) * (w < 640 ? 0.31 : 0.25) };
  }

  _getSitePos(s, cx, cy, r) {
    const z0 = Math.sqrt(Math.max(0.04, 1 - s.u * s.u - s.v * s.v));
    // Gentle libration sway keeps the 3 Apollo beacons well inside the Moon's front disc
    // while the 3D lunar sphere beneath rotates continuously.
    const librationYaw = this.moonYaw + Math.sin((this.moonSpin || 0) * 0.7) * 0.12;
    const cy1 = Math.cos(-librationYaw);
    const sy1 = Math.sin(-librationYaw);
    const x1 = cy1 * s.u + sy1 * z0;
    const z1 = -sy1 * s.u + cy1 * z0;
    const cx2 = Math.cos(this.moonPitch);
    const sx2 = Math.sin(this.moonPitch);
    const y2 = cx2 * s.v - sx2 * z1;
    const z2 = sx2 * s.v + cx2 * z1;
    return { sx: cx + x1 * r, sy: cy + y2 * r, visible: z2 > 0.2 };
  }

  _updateLock(x, y) {
    const { cx, cy, r } = this._getMoonGeometry(window.innerWidth, window.innerHeight);
    let nearest = null;
    let minDist = Infinity;
    for (const s of this.sites) {
      const { sx, sy, visible } = this._getSitePos(s, cx, cy, r);
      if (!visible) continue;
      const d = Math.hypot(x - sx, y - sy);
      if (d < minDist) {
        minDist = d;
        nearest = { site: s, sx, sy, d };
      }
    }

    if (nearest && minDist < Math.max(88, r * 0.58)) {
      this.lockedSite = nearest.site;
      this.aim.x = x * 0.22 + nearest.sx * 0.78;
      this.aim.y = y * 0.22 + nearest.sy * 0.78;
    } else {
      this.lockedSite = null;
      this.aim.x = x;
      this.aim.y = y;
    }
  }

  onPointerDown(x, y) {
    this.isCharging = true;
    this.chargePhase = 0;
    this._updateLock(x, y);
    if (!this.hasInteracted) this.hasInteracted = true;
  }

  onPointerMove(x, y) {
    const nx = (x / Math.max(1, window.innerWidth) - 0.5) * 2;
    const ny = (y / Math.max(1, window.innerHeight) - 0.5) * 2;
    this.targetYaw = -nx * 0.42;
    this.targetPitch = ny * 0.28;
    this._updateLock(x, y);
  }

  onPointerUp(x, y) {
    if (!this.isCharging) return;
    this.isCharging = false;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { cx, cy, r } = this._getMoonGeometry(w, h);
    const px = Number.isFinite(x) ? x : this.aim.x;
    const py = Number.isFinite(y) ? y : this.aim.y;
    this._updateLock(px, py);

    // If user clicked anywhere on the Moon or space without locking, auto-snap to next unlit reflector if reasonably close!
    let targetSite = this.lockedSite;
    if (!targetSite) {
      let bestUnlit = null;
      let bestDist = Infinity;
      for (const s of this.sites) {
        const { sx, sy, visible } = this._getSitePos(s, cx, cy, r);
        if (!visible) continue;
        const d = Math.hypot(this.aim.x - sx, this.aim.y - sy);
        const weight = s.lit ? d * 1.6 : d;
        if (weight < bestDist) {
          bestDist = weight;
          bestUnlit = { s, d };
        }
      }
      if (bestUnlit && bestUnlit.d < r * 1.15) {
        targetSite = bestUnlit.s;
      }
    }

    const targetPos = targetSite ? this._getSitePos(targetSite, cx, cy, r) : null;
    const tx = targetPos ? targetPos.sx : this.aim.x;
    const ty = targetPos ? targetPos.sy : this.aim.y;

    window.soundEngine.playLaserLaunch();
    this.beams.push({ x0: w * 0.5, y0: h * 0.885, x1: tx, y1: ty, life: 1.0 });

    // Launch fast, visually legible photon packet (Earth -> Moon 0.7s, Moon -> Earth 0.75s)
    this.photonOrbs.push({
      x0: w * 0.5,
      y0: h * 0.885,
      x1: tx,
      y1: ty,
      progress: 0,
      returning: false,
      site: targetSite
    });
  }

  update(dt) {
    this.moonSpin = (this.moonSpin || 0) + dt * 0.14;
    this.moonYaw += (this.targetYaw - this.moonYaw) * Math.min(1, dt * 6);
    this.moonPitch += (this.targetPitch - this.moonPitch) * Math.min(1, dt * 6);

    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    if (this.isCharging) {
      this.chargePhase = (this.chargePhase + dt * 1.6) % 1;
    }

    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt * 1.15;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }

    for (let i = this.photonOrbs.length - 1; i >= 0; i--) {
      const orb = this.photonOrbs[i];
      orb.progress += dt * (orb.returning ? 1.35 : 1.55);
      if (!orb.returning && orb.progress >= 1) {
        orb.returning = true;
        orb.progress = 0;
        if (orb.site) {
          orb.site.lit = true;
          orb.site.glow = 1.0;
          orb.site.echoes++;
          window.soundEngine.playGlassEcho(orb.site.id);
          this.echoRipples.push({ x: orb.x1, y: orb.y1, r: 8, maxR: 135, alpha: 0.95 });
        } else {
          this.echoRipples.push({ x: orb.x1, y: orb.y1, r: 4, maxR: 55, alpha: 0.45 });
        }
      } else if (orb.returning && orb.progress >= 1) {
        this.photonOrbs.splice(i, 1);
      }
    }

    for (let i = this.echoRipples.length - 1; i >= 0; i--) {
      const rp = this.echoRipples[i];
      rp.r += dt * 115;
      rp.alpha = Math.max(0, 1 - rp.r / rp.maxR);
      if (rp.alpha <= 0.02) this.echoRipples.splice(i, 1);
    }

    const litCount = this.sites.filter(s => s.lit).length;
    if (!this.goalReached && (litCount >= 3 || this.elapsed >= this.fallbackDuration)) {
      this.goalReached = true;
      this.sites.forEach(s => { s.lit = true; s.glow = 1.0; });
      window.soundEngine.playSignatureMotif(4);
    }

    if (this.goalReached && !this.completed) {
      this.finaleTimer += dt;
      if (this.finaleTimer >= 1.7) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  render(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#02040a');
    sky.addColorStop(0.6, '#071124');
    sky.addColorStop(1, '#111d38');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: 0.72,
        lumen: 0.85,
        cyan: 0.55,
        stars: 0.65
      });
    }

    // Milky Way dust nebula band
    ctx.save();
    ctx.translate(w * 0.5, h * 0.35);
    ctx.rotate(-0.38);
    const mw = ctx.createLinearGradient(0, -170, 0, 170);
    mw.addColorStop(0, 'rgba(30, 58, 138, 0)');
    mw.addColorStop(0.32, 'rgba(148, 163, 184, 0.055)');
    mw.addColorStop(0.48, 'rgba(15, 23, 42, 0.14)'); // dark dust rift
    mw.addColorStop(0.65, 'rgba(226, 232, 240, 0.065)');
    mw.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = mw;
    ctx.fillRect(-w, -170, w * 2, 340);
    ctx.restore();

    const now = performance.now() * 0.002;
    if (window.VantaGfx) {
      window.VantaGfx.drawStarfield(ctx, this.stars, w, h, now * 0.6, 1);
    }

    const { cx, cy, r } = this._getMoonGeometry(w, h);

    // Airless vacuum optical scatter (ultra-subtle neutral bloom so the Moon stays crisp against deep black space)
    const moonHalo = ctx.createRadialGradient(cx, cy, r * 0.94, cx, cy, r * 1.24);
    moonHalo.addColorStop(0, 'rgba(226, 232, 240, 0.09)');
    moonHalo.addColorStop(0.55, 'rgba(148, 163, 184, 0.025)');
    moonHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.24, 0, Math.PI * 2);
    ctx.fill();

    if (!(window.vantaPlanetGL && window.vantaPlanetGL.drawPlanet(ctx, 'moon', cx, cy, r, {
      spin: -0.14 + (this.moonSpin || 0) * 0.55 + this.moonYaw,
      tilt: -this.moonPitch,
      sunDir: [-0.48, 0.24, 0.84]
    }))) {
      if (!this.moonCanvas.width) this._renderProceduralMoon();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(((this.moonSpin || 0) + this.moonYaw) * 0.25);
      ctx.drawImage(this.moonCanvas, -r * 1.087, -r * 1.087, r * 2.174, r * 2.174);
      ctx.restore();
    }

    // Constellation Triangle Lines connecting visible lit retroreflectors (fast multi-stroke glow, zero shadowBlur)
    const litSites = this.sites.filter(s => s.lit && this._getSitePos(s, cx, cy, r).visible);
    if (litSites.length >= 2) {
      ctx.save();
      ctx.beginPath();
      litSites.forEach((s, i) => {
        const { sx, sy } = this._getSitePos(s, cx, cy, r);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      if (litSites.length === 3) ctx.closePath();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.82)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Visible Beacon Glints on 3 Retroreflector Sites (Wordless clarity!)
    for (const s of this.sites) {
      const { sx, sy, visible } = this._getSitePos(s, cx, cy, r);
      if (!visible) continue;
      const pulse = 0.55 + 0.45 * Math.sin(now * 2 + s.id * 1.8);

      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, s.lit ? 11 : 9 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = s.lit ? '#fcd34d' : `rgba(56, 189, 248, ${0.42 + pulse * 0.35})`;
      ctx.lineWidth = s.lit ? 2 : 1.4;
      ctx.stroke();

      if (s.lit) {
        ctx.fillStyle = 'rgba(252, 211, 77, 0.26)';
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = s.lit ? '#fef3c7' : `rgba(186, 230, 253, ${0.5 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.lit ? 5 : 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Laser Beams
    for (const b of this.beams) {
      ctx.save();
      ctx.strokeStyle = `rgba(52, 211, 153, ${b.life * 0.36})`;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(b.x0, b.y0);
      ctx.lineTo(b.x1, b.y1);
      ctx.stroke();

      ctx.strokeStyle = `rgba(254, 243, 199, ${b.life})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(b.x0, b.y0);
      ctx.lineTo(b.x1, b.y1);
      ctx.stroke();
      ctx.restore();
    }

    // Traveling Photon Orbs (fast soft outer halo, zero shadowBlur)
    for (const orb of this.photonOrbs) {
      const t = orb.returning ? 1 - orb.progress : orb.progress;
      const px = orb.x0 + (orb.x1 - orb.x0) * t;
      const py = orb.y0 + (orb.y1 - orb.y0) * t;
      ctx.save();
      ctx.fillStyle = orb.returning ? 'rgba(245, 158, 11, 0.32)' : 'rgba(52, 211, 153, 0.32)';
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = orb.returning ? '#fcd34d' : '#6ee7b7';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const rp of this.echoRipples) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${rp.alpha})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Magnetic Targeting Reticle
    ctx.save();
    ctx.translate(this.aim.x, this.aim.y);
    const locked = Boolean(this.lockedSite);
    const ringR = this.isCharging ? 16 + this.chargePhase * 12 : (locked ? 15 : 19);
    ctx.strokeStyle = locked ? '#fcd34d' : 'rgba(186, 230, 253, 0.72)';
    ctx.lineWidth = locked ? 2 : 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // 4 subtle crosshairs
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(ringR + 3, 0);
      ctx.lineTo(ringR + 8, 0);
      ctx.stroke();
    }
    ctx.restore();

    // 3D RTX Earth Horizon + Laser Observatory Dome (crisp orbital sapphire ocean, swirled clouds, and sunlit continents)
    const earthR = Math.max(w * 0.46, h * 0.48);
    const earthCx = w * 0.5;
    const earthCy = h * 0.885 + earthR;
    ctx.save();
    // Outer orbital Rayleigh atmospheric glow
    const atmoRim = ctx.createRadialGradient(earthCx, earthCy, earthR * 0.975, earthCx, earthCy, earthR * 1.055);
    atmoRim.addColorStop(0, 'rgba(59, 130, 246, 0.44)');
    atmoRim.addColorStop(0.38, 'rgba(37, 99, 235, 0.16)');
    atmoRim.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = atmoRim;
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, earthR * 1.055, 0, Math.PI * 2);
    ctx.fill();

    // Native vector clip keeps the curved Earth horizon razor-sharp at any resolution
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, earthR, 0, Math.PI * 2);
    ctx.clip();

    const usedRTXEarthHorizon = window.vantaPlanetGL && window.vantaPlanetGL.drawPlanet(ctx, 'earth', earthCx, earthCy, earthR, {
      spin: (this.elapsed + (this.moonSpin || 0) * 1.4) * 0.02 + 2.35,
      tilt: 0.45,
      sunDir: [-0.66, 0.30, 0.69]
    });

    if (!usedRTXEarthHorizon) {
      const earthGrad = ctx.createRadialGradient(earthCx - earthR * 0.25, earthCy - earthR * 0.72, earthR * 0.08, earthCx, earthCy, earthR);
      earthGrad.addColorStop(0, '#1d4ed8');
      earthGrad.addColorStop(0.55, '#0f2966');
      earthGrad.addColorStop(1, '#040b24');
      ctx.fillStyle = earthGrad;
      ctx.fillRect(0, h * 0.85, w, h * 0.2);
    }

    // Subtle thin orbital atmospheric scatter whisper right on the limb
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(earthCx, earthCy, earthR - 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();


    // Laser Observatory Dome seated cleanly on Earth's horizon crest
    ctx.save();
    ctx.translate(w * 0.5, h * 0.885);
    ctx.fillStyle = '#0b1222';
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 12, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.beginPath();
    ctx.arc(0, -6, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(0, -6, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.ghostAlpha > 0.01) {
      const gPos = this._getSitePos(this.sites[0], cx, cy, r);
      drawGhostHand(ctx, gPos.sx, gPos.sy, this.ghostAlpha, 1, false);
    }
  }

  getSessionMetric() {
    const litCount = this.sites.filter(s => s.lit).length;
    return `${litCount}/3 Phản xạ Apollo • 2.562s Trễ Ánh Sáng`;
  }
}

/* ============================================================================
 * 3. ONE WHEEL LEFT — Một bánh còn lại (Friction-Free Spirit Rover Driving)
 * ==========================================================================*/
class OneWheelLeftGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.fallbackDuration = 22;
    this.goalX = 760; // Golden Sunset Silica Crest destination
    this.goalReached = false;
    this.finaleTimer = 0;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.9;

    this.roverX = 120;
    this.roverSpeed = 0;
    this.pointerDir = 0; // +1 forward, -1 reverse, 0 idle
    this.touchCruiseTimer = 0;
    this.touchCruiseDir = 1;
    this.keyForward = false;
    this.keyBackward = false;

    this.cameraZoomOut = 0;
    this.trenchPoints = [];
    this.silicaSparkles = [];
    this.dustPuffs = [];
    this.noteMilestone = 200;
    this.noteIdx = 0;
  }

  onResize() {}

  _terrainHeight(worldX, h) {
    return (
      h * 0.69 +
      Math.sin(worldX * 0.0045) * 28 +
      Math.cos(worldX * 0.011) * 12
    );
  }

  onPointerDown(x) {
    if (!this.hasInteracted) this.hasInteracted = true;
    const w = window.innerWidth;
    // Left 25% reverses carefully; tapping or holding right of left margin drives forward smoothly!
    const dir = x < w * 0.25 ? -1 : 1;
    this.pointerDir = dir;
    this.touchCruiseDir = dir;
    this.touchCruiseTimer = 1.85;
  }

  onPointerMove(x) {
    if (this.pointerDir !== 0) {
      const dir = x < window.innerWidth * 0.25 ? -1 : 1;
      this.pointerDir = dir;
      this.touchCruiseDir = dir;
    }
  }

  onPointerUp() {
    this.pointerDir = 0;
  }

  _classifyRoverKey(e) {
    const code = e.code;
    const key = e.key ? e.key.toLowerCase() : '';
    if (code === 'ArrowRight' || code === 'ArrowUp' || code === 'KeyD' || code === 'KeyW' || key === 'd' || key === 'w') {
      return 'forward';
    }
    if (code === 'ArrowLeft' || code === 'ArrowDown' || code === 'KeyA' || code === 'KeyS' || key === 'a' || key === 's') {
      return 'backward';
    }
    return null;
  }

  onKeyDown(e) {
    const dir = this._classifyRoverKey(e);
    if (!dir) return false;
    if (!this.hasInteracted) this.hasInteracted = true;
    if (dir === 'forward') this.keyForward = true;
    else this.keyBackward = true;
    return true;
  }

  onKeyUp(e) {
    const dir = this._classifyRoverKey(e);
    if (!dir) return false;
    if (dir === 'forward') this.keyForward = false;
    else this.keyBackward = false;
    return true;
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    if (this.touchCruiseTimer > 0 && this.pointerDir === 0) {
      this.touchCruiseTimer = Math.max(0, this.touchCruiseTimer - dt);
    }

    const activeCruise = this.touchCruiseTimer > 0 ? this.touchCruiseDir : 0;
    const pushingForward = this.keyForward || this.pointerDir > 0 || activeCruise > 0;
    const pushingBackward = !pushingForward && (this.keyBackward || this.pointerDir < 0 || activeCruise < 0);

    if (!this.goalReached) {
      if (pushingForward) {
        this.roverSpeed = Math.min(76, this.roverSpeed + dt * 135);
      } else if (pushingBackward) {
        this.roverSpeed = Math.max(-52, this.roverSpeed - dt * 120);
      } else {
        this.roverSpeed *= Math.pow(0.08, dt);
      }
    } else {
      this.roverSpeed *= Math.pow(0.12, dt);
    }

    this.roverX = Math.max(80, this.roverX + this.roverSpeed * dt);
    if (this.roverX <= 80 && this.roverSpeed < 0) this.roverSpeed = 0;

    if (Math.abs(this.roverSpeed) > 12) window.soundEngine.playGravelCrunch();

    if (Math.abs(this.roverSpeed) > 6) {
      const last = this.trenchPoints[this.trenchPoints.length - 1];
      if (!last || Math.abs(this.roverX - last.x) > 7) {
        this.trenchPoints.push({ x: this.roverX - 28, glow: 1.0 });
        this.silicaSparkles.push({
          x: this.roverX - 28,
          vy: -16 - Math.random() * 22,
          yOff: 0,
          life: 1.0
        });
      }
      // Billowing Martian red dust + white silica dust puffs when moving
      if (Math.random() < 0.65) {
        const dirSign = this.roverSpeed >= 0 ? -1 : 1;
        const isSilica = Math.random() < 0.42;
        this.dustPuffs.push({
          x: this.roverX + dirSign * (18 + Math.random() * 22),
          yOff: -2 - Math.random() * 6,
          vx: dirSign * (12 + Math.random() * 22),
          vy: -14 - Math.random() * 24,
          r: 4 + Math.random() * 5,
          life: 1.0,
          silica: isSilica
        });
      }
    }

    for (let i = this.dustPuffs.length - 1; i >= 0; i--) {
      const dp = this.dustPuffs[i];
      dp.x += dp.vx * dt;
      dp.yOff += dp.vy * dt;
      dp.vy *= Math.pow(0.45, dt);
      dp.r += dt * 14;
      dp.life -= dt * 1.1;
      if (dp.life <= 0) this.dustPuffs.splice(i, 1);
    }

    for (let i = this.silicaSparkles.length - 1; i >= 0; i--) {
      const sp = this.silicaSparkles[i];
      sp.yOff += sp.vy * dt;
      sp.life -= dt * 0.85;
      if (sp.life <= 0) this.silicaSparkles.splice(i, 1);
    }

    if (this.roverX >= this.noteMilestone) {
      this.noteMilestone += 140;
      window.soundEngine.playPentatonicNote(this.noteIdx % 8, 0.16, 1.5, 0, 'triangle');
      this.noteIdx++;
    }

    const travelFrac = Math.min(1, (this.roverX - 120) / (this.goalX - 120));
    if (travelFrac > 0.72) {
      this.cameraZoomOut = Math.min(1, (travelFrac - 0.72) / 0.28);
    }

    if (!this.goalReached && (this.roverX >= this.goalX || this.elapsed >= this.fallbackDuration)) {
      this.goalReached = true;
      window.soundEngine.playSignatureMotif(3);
    }

    if (this.goalReached && !this.completed) {
      this.finaleTimer += dt;
      this.cameraZoomOut = Math.min(1, this.cameraZoomOut + dt * 0.75);
      if (this.finaleTimer >= 1.75) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  render(ctx, w, h) {
    // 1. Martian Sunset Gradient Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.74);
    sky.addColorStop(0, '#0a0918');
    sky.addColorStop(0.45, '#4c2335');
    sky.addColorStop(0.78, '#265466');
    sky.addColorStop(1, '#e07a19');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h * 0.48, {
        alpha: 0.34,
        lumen: 0.65,
        cyan: 0.25,
        stars: 0.42
      });
    }

    // Phobos + Twilight Glow
    ctx.fillStyle = 'rgba(254, 243, 199, 0.5)';
    ctx.beginPath();
    ctx.arc(w * 0.22, h * 0.18, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Setting Martian Sun (realistic small solar disc + wide soft Rayleigh/Mie atmospheric scatter)
    const travel = Math.min(1, (this.roverX - 120) / (this.goalX - 120));
    const sunX = w * 0.74;
    const sunY = h * (0.44 + travel * 0.18);

    const atmoGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, Math.min(w, h) * 0.38);
    atmoGlow.addColorStop(0, 'rgba(224, 242, 254, 0.65)');
    atmoGlow.addColorStop(0.12, 'rgba(186, 230, 253, 0.28)');
    atmoGlow.addColorStop(0.38, 'rgba(217, 119, 6, 0.12)');
    atmoGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = atmoGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, Math.min(w, h) * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const zoom = 1 - this.cameraZoomOut * 0.44;
    ctx.translate(w * 0.5, h * 0.65);
    ctx.scale(zoom, zoom);
    ctx.translate(-w * 0.5, -h * 0.65);

    const camX = this.roverX - w * 0.42;

    // Far Mesas (FBM ridge + atmospheric dust haze)
    const mesaGrad = ctx.createLinearGradient(0, h * 0.4, 0, h * 0.68);
    mesaGrad.addColorStop(0, '#3a222d');
    mesaGrad.addColorStop(1, '#1a1019');
    ctx.fillStyle = mesaGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 28) {
      const wx = sx + camX * 0.12;
      const fbmVal = window.VantaGfx ? window.VantaGfx.fbm(wx * 0.0018, 1.4, 3, 41) : 0.5;
      const py = h * 0.45 + Math.sin(wx * 0.0014) * 38 + (fbmVal - 0.5) * 65;
      ctx.lineTo(sx, py);
    }
    ctx.lineTo(w * 1.5, h);
    ctx.closePath();
    ctx.fill();

    // Mid Dunes with Mie dust scattering
    const midGrad = ctx.createLinearGradient(0, h * 0.52, 0, h * 0.78);
    midGrad.addColorStop(0, '#4f2428');
    midGrad.addColorStop(1, '#231115');
    ctx.fillStyle = midGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 22) {
      const wx = sx + camX * 0.3;
      const fbmVal = window.VantaGfx ? window.VantaGfx.fbm(wx * 0.0026, 3.8, 3, 73) : 0.5;
      const py = h * 0.56 + Math.sin(wx * 0.0022) * 28 + (fbmVal - 0.5) * 44;
      ctx.lineTo(sx, py);
    }
    ctx.lineTo(w * 1.5, h);
    ctx.closePath();
    ctx.fill();

    // Foreground Martian Terrain
    const groundGrad = ctx.createLinearGradient(0, h * 0.65, 0, h * 1.2);
    groundGrad.addColorStop(0, '#4a2116');
    groundGrad.addColorStop(0.35, '#24100d');
    groundGrad.addColorStop(1, '#0c0607');
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h * 1.3);
    for (let sx = -w * 0.5; sx <= w * 1.5; sx += 14) {
      const wx = sx + camX;
      ctx.lineTo(sx, this._terrainHeight(wx, h));
    }
    ctx.lineTo(w * 1.5, h * 1.3);
    ctx.closePath();
    ctx.fill();

    // Glowing Sunset Silica Beacon Crystal at Goal Crest (clear wordless destination!)
    const bx = this.goalX - camX;
    const by = this._terrainHeight(this.goalX, h);
    ctx.save();
    const beaconGlow = ctx.createRadialGradient(bx, by - 24, 3, bx, by - 24, 65);
    beaconGlow.addColorStop(0, 'rgba(103, 232, 249, 0.9)');
    beaconGlow.addColorStop(0.45, 'rgba(56, 189, 248, 0.35)');
    beaconGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beaconGlow;
    ctx.beginPath();
    ctx.arc(bx, by - 24, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a5f3fc';
    ctx.beginPath();
    ctx.moveTo(bx, by - 46);
    ctx.lineTo(bx + 11, by - 24);
    ctx.lineTo(bx, by - 4);
    ctx.lineTo(bx - 11, by - 24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Exposed White Silica Trench dug by Spirit's jammed wheel
    if (this.trenchPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.94)';
      ctx.shadowColor = 'rgba(226, 232, 240, 0.65)';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 7.5;
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
      ctx.fillStyle = `rgba(248, 250, 252, ${sp.life * 0.9})`;
      ctx.beginPath();
      ctx.arc(sp.x - camX, this._terrainHeight(sp.x, h) + sp.yOff, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Billowing Dust Plumes (Martian rust dust + white silica dust)
    for (const dp of this.dustPuffs) {
      const dx = dp.x - camX;
      const dy = this._terrainHeight(dp.x, h) + dp.yOff;
      ctx.fillStyle = dp.silica
        ? `rgba(241, 245, 249, ${dp.life * 0.45})`
        : `rgba(194, 98, 48, ${dp.life * 0.42})`;
      ctx.beginPath();
      ctx.arc(dx, dy, dp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // NASA Spirit Rover (MER-A) — High-craft Kapton Foil & Rocker-Bogie
    const rx = this.roverX - camX;
    const ry = this._terrainHeight(this.roverX, h);
    const nextY = this._terrainHeight(this.roverX + 10, h);
    const slopeAngle = Math.atan2(nextY - ry, 10);

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(slopeAngle);

    if (window.VantaGfx) {
      window.VantaGfx.drawMERRover(ctx, {
        wheelRot: this.roverX * 0.08,
        stuckWheel: true,
        scale: 0.96
      });
    }

    if (Math.abs(this.roverSpeed) > 8) {
      ctx.fillStyle = 'rgba(241, 245, 249, 0.78)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-28 - Math.random() * 16, -2 - Math.random() * 10, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.restore();

    // Subtle wordless on-screen touch drive indicators (Reverse ‹ / Forward ›) for tablets & phones
    if (!this.goalReached) {
      const padY = h * 0.84;
      const forwardActive = this.pointerDir > 0 || this.keyForward || (this.touchCruiseTimer > 0 && this.touchCruiseDir > 0);
      const reverseActive = this.pointerDir < 0 || this.keyBackward || (this.touchCruiseTimer > 0 && this.touchCruiseDir < 0);

      [
        { x: w * 0.14, dir: -1, active: reverseActive },
        { x: w * 0.86, dir: 1, active: forwardActive }
      ].forEach(btn => {
        ctx.save();
        ctx.translate(btn.x, padY);
        ctx.fillStyle = btn.active ? 'rgba(252, 211, 77, 0.22)' : 'rgba(15, 23, 42, 0.45)';
        ctx.strokeStyle = btn.active ? '#fcd34d' : 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = btn.active ? 2 : 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = btn.active ? '#fef3c7' : 'rgba(226, 232, 240, 0.72)';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-3 * btn.dir, -6);
        ctx.lineTo(4 * btn.dir, 0);
        ctx.lineTo(-3 * btn.dir, 6);
        ctx.stroke();
        ctx.restore();
      });
    }

    if (this.ghostAlpha > 0.01) {
      drawGhostHand(ctx, w * 0.56, h * 0.74, this.ghostAlpha, 1, true);
    }
  }

  getSessionMetric() {
    const meters = Math.max(1.5, ((this.roverX - 120) * 0.045)).toFixed(1);
    return `${meters}m Rãnh Silica • ${this.noteIdx} Nốt phổ`;
  }
}

window.UnderTheDustGame = UnderTheDustGame;
window.StillThereGame = StillThereGame;
window.OneWheelLeftGame = OneWheelLeftGame;
