// @ts-nocheck
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withSequence, withTiming, Easing, useEffect } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

type TerrainState = 'barren' | 'grass' | 'golden';

const ISLAND_PATH = 'M60,30 L300,30 L370,130 L300,230 L60,230 L-10,130 Z';
const ISLAND_SHADOW = 'M65,38 L305,38 L373,136 L305,234 L65,234 L-3,136 Z';
const RIVER_PATH = 'M140,30 Q185,140 220,230';
const RIVER_CRACK_PATH = 'M140,30 Q185,140 220,230 M138,32 Q183,142 218,232 M142,28 Q187,138 222,228';

function RiverBarren() {
  return (
    <G>
      {[0, 2, -2].map((offset, i) => (
        <Path
          key={i}
          d={`M${140 + offset},30 Q${185 + offset},140 ${220 + offset},230`}
          stroke="#4A3D32"
          strokeWidth={1.2}
          strokeDasharray="4,3"
          fill="none"
          opacity={0.5}
        />
      ))}
      {/* Cracked patches along riverbed */}
      {[
        [160, 70], [175, 100], [190, 150], [205, 190],
      ].map((pos, i) => (
        <Path
          key={`crack-${i}`}
          d={`M${pos[0]},${pos[1]} L${pos[0] + 8},${pos[1] - 4} L${pos[0] + 3},${pos[1] + 5} Z`}
          fill="#3D3228"
          opacity={0.4}
        />
      ))}
    </G>
  );
}

function RiverActive() {
  const opacity1 = useSharedValue(0.7);
  const opacity2 = useSharedValue(0.5);
  const opacity3 = useSharedValue(0.9);

  useEffect(() => {
    const animate = (op: Animated.SharedValue<number>, min: number, max: number, delay: number) => {
      setTimeout(() => {
        op.value = withRepeat(
          withSequence(
            withTiming(max, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(min, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          ),
          -1, true
        );
      }, delay);
    };
    animate(opacity1, 0.5, 1, 0);
    animate(opacity2, 0.4, 0.85, 600);
    animate(opacity3, 0.6, 1, 1200);
  }, []);

  const animatedProps1 = useAnimatedProps(() => ({ opacity: opacity1.value }));
  const animatedProps2 = useAnimatedProps(() => ({ opacity: opacity2.value }));
  const animatedProps3 = useAnimatedProps(() => ({ opacity: opacity3.value }));

  return (
    <G>
      {/* Outer glow */}
      <AnimatedPath
        d="M135,28 Q180,140 215,232"
        stroke="#00F2FE"
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
        opacity={0.15}
        animatedProps={animatedProps2}
      />
      {/* Main water flow */}
      <AnimatedPath
        d={RIVER_PATH}
        stroke="#00BCD4"
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        animatedProps={animatedProps1}
      />
      {/* Inner bright core */}
      <AnimatedPath
        d={RIVER_PATH}
        stroke="#E0F7FA"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        animatedProps={animatedProps3}
      />
      {/* Sparkle dots */}
      {[[150, 55], [170, 95], [190, 145], [210, 200]].map((pos, i) => (
        <AnimatedRect
          key={`sparkle-${i}`}
          x={pos[0] - 1.5}
          y={pos[1] - 1.5}
          width={3}
          height={3}
          rx={1.5}
          fill="#FFFFFF"
          opacity={0}
          animatedProps={undefined!}
        />
      ))}
    </G>
  );
}

interface FloatingIslandProps {
  maghfiraCount: number;
  alfHasanaCount: number;
  nakhlaCount: number;
  qasrCount: number;
}

export default function FloatingIsland({ maghfiraCount, alfHasanaCount }: FloatingIslandProps) {
  const state: TerrainState = useMemo(() => {
    if (maghfiraCount < 100) return 'barren';
    if (alfHasanaCount < 500) return 'grass';
    return 'golden';
  }, [maghfiraCount, alfHasanaCount]);

  const isActive = state !== 'barren';

  // Island gradient colors based on state
  const islandColors = useMemo(() => {
    switch (state) {
      case 'barren':
        return ['#4A3D32', '#3D3228', '#2E251E'];
      case 'grass':
        return ['#1B5E20', '#2E7D32', '#388E3C'];
      case 'golden':
        return ['#A67C00', '#B8860B', '#D4A017'];
    }
  }, [state]);

  return (
    <Svg viewBox="0 0 360 280" width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        {/* Island gradient */}
        <LinearGradient id="islandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={islandColors[0]} />
          <stop offset="50%" stopColor={islandColors[1]} />
          <stop offset="100%" stopColor={islandColors[2]} />
        </LinearGradient>
        {/* Island edge highlight */}
        <LinearGradient id="islandEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </LinearGradient>
        {/* Shadow gradient */}
        <LinearGradient id="shadowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </LinearGradient>
      </Defs>

      {/* Island shadow */}
      <Path d={ISLAND_SHADOW} fill="url(#shadowGrad)" opacity={0.5} />

      {/* Main island */}
      <Path d={ISLAND_PATH} fill="url(#islandGrad)" />

      {/* Island edge border */}
      <Path d={ISLAND_PATH} fill="url(#islandEdge)" />

      {/* Top rim highlight */}
      <Path
        d="M60,30 L300,30"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1.5}
        fill="none"
      />

      {/* River */}
      {isActive ? <RiverActive /> : <RiverBarren />}
    </Svg>
  );
}
