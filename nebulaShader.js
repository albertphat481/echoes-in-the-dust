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
      for (int i = 0; i < 6; i++) {
        v += a * noise3(p);
        p = p * 2.05 + vec3(13.1, 7.7, 5.3);
        a *= 0.5;
      }
      return v;
    }

    float ridged3(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
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

    vec3 acesFilm(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    // Terrain height function for analytical/finite-difference normal mapping
    float surfaceHeight(vec3 sp, int type) {
      if (type == 0) {
        // Earth: continents + mountain ridges
        float cont = fbm3(sp * 2.15);
        float ridge = ridged3(sp * 5.2) * smoothstep(0.49, 0.72, cont);
        return cont + ridge * 0.28;
      } else if (type == 1) {
        // Mars: canyons + volcanic plateaus + impact craters
        float base = fbm3(sp * 2.4);
        float canyon = ridged3(sp * 4.5);
        float craters = smoothstep(0.62, 0.88, noise3(sp * 11.5)) * 0.18;
        return base * 0.65 + canyon * 0.35 - craters;
      } else {
        // Moon: Maria basins + multi-scale craters
        float maria = fbm3(sp * 1.9);
        float c1 = abs(noise3(sp * 7.5) - 0.5) * 2.0;
        float c2 = abs(noise3(sp * 17.0) - 0.5) * 2.0;
        float craterRim = smoothstep(0.18, 0.36, c1) * 0.35 + smoothstep(0.15, 0.32, c2) * 0.18;
        return maria * 0.55 + craterRim;
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
          haloCol = vec3(0.22, 0.58, 1.0);
          haloAlpha = exp(-limbDist * 13.5) * 0.62 * sunSide;
        } else if (uType == 1) {
          haloCol = vec3(0.92, 0.45, 0.22);
          haloAlpha = exp(-limbDist * 18.0) * 0.32 * sunSide;
        } else {
          haloCol = vec3(0.75, 0.80, 0.90);
          haloAlpha = exp(-limbDist * 26.0) * 0.10 * sunSide;
        }
        gl_FragColor = vec4(haloCol * haloAlpha, haloAlpha);
        return;
      }

      // Ray-sphere hit point & geometric normal
      float z = sqrt(max(0.0, 1.0 - r2));
      vec3 N = normalize(vec3(p.x, p.y, z));
      vec3 sp = rotY(N, uSpin);

      // Subpixel anti-aliased limb mask
      float aaEdge = smoothstep(1.0, 0.986, r);

      // Finite-difference 3D bump mapping
      float eps = 0.012;
      float h0 = surfaceHeight(sp, uType);
      float hx = surfaceHeight(normalize(sp + vec3(eps, 0.0, 0.0)), uType);
      float hy = surfaceHeight(normalize(sp + vec3(0.0, eps, 0.0)), uType);
      float hz = surfaceHeight(normalize(sp + vec3(0.0, 0.0, eps)), uType);
      vec3 grad = vec3(hx - h0, hy - h0, hz - h0) / eps;
      // Project gradient onto tangent plane
      grad -= sp * dot(grad, sp);
      vec3 worldGrad = rotY(grad, -uSpin);

      float bumpStrength = (uType == 0) ? 0.16 : ((uType == 1) ? 0.36 : 0.44);
      vec3 B = normalize(N - worldGrad * bumpStrength);

      float NdotL_geom = dot(N, sunDir);
      float NdotL = max(0.0, dot(B, sunDir));
      // Soft terminator wrap for atmosphere-bearing worlds
      float wrap = (uType == 2) ? 0.0 : 0.06;
      float diffuse = clamp((dot(B, sunDir) + wrap) / (1.0 + wrap), 0.0, 1.0);
      // Horizon self-shadowing near terminator
      diffuse *= smoothstep(-0.08, 0.14, NdotL_geom);

      float fresnel = pow(1.0 - max(0.0, dot(N, viewDir)), 3.6);
      vec3 col = vec3(0.0);

      if (uType == 0) {
        // === EARTH ===
        float landMask = smoothstep(0.495, 0.525, h0);
        float lat = abs(sp.y);
        float polarIce = smoothstep(0.74, 0.88, lat + (h0 - 0.5) * 0.25);

        // Deep ocean bathymetry
        vec3 deepOcean = vec3(0.012, 0.055, 0.165);
        vec3 shallowOcean = vec3(0.025, 0.175, 0.365);
        vec3 oceanCol = mix(deepOcean, shallowOcean, smoothstep(0.32, 0.495, h0));

        // Realistic continents: lush lowland, arid interior, alpine peaks
        float arid = fbm3(sp * 3.8 + vec3(9.2, 1.4, 3.7));
        vec3 forest = vec3(0.055, 0.175, 0.072);
        vec3 desert = vec3(0.44, 0.34, 0.21);
        vec3 alpine = vec3(0.36, 0.35, 0.33);
        vec3 landCol = mix(forest, desert, smoothstep(0.44, 0.68, arid) * (1.0 - lat * 0.5));
        landCol = mix(landCol, alpine, smoothstep(0.64, 0.82, h0));

        vec3 albedo = mix(oceanCol, landCol, landMask);
        albedo = mix(albedo, vec3(0.92, 0.95, 0.98), polarIce);

        // Ocean GGX-like specular sun glint
        vec3 H = normalize(sunDir + viewDir);
        float spec = pow(max(0.0, dot(B, H)), 72.0) * (1.0 - landMask) * (1.0 - polarIce);

        // Dynamic 3D cloud deck + shadow offset
        vec3 cloudP = rotY(N, uSpin * 1.18 + uTime * 0.015);
        float clouds = smoothstep(0.50, 0.78, fbm3(cloudP * 3.4 + vec2(fbm3(cloudP * 2.0), 0.0).xyy));
        float cloudShadow = smoothstep(0.52, 0.80, fbm3((cloudP - rotY(sunDir, uSpin) * 0.025) * 3.4));

        vec3 litSurface = albedo * (diffuse * (1.0 - cloudShadow * 0.42) * 1.25 + 0.018);
        litSurface += vec3(1.0, 0.96, 0.88) * spec * 0.85 * (1.0 - clouds * 0.85);
        litSurface = mix(litSurface, vec3(0.96, 0.98, 1.0) * (max(0.0, NdotL_geom) * 1.15 + 0.03), clouds * 0.88);

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
      this.renderScale = Math.min(1.5, Math.max(1.0, window.devicePixelRatio || 1));

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
      this.renderScale = Math.min(1.5, Math.max(1.0, window.devicePixelRatio || 1));
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
        sunDir = [-0.62, 0.42, 0.66],
        alpha = 1.0
      } = opts;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetSize = Math.min(640, Math.max(256, Math.ceil(radius * 2.64 * dpr)));
      if (Math.abs(this.canvas.width - targetSize) > 64) {
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
      gl.uniform1f(this.locs.uTime, performance.now() * 0.001);
      gl.uniform1f(this.locs.uSpin, spin);
      gl.uniform3f(this.locs.uSunDir, sunDir[0], sunDir[1], sunDir[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const drawSpan = radius * 2.64;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(this.canvas, cx - drawSpan * 0.5, cy - drawSpan * 0.5, drawSpan, drawSpan);
      ctx.restore();
      return true;
    }
  }

  window.vantaNebulaGL = new VantaNebulaGL();
  window.vantaPlanetGL = new VantaPlanetGL();
})();
