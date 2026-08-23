// @ts-nocheck
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import { theme } from '../constants/theme';

export default function OnboardingModal() {
  const {
    showWelcome,
    loaded,
    welcomeIntroDone,
    setWelcomeIntroDone,
    linkGoogle,
    cloudError,
    cloudLoading,
    cloudUser,
  } = useApp();

  const [step, setStep] = useState<'main' | 'loading'>('main');
  const [retryHint, setRetryHint] = useState(false);
  const cloudUserRef = useRef(cloudUser);

  useEffect(() => {
    cloudUserRef.current = cloudUser;
  }, [cloudUser]);

  useEffect(() => {
    if (cloudUser) setStep('main');
  }, [cloudUser]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setTimeout(() => {
          if (cloudUserRef.current) {
            setStep('main');
            return;
          }
          setStep((s) => {
            if (s === 'loading') {
              setRetryHint(true);
              return 'main';
            }
            return s;
          });
        }, 3000);
      }
    });
    return () => sub.remove();
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setRetryHint(false);
    setStep('loading');
    await linkGoogle();
    setStep('main');
  }, [linkGoogle]);

  const handleContinue = useCallback(() => {
    setWelcomeIntroDone(true);
  }, [setWelcomeIntroDone]);

  if (!loaded || !showWelcome || welcomeIntroDone) return null;

  return (
    <Modal visible transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>

          {step === 'main' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialIcons name="auto-awesome" size={36} color={theme.gold} />
              </View>
              <Text style={styles.title}>مرحباً بك في محرابك</Text>
              <Text style={styles.subtitle}>قبل أن نبدأ، يمكنك ربط حساب جيمايل ليحفظ رصيدك ويراجعاتك.</Text>

              {cloudUser ? (
                <View style={styles.connectedBox}>
                  <MaterialIcons name="check-circle" size={18} color="#059669" />
                  <Text style={styles.connectedText}>
                    متصل بحساب جيمايل{cloudUser.name ? `: ${cloudUser.name}` : ''}
                  </Text>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={handleGoogleSignIn}
                    disabled={cloudLoading}
                    style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.7 }]}
                  >
                    <MaterialIcons name="email" size={20} color="#333" />
                    <Text style={styles.googleBtnText}>
                      {cloudLoading ? 'جاري الاتصال...' : 'الاتصال بحساب جيمايل (اختياري)'}
                    </Text>
                  </Pressable>

                  {cloudError && (
                    <Text style={styles.errorText}>{cloudError}</Text>
                  )}
                  {retryHint && (
                    <Text style={styles.retryText}>تعذر العودة من المتصفح. اضغط على الزر لإعادة المحاولة.</Text>
                  )}
                </>
              )}

              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
              >
                <LinearGradient
                  colors={['#064E3B', '#0D7A5F']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <Text style={styles.primaryBtnText}>متابعة العرض التقديمي</Text>
              </Pressable>

              <Text style={styles.hintText}>في نهاية العرض سنتعرف على اسمك وهدفك</Text>
            </>
          )}

          {step === 'loading' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialIcons name="sync" size={36} color={theme.gold} />
              </View>
              <Text style={styles.title}>جاري الاتصال</Text>
              <Text style={styles.subtitle}>يتم ربط الحساب بالمحراب...</Text>
              <ActivityIndicator size="large" color={theme.gold} style={{ marginTop: 20 }} />
            </>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#F8F6F0',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  connectedBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(5,150,105,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  googleBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
    marginBottom: 14,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  hintText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
    lineHeight: 20,
  },
  retryText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
});
