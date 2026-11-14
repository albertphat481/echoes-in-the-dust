/**
 * Minigames 7–8 (Effortless, Wordless, Visually Luminous)
 * 7. PALE BLUE DOT   (Voyager 1 — 1990 Family Portrait & 0.12-pixel Earth)
 * 8. GRAND FINALE    (Cassini — Diving into Saturn while holding Earth Uplink)
 */

// =========================================================================
// MINIGAME 7: PALE BLUE DOT (Voyager 1 — Turn Back One Last Time)
// =========================================================================
class PaleBlueDotGame {
  constructor(host) {
    this.host = host;
    this.elapsed = 0;
    this.maxDuration = 22.0;
    this.completed = false;
    this.ending = false;
    this.finaleTimer = 0;
    this.ghostAlpha = 0;

    this.reticle = { x: 0, y: 0 };
    this.targetPos = { x: 0, y: 0 };
    this.lockedTarget = -1;
    this.shutterFlash = 0;
    this.capturedCount = 0;
    this.lastCaptureTime = -1;

    this.stars = Array.from({ length: 135 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.45 + 0.35,
      twinkle: Math.random() * Math.PI * 2
    }));

    this.targets = [
      {
        id: 'jupiter',
        rx: 0.25,
        ry: 0.37,
        radius: 17,
        color: '#f59e0b',
        core: '#fef3c7',
        captured: false,
        ringProgress: 0,
        bloom: 0
      },
      {
        id: 'saturn',
        rx: 0.51,
        ry: 0.29,
        radius: 14,
        color: '#fcd34d',
        core: '#fffbeb',
        hasRing: true,
        captured: false,
        ringProgress: 0,
        bloom: 0
      },
      {
        id: 'earth',
        rx: 0.74,
        ry: 0.45,
        radius: 5.5,
        color: '#38bdf8',
        core: '#e0f2fe',
        inSunbeam: true,
        captured: false,
        ringProgress: 0,
        bloom: 0
      }
    ];

