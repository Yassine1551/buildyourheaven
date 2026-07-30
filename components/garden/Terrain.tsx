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

const THORN_POSITIONS: [number, number, number][] = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
  const radius = 1.8 + Math.random() * 1.8;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number];
});

interface TerrainProps {
  maghfiraCount: number;
  alfHasanaCount: number;
}

export default function Terrain({ maghfiraCount, alfHasanaCount }: TerrainProps) {
  const groundRef = useRef<THREE.Mesh>(null!);
  const targetColor = useRef(new THREE.Color(STATE_COLORS.barren));

  const state: TerrainState = useMemo(() => {
    if (maghfiraCount < 100) return 'barren';
    if (alfHasanaCount < 500) return 'grass';
    return 'golden';
  }, [maghfiraCount, alfHasanaCount]);

  const showGrass = state !== 'barren';
  const grassColor = state === 'golden' ? '#D4A843' : '#4A9E5C';

  useFrame(() => {
    if (!groundRef.current) return;
    targetColor.current.set(STATE_COLORS[state]);
    const mat = groundRef.current.material as THREE.MeshStandardMaterial;
    mat.color.lerp(targetColor.current, 0.03);
  });

  return (
    <group>
      {/* Ground */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial color={STATE_COLORS.barren} roughness={0.9} metalness={0} />
      </mesh>

      {/* Outer decorative ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <ringGeometry args={[3.9, 4, 32]} />
        <meshBasicMaterial color="rgba(255,255,255,0.03)" transparent />
      </mesh>

      {/* Inner boundary ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <ringGeometry args={[1.8, 2.2, 32]} />
        <meshBasicMaterial color="rgba(255,255,255,0.02)" transparent />
      </mesh>

      {/* Thorns — fade with opacity */}
      {THORN_POSITIONS.map((pos, i) => (
        <mesh key={`thorn-${i}`} position={[pos[0], -0.1, pos[2]]}>
          <coneGeometry args={[0.06, 0.2, 4]} />
          <meshStandardMaterial
            color="#5C4A3A"
            roughness={1}
            transparent
            opacity={state === 'barren' ? 1 : 0}
          />
        </mesh>
      ))}

      {/* Grass tufts */}
      {showGrass && Array.from({ length: 24 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.6 + Math.random() * 3;
        return (
          <mesh
            key={`grass-${i}`}
            position={[Math.cos(angle) * radius, -0.08, Math.sin(angle) * radius]}
          >
            <coneGeometry args={[0.03, 0.1, 3]} />
            <meshStandardMaterial color={grassColor} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
