/**
 * Minigame 10: SPIRIT RESCUE — Giải Cứu Rover Spirit (Fictional SpaceX Starship Mission)
 * 5-Phase Interactive Mission:
 *   0. to_mars        — Fly SpaceX Starship from Earth to Mars (hold/tap to burn Raptors)
 *   1. pickup         — Land in Gusev Crater & lift ("bế") Spirit Rover into Starship cargo bay
 *   2. to_earth       — Blast off from Mars & return to Earth Orbital Repair Bay
 *   3. replace_motor  — Remove seized wheel motor & install new Titanium Brushless Motor
 *   4. charge_battery — Hold/tap to super-charge Spirit's battery from 12% to 100%
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

    // Phases: 'to_mars' -> 'pickup' -> 'to_earth' -> 'replace_motor' -> 'charge_battery'
    this.phase = 'to_mars';
    this.phaseTime = 0;
    this.transitProgress = 0; // 0..1 for to_mars and to_earth
    this.isBoosting = false;

    // Pickup phase state
    this.pickupProgress = 0; // 0..1 lifting Spirit into Starship bay
    this.isLifting = false;
    this.spiritPickedUp = false;

    // Replace motor phase state: 'remove_old' -> 'install_new' -> 'done'
    this.motorStep = 'remove_old';
    this.motorAnim = 0;
    this.wheelSpin = 0;

    // Charge battery phase state
    this.battery = 12; // 12% -> 100%
    this.isCharging = false;

    this.particles = [];
    this.sparks = [];
    this.stars = window.VantaGfx ? window.VantaGfx.createStarfield(180, 0.95) : [];
    this.pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, down: false };
    this.keys = { boost: false };
  }

  onResize() {}

  _getLayout(w, h) {
    const isNarrow = w < 640;
    return {
      isNarrow,
      earthPos: { x: w * (isNarrow ? 0.18 : 0.2), y: h * (isNarrow ? 0.74 : 0.72) },
      marsPos: { x: w * (isNarrow ? 0.82 : 0.8), y: h * (isNarrow ? 0.28 : 0.28) },
      groundY: h * 0.72,
      shipLandX: w * (isNarrow ? 0.28 : 0.3),
      spiritX: w * (isNarrow ? 0.68 : 0.66),
      hubPos: { x: w * 0.5 - (isNarrow ? 58 : 88), y: h * 0.55 },
      oldMotorPos: { x: w * 0.5 - (isNarrow ? 58 : 88), y: h * 0.55 },
      newMotorPos: { x: w * (isNarrow ? 0.76 : 0.72), y: h * 0.52 },
      chargePadPos: { x: w * 0.5, y: h * (isNarrow ? 0.76 : 0.75) }
    };
  }

  _spawnExhaust(x, y, vx, vy, color = '#60a5fa', count = 2) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: vx + (Math.random() - 0.5) * 45,
        vy: vy + (Math.random() - 0.5) * 45,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
        r: 2.5 + Math.random() * 4.5,
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
        life: 0.55 + Math.random() * 0.45,
        maxLife: 1.0,
        r: 1.8 + Math.random() * 2.5,
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
      // Tap anywhere near Spirit or the Starship cargo bay, or simply hold anywhere to lift Spirit
      this.isLifting = true;
      window.soundEngine.playUIChime(2);
    } else if (this.phase === 'replace_motor') {
      if (this.motorStep === 'remove_old') {
        // Generous hit area around wheel hub or anywhere on rover wheel
        if (Math.hypot(x - L.hubPos.x, y - L.hubPos.y) < 110 || y > h * 0.32) {
          this.motorStep = 'removing';
          this.motorAnim = 0;
          window.soundEngine.playGravelCrunch();
          this._spawnSparks(L.hubPos.x, L.hubPos.y, '#fb923c', 18);
        }
      } else if (this.motorStep === 'install_new') {
        if (
          Math.hypot(x - L.newMotorPos.x, y - L.newMotorPos.y) < 110 ||
          Math.hypot(x - L.hubPos.x, y - L.hubPos.y) < 110
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
          this._spawnSparks(L.hubPos.x, L.hubPos.y, '#fb923c', 18);
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

    // Update particles & sparks
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
      const speed = active ? 0.38 : 0.04;
      this.transitProgress = Math.min(1, this.transitProgress + speed * dt);
      window.soundEngine.setBrushWind(active ? 0.7 : 0, active ? 0.85 : 0.2);

      const pos = this._getArcPos(L.earthPos, L.marsPos, this.transitProgress, -h * 0.18);
      if (active) {
        this._spawnExhaust(pos.x - Math.cos(pos.angle) * 24, pos.y - Math.sin(pos.angle) * 24, -Math.cos(pos.angle) * 140, -Math.sin(pos.angle) * 140, '#60a5fa', 2);
      }

      if (this.transitProgress >= 1) {
        this._spawnSparks(L.marsPos.x, L.marsPos.y, '#fb923c', 20);
        window.soundEngine.playTapeWhoosh();
        this._advancePhase('pickup');
      }
    } else if (this.phase === 'pickup') {
      if (this.isLifting && !this.spiritPickedUp) {
        this.pickupProgress = Math.min(1, this.pickupProgress + dt * 0.72);
        if (Math.random() < 0.35) {
          const sx = L.spiritX + (L.shipLandX - L.spiritX) * this.pickupProgress;
          const sy = L.groundY - Math.sin(this.pickupProgress * Math.PI) * 110;
          this._spawnSparks(sx, sy - 20, '#fcd34d', 2);
        }
        if (this.pickupProgress >= 1) {
          this.spiritPickedUp = true;
          this._spawnSparks(L.shipLandX, L.groundY - 70, '#38bdf8', 24);
          window.soundEngine.playSignatureMotif(2);
          setTimeout(() => {
            if (!this.completed && this.phase === 'pickup') {
              this.transitProgress = 0;
              this._advancePhase('to_earth');
            }
          }, 700);
        }
      } else if (!this.spiritPickedUp && this.pickupProgress > 0) {
        this.pickupProgress = Math.max(0, this.pickupProgress - dt * 0.25);
      }
    } else if (this.phase === 'to_earth') {
      const active = this.isBoosting || this.keys.boost;
      const speed = active ? 0.42 : 0.05;
      this.transitProgress = Math.min(1, this.transitProgress + speed * dt);
      window.soundEngine.setBrushWind(active ? 0.72 : 0, active ? 0.9 : 0.2);

      const pos = this._getArcPos(L.marsPos, L.earthPos, this.transitProgress, h * 0.16);
      if (active) {
        this._spawnExhaust(pos.x - Math.cos(pos.angle) * 24, pos.y - Math.sin(pos.angle) * 24, -Math.cos(pos.angle) * 140, -Math.sin(pos.angle) * 140, '#38bdf8', 2);
      }

      if (this.transitProgress >= 1) {
        this._spawnSparks(L.earthPos.x, L.earthPos.y, '#38bdf8', 22);
        window.soundEngine.playTapeWhoosh();
        this._advancePhase('replace_motor');
      }
    } else if (this.phase === 'replace_motor') {
      if (this.motorStep === 'removing') {
        this.motorAnim += dt * 1.9;
        if (this.motorAnim >= 1) {
          this.motorStep = 'install_new';
          this.motorAnim = 0;
          window.soundEngine.playUITick();
        }
      } else if (this.motorStep === 'installing') {
        this.motorAnim += dt * 1.8;
        if (this.motorAnim >= 1) {
          this.motorStep = 'done';
          this.motorAnim = 1;
          this._spawnSparks(L.hubPos.x, L.hubPos.y, '#38bdf8', 28);
          window.soundEngine.playSuccessBloom();
          setTimeout(() => {
            if (!this.completed && this.phase === 'replace_motor') {
              this._advancePhase('charge_battery');
            }
          }, 850);
        }
      } else if (this.motorStep === 'done') {
        this.wheelSpin += dt * 5.2;
      }
    } else if (this.phase === 'charge_battery') {
      this.wheelSpin += dt * 3.0;
      if (this.isCharging && !this.ending) {
        this.battery = Math.min(100, this.battery + dt * 36);
        if (Math.random() < 0.45) {
          this._spawnSparks(w * 0.5 + (Math.random() - 0.5) * 90, h * 0.42, '#fcd34d', 2);
        }
      }
      if (this.battery >= 100 && !this.ending) {
        this.battery = 100;
        this.ending = true;
        this.isCharging = false;
        this._spawnSparks(w * 0.5, h * 0.44, '#fcd34d', 36);
        this._spawnSparks(w * 0.5, h * 0.44, '#38bdf8', 24);
        window.soundEngine.playSignatureMotif(4);
      }
    }

    if (this.ending && !this.completed) {
      this.finaleTimer += dt;
      if (this.finaleTimer >= 1.8) {
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

  _drawStarship(ctx, x, y, angle, scale = 1, boosting = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI * 0.5);
    ctx.scale(scale, scale);

    // Raptor methalox flame plume
    if (boosting) {
      const flicker = 0.85 + Math.sin(this.elapsed * 42) * 0.2;
      const flameG = ctx.createLinearGradient(0, 26, 0, 26 + 44 * flicker);
      flameG.addColorStop(0, '#e0f2fe');
      flameG.addColorStop(0.35, '#60a5fa');
      flameG.addColorStop(0.7, 'rgba(168, 85, 247, 0.55)');
      flameG.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flameG;
      ctx.beginPath();
      ctx.moveTo(-8, 25);
      ctx.quadraticCurveTo(0, 26 + 48 * flicker, 8, 25);
      ctx.closePath();
      ctx.fill();
    }

    // Aft flaps
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-11, 8);
    ctx.lineTo(-21, 23);
    ctx.lineTo(-11, 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(11, 8);
    ctx.lineTo(21, 23);
    ctx.lineTo(11, 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Forward flaps
    ctx.beginPath();
    ctx.moveTo(-9, -22);
    ctx.lineTo(-16, -12);
    ctx.lineTo(-9, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(9, -22);
    ctx.lineTo(16, -12);
    ctx.lineTo(9, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stainless steel hull
    const hull = ctx.createLinearGradient(-11, 0, 11, 0);
    hull.addColorStop(0, '#475569');
    hull.addColorStop(0.35, '#e2e8f0');
    hull.addColorStop(0.7, '#94a3b8');
    hull.addColorStop(1, '#1e293b');
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(-11, 25);
    ctx.lineTo(-11, -18);
    ctx.quadraticCurveTo(-11, -36, 0, -44);
    ctx.quadraticCurveTo(11, -36, 11, -18);
    ctx.lineTo(11, 25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // SpaceX stripe & payload window
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -21, 10, 11);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-5, -21, 10, 11);

    ctx.restore();
  }

  _drawPlanetOrb(ctx, x, y, r, isMars) {
    const halo = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.7);
    halo.addColorStop(0, isMars ? 'rgba(251, 146, 60, 0.4)' : 'rgba(56, 189, 248, 0.42)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.7, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(x - r * 0.32, y - r * 0.32, r * 0.1, x, y, r);
    if (isMars) {
      grad.addColorStop(0, '#fdba74');
      grad.addColorStop(0.45, '#c2410c');
      grad.addColorStop(1, '#431407');
    } else {
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(0.45, '#0284c7');
      grad.addColorStop(1, '#082f49');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    if (!isMars) {
      // Subtle green-emerald continents on Earth
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = 'rgba(74, 222, 128, 0.38)';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.25, y - r * 0.1, r * 0.32, r * 0.22, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + r * 0.25, y + r * 0.15, r * 0.22, r * 0.3, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawMotorUnit(ctx, x, y, isNew, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Glow
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
    g.addColorStop(0, isNew ? 'rgba(56, 189, 248, 0.42)' : 'rgba(249, 115, 22, 0.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();

    // Cylindrical motor housing
    ctx.fillStyle = isNew ? '#0f172a' : '#291711';
    ctx.strokeStyle = isNew ? '#38bdf8' : '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-20, -14, 40, 28, 7);
    ctx.fill();
    ctx.stroke();

    // Cooling fins / coils
    ctx.strokeStyle = isNew ? '#7dd3fc' : '#9a3412';
    ctx.lineWidth = 1.5;
    for (let i = -10; i <= 10; i += 6.5) {
      ctx.beginPath();
      ctx.moveTo(i, -10);
      ctx.lineTo(i, 10);
      ctx.stroke();
    }

    // Drive shaft
    ctx.fillStyle = isNew ? '#e0f2fe' : '#78350f';
    ctx.fillRect(-28, -4, 8, 8);

    ctx.restore();
  }

  render(ctx, w, h) {
    const L = this._getLayout(w, h);

    // Background per phase
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    if (this.phase === 'pickup') {
      bg.addColorStop(0, '#09070f');
      bg.addColorStop(0.5, '#2b130c');
      bg.addColorStop(1, '#582112');
    } else if (this.phase === 'replace_motor' || this.phase === 'charge_battery') {
      bg.addColorStop(0, '#040914');
      bg.addColorStop(0.55, '#0b1628');
      bg.addColorStop(1, '#08101f');
    } else {
      bg.addColorStop(0, '#03060f');
      bg.addColorStop(1, '#090e1c');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (window.vantaNebulaGL) {
      window.vantaNebulaGL.drawBackdrop(ctx, w, h, {
        alpha: this.phase === 'pickup' ? 0.35 : 0.68,
        lumen: 0.9,
        cyan: this.phase === 'pickup' ? 0.25 : 0.68,
        stars: 0.72
      });
    }
    if (window.VantaGfx) {
      window.VantaGfx.drawStarfield(ctx, this.stars, w, h, this.elapsed, 0.85);
    }

    // Phase-specific rendering
    if (this.phase === 'to_mars' || this.phase === 'to_earth') {
      this._renderTransitPhase(ctx, w, h, L);
    } else if (this.phase === 'pickup') {
      this._renderPickupPhase(ctx, w, h, L);
    } else if (this.phase === 'replace_motor') {
      this._renderMotorPhase(ctx, w, h, L);
    } else if (this.phase === 'charge_battery') {
      this._renderBatteryPhase(ctx, w, h, L);
    }

    // Particles & sparks
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

    // Top-center concise phase progress pills (5 steps)
    this._renderPhaseStepper(ctx, w, h);

    // Bottom action prompt pill
    this._renderPromptPill(ctx, w, h);

    // Celebration Finale Bloom
    if (this.ending) {
      const p = Math.min(1, this.finaleTimer / 1.8);
      const bloom = ctx.createRadialGradient(w * 0.5, h * 0.48, 10, w * 0.5, h * 0.48, Math.max(w, h) * 0.65 * p);
      bloom.addColorStop(0, `rgba(253, 224, 71, ${(1 - p) * 0.45})`);
      bloom.addColorStop(0.5, `rgba(56, 189, 248, ${(1 - p) * 0.22})`);
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

    // Dotted Hohmann transfer trajectory
    ctx.save();
    ctx.strokeStyle = isOutbound ? 'rgba(251, 146, 60, 0.34)' : 'rgba(56, 189, 248, 0.36)';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const pt = this._getArcPos(from, to, i / 40, arcH);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();

    const orbR = L.isNarrow ? 34 : 46;
    this._drawPlanetOrb(ctx, L.earthPos.x, L.earthPos.y, orbR, false);
    this._drawPlanetOrb(ctx, L.marsPos.x, L.marsPos.y, orbR * 0.86, true);

    // Labels
    const en = window.VantaI18n && window.VantaI18n.isEn();
    ctx.save();
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#bae6fd';
    ctx.fillText(en ? 'EARTH' : 'TRÁI ĐẤT', L.earthPos.x, L.earthPos.y + orbR + 20);
    ctx.fillStyle = '#fed7aa';
    ctx.fillText(en ? 'MARS' : 'SAO HỎA', L.marsPos.x, L.marsPos.y + orbR * 0.86 + 20);
    ctx.restore();

    // Starship along arc
    const pos = this._getArcPos(from, to, this.transitProgress, arcH);
    const active = this.isBoosting || this.keys.boost;
    this._drawStarship(ctx, pos.x, pos.y, pos.angle, L.isNarrow ? 0.82 : 1.0, active);

    // Distance telemetry
    const km = Math.round((isOutbound ? this.transitProgress : 1 - this.transitProgress) * 225);
    ctx.save();
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.78)';
    ctx.textAlign = 'center';
    ctx.fillText(
      isOutbound ? `SPACEX STARSHIP • EARTH → MARS • ${km}M / 225M KM` : `STARSHIP CARGO: SPIRIT • MARS → EARTH • ${km}M KM`,
      w * 0.5,
      Math.max(122, h * 0.21)
    );
    ctx.restore();
  }

  _renderPickupPhase(ctx, w, h, L) {
    // Martian Gusev Crater terrain
    const groundG = ctx.createLinearGradient(0, L.groundY - 12, 0, h);
    groundG.addColorStop(0, '#7c2d12');
    groundG.addColorStop(0.3, '#431407');
    groundG.addColorStop(1, '#1a0905');
    ctx.fillStyle = groundG;
    ctx.beginPath();
    ctx.moveTo(0, L.groundY);
    ctx.quadraticCurveTo(w * 0.3, L.groundY - 14, w * 0.65, L.groundY + 4);
    ctx.lineTo(w, L.groundY - 8);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Landed SpaceX Starship on left with open cargo hatch glow
    this._drawStarship(ctx, L.shipLandX, L.groundY - 34, -Math.PI * 0.5, L.isNarrow ? 1.15 : 1.45, false);

    // Cargo bay target glow
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(L.shipLandX, L.groundY - 56, 26 + Math.sin(this.elapsed * 4) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Spirit Rover being lifted ("bế") into Starship
    const p = this.pickupProgress;
    const sx = L.spiritX + (L.shipLandX - L.spiritX) * p;
    const sy = L.groundY - Math.sin(p * Math.PI) * 115 - p * 46;
    const spiritScale = (L.isNarrow ? 0.86 : 1.08) * (1 - p * 0.45);

    // Tractor / Rescue Claw beam while lifting
    if (p > 0.02 && !this.spiritPickedUp) {
      ctx.save();
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(L.shipLandX, L.groundY - 56);
      ctx.lineTo(sx, sy - 24);
      ctx.stroke();
      ctx.restore();
    }

    if (!this.spiritPickedUp) {
      ctx.save();
      ctx.translate(sx, sy);
      if (window.VantaGfx && window.VantaGfx.drawMERRover) {
        window.VantaGfx.drawMERRover(ctx, { wheelRot: 0, stuckWheel: true, scale: spiritScale });
      }
      // Pulsing pickup ring around Spirit
      ctx.strokeStyle = `rgba(252, 211, 77, ${0.45 + 0.45 * Math.sin(this.elapsed * 4)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -24 * spiritScale, 52 * spiritScale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _renderMotorPhase(ctx, w, h, L) {
    // Repair Bay platform grid
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 1;
    const floorY = h * 0.59;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, floorY);
    ctx.lineTo(w * 0.88, floorY);
    ctx.stroke();
    ctx.restore();

    // Large Rover Spirit on repair lift
    const rScale = L.isNarrow ? 1.35 : 1.75;
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

    // Highlight Wheel #1 Hub
    const hx = L.hubPos.x;
    const hy = L.hubPos.y;
    ctx.save();
    ctx.strokeStyle = this.motorStep === 'done' ? '#38bdf8' : '#fb923c';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(hx, hy, 34 + Math.sin(this.elapsed * 4) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Old motor (at hub or flying out)
    if (this.motorStep === 'remove_old') {
      this._drawMotorUnit(ctx, hx, hy, false, 0.85);
    } else if (this.motorStep === 'removing') {
      const t = this.motorAnim;
      this._drawMotorUnit(ctx, hx - t * 110, hy - t * 90, false, 0.85 * (1 - t * 0.4));
    }

    // New SpaceX Brushless Motor waiting on right or snapping into hub
    if (this.motorStep === 'install_new') {
      const bob = Math.sin(this.elapsed * 3.5) * 6;
      this._drawMotorUnit(ctx, L.newMotorPos.x, L.newMotorPos.y + bob, true, 1.05);
      // Dashed guide line to hub
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(L.newMotorPos.x - 36, L.newMotorPos.y + bob);
      ctx.lineTo(hx + 34, hy);
      ctx.stroke();
      ctx.restore();
    } else if (this.motorStep === 'installing') {
      const t = 0.5 - 0.5 * Math.cos(this.motorAnim * Math.PI);
      const mx = L.newMotorPos.x + (hx - L.newMotorPos.x) * t;
      const my = L.newMotorPos.y + (hy - L.newMotorPos.y) * t - Math.sin(t * Math.PI) * 45;
      this._drawMotorUnit(ctx, mx, my, true, 1.05 - t * 0.2);
    } else if (this.motorStep === 'done') {
      this._drawMotorUnit(ctx, hx, hy, true, 0.82);
    }
  }

  _renderBatteryPhase(ctx, w, h, L) {
    const floorY = h * 0.56;
    const rScale = L.isNarrow ? 1.3 : 1.7;

    ctx.save();
    ctx.translate(w * 0.5, floorY);
    if (window.VantaGfx && window.VantaGfx.drawMERRover) {
      window.VantaGfx.drawMERRover(ctx, {
        wheelRot: this.wheelSpin,
        stuckWheel: false,
        scale: rScale
      });
    }
    ctx.restore();

    // Energy arcs from charge pad to Spirit solar deck
    if (this.isCharging || this.battery >= 100) {
      ctx.save();
      ctx.strokeStyle = this.battery >= 100 ? '#fcd34d' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(L.chargePadPos.x, L.chargePadPos.y - 26);
      ctx.quadraticCurveTo(
        w * 0.5 + Math.sin(this.elapsed * 22) * 24,
        (L.chargePadPos.y + floorY) * 0.5,
        w * 0.5,
        floorY - 40
      );
      ctx.stroke();
      ctx.restore();
    }

    // Battery Gauge Bar
    const barW = Math.min(280, w * 0.68);
    const barH = 22;
    const bx = w * 0.5 - barW * 0.5;
    const by = h * 0.26;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
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

    // Glowing Super-Charge Pad button
    const padR = L.isNarrow ? 34 : 38;
    ctx.save();
    ctx.fillStyle = this.isCharging ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = this.battery >= 100 ? '#4ade80' : '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(L.chargePadPos.x, L.chargePadPos.y, padR + (this.isCharging ? Math.sin(this.elapsed * 18) * 3 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lightning bolt icon
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
    const startX = w * 0.5 - (stepW * 5) * 0.5 + stepW * 0.5;

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
    ctx.fillStyle = 'rgba(8, 13, 26, 0.8)';
    ctx.strokeStyle = 'rgba(252, 211, 77, 0.35)';
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
