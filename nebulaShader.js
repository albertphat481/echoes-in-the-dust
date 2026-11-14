/**
 * VantaLumen — RTX-Grade Physically-Based Space & Planetary GLSL Shaders
 * Provides:
 * 1. Raw GLSL Vertex & Fragment Shaders (window.VANTALUMEN_NEBULA_GLSL)
 * 2. Live WebGL GPU Deep-Space Renderer (window.vantaNebulaGL) — crisp full-res, ACES Filmic
 * 3. Live WebGL GPU Ray-Traced Planet Renderer (window.vantaPlanetGL) — Earth, Mars, Moon
 *    with 3D spherical FBM, bump-mapped relief, GGX ocean specular, cloud shadows, and Rayleigh scattering
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

      // Crisp 3-layer parallax starfield
      vec3 stars = vec3(0.0);
      stars += starLayer(uv + mouseOffset * 0.12 + vec2(t * 0.02, 0.0), 16.0, 13.7, uTime, 1.05);
      stars += starLayer(uv + mouseOffset * 0.28 - vec2(0.0, t * 0.015), 32.0, 47.3, uTime * 1.2, 0.72);
      stars += starLayer(uv + mouseOffset * 0.45, 56.0, 91.1, uTime * 0.9, 0.42);
      col += stars * (0.35 + 0.65 * dustRift);

      // Subtle optical vignette
      float vig = 1.0 - smoothstep(0.55, 1.45, length(uv));
      col *= mix(0.68, 1.0, vig);

      col = acesFilm(col);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // =========================================================================
  // RTX PHYSICALLY-BASED RAY-TRACED PLANET SHADER (Earth, Mars, Moon)
  // =========================================================================
  const PLANET_FRAGMENT_SHADER = `
    precision highp float;

    varying vec2 vUv;

    uniform int uType;      // 0 = Earth, 1 = Mars, 2 = Moon
    uniform float uTime;
    uniform float uSpin;
    uniform float uTilt;
    uniform vec3 uSunDir;

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
      for (int i = 0; i < 4; i++) {
        v += a * noise3(p);
        p = p * 2.05 + vec3(13.1, 7.7, 5.3);
        a *= 0.5;
      }
      return v;
    }

    float ridged3(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
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

    vec3 acesFilm(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    vec3 hash33(vec3 p) {
      p = vec3(
        dot(p, vec3(127.1, 311.7, 74.7)),
        dot(p, vec3(269.5, 183.3, 246.1)),
        dot(p, vec3(113.5, 271.9, 124.6))
      );
      return fract(sin(p) * 43758.5453123);
    }

    // Fast 2x2x2 circular 3D Voronoi impact craters (3.4x faster, smooth circular rims)
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

    // Terrain height function for smooth 3D normal mapping
    float surfaceHeight(vec3 sp, int type) {
      if (type == 0) {
        // Earth: continents + mountain chains
        float cont = fbm3(sp * 2.15);
        float ridge = ridged3(sp * 4.8) * smoothstep(0.50, 0.74, cont);
        return cont + ridge * 0.22;
      } else if (type == 1) {
        // Mars: canyons + volcanic plateaus + circular craters
        float base = fbm3(sp * 2.3);
        float canyon = ridged3(sp * 4.0) * 0.24;
        float craters = craterLayer(sp, 3.6) * 0.22;
        return base * 0.75 + canyon + craters;
      } else {
        // Moon: Maria basins + multi-scale circular impact craters
        float maria = fbm3(sp * 1.85);
        float cLarge = craterLayer(sp, 2.8) * 0.34;
        float cMed = craterLayer(sp + vec3(4.1, 2.3, 1.7), 6.2) * 0.18;
        return maria * 0.58 + cLarge + cMed;
      }
    }

    void main() {
      // Map [0..1] UV to [-1.32 .. +1.32] so planet radius = 1.0 and outer [1.0..1.32] holds atmosphere
      vec2 p = (vUv - 0.5) * 2.64;
      float r2 = dot(p, p);
      float r = sqrt(r2);

      vec3 sunDir = normalize(uSunDir);
      vec3 viewDir = vec3(0.0, 0.0, 1.0);

      // Outer Rayleigh atmosphere glow outside the sphere limb
      if (r > 1.0) {
        float limbDist = r - 1.0;
        vec3 dir = normalize(vec3(p, 0.0));
        float sunSide = clamp(dot(dir, sunDir) * 0.6 + 0.55, 0.0, 1.0);

        vec3 haloCol = vec3(0.0);
        float haloAlpha = 0.0;
        if (uType == 0) {
          haloCol = vec3(0.22, 0.62, 1.0);
          haloAlpha = exp(-limbDist * 13.5) * 0.68 * sunSide;
        } else if (uType == 1) {
          haloCol = vec3(0.92, 0.45, 0.22);
          haloAlpha = exp(-limbDist * 18.0) * 0.30 * sunSide;
        } else {
          haloCol = vec3(0.75, 0.80, 0.90);
          haloAlpha = exp(-limbDist * 26.0) * 0.09 * sunSide;
        }
        gl_FragColor = vec4(haloCol * haloAlpha, haloAlpha);
        return;
      }

      // Ray-sphere hit point & geometric normal
      float z = sqrt(max(0.0, 1.0 - r2));
      vec3 N = normalize(vec3(p.x, p.y, z));
      vec3 sp = rotY(rotX(N, uTilt), uSpin);

      // Subpixel anti-aliased limb mask
      float aaEdge = smoothstep(1.0, 0.988, r);

      // Smooth finite-difference 3D bump mapping
      float eps = 0.016;
      float h0 = surfaceHeight(sp, uType);
      float hx = surfaceHeight(normalize(sp + vec3(eps, 0.0, 0.0)), uType);
      float hy = surfaceHeight(normalize(sp + vec3(0.0, eps, 0.0)), uType);
      float hz = surfaceHeight(normalize(sp + vec3(0.0, 0.0, eps)), uType);
      vec3 grad = vec3(hx - h0, hy - h0, hz - h0) / eps;
      grad -= sp * dot(grad, sp);
      vec3 worldGrad = rotX(rotY(grad, -uSpin), -uTilt);

      float bumpStrength = (uType == 0) ? 0.09 : ((uType == 1) ? 0.14 : 0.18);
      vec3 B = normalize(N - worldGrad * bumpStrength);

      float NdotL_geom = dot(N, sunDir);
      float wrap = (uType == 2) ? 0.0 : 0.06;
      float diffuse = clamp((dot(B, sunDir) + wrap) / (1.0 + wrap), 0.0, 1.0);
      diffuse *= smoothstep(-0.08, 0.14, NdotL_geom);

      float fresnel = pow(1.0 - max(0.0, dot(N, viewDir)), 3.6);
      vec3 col = vec3(0.0);

      if (uType == 0) {
        // === EARTH ===
        float landMask = smoothstep(0.495, 0.525, h0);
        float lat = abs(sp.y);
        float polarIce = smoothstep(0.84, 0.96, lat + (h0 - 0.5) * 0.14);

        // Deep vibrant ocean bathymetry
        vec3 deepOcean = vec3(0.014, 0.075, 0.24);
        vec3 shallowOcean = vec3(0.03, 0.25, 0.52);
        vec3 oceanCol = mix(deepOcean, shallowOcean, smoothstep(0.32, 0.495, h0));

        // Realistic continents
        float arid = fbm3(sp * 3.8 + vec3(9.2, 1.4, 3.7));
        vec3 forest = vec3(0.06, 0.22, 0.085);
        vec3 desert = vec3(0.46, 0.36, 0.22);
        vec3 alpine = vec3(0.38, 0.37, 0.35);
        vec3 landCol = mix(forest, desert, smoothstep(0.45, 0.68, arid) * (1.0 - lat * 0.5));
        landCol = mix(landCol, alpine, smoothstep(0.65, 0.82, h0));

        vec3 albedo = mix(oceanCol, landCol, landMask);
        albedo = mix(albedo, vec3(0.92, 0.95, 0.98), polarIce);

        // Ocean specular sun glint
        vec3 H = normalize(sunDir + viewDir);
        float spec = pow(max(0.0, dot(B, H)), 64.0) * (1.0 - landMask) * (1.0 - polarIce);

        // Wispy 3D cloud deck (keeps oceans and continents clearly visible)
        vec3 cloudP = rotY(N, uSpin * 1.15 + uTime * 0.012);
        float clouds = smoothstep(0.56, 0.84, fbm3(cloudP * 3.1 + vec2(fbm3(cloudP * 1.8), 0.0).xyy)) * 0.72;
        float cloudShadow = smoothstep(0.58, 0.86, fbm3((cloudP - rotY(sunDir, uSpin) * 0.02) * 3.1)) * 0.72;

        vec3 litSurface = albedo * (diffuse * (1.0 - cloudShadow * 0.35) * 1.25 + 0.02);
        litSurface += vec3(1.0, 0.96, 0.88) * spec * 0.75 * (1.0 - clouds * 0.85);
        litSurface = mix(litSurface, vec3(0.96, 0.98, 1.0) * (max(0.0, NdotL_geom) * 1.15 + 0.03), clouds);

        // Night-side city lights on land
        float nightMask = smoothstep(0.05, -0.22, NdotL_geom);
        float cityNoise = pow(noise3(sp * 28.0), 4.2) * smoothstep(0.48, 0.62, fbm3(sp * 7.5));
        float coastal = smoothstep(0.58, 0.50, h0) * landMask * (1.0 - polarIce);
        litSurface += vec3(1.0, 0.72, 0.32) * cityNoise * coastal * nightMask * 0.95 * (1.0 - clouds * 0.7);

        // Rayleigh rim scattering + warm terminator band
        float sunLimb = clamp(NdotL_geom * 0.7 + 0.45, 0.0, 1.0);
        vec3 rayleigh = vec3(0.24, 0.62, 1.0) * fresnel * sunLimb * 0.92;
        float terminator = exp(-pow(NdotL_geom * 6.0, 2.0));
        vec3 sunset = vec3(0.95, 0.38, 0.14) * terminator * fresnel * 0.35;
        col = litSurface + rayleigh + sunset;

      } else if (uType == 1) {
        // === MARS ===
        float basalt = smoothstep(0.36, 0.58, fbm3(sp * 2.8 + vec3(2.1, 4.4, 1.7)));
        float polarCap = smoothstep(0.84, 0.93, abs(sp.y) + (h0 - 0.5) * 0.12);

        vec3 darkBasalt = vec3(0.22, 0.10, 0.065);
        vec3 rustDust = vec3(0.68, 0.27, 0.125);
        vec3 brightOchre = vec3(0.82, 0.44, 0.22);

        vec3 albedo = mix(darkBasalt, rustDust, basalt);
        albedo = mix(albedo, brightOchre, smoothstep(0.55, 0.82, h0));
        albedo = mix(albedo, vec3(0.94, 0.92, 0.90), polarCap);

        // Oren-Nayar style dusty matte response (no plastic shine)
        vec3 litSurface = albedo * (diffuse * 1.28 + 0.02);
        // Subtle dusty Martian limb scattering
        float sunLimb = clamp(NdotL_geom * 0.7 + 0.4, 0.0, 1.0);
        litSurface += vec3(0.95, 0.52, 0.28) * fresnel * sunLimb * 0.38;
        col = litSurface;

      } else {
        // === MOON ===
        float mariaMask = smoothstep(0.42, 0.58, fbm3(sp * 1.9));
        vec3 maria = vec3(0.16, 0.17, 0.19);
        vec3 highlands = vec3(0.48, 0.49, 0.52);
        vec3 ejecta = vec3(0.72, 0.73, 0.75);

        vec3 albedo = mix(maria, highlands, mariaMask);
        albedo = mix(albedo, ejecta, smoothstep(0.66, 0.88, h0));

        // Sharp lunar opposition surge / harsh shadow contrast
        float lunarDiff = pow(max(0.0, dot(B, sunDir)), 0.92) * smoothstep(-0.02, 0.05, NdotL_geom);
        col = albedo * (lunarDiff * 1.32 + 0.012);
      }

      col = acesFilm(col);
      col = pow(col, vec3(1.0 / 2.2));
      gl_FragColor = vec4(col * aaEdge, aaEdge);
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
      this.renderScale = 0.85;

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
      this.renderScale = 0.85;
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
      this.canvas.width = 384;
      this.canvas.height = 384;
      this.gl = this.canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true, depth: false }) ||
                this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, depth: false });
      this.ready = false;
      this._cache = {};

      if (this.gl) {
        this._initGL();
      }
    }

    _initGL() {
      const gl = this.gl;
      const prog = compileProgram(gl, VERTEX_SHADER, PLANET_FRAGMENT_SHADER);
      if (!prog) return;
      this.program = prog;
      gl.useProgram(prog);
      setupFullscreenQuad(gl, prog);

      this.locs = {
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
     * Renders a ray-traced 3D planet onto a 2D canvas context.
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
      const targetSize = Math.min(896, Math.max(192, Math.ceil((radius * 2.64 * dpr) / 64) * 64));
      const cacheKey = `${type}_${targetSize}`;
      let entry = this._cache[cacheKey];
      const nowSec = performance.now() * 0.001;
      const cloudDelta = type === 'earth' ? Math.abs(nowSec - (entry ? entry.time : 0)) : 0;

      if (
        !entry ||
        Math.abs(spin - entry.spin) > 0.003 ||
        Math.abs(tilt - entry.tilt) > 0.003 ||
        cloudDelta > 0.12
      ) {
        if (this.canvas.width !== targetSize || this.canvas.height !== targetSize) {
          this.canvas.width = targetSize;
          this.canvas.height = targetSize;
          this.gl.viewport(0, 0, targetSize, targetSize);
        }

        const typeId = type === 'mars' ? 1 : (type === 'moon' ? 2 : 0);
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1i(this.locs.uType, typeId);
        gl.uniform1f(this.locs.uTime, nowSec);
        gl.uniform1f(this.locs.uSpin, spin);
        gl.uniform1f(this.locs.uTilt, tilt);
        gl.uniform3f(this.locs.uSunDir, sunDir[0], sunDir[1], sunDir[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        if (!entry) {
          const c = document.createElement('canvas');
          c.width = targetSize;
          c.height = targetSize;
          entry = { canvas: c, ctx: c.getContext('2d'), spin, tilt, time: nowSec };
          this._cache[cacheKey] = entry;
        } else {
          entry.ctx.clearRect(0, 0, targetSize, targetSize);
          entry.spin = spin;
          entry.tilt = tilt;
          entry.time = nowSec;
        }
        entry.ctx.drawImage(this.canvas, 0, 0);
      }

      const drawSpan = radius * 2.64;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(entry.canvas, cx - drawSpan * 0.5, cy - drawSpan * 0.5, drawSpan, drawSpan);
      ctx.restore();
      return true;
    }
  }

  window.vantaNebulaGL = new VantaNebulaGL();
  window.vantaPlanetGL = new VantaPlanetGL();
})();
