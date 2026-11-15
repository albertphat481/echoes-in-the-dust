/**
 * VantaLumen — RTX-Grade Physically-Based Space & Planetary GLSL Shaders
 * Provides:
 * 1. Raw GLSL Vertex & Fragment Shaders (window.VANTALUMEN_NEBULA_GLSL)
 * 2. Live WebGL GPU Deep-Space Renderer (window.vantaNebulaGL) — crisp full-res, RTX volumetric rays, ACES Filmic
 * 3. Live WebGL GPU High-Poly RTX Planet Renderer (window.vantaPlanetGL) — Earth, Mars, Moon
 *    rendered on a 57,344-polygon displaced 3D mesh with ray-marched terrain self-shadowing,
 *    Earthshine/regolith GI bounce, GGX specular, volumetric Rayleigh halo, and animated storm lightning
 * 4. Three.js ShaderMaterial factory (window.createVantaLumenThreeMaterial)
 */
(function () {
  const VERTEX_SHADER = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;

    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uLumenIntensity;
    uniform float uCyanMix;
    uniform float uStarDensity;

    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    vec2 hash22(vec2 p) {
      float n = hash21(p);
      return vec2(n, hash21(p + n + 19.19));
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = rot * p * 2.04 + vec2(11.7, 7.3);
        a *= 0.5;
      }
      return v;
    }

    // ACES Filmic Tone Mapping for natural HDR contrast (avoids oversaturated "AI slop")
    vec3 acesFilm(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    // Crisp physical spectral starfield (tight Airy-like core + subtle diffraction glint)
    vec3 starLayer(vec2 uv, float scale, float seed, float time, float brightness) {
      vec2 gv = fract(uv * scale) - 0.5;
      vec2 id = floor(uv * scale) + seed;
      vec2 rnd = hash22(id);

      float densityMask = step(1.0 - uStarDensity * 0.28, rnd.x);
      vec2 offset = (rnd - 0.5) * 0.78;
      vec2 p = gv - offset;
      float d = length(p);

      // Subtle scintillation
      float twinkle = 0.78 + 0.22 * sin(time * (1.1 + rnd.y * 2.1) + rnd.x * 6.2831);

      // Pinpoint crisp star core + tight inverse-square halo
      float pinpoint = smoothstep(0.032, 0.0, d);
      float halo = (0.00055 / (d * d + 0.00045)) * smoothstep(0.22, 0.0, d) * 0.35;

      // Subtle 4-point JWST/Hubble-style diffraction spikes only on the brightest 6% stars
      float isBright = step(0.94, rnd.y);
      float spikeH = exp(-abs(p.y) * 95.0) * smoothstep(0.32, 0.0, abs(p.x));
      float spikeV = exp(-abs(p.x) * 95.0) * smoothstep(0.32, 0.0, abs(p.y));
      float rays = (spikeH + spikeV) * isBright * 0.42;

      // Realistic blackbody stellar temperatures (O/B blue-white -> G white -> K warm amber)
      vec3 blueWhite = vec3(0.76, 0.87, 1.0);
      vec3 pureWhite = vec3(0.98, 0.98, 1.0);
      vec3 warmK = vec3(1.0, 0.84, 0.62);
      vec3 starCol = rnd.y < 0.45
        ? mix(blueWhite, pureWhite, rnd.y / 0.45)
        : mix(pureWhite, warmK, (rnd.y - 0.45) / 0.55);

      return starCol * (pinpoint + halo + rays) * twinkle * densityMask * brightness;
    }

    // Procedural fiery meteors & shooting stars streaking diagonally across deep space
    vec3 meteorStreakLayer(vec2 uv, float time) {
      vec3 acc = vec3(0.0);
      for (int i = 0; i < 6; i++) {
        float fi = float(i);
        float slotPeriod = 5.4 + fi * 1.15;
        float cycle = floor((time + fi * 2.13) / slotPeriod);
        float phase = fract((time + fi * 2.13) / slotPeriod);

        float life = smoothstep(0.0, 0.08, phase) * (1.0 - smoothstep(0.28, 0.44, phase));
        if (life > 0.002) {
          vec2 rnd = hash22(vec2(cycle * 13.7 + fi * 5.1, fi * 29.3 + 7.4));
          vec2 dir = normalize(vec2(-0.88 - 0.14 * rnd.x, -0.34 - 0.24 * rnd.y));
          vec2 ortho = vec2(-dir.y, dir.x);

          vec2 startPos = vec2(
            mix(0.35, 1.05, rnd.x) * 1.25,
            mix(-0.22, 0.62, rnd.y)
          );
          float travel = phase * (2.6 + rnd.y * 0.9);
          vec2 head = startPos + dir * travel;

          vec2 rel = uv - head;
          float along = dot(rel, -dir);
          float across = abs(dot(rel, ortho));

          float tailLen = 0.24 + 0.18 * rnd.x;
          float inTail = smoothstep(-0.015, 0.02, along) * (1.0 - smoothstep(0.04, tailLen, along));
          float width = mix(0.0042, 0.0006, clamp(along / tailLen, 0.0, 1.0));
          float streak = exp(-across / max(0.0004, width)) * inTail;

          float dHead = length(rel);
          float core = exp(-dHead * 115.0) * 1.65 + exp(-dHead * 28.0) * 0.45;

          float isFire = max(1.0 - mod(fi, 2.0), step(0.35, rnd.x));
          vec3 headCol = mix(vec3(0.92, 0.97, 1.0), vec3(1.0, 0.88, 0.62), isFire);
          vec3 coolTail = mix(vec3(0.58, 0.84, 1.0), vec3(0.95, 0.52, 0.22), clamp(along / tailLen, 0.0, 1.0));
          vec3 fireTail = mix(vec3(1.0, 0.56, 0.18), vec3(0.86, 0.24, 0.06), clamp(along / tailLen, 0.0, 1.0));
          vec3 tailCol = mix(coolTail, fireTail, isFire);

          acc += (headCol * core + tailCol * streak * 0.85) * life;
        }
      }
      return acc;
    }

    void main() {
      vec2 aspect = vec2(uResolution.x / max(1.0, uResolution.y), 1.0);
      vec2 uv = (vUv - 0.5) * aspect;
      vec2 mouseOffset = (uMouse - 0.5) * 0.09;

      float t = uTime * 0.018;
      vec2 p = uv * 1.45 + mouseOffset;

      // Subtle Milky Way / interstellar dust structure (low-saturation, high-depth)
      vec2 q = vec2(
        fbm(p + t * 0.25),
        fbm(p + vec2(5.2, 1.3) - t * 0.18)
      );
      vec2 r = vec2(
        fbm(p + 2.4 * q + vec2(1.7, 9.2)),
        fbm(p + 2.4 * q + vec2(8.3, 2.8))
      );
      float f = fbm(p + 2.1 * r);

      // Diagonal Milky Way galactic plane mask
      float galacticBand = exp(-pow((uv.y - uv.x * 0.35) * 1.85, 2.0));
      float dustRift = smoothstep(0.28, 0.72, fbm(p * 1.35 - q * 1.1 + vec2(3.1, -2.4)));

      // Deep realistic observatory palette
      vec3 deepVoid = vec3(0.008, 0.014, 0.032);
      vec3 coldDust = vec3(0.028, 0.052, 0.115);
      vec3 subtleCyan = vec3(0.07, 0.24, 0.42) * (0.45 + 0.55 * uCyanMix);
      vec3 subtleAmber = vec3(0.32, 0.19, 0.05) * (0.35 + 0.55 * uLumenIntensity);

      vec3 col = mix(deepVoid, coldDust, clamp(f * f * 1.5, 0.0, 1.0) * (0.45 + 0.55 * galacticBand));
      col += subtleCyan * smoothstep(0.42, 0.88, f) * galacticBand * 0.55;
      col += subtleAmber * smoothstep(0.48, 0.94, f * r.x * 1.45) * galacticBand * 0.48;

      // Dark Bok globules / dust lanes absorb background nebula light
      col *= mix(0.22, 1.0, dustRift);

      // RTX Diagonal volumetric crepuscular nebula shafts (no artificial pinwheel hub)
      vec2 shaftUv = vec2(uv.x * 1.8 - uv.y * 1.15, uv.x * 0.4 + uv.y * 0.65);
      float godRay = smoothstep(0.36, 0.78, fbm(shaftUv * 2.4 + r * 0.8 + vec2(uTime * 0.015, 0.0)));
      godRay *= galacticBand * (0.45 + 0.55 * (1.0 - dustRift));
      col += mix(vec3(0.04, 0.16, 0.34), vec3(0.26, 0.15, 0.05), f) * godRay * (0.26 + 0.30 * uLumenIntensity);

      // Crisp 3-layer parallax starfield + blazing deep-space shooting meteors
      vec3 stars = vec3(0.0);
      stars += starLayer(uv + mouseOffset * 0.12 + vec2(t * 0.02, 0.0), 16.0, 13.7, uTime, 1.05);
      stars += starLayer(uv + mouseOffset * 0.28 - vec2(0.0, t * 0.015), 32.0, 47.3, uTime * 1.2, 0.72);
      stars += starLayer(uv + mouseOffset * 0.45, 56.0, 91.1, uTime * 0.9, 0.42);
      col += stars * (0.35 + 0.65 * dustRift);
      col += meteorStreakLayer(uv + mouseOffset * 0.25, uTime) * 0.95;

      // Subtle optical vignette
      float vig = 1.0 - smoothstep(0.55, 1.45, length(uv));
      col *= mix(0.68, 1.0, vig);

      col = acesFilm(col);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // =========================================================================
  // RTX HIGH-POLY 3D MESH PLANET SHADERS (Earth, Mars, Moon)
  // =========================================================================
  const PLANET_NOISE_GLSL = `
    float hash31(vec3 p) {
      p = fract(p * 0.1031);
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }

    float noise3(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
      float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
      float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
      float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
      float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
      float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
      float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
      float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

      return mix(
        mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
        mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
        f.z
      );
    }

    float fbm3(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 3; i++) {
        v += a * noise3(p);
        p = p * 2.05 + vec3(13.1, 7.7, 5.3);
        a *= 0.5;
      }
      return v;
    }

    float ridged3(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 3; i++) {
        float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);
        v += a * n * n;
        p = p * 2.12 + vec3(4.3, 9.1, 2.7);
        a *= 0.5;
      }
      return v;
    }

    vec3 rotY(vec3 p, float a) {
      float c = cos(a);
      float s = sin(a);
      return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
    }

    vec3 rotX(vec3 p, float a) {
      float c = cos(a);
      float s = sin(a);
      return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
    }

    vec3 hash33(vec3 p) {
      p = vec3(
        dot(p, vec3(127.1, 311.7, 74.7)),
        dot(p, vec3(269.5, 183.3, 246.1)),
        dot(p, vec3(113.5, 271.9, 124.6))
      );
      return fract(sin(p) * 43758.5453123);
    }

    // Fast 2x2x2 circular 3D Voronoi impact craters
    float craterLayer(vec3 p, float scale) {
      vec3 sp = p * scale;
      vec3 ip = floor(sp - 0.5);
      vec3 fp = sp - ip;
      float best = 0.0;
      for (int x = 0; x <= 1; x++) {
        for (int y = 0; y <= 1; y++) {
          for (int z = 0; z <= 1; z++) {
            vec3 cell = vec3(float(x), float(y), float(z));
            vec3 rnd = hash33(ip + cell);
            if (rnd.x > 0.35) {
              vec3 center = cell + 0.35 + rnd * 0.3;
              float d = length(fp - center);
              float rad = 0.24 + rnd.y * 0.22;
              float bowl = smoothstep(rad, rad * 0.15, d);
              float rim = smoothstep(rad * 1.28, rad * 0.92, d) * smoothstep(rad * 0.52, rad * 0.92, d);
              best += rim * 0.34 - bowl * 0.48;
            }
          }
        }
      }
      return best;
    }

    // Terrain height function shared by 57,344-poly vertex displacement & RTX fragment shading
    float surfaceHeight(vec3 sp, int type) {
      if (type == 0) {
        float cont = fbm3(sp * 2.25) + (noise3(sp * 9.5) - 0.5) * 0.14;
        float ridge = ridged3(sp * 6.4) * smoothstep(0.46, 0.72, cont);
        return cont + ridge * 0.28;
      } else if (type == 1) {
        float base = fbm3(sp * 2.3);
        float canyon = ridged3(sp * 4.0) * 0.24;
        float craters = craterLayer(sp, 3.6) * 0.22;
        return base * 0.75 + canyon + craters;
      } else {
        float maria = fbm3(sp * 1.85);
        float cLarge = craterLayer(sp, 2.8) * 0.30;
        float cMed = craterLayer(sp + vec3(4.1, 2.3, 1.7), 7.2) * 0.16;
        float cMicro = craterLayer(sp + vec3(9.1, 3.7, 6.2), 16.0) * 0.08;
        float ridges = ridged3(sp * 7.5) * 0.06;
        return maria * 0.54 + cLarge + cMed + cMicro + ridges;
      }
    }
  `;

  const PLANET_VERTEX_SHADER = `
    precision highp float;
    precision highp int;

    attribute vec3 aPos3d;

    uniform int uPass;      // 0 = Atmospheric Halo Quad, 1 = 30,720-Poly Displaced Sphere
    uniform int uType;
    uniform float uSpin;
    uniform float uTilt;

    varying vec2 vQuadPos;
    varying vec3 vSpherePos;
    varying float vElev;

    ${PLANET_NOISE_GLSL}

    void main() {
      if (uPass == 0) {
        vQuadPos = aPos3d.xy;
        vSpherePos = vec3(0.0, 0.0, 1.0);
        vElev = 0.0;
        gl_Position = vec4(aPos3d.xy, 0.99, 1.0);
      } else {
        vec3 nBase = normalize(aPos3d);
        vec3 sp = rotY(rotX(nBase, uTilt), uSpin);
        float h = surfaceHeight(sp, uType);
        float dispAmp = (uType == 0) ? 0.010 : ((uType == 1) ? 0.024 : 0.032);
        vec3 pos = nBase * (1.0 + (h - 0.45) * dispAmp);
        vQuadPos = pos.xy / 1.32;
        vSpherePos = nBase;
        vElev = h;
        gl_Position = vec4(pos.xy * 0.75757575, -pos.z * 0.5, 1.0);
      }
    }
  `;

  const PLANET_FRAGMENT_SHADER = `
    precision highp float;
    precision highp int;

    varying vec2 vQuadPos;
    varying vec3 vSpherePos;
    varying float vElev;

    uniform int uPass;      // 0 = Outer Atmospheric Halo + Corona, 1 = High-Poly RTX Surface
    uniform int uType;      // 0 = Earth, 1 = Mars, 2 = Moon
    uniform float uTime;
    uniform float uSpin;
    uniform float uTilt;
    uniform vec3 uSunDir;

    ${PLANET_NOISE_GLSL}

    vec3 acesFilm(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    // RTX 4-step terrain ray-marched self-shadowing across craters & ridges
    float traceTerrainShadow(vec3 N, vec3 sunDir, float h0, int type, float spin, float tilt) {
      float ndl = dot(N, sunDir);
      if (ndl <= -0.02) return 0.0;
      float scale = (type == 0) ? 0.015 : ((type == 1) ? 0.030 : 0.040);
      float occ = 0.0;
      float raySlope = max(0.022, ndl);
      for (int i = 1; i <= 4; i++) {
        float t = float(i) * 0.011;
        vec3 sampleN = normalize(N + sunDir * t);
        vec3 sampleSp = rotY(rotX(sampleN, tilt), spin);
        float sh = surfaceHeight(sampleSp, type);
        float rayH = h0 + (t * raySlope) / scale;
        occ = max(occ, clamp((sh - rayH) * 5.4, 0.0, 1.0));
      }
      return 1.0 - occ * 0.90;
    }

    // Multi-stroke atmospheric storm lightning cell solver (bright return strokes + forked corona)
    float stormBoltPulse(vec3 p, float speedScale, float threshold) {
      vec3 cell = floor(p);
      float seed = hash31(cell + vec3(17.3, 41.9, 83.1));
      if (seed < threshold) return 0.0;
      float tFrac = fract(uTime * (0.55 + seed * 0.65) * speedScale + seed * 31.7);
      float s1 = exp(-abs(tFrac - 0.16) * 20.0);
      float s2 = exp(-abs(tFrac - 0.29) * 26.0) * 0.90;
      float s3 = exp(-abs(tFrac - 0.42) * 32.0) * 0.55;
      float afterGlow = exp(-max(0.0, tFrac - 0.16) * 6.5) * 0.35;
      vec3 cellDist = fract(p) - (0.22 + 0.56 * hash33(cell));
      float coreSpot = exp(-dot(cellDist, cellDist) * 10.0);
      float branch = pow(max(0.0, 1.0 - abs(noise3(p * 4.5 + vec3(uTime * 1.6)) * 2.0 - 1.0)), 4.5);
      return (s1 + s2 + s3 + afterGlow) * coreSpot * (0.65 + 1.65 * branch);
    }

    void main() {
      vec3 sunDir = normalize(uSunDir);
      vec3 viewDir = vec3(0.0, 0.0, 1.0);

      // PASS 0: Outer Rayleigh Atmosphere + RTX Mie Solar Corona Rays
      if (uPass == 0) {
        vec2 p = vQuadPos * 1.32;
        float r = length(p);
        if (r < 0.96 || r > 1.32) {
          gl_FragColor = vec4(0.0);
          return;
        }
        float limbDist = max(0.0, r - 0.99);
        vec3 dir = normalize(vec3(p, 0.0));
        float sunSide = clamp(dot(dir, sunDir) * 0.65 + 0.50, 0.0, 1.0);
        float angle = atan(p.y, p.x);
        float coronaRays = 0.72 + 0.28 * sin(angle * 7.0 + uTime * 0.35) * cos(angle * 11.0 - uTime * 0.22);

        vec3 haloCol = vec3(0.0);
        float haloAlpha = 0.0;
        if (uType == 0) {
          haloCol = vec3(0.16, 0.54, 1.0) + vec3(0.25, 0.45, 0.70) * pow(sunSide, 3.0) * 0.4;
          haloAlpha = exp(-limbDist * 13.5) * 0.70 * sunSide * (0.85 + 0.15 * coronaRays);
        } else if (uType == 1) {
          haloCol = vec3(0.95, 0.48, 0.24);
          haloAlpha = exp(-limbDist * 17.0) * 0.36 * sunSide * (0.88 + 0.12 * coronaRays);
        } else {
          // Subtle lunar solar corona & rim scatter
          haloCol = vec3(0.76, 0.84, 0.98);
          haloAlpha = exp(-limbDist * 22.0) * 0.16 * pow(sunSide, 1.4) * coronaRays;
        }
        gl_FragColor = vec4(haloCol * haloAlpha, haloAlpha);
        return;
      }

      // PASS 1: 30,720-Polygon Displaced 3D Sphere Surface
      vec3 N = normalize(vSpherePos);
      vec3 sp = rotY(rotX(N, uTilt), uSpin);

      // Finite-difference 3D normal mapping synced with vertex elevation
      float eps = (uType == 2) ? 0.0036 : 0.0080;
      float h0 = surfaceHeight(sp, uType);
      float hx = surfaceHeight(normalize(sp + vec3(eps, 0.0, 0.0)), uType);
      float hy = surfaceHeight(normalize(sp + vec3(0.0, eps, 0.0)), uType);
      float hz = surfaceHeight(normalize(sp + vec3(0.0, 0.0, eps)), uType);
      vec3 grad = vec3(hx - h0, hy - h0, hz - h0) / eps;
      grad -= sp * dot(grad, sp);
      vec3 worldGrad = rotX(rotY(grad, -uSpin), -uTilt);

      float bumpStrength = (uType == 0) ? 0.08 : ((uType == 1) ? 0.13 : 0.145);
      vec3 B = normalize(N - worldGrad * bumpStrength);

      float NdotL_geom = dot(N, sunDir);
      float shadowRay = traceTerrainShadow(N, sunDir, h0, uType, uSpin, uTilt);
      float wrap = (uType == 2) ? 0.0 : 0.06;
      float diffuse = clamp((dot(B, sunDir) + wrap) / (1.0 + wrap), 0.0, 1.0);
      diffuse *= smoothstep(-0.08, 0.14, NdotL_geom) * mix(0.25, 1.0, shadowRay);

      float fresnel = pow(1.0 - max(0.0, dot(N, viewDir)), 3.4);
      vec3 col = vec3(0.0);

      if (uType == 0) {
        // === EARTH (RTX Blue Marble + Storm Lightning) ===
        float landMask = smoothstep(0.475, 0.508, h0);
        float lat = abs(sp.y);
        float polarIce = smoothstep(0.86, 0.97, lat + (h0 - 0.5) * 0.12);

        vec3 deepOcean = vec3(0.005, 0.028, 0.155);
        vec3 shallowOcean = vec3(0.012, 0.115, 0.34);
        vec3 oceanCol = mix(deepOcean, shallowOcean, smoothstep(0.30, 0.475, h0));

        float arid = fbm3(sp * 3.8 + vec3(9.2, 1.4, 3.7));
        vec3 deepForest = vec3(0.024, 0.195, 0.048);
        vec3 lushGreen = vec3(0.078, 0.33, 0.088);
        vec3 desert = vec3(0.38, 0.31, 0.18);
        vec3 alpine = vec3(0.32, 0.33, 0.30);
        vec3 greenLand = mix(deepForest, lushGreen, smoothstep(0.48, 0.68, h0));
        vec3 landCol = mix(greenLand, desert, smoothstep(0.56, 0.78, arid) * (1.0 - lat * 0.5));
        landCol = mix(landCol, alpine, smoothstep(0.68, 0.85, h0));

        vec3 albedo = mix(oceanCol, landCol, landMask);
        albedo = mix(albedo, vec3(0.90, 0.94, 0.98), polarIce);

        // Dual-lobe RTX ocean specular sun glint
        vec3 H = normalize(sunDir + viewDir);
        float specTight = pow(max(0.0, dot(B, H)), 110.0);
        float specBroad = pow(max(0.0, dot(B, H)), 24.0) * 0.18;
        float spec = (specTight + specBroad) * (1.0 - landMask) * (1.0 - polarIce) * shadowRay;

        // Earth sharpness & cloud supercell storm LIGHTNING!
        vec3 cloudP = rotY(N, uSpin * 1.15 + uTime * 0.014);
        float cloudRaw = fbm3(cloudP * 3.4 + vec2(fbm3(cloudP * 2.0), 0.0).xyy);
        float clouds = smoothstep(0.52, 0.82, cloudRaw) * 0.56;
        float cloudShadow = smoothstep(0.53, 0.84, fbm3((cloudP - rotY(sunDir, uSpin) * 0.022) * 3.4)) * 0.56;

        // RTX Indirect Sky GI bounce into mountain shadows
        vec3 rtxSkyGI = vec3(0.04, 0.15, 0.36) * (1.0 - shadowRay) * smoothstep(-0.08, 0.25, NdotL_geom) * 0.38;
        vec3 litSurface = albedo * (diffuse * (1.0 - cloudShadow * 0.44) * 1.34 + 0.024) + rtxSkyGI;
        litSurface += vec3(1.0, 0.96, 0.88) * spec * 0.82 * (1.0 - clouds * 0.82);

        // Subtle Earth night-hemisphere supercell storm glint only (no harsh space-wide flashes)
        float nightMaskStorm = smoothstep(0.08, -0.34, NdotL_geom);
        float stormMask = smoothstep(0.54, 0.82, cloudRaw);
        float bolt = stormBoltPulse(cloudP * 7.2, 1.4, 0.30) * stormMask * nightMaskStorm;
        vec3 stormFlash = mix(vec3(0.38, 0.78, 1.0), vec3(0.95, 0.99, 1.0), clamp(bolt, 0.0, 1.0)) * bolt * 1.15;

        vec3 cloudScatter = vec3(0.96, 0.98, 1.0) * (max(0.0, NdotL_geom) * 1.20 + 0.032) + stormFlash;
        litSurface = mix(litSurface, cloudScatter, clouds);
        litSurface += stormFlash * 0.35;

        // Night-side city lights on land
        float nightMask = smoothstep(0.06, -0.22, NdotL_geom);
        float cityNoise = pow(noise3(sp * 28.0), 4.2) * smoothstep(0.48, 0.62, fbm3(sp * 7.5));
        float coastal = smoothstep(0.58, 0.48, h0) * landMask * (1.0 - polarIce);
        litSurface += vec3(1.0, 0.72, 0.32) * cityNoise * coastal * nightMask * 0.95 * (1.0 - clouds * 0.65);

        // RTX Rayleigh Fresnel rim + volumetric sunset scatter
        float sunLimb = clamp(NdotL_geom * 0.75 + 0.45, 0.0, 1.0);
        vec3 rayleigh = vec3(0.10, 0.44, 0.98) * fresnel * sunLimb * 0.72;
        float terminator = exp(-pow(NdotL_geom * 6.0, 2.0));
        vec3 sunset = vec3(0.98, 0.40, 0.14) * terminator * fresnel * 0.38;
        col = litSurface + rayleigh + sunset;

      } else if (uType == 1) {
        // === MARS (RTX Ray-Marched Canyons + Dust GI + Rusty Limb Bloom) ===
        float basalt = smoothstep(0.36, 0.58, fbm3(sp * 2.8 + vec3(2.1, 4.4, 1.7)));
        float polarCap = smoothstep(0.84, 0.93, abs(sp.y) + (h0 - 0.5) * 0.12);

        vec3 darkBasalt = vec3(0.22, 0.10, 0.065);
        vec3 rustDust = vec3(0.68, 0.27, 0.125);
        vec3 brightOchre = vec3(0.84, 0.45, 0.22);

        vec3 albedo = mix(darkBasalt, rustDust, basalt);
        albedo = mix(albedo, brightOchre, smoothstep(0.55, 0.82, h0));
        albedo = mix(albedo, vec3(0.94, 0.92, 0.90), polarCap);

        // Warm Martian dust GI bounce inside shadowed craters/canyons
        vec3 dustGI = vec3(0.30, 0.11, 0.045) * (1.0 - shadowRay) * smoothstep(-0.06, 0.35, NdotL_geom) * 0.42;
        vec3 litSurface = albedo * (diffuse * 1.34 + 0.022) + dustGI;

        // Subtle windblown dust haze veil along warm equatorial ridges (no blue space lightning)
        vec3 dustP = rotY(N, uSpin * 1.08 + uTime * 0.01);
        float squall = smoothstep(0.52, 0.84, fbm3(dustP * 3.4));
        litSurface += vec3(0.82, 0.40, 0.18) * squall * max(0.0, NdotL_geom) * 0.16;

        // Volumetric rusty atmospheric limb bloom
        float sunLimb = clamp(NdotL_geom * 0.72 + 0.42, 0.0, 1.0);
        litSurface += vec3(0.98, 0.54, 0.28) * fresnel * sunLimb * 0.46;
        col = litSurface;

      } else {
        // === MOON (30,720-Poly Displaced Craters + RTX Earthshine GI + Crater Shadows) ===
        float mariaMask = smoothstep(0.39, 0.58, fbm3(sp * 1.9));
        float mareMottle = noise3(sp * 10.5);
        float regolithSpeck = noise3(sp * 42.0);
        float rays = pow(max(0.0, ridged3(sp * 4.5 + vec3(1.2, 3.4, 0.7))), 3.5) * 0.32;
        vec3 maria = vec3(0.085, 0.095, 0.115) * (0.85 + mareMottle * 0.35);
        vec3 highlands = vec3(0.43, 0.44, 0.47);
        vec3 ejecta = vec3(0.78, 0.79, 0.82);

        vec3 albedo = mix(maria, highlands, mariaMask);
        albedo = mix(albedo, ejecta, clamp(smoothstep(0.62, 0.85, h0) + rays, 0.0, 1.0));
        albedo *= 0.82 + regolithSpeck * 0.34;
        albedo *= 0.76 + 0.24 * smoothstep(0.28, 0.54, h0);

        // RTX ray-marched crater bowl shadows + sunlit rim inter-reflection bounce
        float lunarDiff = pow(max(0.0, dot(B, sunDir)), 0.92) * smoothstep(-0.02, 0.05, NdotL_geom) * mix(0.14, 1.0, shadowRay);
        vec3 craterGI = albedo * (1.0 - shadowRay) * smoothstep(0.0, 0.35, NdotL_geom) * 0.16;

        // RTX Earthshine blue-sapphire GI illuminating Moon's night hemisphere
        vec3 earthBounceDir = normalize(vec3(0.38, -0.24, 0.88));
        float earthshine = max(0.0, dot(B, earthBounceDir)) * smoothstep(0.15, -0.35, NdotL_geom);
        vec3 earthshineGI = vec3(0.045, 0.125, 0.30) * albedo * earthshine * 0.85;

        // Subtle silicate regolith specular sparkle + electrostatic micrometeorite rim sheen
        vec3 H = normalize(sunDir + viewDir);
        float regGlint = pow(max(0.0, dot(B, H)), 38.0) * smoothstep(0.55, 0.85, regolithSpeck) * shadowRay * 0.18;
        float rimSpark = fresnel * smoothstep(0.05, 0.55, NdotL_geom) * 0.14;

        col = albedo * (lunarDiff * 1.38 + 0.012) + craterGI + earthshineGI + vec3(0.95, 0.97, 1.0) * (regGlint + rimSpark);
      }

      col = acesFilm(col);
      col = pow(col, vec3(1.0 / 2.2));
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  window.VANTALUMEN_NEBULA_GLSL = {
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER
  };

  window.createVantaLumenThreeMaterial = function (THREE, customUniforms = {}) {
    if (!THREE) return null;
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uLumenIntensity: { value: 1.0 },
        uCyanMix: { value: 0.45 },
        uStarDensity: { value: 0.65 },
        ...customUniforms
      },
      depthWrite: false
    });
  };

  function compileProgram(gl, vsSrc, fsSrc) {
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    return prog;
  }

  function setupFullscreenQuad(gl, prog) {
    const quad = new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  class VantaNebulaGL {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.gl = this.canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false }) ||
                this.canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
      this.ready = false;
      this.mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
      this.renderScale = 0.55;

      if (this.gl) {
        this._initGL();
        this._bindEvents();
      }
    }

    _initGL() {
      const gl = this.gl;
      const prog = compileProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
      if (!prog) return;
      this.program = prog;
      gl.useProgram(prog);
      setupFullscreenQuad(gl, prog);

      this.locs = {
        uTime: gl.getUniformLocation(prog, 'uTime'),
        uResolution: gl.getUniformLocation(prog, 'uResolution'),
        uMouse: gl.getUniformLocation(prog, 'uMouse'),
        uLumenIntensity: gl.getUniformLocation(prog, 'uLumenIntensity'),
        uCyanMix: gl.getUniformLocation(prog, 'uCyanMix'),
        uStarDensity: gl.getUniformLocation(prog, 'uStarDensity')
      };

      this._resize();
      this.ready = true;
    }

    _bindEvents() {
      window.addEventListener('resize', () => this._resize(), { passive: true });
      window.addEventListener('pointermove', e => {
        this.mouse.tx = e.clientX / Math.max(1, window.innerWidth);
        this.mouse.ty = 1.0 - e.clientY / Math.max(1, window.innerHeight);
      }, { passive: true });
    }

    _resize() {
      if (!this.gl) return;
      this.renderScale = 0.55;
      const w = Math.max(512, Math.floor(window.innerWidth * this.renderScale));
      const h = Math.max(512, Math.floor(window.innerHeight * this.renderScale));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, w, h);
      }
    }

    drawBackdrop(ctx, w, h, opts = {}) {
      if (!this.ready) return;
      const {
        alpha = 0.55,
        lumen = 0.9,
        cyan = 0.45,
        stars = 0.55,
        composite = 'screen'
      } = opts;

      this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.08;
      this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.08;

      const gl = this.gl;
      gl.useProgram(this.program);
      gl.uniform1f(this.locs.uTime, performance.now() * 0.001);
      gl.uniform2f(this.locs.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.locs.uMouse, this.mouse.x, this.mouse.y);
      gl.uniform1f(this.locs.uLumenIntensity, lumen);
      gl.uniform1f(this.locs.uCyanMix, cyan);
      gl.uniform1f(this.locs.uStarDensity, stars);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = composite;
      ctx.drawImage(this.canvas, 0, 0, w, h);
      ctx.restore();
    }
  }

  class VantaPlanetGL {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 512;
      this.canvas.height = 512;
      this.gl = this.canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, depth: true }) ||
                this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, depth: true });
      this.ready = false;
      this._cache = {};
      this.polyCount = 0;
      this.vertexCount = 0;

      if (this.gl) {
        this._initGL();
      }
    }

    _buildHighPolySphere(gl, stacks, slices) {
      const verts = [];
      const indices = [];
      for (let i = 0; i <= stacks; i++) {
        const phi = (i / stacks) * Math.PI;
        const y = Math.cos(phi);
        const rSin = Math.sin(phi);
        for (let j = 0; j <= slices; j++) {
          const theta = (j / slices) * Math.PI * 2.0;
          const x = rSin * Math.sin(theta);
          const z = rSin * Math.cos(theta);
          verts.push(x, y, z);
        }
      }
      const stride = slices + 1;
      for (let i = 0; i < stacks; i++) {
        for (let j = 0; j < slices; j++) {
          const a = i * stride + j;
          const b = (i + 1) * stride + j;
          const c = (i + 1) * stride + (j + 1);
          const d = i * stride + (j + 1);
          // CCW outward-facing winding
          indices.push(a, b, c, a, c, d);
        }
      }

      this.vertexCount = (stacks + 1) * (slices + 1);
      this.polyCount = stacks * slices * 2;
      this.sphereIndexCount = indices.length;

      this.sphereVbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereVbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

      this.sphereIbo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphereIbo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

      // Fullscreen 3D quad for Pass 0 outer atmospheric halo + RTX corona
      this.quadVbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 0,   1, -1, 0,   1,  1, 0,
        -1, -1, 0,   1,  1, 0,  -1,  1, 0
      ]), gl.STATIC_DRAW);
    }

    _initGL() {
      const gl = this.gl;
      const prog = compileProgram(gl, PLANET_VERTEX_SHADER, PLANET_FRAGMENT_SHADER);
      if (!prog) return;
      this.program = prog;
      gl.useProgram(prog);

      this.posLoc = gl.getAttribLocation(prog, 'aPos3d');
      // 128 stacks x 224 slices = 28,929 vertices & 57,344 triangle polygons (fits Uint16)
      this._buildHighPolySphere(gl, 128, 224);

      this.locs = {
        uPass: gl.getUniformLocation(prog, 'uPass'),
        uType: gl.getUniformLocation(prog, 'uType'),
        uTime: gl.getUniformLocation(prog, 'uTime'),
        uSpin: gl.getUniformLocation(prog, 'uSpin'),
        uTilt: gl.getUniformLocation(prog, 'uTilt'),
        uSunDir: gl.getUniformLocation(prog, 'uSunDir')
      };

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.ready = true;
    }

    /**
     * Renders a high-poly RTX 3D planet onto a 2D canvas context.
     * @param {CanvasRenderingContext2D} ctx
     * @param {'earth'|'mars'|'moon'} type
     * @param {number} cx
     * @param {number} cy
     * @param {number} radius
     * @param {object} opts
     * @returns {boolean} true if rendered with WebGL
     */
    drawPlanet(ctx, type, cx, cy, radius, opts = {}) {
      if (!this.ready || radius <= 1) return false;
      const {
        spin = performance.now() * 0.00008,
        tilt = 0,
        sunDir = [-0.62, 0.42, 0.66],
        alpha = 1.0
      } = opts;

      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const targetSize = Math.min(512, Math.max(192, Math.ceil((radius * 2.64 * dpr) / 64) * 64));
      const cacheKey = `${type}_${targetSize}`;
      let entry = this._cache[cacheKey];
      const nowSec = performance.now() * 0.001;
      const age = entry ? Math.abs(nowSec - entry.time) : 999;
      const angleThresh = type === 'moon' ? 0.0025 : 0.012;
      const angleChanged = !entry || Math.abs(spin - entry.spin) > angleThresh || Math.abs(tilt - entry.tilt) > angleThresh;
      const needsRender = !entry || (
        type === 'earth' ? (age > 0.08 || (angleChanged && age > 0.04))
          : (type === 'mars' ? (age > 0.14 || (angleChanged && age > 0.032))
            : (angleChanged && age > 0.018))
      );

      if (needsRender) {
        const typeId = type === 'mars' ? 1 : (type === 'moon' ? 2 : 0);
        const gl = this.gl;
        gl.viewport(0, 0, targetSize, targetSize);
        gl.useProgram(this.program);
        gl.clearColor(0, 0, 0, 0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform1i(this.locs.uType, typeId);
        gl.uniform1f(this.locs.uTime, nowSec);
        gl.uniform1f(this.locs.uSpin, spin);
        gl.uniform1f(this.locs.uTilt, tilt);
        gl.uniform3f(this.locs.uSunDir, sunDir[0], sunDir[1], sunDir[2]);

        gl.enableVertexAttribArray(this.posLoc);

        // Pass 0: Outer Rayleigh Atmosphere + Volumetric Corona
        gl.uniform1i(this.locs.uPass, 0);
        gl.disable(gl.DEPTH_TEST);
        gl.depthMask(false);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVbo);
        gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Pass 1: 30,720-Polygon Displaced 3D Sphere Mesh + RTX Lighting + Lightning
        gl.uniform1i(this.locs.uPass, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereVbo);
        gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphereIbo);
        gl.drawElements(gl.TRIANGLES, this.sphereIndexCount, gl.UNSIGNED_SHORT, 0);

        if (!entry) {
          const c = document.createElement('canvas');
          c.width = targetSize;
          c.height = targetSize;
          entry = { canvas: c, ctx: c.getContext('2d'), spin, tilt, time: nowSec };
          this._cache[cacheKey] = entry;
        } else {
          entry.spin = spin;
          entry.tilt = tilt;
          entry.time = nowSec;
        }
        entry.ctx.globalCompositeOperation = 'copy';
        entry.ctx.drawImage(this.canvas, 0, 512 - targetSize, targetSize, targetSize, 0, 0, targetSize, targetSize);
      }

      const drawSpan = radius * 2.64;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(entry.canvas, cx - drawSpan * 0.5, cy - drawSpan * 0.5, drawSpan, drawSpan);
      ctx.restore();
      return true;
    }
  }

  window.vantaNebulaGL = new VantaNebulaGL();
  window.vantaPlanetGL = new VantaPlanetGL();
})();
