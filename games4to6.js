/**
 * Minigames 4–6 Implementation
 * 4. UNSENT — Những điều chưa kịp gửi (Opportunity Rover Flash Memory & 3 Polaroids)
 * 5. MOON STILL RINGS — Mặt Trăng vẫn ngân (Apollo 12 Seismic Singing Bowl vs Earth)
 * 6. ETERNAL FOOTPRINT — Dấu chân bất tận (LRO Lunar Bootprints, Sun Slider & Shared Field)
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
    this.satelliteDuration = 22; // 22s for relay orbiter pass
    this.dreamDuration = 9; // 9s lullaby dream playback after sunset
    this.completed = false;
    this.hasInteracted = false;
    this.ghostAlpha = 0.85;

    this.sentCards = [];
    this.packets = [];
    this.draggedCard = null;
    this.dreamNoteTimer = 0;
    this.dreamIndex = 0;

    this._initPolaroids();
  }

  _initPolaroids() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // 9 procedural Martian Polaroid memories with unique pentatonic notes
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
    const cardW = Math.min(108, w * 0.24);
    const cardH = cardW * 1.22;
    const gapX = cardW * 1.28;
    const gapY = cardH * 1.12;
    const startX = w * 0.5 - gapX;
    const startY = h * 0.52 - gapY * 0.85;

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
    return { x: w * 0.5, y: h * 0.17 };
  }

  onPointerDown(x, y) {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
    }
    if (this.sentCards.length >= 3 || this.elapsed >= this.satelliteDuration) return;

    // Pick topmost polaroid under pointer
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const c = this.cards[i];
      if (c.sent) continue;
      if (Math.abs(x - c.x) <= c.w * 0.55 && Math.abs(y - c.y) <= c.h * 0.55) {
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

    // If dragged into upper antenna transmission zone (or upper 32% of screen)
    if (c.y < h * 0.32 || Math.hypot(c.x - ant.x, c.y - ant.y) < 110) {
      c.sent = true;
      this.sentCards.push(c);
      window.soundEngine.playPentatonicNote(c.note, 0.25, 1.9, 0, 'triangle');

      const satProgress = Math.min(1, this.elapsed / this.satelliteDuration);
      const satX = w * (0.12 + satProgress * 0.76);
      const satY = h * 0.11;

      this.packets.push({
        x: c.x,
        y: c.y,
        tx: satX,
        ty: satY,
        progress: 0
      });

      // If 3 memories chosen before satellite sets, fast-forward gently to dusk dream
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

    // Spring unselected polaroids gently back to their floating positions
    const now = performance.now() * 0.0015;
    for (const c of this.cards) {
      if (c !== this.draggedCard && !c.sent) {
        const targetX = c.homeX + Math.sin(now + c.floatPhase) * 4;
        const targetY = c.homeY + Math.cos(now * 1.2 + c.floatPhase) * 4;
        c.x += (targetX - c.x) * Math.min(1, dt * 8);
        c.y += (targetY - c.y) * Math.min(1, dt * 8);
      }
    }

    // Animate light packets flying to relay orbiter
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += dt * 1.8;
      if (p.progress >= 1) this.packets.splice(i, 1);
    }

    // Dream Lullaby phase (after satellite passes)
    if (this.elapsed > this.satelliteDuration) {
      // Ensure at least 1 card is in dream if user didn't drag all 3
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
    const iw = w * 0.82;
    const ih = h * 0.68;
    const ix = -iw * 0.5;
    const iy = -h * 0.42;

    ctx.save();
    ctx.beginPath();
    ctx.rect(ix, iy, iw, ih);
    ctx.clip();

    // Duotone indigo-amber base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ix, iy, iw, ih);

    ctx.strokeStyle = '#fcd34d';
    ctx.fillStyle = '#f59e0b';
    ctx.lineWidth = 1.5;

    switch (art) {
      case 'sunrise':
        ctx.beginPath();
        ctx.arc(0, iy + ih * 0.65, iw * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'dustdevil':
        ctx.beginPath();
        ctx.moveTo(-8, iy + ih);
        ctx.bezierCurveTo(-18, iy + ih * 0.5, 18, iy + ih * 0.3, 4, iy + 6);
        ctx.stroke();
        break;
      case 'tracks':
        ctx.beginPath();
        ctx.moveTo(ix + 8, iy + ih);
        ctx.lineTo(-4, iy + ih * 0.35);
        ctx.moveTo(ix + iw - 8, iy + ih);
        ctx.lineTo(6, iy + ih * 0.35);
        ctx.stroke();
        break;
      case 'shadow':
        ctx.fillRect(-10, iy + ih * 0.55, 20, 12);
        ctx.beginPath();
        ctx.moveTo(0, iy + ih * 0.55);
        ctx.lineTo(0, iy + ih * 0.25);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, iy + ih * 0.25, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'earthstar':
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(iw * 0.15, iy + ih * 0.3, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'berries':
        for (const [bx, by] of [[-12, 0], [4, -6], [10, 8], [-2, 10]]) {
          ctx.beginPath();
          ctx.arc(bx, iy + ih * 0.5 + by, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'crater':
        ctx.beginPath();
        ctx.ellipse(0, iy + ih * 0.6, iw * 0.36, ih * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'twinpeaks':
        ctx.beginPath();
        ctx.moveTo(ix, iy + ih * 0.75);
        ctx.lineTo(-iw * 0.18, iy + ih * 0.4);
        ctx.lineTo(0, iy + ih * 0.65);
        ctx.lineTo(iw * 0.2, iy + ih * 0.35);
        ctx.lineTo(ix + iw, iy + ih * 0.75);
        ctx.stroke();
        break;
      default:
        // Last storm grain
        for (let i = 0; i < 18; i++) {
          ctx.fillRect(ix + ((i * 19) % iw), iy + ((i * 29) % ih), 2, 2);
        }
        break;
    }

    ctx.restore();
  }

  render(ctx, w, h) {
    const isDream = this.elapsed >= this.satelliteDuration;

    // 1. Deep Indigo Night Sky
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#050814');
    bg.addColorStop(1, '#131836');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Relay Orbiter gliding across upper sky + 3 bandwidth slots
    const satProgress = Math.min(1, this.elapsed / this.satelliteDuration);
    const satX = w * (0.12 + satProgress * 0.76);
    const satY = h * 0.11;

    if (!isDream) {
      // Satellite trajectory arc
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(w * 0.12, satY);
      ctx.lineTo(w * 0.88, satY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving orbiter icon
      ctx.save();
      ctx.translate(satX, satY);
      ctx.fillStyle = '#fcd34d';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Antenna Uplink Receiver Ring + 3 Bandwidth Slots
    const ant = this._getAntennaPos(w, h);
    ctx.save();
    ctx.translate(ant.x, ant.y);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();

    // 3 bandwidth indicator gems inside antenna
    for (let i = 0; i < 3; i++) {
      const filled = i < this.sentCards.length;
      ctx.fillStyle = filled ? '#fcd34d' : 'rgba(148, 163, 184, 0.28)';
      ctx.beginPath();
      ctx.arc((i - 1) * 16, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Flying Light Packets
    for (const p of this.packets) {
      const px = p.x + (p.tx - p.x) * p.progress;
      const py = p.y + (p.ty - p.y) * p.progress;
      ctx.fillStyle = '#fef3c7';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(px, py, 6 * (1 - p.progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 4. Opportunity Rover silhouette at bottom with blinking lamp
    const roverY = h * 0.91;
    ctx.save();
    ctx.translate(w * 0.5, roverY);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.fillRect(-28, -12, 56, 14);
    ctx.strokeRect(-28, -12, 56, 14);
    ctx.beginPath();
    ctx.moveTo(10, -12);
    ctx.lineTo(14, -36);
    ctx.stroke();

    // Blinking warm heartbeat lamp on rover mast
    const lampPulse = 0.4 + 0.6 * Math.sin(performance.now() * 0.006);
    ctx.fillStyle = `rgba(252, 211, 77, ${lampPulse})`;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(14, -38, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Polaroids: During pass vs Night Dream Lullaby
    if (!isDream) {
      for (const c of this.cards) {
        if (c.sent) continue;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.tilt);
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 12;
        ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
        ctx.shadowBlur = 0;
        this._drawPolaroidArt(ctx, c.art, c.w, c.h);
        ctx.restore();
      }
    } else {
      // Unsent memories leave ghostly dashed outlines around the rover
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

      // The 3 Sent Polaroids glow warmly in the center as the custom lullaby plays
      const activeIdx = (this.dreamIndex - 1 + this.sentCards.length) % this.sentCards.length;
      this.sentCards.forEach((c, idx) => {
        const dx = w * 0.5 + (idx - (this.sentCards.length - 1) * 0.5) * (c.w * 1.35);
        const dy = h * 0.48;
        const isPlaying = idx === activeIdx;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.scale(isPlaying ? 1.12 : 0.96, isPlaying ? 1.12 : 0.96);
        ctx.fillStyle = '#fef3c7';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = isPlaying ? 28 : 10;
        ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
        ctx.shadowBlur = 0;
        this._drawPolaroidArt(ctx, c.art, c.w, c.h);
        ctx.restore();
      });
    }

    // 6. Ghost Hand dragging a polaroid toward the antenna
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
 * 5. MOON STILL RINGS — Mặt Trăng vẫn ngân (Lunar Seismic Singing Bowl vs Earth)
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
    this.ghostAlpha = 0.85;
    this.impactCount = 0;

    this.isEarthMode = false; // Swipe left/right to compare Moon vs Earth!
    this.moonWaves = [];
    this.earthWaves = [];
    this.fallingModules = [];
    this.seismographHistory = new Array(160).fill(0);

    this.downX = 0;
    this.downY = 0;
    this.swiped = false;
  }

  onResize() {}

  _getBowlGeometry(w, h) {
    return {
      cx: w * 0.5,
      cy: h * 0.48,
      r: Math.min(w, h) * 0.29
    };
  }

  onPointerDown(x, y) {
    this.downX = x;
    this.downY = y;
    this.swiped = false;
    if (!this.hasInteracted) {
      this.hasInteracted = true;
    }
  }

  onPointerMove(x, y) {
    if (this.swiped) return;
    const dx = x - this.downX;
    if (Math.abs(dx) > 75) {
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

    // Map tap angle on the Moon/Earth rim to pentatonic pitch
    const angle = Math.atan2(y - cy, x - cx);
    const ix = cx + Math.cos(angle) * r;
    const iy = cy + Math.sin(angle) * r;
    const noteIdx = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 10) % 10;

    // Trigger spent Apollo module impact & singing bowl resonance
    window.soundEngine.playSingingBowl(noteIdx, this.isEarthMode);

    const waveList = this.isEarthMode ? this.earthWaves : this.moonWaves;
    waveList.push({
      x: ix,
      y: iy,
      angle,
      radius: 4,
      energy: 1.0,
      decay: this.isEarthMode ? 1.85 : 0.065 // Earth damps fast; Moon rings on and on!
    });
  }

  update(dt) {
    if (this.hasInteracted) {
      this.elapsed += dt;
      this.ghostAlpha = Math.max(0, this.ghostAlpha - dt * 2.5);
    }

    // Update Lunar Waves (persist even when viewing Earth!)
    for (let i = this.moonWaves.length - 1; i >= 0; i--) {
      const wv = this.moonWaves[i];
      wv.radius += dt * 65;
      wv.energy = Math.max(0, wv.energy - dt * wv.decay);
      if (wv.energy <= 0.01) this.moonWaves.splice(i, 1);
    }

    // Update Earth Waves (rapidly damped by water/mantle)
    for (let i = this.earthWaves.length - 1; i >= 0; i--) {
      const wv = this.earthWaves[i];
      wv.radius += dt * 90;
      wv.energy = Math.max(0, wv.energy - dt * wv.decay);
      if (wv.energy <= 0.01) this.earthWaves.splice(i, 1);
    }

    // Update seismometer trace
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
    // 1. Deep Indigo Space Backdrop
    ctx.fillStyle = '#060a17';
    ctx.fillRect(0, 0, w, h);

    const { cx, cy, r } = this._getBowlGeometry(w, h);
    const activeWaves = this.isEarthMode ? this.earthWaves : this.moonWaves;

    // 2. Cross-Section Singing Bowl (Moon = Ivory/Amber dry crust; Earth = Teal/Blue damped)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const interiorGrad = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r);
    if (!this.isEarthMode) {
      interiorGrad.addColorStop(0, '#3b2313');
      interiorGrad.addColorStop(0.55, '#1e1b2e');
      interiorGrad.addColorStop(1, '#0f172a');
    } else {
      interiorGrad.addColorStop(0, '#134e4a');
      interiorGrad.addColorStop(0.6, '#0f2942');
      interiorGrad.addColorStop(1, '#0b1528');
    }
    ctx.fillStyle = interiorGrad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

    // Internal core rings (line-art singing bowl)
    ctx.strokeStyle = this.isEarthMode
      ? 'rgba(45, 212, 191, 0.25)'
      : 'rgba(252, 211, 77, 0.22)';
    ctx.lineWidth = 1.2;
    for (const frac of [0.25, 0.55, 0.82]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * frac, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Render reverberating seismic wave rings reflecting inside the planetary bowl
    for (const wv of activeWaves) {
      const maxR = r * 1.9;
      // Fold radius so waves bounce back and forth across the interior!
      const bounceR = wv.radius % maxR;
      ctx.strokeStyle = this.isEarthMode
        ? `rgba(56, 189, 248, ${wv.energy * 0.7})`
        : `rgba(252, 211, 77, ${wv.energy * 0.78})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, bounceR, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary harmonic interference ring
      if (!this.isEarthMode) {
        ctx.strokeStyle = `rgba(245, 158, 11, ${wv.energy * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, (bounceR * 0.65) % maxR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Outer Singing Bowl Rim (breathes with seismic energy)
    let rimEnergy = 0;
    for (const wv of activeWaves) rimEnergy += wv.energy;
    ctx.save();
    ctx.strokeStyle = this.isEarthMode ? '#38bdf8' : '#fcd34d';
    ctx.shadowColor = this.isEarthMode ? '#0284c7' : '#f59e0b';
    ctx.shadowBlur = Math.min(35, 10 + rimEnergy * 18);
    ctx.lineWidth = 2.5 + Math.min(3, rimEnergy * 1.5);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Apollo Passive Seismometer Station at top of the rim
    ctx.save();
    ctx.translate(cx, cy - r);
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(0, -14);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Live Seismometer Waveform Trace at bottom (Wordless visual proof)
    const traceW = Math.min(420, w * 0.78);
    const traceX = (w - traceW) * 0.5;
    const traceY = h * 0.86;
    ctx.save();
    ctx.strokeStyle = this.isEarthMode ? '#38bdf8' : '#fcd34d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    this.seismographHistory.forEach((val, idx) => {
      const px = traceX + (idx / (this.seismographHistory.length - 1)) * traceW;
      const py = traceY + val * 24;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Two subtle planetary toggle dots below trace (Moon vs Earth swipe indicator)
    ctx.fillStyle = !this.isEarthMode ? '#fcd34d' : 'rgba(148,163,184,0.35)';
    ctx.beginPath();
    ctx.arc(w * 0.5 - 12, h * 0.93, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.isEarthMode ? '#38bdf8' : 'rgba(148,163,184,0.35)';
    ctx.beginPath();
    ctx.arc(w * 0.5 + 12, h * 0.93, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Ghost Hand tapping the Lunar rim
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
 * 6. ETERNAL FOOTPRINT — Dấu chân bất tận (Lunar Bootprints, Sun Slider & Millions of Years)
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
    this.ghostAlpha = 0.85;

    this.sunAngle = 0.22; // 0 = low grazing dawn, 0.5 = noon, 1.0 = deep geological time (millions of years)
    this.isDraggingSlider = false;
    this.cameraZoomOut = 0;
    this.musicOpened = false;

    // Generate unique deterministic boot tread seed for this player
    let seed = localStorage.getItem('echoes_boot_seed');
    if (!seed) {
      seed = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem('echoes_boot_seed', seed);
    }
    this.playerSeed = Number(seed);

    // Load or seed predecessors' footprints + player's footprints
    this.playerPrints = [];
    this.ballisticDust = [];
    this.stepToggle = 1;

    // Pre-existing trails from thousands of strangers (revealed as camera pulls back)
    this.strangerPrints = [];
    for (let i = 0; i < 160; i++) {
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
    const sw = Math.min(320, w * 0.68);
    return {
      x: (w - sw) * 0.5,
      y: h * 0.87,
      w: sw
    };
  }

  onPointerDown(x, y) {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const sl = this._getSliderRect(w, h);

    // Check if touching the Sun Angle / Geological Time slider at bottom
    if (Math.abs(y - sl.y) < 32 && x >= sl.x - 20 && x <= sl.x + sl.w + 20) {
      this.isDraggingSlider = true;
      this.sunAngle = Math.max(0, Math.min(1, (x - sl.x) / sl.w));
      return;
    }

    // Stamp a sharp lunar bootprint on the regolith!
    window.soundEngine.playHelmetStep();
    const cx = w * 0.5;
    const cy = h * 0.52;
    this.stepToggle *= -1;
    this.playerPrints.push({
      x: x - cx,
      y: y - cy,
      rot: -0.25 + this.stepToggle * 0.08,
      seed: this.playerSeed,
      age: 0
    });

    // Spawn clean parabolic vacuum dust trajectories (no atmospheric drag!)
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const spd = 45 + Math.random() * 55;
      this.ballisticDust.push({
        x0: x,
        y0: y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd * 0.5 - 55,
        t: 0,
        maxT: 0.65 + Math.random() * 0.25
      });
    }

    // Trigger camera pull-back after 3+ footprints
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

    // Update parabolic vacuum dust particles: x(t) = x0 + vx*t, y(t) = y0 + vy*t + 0.5*g*t^2
    for (let i = this.ballisticDust.length - 1; i >= 0; i--) {
      const p = this.ballisticDust[i];
      p.t += dt;
      if (p.t >= p.maxT) this.ballisticDust.splice(i, 1);
    }

    // Smoothly pull camera back after player leaves several footprints or time > 16s
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

    // Normal-map inspired grazing shadow relief: deep shadow at low sun, flat at noon (0.5), eroded at 1.0
    const sunDir = (sunAngle - 0.5) * 2; // -1..1
    const reliefContrast = Math.max(0.15, Math.abs(sunDir));
    const micrometeoriteErosion = Math.max(0, (sunAngle - 0.75) * 3.2); // Fades at "millions of years"
    const alpha = Math.max(0.12, (1 - micrometeoriteErosion) * (isPlayer ? 0.95 : zoomOut * 0.65));

    ctx.globalAlpha = alpha;

    // Boot outline depression
    const shadowOffX = -sunDir * 4.5 * reliefContrast;
    ctx.fillStyle = 'rgba(7, 11, 22, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-14 + shadowOffX, -26, 28, 52, 13);
    ctx.fill();

    ctx.fillStyle = isPlayer ? '#334155' : '#1e293b';
    ctx.strokeStyle = isPlayer ? '#fcd34d' : 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = isPlayer ? 1.6 : 1;
    ctx.beginPath();
    ctx.roundRect(-14, -26, 28, 52, 13);
    ctx.fill();
    ctx.stroke();

    // Hash-generated unique boot tread ribs
    const ribs = 5;
    for (let r = 0; r < ribs; r++) {
      const ry = -17 + r * 8.5;
      const notch = ((p.seed >> r) & 1) === 1;
      ctx.fillStyle = 'rgba(9, 13, 26, 0.9)';
      ctx.fillRect(-11, ry + shadowOffX * 0.35, notch ? 10 : 22, 3.5);
      if (notch) {
        ctx.fillRect(2, ry + shadowOffX * 0.35, 9, 3.5);
      }
      ctx.fillStyle = isPlayer
        ? `rgba(252, 211, 77, ${0.35 + reliefContrast * 0.45})`
        : 'rgba(203, 213, 225, 0.4)';
      ctx.fillRect(-11, ry, 22, 1.8);
    }

    ctx.restore();
  }

  render(ctx, w, h) {
    // 1. Deep Lunar Horizon & Blue Earth hanging low
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, w, h);

    const horizonY = h * 0.24;
    // Tiny Blue Marble Earth suspended above horizon
    ctx.save();
    ctx.translate(w * 0.76, horizonY * 0.52);
    const earthGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
    earthGrad.addColorStop(0, '#93c5fd');
    earthGrad.addColorStop(0.6, '#1d4ed8');
    earthGrad.addColorStop(1, '#05070e');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Lunar Regolith Surface shaded by Sun Angle
    const noonBrightness = 1 - Math.abs(this.sunAngle - 0.5) * 1.1;
    const regGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    regGrad.addColorStop(0, '#1e293b');
    regGrad.addColorStop(0.5, noonBrightness > 0.7 ? '#475569' : '#273549');
    regGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = regGrad;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.quadraticCurveTo(w * 0.5, horizonY - 18, w, horizonY);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Distant Apollo Lunar Module Descent Stage on the horizon
    ctx.save();
    ctx.translate(w * 0.25, horizonY - 4);
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1.2;
    ctx.fillRect(-12, -10, 24, 10);
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-20, 8);
    ctx.moveTo(12, 0);
    ctx.lineTo(20, 8);
    ctx.stroke();
    ctx.restore();

    // 3. Camera Zoom Container for Footprints Field
    const cx = w * 0.5;
    const cy = h * 0.52;
    const zoom = 1 - this.cameraZoomOut * 0.62;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);

    // Draw thousands of stranger footprints when camera pulls back
    if (this.cameraZoomOut > 0.02) {
      for (const sp of this.strangerPrints) {
        this._drawBootprint(ctx, sp, false, this.sunAngle, this.cameraZoomOut);
      }
    }

    // Draw player's own footprints (glowing warm amber point in the collective path)
    for (const pp of this.playerPrints) {
      this._drawBootprint(ctx, pp, true, this.sunAngle, this.cameraZoomOut);
    }
    ctx.restore();

    // 4. Clean Parabolic Ballistic Dust Arcs (Vacuum physics: y = y0 + vy*t + 0.5*g*t^2)
    const lunarG = 190;
    ctx.fillStyle = '#fcd34d';
    for (const p of this.ballisticDust) {
      const px = p.x0 + p.vx * p.t;
      const py = p.y0 + p.vy * p.t + 0.5 * lunarG * p.t * p.t;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Wordless Sun Angle & Geological Time Slider at bottom
    const sl = this._getSliderRect(w, h);
    ctx.save();
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sl.x, sl.y);
    ctx.lineTo(sl.x + sl.w, sl.y);
    ctx.stroke();

    const knobX = sl.x + this.sunAngle * sl.w;
    ctx.fillStyle = '#fcd34d';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(knobX, sl.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Ghost Hand before first touch
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