    this.waves = [];
    this.onResize();
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (!this.reticle.x) {
      this.reticle.x = w * 0.5;
      this.reticle.y = h * 0.52;
      this.targetPos.x = this.reticle.x;
      this.targetPos.y = this.reticle.y;
    }
    this.targets.forEach(t => {
      t.x = w * t.rx;
      t.y = h * t.ry;
    });
  }

  onPointerDown(x, y) {
    if (this.completed || this.ending) return;
    this.targetPos.x = x;
    this.targetPos.y = y;

    const hitIdx = this._findSnapTarget(x, y, 108);
    if (hitIdx >= 0) {
      this.reticle.x = this.targets[hitIdx].x;
      this.reticle.y = this.targets[hitIdx].y;
      this.targetPos.x = this.reticle.x;
      this.targetPos.y = this.reticle.y;
      this._captureTarget(hitIdx);
    } else if (this.lockedTarget >= 0) {
      this._captureTarget(this.lockedTarget);
    } else {
      window.soundEngine.playUITick();
      this.waves.push({ x, y, r: 10, maxR: 60, alpha: 0.45, color: 'rgba(252, 211, 77,' });
    }
  }

  onPointerMove(x, y) {
    if (this.completed || this.ending) return;
    this.targetPos.x = x;
    this.targetPos.y = y;
  }

  onPointerUp() {}

  onKeyDown(e) {
    if (this.completed || this.ending) return false;
    if (e.code === 'Space') {
      const nextIdx = this.lockedTarget >= 0 ? this.lockedTarget : this.targets.findIndex(t => !t.captured);
      if (nextIdx >= 0) {
        this.reticle.x = this.targets[nextIdx].x;
        this.reticle.y = this.targets[nextIdx].y;
        this.targetPos.x = this.reticle.x;
        this.targetPos.y = this.reticle.y;
        this._captureTarget(nextIdx);
      }
      return true;
    }
    return false;
  }

  onKeyUp() {
    return false;
  }

  _findSnapTarget(x, y, maxDist = 92) {
    let best = -1;
    let bestDist = maxDist;
    this.targets.forEach((t, idx) => {
      if (t.captured) return;
      const d = Math.hypot(x - t.x, y - t.y);
      if (d < bestDist) {
        bestDist = d;
        best = idx;
      }
    });
    return best;
  }

  _captureTarget(idx) {
    const t = this.targets[idx];
    if (!t || t.captured) return;
    t.captured = true;
    t.bloom = 1.0;
    this.capturedCount++;
    this.lastCaptureTime = this.elapsed;
    this.shutterFlash = 0.85;

    window.soundEngine.playVoyagerShutter(idx);
    this.waves.push({
      x: t.x,
      y: t.y,
      r: 12,
      maxR: t.id === 'earth' ? 190 : 120,
      alpha: 0.92,
      color: t.id === 'earth' ? 'rgba(56, 189, 248,' : 'rgba(252, 211, 77,'
    });

    if (this.capturedCount >= 3) {
      this.ending = true;
      window.soundEngine.playSignatureMotif(4);
    }
  }

  update(dt) {
    this.elapsed += dt;
    this.shutterFlash = Math.max(0, this.shutterFlash - dt * 2.4);

    // Smooth reticle tracking + generous magnetic snap
    const snapIdx = this._findSnapTarget(this.targetPos.x, this.targetPos.y, 95);
    this.lockedTarget = snapIdx;
    const goalX = snapIdx >= 0 ? this.targets[snapIdx].x : this.targetPos.x;
    const goalY = snapIdx >= 0 ? this.targets[snapIdx].y : this.targetPos.y;
    const lerp = 1 - Math.exp(-dt * 12);
    this.reticle.x += (goalX - this.reticle.x) * lerp;
    this.reticle.y += (goalY - this.reticle.y) * lerp;

    this.targets.forEach(t => {
      if (t.captured) {
        t.ringProgress = Math.min(1, t.ringProgress + dt * 2.5);
        t.bloom = Math.max(0.35, t.bloom - dt * 0.4);
      }
    });

    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.r += dt * 135;
      w.alpha -= dt * 0.65;
      if (w.alpha <= 0 || w.r >= w.maxR) this.waves.splice(i, 1);
    }

    if (!this.ending && this.elapsed >= this.maxDuration) {
      this.ending = true;
      this.targets.forEach((t, i) => {
        if (!t.captured) {
          t.captured = true;
          t.bloom = 0.7;
          this.capturedCount++;
        }
      });
      window.soundEngine.playSignatureMotif(4);
    }

    if (this.ending && !this.completed) {
      this.finaleTimer += dt;
      if (this.finaleTimer >= 1.85) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  render(ctx, w, h) {
    // 1. Deep interstellar backdrop (6 billion km from Sun)
    const bg = ctx.createRadialGradient(w * 0.74, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
    bg.addColorStop(0, '#0c182c');
    bg.addColorStop(0.5, '#050914');
    bg.addColorStop(1, '#02040a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Stars
    this.stars.forEach(s => {
      const a = 0.25 + 0.45 * Math.sin(this.elapsed * 1.4 + s.twinkle);
      ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0.1, a)})`;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Iconic diagonal scattered-sunlight ray intersecting the Pale Blue Dot
    const earth = this.targets[2];
    ctx.save();
    ctx.translate(earth.x, earth.y);
    ctx.rotate(-0.42);
    const beamGrad = ctx.createLinearGradient(-46, 0, 46, 0);
    beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    beamGrad.addColorStop(0.32, 'rgba(245, 158, 11, 0.09)');
    beamGrad.addColorStop(0.5, 'rgba(254, 243, 199, 0.16)');
    beamGrad.addColorStop(0.68, 'rgba(245, 158, 11, 0.09)');
    beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(-46, -h, 92, h * 2);
    ctx.restore();

    // 4. Constellation capture lines connecting captured frames
    const capPts = this.targets.filter(t => t.captured);
    if (capPts.length >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.35)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(capPts[0].x, capPts[0].y);
      for (let i = 1; i < capPts.length; i++) ctx.lineTo(capPts[i].x, capPts[i].y);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Planet targets (Jupiter, Saturn, Pale Blue Dot Earth)
    this.targets.forEach((t, idx) => {
      const pulse = 1 + Math.sin(this.elapsed * 3 + idx * 1.3) * 0.18;
      const haloR = (t.inSunbeam ? 40 : 34) * pulse;
      const glow = ctx.createRadialGradient(t.x, t.y, 1, t.x, t.y, haloR);
      glow.addColorStop(0, t.inSunbeam ? 'rgba(56, 189, 248, 0.72)' : 'rgba(252, 211, 77, 0.52)');
      glow.addColorStop(0.45, t.inSunbeam ? 'rgba(56, 189, 248, 0.16)' : 'rgba(245, 158, 11, 0.14)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(t.x, t.y, haloR, 0, Math.PI * 2);
      ctx.fill();

      // Uncaptured beacon ring
      if (!t.captured) {
        ctx.strokeStyle = t.inSunbeam ? 'rgba(125, 211, 252, 0.65)' : 'rgba(252, 211, 77, 0.45)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 24 + Math.sin(this.elapsed * 3.5 + idx) * 3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Captured crystal diamond bracket
        ctx.strokeStyle = t.inSunbeam ? '#7dd3fc' : '#fcd34d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t.ringProgress);
        ctx.stroke();
      }

      // Saturn ring silhouette
      if (t.hasRing) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(-0.35);
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.72)';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, t.radius * 2.1, t.radius * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Planet disc
      ctx.fillStyle = t.core;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();

      if (t.id === 'jupiter') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.55)';
        ctx.fillRect(t.x - t.radius * 0.85, t.y - 3, t.radius * 1.7, 3);
        ctx.fillRect(t.x - t.radius * 0.72, t.y + 4, t.radius * 1.44, 2.5);
      }
    });

    // 6. Shockwaves
    this.waves.forEach(wv => {
      ctx.strokeStyle = `${wv.color} ${Math.max(0, wv.alpha)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 7. Voyager 1 Narrow-Angle Viewfinder Reticle
    if (!this.ending) {
      const rx = this.reticle.x;
      const ry = this.reticle.y;
      const locked = this.lockedTarget >= 0;
      const size = locked ? 30 : 38;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.strokeStyle = locked ? '#7dd3fc' : 'rgba(254, 243, 199, 0.75)';
      ctx.lineWidth = locked ? 2.2 : 1.5;

      // Corner camera crop brackets
      const arm = 11;
      [
        [-size, -size, 1, 1],
        [size, -size, -1, 1],
        [-size, size, 1, -1],
        [size, size, -1, -1]
      ].forEach(([cx, cy, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * arm);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + sx * arm, cy);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.arc(0, 0, locked ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = locked ? 'rgba(125, 211, 252, 0.45)' : 'rgba(252, 211, 77, 0.35)';
      ctx.fill();
      ctx.restore();
    }

    // 8. Bottom 3-frame Family Portrait Orbital Film Strip (Wordless Progress Dots)
    const stripY = h - 54;
    const spacing = 46;
    const startX = w * 0.5 - spacing;
    this.targets.forEach((t, i) => {
      const fx = startX + i * spacing;
      ctx.save();
      ctx.fillStyle = t.captured ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.55)';
      ctx.strokeStyle = t.captured ? (t.inSunbeam ? '#38bdf8' : '#fcd34d') : 'rgba(148, 163, 184, 0.32)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(fx - 14, stripY - 17, 28, 34, 6);
      ctx.fill();
      ctx.stroke();

      if (t.captured) {
        ctx.fillStyle = t.core;
        ctx.beginPath();
        ctx.arc(fx, stripY, t.inSunbeam ? 4 : 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 9. Camera shutter flash overlay
    if (this.shutterFlash > 0) {
      ctx.fillStyle = `rgba(254, 249, 195, ${this.shutterFlash * 0.34})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 10. Golden Record Power-Down Iris Finale
    if (this.ending) {
      const p = Math.min(1, this.finaleTimer / 1.85);
      const radius = Math.max(0, (1 - p * 0.92) * Math.max(w, h) * 0.72);
      ctx.save();
      ctx.strokeStyle = `rgba(125, 211, 252, ${(1 - p) * 0.7})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(earth.x, earth.y, 18 + p * 210, 0, Math.PI * 2);
      ctx.stroke();

      const fade = ctx.createRadialGradient(earth.x, earth.y, radius * 0.2, earth.x, earth.y, Math.max(24, radius));
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(1, `rgba(2, 5, 14, ${0.45 + p * 0.45})`);
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  getSessionMetric() {
    return `${this.capturedCount}/3 Khung Hình • 6,05 Tỷ km`;
  }
}

// =========================================================================
// MINIGAME 8: GRAND FINALE (Cassini — Diving Into Saturn)
// =========================================================================
class CassiniGrandFinaleGame {
  constructor(host) {
    this.host = host;
    this.elapsed = 0;
    this.maxDuration = 20.0;
    this.completed = false;
    this.ending = false;
    this.finaleTimer = 0;
    this.ghostAlpha = 0;

    this.craft = { x: 0, y: 0, angle: -0.5, targetAngle: -0.5 };
    this.earth = { x: 0, y: 0 };
    this.packetsSent = 0;
    this.targetPackets = 5;
    this.lockHold = 0;
    this.keys = { left: false, right: false };

    this.ringNodes = [];
    this.plumes = [];
    this.pulses = [];
    this.onResize();
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.earth.x = w * 0.8;
    this.earth.y = h * 0.17;
    this.craft.x = w * 0.36;
    this.craft.y = h * 0.62;

    if (this.ringNodes.length === 0) {
      const specs = [
        { rx: 0.24, ry: 0.28 },
        { rx: 0.42, ry: 0.22 },
        { rx: 0.56, ry: 0.34 },
        { rx: 0.68, ry: 0.46 },
        { rx: 0.50, ry: 0.50 }
      ];
      this.ringNodes = specs.map((s, i) => ({
        x: w * s.rx,
        y: h * s.ry,
        rx: s.rx,
        ry: s.ry,
        sent: false,
        phase: i * 1.1,
        glow: 0
      }));
    } else {
      this.ringNodes.forEach(n => {
        n.x = w * n.rx;
        n.y = h * n.ry;
      });
    }
  }

  onPointerDown(x, y) {
    if (this.completed || this.ending) return;

    // Option A: Tap directly on a glowing Saturn ring science node to uplink immediately
    for (let i = 0; i < this.ringNodes.length; i++) {
      const n = this.ringNodes[i];
      if (!n.sent && Math.hypot(x - n.x, y - n.y) < 58) {
        this._sendPacket(i);
        this.craft.targetAngle = Math.atan2(this.earth.y - this.craft.y, this.earth.x - this.craft.x);
        return;
      }
    }

    // Option B: Aim High-Gain Antenna toward pointer
    this.craft.targetAngle = Math.atan2(y - this.craft.y, x - this.craft.x);
  }

  onPointerMove(x, y) {
    if (this.completed || this.ending) return;
    this.craft.targetAngle = Math.atan2(y - this.craft.y, x - this.craft.x);
  }

  onPointerUp() {}

  onKeyDown(e) {
    if (this.completed || this.ending) return false;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.keys.left = true;
      return true;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.keys.right = true;
      return true;
    }
    if (e.code === 'Space') {
      const idx = this.ringNodes.findIndex(n => !n.sent);
      if (idx >= 0) this._sendPacket(idx);
      return true;
    }
    return false;
  }

  onKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.keys.left = false;
      return true;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.keys.right = false;
      return true;
    }
    return false;
  }

  _sendPacket(idx) {
    const node = this.ringNodes[idx];
    if (!node || node.sent) return;
    node.sent = true;
    node.glow = 1.0;
    this.packetsSent++;
    window.soundEngine.playCassiniPacket(this.packetsSent);

    this.pulses.push({
      sx: this.craft.x,
      sy: this.craft.y,
      tx: this.earth.x,
      ty: this.earth.y,
      t: 0
    });

    if (this.packetsSent >= this.targetPackets) {
      this.ending = true;
      window.soundEngine.playCassiniDiveFade();
    }
  }

  update(dt) {
    this.elapsed += dt;

    if (this.keys.left) this.craft.targetAngle -= dt * 1.9;
    if (this.keys.right) this.craft.targetAngle += dt * 1.9;

    // Gentle atmospheric drag buffeting balanced by generous magnetic lock to Earth
    const earthAngle = Math.atan2(this.earth.y - this.craft.y, this.earth.x - this.craft.x);
    const buffeting = Math.sin(this.elapsed * 2.1) * 0.045;
    let diff = ((this.craft.targetAngle - this.craft.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    this.craft.angle += diff * Math.min(1, dt * 8) + buffeting * dt;

    // Check beam lock against Earth star beacon (very wide 0.42 rad cone)
    const err = Math.abs(((earthAngle - this.craft.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    const isLocked = err < 0.44;
    if (isLocked && !this.ending && !this.completed) {
      this.craft.angle += (earthAngle - this.craft.angle) * dt * 2.4;
      this.lockHold += dt;
      if (this.lockHold >= 1.15) {
        this.lockHold = 0;
        const nextIdx = this.ringNodes.findIndex(n => !n.sent);
        if (nextIdx >= 0) this._sendPacket(nextIdx);
      }
    } else {
      this.lockHold = Math.max(0, this.lockHold - dt * 0.4);
    }

    // Atmospheric entry ember plumes
    if (Math.random() < (this.ending ? 0.95 : 0.4)) {
      this.plumes.push({
        x: this.craft.x - 14 + (Math.random() - 0.5) * 18,
        y: this.craft.y + 8 + (Math.random() - 0.5) * 14,
        vx: -90 - Math.random() * 110,
        vy: -30 - Math.random() * 55,
        life: 1.0,
        r: 2 + Math.random() * 4
      });
    }

    for (let i = this.plumes.length - 1; i >= 0; i--) {
      const p = this.plumes[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1.2;
      if (p.life <= 0) this.plumes.splice(i, 1);
    }

    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pl = this.pulses[i];
      pl.t += dt * 1.9;
      if (pl.t >= 1.2) this.pulses.splice(i, 1);
    }

    this.ringNodes.forEach(n => {
      n.glow = Math.max(0, n.glow - dt * 0.8);
    });

    if (!this.ending && this.elapsed >= this.maxDuration) {
      this.ending = true;
      this.ringNodes.forEach((n, idx) => {
        if (!n.sent) {
          n.sent = true;
          this.packetsSent++;
        }
      });
      window.soundEngine.playCassiniDiveFade();
    }

    if (this.ending && !this.completed) {
      this.finaleTimer += dt;
      this.craft.x += dt * 32;
      this.craft.y += dt * 36;
      if (this.finaleTimer >= 1.85) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  render(ctx, w, h) {
    // 1. Golden-amber Saturn atmosphere blending into deep cosmos
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#040814');
    sky.addColorStop(0.48, '#171422');
    sky.addColorStop(0.78, '#4e2d12');
    sky.addColorStop(1, '#92400e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 2. Sweeping Saturnian Ice Rings across upper-left horizon
    ctx.save();
    for (let r = 0; r < 6; r++) {
      const lit = r < this.packetsSent + 1;
      ctx.strokeStyle = lit
        ? `rgba(253, 230, 138, ${0.14 + (r === this.packetsSent ? 0.16 : 0.08)})`
        : 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 10 - r * 1.1;
      ctx.beginPath();
      ctx.ellipse(w * 0.12, h * 0.86, w * (0.62 + r * 0.075), h * (0.48 + r * 0.055), -0.24, -Math.PI * 0.72, -0.05);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Saturn atmospheric cloud bands
    for (let b = 0; b < 5; b++) {
      const y = h * (0.76 + b * 0.055);
      ctx.fillStyle = `rgba(245, 158, 11, ${0.06 + b * 0.02})`;
      ctx.fillRect(0, y, w, 18);
    }

    // 4. Distant Earth Star Beacon in upper-right sky
    const earthGlow = ctx.createRadialGradient(this.earth.x, this.earth.y, 2, this.earth.x, this.earth.y, 58);
    earthGlow.addColorStop(0, 'rgba(125, 211, 252, 0.92)');
    earthGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.25)');
    earthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(this.earth.x, this.earth.y, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(this.earth.x, this.earth.y, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(this.earth.x, this.earth.y, 22 + Math.sin(this.elapsed * 3) * 3, 0, Math.PI * 2);
    ctx.stroke();

    // Progress arc around Earth beacon
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.earth.x, this.earth.y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.packetsSent / this.targetPackets));
    ctx.stroke();

    // 5. High-Gain Antenna telemetry beam from Cassini
    const beamLen = Math.hypot(this.earth.x - this.craft.x, this.earth.y - this.craft.y);
    const bx = this.craft.x + Math.cos(this.craft.angle) * beamLen;
    const by = this.craft.y + Math.sin(this.craft.angle) * beamLen;
    const earthAngle = Math.atan2(this.earth.y - this.craft.y, this.earth.x - this.craft.x);
    const isLocked = Math.abs(((earthAngle - this.craft.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.44;

    ctx.save();
    const beamG = ctx.createLinearGradient(this.craft.x, this.craft.y, bx, by);
    beamG.addColorStop(0, isLocked ? 'rgba(56, 189, 248, 0.58)' : 'rgba(252, 211, 77, 0.24)');
    beamG.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.strokeStyle = beamG;
    ctx.lineWidth = isLocked ? 5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(this.craft.x, this.craft.y);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.restore();

    // 6. Clickable Saturn Ring Science Packet Orbs
    this.ringNodes.forEach((n, i) => {
      if (n.sent && n.glow <= 0.01) return;
      const pulseR = 16 + Math.sin(this.elapsed * 3.4 + n.phase) * 3;
      const g = ctx.createRadialGradient(n.x, n.y, 1, n.x, n.y, 34);
      g.addColorStop(0, n.sent ? `rgba(56, 189, 248, ${n.glow})` : 'rgba(252, 211, 77, 0.72)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = n.sent ? `rgba(125, 211, 252, ${n.glow})` : 'rgba(254, 243, 199, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = n.sent ? `rgba(224, 242, 254, ${n.glow})` : '#fef3c7';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. Telemetry pulses flying to Earth
    this.pulses.forEach(pl => {
      const clampedT = Math.min(1, pl.t);
      const px = pl.sx + (pl.tx - pl.sx) * clampedT;
      const py = pl.sy + (pl.ty - pl.sy) * clampedT;
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 8. Entry ember plumes
    this.plumes.forEach(p => {
      ctx.fillStyle = `rgba(251, 146, 60, ${Math.max(0, p.life * 0.75)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 9. Cassini Orbiter Silhouette (High-Gain Dish + Gold Bus + Magnetometer Boom)
    ctx.save();
    ctx.translate(this.craft.x, this.craft.y);
    ctx.rotate(this.craft.angle + Math.PI / 2);

    // Atmospheric entry plasma glow during dive
    if (this.ending) {
      const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 72);
      aura.addColorStop(0, 'rgba(254, 243, 199, 0.9)');
      aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
      aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 72, 0, Math.PI * 2);
      ctx.fill();
    }

    // Magnetometer boom
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(36, 26);
    ctx.stroke();

    // Gold Kapton body
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-10, -4, 20, 24);
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -4, 20, 24);

    // High-Gain Antenna Parabolic Dish pointing along beam
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, -10, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isLocked ? '#38bdf8' : '#fcd34d';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  getSessionMetric() {
    return `${this.packetsSent}/${this.targetPackets} Gói Dữ Liệu • 113.000 km/h`;
  }
}

window.PaleBlueDotGame = PaleBlueDotGame;
window.CassiniGrandFinaleGame = CassiniGrandFinaleGame;
