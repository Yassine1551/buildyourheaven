import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import Svg, { Circle, Polygon, Path } from 'react-native-svg';

const GOLD = '#D4AF37';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    ExpoSplashScreen.hideAsync();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Svg width={130} height={130} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={GOLD} strokeWidth="1.2" fill="none" opacity="0.3" />
          <Circle cx="50" cy="50" r="35" stroke={GOLD} strokeWidth="0.8" fill="none" opacity="0.5" />
          <Polygon
            points="50,8 56,35 85,35 62,52 70,82 50,64 30,82 38,52 15,35 44,35"
            fill={GOLD}
            opacity="0.85"
          />
          <Polygon
            points="50,25 62,50 50,75 38,50"
            fill="none"
            stroke={GOLD}
            strokeWidth="1.5"
            opacity="0.7"
          />
          <Path
            d="M 22,22 A 22,22 0 0,1 58,16 A 20,20 0 0,0 28,28 Z"
            fill={GOLD}
            opacity="0.6"
          />
          <Circle cx="50" cy="50" r="4" fill={GOLD} opacity="0.9" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1E16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
