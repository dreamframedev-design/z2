'use client';

import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * WEBGL FLOURISH — the glass / photon showpiece (Strategy B).
 *
 * The real mark is rasterised to a CanvasTexture and mapped onto a plane. A
 * custom shader dissolves it in from noise, rakes a specular band across once,
 * keeps a faint heat-shimmer alive, and an additive red core fakes bloom. The
 * whole group tilts toward the cursor for parallax depth.
 *
 * Shipped behind a feature flag (see Hero.tsx) and wrapped in an error boundary
 * that hands off to the CSS `fallback` (LogoMark) if anything throws.
 *
 * Only `three` + `@react-three/fiber` are used so the production build stays
 * green; swap the additive core for `<Bloom/>` from @react-three/postprocessing
 * to push the glow further.
 */

const ASPECT = 457.81 / 434.72;

interface HeroCanvasProps {
  delay?: number;
  onLock?: () => void;
  fallback: ReactNode;
}

/* ----------------------------------------------------------- texture util */

function useLogoTexture() {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      const W = 1024;
      const H = Math.round(W / ASPECT);
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, W, H);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
      setTex(t);
    };
    // PNG rasterises reliably across browsers (vs. drawing the SVG)
    img.src = '/z2-logo.png';
    return () => {
      cancelled = true;
    };
  }, []);
  return tex;
}

/* --------------------------------------------------------------- shaders */

const VERT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uProgress;
  void main() {
    vUv = uv;
    vec3 p = position;
    float shimmer = (1.0 - uProgress) * 0.05;
    p.z += sin(uv.y * 12.0 + uTime * 2.0) * shimmer;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uProgress;

  // cheap hash noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }

  void main() {
    vec4 tex = texture2D(uTex, vUv);

    // dissolve: reveal where noise < progress
    float n = noise(vUv * 7.0) * 0.6 + noise(vUv * 21.0) * 0.4;
    float edge = smoothstep(uProgress - 0.08, uProgress, n);
    float reveal = 1.0 - edge;            // 1 = shown
    float rim = smoothstep(0.0, 0.5, edge) * (1.0 - edge) * 4.0; // hot dissolving edge

    // specular sweep (one strong pass as it locks, then a faint idle shimmer)
    float sweepPos = mix(-0.3, 1.3, clamp(uProgress * 1.6, 0.0, 1.0));
    float band = smoothstep(0.10, 0.0, abs(vUv.x - sweepPos));
    float idle = smoothstep(0.06, 0.0, abs(fract(vUv.x - uTime * 0.06) - 0.5)) * 0.10;

    vec3 col = tex.rgb;
    col += vec3(1.0, 0.62, 0.42) * rim;                  // ember rim on the dissolve
    col += vec3(1.0, 0.85, 0.75) * band * 0.9 * tex.a;   // forged gleam
    col += vec3(1.0, 0.35, 0.25) * idle * tex.a;         // idle life
    col *= 1.0 + uProgress * 0.15;                       // small emissive lift

    float alpha = tex.a * reveal;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ----------------------------------------------------------------- scene */

function Mark({ delay, onLock }: { delay: number; onLock?: () => void }) {
  const tex = useLogoTexture();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uProgress: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    if (tex && mat.current) {
      mat.current.uniforms.uTex.value = tex;
    }
  }, [tex]);

  useEffect(() => {
    const id = window.setTimeout(() => onLock?.(), (delay + 1.6) * 1000);
    return () => window.clearTimeout(id);
  }, [delay, onLock]);

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current - delay;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uProgress.value = THREE.MathUtils.clamp(t / 1.6, 0, 1);

    if (group.current) {
      const px = state.pointer.x;
      const py = state.pointer.y;
      group.current.rotation.y += (px * 0.18 - group.current.rotation.y) * 0.05;
      group.current.rotation.x += (-py * 0.12 - group.current.rotation.x) * 0.05;
    }
  });

  const h = 3.0;
  const w = h * ASPECT;

  return (
    <group ref={group}>
      {/* additive red core — cheap bloom */}
      <mesh position={[0, 0, -0.4]} scale={[w * 1.25, h * 1.25, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5}>
          <canvasTexture attach="map" image={radialGlow()} />
        </meshBasicMaterial>
      </mesh>

      {/* the mark */}
      <mesh>
        <planeGeometry args={[w, h, 1, 1]} />
        <shaderMaterial
          ref={mat}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

let _glow: HTMLCanvasElement | null = null;
function radialGlow() {
  if (_glow) return _glow;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,90,31,0.9)');
    g.addColorStop(0.4, 'rgba(255,34,64,0.35)');
    g.addColorStop(1, 'rgba(255,34,64,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  _glow = c;
  return c;
}

/* ----------------------------------------------------------- error guard */

class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ------------------------------------------------------------------ root */

export default function HeroCanvas({ delay = 0.6, onLock, fallback }: HeroCanvasProps) {
  return (
    <div className="relative aspect-[457.81/434.72] h-[clamp(168px,40vw,400px)]">
      <CanvasBoundary fallback={fallback}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}
          camera={{ position: [0, 0, 3.4], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <Mark delay={delay} onLock={onLock} />
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
