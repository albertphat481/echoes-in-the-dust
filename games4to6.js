/**
 * VantaLumen — Minigames 4–6 (Rebuilt High-Craft Responsive Edition)
 * 4. UNSENT: Click OR drag NASA Polaroids into Opportunity's magnetic UHF uplink beam
 * 5. MOON STILL RINGS: 5-node resonant planetary cutaway + one-tap Moon/Earth orb switcher
 * 6. ETERNAL FOOTPRINT: Tactile normal-lit bootprints + glowing Sun-Azimuth arc + orbital reveal
 */

/* ============================================================================
 * 4. UNSENT — Những điều chưa kịp gửi (Opportunity Rover -> MRO Relay -> Earth DSN)
 * ==========================================================================*/
class UnsentGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.satelliteDuration = 22;
    this.goalReached = false;
    this.finaleTimer = 0;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.9;

    this.sentCards = [];
    this.packets = [];        // Active RF/X-Band packets: stage 'toSat' | 'toEarth'
    this.radioRings = [];     // Directional UHF pulse rings from Opportunity's dish
    this.mroRings = [];       // Lock/relay burst rings at MRO orbiter
    this.earthRings = [];     // DSN receive ripples around 3D Earth
    this.earthReceived = 0;
    this.satFlash = 0;
    this.earthFlash = 0;
    this.oppTxFlash = 0;
    this.draggedCard = null;
    this.downPos = null;
    this.dreamNoteTimer = 0;
    this.dreamIndex = 0;

    this.stars = Array.from({ length: 130 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.72,
      s: Math.random() * 1.5 + 0.3,
      p: Math.random() * Math.PI * 2
    }));

    this.pebbles = Array.from({ length: 28 }, (_, i) => ({
      rx: ((i * 73) % 100) / 100,
      ry: ((i * 37) % 100) / 100,
      r: 1.4 + (i % 4) * 0.9
    }));

    this._initPolaroids();
  }

  _initPolaroids() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const types = [
      { id: 0, note: 0, art: 'sunrise', tilt: -0.07 },
      { id: 1, note: 1, art: 'dustdevil', tilt: 0.05 },
      { id: 2, note: 2, art: 'tracks', tilt: -0.04 },
      { id: 3, note: 3, art: 'shadow', tilt: 0.08 },
      { id: 4, note: 4, art: 'earthstar', tilt: -0.03 },
      { id: 5, note: 5, art: 'berries', tilt: 0.05 },
      { id: 6, note: 6, art: 'crater', tilt: -0.06 },
      { id: 7, note: 7, art: 'twinpeaks', tilt: 0.04 },
      { id: 8, note: 8, art: 'laststorm', tilt: -0.05 }
    ];

    const cols = 3;
    const isNarrow = w < 640;
    const cardW = Math.min(104, w * (isNarrow ? 0.22 : 0.17));
    const cardH = cardW * 1.24;
    const gapX = cardW * (isNarrow ? 1.22 : 1.30);
    const gapY = cardH * (isNarrow ? 1.06 : 1.12);
    const gridCenterX = isNarrow ? w * 0.52 : w * 0.63;
    const startX = gridCenterX - gapX;
    const startY = h * 0.52 - gapY * 0.82;

    this.cards = types.map((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * gapX + (Math.random() - 0.5) * 8;
      const y = startY + row * gapY + (Math.random() - 0.5) * 6;
      return {
        ...t,
        homeX: x,
        homeY: y,
        x,
        y,
        w: cardW,
        h: cardH,
        sent: false,
        launching: false,
        launchProgress: 0,
        launchFrom: null,
        floatPhase: Math.random() * Math.PI * 2
      };
    });
  }

  onResize() {
    this._initPolaroids();
  }

  _getOppyDishPos(w, h) {
    const roverX = w < 640 ? w * 0.24 : w * 0.21;
    const roverY = h * 0.915;
    const scale = Math.min(0.95, Math.max(0.68, w / 1080));
    return { roverX, x: roverX - 20 * scale, y: roverY - 56 * scale, roverY, scale };
  }

  _getSatellitePos(w, h) {
    const satProgress = Math.min(1, this.elapsed / this.satelliteDuration);
    const x = w * (0.14 + satProgress * 0.42);
    const y = h * 0.14 - Math.sin(satProgress * Math.PI) * h * 0.035;
    return { x, y, satProgress };
  }

  _getEarthPos(w, h) {
    const r = Math.min(44, Math.max(26, Math.min(w, h) * 0.052));
    return { x: w * 0.85, y: h * 0.165, r };
  }

  _sendCard(c) {
    if (c.sent || c.launching || this.sentCards.length >= 3) return;
    c.launching = true;
    c.launchProgress = 0;
    c.launchFrom = { x: c.x, y: c.y };
  }

  _finalizeCardLaunch(c) {
    c.launching = false;
    c.sent = true;
    this.sentCards.push(c);
    window.soundEngine.playTapeWhoosh();
    window.soundEngine.playPentatonicNote(c.note, 0.22, 1.9, 0.06, 'triangle');

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dish = this._getOppyDishPos(w, h);
    const sat = this._getSatellitePos(w, h);
    const seq = this.sentCards.length;

    // Stage 1: Opportunity's HGA/UHF Dish transmits packet up to Mars Reconnaissance Orbiter
    this.oppTxFlash = 1.0;
    this.packets.push({
      stage: 'toSat',
      x: dish.x,
      y: dish.y,
      tx: sat.x,
      ty: sat.y,
      progress: 0,
      note: c.note,
      seq
    });
    this.radioRings.push({ x: dish.x, y: dish.y, r: 10, alpha: 1.0, hue: 'amber' });
    this.radioRings.push({ x: dish.x, y: dish.y, r: 22, alpha: 0.72, hue: 'amber' });
  }

  onPointerDown(x, y) {
    if (!this.hasInteracted) this.hasInteracted = true;
    if (this.sentCards.length >= 3 || this.goalReached) return;

    this.downPos = { x, y, t: performance.now() };
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const c = this.cards[i];
      if (c.sent || c.launching) continue;
      if (Math.abs(x - c.x) <= c.w * 0.65 && Math.abs(y - c.y) <= c.h * 0.65) {
        this.draggedCard = c;
        window.soundEngine.playPentatonicNote(c.note, 0.13, 0.6, 0, 'sine');
        break;
      }
    }
  }

  onPointerMove(x, y) {
    if (this.draggedCard) {
      this.draggedCard.x = x;
      this.draggedCard.y = y;
    }
  }

  onPointerUp(x, y) {
    if (!this.draggedCard) return;
    const c = this.draggedCard;
    this.draggedCard = null;

    const h = window.innerHeight;
    const px = Number.isFinite(x) ? x : c.x;
    const py = Number.isFinite(y) ? y : c.y;
    const movedDist = this.downPos ? Math.hypot(px - this.downPos.x, py - this.downPos.y) : 0;
    const swipedUp = this.downPos ? (this.downPos.y - py) > 28 : false;

    // Single tap/click OR dragging toward Opportunity / Uplink Beam sends memory into Oppy's UHF dish
    if (movedDist < 38 || swipedUp || c.y < h * 0.48 || c.y > h * 0.68) {
      this._sendCard(c);
    }
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dish = this._getOppyDishPos(w, h);
    const sat = this._getSatellitePos(w, h);
    const earth = this._getEarthPos(w, h);
    const now = performance.now() * 0.0015;

    this.oppTxFlash = Math.max(0, this.oppTxFlash - dt * 1.4);
    this.satFlash = Math.max(0, this.satFlash - dt * 1.5);
    this.earthFlash = Math.max(0, this.earthFlash - dt * 1.3);

    for (const c of this.cards) {
      if (c.launching) {
        c.launchProgress += dt * 3.1;
        const p = Math.min(1, c.launchProgress);
        const ease = 1 - Math.pow(1 - p, 3);
        c.x = c.launchFrom.x + (dish.x - c.launchFrom.x) * ease;
        c.y = c.launchFrom.y + (dish.y - c.launchFrom.y) * ease;
        if (p >= 1) this._finalizeCardLaunch(c);
      } else if (c !== this.draggedCard && !c.sent) {
        const targetX = c.homeX + Math.sin(now + c.floatPhase) * 4;
        const targetY = c.homeY + Math.cos(now * 1.2 + c.floatPhase) * 4;
        c.x += (targetX - c.x) * Math.min(1, dt * 8);
        c.y += (targetY - c.y) * Math.min(1, dt * 8);
      }
    }

    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      if (p.stage === 'toSat') {
        p.tx = sat.x;
        p.ty = sat.y;
        p.progress += dt * 1.25;
        if (p.progress >= 1) {
          // Stage 2: MRO Orbiter locks signal & relays via X-Band beam back to Earth!
          p.stage = 'toEarth';
          p.progress = 0;
          p.x = sat.x;
          p.y = sat.y;
          p.tx = earth.x;
          p.ty = earth.y;
          this.satFlash = 1.0;
          this.mroRings.push({ x: sat.x, y: sat.y, r: 8, alpha: 1.0 });
          window.soundEngine.playPentatonicNote((p.note + 2) % 9, 0.14, 1.4, 0.03, 'sine');
        }
      } else {
        p.progress += dt * 1.1;
        if (p.progress >= 1) {
          this.packets.splice(i, 1);
          this.earthReceived = Math.min(3, this.earthReceived + 1);
          this.earthFlash = 1.0;
          this.earthRings.push({ x: earth.x, y: earth.y, r: earth.r * 0.9, alpha: 1.0 });
          window.soundEngine.playPentatonicNote((p.note + 4) % 9, 0.17, 1.9, 0, 'triangle');
          if (this.earthReceived >= 3 && !this.goalReached) {
            this.goalReached = true;
          }
        }
      }
    }

    for (let i = this.radioRings.length - 1; i >= 0; i--) {
      const r = this.radioRings[i];
      r.r += dt * 165;
      r.alpha -= dt * 0.78;
      if (r.alpha <= 0) this.radioRings.splice(i, 1);
    }

    for (let i = this.mroRings.length - 1; i >= 0; i--) {
      const r = this.mroRings[i];
      r.r += dt * 95;
      r.alpha -= dt * 1.1;
      if (r.alpha <= 0) this.mroRings.splice(i, 1);
    }

    for (let i = this.earthRings.length - 1; i >= 0; i--) {
      const r = this.earthRings[i];
      r.r += dt * 78;
      r.alpha -= dt * 0.9;
      if (r.alpha <= 0) this.earthRings.splice(i, 1);
    }

    if (!this.goalReached && this.elapsed >= this.satelliteDuration) {
      while (this.sentCards.length < 3) {
        const nextCard = this.cards.find(c => !c.sent && !c.launching);
        if (!nextCard) break;
        nextCard.sent = true;
        this.sentCards.push(nextCard);
      }
      this.earthReceived = Math.max(this.earthReceived, 3);
      this.goalReached = true;
    }

    if (this.goalReached && !this.completed) {
      this.finaleTimer += dt;
      this.dreamNoteTimer += dt;
      if (this.dreamNoteTimer >= 0.7) {
        this.dreamNoteTimer = 0;
        const card = this.sentCards[this.dreamIndex % Math.max(1, this.sentCards.length)];
        if (card) window.soundEngine.playPentatonicNote(card.note, 0.18, 2.0, 0, 'triangle');
        this.dreamIndex++;
      }
      if (this.finaleTimer >= 2.15) {
        this.completed = true;
        window.soundEngine.playSignatureMotif(0);
        this.host.completeCurrentGame();
      }
    }
  }

  _drawPolaroidArt(ctx, art, w, h) {
    const iw = w * 0.84;
    const ih = h * 0.68;
    const ix = -iw * 0.5;
    const iy = -h * 0.42;

    ctx.save();
    ctx.beginPath();
    ctx.rect(ix, iy, iw, ih);
    ctx.clip();

    const sky = ctx.createLinearGradient(0, iy, 0, iy + ih);
    sky.addColorStop(0, '#070b18');
    sky.addColorStop(0.65, '#1e293b');
    sky.addColorStop(1, '#451a03');
    ctx.fillStyle = sky;
    ctx.fillRect(ix, iy, iw, ih);

    switch (art) {
      case 'sunrise': {
        const g = ctx.createRadialGradient(0, iy + ih * 0.68, 2, 0, iy + ih * 0.68, iw * 0.35);
        g.addColorStop(0, '#e0f2fe');
        g.addColorStop(0.35, '#fcd34d');
        g.addColorStop(1, 'rgba(245,158,11,0)');
        ctx.fillStyle = g;
        ctx.fillRect(ix, iy, iw, ih);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ix, iy + ih * 0.72, iw, ih * 0.28);
        break;
      }
      case 'dustdevil': {
        ctx.fillStyle = '#29150c';
        ctx.fillRect(ix, iy + ih * 0.72, iw, ih * 0.28);
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.7)';
        ctx.lineWidth = 2;
        for (let l = 0; l < 5; l++) {
          const y = iy + ih * (0.2 + l * 0.11);
          const rad = 14 - l * 2;
          ctx.beginPath();
          ctx.ellipse(0, y, rad, 3.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }
      case 'tracks': {
        ctx.fillStyle = '#29150c';
        ctx.fillRect(ix, iy + ih * 0.5, iw, ih * 0.5);
        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(ix + 10, iy + ih); ctx.lineTo(-5, iy + ih * 0.5);
        ctx.moveTo(ix + iw - 10, iy + ih); ctx.lineTo(5, iy + ih * 0.5);
        ctx.stroke();
        break;
      }
      case 'shadow': {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(ix, iy + ih * 0.4, iw, ih * 0.6);
        ctx.fillStyle = '#050811';
        ctx.fillRect(-13, iy + ih * 0.55, 26, 15);
        ctx.fillRect(-2, iy + ih * 0.28, 4, 22);
        ctx.fillRect(-7, iy + ih * 0.22, 14, 7);
        break;
      }
      case 'earthstar': {
        const eg = ctx.createRadialGradient(iw * 0.14, iy + ih * 0.34, 1, iw * 0.14, iy + ih * 0.34, 14);
        eg.addColorStop(0, '#ffffff');
        eg.addColorStop(0.3, '#38bdf8');
        eg.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(iw * 0.14, iy + ih * 0.34, 14, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'berries': {
        ctx.fillStyle = '#29150c';
        ctx.fillRect(ix, iy, iw, ih);
        for (const [bx, by, br] of [[-16, -6, 5], [5, -10, 4], [14, 8, 5.5], [-4, 12, 4.5], [-18, 16, 3.5]]) {
          const bg = ctx.createRadialGradient(bx - 1, iy + ih * 0.5 + by - 1, 1, bx, iy + ih * 0.5 + by, br);
          bg.addColorStop(0, '#fcd34d');
          bg.addColorStop(1, '#1e293b');
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(bx, iy + ih * 0.5 + by, br, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'crater': {
        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, iy + ih * 0.62, iw * 0.4, ih * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(5, 8, 17, 0.7)';
        ctx.fill();
        break;
      }
      case 'twinpeaks': {
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.moveTo(ix, iy + ih * 0.85);
        ctx.lineTo(-iw * 0.2, iy + ih * 0.36);
        ctx.lineTo(0, iy + ih * 0.68);
        ctx.lineTo(iw * 0.22, iy + ih * 0.3);
        ctx.lineTo(ix + iw, iy + ih * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        break;
      }
      default: {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(ix, iy, iw, ih);
        ctx.fillStyle = 'rgba(252, 211, 77, 0.35)';
        for (let i = 0; i < 36; i++) {
          ctx.fillRect(ix + ((i * 23) % iw), iy + ((i * 31) % ih), 2, 2);
        }
        break;
      }
    }

    const leak = ctx.createRadialGradient(ix + iw, iy, 2, ix + iw, iy, iw * 0.55);
    leak.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
    leak.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = leak;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.restore();
  }

  _drawRFWaveLink(ctx, x1, y1, x2, y2, now, opts = {}) {
    const {
      color = 'rgba(251, 191, 36, 0.35)',
      coreColor = 'rgba(254, 243, 199, 0.7)',
      amp = 4,
      freq = 0.08,
      speed = 6,
      alpha = 1
    } = opts;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return;
    const ux = dx / dist;
    const uy = dy / dist;
    const nx = -uy;
    const ny = ux;
    const steps = Math.max(18, Math.min(48, Math.floor(dist / 10)));

    ctx.save();
    ctx.globalAlpha = alpha;

    // Subtle carrier corridor line
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -now * 28;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Modulated sinusoidal RF carrier waveform traveling from sender -> receiver
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const env = Math.sin(t * Math.PI);
      const wave = Math.sin(t * dist * freq - now * speed) * amp * env;
      const px = x1 + dx * t + nx * wave;
      const py = y1 + dy * t + ny * wave;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawDetailedMRO(ctx, sat, earth, isDream, hasToSat, hasToEarth, now) {
    ctx.save();
    ctx.translate(sat.x, sat.y);
    ctx.globalAlpha = isDream ? 0.52 : 1.0;

    // Subtle warm telemetry aura when receiving from Oppy or relaying to Earth
    if (this.satFlash > 0.02 || hasToEarth || hasToSat) {
      const glowR = 44 + this.satFlash * 22;
      const sg = ctx.createRadialGradient(0, 0, 4, 0, 0, glowR);
      sg.addColorStop(0, hasToEarth ? 'rgba(56, 189, 248, 0.36)' : 'rgba(251, 191, 36, 0.32)');
      sg.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dual large cobalt-blue solar wings with cell grid & structural trusses
    for (const side of [-1, 1]) {
      const wx = side * 12;
      const wLen = 24;
      const wH = 10;
      const rx = side < 0 ? wx - wLen : wx;

      // Hinge strut
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(side * 6, 0);
      ctx.lineTo(wx, 0);
      ctx.stroke();

      const wingG = ctx.createLinearGradient(rx, -wH * 0.5, rx + wLen, wH * 0.5);
      wingG.addColorStop(0, '#075985');
      wingG.addColorStop(0.5, '#0ea5e9');
      wingG.addColorStop(1, '#0369a1');
      ctx.fillStyle = wingG;
      ctx.fillRect(rx, -wH * 0.5, wLen, wH);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(rx, -wH * 0.5, wLen, wH);

      // Photovoltaic cell grid lines
      ctx.strokeStyle = 'rgba(12, 74, 110, 0.7)';
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + wLen, 0);
      for (let c = 1; c <= 3; c++) {
        const cx = rx + (wLen * c) / 4;
        ctx.moveTo(cx, -wH * 0.5);
        ctx.lineTo(cx, wH * 0.5);
      }
      ctx.stroke();
    }

    // Spacecraft Bus (Gold Kapton MLI octagonal chassis + HiRISE nadir barrel)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3.5, 5, 7, 5); // HiRISE / UHF nadir sensor housing
    ctx.fillStyle = hasToSat ? '#fcd34d' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 10.5, 2.1, 0, Math.PI * 2);
    ctx.fill();

    const busG = ctx.createLinearGradient(-7, -6, 7, 6);
    busG.addColorStop(0, '#f59e0b');
    busG.addColorStop(0.55, '#b45309');
    busG.addColorStop(1, '#78350f');
    ctx.fillStyle = busG;
    ctx.fillRect(-7, -6, 14, 12);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(-7, -6, 14, 12);

    // Gimballed 3m High-Gain Parabolic Dish aimed directly toward 3D Earth!
    const aimAngle = Math.atan2(earth.y - sat.y, earth.x - sat.x);
    ctx.save();
    ctx.translate(0, -8);
    ctx.rotate(aimAngle);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(2, 0, 3.2, 8.5, 0, -Math.PI * 0.5, Math.PI * 0.5, true);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = (hasToEarth || this.satFlash > 0.1) ? '#38bdf8' : '#94a3b8';
    ctx.stroke();
    // Feed horn glow
    ctx.fillStyle = (hasToEarth || this.satFlash > 0.1) ? '#7dd3fc' : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(6.5, 0, hasToEarth ? 2.6 : 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Compact MRO status label
    ctx.font = '600 9.5px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = (hasToEarth || this.satFlash > 0.1) ? 'rgba(125, 211, 252, 0.9)' : 'rgba(203, 213, 225, 0.72)';
    ctx.fillText('MRO RELAY', 0, -21 + 0.3 * Math.sin(now * 2));
    ctx.restore();
  }

  render(ctx, w, h) {
    const isDream = this.goalReached;
    const en = window.VantaI18n && window.VantaI18n.isEn();

    // Deep Martian twilight gradient + RTX Nebula
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#040610');
    bg.addColorStop(0.55, '#0c1228');
    bg.addColorStop(0.84, '#241422');
    bg.addColorStop(1, '#3b180e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: 0.62,
        lumen: 0.92,
        cyan: 0.42,
        stars: 0.62
      });
    }

    const now = performance.now() * 0.001;
    if (window.VantaGfx) {
      if (!this._spectralStars) this._spectralStars = window.VantaGfx.createStarfield(115, 0.78);
      window.VantaGfx.drawStarfield(ctx, this._spectralStars, w, h, now, 0.92);
    }

    const dish = this._getOppyDishPos(w, h);
    const sat = this._getSatellitePos(w, h);
    const earth = this._getEarthPos(w, h);
    const hasToSat = this.packets.some(p => p.stage === 'toSat');
    const hasToEarth = this.packets.some(p => p.stage === 'toEarth');

    // Distant Perseverance Valley ridge silhouettes & foreground Martian terrain
    const horY = h * 0.855;
    ctx.save();
    ctx.fillStyle = '#180d14';
    ctx.beginPath();
    ctx.moveTo(0, horY + 12);
    ctx.lineTo(w * 0.16, horY - 22);
    ctx.lineTo(w * 0.36, horY - 4);
    ctx.lineTo(w * 0.56, horY - 28);
    ctx.lineTo(w * 0.78, horY - 9);
    ctx.lineTo(w, horY - 20);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    const groundG = ctx.createLinearGradient(0, horY - 6, 0, h);
    groundG.addColorStop(0, '#3a1a0e');
    groundG.addColorStop(0.55, '#261009');
    groundG.addColorStop(1, '#120806');
    ctx.fillStyle = groundG;
    ctx.beginPath();
    ctx.moveTo(0, horY + 6);
    ctx.quadraticCurveTo(w * 0.28, horY - 8, w * 0.54, horY + 4);
    ctx.quadraticCurveTo(w * 0.8, horY + 14, w, horY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Pebbles & faint Opportunity sunset horizon haze
    ctx.fillStyle = 'rgba(251, 146, 60, 0.08)';
    ctx.fillRect(0, horY - 2, w, 12);
    ctx.fillStyle = 'rgba(18, 9, 8, 0.85)';
    for (const pb of this.pebbles) {
      const px = pb.rx * w;
      const py = horY + 12 + pb.ry * (h - horY - 16);
      ctx.beginPath();
      ctx.ellipse(px, py, pb.r * 1.4, pb.r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3D Earth (DSN Destination) rendered via 57,344-poly WebGL renderer
    ctx.save();
    const earthPulse = 0.25 + this.earthFlash * 0.65;
    const eHalo = ctx.createRadialGradient(earth.x, earth.y, earth.r * 0.6, earth.x, earth.y, earth.r * 2.1);
    eHalo.addColorStop(0, `rgba(56, 189, 248, ${earthPulse})`);
    eHalo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = eHalo;
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, earth.r * 2.1, 0, Math.PI * 2);
    ctx.fill();

    const drewGL = window.vantaPlanetGL && window.vantaPlanetGL.drawPlanet(
      ctx, 'earth', earth.x, earth.y, earth.r,
      { spin: 1.15 + now * 0.06, tilt: 0.22, sunDir: [-0.64, 0.36, 0.68], alpha: isDream ? 0.85 : 1.0 }
    );
    if (!drewGL) {
      const eg = ctx.createRadialGradient(earth.x - earth.r * 0.3, earth.y - earth.r * 0.3, 2, earth.x, earth.y, earth.r);
      eg.addColorStop(0, '#38bdf8');
      eg.addColorStop(0.6, '#1d4ed8');
      eg.addColorStop(1, '#082f49');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(earth.x, earth.y, earth.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Earth DSN label & 3 received-memory indicator orbs below Earth
    ctx.font = '600 9.5px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(186, 230, 253, 0.88)';
    ctx.fillText(en ? 'EARTH • DSN' : 'TRÁI ĐẤT • DSN', earth.x, earth.y + earth.r + 14);
    for (let i = 0; i < 3; i++) {
      const rx = earth.x + (i - 1) * 14;
      const ry = earth.y + earth.r + 25;
      const lit = i < this.earthReceived;
      ctx.fillStyle = lit ? '#38bdf8' : 'rgba(148, 163, 184, 0.28)';
      ctx.shadowColor = lit ? '#38bdf8' : 'transparent';
      ctx.shadowBlur = lit ? 10 : 0;
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // MRO Orbit Track arc
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.setLineDash([4, 7]);
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const ox = w * (0.14 + t * 0.42);
      const oy = h * 0.14 - Math.sin(t * Math.PI) * h * 0.035;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Vintage Polaroid Memory Cards (drawn cleanly before RF signal beams so signals stay unobstructed)
    for (const c of this.cards) {
      if (c.sent) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      const shrink = c.launching ? Math.max(0.18, 1 - c.launchProgress * 0.82) : 1;
      ctx.scale(shrink, shrink);
      ctx.rotate(c.tilt);

      if (!isDream) {
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = c.launching ? 'rgba(252, 211, 77, 0.85)' : 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = c.launching ? 22 : 16;
        ctx.beginPath();
        ctx.roundRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        this._drawPolaroidArt(ctx, c.art, c.w, c.h);
      } else {
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.25 + 0.12 * Math.sin(now + c.floatPhase)})`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
      }
      ctx.restore();
    }

    // Mars Rover wheel tracks trailing behind Opportunity
    ctx.save();
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(0, dish.roverY + 2);
    ctx.lineTo(dish.roverX - 32 * dish.scale, dish.roverY - 1);
    ctx.moveTo(0, dish.roverY + 8);
    ctx.lineTo(dish.roverX - 24 * dish.scale, dish.roverY + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Stage 1 Link: Opportunity Dish -> MRO Orbiter (UHF Amber RF Carrier)
    this._drawRFWaveLink(ctx, dish.x, dish.y, sat.x, sat.y, now, {
      color: hasToSat ? 'rgba(251, 191, 36, 0.65)' : 'rgba(245, 158, 11, 0.24)',
      coreColor: hasToSat ? 'rgba(254, 243, 199, 0.94)' : 'rgba(252, 211, 77, 0.42)',
      amp: hasToSat ? 6.5 : 3.0,
      freq: 0.07,
      speed: hasToSat ? 11 : 4.5,
      alpha: isDream ? 0.38 : 1.0
    });

    // Stage 2 Link: MRO Orbiter -> 3D Earth (X-Band Cyan-Emerald Deep Space Downlink)
    this._drawRFWaveLink(ctx, sat.x, sat.y, earth.x, earth.y, now, {
      color: hasToEarth ? 'rgba(56, 189, 248, 0.75)' : 'rgba(56, 189, 248, 0.26)',
      coreColor: hasToEarth ? 'rgba(186, 230, 253, 0.96)' : 'rgba(125, 211, 252, 0.42)',
      amp: hasToEarth ? 5.5 : 2.2,
      freq: 0.11,
      speed: hasToEarth ? 14 : 6,
      alpha: isDream ? 0.50 : 1.0
    });

    // Technical band tags right next to each link
    if (!isDream) {
      ctx.save();
      ctx.font = '600 9.5px ui-monospace, SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      if (hasToSat || this.oppTxFlash > 0.05) {
        const mx1 = (dish.x + sat.x) * 0.5;
        const my1 = (dish.y + sat.y) * 0.5;
        ctx.fillStyle = 'rgba(253, 230, 138, 0.92)';
        ctx.fillText('UHF 401 MHz ↗', mx1 - 54, my1);
      }
      if (hasToEarth || this.satFlash > 0.05) {
        const mx2 = (sat.x + earth.x) * 0.5;
        const my2 = (sat.y + earth.y) * 0.5 - 14;
        ctx.fillStyle = 'rgba(125, 211, 252, 0.95)';
        ctx.fillText('X-BAND 8.4 GHz ➔', mx2, my2);
      }
      ctx.restore();
    }

    // Draw MRO Orbiter over link endpoint
    this._drawDetailedMRO(ctx, sat, earth, isDream, hasToSat, hasToEarth, now);

    // Expanding Signal Ripples: Oppy UHF Rings, MRO Relay Lock Rings, Earth DSN Rings
    for (const r of this.radioRings) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${r.alpha * 0.85})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      const angleToSat = Math.atan2(sat.y - r.y, sat.x - r.x);
      ctx.arc(r.x, r.y, r.r, angleToSat - 0.55, angleToSat + 0.55);
      ctx.stroke();
    }
    for (const r of this.mroRings) {
      ctx.strokeStyle = `rgba(103, 232, 249, ${r.alpha})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const r of this.earthRings) {
      ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Animated Data Packets (Stage 1: Amber Oppy->MRO, Stage 2: Cyan MRO->Earth)
    for (const p of this.packets) {
      const px = p.x + (p.tx - p.x) * p.progress;
      const py = p.y + (p.ty - p.y) * p.progress;
      const tailT = Math.max(0, p.progress - 0.14);
      const tx = p.x + (p.tx - p.x) * tailT;
      const ty = p.y + (p.ty - p.y) * tailT;
      const isStage2 = p.stage === 'toEarth';

      ctx.save();
      const trailG = ctx.createLinearGradient(tx, ty, px, py);
      trailG.addColorStop(0, isStage2 ? 'rgba(56, 189, 248, 0)' : 'rgba(245, 158, 11, 0)');
      trailG.addColorStop(1, isStage2 ? 'rgba(186, 230, 253, 0.95)' : 'rgba(254, 243, 199, 0.95)');
      ctx.strokeStyle = trailG;
      ctx.lineWidth = isStage2 ? 3.5 : 4.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px, py);
      ctx.stroke();

      for (let b = 1; b <= 3; b++) {
        const bt = Math.max(0, p.progress - b * 0.045);
        const bx = p.x + (p.tx - p.x) * bt;
        const by = p.y + (p.ty - p.y) * bt;
        ctx.fillStyle = isStage2 ? `rgba(125, 211, 252, ${0.85 - b * 0.2})` : `rgba(252, 211, 77, ${0.85 - b * 0.2})`;
        ctx.beginPath();
        ctx.arc(bx, by, 3.0 - b * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isStage2 ? '#e0f2fe' : '#fef3c7';
      ctx.shadowColor = isStage2 ? '#38bdf8' : '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(px, py, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Drag Tether connecting held Polaroid -> Opportunity's HGA/UHF Dish
    if (this.draggedCard && !isDream) {
      this._drawRFWaveLink(ctx, this.draggedCard.x, this.draggedCard.y, dish.x, dish.y, now, {
        color: 'rgba(251, 191, 36, 0.5)',
        coreColor: 'rgba(254, 243, 199, 0.85)',
        amp: 3.5,
        freq: 0.08,
        speed: 9
      });
    }

    // Opportunity Rover (MER-B) with glowing High-Gain Dish Beacon
    ctx.save();
    ctx.translate(dish.roverX, dish.roverY);
    if (window.VantaGfx) {
      window.VantaGfx.drawMERRover(ctx, { silhouette: isDream, scale: dish.scale });
    }
    ctx.restore();

    // Glowing Uplink Transmitter Ring + 3 Rover Memory Buffer Orbs at Opportunity's Dish
    ctx.save();
    const txGlow = (0.35 + 0.25 * Math.sin(now * 3.5) + this.oppTxFlash * 0.6) * (isDream ? 0.35 : 1.0);
    const dg = ctx.createRadialGradient(dish.x, dish.y, 2, dish.x, dish.y, 34);
    dg.addColorStop(0, `rgba(254, 243, 199, ${txGlow})`);
    dg.addColorStop(0.45, `rgba(245, 158, 11, ${txGlow * 0.55})`);
    dg.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.arc(dish.x, dish.y, 34, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const filled = i < this.sentCards.length;
      const sx = dish.x + (i - 1) * 12;
      const sy = dish.y - 16;
      ctx.fillStyle = filled ? '#fcd34d' : 'rgba(148, 163, 184, 0.3)';
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (this.ghostAlpha > 0.01 && this.cards[4]) {
      drawGhostHand(ctx, this.cards[4].homeX, this.cards[4].homeY, this.ghostAlpha, 1, false);
    }
  }

  getSessionMetric() {
    const en = window.VantaI18n && window.VantaI18n.isEn();
    return en
      ? `${this.earthReceived}/3 Relayed via MRO to Earth • 6 Stays on Mars`
      : `${this.earthReceived}/3 Ảnh Qua Vệ Tinh Về Trái Đất • 6 Ảnh Ở Lại`;
  }
}

/* ============================================================================
 * 5. MOON STILL RINGS — Mặt Trăng Vẫn Ngân (Lunar Resonance vs Earth)
 * ==========================================================================*/
class MoonStillRingsGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.fallbackDuration = 20;
    this.targetImpacts = 5;
    this.goalReached = false;
    this.finaleTimer = 0;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.9;

    this.isEarthMode = false;
    this.moonWaves = [];
    this.earthWaves = [];
    this.fallingModules = [];
    this.impactFlashes = [];
    this.impactCount = 0;
    this.seismographHistory = new Array(160).fill(0);

    // 5 clear resonant tuning nodes around the rim
    this.nodes = Array.from({ length: 5 }, (_, i) => ({
      angle: -Math.PI / 2 + (i / 5) * Math.PI * 2,
      noteIdx: (i * 2) % 10,
      lit: false
    }));

    this.downX = 0;
    this.downY = 0;
    this.swiped = false;
  }

  onResize() {}

  _getBowlGeometry(w, h) {
    return { cx: w * 0.5, cy: h * 0.44, r: Math.min(w, h) * (w < 640 ? 0.30 : 0.25) };
  }

  _getSwitchRect(w, h) {
    return { cx: w * 0.5, y: w < 640 ? h * 0.90 : h * 0.93, w: 120, h: 32 };
  }

  onPointerDown(x, y) {
    this.downX = x;
    this.downY = y;
    this.swiped = false;
    if (!this.hasInteracted) this.hasInteracted = true;

    // One-tap Moon <-> Earth Orb Switcher pill at bottom
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sw = this._getSwitchRect(w, h);
    if (Math.abs(y - sw.y) < 38 && Math.abs(x - sw.cx) < sw.w * 0.85) {
      this.swiped = true;
      this.isEarthMode = x > sw.cx;
      window.soundEngine.playUITick();
      window.soundEngine.playPentatonicNote(this.isEarthMode ? 0 : 5, 0.14, 0.7);
    }
  }

  onPointerMove(x) {
    if (this.swiped) return;
    if (Math.abs(x - this.downX) > 60) {
      this.swiped = true;
      this.isEarthMode = !this.isEarthMode;
      window.soundEngine.playUITick();
      window.soundEngine.playPentatonicNote(this.isEarthMode ? 0 : 5, 0.14, 0.7);
    }
  }

  onPointerUp(x, y) {
    if (this.swiped) return;
    this.impactCount++;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { cx, cy, r } = this._getBowlGeometry(w, h);
    const px = Number.isFinite(x) ? x : this.downX;
    const py = Number.isFinite(y) ? y : this.downY;

    // Check if user tapped near one of the 5 tuning nodes for clean magnetic snap
    let bestAngle = Math.atan2(py - cy, px - cx);
    let noteIdx = Math.floor(((bestAngle + Math.PI) / (Math.PI * 2)) * 10) % 10;
    let snappedNode = null;
    let bestNodeDist = Infinity;
    for (const nd of this.nodes) {
      const nx = cx + Math.cos(nd.angle) * r;
      const ny = cy + Math.sin(nd.angle) * r;
      const d = Math.hypot(px - nx, py - ny);
      if (d < bestNodeDist) {
        bestNodeDist = d;
        if (d < 78) {
          snappedNode = nd;
          bestAngle = nd.angle;
          noteIdx = nd.noteIdx;
        }
      }
    }

    const ix = cx + Math.cos(bestAngle) * r;
    const iy = cy + Math.sin(bestAngle) * r;
    this.fallingModules.push({
      x0: ix + Math.cos(bestAngle) * 115,
      y0: iy + Math.sin(bestAngle) * 115,
      x1: ix,
      y1: iy,
      progress: 0,
      noteIdx,
      node: snappedNode,
      isEarth: this.isEarthMode
    });
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    for (let i = this.fallingModules.length - 1; i >= 0; i--) {
      const m = this.fallingModules[i];
      m.progress += dt * 4.8;
      if (m.progress >= 1) {
        this.fallingModules.splice(i, 1);
        if (m.node) m.node.lit = true;
        window.soundEngine.playSingingBowl(m.noteIdx, m.isEarth);
        this.impactFlashes.push({ x: m.x1, y: m.y1, alpha: 1.0, isEarth: m.isEarth });
        const waveList = m.isEarth ? this.earthWaves : this.moonWaves;
        waveList.push({
          x: m.x1,
          y: m.y1,
          radius: 5,
          energy: 1.0,
          decay: m.isEarth ? 1.8 : 0.075
        });
      }
    }

    for (let i = this.impactFlashes.length - 1; i >= 0; i--) {
      this.impactFlashes[i].alpha -= dt * 2.6;
      if (this.impactFlashes[i].alpha <= 0) this.impactFlashes.splice(i, 1);
    }

    for (let i = this.moonWaves.length - 1; i >= 0; i--) {
      const wv = this.moonWaves[i];
      wv.radius += dt * 72;
      wv.energy = Math.max(0, wv.energy - dt * wv.decay);
      if (wv.energy <= 0.01) this.moonWaves.splice(i, 1);
    }

    for (let i = this.earthWaves.length - 1; i >= 0; i--) {
      const wv = this.earthWaves[i];
      wv.radius += dt * 90;
      wv.energy = Math.max(0, wv.energy - dt * wv.decay);
      if (wv.energy <= 0.01) this.earthWaves.splice(i, 1);
    }

    const activeWaves = this.isEarthMode ? this.earthWaves : this.moonWaves;
    let totalEnergy = 0;
    for (const wv of activeWaves) totalEnergy += wv.energy;
    const sample =
      Math.sin(performance.now() * 0.045) *
      Math.min(1.5, totalEnergy) *
      (0.6 + Math.random() * 0.4);
    this.seismographHistory.push(sample);
    if (this.seismographHistory.length > 160) this.seismographHistory.shift();

    if (!this.goalReached && (this.impactCount >= this.targetImpacts || this.elapsed >= this.fallbackDuration)) {
      this.goalReached = true;
      window.soundEngine.playSignatureMotif(5);
    }

    if (this.goalReached && !this.completed) {
      this.finaleTimer += dt;
      if (this.finaleTimer >= 1.65) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  render(ctx, w, h) {
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
    bg.addColorStop(0, '#0a1022');
    bg.addColorStop(0.65, '#050814');
    bg.addColorStop(1, '#02040a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: 0.62,
        lumen: 0.95,
        cyan: 0.35,
        stars: 0.55
      });
    }

    if (window.VantaGfx) {
      if (!this._stars) this._stars = window.VantaGfx.createStarfield(130, 0.95);
      window.VantaGfx.drawStarfield(ctx, this._stars, w, h, performance.now() * 0.001, 0.82);
    }

    const { cx, cy, r } = this._getBowlGeometry(w, h);
    const activeWaves = this.isEarthMode ? this.earthWaves : this.moonWaves;

    // Falling Ascent Stage Meteors
    for (const m of this.fallingModules) {
      const mx = m.x0 + (m.x1 - m.x0) * m.progress;
      const my = m.y0 + (m.y1 - m.y0) * m.progress;
      ctx.save();
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x0, m.y0);
      ctx.lineTo(mx, my);
      ctx.stroke();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Geological Cutaway Singing Bowl
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const interiorGrad = ctx.createRadialGradient(cx, cy, r * 0.06, cx, cy, r);
    if (!this.isEarthMode) {
      interiorGrad.addColorStop(0, '#9a3412');
      interiorGrad.addColorStop(0.24, '#451a03');
      interiorGrad.addColorStop(0.64, '#1e1b2e');
      interiorGrad.addColorStop(1, '#0f172a');
    } else {
      interiorGrad.addColorStop(0, '#0f766e');
      interiorGrad.addColorStop(0.35, '#115e59');
      interiorGrad.addColorStop(0.7, '#0c2d48');
      interiorGrad.addColorStop(1, '#081426');
    }
    ctx.fillStyle = interiorGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    ctx.strokeStyle = this.isEarthMode ? 'rgba(45, 212, 191, 0.25)' : 'rgba(252, 211, 77, 0.22)';
    ctx.lineWidth = 1.2;
    for (const frac of [0.2, 0.45, 0.72, 0.92]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * frac, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const wv of activeWaves) {
      const maxR = r * 1.9;
      const bounceR = wv.radius % maxR;
      ctx.strokeStyle = this.isEarthMode
        ? `rgba(56, 189, 248, ${wv.energy * 0.78})`
        : `rgba(252, 211, 77, ${wv.energy * 0.88})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, bounceR, 0, Math.PI * 2);
      ctx.stroke();

      if (!this.isEarthMode) {
        ctx.strokeStyle = `rgba(245, 158, 11, ${wv.energy * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, (bounceR * 0.62) % maxR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    for (const fl of this.impactFlashes) {
      const fg = ctx.createRadialGradient(fl.x, fl.y, 1, fl.x, fl.y, 28);
      fg.addColorStop(0, `rgba(255, 255, 255, ${fl.alpha})`);
      fg.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer Resonating Rim
    let rimEnergy = 0;
    for (const wv of activeWaves) rimEnergy += wv.energy;
    ctx.save();
    ctx.strokeStyle = this.isEarthMode ? '#38bdf8' : '#fcd34d';
    ctx.shadowColor = this.isEarthMode ? '#0284c7' : '#f59e0b';
    ctx.shadowBlur = Math.min(38, 14 + rimEnergy * 20);
    ctx.lineWidth = 2.5 + Math.min(3.5, rimEnergy * 1.6);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 5 Luminous Tuning Nodes around the rim
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() * 0.004);
    for (const nd of this.nodes) {
      const nx = cx + Math.cos(nd.angle) * r;
      const ny = cy + Math.sin(nd.angle) * r;
      ctx.save();
      ctx.fillStyle = nd.lit ? '#fef3c7' : (this.isEarthMode ? '#38bdf8' : '#fcd34d');
      ctx.shadowColor = this.isEarthMode ? '#0284c7' : '#f59e0b';
      ctx.shadowBlur = nd.lit ? 18 : 8 * pulse;
      ctx.beginPath();
      ctx.arc(nx, ny, nd.lit ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Seismograph Waveform Trace
    const traceW = Math.min(440, w * 0.8);
    const traceX = (w - traceW) * 0.5;
    const traceY = h * 0.82;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 16, 32, 0.55)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.roundRect(traceX - 10, traceY - 30, traceW + 20, 60, 14);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(traceX, traceY);
    ctx.lineTo(traceX + traceW, traceY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    ctx.strokeStyle = this.isEarthMode ? '#38bdf8' : '#fcd34d';
    ctx.shadowColor = this.isEarthMode ? '#38bdf8' : '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    this.seismographHistory.forEach((val, idx) => {
      const px = traceX + (idx / (this.seismographHistory.length - 1)) * traceW;
      const py = traceY + val * 22;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    // Clear Wordless Moon vs Earth Orb Pill Toggle at bottom
    const sw = this._getSwitchRect(w, h);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.roundRect(sw.cx - 42, sw.y - 14, 84, 28, 99);
    ctx.fill();
    ctx.stroke();

    // Moon orb (left)
    ctx.fillStyle = !this.isEarthMode ? '#fcd34d' : 'rgba(148, 163, 184, 0.45)';
    ctx.shadowColor = !this.isEarthMode ? '#f59e0b' : 'transparent';
    ctx.shadowBlur = !this.isEarthMode ? 12 : 0;
    ctx.beginPath();
    ctx.arc(sw.cx - 19, sw.y, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Earth orb (right)
    ctx.fillStyle = this.isEarthMode ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)';
    ctx.shadowColor = this.isEarthMode ? '#0284c7' : 'transparent';
    ctx.shadowBlur = this.isEarthMode ? 12 : 0;
    ctx.beginPath();
    ctx.arc(sw.cx + 19, sw.y, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.ghostAlpha > 0.01) {
      const gx = cx + Math.cos(this.nodes[0].angle) * r;
      const gy = cy + Math.sin(this.nodes[0].angle) * r;
      drawGhostHand(ctx, gx, gy, this.ghostAlpha, 1, false);
    }
  }

  getSessionMetric() {
    return `${Math.max(1, this.impactCount)} Va chạm • Q-Factor ~3500`;
  }
}

/* ============================================================================
 * 6. ETERNAL FOOTPRINT — Dấu chân bất tận (Normal-Lit Lunar Regolith & Earthrise)
 * ==========================================================================*/
class EternalFootprintGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.fallbackDuration = 22;
    this.targetSteps = 5;
    this.goalReached = false;
    this.finaleTimer = 0;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.9;

    this.sunAngle = 0.24;
    this.isDraggingSlider = false;
    this.cameraZoomOut = 0;

    let seed = localStorage.getItem('echoes_boot_seed');
    if (!seed) {
      seed = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem('echoes_boot_seed', seed);
    }
    this.playerSeed = Number(seed);

    this.playerPrints = [];
    this.ballisticDust = [];
    this.stepToggle = 1;

    this.craters = Array.from({ length: 26 }, () => ({
      x: (Math.random() - 0.5) * 1.15,
      y: 0.3 + Math.random() * 0.65,
      r: 8 + Math.random() * 26
    }));

    this.strangerPrints = [];
    for (let i = 0; i < 180; i++) {
      const angle = i * 0.24;
      const rad = 70 + i * 4.2;
      this.strangerPrints.push({
        x: Math.cos(angle) * rad,
        y: Math.sin(angle) * rad * 0.65,
        rot: angle + Math.PI * 0.5,
        seed: (i * 7919) % 999
      });
    }
  }

  onResize() {}

  _getSliderRect(w, h) {
    const sw = Math.min(340, w * 0.66);
    return { x: (w - sw) * 0.5, y: w < 640 ? h * 0.85 : h * 0.89, w: sw };
  }

  onPointerDown(x, y) {
    if (!this.hasInteracted) this.hasInteracted = true;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const sl = this._getSliderRect(w, h);

    if (Math.abs(y - sl.y) < 42 && x >= sl.x - 28 && x <= sl.x + sl.w + 28) {
      this.isDraggingSlider = true;
      this.sunAngle = Math.max(0, Math.min(1, (x - sl.x) / sl.w));
      window.soundEngine.playUITick();
      return;
    }

    window.soundEngine.playHelmetStep();
    const note = (this.playerPrints.length * 2) % 8;
    window.soundEngine.playPentatonicNote(note, 0.14, 1.3, 0.04, 'sine');

    const cx = w * 0.5;
    const cy = h * 0.54;
    const minMoonY = h * 0.25 + 26;
    const footY = Math.max(y, minMoonY);
    this.stepToggle *= -1;
    this.playerPrints.push({
      x: x - cx,
      y: footY - cy,
      rot: -0.25 + this.stepToggle * 0.08,
      seed: this.playerSeed
    });

    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const spd = 48 + Math.random() * 60;
      this.ballisticDust.push({
        x0: x,
        y0: y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd * 0.5 - 58,
        t: 0,
        maxT: 0.65 + Math.random() * 0.25
      });
    }

    if (this.playerPrints.length >= this.targetSteps && !this.goalReached) {
      this.goalReached = true;
      window.soundEngine.playSignatureMotif(2);
    }
  }

  onPointerMove(x) {
    if (this.isDraggingSlider) {
      const sl = this._getSliderRect(window.innerWidth, window.innerHeight);
      this.sunAngle = Math.max(0, Math.min(1, (x - sl.x) / sl.w));
    }
  }

  onPointerUp() {
    this.isDraggingSlider = false;
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    for (let i = this.ballisticDust.length - 1; i >= 0; i--) {
      const p = this.ballisticDust[i];
      p.t += dt;
      if (p.t >= p.maxT) this.ballisticDust.splice(i, 1);
    }

    if (this.playerPrints.length >= 2) {
      const targetZoom = Math.min(0.45, (this.playerPrints.length / this.targetSteps) * 0.45);
      this.cameraZoomOut += (targetZoom - this.cameraZoomOut) * Math.min(1, dt * 2.5);
    }

    if (!this.goalReached && this.elapsed >= this.fallbackDuration) {
      this.goalReached = true;
      window.soundEngine.playSignatureMotif(2);
    }

    if (this.goalReached && !this.completed) {
      this.finaleTimer += dt;
      this.cameraZoomOut = Math.min(1, this.cameraZoomOut + dt * 0.6);
      if (this.finaleTimer >= 1.85) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  _drawBootprint(ctx, p, isPlayer, sunAngle, zoomOut) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const scale = isPlayer ? 1.0 : 0.72;
    ctx.scale(scale, scale);

    const sunDir = (sunAngle - 0.5) * 2;
    const reliefContrast = Math.max(0.18, Math.abs(sunDir));
    const micrometeoriteErosion = Math.max(0, (sunAngle - 0.75) * 3.0);
    const alpha = Math.max(0.14, (1 - micrometeoriteErosion) * (isPlayer ? 0.96 : zoomOut * 0.65));

    ctx.globalAlpha = alpha;

    const shadowOffX = -sunDir * 5 * reliefContrast;
    ctx.fillStyle = 'rgba(4, 7, 15, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-14 + shadowOffX, -26, 28, 52, 13);
    ctx.fill();

    ctx.fillStyle = isPlayer ? '#334155' : '#1e293b';
    ctx.strokeStyle = isPlayer ? '#fcd34d' : 'rgba(148, 163, 184, 0.55)';
    ctx.lineWidth = isPlayer ? 1.8 : 1;
    ctx.beginPath();
    ctx.roundRect(-14, -26, 28, 52, 13);
    ctx.fill();
    ctx.stroke();

    const ribs = 5;
    for (let r = 0; r < ribs; r++) {
      const ry = -17 + r * 8.5;
      const notch = ((p.seed >> r) & 1) === 1;
      ctx.fillStyle = 'rgba(6, 9, 18, 0.92)';
      ctx.fillRect(-11, ry + shadowOffX * 0.35, notch ? 10 : 22, 3.8);
      if (notch) ctx.fillRect(2, ry + shadowOffX * 0.35, 9, 3.8);
      ctx.fillStyle = isPlayer
        ? `rgba(252, 211, 77, ${0.42 + reliefContrast * 0.48})`
        : 'rgba(203, 213, 225, 0.42)';
      ctx.fillRect(-11, ry, 22, 1.8);
    }

    ctx.restore();
  }

  render(ctx, w, h) {
    ctx.fillStyle = '#03050b';
    ctx.fillRect(0, 0, w, h);

    const horizonY = h * 0.25;

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: 0.22,
        lumen: 0.85,
        cyan: 0.42,
        stars: 0.4,
        composite: 'screen'
      });
      window.vantaNebulaGL.drawBackdrop(ctx, w, horizonY + 14, {
        alpha: 0.88,
        lumen: 0.85,
        cyan: 0.55,
        stars: 0.95,
        composite: 'screen'
      });
    }

    // Luminous 3D RTX Earthrise
    if (!(window.vantaPlanetGL && window.vantaPlanetGL.drawPlanet(ctx, 'earth', w * 0.76, horizonY * 0.52, 22, {
      spin: this.elapsed * 0.04 + 2.35,
      tilt: 0.12,
      sunDir: [-0.45, 0.52, 0.72]
    }))) {
      ctx.save();
      ctx.translate(w * 0.76, horizonY * 0.52);
      const earthHalo = ctx.createRadialGradient(0, 0, 14, 0, 0, 34);
      earthHalo.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      earthHalo.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = earthHalo;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();

      const earthGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 18);
      earthGrad.addColorStop(0, '#e0f2fe');
      earthGrad.addColorStop(0.5, '#2563eb');
      earthGrad.addColorStop(1, '#020617');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Lunar Regolith Horizon with Micro-Grain
    const noonBrightness = 1 - Math.abs(this.sunAngle - 0.5) * 1.1;
    const regGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    regGrad.addColorStop(0, '#1e293b');
    regGrad.addColorStop(0.5, noonBrightness > 0.7 ? '#475569' : '#293548');
    regGrad.addColorStop(1, '#0b1120');
    ctx.fillStyle = regGrad;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(w * 0.5, horizonY - 20, w, horizonY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    if (window.VantaGfx) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.quadraticCurveTo(w * 0.5, horizonY - 20, w, horizonY);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.clip();
      const grain = window.VantaGfx.getGrainPattern(ctx, 0.08, false);
      if (grain) {
        ctx.fillStyle = grain;
        ctx.fillRect(0, horizonY - 24, w, h - horizonY + 24);
      }
      ctx.restore();
    }

    // Dynamic normal-lit micro-craters
    const sunDir = (this.sunAngle - 0.5) * 2;
    for (const c of this.craters) {
      const cx = w * 0.5 + c.x * w * 0.5;
      const cy = c.y * h;
      ctx.fillStyle = 'rgba(7, 11, 20, 0.38)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, c.r, c.r * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(226, 232, 240, ${0.15 + Math.abs(sunDir) * 0.22})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx - sunDir * 2, cy, c.r, c.r * 0.52, 0, sunDir > 0 ? Math.PI * 0.8 : -0.2, sunDir > 0 ? Math.PI * 1.9 : Math.PI * 0.9);
      ctx.stroke();
    }

    // Gold-Foil Apollo Lunar Module Descent Stage
    if (window.VantaGfx) {
      window.VantaGfx.drawApolloLMDescent(ctx, w * 0.25, horizonY - 4, sunDir, 1.05);
    }

    // Footprints Field Camera Zoom (strictly clipped to Moon regolith surface)
    const cx = w * 0.5;
    const cy = h * 0.54;
    const zoom = 1 - this.cameraZoomOut * 0.62;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 8);
    ctx.quadraticCurveTo(w * 0.5, horizonY - 12, w, horizonY + 8);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.clip();

    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);

    if (this.cameraZoomOut > 0.02) {
      for (const sp of this.strangerPrints) {
        this._drawBootprint(ctx, sp, false, this.sunAngle, this.cameraZoomOut);
      }
    }

    for (const pp of this.playerPrints) {
      this._drawBootprint(ctx, pp, true, this.sunAngle, this.cameraZoomOut);
    }
    ctx.restore();

    // Parabolic Ballistic Dust Arcs
    const lunarG = 190;
    ctx.fillStyle = '#fcd34d';
    for (const p of this.ballisticDust) {
      const px = p.x0 + p.vx * p.t;
      const py = p.y0 + p.vy * p.t + 0.5 * lunarG * p.t * p.t;
      ctx.beginPath();
      ctx.arc(px, py, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Sun-Azimuth Slider Bar with Sun / Moon Orbs
    const sl = this._getSliderRect(w, h);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.roundRect(sl.x - 16, sl.y - 12, sl.w + 32, 24, 99);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(254, 243, 199, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sl.x, sl.y);
    ctx.lineTo(sl.x + sl.w, sl.y);
    ctx.stroke();

    const knobX = sl.x + this.sunAngle * sl.w;
    ctx.fillStyle = '#fcd34d';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(knobX, sl.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.ghostAlpha > 0.01) {
      drawGhostHand(ctx, cx, cy, this.ghostAlpha, 1, false);
    }
  }

  getSessionMetric() {
    return `VNTL-${this.playerSeed} • ${Math.max(1, this.playerPrints.length)} Dấu chân`;
  }
}

window.UnsentGame = UnsentGame;
window.MoonStillRingsGame = MoonStillRingsGame;
window.EternalFootprintGame = EternalFootprintGame;
