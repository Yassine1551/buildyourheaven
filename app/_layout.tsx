import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, View, StyleSheet, Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Font from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../contexts/AppContext';
import { scheduleAllAdhkar, clearExpiredNotifications, loadNotificationSettings } from '../services/adhkarNotifications';
import OnboardingTour from '../components/OnboardingTour';
import OnboardingModal from '../components/OnboardingModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const appState = useRef(AppState.currentState);
  const [showLogo, setShowLogo] = useState(true);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load Scheherazade New (Hafs) and the official King Fahd Warsh font. The
    // Warsh font renders the wasl-alef vowel marks (اُ۬, اِ۬, اَ۬) as a stroke
    // across the middle of the alef, exactly as printed in the Warsh mushaf.
    Font.loadAsync({
      ScheherazadeNew: require('../assets/fonts/ScheherazadeNew-Regular.ttf'),
      UthmanicWarsh: require('../assets/fonts/UthmanicWarsh.ttf'),
    }).catch(() => {});

    // Create the Android notification channel (required for notifications to appear on Android 8+)
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('adhkar', {
        name: 'أذكار وبينات',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0B1E16',
      }).catch(() => {});
    }

    // Request notification permission; if denied, remind periodically to enable it
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'undetermined') {
          await Notifications.requestPermissionsAsync();
        } else if (status === 'denied') {
          const last = await AsyncStorage.getItem('notifReminderLastShown');
          const now = Date.now();
          const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
          if (!last || now - Number(last) > THREE_DAYS) {
            Alert.alert(
              'فّعل الإشعارات 🔔',
              'لتتلقى تذكيرات الأذكار اليومية، يرجى السماح للإشعارات من إعدادات التطبيق.',
              [
                { text: 'لاحقاً', style: 'cancel' },
                { text: 'فتح الإعدادات', onPress: () => Linking.openSettings() },
              ]
            );
            await AsyncStorage.setItem('notifReminderLastShown', String(now));
          }
        }
      } catch {
        // ignore
      }
    })();

    loadNotificationSettings().then((settings) => scheduleAllAdhkar(settings)).catch(() => {});

    const notificationSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route as string | undefined;
      // Remove the tapped notification from the shade immediately.
      Notifications.dismissNotificationAsync(response.notification.request.identifier).catch(() => {});
      if (route) {
        setPendingRoute(route);
      }
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      const route = response?.notification.request.content.data?.route as string | undefined;
      if (response) {
        Notifications.dismissNotificationAsync(response.notification.request.identifier).catch(() => {});
      }
      if (route) {
        setPendingRoute(route);
      }
    });

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && state === 'active') {
        clearExpiredNotifications().catch(() => {});
      }
      appState.current = state;
    });

    const timer = setTimeout(() => setShowLogo(false), 1800);

    return () => {
      notificationSub.remove();
      subscription.remove();
      clearTimeout(timer);
    };
  }, []);

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <AppShell showLogo={showLogo} pendingRoute={pendingRoute} setPendingRoute={setPendingRoute} />
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}

function AppShell({ showLogo, pendingRoute, setPendingRoute }: { showLogo: boolean; pendingRoute: string | null; setPendingRoute: (r: string | null) => void }) {
  const { loaded, onboardingDone, setOnboardingDone, welcomeIntroDone } = useApp();
  const router = useRouter();

  // Navigate to a deep-linked adhkar page only once the app (and its navigation
  // container) is fully ready. This fixes cold-start taps that opened the wrong page.
  useEffect(() => {
    if (pendingRoute && loaded) {
      router.push(pendingRoute as never);
      setPendingRoute(null);
    }
  }, [pendingRoute, loaded, router, setPendingRoute]);

  return (
    <>
      {showLogo && (
        <View style={styles.logoOverlay} pointerEvents="none">
          <Image source={require('../assets/images/bg-pattern.webp')} style={StyleSheet.absoluteFill} />
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
      {!showLogo && loaded && welcomeIntroDone && !onboardingDone && (
        <OnboardingTour onClose={() => setOnboardingDone(true)} />
      )}
      <OnboardingModal />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="mihrab"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="morning-adhkar"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="sleep-adhkar"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="evening-adhkar"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="wakeup-adhkar"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="wird"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
            animationDuration: 300,
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
    </>
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
