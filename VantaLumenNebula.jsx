import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * VantaLumen Space Nebula — Custom GLSL Vertex Shader (Three.js)
 */
export const VANTALUMEN_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * VantaLumen Space Nebula — Custom GLSL Fragment Shader
 * Features:
 * - 5-octave rotation-decorrelated FBM with dual-stage Inigo Quilez domain warping
 * - Vanta (deep void & dark cosmic dust rifts) vs. Lumen (amber/gold emission clouds & O-III cyan pockets)
 * - Dual-layer parallax spectral starfield with 4-point diffraction spikes
 */
export const VANTALUMEN_FRAGMENT_SHADER = /* glsl */ `
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

  vec3 starLayer(vec2 uv, float scale, float seed, float time) {
    vec2 gv = fract(uv * scale) - 0.5;
    vec2 id = floor(uv * scale) + seed;
    vec2 rnd = hash22(id);

    float densityMask = step(1.0 - uStarDensity * 0.35, rnd.x);
    vec2 offset = (rnd - 0.5) * 0.72;
    vec2 p = gv - offset;
    float d = length(p);

    float twinkle = 0.55 + 0.45 * sin(time * (1.2 + rnd.y * 2.6) + rnd.x * 6.2831);
    float core = smoothstep(0.085, 0.0, d) * twinkle;

    float isBright = step(0.88, rnd.y);
    float rays = max(0.0, 1.0 - abs(p.x * p.y * 260.0)) * smoothstep(0.28, 0.0, d) * isBright * 0.65;

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

    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.4),
      fbm(p + vec2(5.2, 1.3) - t * 0.3)
    );

    vec2 r = vec2(
      fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 0.25),
      fbm(p + 3.2 * q + vec2(8.3, 2.8) - t * 0.2)
    );

    float f = fbm(p + 2.8 * r);
    float dustRift = smoothstep(0.22, 0.68, fbm(p * 1.2 - q * 1.4 + vec2(3.1, -2.4)));

    vec3 vantaVoid = vec3(0.016, 0.027, 0.067);
    vec3 vantaSlate = vec3(0.055, 0.102, 0.215);
    vec3 lumenAmber = vec3(0.96, 0.62, 0.04) * uLumenIntensity;
    vec3 lumenGold = vec3(1.0, 0.90, 0.58) * uLumenIntensity;
    vec3 ionizedCyan = vec3(0.18, 0.72, 0.96) * uCyanMix;

    vec3 col = mix(vantaVoid, vantaSlate, clamp(f * f * 2.2, 0.0, 1.0));
    col = mix(col, ionizedCyan, clamp(length(q) * 0.55, 0.0, 1.0) * smoothstep(0.35, 0.85, f));
    col = mix(col, lumenAmber, clamp(r.x * r.x * 1.65, 0.0, 1.0) * smoothstep(0.42, 0.92, f));
    col += lumenGold * pow(clamp(f * r.y * 1.45, 0.0, 1.0), 3.2) * 0.55;

    col *= mix(0.32, 1.0, dustRift);

    vec3 stars = vec3(0.0);
    stars += starLayer(uv + mouseOffset * 0.25 + vec2(t * 0.04, 0.0), 11.0, 13.7, uTime) * 0.85;
    stars += starLayer(uv + mouseOffset * 0.55 - vec2(0.0, t * 0.02), 23.0, 47.3, uTime * 1.3) * 0.55;
    col += stars * (0.45 + 0.55 * dustRift);

    float vig = 1.0 - smoothstep(0.45, 1.35, length(uv));
    col *= mix(0.55, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Standalone React + Three.js Fullscreen Shader Canvas Component
 */
export default function VantaLumenNebula({
  lumenIntensity = 1.0,
  cyanMix = 0.45,
  starDensity = 0.65,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);

  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uLumenIntensity: { value: lumenIntensity },
      uCyanMix: { value: cyanMix },
      uStarDensity: { value: starDensity }
    }),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VANTALUMEN_VERTEX_SHADER,
      fragmentShader: VANTALUMEN_FRAGMENT_SHADER,
      uniforms: initialUniforms,
      depthWrite: false,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const targetMouse = { x: 0.5, y: 0.5 };

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      material.uniforms.uResolution.value.set(w, h);
    };

    const handlePointerMove = e => {
      targetMouse.x = e.clientX / Math.max(1, window.innerWidth);
      targetMouse.y = 1.0 - e.clientY / Math.max(1, window.innerHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let rafId;
    const startTime = performance.now();

    const animate = now => {
      rafId = requestAnimationFrame(animate);
      material.uniforms.uTime.value = (now - startTime) * 0.001;
      material.uniforms.uLumenIntensity.value = lumenIntensity;
      material.uniforms.uCyanMix.value = cyanMix;
      material.uniforms.uStarDensity.value = starDensity;

      const curMouse = material.uniforms.uMouse.value;
      curMouse.x += (targetMouse.x - curMouse.x) * 0.08;
      curMouse.y += (targetMouse.y - curMouse.y) * 0.08;

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [initialUniforms, lumenIntensity, cyanMix, starDensity]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}
    />
  );
}
