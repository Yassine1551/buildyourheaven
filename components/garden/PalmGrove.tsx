// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const MAX_TREES = 10;
const GROVE_POSITION: [number, number, number] = [-1.6, 0, -0.6];

function PalmTree() {
  const groupRef = useRef<THREE.Group>(null!);
  const velocity = useRef(0);
  const scaleVal = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = 1;
    const diff = target - scaleVal.current;
    velocity.current += diff * 0.08;
    velocity.current *= 0.92;
    scaleVal.current += velocity.current;
    scaleVal.current = Math.max(scaleVal.current, 0);
    groupRef.current.scale.setScalar(scaleVal.current);
  });

  return (
    <group ref={groupRef} scale={0}>
      {/* Trunk (taller) */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
        <meshStandardMaterial color="#6B4E31" roughness={0.9} />
      </mesh>
      {/* Crown base */}
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#4A7C59" roughness={0.7} />
      </mesh>
      {/* Fronds */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2 + 0.2;
        const tilt = 0.6 + Math.random() * 0.3;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.08,
              0.5,
              Math.sin(angle) * 0.08,
            ]}
            rotation={[
              Math.sin(angle) * tilt * 0.5,
              0,
              Math.cos(angle) * tilt * 0.5,
            ]}
          >
            <coneGeometry args={[0.015, 0.25, 4]} />
            <meshStandardMaterial color="#2D7D46" roughness={0.6} />
          </mesh>
        );
      })}
      {/* Drooping fronds */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2 + 0.8;
        return (
          <mesh
            key={`drop-${i}`}
            position={[
              Math.cos(angle) * 0.1,
              0.35,
              Math.sin(angle) * 0.1,
            ]}
            rotation={[
              Math.cos(angle) * 0.8,
              0,
              Math.sin(angle) * 0.8,
            ]}
          >
            <coneGeometry args={[0.01, 0.18, 3]} />
            <meshStandardMaterial color="#3D8A50" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

interface PalmGroveProps {
  nakhlaCount: number;
}

export default function PalmGrove({ nakhlaCount }: PalmGroveProps) {
  const treeCount = useMemo(() => Math.min(nakhlaCount, MAX_TREES), [nakhlaCount]);

  return (
    <group position={GROVE_POSITION}>
      {/* Fertile ground patch */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 16]} />
        <meshBasicMaterial color="rgba(61,122,85,0.15)" transparent />
      </mesh>
      {/* Trees */}
      {Array.from({ length: treeCount }).map((_, i) => {
        const angle = treeCount === 1 ? 0 : (i / treeCount) * Math.PI * 2 + 0.5;
        const radius = 0.12 + (i % 3) * 0.1;
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <PalmTree />
          </group>
        );
      })}
    </group>
  );
}

export { GROVE_POSITION };
