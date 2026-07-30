// @ts-nocheck
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, G, Ellipse } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useEffect } from 'react-native-reanimated';

interface PalmIconProps {
  delay?: number;
}

export default function PalmIcon({ delay = 0 }: PalmIconProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 90,
        mass: 0.8,
      });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg viewBox="0 0 40 60" width="100%" height="100%">
        {/* Shadow on ground */}
        <Ellipse cx={20} cy={56} rx={6} ry={2} fill="rgba(0,0,0,0.2)" />
        {/* Trunk */}
        <Path
          d="M20,54 Q18,40 20,25 Q22,20 20,15"
          stroke="#6B4E31"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
        {/* Trunk texture lines */}
        <Path
          d="M19,48 L21,47 M18,42 L22,41 M19,36 L21,35 M20,30 L22,29"
          stroke="#5A3E25"
          strokeWidth={0.8}
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />
        {/* Fronds */}
        {[
          { d: 'M20,16 Q28,10 36,8', rot: '' },
          { d: 'M20,16 Q12,10 4,8', rot: '' },
          { d: 'M20,16 Q30,14 38,18', rot: '' },
          { d: 'M20,16 Q10,14 2,18', rot: '' },
          { d: 'M20,14 Q26,8 30,4', rot: '' },
          { d: 'M20,14 Q14,8 10,4', rot: '' },
        ].map((frond, i) => (
          <Path
            key={i}
            d={frond.d}
            stroke={i % 2 === 0 ? '#2D7D46' : '#388E3C'}
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {/* Inner lighter fronds */}
        {[
          { d: 'M20,15 Q24,11 28,9' },
          { d: 'M20,15 Q16,11 12,9' },
        ].map((frond, i) => (
          <Path
            key={`inner-${i}`}
            d={frond.d}
            stroke="#4CAF50"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 48,
  },
});
