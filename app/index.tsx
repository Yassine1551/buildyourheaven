import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
    // Wait for the navigator to mount before navigating (replaces the old
    // star splash while keeping a short delay so routing is ready).
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1E16',
  },
});
