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

    const hitIdx = this._findSnapTarget(x, y, 125);
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

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: 0.75,
        lumen: 0.88,
        cyan: 0.65,
        stars: 0.72
      });
    }

    // 2. Spectral Stars
    if (window.VantaGfx) {
      if (!this._spectralStars) this._spectralStars = window.VantaGfx.createStarfield(145, 0.94);
      window.VantaGfx.drawStarfield(ctx, this._spectralStars, w, h, this.elapsed, 0.95);
    }

    // 3. Iconic diagonal scattered-sunlight ray intersecting the Pale Blue Dot (optical lens flare)
    const earth = this.targets[2];
    ctx.save();
    ctx.translate(earth.x, earth.y);
    ctx.rotate(-0.42);
    const beamGrad = ctx.createLinearGradient(-56, 0, 56, 0);
    beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
    beamGrad.addColorStop(0.22, 'rgba(217, 119, 6, 0.06)');
    beamGrad.addColorStop(0.42, 'rgba(251, 146, 60, 0.13)');
    beamGrad.addColorStop(0.5, 'rgba(254, 243, 199, 0.19)');
    beamGrad.addColorStop(0.58, 'rgba(244, 114, 182, 0.08)');
    beamGrad.addColorStop(0.78, 'rgba(56, 189, 248, 0.04)');
    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(-56, -h, 112, h * 2);
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

      // Saturn multi-band ring silhouette with Cassini Division
      if (t.hasRing) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(-0.35);
        ctx.strokeStyle = 'rgba(254, 243, 199, 0.65)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, t.radius * 2.25, t.radius * 0.66, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(253, 230, 138, 0.36)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, t.radius * 1.65, t.radius * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Spherical shaded planet disc (clipped for zonal bands)
      ctx.save();
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.clip();

      const pGrad = ctx.createRadialGradient(
        t.x - t.radius * 0.35, t.y - t.radius * 0.35, t.radius * 0.1,
        t.x, t.y, t.radius * 1.1
      );
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.25, t.core);
      pGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = pGrad;
      ctx.fillRect(t.x - t.radius, t.y - t.radius, t.radius * 2, t.radius * 2);

      if (t.id === 'jupiter') {
        ctx.fillStyle = 'rgba(180, 83, 9, 0.55)';
        ctx.fillRect(t.x - t.radius, t.y - t.radius * 0.35, t.radius * 2, t.radius * 0.25);
        ctx.fillRect(t.x - t.radius, t.y + t.radius * 0.15, t.radius * 2, t.radius * 0.2);
        ctx.fillStyle = 'rgba(234, 88, 12, 0.72)';
        ctx.beginPath();
        ctx.ellipse(t.x + t.radius * 0.28, t.y + t.radius * 0.24, t.radius * 0.22, t.radius * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
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
    const stripY = w < 640 ? h - 72 : h - 54;
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
      if (!n.sent && Math.hypot(x - n.x, y - n.y) < 76) {
        this._sendPacket(i);
        this.craft.targetAngle = Math.atan2(this.earth.y - this.craft.y, this.earth.x - this.craft.x);
        return;
      }
    }

    // Option B: Tap directly on Earth beacon to lock & transmit next science node
    if (Math.hypot(x - this.earth.x, y - this.earth.y) < 76) {
      this.craft.targetAngle = Math.atan2(this.earth.y - this.craft.y, this.earth.x - this.craft.x);
      const nextIdx = this.ringNodes.findIndex(n => !n.sent);
      if (nextIdx >= 0) this._sendPacket(nextIdx);
      return;
    }

    // Option C: Aim High-Gain Antenna toward pointer
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

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h * 0.78, {
        alpha: 0.64,
        lumen: 1.05,
        cyan: 0.38,
        stars: 0.6
      });
    }

    // 1b. Upper-sky spectral stars above Saturn limb
    if (window.VantaGfx) {
      if (!this._stars) this._stars = window.VantaGfx.createStarfield(120, 0.58);
      window.VantaGfx.drawStarfield(ctx, this._stars, w, h, this.elapsed, 0.85);
    }

    // 2. Sweeping Saturnian Ice Rings across upper-left horizon (with Cassini Division)
    ctx.save();
    for (let r = 0; r < 8; r++) {
      if (r === 4) continue; // Cassini Division dark gap
      const lit = r < this.packetsSent + 2;
      ctx.strokeStyle = lit
        ? `rgba(253, 230, 138, ${0.12 + (r === this.packetsSent ? 0.16 : 0.07)})`
        : 'rgba(148, 163, 184, 0.06)';
      ctx.lineWidth = 8 - r * 0.7;
      ctx.beginPath();
      ctx.ellipse(w * 0.12, h * 0.86, w * (0.58 + r * 0.058), h * (0.45 + r * 0.044), -0.24, -Math.PI * 0.72, -0.05);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Saturn curved atmospheric cloud bands & golden limb haze
    ctx.save();
    for (let b = 0; b < 6; b++) {
      const yBase = h * (0.72 + b * 0.052);
      ctx.fillStyle = b % 2 === 0
        ? `rgba(245, 158, 11, ${0.05 + b * 0.018})`
        : `rgba(180, 83, 9, ${0.06 + b * 0.02})`;
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      ctx.quadraticCurveTo(w * 0.5, yBase - 18, w, yBase + 6);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

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

// =========================================================================
// MINIGAME 9 (EASTER EGG): RISE IN ZERO-G (VantaLumen Zero-G Plushie Indicator)
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

    // Initialize Rise Plushie Video (assets/rise_plushie.mp4)
    this.video = document.createElement('video');
    this.video.src = 'assets/rise_plushie.mp4';
    this.video.loop = true;
    this.video.playsInline = true;
    this.video.preload = 'auto';
    this.video.muted = !!(window.soundEngine && window.soundEngine.muted);
    this.video.volume = 0.85;
    this._startVideoPlayback(false);

    // 6 Orbital Music-Box Star Notes floating inside the Cupola
    this.starNotes = [];
    this._initStarNotes(w, h);

    this.sparkles = [];
    this.ripples = [];
  }

  _startVideoPlayback(fromUserGesture = false) {
    if (!this.video) return;
    try {
      const isMuted = !!(window.soundEngine && window.soundEngine.muted);
      if (fromUserGesture && !isMuted) {
        this.video.muted = false;
        this.video.volume = 0.85;
      }
      const p = this.video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          this.video.muted = true;
          this.video.play().catch(() => {});
        });
      }
    } catch {}
  }

  destroy() {
    if (this.video) {
      try {
        this.video.pause();
      } catch {}
    }
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

    // Sync video mute state with global soundEngine
    if (this.video && window.soundEngine) {
      if (window.soundEngine.muted && !this.video.muted) {
        this.video.muted = true;
      }
    }

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

    if (this.video && this.video.readyState >= 2 && this.video.videoWidth > 0) {
      const vw = this.video.videoWidth;
      const vh = this.video.videoHeight;
      // Central region (x: 18%..82%, y: 0%..100%) preserves 100% of the Earth Cap, rocket motifs & 7 stars on the brim while excluding the watermark at x~90%
      const sx = vw * 0.19;
      const sy = 0;
      const sw = vw * 0.62;
      const sh = vh;
      ctx.drawImage(this.video, sx, sy, sw, sh, -boxW * 0.52, -boxH * 0.54, boxW * 1.04, boxH * 1.04);
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

window.PaleBlueDotGame = PaleBlueDotGame;
window.CassiniGrandFinaleGame = CassiniGrandFinaleGame;
window.RiseZeroGGame = RiseZeroGGame;
