// @ts-nocheck
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const PALACE_POSITION: [number, number, number] = [1.8, 0, 1.5];

function ProgressMesh({ scale, y, ...props }: { scale: number; y: number; [key: string]: any }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const currentScale = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    currentScale.current += (scale - currentScale.current) * 0.04;
    const s = Math.max(currentScale.current, 0);
    meshRef.current.scale.setScalar(s);
    meshRef.current.position.y = y * s;
  });

  return <mesh ref={meshRef} scale={0} {...props} />;
}

interface PalaceCitadelProps {
  qasrCount: number;
}

export default function PalaceCitadel({ qasrCount }: PalaceCitadelProps) {
  const stage = useMemo(() => {
    if (qasrCount <= 1) return 0;
    if (qasrCount <= 4) return 1;
    if (qasrCount <= 9) return 2;
    return 3;
  }, [qasrCount]);

  const progress = useMemo(() => {
    if (qasrCount >= 15) return 1;
    return qasrCount / 15;
  }, [qasrCount]);

  return (
    <group position={PALACE_POSITION}>
      {/* Palace foundation — base platform */}
      <ProgressMesh scale={1} y={-0.05}>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#8B7D6B" roughness={0.8} />
      </ProgressMesh>

      {/* Main building body */}
      {stage >= 1 && (
        <ProgressMesh scale={1} y={0.15}>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <meshStandardMaterial color="#A0927B" roughness={0.7} />
        </ProgressMesh>
      )}

      {/* Pillars at corners */}
      {stage >= 1 && (
        <>
          {[[-0.35, 0.1, -0.35], [0.35, 0.1, -0.35], [-0.35, 0.1, 0.35], [0.35, 0.1, 0.35]].map((pos, i) => (
            <ProgressMesh key={`pillar-${i}`} scale={1} y={0.25} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.03, 0.04, 0.5, 6]} />
              <meshStandardMaterial color="#C4B59A" roughness={0.5} />
            </ProgressMesh>
          ))}
        </>
      )}

      {/* Dome */}
      {stage >= 2 && (
        <ProgressMesh scale={1} y={0.5}>
          <sphereGeometry args={[0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.4} />
        </ProgressMesh>
      )}

      {/* Minarets */}
      {stage >= 3 && (
        <>
          {[[-0.45, 0.15, -0.2], [0.45, 0.15, 0.2]].map((pos, i) => (
            <ProgressMesh key={`minaret-${i}`} scale={1} y={0.45} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.02, 0.03, 0.9, 6]} />
              <meshStandardMaterial color="#E8DCC8" roughness={0.4} />
            </ProgressMesh>
          ))}
        </>
      )}

      {/* Completion flag */}
      {progress >= 1 && (
        <ProgressMesh scale={1} y={0.7}>
          <boxGeometry args={[0.02, 0.15, 0.02]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} />
        </ProgressMesh>
      )}
    </group>
  );
}

export { PALACE_POSITION, OASIS_POSITION as PALM_OASIS_POSITION };
