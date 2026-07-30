// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

type TerrainState = 'barren' | 'grass' | 'golden';

const STATE_COLORS: Record<TerrainState, string> = {
  barren: '#6B5B4F',
  grass: '#3D7A55',
  golden: '#B8860B',
};

const FLOWER_POSITIONS: [number, number, number][] = Array.from({ length: 16 }, (_, i) => {
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.8 + Math.random() * 2.2;
  const side = Math.random() > 0.5 ? 1 : -1;
  return [
    side * Math.cos(angle) * radius + (Math.random() - 0.5) * 0.5,
    0,
    -0.3 + Math.sin(angle) * radius * 0.4,
  ] as [number, number, number];
});

const FLOWER_COLORS = ['#FF6B6B', '#FFD93D', '#FF8E53', '#FF69B4', '#E8A87C'];

function WaterSurface({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const time = useRef(0);
  const initialPositions = useRef<Float32Array | null>(null);

  useFrame(() => {
    if (!meshRef.current || !active) return;
    time.current += 0.025;
    const pos = meshRef.current.geometry.attributes.position;
    if (!initialPositions.current) {
      initialPositions.current = new Float32Array(pos.array);
    }
    const init = initialPositions.current;
    const arr = pos.array;
    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      const x = arr[i3];
      const z = arr[i3 + 2];
      arr[i3 + 1] = init[i3 + 1] + Math.sin(x * 3 + time.current) * 0.025 + Math.cos(z * 4 + time.current * 0.6) * 0.015;
    }
    pos.needsUpdate = true;
  });

  const opacity = active ? 0.85 : 0;

  return (
    <mesh ref={meshRef} position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.6, 1.0, 20, 8]} />
      <meshStandardMaterial
        color="#00BCD4"
        transparent
        opacity={opacity}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  );
}

interface RiverTerrainProps {
  maghfiraCount: number;
  alfHasanaCount: number;
}

export default function RiverTerrain({ maghfiraCount, alfHasanaCount }: RiverTerrainProps) {
  const groundRef = useRef<THREE.Mesh>(null!);
  const targetColor = useRef(new THREE.Color(STATE_COLORS.barren));

  const state: TerrainState = useMemo(() => {
    if (maghfiraCount < 100) return 'barren';
    if (alfHasanaCount < 500) return 'grass';
    return 'golden';
  }, [maghfiraCount, alfHasanaCount]);

  const waterActive = state !== 'barren';
  const showFlowers = state === 'grass' || state === 'golden';
  const flowerColorIdx = useRef(0);

  useFrame(() => {
    if (!groundRef.current) return;
    targetColor.current.set(STATE_COLORS[state]);
    const mat = groundRef.current.material as THREE.MeshStandardMaterial;
    mat.color.lerp(targetColor.current, 0.03);
  });

  return (
    <group>
      {/* Main ground ellipse */}
      <mesh ref={groundRef} position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial color={STATE_COLORS.barren} roughness={0.9} metalness={0} />
      </mesh>

      {/* Riverbed (darker strip) */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 1.2, 1, 1]} />
        <meshBasicMaterial
          color={waterActive ? '#006064' : '#5C4A3A'}
          transparent
          opacity={waterActive ? 0.4 : 0.6}
        />
      </mesh>

      {/* Riverbank edges */}
      {[-1.9, 1.9].map((x, idx) => (
        <mesh key={`bank-${idx}`} position={[x, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 1.1]} />
          <meshBasicMaterial color="rgba(255,255,255,0.04)" transparent />
        </mesh>
      ))}

      {/* Water surface */}
      <WaterSurface active={waterActive} />

      {/* Flowers in grass/golden state */}
      {showFlowers && FLOWER_POSITIONS.map((pos, i) => {
        const color = FLOWER_COLORS[i % FLOWER_COLORS.length];
        const height = 0.04 + Math.random() * 0.04;
        return (
          <group key={`flower-${i}`} position={[pos[0], -0.06, pos[2]]}>
            <mesh>
              <sphereGeometry args={[height, 6, 6]} />
              <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* Tiny stem */}
            <mesh position={[0, -height, 0]}>
              <cylinderGeometry args={[0.005, 0.005, height, 4]} />
              <meshBasicMaterial color="#2D5A27" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
