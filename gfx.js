/**
 * VantaLumen — Procedural Aerospace & Planetary Graphics Engine (gfx.js)
 * True per-pixel 3D normal-mapped planetary rendering, FBM heightfields,
 * spectral starfields, and grounded NASA hardware silhouettes.
 */
(function () {
  const G = {};

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

  let _grainCanvas = null;
  G.getGrainPattern = function (ctx, alpha = 0.05, warm = false) {
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
        d[i] = warm ? Math.min(255, v + 16) : v;
        d[i + 1] = v;
        d[i + 2] = warm ? Math.max(0, v - 16) : v;
        d[i + 3] = Math.floor(alpha * 255);
      }
      gctx.putImageData(img, 0, 0);
      _grainCanvas[key] = c;
    }
    return ctx.createPattern(_grainCanvas[key], 'repeat');
  };

  const SPECTRAL_COLORS = [
    '#b8d0ff',
    '#d6e2ff',
    '#f4f6ff',
    '#fff6eb',
    '#ffe0b5',
    '#ffd18c'
  ];

  G.createStarfield = function (count = 140, maxY = 0.92) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const tier = Math.random();
      const r = tier > 0.96 ? 1.4 + Math.random() * 0.6 : tier > 0.75 ? 0.8 + Math.random() * 0.45 : 0.35 + Math.random() * 0.4;
      const color = SPECTRAL_COLORS[Math.floor(Math.random() * SPECTRAL_COLORS.length)];
      stars.push({
        x: Math.random(),
        y: Math.random() * maxY,
        r,
        color,
        phase: Math.random() * Math.PI * 2,
        speed: 0.7 + Math.random() * 1.4,
        bright: tier > 0.96
      });
    }
    return stars;
  };

  G.drawStarfield = function (ctx, stars, w, h, timeSec, globalAlpha = 1) {
    ctx.save();
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.55 + 0.45 * Math.sin(timeSec * s.speed + s.phase);
      const sx = s.x * w;
      const sy = s.y * h;
      ctx.globalAlpha = globalAlpha * (0.25 + 0.7 * tw);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  /**
   * True 3D Normal-Mapped Lunar Sphere Renderer (Zero 2D wireframe circle strokes!)
   * Evaluates a 3D spherical crater + FBM heightfield per pixel, computes finite-difference
   * surface normals, and shades with Oren-Nayar / Lommel-Seeliger solar illumination.
   */
  G.renderMoonGlobe = function (canvas, size = 512) {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const c = size * 0.5;
    const r = size * 0.46;

    // Pre-generate 55 3D crater centers on the front hemisphere
    const craters = [];
    for (let i = 0; i < 55; i++) {
      const u = (G.hash2(i, 1, 99) - 0.5) * 1.72;
      const v = (G.hash2(i, 2, 99) - 0.5) * 1.72;
      if (u * u + v * v > 0.92) continue;
      const cz = Math.sqrt(Math.max(0.01, 1 - u * u - v * v));
      const rad = 0.035 + Math.pow(G.hash2(i, 3, 99), 2.3) * 0.16;
      const depth = 0.45 + G.hash2(i, 4, 99) * 0.55;
      craters.push({ x: u, y: v, z: cz, r: rad, r2: rad * rad, depth });
    }

    // Heightfield function on unit sphere point (sx, sy, sz)
    function sampleLunarHeight(sx, sy, sz) {
      // Multi-octave FBM terrain
      const fbmCoarse = G.fbm(sx * 2.4 + 3.1, sy * 2.4 + 1.7, 4, 701);
      const fbmFine = G.fbm(sx * 11.5 + 8.3, sy * 11.5 + 4.9, 3, 919);
      let h = fbmCoarse * 0.35 + fbmFine * 0.08;

      // Analytic 3D crater bowls + raised rims
      for (let i = 0; i < craters.length; i++) {
        const cr = craters[i];
        const dx = sx - cr.x;
        const dy = sy - cr.y;
        const dz = sz - cr.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < cr.r2 * 2.1) {
          const t = Math.sqrt(d2) / cr.r;
          if (t < 1.0) {
            // Parabolic bowl depression
            const bowl = (t * t - 1.0) * cr.depth * 0.14;
            h += bowl;
          } else if (t < 1.42) {
            // Raised ejecta rim
            const rimT = (t - 1.0) / 0.42;
            const rim = Math.sin(rimT * Math.PI) * cr.depth * 0.038;
            h += rim;
          }
        }
      }
      return h;
    }

    const img = ctx.createImageData(size, size);
    const data = img.data;
    // Solar light direction (upper-left grazing light for dramatic lunar terminator relief)
    const lx = -0.62, ly = -0.34, lz = 0.706;
    const eps = 0.008;

    for (let py = 0; py < size; py++) {
      const dy = (py - c) / r;
      for (let px = 0; px < size; px++) {
        const dx = (px - c) / r;
        const d2 = dx * dx + dy * dy;
        const idx = (py * size + px) * 4;

        if (d2 > 1.0) {
          const edge = Math.max(0, 1 - (Math.sqrt(d2) - 1) * r * 0.75);
          if (edge <= 0) {
            data[idx + 3] = 0;
            continue;
          }
          data[idx] = 175;
          data[idx + 1] = 180;
          data[idx + 2] = 188;
          data[idx + 3] = Math.floor(edge * 45);
          continue;
        }

        const dz = Math.sqrt(Math.max(0.0001, 1.0 - d2));

        // Sample height & finite-difference gradients for true 3D normal perturbation
        const h0 = sampleLunarHeight(dx, dy, dz);
        const hx = sampleLunarHeight(dx + eps, dy, dz);
        const hy = sampleLunarHeight(dx, dy + eps, dz);
        const dhdx = (hx - h0) / eps;
        const dhdy = (hy - h0) / eps;

        const bumpStrength = 0.36;
        let nx = dx - dhdx * bumpStrength;
        let ny = dy - dhdy * bumpStrength;
        let nz = dz;
        const nLen = Math.hypot(nx, ny, nz) || 1;
        nx /= nLen;
        ny /= nLen;
        nz /= nLen;

        // Basaltic maria mask (Mare Tranquillitatis, Mare Serenitatis, Oceanus Procellarum)
        const mariaNoise = G.fbm(dx * 2.0 + 4.2, dy * 2.0 + 2.5, 4, 701);
        const mariaMask = Math.max(0, Math.min(1, (mariaNoise - 0.44) * 3.8));
        const micro = (G.hash2(px, py, 331) - 0.5) * 0.035;

        // Lunar regolith albedo (neutral warm-silver highlands, dark basaltic maria)
        const baseAlbedo = 0.52 - mariaMask * 0.24 + (h0 - 0.18) * 0.18 + micro;

        // Lommel-Seeliger + Lambertian diffuse with soft terminator & earthshine
        const ndotl = nx * lx + ny * ly + nz * lz;
        const lit = Math.max(0, ndotl);
        const lommel = lit / (lit + Math.max(0.12, nz) * 0.58 + 0.001);
        const earthshine = 0.045 * Math.max(0, 1.0 - lit) * nz;
        const shade = Math.pow(lommel * 0.78 + lit * 0.32 + earthshine, 0.92);

        const val = Math.max(10, Math.min(246, baseAlbedo * shade * 255));
        // Authentic neutral-warm lunar silver-grey (not muddy yellow-green)
        data[idx] = Math.min(255, val * 1.02);
        data[idx + 1] = Math.min(255, val * 1.00);
        data[idx + 2] = Math.min(255, val * (0.97 + mariaMask * 0.05));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  /**
   * Grounded Cinematic NASA MER Rover (Spirit / Opportunity)
   * Rendered in dark anodized titanium, graphite solar deck, and muted warm-bronze Kapton
   * with realistic 6-wheel rocker-bogie linkages and subtle sunset rim lighting.
   */
  G.drawMERRover = function (ctx, opts = {}) {
    const {
      wheelRot = 0,
      stuckWheel = false,
      scale = 1,
      silhouette = false
    } = opts;

    ctx.save();
    ctx.scale(scale, scale);

    // Soft ground contact shadow
    ctx.fillStyle = 'rgba(4, 3, 7, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-6, 4, 50, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Warm Electronics Box (WEB) — Dark bronze-gold MLI thermal blanket in twilight shadow
    const webGrad = ctx.createLinearGradient(-26, -42, 24, -26);
    webGrad.addColorStop(0, silhouette ? '#111622' : '#784717');
    webGrad.addColorStop(0.5, silhouette ? '#0b0f19' : '#3d220a');
    webGrad.addColorStop(1, '#140c06');
    ctx.fillStyle = webGrad;
    ctx.beginPath();
    ctx.moveTo(-25, -41);
    ctx.lineTo(23, -41);
    ctx.lineTo(20, -27);
    ctx.lineTo(-22, -27);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.32)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Solar Array Wing Deck (sleek low-profile graphite/indigo panel with warm rim highlight)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-38, -42);
    ctx.lineTo(34, -42);
    ctx.lineTo(28, -46);
    ctx.lineTo(-32, -46);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(253, 230, 138, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rocker-Bogie Titanium Suspension Tubes (drawn over chassis side)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    // Rear-to-middle bogie linkage
    ctx.moveTo(-38, -9);
    ctx.lineTo(-20, -22);
    ctx.lineTo(-2, -9);
    // Main rocker arm to differential pivot & front wheel
    ctx.moveTo(-20, -22);
    ctx.lineTo(8, -32);
    ctx.lineTo(34, -9);
    ctx.stroke();

    // Pivot joint bolts
    ctx.fillStyle = '#cbd5e1';
    [[-20, -22], [8, -32]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // High-Gain Parabolic Dish & Low-Gain Mast (rear)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-18, -45);
    ctx.lineTo(-21, -55);
    ctx.stroke();
    ctx.save();
    ctx.translate(-22, -56);
    ctx.rotate(-0.38);
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = 'rgba(253, 230, 138, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Pancam Mast Assembly (PMA) + Navcam/Pancam Stereo Bar
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(18, -45);
    ctx.lineTo(20, -68);
    ctx.stroke();

    // Masthead camera housing
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(13, -74, 15, 6.5, 1.5);
    ctx.fill();
    ctx.stroke();

    // Subtle stereo camera glints
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.arc(17, -70.8, 1.4, 0, Math.PI * 2);
    ctx.arc(24, -70.8, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 3 Machined Aluminum Wheels with curved spiral flex-spokes
    const wheelXs = [-38, -2, 34];
    wheelXs.forEach((wx, idx) => {
      const isStuck = stuckWheel && idx === 0; // Rear-dragged stuck wheel at -38
      ctx.save();
      ctx.translate(wx, -9);

      // Outer Machined Cleated Tire
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = isStuck ? 'rgba(125, 211, 252, 0.78)' : '#64748b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spiral shock-absorbing spokes
      const rot = isStuck ? 0.4 : wheelRot;
      ctx.rotate(rot);
      ctx.strokeStyle = isStuck ? 'rgba(125, 211, 252, 0.45)' : 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 1.1;
      for (let s = 0; s < 6; s++) {
        const a = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          Math.cos(a + 0.4) * 5,
          Math.sin(a + 0.4) * 5,
          Math.cos(a) * 8.5,
          Math.sin(a) * 8.5
        );
        ctx.stroke();
      }
      ctx.fillStyle = isStuck ? '#7dd3fc' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  };

  // Detailed Apollo Lunar Module Descent Stage
  G.drawApolloLMDescent = function (ctx, x, y, sunDir = 0, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(2, 4, 10, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-sunDir * 18, 11, 32, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.4;
    [
      [-14, -4, -26, 10],
      [14, -4, 26, 10],
      [0, -2, 0, 11]
    ].forEach(([x0, y0, x1, y1]) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.ellipse(x1, y1, 4.2, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    const g = ctx.createLinearGradient(-16, -15, 16, 0);
    g.addColorStop(0, '#ca8a04');
    g.addColorStop(0.5, '#854d0e');
    g.addColorStop(1, '#3f2305');
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
    ctx.strokeStyle = 'rgba(253, 230, 138, 0.45)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.restore();
  };

  window.VantaGfx = G;
})();
