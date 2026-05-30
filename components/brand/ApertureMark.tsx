'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/**
 * Z2 APERTURE
 * A gyroscopic red lens — concentric tilted rings orbiting a molten core.
 * Dilates and accelerates with audio energy. This is Z2's signature mark:
 * the lens you see the work through. (Deliberately NOT a tesseract.)
 */

function Rings({ intensity }: { intensity: number }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  const rings = useMemo(
    () => [
      { r: 1.0, tube: 0.018, tilt: [0.0, 0.0, 0], speed: 0.6, seg: 128 },
      { r: 1.32, tube: 0.012, tilt: [Math.PI / 2.6, 0.3, 0], speed: -0.4, seg: 128 },
      { r: 1.62, tube: 0.01, tilt: [Math.PI / 1.8, -0.4, 0.2], speed: 0.32, seg: 128 },
      { r: 0.72, tube: 0.022, tilt: [0.4, 0.6, 0], speed: -0.85, seg: 96 },
      { r: 1.95, tube: 0.006, tilt: [Math.PI / 3, 0.9, 0.4], speed: 0.22, seg: 160 },
    ],
    []
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const energy = 0.35 + intensity;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const cfg = rings[i];
      m.rotation.z = t * cfg.speed * energy;
      m.rotation.x = cfg.tilt[0] + Math.sin(t * 0.3 + i) * 0.15;
      const s = 1 + Math.sin(t * 1.2 + i) * 0.03 * (1 + intensity * 2);
      m.scale.setScalar(s);
    });
    if (core.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.12 + intensity * 0.6;
      core.current.scale.setScalar(pulse * 0.34);
    }
    if (group.current) {
      group.current.rotation.y = t * 0.12;
      group.current.rotation.x = Math.sin(t * 0.18) * 0.12;
    }
  });

  return (
    <group ref={group}>
      {rings.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          rotation={cfg.tilt as [number, number, number]}
        >
          <torusGeometry args={[cfg.r, cfg.tube, 12, cfg.seg]} />
          <meshStandardMaterial
            color={i === 3 ? '#ff3b1f' : '#e10600'}
            emissive={i === 3 ? '#ff3b1f' : '#e10600'}
            emissiveIntensity={2.2 + intensity * 3}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#ff6a4d"
          emissive="#ff3b1f"
          emissiveIntensity={3.5 + intensity * 4}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default function ApertureMark({
  intensity = 0.1,
  className = '',
}: {
  intensity?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[4, 4, 5]} intensity={2.4} color="#ff3b1f" />
        <pointLight position={[-5, -3, 2]} intensity={1.2} color="#e10600" />
        <Rings intensity={intensity} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.9} intensity={1.8} radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
