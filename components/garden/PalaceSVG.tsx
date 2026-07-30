// @ts-nocheck
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Rect, G, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, useEffect } from 'react-native-reanimated';

function RiseView({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const translateY = useSharedValue(60);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
      });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 1 - translateY.value / 80,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

interface PalaceSVGProps {
  qasrCount: number;
}

export default function PalaceSVG({ qasrCount }: PalaceSVGProps) {
  const stage = useMemo(() => {
    if (qasrCount <= 1) return 0;
    if (qasrCount <= 4) return 1;
    if (qasrCount <= 9) return 2;
    return 3;
  }, [qasrCount]);

  const progress = useMemo(() => Math.min(qasrCount / 15, 1), [qasrCount]);

  return (
    <Svg viewBox="0 0 120 100" width="100%" height="100%">
      <Defs>
        <LinearGradient id="marbleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8E0D0" />
        </LinearGradient>
        <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8860B" />
        </LinearGradient>
        <LinearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE55C" />
          <stop offset="100%" stopColor="#D4AF37" />
        </LinearGradient>
      </Defs>

      {/* Shadow */}
      {stage >= 0 && (
        <Ellipse cx={60} cy={92} rx={40} ry={8} fill="rgba(0,0,0,0.15)" />
      )}

      {/* Foundation — marble base */}
      {stage >= 0 && (
        <G>
          <Rect x={20} y={78} width={80} height={12} rx={3} fill="url(#marbleGrad)" />
          <Rect x={20} y={78} width={80} height={2} rx={1} fill="rgba(255,255,255,0.5)" />
        </G>
      )}

      {/* Stage 1: Main building + pillars */}
      {stage >= 1 && (
        <>
          {/* Main Hall */}
          <Rect x={30} y={48} width={60} height={30} rx={2} fill="url(#marbleGrad)" />
          {/* Door */}
          <Path d="M50,78 L50,60 Q60,54 70,60 L70,78 Z" fill="rgba(180,160,130,0.6)" />
          {/* Pillars */}
          {[28, 92].map((x, i) => (
            <Rect key={`pillar-${i}`} x={x} y={45} width={5} height={35} rx={2} fill="#FFF8EE" />
          ))}
          {/* Pillar tops */}
          {[27, 91].map((x, i) => (
            <Rect key={`pillar-top-${i}`} x={x - 1} y={43} width={7} height={4} rx={1.5} fill="#E8DCC8" />
          ))}
        </>
      )}

      {/* Stage 2: Gold dome */}
      {stage >= 2 && (
        <G>
          {/* Dome body */}
          <Path
            d="M40,48 Q40,22 60,18 Q80,22 80,48 Z"
            fill="url(#domeGrad)"
          />
          {/* Dome highlight */}
          <Path
            d="M45,45 Q45,28 60,24 Q65,26 65,40"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />
          {/* Crescent */}
          <Path
            d="M58,16 Q62,12 68,14"
            stroke="#FFD700"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Base ring */}
          <Rect x={38} y={46} width={44} height={3} rx={1.5} fill="#C5A028" />
        </G>
      )}

      {/* Stage 3: Minarets */}
      {stage >= 3 && (
        <>
          {[[17, 30, 15], [103, 30, 15]].map((pos, i) => {
            const x = pos[0];
            const h = pos[1];
            const topY = pos[2];
            return (
              <G key={`minaret-${i}`}>
                {/* Tower */}
                <Rect x={x} y={h} width={4} height={48} rx={1.5} fill="#FFF8EE" />
                {/* Balcony */}
                <Rect x={x - 2} y={topY + 1} width={8} height={3} rx={1} fill="url(#goldGrad)" />
                {/* Spike */}
                <Path d={`M${x + 2},${topY} L${x + 0.5},${topY - 8} L${x + 3.5},${topY - 8} Z`} fill="url(#goldGrad)" />
                {/* Balcony railing */}
                <Rect x={x - 1.5} y={topY + 3} width={7} height={1.5} rx={0.5} fill="#D4AF37" />
              </G>
            );
          })}
        </>
      )}

      {/* Completion glow */}
      {progress >= 1 && (
        <>
          <Ellipse cx={60} cy={28} rx={20} ry={10} fill="#D4AF37" opacity={0.15} />
          <Ellipse cx={60} cy={28} rx={12} ry={6} fill="#FFD700" opacity={0.1} />
        </>
      )}
    </Svg>
  );
}
