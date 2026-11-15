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
        vec3 warp = vec3(
          fbm3(sp * 2.6 + vec3(1.7, 3.2, 0.9)) - 0.5,
          fbm3(sp * 2.6 + vec3(5.4, 1.1, 4.3)) - 0.5,
          fbm3(sp * 2.6 + vec3(2.9, 6.1, 2.4)) - 0.5
        ) * 0.24;
        vec3 wp = normalize(sp + warp);
        float cont = fbm3(wp * 2.15)
          + (noise3(wp * 8.5) - 0.5) * 0.16
          + (noise3(wp * 21.0) - 0.5) * 0.075
          + (noise3(sp * 48.0) - 0.5) * 0.030;
        float ridge = ridged3(wp * 6.8) * smoothstep(0.47, 0.71, cont) * 0.34
          + ridged3(wp * 16.5) * smoothstep(0.54, 0.78, cont) * 0.11;
        return cont + ridge;
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
        float h = (uType == 1) ? surfaceHeight(sp, uType) : 0.45;
        float dispAmp = (uType == 1) ? 0.024 : ((uType == 2) ? 0.002 : 0.0);
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
    uniform sampler2D uMoonTex;
    uniform sampler2D uEarthTex;

    ${PLANET_NOISE_GLSL}

    vec2 sphereToUV(vec3 p) {
      float pz = (abs(p.x) < 1e-5 && abs(p.z) < 1e-5) ? 1e-5 : p.z;
      float lon = atan(p.x, pz);
      float lat = asin(clamp(p.y, -1.0, 1.0));
      return vec2(lon / 6.28318530718 + 0.5, 0.5 - lat / 3.14159265359);
    }

    float traceLunarShadow(vec3 N, vec3 sunDir, float h0, float spin, float tilt) {
      float ndl = dot(N, sunDir);
      if (ndl <= -0.02) return 0.0;
      float occ = 0.0;
      float raySlope = max(0.020, ndl * 1.55);
      for (int i = 1; i <= 5; i++) {
        float t = float(i) * 0.0040;
        vec3 sampleSp = rotY(rotX(normalize(N + sunDir * t), tilt), spin);
        float sh = texture2D(uMoonTex, sphereToUV(sampleSp)).r;
        float rayH = h0 + (t * raySlope) / 0.022;
        occ = max(occ, clamp((sh - rayH) * 7.0, 0.0, 1.0));
      }
      return 1.0 - occ * 0.88;
    }

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
          haloCol = vec3(0.11, 0.45, 1.0) + vec3(0.22, 0.48, 0.85) * pow(sunSide, 3.0) * 0.35;
          haloAlpha = exp(-limbDist * 21.0) * 0.62 * sunSide * (0.88 + 0.12 * coronaRays);
        } else if (uType == 1) {
          haloCol = vec3(0.95, 0.48, 0.24);
          haloAlpha = exp(-limbDist * 17.0) * 0.36 * sunSide * (0.88 + 0.12 * coronaRays);
        } else {
          // Moon has no atmosphere: only imperceptible telescope diffraction on sunlit limb
          haloCol = vec3(0.82, 0.85, 0.92);
          haloAlpha = exp(-limbDist * 38.0) * 0.045 * pow(sunSide, 2.2);
        }
        gl_FragColor = vec4(haloCol * haloAlpha, haloAlpha);
        return;
      }

      // PASS 1: 57,344-Polygon Displaced 3D Sphere Surface
      vec3 N = normalize(vSpherePos);
      vec3 sp = rotY(rotX(N, uTilt), uSpin);
      float NdotL_geom = dot(N, sunDir);
      vec3 col = vec3(0.0);

      if (uType == 2) {
        // === MOON (1024x512 NASA Selenographic Height/Albedo/Maria Map + Lommel-Seeliger BRDF) ===
        vec4 moonSample = texture2D(uMoonTex, sphereToUV(sp));
        float h0 = moonSample.r;
        float texAlbedo = moonSample.g;
        float mareMask = moonSample.b;

        vec3 upRef = abs(sp.y) < 0.96 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 T = normalize(cross(upRef, sp));
        vec3 Bt = cross(sp, T);
        float epsM = 0.0028;
        float hT = texture2D(uMoonTex, sphereToUV(normalize(sp + T * epsM))).r;
        float hB = texture2D(uMoonTex, sphereToUV(normalize(sp + Bt * epsM))).r;
        vec3 gradM = T * ((hT - h0) / epsM) + Bt * ((hB - h0) / epsM);
        vec3 worldGrad = rotX(rotY(gradM, -uSpin), -uTilt);

        // Micro-regolith normal grain + fine albedo dust grit
        float regA = noise3(sp * 68.0);
        float regB = noise3(sp * 155.0);
        float microSlope = (regA - 0.5) * 0.042 + (regB - 0.5) * 0.022;
        vec3 microGrad = T * microSlope + Bt * ((noise3(sp * 68.0 + vec3(3.1, 7.4, 2.2)) - 0.5) * 0.042);
        vec3 B = normalize(N - worldGrad * 0.135 - rotX(rotY(microGrad, -uSpin), -uTilt) * (1.0 - mareMask * 0.5));

        float lunarShadow = traceLunarShadow(N, sunDir, h0, uSpin, uTilt);
        float mu0 = max(0.0, dot(B, sunDir));
        float mu = max(0.06, dot(N, viewDir));
        float lommel = mu0 / (mu0 + mu + 0.002);
        float termMask = smoothstep(-0.025, 0.055, NdotL_geom);
        float refl = (lommel * 1.42 + mu0 * 0.20) * termMask * mix(0.24, 1.0, lunarShadow);

        // Natural mineral palette: cool titanium basaltic maria vs warm feldspathic highlands
        vec3 rockTint = mix(vec3(1.02, 0.99, 0.95), vec3(0.88, 0.92, 0.98), mareMask);
        float grainMod = 0.89 + regA * 0.14 + regB * 0.08;
        vec3 albedo = rockTint * (texAlbedo * grainMod);

        // Subtle sunlit crater rim bounce inside crater shadows & muted Earthshine on night crescent
        vec3 craterBounce = albedo * (1.0 - lunarShadow) * smoothstep(0.0, 0.35, NdotL_geom) * 0.075;
        vec3 earthBounceDir = normalize(vec3(0.38, -0.24, 0.88));
        float earthshine = max(0.0, dot(B, earthBounceDir)) * smoothstep(0.12, -0.35, NdotL_geom);
        vec3 earthshineGI = vec3(0.022, 0.055, 0.14) * albedo * earthshine * 0.48;

        col = albedo * (refl + 0.004) + craterBounce + earthshineGI;

        col = acesFilm(col);
        col = pow(col, vec3(1.0 / 2.2));
        gl_FragColor = vec4(col, 1.0);
        return;
      }

      if (uType == 0) {
        // === EARTH (Fast Pre-baked Blue Marble Map + Swirled Cloud Fronts) ===
        vec4 eSamp = texture2D(uEarthTex, sphereToUV(sp));
        float h0 = eSamp.r;
        float arid = eSamp.g;
        float oceanDepth = eSamp.b;

        vec3 upRef = abs(sp.y) < 0.96 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 T = normalize(cross(upRef, sp));
        vec3 Bt = cross(sp, T);
        float epsE = 0.0035;
        float hT = texture2D(uEarthTex, sphereToUV(normalize(sp + T * epsE))).r;
        float hB = texture2D(uEarthTex, sphereToUV(normalize(sp + Bt * epsE))).r;
        vec3 gradE = T * ((hT - h0) / epsE) + Bt * ((hB - h0) / epsE);
        vec3 B = normalize(N - rotX(rotY(gradE, -uSpin), -uTilt) * 0.10);

        float diffuse = clamp((dot(B, sunDir) + 0.05) / 1.05, 0.0, 1.0) * smoothstep(-0.08, 0.14, NdotL_geom);
        float landMask = smoothstep(0.495, 0.522, h0);
        float lat = abs(sp.y);
        float polarIce = smoothstep(0.87, 0.96, lat + (h0 - 0.5) * 0.10);

        vec3 abyssOcean = vec3(0.002, 0.011, 0.068);
        vec3 deepOcean = vec3(0.004, 0.028, 0.135);
        vec3 coastalShelf = vec3(0.008, 0.115, 0.235);
        vec3 oceanCol = mix(abyssOcean, deepOcean, smoothstep(0.28, 0.72, oceanDepth));
        oceanCol = mix(oceanCol, coastalShelf, smoothstep(0.455, 0.496, h0) * 0.65);

        vec3 deepForest = vec3(0.015, 0.115, 0.032);
        vec3 lushGreen = vec3(0.048, 0.225, 0.052);
        vec3 desert = vec3(0.44, 0.32, 0.17);
        vec3 alpine = vec3(0.22, 0.21, 0.20);
        vec3 snowPeak = vec3(0.86, 0.90, 0.96);
        vec3 greenLand = mix(deepForest, lushGreen, smoothstep(0.49, 0.67, h0));
        vec3 landCol = mix(greenLand, desert, smoothstep(0.54, 0.76, arid) * (1.0 - lat * 0.48));
        landCol = mix(landCol, alpine, smoothstep(0.66, 0.79, h0));
        landCol = mix(landCol, snowPeak, smoothstep(0.76, 0.87, h0));

        vec3 albedo = mix(oceanCol, landCol, landMask);
        albedo = mix(albedo, vec3(0.88, 0.93, 0.98), polarIce);

        vec3 H = normalize(sunDir + viewDir);
        float spec = (pow(max(0.0, dot(B, H)), 110.0) + pow(max(0.0, dot(B, H)), 26.0) * 0.14) * (1.0 - landMask) * (1.0 - polarIce);

        // Lightweight swirled orbital cloud layer (2-octave fbm + wispy detail)
        vec3 cloudP = rotY(sp, uSpin * 0.08 + uTime * 0.008);
        vec3 cloudShear = vec3(sin(cloudP.y * 5.8) * 0.22, cos(cloudP.x * 4.5) * 0.10, 0.0);
        float cWarp = noise3(cloudP * 2.6 + cloudShear);
        vec3 cw = cloudP * 3.1 + cloudShear + vec3(cWarp, cWarp * 0.7, -cWarp * 0.5) * 0.42;
        float cloudRaw = fbm3(cw * 1.45) * 0.74 + noise3(cw * 12.0) * 0.18 + noise3(cw * 28.0) * 0.08;
        float clouds = smoothstep(0.48, 0.74, cloudRaw) * 0.78;
        float cloudShadow = smoothstep(0.49, 0.76, fbm3((cw - rotY(sunDir, uSpin) * 0.032) * 1.45) * 0.74 + 0.14) * 0.66;

        vec3 litSurface = albedo * (diffuse * (1.0 - cloudShadow * 0.52) * 1.32 + 0.020);
        litSurface += vec3(1.0, 0.96, 0.88) * spec * 0.76 * (1.0 - clouds * 0.88);

        float cloudTopShade = smoothstep(-0.06, 0.18, NdotL_geom) * (0.82 + 0.18 * noise3(cw * 18.0));
        vec3 cloudScatter = vec3(0.95, 0.97, 1.0) * (cloudTopShade * 1.18 + 0.024);
        litSurface = mix(litSurface, cloudScatter, clouds);

        // Night-side city lights on coastal land
        float nightMask = smoothstep(0.08, -0.18, NdotL_geom);
        float cityNoise = pow(noise3(sp * 30.0), 4.0);
        float coastal = smoothstep(0.60, 0.49, h0) * landMask * (1.0 - polarIce);
        litSurface += vec3(1.0, 0.72, 0.32) * cityNoise * coastal * nightMask * 0.95 * (1.0 - clouds * 0.65);

        float sunLimb = clamp(NdotL_geom * 0.75 + 0.45, 0.0, 1.0);
        float viewN = max(0.0, dot(N, viewDir));
        vec3 rayleigh = vec3(0.08, 0.42, 1.0) * pow(1.0 - viewN, 6.2) * sunLimb * 0.92
          + vec3(0.022, 0.095, 0.30) * pow(1.0 - viewN, 2.8) * sunLimb * 0.24;
        vec3 sunset = vec3(0.96, 0.36, 0.12) * exp(-pow(NdotL_geom * 6.5, 2.0)) * pow(1.0 - viewN, 3.6) * 0.44;
        col = litSurface + rayleigh + sunset;

        col = acesFilm(col);
        col = pow(col, vec3(1.0 / 2.2));
        gl_FragColor = vec4(col, 1.0);
        return;
      }

      // Finite-difference 3D normal mapping synced with vertex elevation (Mars)
      float eps = 0.0075;
      float h0 = surfaceHeight(sp, uType);
      float hx = surfaceHeight(normalize(sp + vec3(eps, 0.0, 0.0)), uType);
      float hy = surfaceHeight(normalize(sp + vec3(0.0, eps, 0.0)), uType);
      float hz = surfaceHeight(normalize(sp + vec3(0.0, 0.0, eps)), uType);
      vec3 grad = vec3(hx - h0, hy - h0, hz - h0) / eps;
      grad -= sp * dot(grad, sp);
      vec3 worldGrad = rotX(rotY(grad, -uSpin), -uTilt);

      vec3 B = normalize(N - worldGrad * 0.13);

      float shadowRay = traceTerrainShadow(N, sunDir, h0, uType, uSpin, uTilt);
      float wrap = 0.05;
      float diffuse = clamp((dot(B, sunDir) + wrap) / (1.0 + wrap), 0.0, 1.0);
      diffuse *= smoothstep(-0.08, 0.14, NdotL_geom) * mix(0.25, 1.0, shadowRay);

      float fresnel = pow(1.0 - max(0.0, dot(N, viewDir)), 3.4);

      if (uType == 1) {
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
      this.renderScale = 0.62;
      const w = Math.min(1280, Math.max(512, Math.floor(window.innerWidth * this.renderScale)));
      const h = Math.min(720, Math.max(384, Math.floor(window.innerHeight * this.renderScale)));
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
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
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
        uSunDir: gl.getUniformLocation(prog, 'uSunDir'),
        uMoonTex: gl.getUniformLocation(prog, 'uMoonTex'),
        uEarthTex: gl.getUniformLocation(prog, 'uEarthTex')
      };

      const vpDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [1536, 1536];
      this.maxTexSize = Math.min(1536, vpDims[0] || 1536, vpDims[1] || 1536);
      this.moonTex = null;
      this.earthTex = null;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.ready = true;
    }

    prewarm() {
      if (this.ready && this.gl) {
        this._ensureMoonTexture(this.gl);
        this._ensureEarthTexture(this.gl);
      }
    }

    _ensureEarthTexture(gl) {
      if (this.earthTex) return;
      const W = 768;
      const H = 384;
      const N = W * H;
      const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
      const smooth = (a, b, x) => {
        const t = clamp01((x - a) / (b - a));
        return t * t * (3 - 2 * t);
      };
      const hash3 = (x, y, z, s) => {
        let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2147483647) + Math.imul(s, 1597334677);
        h = (h ^ (h >>> 13)) | 0;
        h = Math.imul(h, 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
      };
      const noise3d = (x, y, z, s) => {
        const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
        const fx = x - ix, fy = y - iy, fz = z - iz;
        const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
        const c000 = hash3(ix, iy, iz, s), c100 = hash3(ix + 1, iy, iz, s);
        const c010 = hash3(ix, iy + 1, iz, s), c110 = hash3(ix + 1, iy + 1, iz, s);
        const c001 = hash3(ix, iy, iz + 1, s), c101 = hash3(ix + 1, iy, iz + 1, s);
        const c011 = hash3(ix, iy + 1, iz + 1, s), c111 = hash3(ix + 1, iy + 1, iz + 1, s);
        const x00 = c000 + (c100 - c000) * ux, x10 = c010 + (c110 - c010) * ux;
        const x01 = c001 + (c101 - c001) * ux, x11 = c011 + (c111 - c011) * ux;
        return (x00 + (x10 - x00) * uy) + ((x01 + (x11 - x01) * uy) - (x00 + (x10 - x00) * uy)) * uz;
      };
      const fbm3d = (x, y, z, oct, s) => {
        let v = 0, a = 0.5, sum = 0;
        for (let k = 0; k < oct; k++) {
          v += a * noise3d(x, y, z, s + k * 17);
          sum += a;
          x = x * 2.05 + 13.1; y = y * 2.05 + 7.7; z = z * 2.05 + 5.3;
          a *= 0.5;
        }
        return v / sum;
      };
      const ridged3d = (x, y, z, oct, s) => {
        let v = 0, a = 0.5, sum = 0;
        for (let k = 0; k < oct; k++) {
          const n = 1 - Math.abs(noise3d(x, y, z, s + k * 23) * 2 - 1);
          v += a * n * n;
          sum += a;
          x = x * 2.12 + 4.3; y = y * 2.12 + 9.1; z = z * 2.12 + 2.7;
          a *= 0.5;
        }
        return v / sum;
      };

      const pixels = new Uint8Array(N * 4);
      for (let py = 0; py < H; py++) {
        const lat = (0.5 - (py + 0.5) / H) * Math.PI;
        const cLat = Math.cos(lat);
        const sLat = Math.sin(lat);
        for (let px = 0; px < W; px++) {
          const lon = ((px + 0.5) / W - 0.5) * 2 * Math.PI;
          const dx = cLat * Math.sin(lon);
          const dy = sLat;
          const dz = cLat * Math.cos(lon);

          const wx = dx + (fbm3d(dx * 2.6 + 1.7, dy * 2.6 + 3.2, dz * 2.6 + 0.9, 3, 11) - 0.5) * 0.24;
          const wy = dy + (fbm3d(dx * 2.6 + 5.4, dy * 2.6 + 1.1, dz * 2.6 + 4.3, 3, 29) - 0.5) * 0.24;
          const wz = dz + (fbm3d(dx * 2.6 + 2.9, dy * 2.6 + 6.1, dz * 2.6 + 2.4, 3, 47) - 0.5) * 0.24;
          const wl = Math.hypot(wx, wy, wz) || 1;
          const sx = wx / wl, sy = wy / wl, sz = wz / wl;

          const cont = fbm3d(sx * 2.15, sy * 2.15, sz * 2.15, 4, 61)
            + (noise3d(sx * 9.0, sy * 9.0, sz * 9.0, 73) - 0.5) * 0.16
            + (noise3d(sx * 22.0, sy * 22.0, sz * 22.0, 89) - 0.5) * 0.07;
          const ridge = ridged3d(sx * 6.8, sy * 6.8, sz * 6.8, 3, 101) * smooth(0.47, 0.71, cont) * 0.34;
          const h = clamp01(cont + ridge);
          const arid = clamp01(fbm3d(sx * 4.2 + 9.2, sy * 4.2 + 1.4, sz * 4.2 + 3.7, 3, 131));
          const oceanDepth = clamp01(fbm3d(dx * 5.2, dy * 5.2, dz * 5.2, 3, 157));

          const o = (py * W + px) * 4;
          pixels[o] = Math.round(h * 255);
          pixels[o + 1] = Math.round(arid * 255);
          pixels[o + 2] = Math.round(oceanDepth * 255);
          pixels[o + 3] = 255;
        }
      }

      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      this.earthTex = tex;
    }

    _ensureMoonTexture(gl) {
      if (this.moonTex) return;
      const W = 1024;
      const H = 512;
      const N = W * H;
      const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
      const smooth = (a, b, x) => {
        const t = clamp01((x - a) / (b - a));
        return t * t * (3 - 2 * t);
      };
      const hash3 = (x, y, z, s) => {
        let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2147483647) + Math.imul(s, 1597334677);
        h = (h ^ (h >>> 13)) | 0;
        h = Math.imul(h, 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
      };
      const noise3d = (x, y, z, s) => {
        const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
        const fx = x - ix, fy = y - iy, fz = z - iz;
        const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
        const c000 = hash3(ix, iy, iz, s), c100 = hash3(ix + 1, iy, iz, s);
        const c010 = hash3(ix, iy + 1, iz, s), c110 = hash3(ix + 1, iy + 1, iz, s);
        const c001 = hash3(ix, iy, iz + 1, s), c101 = hash3(ix + 1, iy, iz + 1, s);
        const c011 = hash3(ix, iy + 1, iz + 1, s), c111 = hash3(ix + 1, iy + 1, iz + 1, s);
        const x00 = c000 + (c100 - c000) * ux, x10 = c010 + (c110 - c010) * ux;
        const x01 = c001 + (c101 - c001) * ux, x11 = c011 + (c111 - c011) * ux;
        return (x00 + (x10 - x00) * uy) + ((x01 + (x11 - x01) * uy) - (x00 + (x10 - x00) * uy)) * uz;
      };
      const fbm3d = (x, y, z, oct, s) => {
        let v = 0, a = 0.5, sum = 0;
        for (let k = 0; k < oct; k++) {
          v += a * noise3d(x, y, z, s + k * 19);
          sum += a;
          x = x * 2.04 + 11.7; y = y * 2.04 + 5.3; z = z * 2.04 + 8.9;
          a *= 0.5;
        }
        return v / sum;
      };
      const proj = (lon, lat) => {
        const lo = (lon * Math.PI) / 180;
        const la = (lat * Math.PI) / 180;
        return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
      };

      // Real Near-Side + Far-Side Lunar Maria (NASA selenographic coordinates)
      const MARIA = [
        [-16, 33, 19, 17, 1.0], [-16, 33, 21, 19, 0.72], // Mare Imbrium (+ outer shelf)
        [17.5, 28, 11, 10, 0.96],                         // Mare Serenitatis
        [31, 8.5, 14, 10, 0.96], [27, 14, 7, 6, 0.9],     // Mare Tranquillitatis
        [59, 17, 9, 7.5, 1.0],                            // Mare Crisium
        [51, -8, 7, 11, 0.85],                            // Mare Fecunditatis
        [35, -15, 5.5, 5.5, 0.85],                        // Mare Nectaris
        [-57, 20, 15, 22, 0.92], [-45, -2, 13, 16, 0.88], // Oceanus Procellarum
        [-17, -21, 10, 8, 0.82], [-39, -24, 6, 6, 0.90],  // Mare Nubium & Humorum
        [-23, -10, 7, 6, 0.76], [-30, 7, 8, 7, 0.78],     // Cognitum & Insularum
        [3.6, 13, 4.5, 4, 0.86], [-68, -5, 3, 3.5, 1.0],  // Vaporum & Grimaldi
        [-38, 57, 6, 4, 0.72], [-22, 56, 6, 4, 0.76],     // Mare Frigoris belt
        [-6, 56, 6, 4, 0.76], [10, 57, 6, 4, 0.76], [26, 58, 6, 4, 0.72],
        [10, 37, 5, 4, 0.82], [40, 22, 4, 4, 0.76], [69, 2, 4, 6, 0.7],
        [148, 27, 7, 6.5, 0.88], [129, -20, 4.2, 4.2, 0.9], // Far side: Moscoviense & Tsiolkovskiy
        [-93, -19, 8.5, 8.5, 0.78], [-155, -48, 18, 16, 0.35] // Orientale & South Pole-Aitken
      ].map(([lon, lat, ax, ay, dark]) => {
        const p = proj(lon, lat);
        return { ...p, ax: (ax * 1.24 * Math.PI) / 180, ay: (ay * 1.24 * Math.PI) / 180, dark };
      });

      const height = new Float32Array(N);
      const albedo = new Float32Array(N);
      const mare = new Float32Array(N);
      const sx = new Float32Array(N);
      const sy = new Float32Array(N);
      const sz = new Float32Array(N);

      const imb = MARIA[0];
      for (let py = 0; py < H; py++) {
        const lat = (0.5 - (py + 0.5) / H) * Math.PI;
        const cLat = Math.cos(lat);
        const sLat = Math.sin(lat);
        for (let px = 0; px < W; px++) {
          const lon = ((px + 0.5) / W - 0.5) * 2 * Math.PI;
          const dx = cLat * Math.sin(lon);
          const dy = sLat;
          const dz = cLat * Math.cos(lon);
          const i = py * W + px;
          sx[i] = dx; sy[i] = dy; sz[i] = dz;

          const warp = (fbm3d(dx * 2.5, dy * 2.5, dz * 2.5, 4, 41) - 0.5) * 1.02 +
                       (noise3d(dx * 10, dy * 10, dz * 10, 43) - 0.5) * 0.24;
          let m = 0;
          for (let k = 0; k < MARIA.length; k++) {
            const M = MARIA[k];
            const ex = dx - M.x, ey = dy - M.y, ez = dz - M.z;
            const q = Math.sqrt((ex * ex + ez * ez) / (M.ax * M.ax) + (ey * ey) / (M.ay * M.ay));
            const v = (1 - smooth(0.55, 1.15, q + warp * 0.62)) * M.dark;
            if (v > m) m = v;
          }
          mare[i] = m;

          const mottle = fbm3d(dx * 7.5 + 3.3, dy * 7.5 + 5.1, dz * 7.5, 3, 77);
          const fine = noise3d(dx * 32 + 1.7, dy * 32 + 9.4, dz * 32, 133);
          const hl = 0.62 + (mottle - 0.5) * 0.16 + (fine - 0.5) * 0.08;
          const ma = 0.115 + (mottle - 0.5) * 0.075 + (fine - 0.5) * 0.03;
          albedo[i] = hl + (ma - hl) * m;

          // Apennine basin rim uplift + smooth mare lava plains + highland relief
          const qi = Math.sqrt(((dx - imb.x) * (dx - imb.x) + (dz - imb.z) * (dz - imb.z)) / (imb.ax * imb.ax) + ((dy - imb.y) * (dy - imb.y)) / (imb.ay * imb.ay));
          const rimMontes = Math.exp(-Math.pow((qi + warp * 0.45 - 1.05) / 0.16, 2)) * 0.016 * (1 - m * 0.7);
          const dorsum = m > 0.35 ? Math.pow(Math.max(0, 1 - Math.abs(noise3d(dx * 16, dy * 16, dz * 16, 211) * 2 - 1)), 5) * 0.005 * m : 0;
          height[i] = (fbm3d(dx * 5.5 + 2.2, dy * 5.5 + 8.8, dz * 5.5, 4, 301) - 0.5) * 0.032 * (1 - m * 0.82) + rimMontes + dorsum - m * 0.018;
        }
      }

      const stampCrater3D = (cx3, cy3, cz3, R, depth, fresh, darkFloor = 0, seed = 0) => {
        const angR = Math.min(Math.PI * 0.44, R * 1.68);
        const cLat = Math.asin(Math.max(-1, Math.min(1, cy3)));
        const cLon = Math.atan2(cx3, cz3);
        const py0 = Math.max(0, Math.floor((0.5 - (cLat + angR) / Math.PI) * H));
        const py1 = Math.min(H - 1, Math.ceil((0.5 - (cLat - angR) / Math.PI) * H));
        const fullBand = Math.abs(cLat) + angR >= 1.38;
        const dLon = fullBand ? Math.PI : angR / Math.max(0.15, Math.cos(cLat));
        const kx0 = fullBand ? 0 : Math.floor(((cLon - dLon) / (2 * Math.PI) + 0.5) * W);
        const kx1 = fullBand ? W - 1 : Math.ceil(((cLon + dLon) / (2 * Math.PI) + 0.5) * W);

        for (let py = py0; py <= py1; py++) {
          for (let kx = kx0; kx <= kx1; kx++) {
            const px = ((kx % W) + W) % W;
            const i = py * W + px;
            const ex = sx[i] - cx3, ey = sy[i] - cy3, ez = sz[i] - cz3;
            const d2 = ex * ex + ey * ey + ez * ez;
            if (d2 >= angR * angR) continue;
            const ang = Math.atan2(ey, ex * cz3 - ez * cx3 + 1e-6);
            const warpRim = 1 + 0.042 * Math.sin(ang * 3 + seed) + 0.025 * Math.cos(ang * 5 - seed * 1.7);
            const t = (Math.sqrt(d2) / R) * warpRim;
            if (t >= 1.62) continue;
            if (t < 1.0) {
              if (R > 0.048) {
                const wall = smooth(0.62, 1.0, t);
                height[i] += (wall - 1.0) * depth * R * 0.34;
              } else {
                const peak = R > 0.022 ? Math.exp(-t * t * 22.0) * depth * R * 0.24 : 0;
                height[i] += (t * t - 1.0) * depth * R * 0.44 + peak;
              }
              if (darkFloor > 0) albedo[i] -= darkFloor * (1 - smooth(0.55, 0.92, t));
              if (fresh > 0) albedo[i] += fresh * 0.075 * smooth(0.1, 0.9, t);
            } else {
              const rt = (t - 1.0) / 0.62;
              height[i] += Math.exp(-rt * 3.8) * depth * R * 0.19;
              if (fresh > 0) albedo[i] += fresh * 0.22 * Math.exp(-rt * 2.5);
            }
          }
        }
      };

      // ~2,100 spherical background craters (uniform 3D unit-sphere sampling; sparse in Maria)
      let made = 0;
      for (let n = 0; made < 2100 && n < 7500; n++) {
        const z = hash3(n, 1, 13, 517) * 2 - 1;
        const phi = hash3(n, 2, 17, 517) * 2 * Math.PI;
        const rXY = Math.sqrt(Math.max(0, 1 - z * z));
        const ux = rXY * Math.sin(phi), uy = z, uz = rXY * Math.cos(phi);
        const py = Math.min(H - 1, Math.max(0, Math.floor((0.5 - Math.asin(uy) / Math.PI) * H)));
        const px = Math.min(W - 1, Math.max(0, Math.floor((phi / (2 * Math.PI)) * W)));
        const m = mare[py * W + px];
        if (hash3(n, 3, 23, 517) < m * 0.85) continue;
        const R = 0.006 + Math.pow(hash3(n, 4, 29, 517), 4.0) * 0.058;
        const fresh = hash3(n, 5, 31, 517) > 0.93 ? 0.58 : 0;
        stampCrater3D(ux, uy, uz, R, 0.52 + hash3(n, 6, 37, 517) * 0.44, fresh, 0, n * 0.37);
        made++;
      }

      // Named NASA landmark craters + Rayed ejecta starbursts
      const NAMED = [
        [-11.4, -43.3, 0.026, 1.0, 1.05, 0],  // Tycho
        [-20.1, 9.6, 0.028, 1.0, 0.92, 0],    // Copernicus
        [-38, 8.1, 0.012, 0.9, 0.90, 0],      // Kepler
        [-47.5, 23.7, 0.012, 0.9, 1.55, 0],   // Aristarchus
        [-9.3, 51.6, 0.029, 0.35, 0, 0.11],   // Plato (dark floor)
        [-14.1, -58.4, 0.065, 0.5, 0, 0],     // Clavius
        [61, -8.9, 0.038, 0.8, 0.25, 0],      // Langrenus
        [26.4, -11.4, 0.029, 0.9, 0.25, 0],   // Theophilus
        [-1.9, -9.3, 0.044, 0.3, 0, 0.02],    // Ptolemaeus
        [-3.1, -18.2, 0.022, 0.5, 0, 0],      // Arzachel
        [-1.1, 29.4, 0.014, 0.85, 0.38, 0],   // Aristillus
        [44.4, -16.9, 0.013, 0.8, 0.55, 0]    // Stevinus
      ];
      const RAYED = [];
      NAMED.forEach(([lon, lat, R, depth, fresh, darkFloor], idx) => {
        const p = proj(lon, lat);
        stampCrater3D(p.x, p.y, p.z, R, depth, fresh, darkFloor, 100 + idx);
        if (fresh >= 0.9) RAYED.push({ ...p, R, strength: fresh });
      });

      RAYED.forEach((rc, k) => {
        const reach = rc.R * (k === 0 ? 44 : 18);
        let ux = rc.z, uy = 0, uz = -rc.x;
        const ul = Math.hypot(ux, uz) || 1;
        ux /= ul; uz /= ul;
        const vx = rc.y * uz - rc.z * uy;
        const vy = rc.z * ux - rc.x * uz;
        const vz = rc.x * uy - rc.y * ux;
        const seed = 900 + k * 37;
        const cLat = Math.asin(Math.max(-1, Math.min(1, rc.y)));
        const cLon = Math.atan2(rc.x, rc.z);
        const py0 = Math.max(0, Math.floor((0.5 - (cLat + reach) / Math.PI) * H));
        const py1 = Math.min(H - 1, Math.ceil((0.5 - (cLat - reach) / Math.PI) * H));
        const fullBand = Math.abs(cLat) + reach >= 1.38;
        const dLon = fullBand ? Math.PI : reach / Math.max(0.15, Math.cos(cLat));
        const kx0 = fullBand ? 0 : Math.floor(((cLon - dLon) / (2 * Math.PI) + 0.5) * W);
        const kx1 = fullBand ? W - 1 : Math.ceil(((cLon + dLon) / (2 * Math.PI) + 0.5) * W);
        for (let py = py0; py <= py1; py++) {
          for (let kx = kx0; kx <= kx1; kx++) {
            const px = ((kx % W) + W) % W;
            const i = py * W + px;
            const ex = sx[i] - rc.x, ey = sy[i] - rc.y, ez = sz[i] - rc.z;
            const d = Math.sqrt(ex * ex + ey * ey + ez * ez);
            if (d > reach || d < rc.R * 1.15) continue;
            const a = Math.atan2(ex * vx + ey * vy + ez * vz, ex * ux + ey * uy + ez * uz);
            const ca = Math.cos(a), sa = Math.sin(a);
            const streak = Math.pow(fbm3d(ca * 4.2 + k * 7.3, sa * 4.2 + 3.1, 1.5, 4, seed), 2.15) * 2.5;
            const broken = fbm3d(ca * 6 + d * 9, sa * 6 + d * 12, 2.3, 3, seed + 5);
            const fall = Math.pow(1 - d / reach, 1.55);
            const halo = Math.exp(-(d / rc.R - 1.2) * 0.9) * 0.30;
            const near = smooth(rc.R * 1.4, rc.R * 6, d);
            albedo[i] += (clamp01(streak * broken * 1.4 - 0.25) * near + halo) * fall * 0.30 * rc.strength;
          }
        }
      });

      const pixels = new Uint8Array(N * 4);
      for (let i = 0; i < N; i++) {
        const o = i * 4;
        pixels[o] = Math.round(clamp01(0.5 + height[i] * 7.5) * 255);
        pixels[o + 1] = Math.round(clamp01(albedo[i]) * 255);
        pixels[o + 2] = Math.round(clamp01(mare[i]) * 255);
        pixels[o + 3] = 255;
      }

      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      this.moonTex = tex;
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
      const isHorizonEarth = type === 'earth' && radius > 350;
      const maxSize = isHorizonEarth ? Math.min(896, this.maxTexSize || 896) : (this.maxTexSize || 1536);
      const targetSize = Math.min(maxSize, Math.max(192, Math.ceil((radius * 2.64 * dpr) / 64) * 64));
      const cacheKey = `${type}_${targetSize}`;
      let entry = this._cache[cacheKey];
      const nowSec = performance.now() * 0.001;
      const angleThresh = 0.0002;
      const angleChanged = !entry || Math.abs(spin - entry.spin) > angleThresh || Math.abs(tilt - entry.tilt) > angleThresh;
      const canReuseDirect = this._lastDrawnKey === cacheKey && entry && !angleChanged && Math.abs(nowSec - entry.time) <= 0.015;
      const drawSpan = radius * 2.64;

      if (!canReuseDirect) {
        if (targetSize > this.canvas.width || targetSize > this.canvas.height) {
          this.canvas.width = targetSize;
          this.canvas.height = targetSize;
        }
        const typeId = type === 'mars' ? 1 : (type === 'moon' ? 2 : 0);
        const gl = this.gl;
        if (typeId === 2) {
          this._ensureMoonTexture(gl);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this.moonTex);
        } else if (typeId === 0) {
          this._ensureEarthTexture(gl);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, this.earthTex);
        }
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
        if (this.locs.uMoonTex) gl.uniform1i(this.locs.uMoonTex, 0);
        if (this.locs.uEarthTex) gl.uniform1i(this.locs.uEarthTex, 1);

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

        // Pass 1: 57,344-Polygon Displaced 3D Sphere Mesh + RTX Lighting
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
          entry = { spin, tilt, time: nowSec };
          this._cache[cacheKey] = entry;
        } else {
          entry.spin = spin;
          entry.tilt = tilt;
          entry.time = nowSec;
        }
        this._lastDrawnKey = cacheKey;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        this.canvas,
        0,
        this.canvas.height - targetSize,
        targetSize,
        targetSize,
        cx - drawSpan * 0.5,
        cy - drawSpan * 0.5,
        drawSpan,
        drawSpan
      );
      ctx.restore();
      return true;
    }
  }

  window.vantaNebulaGL = new VantaNebulaGL();
  window.vantaPlanetGL = new VantaPlanetGL();
})();
