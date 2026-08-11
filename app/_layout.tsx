import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, View, StyleSheet } from 'react-native';
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
  const router = useRouter();

  useEffect(() => {
    // Load Scheherazade New (Hafs) and the official King Fahd Warsh font. The
    // Warsh font renders the wasl-alef vowel marks (اُ۬, اِ۬, اَ۬) as a stroke
    // across the middle of the alef, exactly as printed in the Warsh mushaf.
    Font.loadAsync({
      ScheherazadeNew: require('../assets/fonts/ScheherazadeNew-Regular.ttf'),
      UthmanicWarsh: require('../assets/fonts/UthmanicWarsh.ttf'),
    }).catch(() => {});

    loadNotificationSettings().then((settings) => scheduleAllAdhkar(settings)).catch(() => {});

    const notificationSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route as string | undefined;
      if (route) {
        router.push(route as never);
      }
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification.request.content.data?.route) {
        router.push(response.notification.request.content.data.route as never);
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
          <AppShell showLogo={showLogo} />
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}

function AppShell({ showLogo }: { showLogo: boolean }) {
  const { loaded, onboardingDone, setOnboardingDone, welcomeIntroDone } = useApp();

  return (
    <>
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
