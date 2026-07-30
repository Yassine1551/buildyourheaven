// @ts-nocheck
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../contexts/AppContext';
import { theme } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

const firebaseConfig = {
  apiKey: 'placeholder',        // Replace with actual API Key from Firebase Console
  authDomain: 'build-your-heaven-366ca.firebaseapp.com',
  projectId: 'build-your-heaven-366ca',
  storageBucket: 'build-your-heaven-366ca.appspot.com',
  messagingSenderId: '519640762502',
  appId: 'placeholder',         // Replace with actual App ID from Firebase Console
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const GOOGLE_WEB_CLIENT_ID = '519640762502-lufq8qo7djqjvtod5i4nr9211j2nmmkq.apps.googleusercontent.com';

const MALE_EPITHETS = [
  'ذاكر الآصال',
  'مهاجر إلى الله',
  'مسافر الأنوار',
  'مستمسك بالعروة',
  'تائب المحراب',
  'أواب السحَر',
  'ثابت العهد',
  'مستثمر الفردوس',
];

const FEMALE_EPITHETS = [
  'ذاكرة الآصال',
  'مهاجرة إلى الله',
  'مسافرة الأنوار',
  'مستمسكة بالعروة',
  'تائبة المحراب',
  'أوابه السحَر',
  'ثابتة العهد',
  'مستثمرة الفردوس',
];

export default function OnboardingModal() {
  const {
    setUserName,
    dismissWelcome,
    setGender,
    setEpithet,
    gender,
    showWelcome,
    loaded,
  } = useApp();

  const [step, setStep] = useState<'main' | 'gender' | 'epithetConfirm' | 'customName' | 'loading'>('main');
  const [pendingEpithet, setPendingEpithet] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [, , googlePromptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const pickRandomEpithet = useCallback((g: 'male' | 'female') => {
    const list = g === 'male' ? MALE_EPITHETS : FEMALE_EPITHETS;
    return list[Math.floor(Math.random() * list.length)];
  }, []);

  const handleSelectGender = useCallback((g: 'male' | 'female') => {
    setGender(g);
    setPendingEpithet(pickRandomEpithet(g));
    setStep('epithetConfirm');
  }, [setGender, pickRandomEpithet]);

  const handleConfirmEpithet = useCallback(() => {
    setEpithet(pendingEpithet);
    setUserName(pendingEpithet);
    dismissWelcome();
  }, [pendingEpithet, setEpithet, setUserName, dismissWelcome]);

  const handleRerollEpithet = useCallback(() => {
    if (!gender) return;
    setPendingEpithet(pickRandomEpithet(gender));
  }, [gender, pickRandomEpithet]);

  const handleSubmitCustomName = useCallback(() => {
    const trimmed = customNameInput.trim();
    if (trimmed.length >= 2) {
      setUserName(trimmed);
      dismissWelcome();
    }
  }, [customNameInput, setUserName, dismissWelcome]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setAuthLoading(true);
      setStep('loading');

      const result = await googlePromptAsync();

      if (result?.type !== 'success' || !result.params?.id_token) {
        setAuthLoading(false);
        setStep('main');
        return;
      }

      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      const displayName = userCredential.user.displayName || '';

      if (displayName) {
        setUserName(displayName);
      }

      await AsyncStorage.setItem('google_auth_uid', userCredential.user.uid);

      setAuthLoading(false);
      dismissWelcome();
    } catch {
      setAuthLoading(false);
      setStep('main');
    }
  }, [googlePromptAsync, setUserName, dismissWelcome]);

  const isCustomNameValid = customNameInput.trim().length >= 2;

  if (!loaded || !showWelcome) return null;

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
                <MaterialIcons name="person-outline" size={36} color={theme.gold} />
              </View>
              <Text style={styles.title}>مرحباً بك في محرابك</Text>
              <Text style={styles.subtitle}>اختر هويتك في رحلة اليقين</Text>

              <Pressable
                onPress={() => setStep('gender')}
                style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
              >
                <LinearGradient
                  colors={['#064E3B', '#0D7A5F']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <MaterialIcons name="stars" size={20} color="#FFF" />
                <Text style={styles.primaryBtnText}>اسم افتراضي نوراني</Text>
              </Pressable>

              <Pressable
                onPress={() => setStep('customName')}
                style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
              >
                <LinearGradient
                  colors={['#064E3B', '#0D7A5F']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <MaterialIcons name="edit" size={20} color="#FFF" />
                <Text style={styles.primaryBtnText}>تخصيص اسمي الخاص</Text>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>أو</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={handleGoogleSignIn}
                style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.7 }]}
              >
                <MaterialIcons name="email" size={20} color="#333" />
                <Text style={styles.googleBtnText}>الاتصال بحساب جيمايل</Text>
              </Pressable>
            </>
          )}

          {step === 'gender' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialIcons name="wc" size={36} color={theme.gold} />
              </View>
              <Text style={styles.title}>اختيار الهوية</Text>
              <Text style={styles.subtitle}>اختر نوعك لتحصل على اسم نوراني:</Text>

              <View style={styles.genderRow}>
                <Pressable
                  onPress={() => handleSelectGender('male')}
                  style={({ pressed }) => [styles.genderBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                >
                  <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
                  <MaterialIcons name="person" size={24} color="#FFF" />
                  <Text style={styles.primaryBtnText}>ذكر</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSelectGender('female')}
                  style={({ pressed }) => [styles.genderBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                >
                  <LinearGradient colors={['#7C3AED', '#6D28D9']} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
                  <MaterialIcons name="person-outline" size={24} color="#FFF" />
                  <Text style={styles.primaryBtnText}>أنثى</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => setStep('main')}
                style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.outlineBtnText}>رجوع</Text>
              </Pressable>
            </>
          )}

          {step === 'epithetConfirm' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialIcons name="stars" size={36} color={theme.gold} />
              </View>
              <Text style={styles.title}>اسمك النوراني</Text>
              <Text style={styles.subtitle}>اخترنا لك هذا الاسم:</Text>

              <View style={styles.epithetBox}>
                <Text style={styles.epithetText}>{pendingEpithet}</Text>
              </View>

              <View style={styles.epithetActions}>
                <Pressable
                  onPress={handleConfirmEpithet}
                  style={({ pressed }) => [styles.epithetBtnPrimary, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                >
                  <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
                  <MaterialIcons name="check-circle" size={18} color="#FFF" />
                  <Text style={styles.primaryBtnText}>موافق</Text>
                </Pressable>

                <Pressable
                  onPress={handleRerollEpithet}
                  style={({ pressed }) => [styles.epithetBtnSecondary, pressed && { opacity: 0.7 }]}
                >
                  <MaterialIcons name="shuffle" size={18} color="#064E3B" />
                  <Text style={styles.epithetBtnSecondaryText}>لقب آخر</Text>
                </Pressable>

                <Pressable
                  onPress={() => setStep('gender')}
                  style={({ pressed }) => [styles.epithetBtnSecondary, pressed && { opacity: 0.7 }]}
                >
                  <MaterialIcons name="arrow-right" size={18} color="#666" />
                  <Text style={[styles.epithetBtnSecondaryText, { color: '#666' }]}>رجوع</Text>
                </Pressable>
              </View>
            </>
          )}

          {step === 'customName' && (
            <>
              <View style={styles.iconCircle}>
                <MaterialIcons name="edit" size={36} color={theme.gold} />
              </View>
              <Text style={styles.title}>تخصيص الاسم</Text>
              <Text style={styles.subtitle}>اكتب اسمك الذي تفضله:</Text>

              <TextInput
                style={styles.input}
                placeholder="اكتب اسمك هنا..."
                placeholderTextColor="#999"
                value={customNameInput}
                onChangeText={setCustomNameInput}
                textAlign="right"
                autoFocus
              />

              <Pressable
                onPress={handleSubmitCustomName}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  !isCustomNameValid && styles.btnDisabled,
                  pressed && isCustomNameValid && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
                disabled={!isCustomNameValid}
              >
                <LinearGradient
                  colors={isCustomNameValid ? ['#064E3B', '#0D7A5F'] : ['#CCC', '#BBB']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <MaterialIcons name="check-circle" size={18} color="#FFF" />
                <Text style={styles.primaryBtnText}>موافق والتأكيد</Text>
              </Pressable>

              <Pressable
                onPress={() => setStep('main')}
                style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.outlineBtnText}>رجوع</Text>
              </Pressable>
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
  btnDisabled: {
    opacity: 0.6,
  },
  outlineBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: '#E0E0D8',
    marginTop: 4,
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0D8',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
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
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 8,
  },
  genderBtn: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  epithetBox: {
    width: '100%',
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16,185,129,0.3)',
    marginBottom: 16,
  },
  epithetText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#064E3B',
    writingDirection: 'rtl',
  },
  epithetActions: {
    width: '100%',
    gap: 8,
  },
  epithetBtnPrimary: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    overflow: 'hidden',
  },
  epithetBtnSecondary: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: '#E0E0D8',
  },
  epithetBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0D8',
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '600',
    color: '#064E3B',
    marginBottom: 14,
    writingDirection: 'rtl',
  },
});
