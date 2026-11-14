/**
 * VantaLumen — Procedural Aerospace & Planetary Graphics Engine (gfx.js)
 * Replaces flat canvas primitives with deterministic FBM noise, regolith grain,
 * spectral starfields, Lommel-Seeliger planetary shading, and detailed NASA hardware.
 */
(function () {
  const G = {};

  // Deterministic hash & 2D value noise
  G.hash2 = function (x, y, seed = 1337) {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };

  G.noise2 = function (x, y, seed = 1337) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = G.hash2(xi, yi, seed);
    const b = G.hash2(xi + 1, yi, seed);
    const c = G.hash2(xi, yi + 1, seed);
    const d = G.hash2(xi + 1, yi + 1, seed);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };

  G.fbm = function (x, y, octaves = 4, seed = 1337) {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
      val += amp * G.noise2(x * freq, y * freq, seed + i * 97);
      norm += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return val / norm;
  };

  // Cached tileable noise grain canvas (128x128) for regolith / film texture
  let _grainCanvas = null;
  G.getGrainPattern = function (ctx, alpha = 0.06, warm = false) {
    const key = `${alpha}_${warm ? 1 : 0}`;
    if (!_grainCanvas) _grainCanvas = {};
    if (!_grainCanvas[key]) {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const gctx = c.getContext('2d');
      const img = gctx.createImageData(128, 128);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.floor(G.hash2(i, i * 3, 42) * 255);
        d[i] = warm ? Math.min(255, v + 22) : v;
        d[i + 1] = v;
        d[i + 2] = warm ? Math.max(0, v - 24) : v;
        d[i + 3] = Math.floor(alpha * 255);
      }
      gctx.putImageData(img, 0, 0);
      _grainCanvas[key] = c;
    }
    return ctx.createPattern(_grainCanvas[key], 'repeat');
  };

  // Realistic Spectral Starfield (O/B blue-white, A/F white, G/K warm amber)
  const SPECTRAL_COLORS = [
    '#9bb8ff', // O/B
    '#cad8ff', // A
    '#f8f7ff', // F
    '#fff4ea', // G
    '#ffd2a1', // K
    '#ffcc6f'  // M
  ];

  G.createStarfield = function (count = 140, maxY = 0.92) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const tier = Math.random();
      const r = tier > 0.95 ? 1.7 + Math.random() * 0.9 : tier > 0.72 ? 0.9 + Math.random() * 0.6 : 0.4 + Math.random() * 0.5;
      const color = SPECTRAL_COLORS[Math.floor(Math.random() * SPECTRAL_COLORS.length)];
      stars.push({
        x: Math.random(),
        y: Math.random() * maxY,
        r,
        color,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.8,
        bright: tier > 0.94
      });
    }
    return stars;
  };

  G.drawStarfield = function (ctx, stars, w, h, timeSec, globalAlpha = 1) {
    ctx.save();
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.45 + 0.55 * Math.sin(timeSec * s.speed + s.phase);
      const sx = s.x * w;
      const sy = s.y * h;
      ctx.globalAlpha = globalAlpha * (0.25 + 0.72 * tw);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Subtle 4-point diffraction cross on brightest stars
      if (s.bright) {
        ctx.globalAlpha = globalAlpha * 0.28 * tw;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.7;
        const arm = s.r * 3.8;
        ctx.beginPath();
        ctx.moveTo(sx - arm, sy);
        ctx.lineTo(sx + arm, sy);
        ctx.moveTo(sx, sy - arm);
        ctx.lineTo(sx, sy + arm);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // High-craft Procedural Moon Globe (Lommel-Seeliger limb + FBM Maria + Directional Craters + Ejecta Rays)
  G.renderMoonGlobe = function (canvas, size = 512) {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const c = size * 0.5;
    const r = size * 0.46;

    const img = ctx.createImageData(size, size);
    const data = img.data;
    // Light vector from upper-left (-0.58, -0.48, 0.66)
    const lx = -0.58, ly = -0.48, lz = 0.66;

    for (let py = 0; py < size; py++) {
      const dy = (py - c) / r;
      for (let px = 0; px < size; px++) {
        const dx = (px - c) / r;
        const d2 = dx * dx + dy * dy;
        const idx = (py * size + px) * 4;
        if (d2 > 1) {
          // Soft anti-aliased edge
          const edge = Math.max(0, 1 - (Math.sqrt(d2) - 1) * r * 0.65);
          if (edge <= 0) {
            data[idx + 3] = 0;
            continue;
          }
          data[idx] = 160;
          data[idx + 1] = 170;
          data[idx + 2] = 185;
          data[idx + 3] = Math.floor(edge * 40);
          continue;
        }

        const nz = Math.sqrt(Math.max(0, 1 - d2));
        // Multi-scale FBM for lunar highlands vs basaltic maria
        const u = dx * 2.2 + 4.1;
        const v = dy * 2.2 + 2.7;
        const mariaNoise = G.fbm(u, v, 4, 701);
        const detailNoise = G.fbm(dx * 9.5 + 11, dy * 9.5 + 7, 3, 919);
        const microGrain = G.hash2(px, py, 331) * 0.06;

        // Basaltic maria mask (darker, smoother plains)
        const mariaMask = Math.max(0, Math.min(1, (mariaNoise - 0.43) * 3.4));
        const albedo = 0.42 + (1 - mariaMask) * 0.34 + (detailNoise - 0.5) * 0.16 + microGrain;

        // Lommel-Seeliger + Lambertian blend (authentic flat lunar opposition/limb brightness)
        const ndotl = Math.max(0.02, dx * lx + dy * ly + nz * lz);
        const lommel = ndotl / (ndotl + Math.max(0.15, nz) * 0.65);
        const shade = Math.pow(lommel * 0.85 + ndotl * 0.25, 0.92);

        // Subtle warm-grey highland / cool-slate maria tint
        const lum = Math.max(8, Math.min(242, albedo * shade * 255));
        data[idx] = Math.min(255, lum * 1.01);
        data[idx + 1] = Math.min(255, lum * 1.0);
        data[idx + 2] = Math.min(255, lum * (0.98 + mariaMask * 0.06));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // Overlay sculpted multi-scale craters & bright ray craters inside clipped globe
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.clip();

    // Tycho-style bright ray crater in lower-center
    const tychoX = c - r * 0.12;
    const tychoY = c + r * 0.56;
    ctx.save();
    ctx.translate(tychoX, tychoY);
    for (let ray = 0; ray < 14; ray++) {
      const a = (ray / 14) * Math.PI * 2 + G.hash2(ray, 5, 19) * 0.3;
      const len = r * (0.28 + G.hash2(ray, 9, 23) * 0.52);
      const rg = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
      rg.addColorStop(0, 'rgba(241, 245, 249, 0.28)');
      rg.addColorStop(1, 'rgba(241, 245, 249, 0)');
      ctx.strokeStyle = rg;
      ctx.lineWidth = 1.2 + G.hash2(ray, 2, 11) * 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.restore();

    // Sculpted craters with directional sunward rim & interior shadow bowl
    for (let i = 0; i < 68; i++) {
      const ang = G.hash2(i, 1, 88) * Math.PI * 2;
      const dist = Math.sqrt(G.hash2(i, 2, 88)) * r * 0.9;
      const cx = c + Math.cos(ang) * dist;
      const cy = c + Math.sin(ang) * dist;
      const cr = 2.5 + Math.pow(G.hash2(i, 3, 88), 2.4) * (r * 0.11);

      // Perspective foreshortening near limb
      const normD = dist / r;
      const foreshorten = Math.max(0.38, Math.sqrt(Math.max(0.14, 1 - normD * normD * 0.72)));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.scale(foreshorten, 1);
      ctx.rotate(-ang);

      // Interior shadow bowl (shadow on upper-left wall, lit on lower-right inner wall)
      const bowl = ctx.createLinearGradient(-cr, -cr, cr, cr);
      bowl.addColorStop(0, 'rgba(7, 10, 18, 0.42)');
      bowl.addColorStop(0.55, 'rgba(15, 23, 42, 0.08)');
      bowl.addColorStop(1, 'rgba(226, 232, 240, 0.22)');
      ctx.fillStyle = bowl;
      ctx.beginPath();
      ctx.arc(0, 0, cr, 0, Math.PI * 2);
      ctx.fill();

      // Crisp sunward rim highlight
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.26)';
      ctx.lineWidth = Math.max(0.7, cr * 0.09);
      ctx.beginPath();
      ctx.arc(0, 0, cr, Math.PI * 0.85, Math.PI * 1.65);
      ctx.stroke();

      // Outer rim shadow
      ctx.strokeStyle = 'rgba(2, 6, 14, 0.34)';
      ctx.lineWidth = Math.max(0.7, cr * 0.09);
      ctx.beginPath();
      ctx.arc(0, 0, cr * 1.03, -Math.PI * 0.15, Math.PI * 0.65);
      ctx.stroke();

      ctx.restore();
    }

    // Subtle warm sunlit crescent limb
    const limb = ctx.createRadialGradient(c - r * 0.28, c - r * 0.28, r * 0.68, c, c, r);
    limb.addColorStop(0, 'rgba(255, 255, 255, 0)');
    limb.addColorStop(0.88, 'rgba(254, 243, 199, 0.06)');
    limb.addColorStop(1, 'rgba(252, 211, 77, 0.22)');
    ctx.fillStyle = limb;
    ctx.fillRect(0, 0, size, size);

    ctx.restore();
  };

  // Detailed NASA MER Rover (Spirit / Opportunity) — Gold Kapton Foil, Rocker-Bogie, Pancam Mast, HGA Dish
  G.drawMERRover = function (ctx, opts = {}) {
    const {
      wheelRot = 0,
      stuckWheel = false,
      scale = 1,
      silhouette = false
    } = opts;

    ctx.save();
    ctx.scale(scale, scale);

    // Ground contact shadow
    ctx.fillStyle = 'rgba(6, 4, 9, 0.68)';
    ctx.beginPath();
    ctx.ellipse(-8, 4, 54, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rocker-Bogie Titanium Suspension Struts
    ctx.strokeStyle = silhouette ? '#94a3b8' : '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-42, -9);
    ctx.lineTo(-22, -26);
    ctx.lineTo(-2, -11);
    ctx.moveTo(-22, -26);
    ctx.lineTo(14, -27);
    ctx.lineTo(36, -9);
    ctx.moveTo(14, -27);
    ctx.lineTo(4, -36);
    ctx.stroke();

    // Warm Electronics Box (Gold Kapton MLI Foil)
    if (silhouette) {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.fillRect(-30, -45, 58, 16);
      ctx.strokeRect(-30, -45, 58, 16);
    } else {
      const foilGrad = ctx.createLinearGradient(-30, -45, 28, -29);
      foilGrad.addColorStop(0, '#fcd34d');
      foilGrad.addColorStop(0.45, '#d97706');
      foilGrad.addColorStop(0.75, '#b45309');
      foilGrad.addColorStop(1, '#fbbf24');
      ctx.fillStyle = foilGrad;
      ctx.fillRect(-26, -42, 50, 14);
      ctx.strokeStyle = 'rgba(254, 243, 199, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-26, -42, 50, 14);

      // Foil crinkle facets
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.45)';
      ctx.beginPath();
      ctx.moveTo(-14, -42); ctx.lineTo(-10, -28);
      ctx.moveTo(2, -42); ctx.lineTo(-2, -28);
      ctx.moveTo(14, -42); ctx.lineTo(18, -28);
      ctx.stroke();

      // Solar Wing Deck on top
      const deckGrad = ctx.createLinearGradient(-36, -49, 34, -44);
      deckGrad.addColorStop(0, '#1e3a5f');
      deckGrad.addColorStop(0.5, '#2563eb');
      deckGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = deckGrad;
      ctx.beginPath();
      ctx.moveTo(-36, -44);
      ctx.lineTo(34, -44);
      ctx.lineTo(30, -48);
      ctx.lineTo(-32, -48);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // High-Gain Antenna Dish (rear)
    ctx.save();
    ctx.translate(-22, -48);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, -11);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-6, -12, 9, 3.2, -0.35, 0, Math.PI * 2);
    ctx.fillStyle = silhouette ? '#1e293b' : '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // Pancam Stereo Mast (front)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(20, -47);
    ctx.lineTo(22, -74);
    ctx.stroke();

    // Pancam Head + Stereo Lenses
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.fillRect(14, -81, 18, 8);
    ctx.strokeRect(14, -81, 18, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(27, -77, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(19, -77, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 3 Visible Wheels (left side) with spiral spokes & cleats
    const wheelXs = [-42, -2, 36];
    wheelXs.forEach((wx, idx) => {
      const isStuck = stuckWheel && idx === 2;
      ctx.save();
      ctx.translate(wx, -9);

      // Tire rim
      ctx.fillStyle = isStuck ? '#082f49' : '#0f172a';
      ctx.strokeStyle = isStuck ? '#7dd3fc' : '#94a3b8';
      ctx.lineWidth = isStuck ? 2.4 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner hub & spokes
      const rot = isStuck ? 0.35 : wheelRot;
      ctx.rotate(rot);
      ctx.strokeStyle = isStuck ? 'rgba(125, 211, 252, 0.7)' : 'rgba(203, 213, 225, 0.55)';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 4; s++) {
        const a = (s / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 8.5, Math.sin(a) * 8.5);
        ctx.stroke();
      }
      ctx.fillStyle = isStuck ? '#38bdf8' : '#fcd34d';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  };

  // Detailed Apollo Lunar Module Descent Stage (Octagonal Gold Kapton Foil + Landing Struts & Footpads)
  G.drawApolloLMDescent = function (ctx, x, y, sunDir = 0, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Long lunar shadow
    ctx.fillStyle = 'rgba(2, 4, 10, 0.72)';
    ctx.beginPath();
    ctx.ellipse(-sunDir * 18, 11, 32, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Landing struts & circular dish footpads
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    [
      [-14, -4, -26, 10],
      [14, -4, 26, 10],
      [0, -2, 0, 11]
    ].forEach(([x0, y0, x1, y1]) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(x1, y1, 4.5, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Gold Kapton octagonal descent body
    const g = ctx.createLinearGradient(-16, -15, 16, 0);
    g.addColorStop(0, '#fde047');
    g.addColorStop(0.45, '#d97706');
    g.addColorStop(1, '#78350f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-13, -15);
    ctx.lineTo(13, -15);
    ctx.lineTo(17, -9);
    ctx.lineTo(15, 0);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-17, -9);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.6)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Front ladder rungs
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let r = -12; r <= -2; r += 3) {
      ctx.beginPath();
      ctx.moveTo(-2.5, r);
      ctx.lineTo(2.5, r);
      ctx.stroke();
    }

    ctx.restore();
  };

  window.VantaGfx = G;
})();
