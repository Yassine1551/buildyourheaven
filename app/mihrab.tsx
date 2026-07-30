import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  StatusBar,
  Vibration,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { playTapSound, loadTapSound } from '../services/soundService';
import { useApp } from '../contexts/AppContext';
import { dhikrItems, formatArabicNumber } from '../services/mockData';
import { theme } from '../constants/theme';
import DhikrPlayer from '../components/DhikrPlayer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 176;
const STROKE_WIDTH = 8;

export default function MihrabScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incrementDhikr, soundEnabled, vibrationEnabled, toggleSound, toggleVibration, useWesternNumerals } = useApp();

  const item = useMemo(() => dhikrItems.find(d => d.id === id), [id]);
  if (!item) return null;

  // Session-based counter - starts at 0 each time
  const [sessionCount, setSessionCount] = useState(0);
  const isComplete = sessionCount >= item.targetCount;
  const progress = Math.min(sessionCount / item.targetCount, 1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShownForTarget, setCelebrationShownForTarget] = useState(false);

  const buttonScale = useSharedValue(1);

  const formatCountWithMarra = (count: number): string => {
    const num = formatArabicNumber(count, useWesternNumerals);
    if (count === 1) return 'مرة واحدة';
    if (count === 2) return 'مرتين';
    if (count >= 3 && count <= 10) return `${num} مرات`;
    return `${num} مرة`;
  };

  const handleShare = useCallback(() => {
    const appLink = 'https://play.google.com/store/apps/details?id=YOUR_APP_ID';
    const msg = `من قال :\n${item.dhikrText}\n${formatCountWithMarra(item.targetCount)}\n${item.fadl}\n\n📌 حمّل تطبيق ابنِ جنتك - صدقة جارية لك 👇\n${appLink}`;
    Share.share({ message: msg });
  }, [item, useWesternNumerals]);

  const [showDaleel, setShowDaleel] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadTapSound();
  }, []);

  const handleTap = () => {
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withSpring(1, { damping: 6, stiffness: 300 })
    );

    if (vibrationEnabled) {
      Vibration.vibrate(50);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (soundEnabled) {
      playTapSound();
    }

    // Increment session counter
    const newCount = sessionCount + 1;
    setSessionCount(newCount);

    // Increment global stats
    incrementDhikr(item.id, item.hasanatPerCount);

    // Show celebration when first reaching target, but don't block
    if (newCount >= item.targetCount && !celebrationShownForTarget) {
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowCelebration(true);
      setCelebrationShownForTarget(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };


  const confirmReset = () => {
    setSessionCount(0);
    setCelebrationShownForTarget(false);
    setShowResetModal(false);
    if (vibrationEnabled) Haptics.selectionAsync();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} translucent backgroundColor="transparent" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F5F0E8' }]} />

      <SafeAreaView edges={isFullscreen ? [] : ['top', 'bottom']} style={{ flex: 1 }}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}>
            <MaterialIcons name="close" size={24} color="#333" />
          </Pressable>
          <Text style={[styles.headerTitle, { color: item.color }]} numberOfLines={1}>{item.title.replace('\n', ' ')}</Text>
          <View style={styles.headerIcons}>
            {/* Fullscreen toggle */}
            <Pressable
              onPress={() => setIsFullscreen(prev => !prev)}
              style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.5 }]}
            >
              <MaterialIcons name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} size={20} color={isFullscreen ? '#10B981' : '#666'} />
            </Pressable>
            {/* Reset with single tap */}
            <Pressable
              onPress={() => setShowResetModal(true)}
              style={({ pressed }) => [styles.headerIconBtn, pressed && { backgroundColor: 'rgba(212,175,55,0.12)' }]}
            >
              <MaterialIcons name="refresh" size={20} color="#666" />
            </Pressable>
            <Pressable
              onPress={toggleSound}
              style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.5 }]}
            >
              <MaterialIcons
                name={soundEnabled ? 'volume-up' : 'volume-off'}
                size={20}
                color={soundEnabled ? '#666' : '#EF4444'}
              />
            </Pressable>
            <Pressable
              onPress={toggleVibration}
              style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.5 }]}
            >
              <MaterialIcons
                name={vibrationEnabled ? 'vibration' : 'smartphone'}
                size={20}
                color={vibrationEnabled ? '#666' : '#EF4444'}
              />
            </Pressable>
          </View>
        </Animated.View>

        <DhikrPlayer
          fadl={item.fadl}
          dhikrText={item.dhikrText}
          itemId={item.id}
          sessionCount={sessionCount}
          targetCount={item.targetCount}
          color={item.color}
          onTap={handleTap}
          onShowDalil={() => setShowDaleel(true)}
          onShare={handleShare}
          isComplete={isComplete}
          useWesternNumerals={useWesternNumerals}
          subMessage={isComplete ? 'أحسنت! أتممت الورد - واصل الذكر' : undefined}
          buttonScale={buttonScale}
        />
      </SafeAreaView>

      {/* Daleel Modal */}
      <Modal visible={showDaleel} transparent animationType="fade">
        <Pressable style={styles.daleelOverlay} onPress={() => setShowDaleel(false)}>
          <View />
        </Pressable>
        <View style={styles.daleelModalWrapper}>
          <View style={styles.daleelModal}>
            <Pressable onPress={() => setShowDaleel(false)} style={({ pressed }) => [styles.daleelCloseBtn, pressed && { opacity: 0.5 }]}>
              <MaterialIcons name="close" size={22} color="#999" />
            </Pressable>
            <View style={styles.daleelIconCircle}>
              <MaterialIcons name="menu-book" size={28} color={theme.gold} />
            </View>
            <Text style={styles.daleelModalTitle}>الدليل الشرعي</Text>
            <Text style={styles.daleelDhikrName}>{item.title.replace('\n', ' ')}</Text>
            <View style={styles.daleelHadithBadge}>
              <Text style={styles.daleelHadithBadgeText}>الحديث</Text>
            </View>
            <View style={styles.daleelContentCard}>
              <Text style={styles.daleelContentText}>{item.daleel}</Text>
            </View>
            <View style={styles.daleelSourceRow}>
              <Text style={styles.daleelSourceLabel}>الراوي / المصدر:</Text>
              <Text style={styles.daleelSourceValue}>{item.source}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Spiritual Reset Modal */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.resetOverlay}>
          <View style={styles.resetModal}>
            {/* Gold ornamental top */}
            <View style={styles.resetOrnament}>
              <LinearGradient
                colors={['rgba(212,175,55,0.2)', 'rgba(212,175,55,0.05)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
              />
              <View style={styles.resetOrnamentInner}>
                <MaterialIcons name="auto-awesome" size={32} color={theme.gold} />
              </View>
            </View>

            <Text style={styles.resetTitle}>تنبيه اليقين</Text>

            <View style={styles.resetMessageCard}>
              <Text style={styles.resetMessage}>
                {"عزيزي الباني لجنتك.. هذا التصفير يمس أرقام الشاشة الفانية فحسب؛ أما ما خطته أقلام الملائكة فثابت في صحائفك عند الكريم المنان، لا يمحوه ضغط زر، ولا ينساه ربٌ رحيم."}
              </Text>
            </View>

            {/* Action Buttons */}
            <Pressable
              onPress={confirmReset}
              style={({ pressed }) => [styles.resetConfirmBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient
                colors={['#064E3B', '#0D7A5F']}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
              <MaterialIcons name="restart-alt" size={20} color="#FFF" />
              <Text style={styles.resetConfirmText}>تصفير العداد الرقمي</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowResetModal(false)}
              style={({ pressed }) => [styles.resetCancelBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.resetCancelText}>العودة للذكر</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'rgba(245,240,232,0.95)',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    writingDirection: 'rtl',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fadlCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    alignItems: 'center',
    gap: 6,
  },
  fadlBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#064E3B',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fadlBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  fadlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  fadlCountRow: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
  },
  fadlCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8941E',
    writingDirection: 'rtl',
  },
  dhikrSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
  },
  dhikrText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 42,
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  counterGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseBg: {
    position: 'absolute',
    width: RING_SIZE + 40,
    height: RING_SIZE + 40,
    borderRadius: (RING_SIZE + 40) / 2,
    borderWidth: 2,
    alignSelf: 'center',
    top: -20,
  },
  counterPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNumber: {
    fontSize: 52,
    fontWeight: '800',
  },
  counterHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
    writingDirection: 'rtl',
  },
  floatingCelebration: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  celebrationContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 16,
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  completeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
    writingDirection: 'rtl',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  daleelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    overflow: 'hidden',
    backgroundColor: '#FFF8E7',
  },
  daleelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B8941E',
    writingDirection: 'rtl',
  },
  // Daleel Modal
  daleelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  daleelModalWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    pointerEvents: 'box-none',
  },
  daleelModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.3)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  daleelCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  daleelIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  daleelModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  daleelDhikrName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B8941E',
    writingDirection: 'rtl',
    marginBottom: 14,
  },
  daleelHadithBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#064E3B',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  daleelHadithBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  daleelContentCard: {
    width: '100%',
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  daleelContentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  daleelSourceRow: {
    alignItems: 'flex-end',
    width: '100%',
  },
  daleelSourceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    writingDirection: 'rtl',
  },
  daleelSourceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
    writingDirection: 'rtl',
  },
  // Spiritual Reset Modal
  resetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  resetModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 36,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.3)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  resetOrnament: {
    position: 'absolute',
    top: -32,
    width: 64,
    height: 64,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.gold,
    backgroundColor: '#FFF',
  },
  resetOrnamentInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginTop: 8,
    marginBottom: 16,
  },
  resetMessageCard: {
    width: '100%',
    backgroundColor: '#FFFEF5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  resetMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 28,
  },
  resetConfirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  resetConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  resetCancelBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.gold,
    backgroundColor: 'transparent',
  },
  resetCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  // Jawharat Special Rendering - ScrollView
  jawharatWrapper: {
    width: '100%',
    position: 'relative',
  },
  jawharatScrollBox: {
    maxHeight: 180,
    width: '100%',
  },
  jawharatScrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  jawharatFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    pointerEvents: 'none',
  },
  jawharatLine: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 28,
  },
  jawharatKeyword: {
    color: '#059669',
    fontWeight: '900',
  },
  jawharatTooltipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  jawharatTooltip: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
