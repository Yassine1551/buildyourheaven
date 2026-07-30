// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const KEEP_POSITION: [number, number, number] = [0, 0, 1.8];

function RiseMesh({ targetY, children, ...props }: { targetY: number; children: React.ReactNode; [key: string]: any }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const currentY = useRef(-1);

  useFrame(() => {
    if (!meshRef.current) return;
    currentY.current += (targetY - currentY.current) * 0.05;
    meshRef.current.position.y = currentY.current;
  });

  return (
    <mesh ref={meshRef} position={[0, -1, 0]} {...props}>
      {children}
    </mesh>
  );
}

function RiseGroup({ targetY, children, ...props }: { targetY: number; children: React.ReactNode; [key: string]: any }) {
  const groupRef = useRef<THREE.Group>(null!);
  const currentY = useRef(-1);

  useFrame(() => {
    if (!groupRef.current) return;
    currentY.current += (targetY - currentY.current) * 0.05;
    groupRef.current.position.y = currentY.current;
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]} {...props}>
      {children}
    </group>
  );
}

interface PalaceKeepProps {
  qasrCount: number;
}

export default function PalaceKeep({ qasrCount }: PalaceKeepProps) {
  const stage = useMemo(() => {
    if (qasrCount <= 1) return 0;
    if (qasrCount <= 4) return 1;
    if (qasrCount <= 9) return 2;
    return 3;
  }, [qasrCount]);

  const progress = useMemo(() => {
    if (qasrCount >= 15) return 1;
    return Math.min(qasrCount / 15, 1);
  }, [qasrCount]);

  const hasMinarets = stage >= 3;

  return (
    <group position={KEEP_POSITION}>
      {/* Hill/mound — raised ground */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 16]} />
        <meshBasicMaterial color="rgba(61,122,85,0.12)" transparent />
      </mesh>

      {/* Marble base platform */}
      <RiseMesh targetY={-0.05}>
        <boxGeometry args={[1.0, 0.12, 0.9]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.3} metalness={0.1} />
      </RiseMesh>

      {/* Marble step */}
      {stage >= 1 && (
        <RiseMesh targetY={0.08}>
          <boxGeometry args={[0.7, 0.08, 0.65]} />
          <meshStandardMaterial color="#EDE8DC" roughness={0.4} metalness={0.1} />
        </RiseMesh>
      )}

      {/* Main hall */}
      {stage >= 1 && (
        <RiseMesh targetY={0.25}>
          <boxGeometry args={[0.5, 0.35, 0.5]} />
          <meshStandardMaterial color="#F0EBE0" roughness={0.5} />
        </RiseMesh>
      )}

      {/* Marble pillars at corners */}
      {stage >= 1 && (
        <>
          {[[-0.32, 0, -0.32], [0.32, 0, -0.32], [-0.32, 0, 0.32], [0.32, 0, 0.32]].map((pos, i) => (
            <RiseMesh key={`pillar-${i}`} targetY={0.52} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
              <meshStandardMaterial color="#F5F0E8" roughness={0.2} metalness={0.2} />
            </RiseMesh>
          ))}
        </>
      )}

      {/* Gold dome */}
      {stage >= 2 && (
        <RiseMesh targetY={0.55}>
          <sphereGeometry args={[0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.7} />
        </RiseMesh>
      )}

      {/* Crescent on dome */}
      {stage >= 2 && (
        <RiseMesh targetY={0.72}>
          <torusGeometry args={[0.06, 0.015, 6, 8, Math.PI * 1.5]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.1} metalness={0.8} />
        </RiseMesh>
      )}

      {/* Minarets */}
      {hasMinarets && (
        <>
          {[[-0.5, 0, -0.25], [0.5, 0, 0.25]].map((pos, i) => (
            <RiseGroup key={`minaret-${i}`} targetY={0.7} position={pos}>
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.025, 0.035, 0.7, 6]} />
                <meshStandardMaterial color="#FFF8EE" roughness={0.2} metalness={0.3} />
              </mesh>
              {/* Balcony */}
              <mesh position={[0, 0.65, 0]}>
                <boxGeometry args={[0.06, 0.015, 0.06]} />
                <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.6} />
              </mesh>
              {/* Spike */}
              <mesh position={[0, 0.75, 0]}>
                <coneGeometry args={[0.015, 0.08, 6]} />
                <meshStandardMaterial color="#D4AF37" roughness={0.1} metalness={0.8} />
              </mesh>
            </RiseGroup>
          ))}
        </>
      )}

      {/* Completion glow */}
      {progress >= 1 && (
        <RiseMesh targetY={0.85}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.3} />
        </RiseMesh>
      )}
    </group>
  );
}

export { KEEP_POSITION };
