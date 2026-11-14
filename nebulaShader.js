/**
 * VantaLumen — Custom GLSL Space Nebula & Spectral Starfield Shader
 * Provides:
 * 1. Raw GLSL Vertex & Fragment Shaders (window.VANTALUMEN_NEBULA_GLSL)
 * 2. Live WebGL GPU Renderer (window.vantaNebulaGL) integrated directly into the canvas pipeline
 * 3. Three.js ShaderMaterial factory (window.createVantaLumenThreeMaterial)
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

    // 2D Hash & Value Noise
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

    // 5-Octave Rotation-Decorrelated FBM
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

    // Procedural Spectral Star Layer with 4-Point Diffraction Glint
    vec3 starLayer(vec2 uv, float scale, float seed, float time) {
      vec2 gv = fract(uv * scale) - 0.5;
      vec2 id = floor(uv * scale) + seed;
      vec2 rnd = hash22(id);

      float densityMask = step(1.0 - uStarDensity * 0.35, rnd.x);
      vec2 offset = (rnd - 0.5) * 0.72;
      vec2 p = gv - offset;
      float d = length(p);

      // Twinkle phase
      float twinkle = 0.55 + 0.45 * sin(time * (1.2 + rnd.y * 2.6) + rnd.x * 6.2831);
      float core = smoothstep(0.085, 0.0, d) * twinkle;

      // Subtle diffraction spikes on bright stars
      float isBright = step(0.88, rnd.y);
      float rays = max(0.0, 1.0 - abs(p.x * p.y * 260.0)) * smoothstep(0.28, 0.0, d) * isBright * 0.65;

      // Spectral color temperature: O/B cyan-blue -> F white -> K/M amber gold
      vec3 coldStar = vec3(0.68, 0.86, 1.0);
      vec3 warmStar = vec3(1.0, 0.82, 0.48);
      vec3 starCol = mix(coldStar, warmStar, smoothstep(0.2, 0.85, rnd.y));

      return starCol * (core + rays) * densityMask;
    }

    void main() {
      vec2 aspect = vec2(uResolution.x / max(1.0, uResolution.y), 1.0);
      vec2 uv = (vUv - 0.5) * aspect;
      vec2 mouseOffset = (uMouse - 0.5) * 0.14;

      float t = uTime * 0.035;
      vec2 p = uv * 1.65 + mouseOffset;

      // Domain Warping (Inigo Quilez style) for organic cosmic filament structures
      vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + t * 0.4),
        fbm(p + vec2(5.2, 1.3) - t * 0.3)
      );

      vec2 r = vec2(
        fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 0.25),
        fbm(p + 3.2 * q + vec2(8.3, 2.8) - t * 0.2)
      );

      float f = fbm(p + 2.8 * r);

      // Dark cosmic dust rift mask (Vanta oblivion)
      float dustRift = smoothstep(0.22, 0.68, fbm(p * 1.2 - q * 1.4 + vec2(3.1, -2.4)));

      // VantaLumen Palette:
      // Vanta: Deep void & cold slate (#040711 -> #0d162c)
      // Lumen: Warm amber memory emission (#f59e0b -> #fde68a)
      // Ionized O-III Cyan pockets (#0ea5e9 -> #38bdf8)
      vec3 vantaVoid = vec3(0.016, 0.027, 0.067);
      vec3 vantaSlate = vec3(0.055, 0.102, 0.215);
      vec3 lumenAmber = vec3(0.96, 0.62, 0.04) * uLumenIntensity;
      vec3 lumenGold = vec3(1.0, 0.90, 0.58) * uLumenIntensity;
      vec3 ionizedCyan = vec3(0.18, 0.72, 0.96) * uCyanMix;

      vec3 col = mix(vantaVoid, vantaSlate, clamp(f * f * 2.2, 0.0, 1.0));
      col = mix(col, ionizedCyan, clamp(length(q) * 0.55, 0.0, 1.0) * smoothstep(0.35, 0.85, f));
      col = mix(col, lumenAmber, clamp(r.x * r.x * 1.65, 0.0, 1.0) * smoothstep(0.42, 0.92, f));
      col += lumenGold * pow(clamp(f * r.y * 1.45, 0.0, 1.0), 3.2) * 0.55;

      // Carve dark interstellar dust lanes
      col *= mix(0.32, 1.0, dustRift);

      // Multi-depth Parallax Spectral Starfield
      vec3 stars = vec3(0.0);
      stars += starLayer(uv + mouseOffset * 0.25 + vec2(t * 0.04, 0.0), 11.0, 13.7, uTime) * 0.85;
      stars += starLayer(uv + mouseOffset * 0.55 - vec2(0.0, t * 0.02), 23.0, 47.3, uTime * 1.3) * 0.55;
      col += stars * (0.45 + 0.55 * dustRift);

      // Subtle radial vignette
      float vig = 1.0 - smoothstep(0.45, 1.35, length(uv));
      col *= mix(0.55, 1.0, vig);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  window.VANTALUMEN_NEBULA_GLSL = {
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER
  };

  // Three.js ShaderMaterial Factory (when THREE is loaded or used in Three.js scenes)
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

  // Native WebGL GPU Runner for live zero-build integration into Echoes in the Dust
  class VantaNebulaGL {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.gl = this.canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false }) ||
                this.canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
      this.ready = false;
      this.mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
      this.renderScale = 0.5; // Half-res FBM nebula for locked 60fps

      if (this.gl) {
        this._initGL();
        this._bindEvents();
      }
    }

    _compile(type, src) {
      const gl = this.gl;
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    _initGL() {
      const gl = this.gl;
      const vs = this._compile(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = this._compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vs || !fs) return;

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

      this.program = prog;
      gl.useProgram(prog);

      const quad = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(prog, 'aPosition');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

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
      const w = Math.max(256, Math.floor(window.innerWidth * this.renderScale));
      const h = Math.max(256, Math.floor(window.innerHeight * this.renderScale));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, w, h);
      }
    }

    /**
     * Renders the GLSL Space Nebula shader on the GPU and composites it onto a 2D canvas context.
     */
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

  window.vantaNebulaGL = new VantaNebulaGL();
})();
