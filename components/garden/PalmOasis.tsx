// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const MAX_TREES = 10;
const OASIS_POSITION: [number, number, number] = [-1.8, 0, -1.5];

function PalmTree({ delay }: { delay: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const scaleVal = useRef(0);

  useFrame(() => {
    if (!groupRef.current) return;
    scaleVal.current += (1 - scaleVal.current) * 0.04;
    const s = Math.min(Math.max(scaleVal.current, 0), 1);
    const eased = 1 - Math.pow(1 - s, 3);
    groupRef.current.scale.setScalar(eased);
  });

  return (
    <group ref={groupRef} scale={0}>
      {/* Trunk */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.3, 6]} />
        <meshStandardMaterial color="#6B4E31" roughness={0.9} />
      </mesh>
      {/* Fronds */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.12,
              0.3,
              Math.sin(angle) * 0.12,
            ]}
            rotation={[0, angle, Math.PI / 4]}
          >
            <coneGeometry args={[0.02, 0.2, 4]} />
            <meshStandardMaterial color="#2D7D46" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

interface PalmOasisProps {
  nakhlaCount: number;
}

export default function PalmOasis({ nakhlaCount }: PalmOasisProps) {
  const treeCount = useMemo(() => Math.min(nakhlaCount, MAX_TREES), [nakhlaCount]);

  return (
    <group position={OASIS_POSITION}>
      {/* Oasis fertile ground patch */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color="rgba(61,122,85,0.2)" transparent />
      </mesh>
      {/* Trees */}
      {Array.from({ length: treeCount }).map((_, i) => {
        const angle = (i / treeCount) * Math.PI * 2 + 0.5;
        const radius = 0.15 + (i % 3) * 0.08;
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <PalmTree delay={i * 0.1} />
          </group>
        );
      })}
    </group>
  );
}
