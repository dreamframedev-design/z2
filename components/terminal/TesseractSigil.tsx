'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function project4D(point: number[], angle: number, angle2: number): THREE.Vector3 {
  let [x, y, z, w] = point;
  const c1 = Math.cos(angle);
  const s1 = Math.sin(angle);
  const x1 = x * c1 - w * s1;
  const w1 = x * s1 + w * c1;

  const c2 = Math.cos(angle2);
  const s2 = Math.sin(angle2);
  const y1 = y * c2 - z * s2;
  const z1 = y * s2 + z * c2;

  const scale = 1 / (2.5 - w1 * 0.5);
  return new THREE.Vector3(x1 * scale * 1.5, y1 * scale * 1.5, z1 * scale * 1.5);
}

function TesseractMesh({ intensity }: { intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const edgePairs = useMemo(() => {
    const vertices4D: number[][] = [];
    for (let i = 0; i < 16; i++) {
      vertices4D.push([
        i & 1 ? 1 : -1,
        i & 2 ? 1 : -1,
        i & 4 ? 1 : -1,
        i & 8 ? 1 : -1,
      ]);
    }
    const pairs: [number[], number[]][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (((i >> k) & 1) !== ((j >> k) & 1)) diff++;
        }
        if (diff === 1) pairs.push([vertices4D[i], vertices4D[j]]);
      }
    }
    return pairs;
  }, []);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#fbbf24'),
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current || !linesRef.current) return;
    const t = clock.getElapsedTime();
    const angle = t * (0.25 + intensity * 0.5);
    const angle2 = t * 0.18;

    const positions: number[] = [];
    edgePairs.forEach(([a, b]) => {
      const pa = project4D(a, angle, angle2);
      const pb = project4D(b, angle * 0.7, angle2 * 1.1);
      positions.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef} geometry={geometry} material={material} />
      <mesh>
        <octahedronGeometry args={[0.06 + intensity * 0.04, 0]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

export default function TesseractSigil({
  intensity = 0.3,
  className = '',
}: {
  intensity?: number;
  className?: string;
}) {
  return (
    <div className={`${className} relative`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#818cf8" />
        <pointLight position={[-5, -5, 2]} intensity={0.6} color="#fbbf24" />
        <TesseractMesh intensity={intensity} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.4} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
