import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

export default function AuthCallback() {
  useEffect(() => {
    // The OAuth session is already exchanged by signInWithGoogle()
    // (via WebBrowser.openAuthSessionAsync). This deep link only fires
    // because the OS also delivers mihrab://auth/callback to the router.
    // Just send the user to the main app.
    router.replace('/(tabs)');
  }, []);

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
