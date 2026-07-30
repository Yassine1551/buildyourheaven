import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../contexts/AppContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const WAKEUP_SHOWN_KEY = 'wakeup_shown_date';

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function checkAndShowWakeup() {
  try {
    const hour = new Date().getHours();
    if (hour < 4) return;

    const today = getTodayDateString();
    const shown = await AsyncStorage.getItem(WAKEUP_SHOWN_KEY);
    if (shown === today) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 أذكار الاستيقاظ',
        body: 'استيقظت؟ ابدأ يومك بذكر الله',
        sound: true,
      },
      trigger: null,
    });
    await AsyncStorage.setItem(WAKEUP_SHOWN_KEY, today);
  } catch (_) {}
}

export default function RootLayout() {
  const appState = useRef(AppState.currentState);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    checkAndShowWakeup();

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && state === 'active') {
        checkAndShowWakeup();
      }
      appState.current = state;
    });

    const timer = setTimeout(() => setShowLogo(false), 1800);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, []);

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          {showLogo && (
            <View style={styles.logoOverlay} pointerEvents="none">
              <Image source={require('../assets/images/bg-pattern.png')} style={StyleSheet.absoluteFill} />
              <View style={styles.logoWrap}>
                <Image source={require('../assets/images/logo.png')} style={styles.splashLogo} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.18)', 'transparent', 'transparent', 'rgba(0,0,0,0.18)']}
                  locations={[0, 0.25, 0.75, 1]}
                  style={styles.logoGradientFull}
                />
              </View>
            </View>
          )}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="mihrab"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="morning-adhkar"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="sleep-adhkar"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="evening-adhkar"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="wakeup-adhkar"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="congratulations"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
              }}
            />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 200,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
  },
  splashLogo: {
    width: 200,
    height: 200,
    borderRadius: 24,
  },
  logoGradientFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
});
