/**
 * Minigame 10: SPIRIT RESCUE — Giải Cứu Rover Spirit (Realistic SpaceX Starship × NASA JPL Overhaul)
 * 5-Phase Interactive Mission:
 *   0. to_mars        — Hohmann transfer burn in SpaceX Starship (stainless steel + TPS tiles + Raptor shock diamonds)
 *   1. pickup         — Gusev Crater landing, articulated cargo crane lifting dusty Spirit into Starship bay
 *   2. to_earth       — Return burn from Mars to Earth Orbital Cleanroom
 *   3. replace_motor  — JPL Cleanroom: unbolt charred Wheel #1 motor & torque-lock new Titanium Brushless Actuator
 *   4. charge_battery — Umbilical super-charge & solar array illumination (12% → 100%)
 */
class SpiritRescueGame {
  constructor(host) {
    this.host = host;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.completed = false;
    this.ending = false;
    this.finaleTimer = 0;
    this.ghostAlpha = 0.9;

    this.phase = 'to_mars';
    this.phaseTime = 0;
    this.transitProgress = 0;
    this.isBoosting = false;

    this.pickupProgress = 0;
    this.isLifting = false;
    this.spiritPickedUp = false;

    this.motorStep = 'remove_old';
    this.motorAnim = 0;
    this.wheelSpin = 0;

    this.battery = 12;
    this.isCharging = false;

    this.particles = [];
    this.sparks = [];
    this.stars = window.VantaGfx ? window.VantaGfx.createStarfield(210, 0.96) : [];
    this.marsRocks = Array.from({ length: 24 }, (_, i) => ({
      rx: (i * 0.043 + 0.02) % 0.96,
      ry: 0.015 + ((i * 7) % 10) * 0.022,
      w: 8 + (i % 5) * 6,
      h: 4 + (i % 3) * 3,
      shade: 0.7 + (i % 4) * 0.1
    }));
    this.pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, down: false };
    this.keys = { boost: false };
  }

  onResize() {}

  _getLayout(w, h) {
    const isNarrow = w < 640;
    return {
      isNarrow,
      earthPos: { x: w * (isNarrow ? 0.18 : 0.2), y: h * (isNarrow ? 0.75 : 0.72) },
      marsPos: { x: w * (isNarrow ? 0.82 : 0.8), y: h * (isNarrow ? 0.29 : 0.28) },
      groundY: h * 0.73,
      shipLandX: w * (isNarrow ? 0.27 : 0.28),
      spiritX: w * (isNarrow ? 0.69 : 0.67),
      hubPos: { x: w * 0.5 - (isNarrow ? 60 : 94), y: h * 0.565 },
      newMotorPos: { x: w * (isNarrow ? 0.77 : 0.74), y: h * 0.51 },
      chargePadPos: { x: w * 0.5, y: h * (isNarrow ? 0.77 : 0.76) }
    };
  }

  _spawnExhaust(x, y, vx, vy, color = '#60a5fa', count = 2) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 7,
        y: y + (Math.random() - 0.5) * 7,
        vx: vx + (Math.random() - 0.5) * 38,
        vy: vy + (Math.random() - 0.5) * 38,
        life: 0.4 + Math.random() * 0.35,
        maxLife: 0.75,
        r: 2 + Math.random() * 4,
        color
      });
    }
  }

  _spawnSparks(x, y, color = '#fcd34d', count = 16) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 55 + Math.random() * 145;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.5 + Math.random() * 0.45,
        maxLife: 0.95,
        r: 1.5 + Math.random() * 2.4,
        color
      });
    }
  }

  onPointerDown(x, y) {
    if (this.completed || this.ending) return;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.down = true;
    this.ghostAlpha = 0;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const L = this._getLayout(w, h);

    if (this.phase === 'to_mars' || this.phase === 'to_earth') {
      this.isBoosting = true;
      window.soundEngine.playUITick();
    } else if (this.phase === 'pickup') {
      this.isLifting = true;
      window.soundEngine.playUIChime(2);
    } else if (this.phase === 'replace_motor') {
      if (this.motorStep === 'remove_old') {
        if (Math.hypot(x - L.hubPos.x, y - L.hubPos.y) < 120 || y > h * 0.32) {
          this.motorStep = 'removing';
          this.motorAnim = 0;
          window.soundEngine.playGravelCrunch();
          this._spawnSparks(L.hubPos.x, L.hubPos.y, '#fb923c', 22);
        }
      } else if (this.motorStep === 'install_new') {
        if (
          Math.hypot(x - L.newMotorPos.x, y - L.newMotorPos.y) < 120 ||
          Math.hypot(x - L.hubPos.x, y - L.hubPos.y) < 120
        ) {
          this.motorStep = 'installing';
          this.motorAnim = 0;
          window.soundEngine.playCassiniPacket(3);
        }
      }
    } else if (this.phase === 'charge_battery') {
      this.isCharging = true;
      this.battery = Math.min(100, this.battery + 6);
      window.soundEngine.playPentatonicNote(Math.floor((this.battery / 100) * 6), 0.14, 0.45);
      this._spawnSparks(w * 0.5, h * 0.44, '#38bdf8', 10);
    }
  }

  onPointerMove(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  onPointerUp() {
    this.pointer.down = false;
    this.isBoosting = false;
    this.isLifting = false;
    this.isCharging = false;
    window.soundEngine.setBrushWind(0);
  }

  onKeyDown(e) {
    if (this.completed || this.ending) return false;
    if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'Enter') {
      this.ghostAlpha = 0;
      if (this.phase === 'to_mars' || this.phase === 'to_earth') {
        this.keys.boost = true;
      } else if (this.phase === 'pickup') {
        this.isLifting = true;
      } else if (this.phase === 'replace_motor') {
        if (this.motorStep === 'remove_old') {
          const L = this._getLayout(window.innerWidth, window.innerHeight);
          this.motorStep = 'removing';
          this.motorAnim = 0;
          window.soundEngine.playGravelCrunch();
          this._spawnSparks(L.hubPos.x, L.hubPos.y, '#fb923c', 22);
        } else if (this.motorStep === 'install_new') {
          this.motorStep = 'installing';
          this.motorAnim = 0;
          window.soundEngine.playCassiniPacket(3);
        }
      } else if (this.phase === 'charge_battery') {
        this.isCharging = true;
      }
      return true;
    }
    return false;
  }

  onKeyUp(e) {
    if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'Enter') {
      this.keys.boost = false;
      this.isLifting = false;
      this.isCharging = false;
      window.soundEngine.setBrushWind(0);
      return true;
    }
    return false;
  }

  _advancePhase(nextPhase) {
    this.phase = nextPhase;
    this.phaseTime = 0;
    this.isBoosting = false;
    this.isLifting = false;
    this.isCharging = false;
    this.keys.boost = false;
    window.soundEngine.setBrushWind(0);
    window.soundEngine.playUIChime(4);
  }

  update(dt) {
    this.elapsed += dt;
    this.phaseTime += dt;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const L = this._getLayout(w, h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 120 * dt;
      s.life -= dt;
      if (s.life <= 0) this.sparks.splice(i, 1);
    }

    if (this.phase === 'to_mars') {
      const active = this.isBoosting || this.keys.boost;
      const speed = active ? 0.36 : 0.035;
      this.transitProgress = Math.min(1, this.transitProgress + speed * dt);
      window.soundEngine.setBrushWind(active ? 0.72 : 0, active ? 0.88 : 0.2);

      const pos = this._getArcPos(L.earthPos, L.marsPos, this.transitProgress, -h * 0.18);
      if (active) {
        this._spawnExhaust(
          pos.x - Math.cos(pos.angle) * 28,
          pos.y - Math.sin(pos.angle) * 28,
          -Math.cos(pos.angle) * 155,
          -Math.sin(pos.angle) * 155,
          '#93c5fd',
          2
        );
      }

      if (this.transitProgress >= 1) {
        this._spawnSparks(L.marsPos.x, L.marsPos.y, '#fb923c', 22);
        window.soundEngine.playTapeWhoosh();
        this._advancePhase('pickup');
      }
    } else if (this.phase === 'pickup') {
      if (this.isLifting && !this.spiritPickedUp) {
        this.pickupProgress = Math.min(1, this.pickupProgress + dt * 0.65);
        if (Math.random() < 0.35) {
          const sx = L.spiritX + (L.shipLandX - L.spiritX) * this.pickupProgress;
          const sy = L.groundY - Math.sin(this.pickupProgress * Math.PI) * 115;
          this._spawnSparks(sx, sy - 22, '#fcd34d', 2);
        }
        if (this.pickupProgress >= 1) {
          this.spiritPickedUp = true;
          this._spawnSparks(L.shipLandX, L.groundY - 76, '#38bdf8', 26);
          window.soundEngine.playSignatureMotif(2);
          setTimeout(() => {
            if (!this.completed && this.phase === 'pickup') {
              this.transitProgress = 0;
              this._advancePhase('to_earth');
            }
          }, 750);
        }
      } else if (!this.spiritPickedUp && this.pickupProgress > 0) {
        this.pickupProgress = Math.max(0, this.pickupProgress - dt * 0.22);
      }
    } else if (this.phase === 'to_earth') {
      const active = this.isBoosting || this.keys.boost;
      const speed = active ? 0.4 : 0.04;
      this.transitProgress = Math.min(1, this.transitProgress + speed * dt);
      window.soundEngine.setBrushWind(active ? 0.74 : 0, active ? 0.92 : 0.2);

      const pos = this._getArcPos(L.marsPos, L.earthPos, this.transitProgress, h * 0.16);
      if (active) {
        this._spawnExhaust(
          pos.x - Math.cos(pos.angle) * 28,
          pos.y - Math.sin(pos.angle) * 28,
          -Math.cos(pos.angle) * 155,
          -Math.sin(pos.angle) * 155,
          '#7dd3fc',
          2
        );
      }

      if (this.transitProgress >= 1) {
        this._spawnSparks(L.earthPos.x, L.earthPos.y, '#38bdf8', 24);
        window.soundEngine.playTapeWhoosh();
        this._advancePhase('replace_motor');
      }
    } else if (this.phase === 'replace_motor') {
      if (this.motorStep === 'removing') {
        this.motorAnim += dt * 1.85;
        if (this.motorAnim >= 1) {
          this.motorStep = 'install_new';
          this.motorAnim = 0;
          window.soundEngine.playUITick();
        }
      } else if (this.motorStep === 'installing') {
        this.motorAnim += dt * 1.75;
        if (this.motorAnim >= 1) {
          this.motorStep = 'done';
          this.motorAnim = 1;
          this._spawnSparks(L.hubPos.x, L.hubPos.y, '#38bdf8', 30);
          window.soundEngine.playSuccessBloom();
          setTimeout(() => {
            if (!this.completed && this.phase === 'replace_motor') {
              this._advancePhase('charge_battery');
            }
          }, 900);
        }
      } else if (this.motorStep === 'done') {
        this.wheelSpin += dt * 5.6;
      }
    } else if (this.phase === 'charge_battery') {
      this.wheelSpin += dt * 3.2;
      if (this.isCharging && !this.ending) {
        this.battery = Math.min(100, this.battery + dt * 36);
        if (Math.random() < 0.45) {
          this._spawnSparks(w * 0.5 + (Math.random() - 0.5) * 90, h * 0.44, '#fcd34d', 2);
        }
      }
      if (this.battery >= 100 && !this.ending) {
        this.battery = 100;
        this.ending = true;
        this.isCharging = false;
        this._spawnSparks(w * 0.5, h * 0.44, '#fcd34d', 38);
        this._spawnSparks(w * 0.5, h * 0.44, '#38bdf8', 26);
        window.soundEngine.playSignatureMotif(4);
      }
    }

    if (this.ending && !this.completed) {
      this.finaleTimer += dt;
      if (this.finaleTimer >= 1.85) {
        this.completed = true;
        this.host.completeCurrentGame();
      }
    }
  }

  _getArcPos(from, to, t, arcHeight) {
    const u = Math.max(0, Math.min(1, t));
    const x = from.x + (to.x - from.x) * u;
    const y = from.y + (to.y - from.y) * u + Math.sin(u * Math.PI) * arcHeight;
    const eps = 0.01;
    const u2 = Math.min(1, u + eps);
    const x2 = from.x + (to.x - from.x) * u2;
    const y2 = from.y + (to.y - from.y) * u2 + Math.sin(u2 * Math.PI) * arcHeight;
    const angle = Math.atan2(y2 - y, x2 - x);
    return { x, y, angle };
  }

  _drawStarship(ctx, x, y, angle, scale = 1, boosting = false, landed = false, bayOpen = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI * 0.5);
    ctx.scale(scale, scale);

    if (boosting) {
      const flicker = 0.88 + Math.sin(this.elapsed * 46) * 0.16;
      const plumeLen = 58 * flicker;
      const flameG = ctx.createLinearGradient(0, 28, 0, 28 + plumeLen);
      flameG.addColorStop(0, '#f0f9ff');
      flameG.addColorStop(0.25, '#60a5fa');
      flameG.addColorStop(0.62, 'rgba(139, 92, 246, 0.65)');
      flameG.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flameG;
      ctx.beginPath();
      ctx.moveTo(-9.5, 27);
      ctx.quadraticCurveTo(-5, 28 + plumeLen * 0.6, 0, 28 + plumeLen);
      ctx.quadraticCurveTo(5, 28 + plumeLen * 0.6, 9.5, 27);
      ctx.closePath();
      ctx.fill();

      for (let d = 0; d < 3; d++) {
        const dy = 34 + d * 12 * flicker;
        const dr = 4.2 - d * 1.1;
        ctx.fillStyle = `rgba(224, 242, 254, ${0.85 - d * 0.24})`;
        ctx.beginPath();
        ctx.moveTo(0, dy - dr);
        ctx.lineTo(dr * 0.75, dy);
        ctx.lineTo(0, dy + dr * 1.3);
        ctx.lineTo(-dr * 0.75, dy);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (landed) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.1;
      [[-11, 20, -24, 34], [11, 20, 24, 34], [0, 23, 0, 34]].forEach(([x0, y0, x1, y1]) => {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.fillStyle = '#334155';
        ctx.fillRect(x1 - 3.5, y1 - 1.5, 7, 3);
      });
    }

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, 23, 20, 4);
    [-5.5, 0, 5.5].forEach(rx => {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(rx - 2.3, 26);
      ctx.lineTo(rx - 3.3, 30);
      ctx.lineTo(rx + 3.3, 30);
      ctx.lineTo(rx + 2.3, 26);
      ctx.closePath();
      ctx.fill();
    });

    const drawFlap = (pts) => {
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawFlap([[-11.5, 6], [-22.5, 22], [-11.5, 24]]);
    drawFlap([[11.5, 6], [22.5, 22], [11.5, 24]]);
    drawFlap([[-9.5, -24], [-17.5, -13], [-9.5, -11]]);
    drawFlap([[9.5, -24], [17.5, -13], [9.5, -11]]);

    const hull = ctx.createLinearGradient(-12, 0, 12, 0);
    hull.addColorStop(0, '#0f172a');
    hull.addColorStop(0.28, '#334155');
    hull.addColorStop(0.55, '#e2e8f0');
    hull.addColorStop(0.78, '#f8fafc');
    hull.addColorStop(1, '#64748b');
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(-11.5, 25);
    ctx.lineTo(-11.5, -19);
    ctx.quadraticCurveTo(-11.5, -39, 0, -47);
    ctx.quadraticCurveTo(11.5, -39, 11.5, -19);
    ctx.lineTo(11.5, 25);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.lineWidth = 0.7;
    [-14, -4, 6, 16].forEach(ry => {
      ctx.beginPath();
      ctx.moveTo(-11, ry);
      ctx.lineTo(11, ry);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-11.5, 25);
    ctx.lineTo(-11.5, -19);
    ctx.quadraticCurveTo(-11.5, -39, 0, -47);
    ctx.quadraticCurveTo(11.5, -39, 11.5, -19);
    ctx.lineTo(11.5, 25);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = bayOpen > 0 ? '#020617' : '#0f172a';
    ctx.fillRect(-6, -24, 12, 16);
    if (bayOpen > 0) {
      const bayGlow = ctx.createRadialGradient(0, -16, 1, 0, -16, 12);
      bayGlow.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
      bayGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = bayGlow;
      ctx.fillRect(-6, -24, 12, 16);
    }
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -24, 12, 16);

    ctx.restore();
  }

  _drawRealisticPlanet(ctx, x, y, r, isMars) {
    const halo = ctx.createRadialGradient(x, y, r * 0.78, x, y, r * 1.55);
    halo.addColorStop(0, isMars ? 'rgba(251, 146, 60, 0.42)' : 'rgba(56, 189, 248, 0.52)');
    halo.addColorStop(0.55, isMars ? 'rgba(194, 65, 12, 0.14)' : 'rgba(14, 165, 233, 0.16)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    if (isMars) {
      const base = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r * 1.15);
      base.addColorStop(0, '#fdba74');
      base.addColorStop(0.42, '#c2410c');
      base.addColorStop(0.85, '#7c2d12');
      base.addColorStop(1, '#290d05');
      ctx.fillStyle = base;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      ctx.fillStyle = 'rgba(67, 20, 7, 0.48)';
      ctx.beginPath();
      ctx.ellipse(x + r * 0.12, y - r * 0.08, r * 0.38, r * 0.22, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(41, 13, 5, 0.55)';
      ctx.lineWidth = Math.max(1.5, r * 0.06);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.42, y + r * 0.12);
      ctx.quadraticCurveTo(x - r * 0.1, y + r * 0.18, x + r * 0.25, y + r * 0.06);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 247, 237, 0.78)';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.08, y - r * 0.88, r * 0.32, r * 0.12, -0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const ocean = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r * 1.15);
      ocean.addColorStop(0, '#7dd3fc');
      ocean.addColorStop(0.4, '#0284c7');
      ocean.addColorStop(0.85, '#0c4a6e');
      ocean.addColorStop(1, '#041426');
      ctx.fillStyle = ocean;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      ctx.fillStyle = 'rgba(34, 197, 94, 0.52)';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.28, y - r * 0.12, r * 0.34, r * 0.22, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + r * 0.24, y + r * 0.18, r * 0.24, r * 0.32, -0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.48)';
      ctx.lineWidth = Math.max(1.4, r * 0.07);
      ctx.lineCap = 'round';
      [[-0.5, -0.35, 0.2, -0.25], [-0.3, 0.25, 0.45, 0.05], [-0.15, -0.58, 0.4, -0.52]].forEach(([x0, y0, x1, y1]) => {
        ctx.beginPath();
        ctx.moveTo(x + x0 * r, y + y0 * r);
        ctx.quadraticCurveTo(x, y + (y0 + y1) * 0.45 * r, x + x1 * r, y + y1 * r);
        ctx.stroke();
      });
    }

    const term = ctx.createRadialGradient(x - r * 0.36, y - r * 0.32, r * 0.45, x, y, r * 1.05);
    term.addColorStop(0, 'rgba(0,0,0,0)');
    term.addColorStop(0.75, 'rgba(2, 6, 18, 0.32)');
    term.addColorStop(1, 'rgba(2, 4, 12, 0.82)');
    ctx.fillStyle = term;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();

    ctx.strokeStyle = isMars ? 'rgba(253, 186, 116, 0.45)' : 'rgba(125, 211, 252, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  _drawMotorUnit(ctx, x, y, isNew, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 38);
    g.addColorStop(0, isNew ? 'rgba(56, 189, 248, 0.48)' : 'rgba(249, 115, 22, 0.38)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isNew ? '#1e293b' : '#2c1810';
    ctx.strokeStyle = isNew ? '#7dd3fc' : '#c2410c';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-26, -10, 8, 20);
    ctx.strokeRect(-26, -10, 8, 20);

    const bodyG = ctx.createLinearGradient(0, -15, 0, 15);
    if (isNew) {
      bodyG.addColorStop(0, '#334155');
      bodyG.addColorStop(0.45, '#0f172a');
      bodyG.addColorStop(1, '#020617');
    } else {
      bodyG.addColorStop(0, '#451a03');
      bodyG.addColorStop(0.5, '#291208');
      bodyG.addColorStop(1, '#140804');
    }
    ctx.fillStyle = bodyG;
    ctx.strokeStyle = isNew ? '#38bdf8' : '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-18, -15, 38, 30, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = isNew ? 'rgba(125, 211, 252, 0.65)' : 'rgba(154, 52, 18, 0.7)';
    ctx.lineWidth = 1.5;
    for (let i = -10; i <= 12; i += 5.5) {
      ctx.beginPath();
      ctx.moveTo(i, -11);
      ctx.lineTo(i, 11);
      ctx.stroke();
    }

    ctx.fillStyle = isNew ? '#e2e8f0' : '#78350f';
    ctx.fillRect(-34, -4, 8, 8);
    ctx.fillStyle = isNew ? '#fcd34d' : '#57280a';
    ctx.fillRect(20, -5, 5, 10);

    ctx.restore();
  }

  render(ctx, w, h) {
    const L = this._getLayout(w, h);

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    if (this.phase === 'pickup') {
      bg.addColorStop(0, '#07050c');
      bg.addColorStop(0.42, '#2d140e');
      bg.addColorStop(0.72, '#6b2714');
      bg.addColorStop(1, '#1a0905');
    } else if (this.phase === 'replace_motor' || this.phase === 'charge_battery') {
      bg.addColorStop(0, '#030712');
      bg.addColorStop(0.55, '#0b1526');
      bg.addColorStop(1, '#050b16');
    } else {
      bg.addColorStop(0, '#02050d');
      bg.addColorStop(1, '#080d1b');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: this.phase === 'pickup' ? 0.28 : 0.66,
        lumen: 0.9,
        cyan: this.phase === 'pickup' ? 0.22 : 0.68,
        stars: 0.75
      });
    }
    if (window.VantaGfx) {
      window.VantaGfx.drawStarfield(ctx, this.stars, w, h, this.elapsed, 0.88);
    }

    if (this.phase === 'to_mars' || this.phase === 'to_earth') {
      this._renderTransitPhase(ctx, w, h, L);
    } else if (this.phase === 'pickup') {
      this._renderPickupPhase(ctx, w, h, L);
    } else if (this.phase === 'replace_motor') {
      this._renderMotorPhase(ctx, w, h, L);
    } else if (this.phase === 'charge_battery') {
      this._renderBatteryPhase(ctx, w, h, L);
    }

    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    this.sparks.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this._renderPhaseStepper(ctx, w, h);
    this._renderPromptPill(ctx, w, h);

    if (this.ending) {
      const p = Math.min(1, this.finaleTimer / 1.85);
      const bloom = ctx.createRadialGradient(w * 0.5, h * 0.48, 10, w * 0.5, h * 0.48, Math.max(w, h) * 0.65 * p);
      bloom.addColorStop(0, `rgba(253, 224, 71, ${(1 - p) * 0.48})`);
      bloom.addColorStop(0.5, `rgba(56, 189, 248, ${(1 - p) * 0.24})`);
      bloom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);
    }
  }

  _renderTransitPhase(ctx, w, h, L) {
    const isOutbound = this.phase === 'to_mars';
    const from = isOutbound ? L.earthPos : L.marsPos;
    const to = isOutbound ? L.marsPos : L.earthPos;
    const arcH = isOutbound ? -h * 0.18 : h * 0.16;

    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(L.earthPos.x, L.earthPos.y, L.isNarrow ? 54 : 74, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(L.marsPos.x, L.marsPos.y, L.isNarrow ? 48 : 66, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = isOutbound ? 'rgba(251, 146, 60, 0.4)' : 'rgba(56, 189, 248, 0.42)';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    for (let i = 0; i <= 44; i++) {
      const pt = this._getArcPos(from, to, i / 44, arcH);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();

    const orbR = L.isNarrow ? 36 : 48;
    this._drawRealisticPlanet(ctx, L.earthPos.x, L.earthPos.y, orbR, false);
    this._drawRealisticPlanet(ctx, L.marsPos.x, L.marsPos.y, orbR * 0.85, true);

    const en = window.VantaI18n && window.VantaI18n.isEn();
    ctx.save();
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#bae6fd';
    ctx.fillText(en ? 'EARTH' : 'TRÁI ĐẤT', L.earthPos.x, L.earthPos.y + orbR + 20);
    ctx.fillStyle = '#fed7aa';
    ctx.fillText(en ? 'MARS' : 'SAO HỎA', L.marsPos.x, L.marsPos.y + orbR * 0.85 + 20);
    ctx.restore();

    const pos = this._getArcPos(from, to, this.transitProgress, arcH);
    const active = this.isBoosting || this.keys.boost;
    this._drawStarship(ctx, pos.x, pos.y, pos.angle, L.isNarrow ? 0.86 : 1.05, active, false, 0);

    const km = Math.round((isOutbound ? this.transitProgress : 1 - this.transitProgress) * 225);
    ctx.save();
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.82)';
    ctx.textAlign = 'center';
    ctx.fillText(
      isOutbound ? `SPACEX STARSHIP • EARTH → MARS • ${km}M / 225M KM` : `STARSHIP CARGO: SPIRIT • MARS → EARTH • ${km}M KM`,
      w * 0.5,
      Math.max(122, h * 0.21)
    );
    ctx.restore();
  }

  _renderPickupPhase(ctx, w, h, L) {
    ctx.save();
    ctx.fillStyle = 'rgba(42, 16, 10, 0.72)';
    ctx.beginPath();
    ctx.moveTo(0, L.groundY - 10);
    ctx.lineTo(w * 0.16, L.groundY - 58);
    ctx.lineTo(w * 0.36, L.groundY - 26);
    ctx.lineTo(w * 0.58, L.groundY - 68);
    ctx.lineTo(w * 0.82, L.groundY - 30);
    ctx.lineTo(w, L.groundY - 48);
    ctx.lineTo(w, L.groundY + 20);
    ctx.lineTo(0, L.groundY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const groundG = ctx.createLinearGradient(0, L.groundY - 12, 0, h);
    groundG.addColorStop(0, '#8a3415');
    groundG.addColorStop(0.28, '#4a1709');
    groundG.addColorStop(1, '#1a0905');
    ctx.fillStyle = groundG;
    ctx.beginPath();
    ctx.moveTo(0, L.groundY);
    ctx.quadraticCurveTo(w * 0.35, L.groundY - 14, w * 0.7, L.groundY + 4);
    ctx.lineTo(w, L.groundY - 6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    this.marsRocks.forEach(rk => {
      const rx = rk.rx * w;
      const ry = L.groundY + rk.ry * h;
      ctx.fillStyle = `rgba(38, 14, 8, ${rk.shade})`;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rk.w, rk.h, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    this._drawStarship(ctx, L.shipLandX, L.groundY - 42, -Math.PI * 0.5, L.isNarrow ? 1.2 : 1.52, false, true, 1);

    const bayX = L.shipLandX;
    const bayY = L.groundY - 66;
    const p = this.pickupProgress;
    const sx = L.spiritX + (bayX - L.spiritX) * p;
    const sy = L.groundY - Math.sin(p * Math.PI) * 118 - p * 46;
    const spiritScale = (L.isNarrow ? 0.88 : 1.1) * (1 - p * 0.48);

    if (p > 0.01 && !this.spiritPickedUp) {
      const elbowX = (bayX + sx) * 0.5;
      const elbowY = Math.min(bayY, sy - 42) - 48;
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(bayX + 8, bayY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(sx, sy - 38 * spiritScale);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(elbowX, elbowY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy - 24 * spiritScale, 26 * spiritScale, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      ctx.restore();
    }

    if (!this.spiritPickedUp) {
      ctx.save();
      ctx.translate(sx, sy);
      if (window.VantaGfx && window.VantaGfx.drawMERRover) {
        window.VantaGfx.drawMERRover(ctx, { wheelRot: 0, stuckWheel: true, scale: spiritScale });
      }
      const blink = 0.4 + 0.6 * Math.abs(Math.sin(this.elapsed * 4.2));
      ctx.fillStyle = `rgba(251, 113, 133, ${blink})`;
      ctx.beginPath();
      ctx.arc(0, -48 * spiritScale, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(252, 211, 77, ${0.42 + 0.42 * Math.sin(this.elapsed * 4)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -24 * spiritScale, 52 * spiritScale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _renderMotorPhase(ctx, w, h, L) {
    ctx.save();
    const spot = ctx.createRadialGradient(w * 0.5, h * 0.12, 10, w * 0.5, h * 0.56, Math.min(w, h) * 0.55);
    spot.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    spot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, w, h);

    const floorY = h * 0.60;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.14, floorY);
    ctx.lineTo(w * 0.86, floorY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1;
    for (let gx = w * 0.18; gx <= w * 0.82; gx += 36) {
      ctx.beginPath();
      ctx.moveTo(gx, floorY);
      ctx.lineTo(gx, floorY + 28);
      ctx.stroke();
    }
    ctx.restore();

    const rScale = L.isNarrow ? 1.4 : 1.82;
    ctx.save();
    ctx.translate(w * 0.5, floorY - 4);
    if (window.VantaGfx && window.VantaGfx.drawMERRover) {
      window.VantaGfx.drawMERRover(ctx, {
        wheelRot: this.wheelSpin,
        stuckWheel: this.motorStep !== 'done',
        scale: rScale
      });
    }
    ctx.restore();

    const hx = L.hubPos.x;
    const hy = L.hubPos.y;
    ctx.save();
    ctx.strokeStyle = this.motorStep === 'done' ? '#38bdf8' : '#fb923c';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(hx, hy, 36 + Math.sin(this.elapsed * 4) * 3, 0, Math.PI * 2);
    ctx.stroke();
    for (let b = 0; b < 4; b++) {
      const ba = (b / 4) * Math.PI * 2 + Math.PI * 0.25;
      ctx.fillStyle = this.motorStep === 'done' ? '#7dd3fc' : '#fdba74';
      ctx.beginPath();
      ctx.arc(hx + Math.cos(ba) * 26, hy + Math.sin(ba) * 26, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (this.motorStep === 'remove_old') {
      this._drawMotorUnit(ctx, hx, hy, false, 0.86);
    } else if (this.motorStep === 'removing') {
      const t = this.motorAnim;
      this._drawMotorUnit(ctx, hx - t * 115, hy - t * 95, false, 0.86 * (1 - t * 0.4));
    }

    if (this.motorStep === 'install_new') {
      const bob = Math.sin(this.elapsed * 3.5) * 6;
      this._drawMotorUnit(ctx, L.newMotorPos.x, L.newMotorPos.y + bob, true, 1.08);
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(L.newMotorPos.x - 40, L.newMotorPos.y + bob);
      ctx.lineTo(hx + 36, hy);
      ctx.stroke();
      ctx.restore();
    } else if (this.motorStep === 'installing') {
      const t = 0.5 - 0.5 * Math.cos(this.motorAnim * Math.PI);
      const mx = L.newMotorPos.x + (hx - L.newMotorPos.x) * t;
      const my = L.newMotorPos.y + (hy - L.newMotorPos.y) * t - Math.sin(t * Math.PI) * 48;
      this._drawMotorUnit(ctx, mx, my, true, 1.08 - t * 0.22);
    } else if (this.motorStep === 'done') {
      this._drawMotorUnit(ctx, hx, hy, true, 0.84);
    }
  }

  _renderBatteryPhase(ctx, w, h, L) {
    const floorY = h * 0.57;
    const rScale = L.isNarrow ? 1.35 : 1.75;

    const lampAlpha = 0.08 + (this.battery / 100) * 0.22;
    const lamp = ctx.createRadialGradient(w * 0.5, floorY - 120, 8, w * 0.5, floorY - 20, 220);
    lamp.addColorStop(0, `rgba(253, 224, 71, ${lampAlpha})`);
    lamp.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w * 0.5, floorY);
    if (window.VantaGfx && window.VantaGfx.drawMERRover) {
      window.VantaGfx.drawMERRover(ctx, {
        wheelRot: this.wheelSpin,
        stuckWheel: false,
        scale: rScale
      });
    }
    if (this.battery >= 45) {
      const eyeAlpha = Math.min(1, (this.battery - 45) / 40);
      ctx.fillStyle = `rgba(56, 189, 248, ${eyeAlpha})`;
      ctx.beginPath();
      ctx.arc(17 * rScale, -70.8 * rScale, 2.8, 0, Math.PI * 2);
      ctx.arc(24 * rScale, -70.8 * rScale, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(L.chargePadPos.x, L.chargePadPos.y - 26);
    ctx.quadraticCurveTo(w * 0.5 - 32, (L.chargePadPos.y + floorY) * 0.5, w * 0.5, floorY - 38);
    ctx.stroke();

    if (this.isCharging || this.battery >= 100) {
      ctx.strokeStyle = this.battery >= 100 ? '#4ade80' : '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -this.elapsed * 90;
      ctx.beginPath();
      ctx.moveTo(L.chargePadPos.x, L.chargePadPos.y - 26);
      ctx.quadraticCurveTo(w * 0.5 - 32, (L.chargePadPos.y + floorY) * 0.5, w * 0.5, floorY - 38);
      ctx.stroke();
    }
    ctx.restore();

    const barW = Math.min(290, w * 0.7);
    const barH = 22;
    const bx = w * 0.5 - barW * 0.5;
    const by = h * 0.27;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.42)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 11);
    ctx.fill();
    ctx.stroke();

    const fillW = Math.max(0, (barW - 6) * (this.battery / 100));
    const batColor = this.battery < 35 ? '#fb7185' : this.battery < 85 ? '#38bdf8' : '#4ade80';
    ctx.fillStyle = batColor;
    ctx.beginPath();
    ctx.roundRect(bx + 3, by + 3, fillW, barH - 6, 8);
    ctx.fill();

    const en = window.VantaI18n && window.VantaI18n.isEn();
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`${en ? 'SPIRIT BATTERY' : 'PIN SPIRIT'}: ${Math.round(this.battery)}%`, w * 0.5, by - 10);
    ctx.restore();

    const padR = L.isNarrow ? 34 : 38;
    ctx.save();
    ctx.fillStyle = this.isCharging ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = this.battery >= 100 ? '#4ade80' : '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(L.chargePadPos.x, L.chargePadPos.y, padR + (this.isCharging ? Math.sin(this.elapsed * 18) * 3 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.battery >= 100 ? '#4ade80' : '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(L.chargePadPos.x + 3, L.chargePadPos.y - 16);
    ctx.lineTo(L.chargePadPos.x - 10, L.chargePadPos.y + 2);
    ctx.lineTo(L.chargePadPos.x - 1, L.chargePadPos.y + 2);
    ctx.lineTo(L.chargePadPos.x - 4, L.chargePadPos.y + 16);
    ctx.lineTo(L.chargePadPos.x + 10, L.chargePadPos.y - 2);
    ctx.lineTo(L.chargePadPos.x + 1, L.chargePadPos.y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _renderPhaseStepper(ctx, w, h) {
    const en = window.VantaI18n && window.VantaI18n.isEn();
    const phases = ['to_mars', 'pickup', 'to_earth', 'replace_motor', 'charge_battery'];
    const labels = en
      ? ['1. To Mars', '2. Lift Spirit', '3. To Earth', '4. Swap Motor', '5. Charge']
      : ['1. Bay Sao Hỏa', '2. Bế Spirit', '3. Bay Về', '4. Thay Motor', '5. Sạc Pin'];
    const activeIdx = phases.indexOf(this.phase);
    const y = Math.max(88, h * 0.135);
    const stepW = Math.min(82, (w - 40) / 5);
    const startX = w * 0.5 - stepW * 5 * 0.5 + stepW * 0.5;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = w < 640 ? '500 9.5px "JetBrains Mono", monospace' : '500 10.5px "JetBrains Mono", monospace';
    phases.forEach((_, i) => {
      const px = startX + i * stepW;
      const done = i < activeIdx || this.ending;
      const curr = i === activeIdx && !this.ending;
      ctx.fillStyle = done ? '#4ade80' : curr ? '#fcd34d' : 'rgba(148, 163, 184, 0.45)';
      ctx.beginPath();
      ctx.arc(px, y, curr ? 4.5 : 3.2, 0, Math.PI * 2);
      ctx.fill();
      if (w >= 540 || curr) {
        ctx.fillText(labels[i], px, y + 16);
      }
    });
    ctx.restore();
  }

  _renderPromptPill(ctx, w, h) {
    const en = window.VantaI18n && window.VantaI18n.isEn();
    let text = '';
    if (this.ending) {
      text = en ? '★ SPIRIT 100% RESTORED BACK ON EARTH!' : '★ SPIRIT ĐÃ HỒI SINH 100% TRÊN TRÁI ĐẤT!';
    } else if (this.phase === 'to_mars') {
      text = en ? 'HOLD (OR SPACE) TO LAUNCH SPACEX STARSHIP TO MARS' : 'NHẤN GIỮ (HOẶC SPACE) ĐỂ PHÓNG TÀU SPACEX LÊN SAO HỎA';
    } else if (this.phase === 'pickup') {
      text = this.spiritPickedUp
        ? (en ? 'SPIRIT SECURED IN CARGO BAY!' : 'ĐÃ ĐƯA SPIRIT VÀO KHOANG TÀU!')
        : (en ? 'HOLD TO LIFT SPIRIT INTO SPACEX STARSHIP' : 'NHẤN GIỮ ĐỂ BẾ ROVER SPIRIT LÊN TÀU SPACEX');
    } else if (this.phase === 'to_earth') {
      text = en ? 'HOLD TO FLY SPACEX STARSHIP BACK TO EARTH' : 'NHẤN GIỮ ĐỂ LÁI TÀU SPACEX ĐƯA SPIRIT VỀ TRÁI ĐẤT';
    } else if (this.phase === 'replace_motor') {
      if (this.motorStep === 'remove_old') text = en ? 'TAP SEIZED WHEEL TO REMOVE OLD MOTOR' : 'CHẠM VÀO BÁNH XE HỎNG ĐỂ THÁO MOTOR CŨ';
      else if (this.motorStep === 'install_new') text = en ? 'TAP NEW MOTOR TO INSTALL INTO SPIRIT' : 'CHẠM VÀO MOTOR MỚI ĐỂ LẮP VÀO BÁNH XE SPIRIT';
      else text = en ? 'NEW MOTOR INSTALLED • ALL 6 WHEELS READY!' : 'ĐÃ THAY MOTOR MỚI • 6 BÁNH XE HOẠT ĐỘNG TRƠN TRU!';
    } else if (this.phase === 'charge_battery') {
      text = en ? 'HOLD / TAP LIGHTNING PAD TO CHARGE SPIRIT (100%)' : 'NHẤN GIỮ / CHẠM LIÊN TỤC BIỂU TƯỢNG SÉT ĐỂ SẠC PIN SPIRIT (100%)';
    }

    ctx.save();
    ctx.font = w < 640 ? '500 11px "JetBrains Mono", monospace' : '500 12px "JetBrains Mono", monospace';
    const tw = Math.min(w - 32, ctx.measureText(text).width + 36);
    const py = h - (w < 640 ? 48 : 40);
    ctx.fillStyle = 'rgba(8, 13, 26, 0.82)';
    ctx.strokeStyle = 'rgba(252, 211, 77, 0.38)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(w * 0.5 - tw * 0.5, py - 16, tw, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w * 0.5, py, tw - 20);
    ctx.restore();
  }

  getSessionMetric() {
    return '225M km × 2 • Motor mới • Pin 100%';
  }
}

window.SpiritRescueGame = SpiritRescueGame;
