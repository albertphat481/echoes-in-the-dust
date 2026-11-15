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
    stars.sort((a, b) => (a.color < b.color ? -1 : a.color > b.color ? 1 : 0));
    return stars;
  };

  G.drawStarfield = function (ctx, stars, w, h, timeSec, globalAlpha = 1) {
    ctx.save();
    let lastColor = '';
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const tw = 0.55 + 0.45 * Math.sin(timeSec * s.speed + s.phase);
      const sx = s.x * w;
      const sy = s.y * h;
      ctx.globalAlpha = globalAlpha * (0.25 + 0.7 * tw);
      if (s.color !== lastColor) {
        lastColor = s.color;
        ctx.fillStyle = lastColor;
      }
      if (s.r < 0.78) {
        const d = s.r * 2;
        ctx.fillRect(sx - s.r, sy - s.r, d, d);
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  /**
   * Recognisable Near-Side Moon (procedural, no external texture)
   * Maria, named craters and ray systems are placed at their real selenographic
   * positions (orthographic projection of lon/lat), so the disc reads instantly as
   * "our" Moon: Imbrium, Serenitatis, Tranquillitatis, Crisium, Procellarum,
   * bright Tycho + Copernicus rays, cratered southern highlands.
   * Shading uses Lommel–Seeliger / lunar-Lambert (the flat, limb-bright look of
   * the real Moon) with a soft gibbous terminator.
   */
  G.renderMoonGlobe = function (canvas, size = 512) {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // ~1s of per-pixel work: render once per session and reuse
    G._moonCache = G._moonCache || {};
    const cached = G._moonCache[size];
    if (cached) { ctx.clearRect(0, 0, size, size); ctx.drawImage(cached, 0, 0); return; }
    const c = size * 0.5;
    const r = size * 0.46;
    const N = size * size;

    const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
    const smooth = (a, b, x) => {
      const t = clamp01((x - a) / (b - a));
      return t * t * (3 - 2 * t);
    };
    // lon/lat (deg, +E / +N) -> orthographic disc coords (x right, y down)
    const proj = (lon, lat) => {
      const lo = (lon * Math.PI) / 180;
      const la = (lat * Math.PI) / 180;
      return { x: Math.cos(la) * Math.sin(lo), y: -Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
    };

    // ---- Maria: [lon, lat, angular radius X (deg), angular radius Y (deg), darkness]
    const MARIA = [
      [-16, 33, 19, 17, 1.0],   // Imbrium
      [17.5, 28, 11, 10, 0.95], // Serenitatis
      [31, 8.5, 14, 10, 0.95],  // Tranquillitatis
      [27, 14, 7, 6, 0.9],      // Tranquillitatis north lobe
      [59, 17, 9, 7.5, 1.0],    // Crisium
      [51, -8, 7, 11, 0.85],    // Fecunditatis
      [35, -15, 5.5, 5.5, 0.85],// Nectaris
      [-57, 20, 15, 22, 0.9],   // Procellarum (north-west)
      [-45, -2, 13, 16, 0.85],  // Procellarum (central)
      [-17, -21, 10, 8, 0.8],   // Nubium
      [-39, -24, 6, 6, 0.9],    // Humorum
      [-23, -10, 7, 6, 0.75],   // Cognitum
      [-30, 7, 8, 7, 0.75],     // Insularum
      [3.6, 13, 4.5, 4, 0.85],  // Vaporum
      [-68, -5, 3, 3.5, 1.0],   // Grimaldi floor
      [-38, 57, 6, 4, 0.7],     // Frigoris (chain along 56N)
      [-22, 56, 6, 4, 0.75],
      [-6, 56, 6, 4, 0.75],
      [10, 57, 6, 4, 0.75],
      [26, 58, 6, 4, 0.7],
      [10, 37, 5, 4, 0.8],      // Imbrium-Serenitatis neck
      [40, 22, 4, 4, 0.75],     // Tranquillitatis east arm
      [69, 2, 4, 6, 0.7]        // Smythii / Marginis edge
    ].map(([lon, lat, ax, ay, dark]) => {
      const p = proj(lon, lat);
      return { ...p, ax: (ax * 1.22 * Math.PI) / 180, ay: (ay * 1.22 * Math.PI) / 180, dark };
    });

    const height = new Float32Array(N);
    const albedo = new Float32Array(N);
    const mare = new Float32Array(N);
    const inside = new Uint8Array(N);
    const sx = new Float32Array(N);
    const sy = new Float32Array(N);
    const sz = new Float32Array(N);

    // ---- Pass 1: base albedo, maria mask, gentle terrain
    for (let py = 0; py < size; py++) {
      const dy = (py + 0.5 - c) / r;
      for (let px = 0; px < size; px++) {
        const dx = (px + 0.5 - c) / r;
        const d2 = dx * dx + dy * dy;
        const i = py * size + px;
        if (d2 > 1.0) continue;
        const dz = Math.sqrt(1 - d2);
        inside[i] = 1;
        sx[i] = dx; sy[i] = dy; sz[i] = dz;

        // Organic shoreline warp
        const warp = (G.fbm(dx * 2.6 + 11.3, dy * 2.6 + 7.1, 5, 41) - 0.5) * 1.05 + (G.fbm(dx * 11 + 2.1, dy * 11 + 4.4, 3, 43) - 0.5) * 0.25;
        let m = 0;
        for (let k = 0; k < MARIA.length; k++) {
          const M = MARIA[k];
          // great-circle-ish distance measured in local tangent plane
          const ex = dx - M.x;
          const ey = dy - M.y;
          const ez = dz - M.z;
          // horizontal (east-west) vs vertical (north-south) components
          const q = Math.sqrt((ex * ex + ez * ez) / (M.ax * M.ax) + (ey * ey) / (M.ay * M.ay));
          const v = (1 - smooth(0.55, 1.15, q + warp)) * M.dark;
          if (v > m) m = v;
        }
        mare[i] = m;

        const mottle = G.fbm(dx * 9 + 3.3, dy * 9 + 5.1, 4, 77);
        const fine = G.fbm(dx * 38 + 1.7, dy * 38 + 9.4, 3, 133);
        const highland = 0.66 + (mottle - 0.5) * 0.16 + (fine - 0.5) * 0.08;
        const maria = 0.27 + (mottle - 0.5) * 0.14 + (fine - 0.5) * 0.04;
        albedo[i] = highland + (maria - highland) * m;

        // Highlands are rugged, maria are smooth lava plains
        height[i] = (G.fbm(dx * 6 + 2.2, dy * 6 + 8.8, 5, 301) - 0.5) * 0.035 * (1 - m * 0.8);
      }
    }

    // ---- Crater stamping (bounding-box raster, true 3D distance => limb foreshortening)
    const stampCrater = (cx3, cy3, cz3, R, depth, fresh, darkFloor = 0) => {
      const reach = R * 1.6;
      const x0 = Math.max(0, Math.floor(c + (cx3 - reach) * r));
      const x1 = Math.min(size - 1, Math.ceil(c + (cx3 + reach) * r));
      const y0 = Math.max(0, Math.floor(c + (cy3 - reach) * r));
      const y1 = Math.min(size - 1, Math.ceil(c + (cy3 + reach) * r));
      for (let py = y0; py <= y1; py++) {
        for (let px = x0; px <= x1; px++) {
          const i = py * size + px;
          if (!inside[i]) continue;
          const ex = sx[i] - cx3, ey = sy[i] - cy3, ez = sz[i] - cz3;
          const t = Math.sqrt(ex * ex + ey * ey + ez * ez) / R;
          if (t >= 1.6) continue;
          if (t < 1) {
            height[i] += (t * t - 1) * depth * R * 0.45;
            if (darkFloor > 0) albedo[i] -= darkFloor * (1 - smooth(0.6, 0.95, t));
            if (fresh > 0) albedo[i] += fresh * 0.08;
          } else {
            const rt = (t - 1) / 0.6;
            height[i] += Math.exp(-rt * 4) * depth * R * 0.18;
            if (fresh > 0) albedo[i] += fresh * 0.22 * Math.exp(-rt * 2.6);
          }
        }
      }
    };

    // Background crater population (dense on highlands, sparse on maria)
    let made = 0;
    for (let n = 0; made < 650 && n < 3000; n++) {
      const u = G.hash2(n, 1, 517) * 2 - 1;
      const v = G.hash2(n, 2, 517) * 2 - 1;
      if (u * u + v * v > 0.97) continue;
      const pi = Math.floor(c + v * r) * size + Math.floor(c + u * r);
      const m = mare[pi] || 0;
      if (G.hash2(n, 3, 517) < m * 0.85) continue;
      const z = Math.sqrt(1 - u * u - v * v);
      const R = 0.004 + Math.pow(G.hash2(n, 4, 517), 4.2) * 0.04;
      const fresh = G.hash2(n, 5, 517) > 0.93 ? 0.6 : 0;
      stampCrater(u, v, z, R, 0.55 + G.hash2(n, 6, 517) * 0.4, fresh);
      made++;
    }

    // Named landmark craters at real coordinates
    const NAMED = [
      // lon, lat, radius (moon radii), depth, fresh(bright), darkFloor
      [-11.4, -43.3, 0.026, 1.0, 1.0, 0],    // Tycho
      [-20.1, 9.6, 0.028, 1.0, 0.9, 0],      // Copernicus
      [-38, 8.1, 0.011, 0.9, 0.9, 0],        // Kepler
      [-47.5, 23.7, 0.012, 0.9, 1.6, 0],     // Aristarchus (brightest spot)
      [-9.3, 51.6, 0.029, 0.35, 0, 0.12],    // Plato (dark floor)
      [-14.1, -58.4, 0.065, 0.5, 0, 0],      // Clavius
      [61, -8.9, 0.038, 0.8, 0.3, 0],        // Langrenus
      [26.4, -11.4, 0.029, 0.9, 0.25, 0],    // Theophilus
      [-1.9, -9.3, 0.044, 0.3, 0, 0.02],     // Ptolemaeus
      [-3.1, -18.2, 0.022, 0.5, 0, 0],       // Arzachel
      [-1.1, 29.4, 0.012, 0.9, 0.4, 0],      // Aristillus
      [44.4, -16.9, 0.012, 0.8, 0.6, 0]      // Stevinus-like fresh
    ];
    const RAYED = [];
    for (const [lon, lat, R, depth, fresh, darkFloor] of NAMED) {
      const p = proj(lon, lat);
      stampCrater(p.x, p.y, p.z, R, depth, fresh, darkFloor);
      if (fresh >= 0.9) RAYED.push({ ...p, R, strength: fresh });
    }

    // ---- Ray systems (Tycho, Copernicus, Kepler, Aristarchus)
    RAYED.forEach((rc, k) => {
      const reach = rc.R * (k === 0 ? 44 : 18);
      // tangent basis at crater centre
      let ux = rc.z, uy = 0, uz = -rc.x;
      const ul = Math.hypot(ux, uz) || 1;
      ux /= ul; uz /= ul;
      const vx = rc.y * uz - rc.z * uy;
      const vy = rc.z * ux - rc.x * uz;
      const vz = rc.x * uy - rc.y * ux;
      const seed = 900 + k * 37;
      for (let i = 0; i < N; i++) {
        if (!inside[i]) continue;
        const ex = sx[i] - rc.x, ey = sy[i] - rc.y, ez = sz[i] - rc.z;
        const d = Math.sqrt(ex * ex + ey * ey + ez * ez);
        if (d > reach || d < rc.R * 1.2) continue;
        const a = Math.atan2(ex * vx + ey * vy + ez * vz, ex * ux + ey * uy + ez * uz);
        // irregular streaks: angular noise sharpened
        const ca = Math.cos(a), sa = Math.sin(a); // periodic sampling => no seam
        const streak = Math.pow(G.fbm(ca * 4.2 + k * 7.3, sa * 4.2 + 3.1, 4, seed), 2.2) * 2.6;
        const broken = G.fbm(ca * 6 + d * 9, sa * 6 + d * 12, 3, seed + 5);
        const fall = Math.pow(1 - d / reach, 1.6);
        const halo = Math.exp(-(d / rc.R - 1.2) * 0.9) * 0.3;
        const near = smooth(rc.R * 1.4, rc.R * 6, d);
        albedo[i] += (clamp01(streak * broken * 1.4 - 0.25) * near + halo) * fall * 0.32 * rc.strength;
      }
    });

    // ---- Pass 2: lighting
    const img = ctx.createImageData(size, size);
    const data = img.data;
    // Waxing-gibbous sun from the left, so the right limb rolls into a soft terminator
    let lx = -0.42, ly = -0.12, lz = 0.9;
    const ll = Math.hypot(lx, ly, lz);
    lx /= ll; ly /= ll; lz /= ll;
    const bump = 0.35;

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const i = py * size + px;
        const o = i * 4;
        const dx = (px + 0.5 - c) / r;
        const dy = (py + 0.5 - c) / r;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const aa = clamp01((1 - dist) * r + 0.5); // 1px anti-aliased limb
        if (aa <= 0) { data[o + 3] = 0; continue; }

        const ii = inside[i] ? i : (py * size + Math.min(size - 1, Math.max(0, Math.round(c + dx / dist * (r - 1)))));
        const nxS = inside[i] ? sx[i] : dx / dist;
        const nyS = inside[i] ? sy[i] : dy / dist;
        const nzS = inside[i] ? sz[i] : 0.001;

        const xl = px > 0 && inside[i - 1] ? i - 1 : i;
        const xr = px < size - 1 && inside[i + 1] ? i + 1 : i;
        const yu = py > 0 && inside[i - size] ? i - size : i;
        const yd = py < size - 1 && inside[i + size] ? i + size : i;
        const gx = (height[xr] - height[xl]) * r / Math.max(1, (xr - xl));
        const gy = (height[yd] - height[yu]) * r / Math.max(1, (yd - yu) / size);

        let nx = nxS - gx * bump;
        let ny = nyS - gy * bump;
        let nz = nzS;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl; ny /= nl; nz /= nl;

        const mu0 = nx * lx + ny * ly + nz * lz;       // incidence
        const mu = Math.max(0.05, nzS);                 // emission (viewer at +z)
        const lit = smooth(-0.04, 0.12, mu0) * Math.max(0, mu0);
        const ls = lit / (lit + mu + 1e-4);             // Lommel–Seeliger
        const refl = ls * 1.55 + lit * 0.22;            // lunar-Lambert blend
        const earthshine = 0.018 * clamp01(-mu0 * 3 + 0.4);

        const A = albedo[ii];
        const m = mare[ii];
        let val = (A * refl + earthshine * A) * 255 * 1.12;
        val = Math.max(0, Math.min(255, val));

        // Highlands faintly warm, maria faintly cool-blue (titanium basalt)
        data[o] = Math.min(255, val * (1.02 - m * 0.05));
        data[o + 1] = Math.min(255, val * (1.0 - m * 0.02));
        data[o + 2] = Math.min(255, val * (0.95 + m * 0.06));
        data[o + 3] = Math.round(aa * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    if (typeof document !== 'undefined') {
      const keep = document.createElement('canvas');
      keep.width = size;
      keep.height = size;
      keep.getContext('2d').drawImage(canvas, 0, 0);
      G._moonCache[size] = keep;
    }
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

  /**
   * 3D-shaded cratered rocky asteroid / meteoroid silhouette.
   */
  G.drawAsteroidRock = function (ctx, x, y, r, rot = 0, seed = 1, warmGlow = false) {
    ctx.save();
    ctx.translate(x, y);

    // Subtle heated entry/solar rim halo when enabled
    if (warmGlow) {
      const aura = ctx.createRadialGradient(0, 0, r * 0.25, 0, 0, r * 1.9);
      aura.addColorStop(0, 'rgba(251, 146, 60, 0.34)');
      aura.addColorStop(0.6, 'rgba(234, 88, 12, 0.12)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.rotate(rot);
    const pts = 11;
    ctx.beginPath();
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const jitter = 0.68 + G.hash2(i * 17, seed * 31, 91) * 0.38;
      const px = Math.cos(a) * r * jitter;
      const py = Math.sin(a) * r * jitter * (0.86 + G.hash2(seed, i, 19) * 0.24);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Directional solar gradient in rock local frame (rotated smoothly)
    const lx = Math.cos(-rot - 0.7) * r;
    const ly = Math.sin(-rot - 0.7) * r;
    const rockGrad = ctx.createLinearGradient(lx, ly, -lx, -ly);
    if (warmGlow) {
      rockGrad.addColorStop(0, '#fed7aa');
      rockGrad.addColorStop(0.35, '#9a5b3c');
      rockGrad.addColorStop(0.75, '#43281c');
      rockGrad.addColorStop(1, '#140c09');
    } else {
      rockGrad.addColorStop(0, '#cbd5e1');
      rockGrad.addColorStop(0.38, '#64748b');
      rockGrad.addColorStop(0.78, '#292524');
      rockGrad.addColorStop(1, '#0c0a09');
    }
    ctx.fillStyle = rockGrad;
    ctx.fill();

    ctx.strokeStyle = warmGlow ? 'rgba(251, 146, 60, 0.72)' : 'rgba(148, 163, 184, 0.36)';
    ctx.lineWidth = Math.max(0.9, r * 0.08);
    ctx.stroke();

    // Surface impact craters
    ctx.save();
    ctx.clip();
    for (let c = 0; c < 3; c++) {
      const ca = G.hash2(seed + c, 11, 7) * Math.PI * 2;
      const cd = r * (0.2 + G.hash2(c, seed + 5, 13) * 0.34);
      const cr = r * (0.14 + G.hash2(seed, c * 9, 3) * 0.14);
      const cx = Math.cos(ca) * cd;
      const cy = Math.sin(ca) * cd;
      ctx.fillStyle = 'rgba(8, 7, 10, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = warmGlow ? 'rgba(253, 186, 116, 0.25)' : 'rgba(203, 213, 225, 0.22)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  };

  /**
   * Deep-space fiery shooting stars & drifting rocky meteoroids streaking across view.
   */
  G.drawSpaceMeteors = function (ctx, w, h, timeSec, opts = {}) {
    const alpha = opts.alpha ?? 0.92;
    const diag = Math.hypot(w, h);
    ctx.save();
    ctx.globalAlpha = alpha;

    // 1) Blazing Mars-orange & white-gold shooting meteors ("sao lửa / sao băng")
    for (let i = 0; i < 5; i++) {
      const period = 4.6 + i * 1.15;
      const tNorm = ((timeSec + i * 1.87) % period) / period;
      if (tNorm > 0.56) continue;
      const cycle = Math.floor((timeSec + i * 1.87) / period);
      const fade = Math.sin((tNorm / 0.56) * Math.PI);

      const angle = (152 + (G.hash2(cycle, i, 71) - 0.5) * 18) * (Math.PI / 180);
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      const sx = w * (0.38 + G.hash2(cycle, i, 17) * 0.72);
      const sy = h * (-0.08 + G.hash2(i, cycle, 29) * 0.58);
      const dist = tNorm * diag * (1.15 + G.hash2(i, cycle, 43) * 0.35);
      const hx = sx + vx * dist;
      const hy = sy + vy * dist;
      const tailLen = 75 + G.hash2(cycle, i, 83) * 105;
      const tx = hx - vx * tailLen;
      const ty = hy - vy * tailLen;

      const isMarsFire = i % 2 === 0 || G.hash2(cycle, i, 59) > 0.38;
      ctx.save();
      ctx.globalAlpha = alpha * fade * 0.9;
      const grad = ctx.createLinearGradient(hx, hy, tx, ty);
      if (isMarsFire) {
        grad.addColorStop(0, 'rgba(255, 244, 214, 0.96)');
        grad.addColorStop(0.22, 'rgba(251, 146, 60, 0.85)');
        grad.addColorStop(0.6, 'rgba(234, 88, 12, 0.32)');
        grad.addColorStop(1, 'rgba(154, 52, 18, 0)');
      } else {
        grad.addColorStop(0, 'rgba(240, 249, 255, 0.95)');
        grad.addColorStop(0.25, 'rgba(125, 211, 252, 0.75)');
        grad.addColorStop(0.65, 'rgba(251, 146, 60, 0.25)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = isMarsFire ? 2.8 : 2.1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // Blazing head coma + ember sparks
      const headGlow = ctx.createRadialGradient(hx, hy, 0, hx, hy, isMarsFire ? 9 : 6.5);
      headGlow.addColorStop(0, '#ffffff');
      headGlow.addColorStop(0.4, isMarsFire ? 'rgba(251, 146, 60, 0.8)' : 'rgba(125, 211, 252, 0.75)');
      headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(hx, hy, isMarsFire ? 9 : 6.5, 0, Math.PI * 2);
      ctx.fill();

      G.drawAsteroidRock(ctx, hx, hy, isMarsFire ? 3.2 : 2.4, timeSec * 4.5 + i, i + 3, isMarsFire);
      ctx.restore();
    }

    // 2) Parallax tumbling rocky asteroids ("thiên thạch") gliding across deep space
    const rockCount = opts.rocks ?? 6;
    for (let j = 0; j < rockCount; j++) {
      const speed = 18 + G.hash2(j, 3, 101) * 26;
      const pad = 40;
      const spanX = w + pad * 2;
      const spanY = h + pad * 2;
      const xRaw = (G.hash2(j, 7, 13) * spanX - timeSec * speed) % spanX;
      const yRaw = (G.hash2(j, 11, 23) * spanY + timeSec * speed * (0.28 + G.hash2(j, 5, 31) * 0.22)) % spanY;
      const rx = (xRaw < 0 ? xRaw + spanX : xRaw) - pad;
      const ry = (yRaw < 0 ? yRaw + spanY : yRaw) - pad;
      const rr = 4.5 + G.hash2(j, 19, 47) * 7.5;
      const warm = j % 3 === 0;

      if (warm) {
        const wake = ctx.createLinearGradient(rx, ry, rx + rr * 3.8, ry - rr * 1.4);
        wake.addColorStop(0, 'rgba(251, 146, 60, 0.28)');
        wake.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.strokeStyle = wake;
        ctx.lineWidth = rr * 0.75;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rr * 3.8, ry - rr * 1.4);
        ctx.stroke();
      }
      G.drawAsteroidRock(ctx, rx, ry, rr, timeSec * (0.45 + (j % 3) * 0.28) * (j % 2 ? 1 : -1), j + 11, warm);
    }

    ctx.restore();
  };

  window.VantaGfx = G;
})();
