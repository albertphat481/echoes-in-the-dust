/**
 * VantaLumen — Minigames 4–6 (High-Craft Cinematic Edition)
 * 4. UNSENT: Tactile vintage NASA Polaroid frames + UHF radio arcs + orbiting MRO
 * 5. MOON STILL RINGS: Cutaway planetary geology + falling Apollo LM stage + phosphor seismograph
 * 6. ETERNAL FOOTPRINT: Normal-shaded lunar regolith craters + gold-foil Apollo lander + Earthrise
 */

/* ============================================================================
 * 4. UNSENT — Những điều chưa kịp gửi (Opportunity Rover)
 * ==========================================================================*/
class UnsentGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.satelliteDuration = 22;
    this.dreamDuration = 9;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.88;

    this.sentCards = [];
    this.packets = [];
    this.radioRings = [];
    this.draggedCard = null;
    this.dreamNoteTimer = 0;
    this.dreamIndex = 0;

    this.stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.7,
      s: Math.random() * 1.5 + 0.3,
      p: Math.random() * Math.PI * 2
    }));

    this._initPolaroids();
  }

  _initPolaroids() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const types = [
      { id: 0, note: 0, art: 'sunrise', tilt: -0.08 },
      { id: 1, note: 1, art: 'dustdevil', tilt: 0.06 },
      { id: 2, note: 2, art: 'tracks', tilt: -0.04 },
      { id: 3, note: 3, art: 'shadow', tilt: 0.09 },
      { id: 4, note: 4, art: 'earthstar', tilt: -0.03 },
      { id: 5, note: 5, art: 'berries', tilt: 0.05 },
      { id: 6, note: 6, art: 'crater', tilt: -0.07 },
      { id: 7, note: 7, art: 'twinpeaks', tilt: 0.04 },
      { id: 8, note: 8, art: 'laststorm', tilt: -0.05 }
    ];

    const cols = 3;
    const cardW = Math.min(114, w * 0.25);
    const cardH = cardW * 1.24;
    const gapX = cardW * 1.32;
    const gapY = cardH * 1.15;
    const startX = w * 0.5 - gapX;
    const startY = h * 0.54 - gapY * 0.88;

    this.cards = types.map((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * gapX + (Math.random() - 0.5) * 10;
      const y = startY + row * gapY + (Math.random() - 0.5) * 8;
      return {
        ...t,
        homeX: x,
        homeY: y,
        x,
        y,
        w: cardW,
        h: cardH,
        sent: false,
        floatPhase: Math.random() * Math.PI * 2
      };
    });
  }

  onResize() {
    this._initPolaroids();
  }

  _getAntennaPos(w, h) {
    return { x: w * 0.5, y: h * 0.18 };
  }

  onPointerDown(x, y) {
    if (!this.hasInteracted) this.hasInteracted = true;
    if (this.sentCards.length >= 3 || this.elapsed >= this.satelliteDuration) return;

    for (let i = this.cards.length - 1; i >= 0; i--) {
      const c = this.cards[i];
      if (c.sent) continue;
      if (Math.abs(x - c.x) <= c.w * 0.56 && Math.abs(y - c.y) <= c.h * 0.56) {
        this.draggedCard = c;
        window.soundEngine.playPentatonicNote(c.note, 0.14, 0.7, 0, 'sine');
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

  onPointerUp() {
    if (!this.draggedCard) return;
    const c = this.draggedCard;
    this.draggedCard = null;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const ant = this._getAntennaPos(w, h);

    if (c.y < h * 0.34 || Math.hypot(c.x - ant.x, c.y - ant.y) < 115) {
      c.sent = true;
      this.sentCards.push(c);
      window.soundEngine.playTapeWhoosh();
      window.soundEngine.playPentatonicNote(c.note, 0.25, 1.9, 0.08, 'triangle');

      const satProgress = Math.min(1, this.elapsed / this.satelliteDuration);
      const satX = w * (0.12 + satProgress * 0.76);
      const satY = h * 0.1;

      this.packets.push({ x: c.x, y: c.y, tx: satX, ty: satY, progress: 0 });
      this.radioRings.push({ x: ant.x, y: ant.y, r: 36, alpha: 0.9 });

      if (this.sentCards.length === 3 && this.elapsed < this.satelliteDuration - 1.5) {
        this.elapsed = this.satelliteDuration - 1.5;
      }
    }
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    const now = performance.now() * 0.0015;
    for (const c of this.cards) {
      if (c !== this.draggedCard && !c.sent) {
        const targetX = c.homeX + Math.sin(now + c.floatPhase) * 4;
        const targetY = c.homeY + Math.cos(now * 1.2 + c.floatPhase) * 4;
        c.x += (targetX - c.x) * Math.min(1, dt * 8);
        c.y += (targetY - c.y) * Math.min(1, dt * 8);
      }
    }

    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += dt * 1.75;
      if (p.progress >= 1) this.packets.splice(i, 1);
    }

    for (let i = this.radioRings.length - 1; i >= 0; i--) {
      const r = this.radioRings[i];
      r.r += dt * 140;
      r.alpha -= dt * 0.8;
      if (r.alpha <= 0) this.radioRings.splice(i, 1);
    }

    if (this.elapsed > this.satelliteDuration) {
      if (this.sentCards.length === 0) {
        this.sentCards.push(this.cards[0], this.cards[4], this.cards[2]);
        this.cards[0].sent = this.cards[4].sent = this.cards[2].sent = true;
      }

      this.dreamNoteTimer += dt;
      if (this.dreamNoteTimer >= 1.15) {
        this.dreamNoteTimer = 0;
        const card = this.sentCards[this.dreamIndex % this.sentCards.length];
        window.soundEngine.playPentatonicNote(card.note, 0.22, 2.2, 0, 'triangle');
        this.dreamIndex++;
      }
    }

    if (this.elapsed >= this.satelliteDuration + this.dreamDuration && !this.completed) {
      this.completed = true;
      window.soundEngine.playSignatureMotif(0);
      this.host.completeCurrentGame();
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

    // Rich photographic duotone gradient base
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
        // Last storm analog grain
        ctx.fillStyle = '#451a03';
        ctx.fillRect(ix, iy, iw, ih);
        ctx.fillStyle = 'rgba(252, 211, 77, 0.35)';
        for (let i = 0; i < 36; i++) {
          ctx.fillRect(ix + ((i * 23) % iw), iy + ((i * 31) % ih), 2, 2);
        }
        break;
      }
    }

    // Subtle analog film light-leak corner on Polaroid
    const leak = ctx.createRadialGradient(ix + iw, iy, 2, ix + iw, iy, iw * 0.55);
    leak.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
    leak.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = leak;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.restore();
  }

  render(ctx, w, h) {
    const isDream = this.elapsed >= this.satelliteDuration;

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#040610');
    bg.addColorStop(0.6, '#0c1228');
    bg.addColorStop(1, '#18142c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const now = performance.now() * 0.001;
    for (const st of this.stars) {
      ctx.fillStyle = `rgba(226, 232, 240, ${0.35 + 0.45 * Math.sin(now * 2 + st.p)})`;
      ctx.beginPath();
      ctx.arc(st.x * w, st.y * h, st.s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Relay Orbiter (Mars Reconnaissance Orbiter with solar wings)
    const satProgress = Math.min(1, this.elapsed / this.satelliteDuration);
    const satX = w * (0.12 + satProgress * 0.76);
    const satY = h * 0.1;

    if (!isDream) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(w * 0.12, satY);
      ctx.lineTo(w * 0.88, satY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.translate(satX, satY);
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 1.4;
      ctx.fillRect(-22, -4, 16, 8); ctx.strokeRect(-22, -4, 16, 8);
      ctx.fillRect(6, -4, 16, 8); ctx.strokeRect(6, -4, 16, 8);
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Antenna Uplink Receiver Ring + Radio Waves
    const ant = this._getAntennaPos(w, h);
    for (const r of this.radioRings) {
      ctx.strokeStyle = `rgba(252, 211, 77, ${r.alpha})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(ant.x, ant.y);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const filled = i < this.sentCards.length;
      ctx.fillStyle = filled ? '#fcd34d' : 'rgba(148, 163, 184, 0.25)';
      ctx.shadowColor = filled ? '#f59e0b' : 'transparent';
      ctx.shadowBlur = filled ? 12 : 0;
      ctx.beginPath();
      ctx.arc((i - 1) * 16, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (const p of this.packets) {
      const px = p.x + (p.tx - p.x) * p.progress;
      const py = p.y + (p.ty - p.y) * p.progress;
      ctx.fillStyle = '#fef3c7';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(px, py, 6.5 * (1 - p.progress * 0.45), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Opportunity Rover silhouette at bottom with blinking lamp
    const roverY = h * 0.91;
    ctx.save();
    ctx.translate(w * 0.5, roverY);
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.fillRect(-32, -13, 64, 15);
    ctx.strokeRect(-32, -13, 64, 15);
    ctx.beginPath();
    ctx.moveTo(10, -13); ctx.lineTo(15, -40);
    ctx.stroke();

    const lampPulse = 0.4 + 0.6 * Math.sin(performance.now() * 0.006);
    ctx.fillStyle = `rgba(252, 211, 77, ${lampPulse})`;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(15, -42, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!isDream) {
      for (const c of this.cards) {
        if (c.sent) continue;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.tilt);
        ctx.fillStyle = '#f1f5f9';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 16;
        ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
        ctx.shadowBlur = 0;
        this._drawPolaroidArt(ctx, c.art, c.w, c.h);
        ctx.restore();
      }
    } else {
      for (const c of this.cards) {
        if (c.sent) continue;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.tilt);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-c.w * 0.45, -c.h * 0.45, c.w * 0.9, c.h * 0.9);
        ctx.restore();
      }

      const activeIdx = (this.dreamIndex - 1 + this.sentCards.length) % this.sentCards.length;
      this.sentCards.forEach((c, idx) => {
        const dx = w * 0.5 + (idx - (this.sentCards.length - 1) * 0.5) * (c.w * 1.38);
        const dy = h * 0.48;
        const isPlaying = idx === activeIdx;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.scale(isPlaying ? 1.14 : 0.96, isPlaying ? 1.14 : 0.96);
        ctx.fillStyle = '#fef3c7';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = isPlaying ? 30 : 12;
        ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
        ctx.shadowBlur = 0;
        this._drawPolaroidArt(ctx, c.art, c.w, c.h);
        ctx.restore();
      });
    }

    if (this.ghostAlpha > 0.01 && this.cards.length > 4) {
      const t = (performance.now() * 0.0008) % 1;
      const c = this.cards[4];
      const gx = c.x + (ant.x - c.x) * t;
      const gy = c.y + (ant.y - c.y) * t;
      drawGhostHand(ctx, gx, gy, this.ghostAlpha * (1 - t * 0.5), 1, true);
    }
  }

  getSessionMetric() {
    const noteNames = ['C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5'];
    const melody = this.sentCards.map(c => noteNames[c.note % noteNames.length]).join('–') || 'C4–F4–A4';
    return `${this.sentCards.length}/3 Ảnh • Bản ru ${melody}`;
  }
}

/* ============================================================================
 * 5. MOON STILL RINGS — Mặt Trăng vẫn ngân (Geological Singing Bowl & Seismograph)
 * ==========================================================================*/
class MoonStillRingsGame {
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
    this.impactCount = 0;

    this.isEarthMode = false;
    this.moonWaves = [];
    this.earthWaves = [];
    this.fallingModules = [];
    this.impactFlashes = [];
    this.seismographHistory = new Array(160).fill(0);

    this.downX = 0;
    this.downY = 0;
    this.swiped = false;
  }

  onResize() {}

  _getBowlGeometry(w, h) {
    return {
      cx: w * 0.5,
      cy: h * 0.46,
      r: Math.min(w, h) * 0.28
    };
  }

  onPointerDown(x, y) {
    this.downX = x;
    this.downY = y;
    this.swiped = false;
    if (!this.hasInteracted) this.hasInteracted = true;
  }

  onPointerMove(x) {
    if (this.swiped) return;
    if (Math.abs(x - this.downX) > 55) {
      this.swiped = true;
      this.isEarthMode = !this.isEarthMode;
      window.soundEngine.playPentatonicNote(this.isEarthMode ? 0 : 5, 0.12, 0.6);
    }
  }

  onPointerUp(x, y) {
    if (this.swiped) return;
    this.impactCount++;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const { cx, cy, r } = this._getBowlGeometry(w, h);

    const angle = Math.atan2(y - cy, x - cx);
    const ix = cx + Math.cos(angle) * r;
    const iy = cy + Math.sin(angle) * r;
    const noteIdx = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 10) % 10;

    const startX = ix + Math.cos(angle) * 120;
    const startY = iy + Math.sin(angle) * 120;
    this.fallingModules.push({
      x0: startX,
      y0: startY,
      x1: ix,
      y1: iy,
      progress: 0,
      noteIdx,
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
      m.progress += dt * 4.5;
      if (m.progress >= 1) {
        this.fallingModules.splice(i, 1);
        window.soundEngine.playSingingBowl(m.noteIdx, m.isEarth);
        this.impactFlashes.push({ x: m.x1, y: m.y1, alpha: 1.0, isEarth: m.isEarth });
        const waveList = m.isEarth ? this.earthWaves : this.moonWaves;
        waveList.push({
          x: m.x1,
          y: m.y1,
          radius: 4,
          energy: 1.0,
          decay: m.isEarth ? 1.85 : 0.065
        });
      }
    }

    for (let i = this.impactFlashes.length - 1; i >= 0; i--) {
      this.impactFlashes[i].alpha -= dt * 2.6;
      if (this.impactFlashes[i].alpha <= 0) this.impactFlashes.splice(i, 1);
    }

    for (let i = this.moonWaves.length - 1; i >= 0; i--) {
      const wv = this.moonWaves[i];
      wv.radius += dt * 65;
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

    if (this.elapsed >= this.duration && !this.completed) {
      this.completed = true;
      window.soundEngine.playSignatureMotif(5);
      this.host.completeCurrentGame();
    }
  }

  render(ctx, w, h) {
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, w, h);

    const { cx, cy, r } = this._getBowlGeometry(w, h);
    const activeWaves = this.isEarthMode ? this.earthWaves : this.moonWaves;

    // Falling Apollo Ascent Stage silhouette with thruster trail
    for (const m of this.fallingModules) {
      const mx = m.x0 + (m.x1 - m.x0) * m.progress;
      const my = m.y0 + (m.y1 - m.y0) * m.progress;
      ctx.save();
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.75)';
      ctx.lineWidth = 1.8;
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

    // Geological Cutaway Singing Bowl (Moon vs Earth)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const interiorGrad = ctx.createRadialGradient(cx, cy, r * 0.06, cx, cy, r);
    if (!this.isEarthMode) {
      // Moon: glowing partial-melt core -> dry silicate mantle -> fractured anorthosite crust
      interiorGrad.addColorStop(0, '#9a3412');
      interiorGrad.addColorStop(0.22, '#451a03');
      interiorGrad.addColorStop(0.62, '#1e1b2e');
      interiorGrad.addColorStop(1, '#0f172a');
    } else {
      // Earth: molten iron core -> convective mantle -> water-rich damped crust
      interiorGrad.addColorStop(0, '#0f766e');
      interiorGrad.addColorStop(0.35, '#115e59');
      interiorGrad.addColorStop(0.7, '#0c2d48');
      interiorGrad.addColorStop(1, '#081426');
    }
    ctx.fillStyle = interiorGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Subtle geological strata rings
    ctx.strokeStyle = this.isEarthMode ? 'rgba(45, 212, 191, 0.25)' : 'rgba(252, 211, 77, 0.22)';
    ctx.lineWidth = 1.2;
    for (const frac of [0.2, 0.45, 0.72, 0.92]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * frac, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Reverberating seismic interference rings
    for (const wv of activeWaves) {
      const maxR = r * 1.9;
      const bounceR = wv.radius % maxR;
      ctx.strokeStyle = this.isEarthMode
        ? `rgba(56, 189, 248, ${wv.energy * 0.75})`
        : `rgba(252, 211, 77, ${wv.energy * 0.85})`;
      ctx.lineWidth = 2.2;
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

    // Impact Flash on Rim
    for (const fl of this.impactFlashes) {
      const fg = ctx.createRadialGradient(fl.x, fl.y, 1, fl.x, fl.y, 26);
      fg.addColorStop(0, `rgba(255, 255, 255, ${fl.alpha})`);
      fg.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer Resonating Singing Bowl Rim
    let rimEnergy = 0;
    for (const wv of activeWaves) rimEnergy += wv.energy;
    ctx.save();
    ctx.strokeStyle = this.isEarthMode ? '#38bdf8' : '#fcd34d';
    ctx.shadowColor = this.isEarthMode ? '#0284c7' : '#f59e0b';
    ctx.shadowBlur = Math.min(38, 12 + rimEnergy * 20);
    ctx.lineWidth = 2.5 + Math.min(3.5, rimEnergy * 1.6);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Apollo Passive Seismometer Station at top of the rim
    ctx.save();
    ctx.translate(cx, cy - r);
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(-8, 0); ctx.lineTo(0, -15); ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Live Oscilloscope Grid + Seismometer Waveform Trace
    const traceW = Math.min(440, w * 0.8);
    const traceX = (w - traceW) * 0.5;
    const traceY = h * 0.85;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 16, 30, 0.65)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fillRect(traceX - 10, traceY - 34, traceW + 20, 68);
    ctx.strokeRect(traceX - 10, traceY - 34, traceW + 20, 68);

    // Center baseline
    ctx.beginPath();
    ctx.moveTo(traceX, traceY);
    ctx.lineTo(traceX + traceW, traceY);
    ctx.stroke();

    ctx.strokeStyle = this.isEarthMode ? '#38bdf8' : '#fcd34d';
    ctx.shadowColor = this.isEarthMode ? '#38bdf8' : '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.seismographHistory.forEach((val, idx) => {
      const px = traceX + (idx / (this.seismographHistory.length - 1)) * traceW;
      const py = traceY + val * 26;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    // Planetary Toggle Dots below trace
    ctx.fillStyle = !this.isEarthMode ? '#fcd34d' : 'rgba(148,163,184,0.35)';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 12, h * 0.935, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.isEarthMode ? '#38bdf8' : 'rgba(148,163,184,0.35)';
    ctx.beginPath();
    ctx.arc(w * 0.5 + 12, h * 0.935, 4.5, 0, Math.PI * 2);
    ctx.fill();

    if (this.ghostAlpha > 0.01) {
      const gx = cx + Math.cos(-0.6) * r;
      const gy = cy + Math.sin(-0.6) * r;
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
    this.duration = 34;
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.88;

    this.sunAngle = 0.22;
    this.isDraggingSlider = false;
    this.cameraZoomOut = 0;
    this.musicOpened = false;

    let seed = localStorage.getItem('echoes_boot_seed');
    if (!seed) {
      seed = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem('echoes_boot_seed', seed);
    }
    this.playerSeed = Number(seed);

    this.playerPrints = [];
    this.ballisticDust = [];
    this.stepToggle = 1;

    // Pre-seeded lunar surface rocks & micro-craters for normal-lit depth
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
    const sw = Math.min(340, w * 0.7);
    return { x: (w - sw) * 0.5, y: h * 0.88, w: sw };
  }

  onPointerDown(x, y) {
    if (!this.hasInteracted) this.hasInteracted = true;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const sl = this._getSliderRect(w, h);

    if (Math.abs(y - sl.y) < 34 && x >= sl.x - 24 && x <= sl.x + sl.w + 24) {
      this.isDraggingSlider = true;
      this.sunAngle = Math.max(0, Math.min(1, (x - sl.x) / sl.w));
      return;
    }

    window.soundEngine.playHelmetStep();
    const cx = w * 0.5;
    const cy = h * 0.54;
    this.stepToggle *= -1;
    this.playerPrints.push({
      x: x - cx,
      y: y - cy,
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

    if (this.playerPrints.length >= 4 && !this.musicOpened) {
      this.musicOpened = true;
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

    if (this.playerPrints.length >= 4 || this.elapsed > 17) {
      this.cameraZoomOut = Math.min(1, this.cameraZoomOut + dt * 0.18);
    }

    if (this.elapsed >= this.duration && !this.completed) {
      this.completed = true;
      if (!this.musicOpened) window.soundEngine.playSignatureMotif(2);
      this.host.completeCurrentGame();
    }
  }

  _drawBootprint(ctx, p, isPlayer, sunAngle, zoomOut) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const scale = isPlayer ? 1.0 : 0.72;
    ctx.scale(scale, scale);

    const sunDir = (sunAngle - 0.5) * 2;
    const reliefContrast = Math.max(0.15, Math.abs(sunDir));
    const micrometeoriteErosion = Math.max(0, (sunAngle - 0.75) * 3.2);
    const alpha = Math.max(0.12, (1 - micrometeoriteErosion) * (isPlayer ? 0.95 : zoomOut * 0.65));

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
        ? `rgba(252, 211, 77, ${0.38 + reliefContrast * 0.48})`
        : 'rgba(203, 213, 225, 0.4)';
      ctx.fillRect(-11, ry, 22, 1.8);
    }

    ctx.restore();
  }

  render(ctx, w, h) {
    ctx.fillStyle = '#03050b';
    ctx.fillRect(0, 0, w, h);

    const horizonY = h * 0.25;

    // Luminous Earthrise with atmospheric blue limb
    ctx.save();
    ctx.translate(w * 0.76, horizonY * 0.52);
    const earthHalo = ctx.createRadialGradient(0, 0, 14, 0, 0, 32);
    earthHalo.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    earthHalo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = earthHalo;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();

    const earthGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 17);
    earthGrad.addColorStop(0, '#e0f2fe');
    earthGrad.addColorStop(0.5, '#2563eb');
    earthGrad.addColorStop(1, '#020617');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Lunar Regolith Surface shaded dynamically by Sun Angle
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

    // Dynamic normal-lit lunar micro-craters across the surface
    const sunDir = (this.sunAngle - 0.5) * 2;
    for (const c of this.craters) {
      const cx = w * 0.5 + c.x * w * 0.5;
      const cy = c.y * h;
      ctx.fillStyle = 'rgba(7, 11, 20, 0.38)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, c.r, c.r * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(226, 232, 240, ${0.15 + Math.abs(sunDir) * 0.2})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx - sunDir * 2, cy, c.r, c.r * 0.52, 0, sunDir > 0 ? Math.PI * 0.8 : -0.2, sunDir > 0 ? Math.PI * 1.9 : Math.PI * 0.9);
      ctx.stroke();
    }

    // Detailed Gold-Foil Apollo Lunar Module Descent Stage on the horizon
    ctx.save();
    ctx.translate(w * 0.25, horizonY - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(-sunDir * 16, 10, 28, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1.4;
    ctx.fillRect(-14, -12, 28, 12);
    ctx.strokeRect(-14, -12, 28, 12);
    // Landing struts & footpads
    ctx.beginPath();
    ctx.moveTo(-14, -2); ctx.lineTo(-24, 10);
    ctx.moveTo(14, -2); ctx.lineTo(24, 10);
    ctx.moveTo(0, 0); ctx.lineTo(0, 10);
    ctx.stroke();
    ctx.restore();

    // Footprints Field Camera Zoom
    const cx = w * 0.5;
    const cy = h * 0.54;
    const zoom = 1 - this.cameraZoomOut * 0.62;

    ctx.save();
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
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wordless Sun Angle & Geological Time Slider
    const sl = this._getSliderRect(w, h);
    ctx.save();
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
    ctx.arc(knobX, sl.y, 9.5, 0, Math.PI * 2);
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
