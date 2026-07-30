import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { playTapSound, loadTapSound } from '../services/soundService';
import { useApp } from '../contexts/AppContext';
import { wakeupAdhkarItems, WakeupDhikrItem } from '../services/wakeupAdhkar';
import { calculateAndApplyRewards, getLetterCount } from '../services/rewardEngine';
import { formatArabicNumber } from '../services/mockData';
import { theme } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 110;
const STROKE_WIDTH = 5;
const SWIPE_THRESHOLD = 50;

export default function WakeupAdhkarScreen() {
  const router = useRouter();
  const {
    wakeupCounts,
    incrementWakeupDhikr,
    completeWakeupDhikr,
    soundEnabled,
    vibrationEnabled,
    useWesternNumerals,
  } = useApp();

  const reversedItems = [...wakeupAdhkarItems].reverse();

  const [activeIndex, setActiveIndex] = useState<number | null>(reversedItems.length - 1);
  const [sessionCount, setSessionCount] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [showDalilModal, setShowDalilModal] = useState(false);
  const [dalilItem, setDalilItem] = useState<WakeupDhikrItem | null>(null);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const buttonScale = useSharedValue(1);
  const slideX = useSharedValue(-(reversedItems.length - 1) * SCREEN_WIDTH);
  const startX = useSharedValue(0);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndexRef = useRef<number | null>(reversedItems.length - 1);
  const isAutoAdvancingRef = useRef(false);

  useEffect(() => {
    loadTapSound();
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const stripAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  // Keep refs in sync with state
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    isAutoAdvancingRef.current = isAutoAdvancing;
  }, [isAutoAdvancing]);

  // Horizontal strip PanResponder: drag reveals adjacent cards
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 40,
      onPanResponderGrant: () => {
        startX.value = slideX.value;
      },
      onPanResponderMove: (_, g) => {
        slideX.value = startX.value + g.dx * 0.6;
      },
      onPanResponderRelease: (_, g) => {
        const currentIndex = activeIndexRef.current;
        if (currentIndex === null || isAutoAdvancingRef.current) return;

        let newIndex = currentIndex;
        if (g.dx > SWIPE_THRESHOLD && currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else if (g.dx < -SWIPE_THRESHOLD && currentIndex < reversedItems.length - 1) {
          newIndex = currentIndex + 1;
        }

        if (newIndex !== currentIndex) {
          slideX.value = withTiming(-newIndex * SCREEN_WIDTH, { duration: 180 });
          setTimeout(() => {
            activeIndexRef.current = newIndex;
            setActiveIndex(newIndex);
            setSessionCount(0);
            setIsAutoAdvancing(false);
          }, 180);
        } else {
          slideX.value = withSpring(-currentIndex * SCREEN_WIDTH, { damping: 18, stiffness: 220 });
        }
      },
      onPanResponderTerminate: () => {
        const idx = activeIndexRef.current;
        if (idx !== null) {
          slideX.value = withSpring(-idx * SCREEN_WIDTH, { damping: 18, stiffness: 220 });
        }
      },
    })
  ).current;

  const navigateToItem = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= reversedItems.length) return;
    slideX.value = withTiming(-newIndex * SCREEN_WIDTH, { duration: 180 });
    setTimeout(() => {
      setActiveIndex(newIndex);
      setSessionCount(0);
      setIsAutoAdvancing(false);
    }, 180);
  };

  // Auto-advance logic
  const advanceToNext = useCallback(() => {
    if (activeIndex === null) return;
    const nextIndex = activeIndex - 1;
    if (nextIndex < 0) {
      router.back();
    } else {
      slideX.value = withTiming(-nextIndex * SCREEN_WIDTH, { duration: 180 });
      setTimeout(() => {
        setActiveIndex(nextIndex);
        setSessionCount(0);
        setIsAutoAdvancing(false);
      }, 180);
    }
  }, [activeIndex, router]);

  const handleTap = () => {
    if (activeIndex === null || isAutoAdvancing) return;
    const activeItem = reversedItems[activeIndex];

    buttonScale.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withSpring(1, { damping: 6, stiffness: 300 })
    );

    // Per-tap haptic removed: Smart Haptics fire only on target hit & global multiples of 100
    if (soundEnabled) {
      playTapSound();
    }

    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    incrementWakeupDhikr(activeItem.id);

    if (newCount >= activeItem.target && !completedItems.has(activeItem.id)) {
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCompletedItems(prev => new Set([...prev, activeItem.id]));
      completeWakeupDhikr(activeItem.id);

      setIsAutoAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNext();
      }, 600);
    }
  };

  const handleShowDalil = (item: WakeupDhikrItem) => {
    setDalilItem(item);
    setShowDalilModal(true);
  };

  const totalCompleted = completedItems.size;
  const totalItems = reversedItems.length;
  const overallProgress = activeIndex !== null ? (totalItems - activeIndex) / totalItems : 0;

  const activeItem = activeIndex !== null ? reversedItems[activeIndex] : null;
  const activeProgress = activeItem ? Math.min(sessionCount / activeItem.target, 1) : 0;
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - activeProgress * circumference;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A0A00', '#3D1F00', '#1A0A00']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerProgress}>
              {formatArabicNumber(totalCompleted, useWesternNumerals)}/{formatArabicNumber(totalItems, useWesternNumerals)}
            </Text>
          </View>
          <Text style={styles.headerTitle}>أذكار الاستيقاظ</Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}>
            <MaterialIcons name="close" size={24} color="#FFF" />
          </Pressable>
        </View>

        {/* Progress Bar - RTL: fills from right to left */}
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgressFill, { width: `${Math.max(overallProgress * 100, 1)}%` }]} />
        </View>

        {activeItem ? (
          /* Counter View - Horizontal strip for smooth wheel-like swipe */
          <View style={[styles.counterViewport, { overflow: 'hidden' }]} {...panResponder.panHandlers}>
            <Animated.View style={[styles.stripContainer, stripAnimStyle]}>
              {reversedItems.map((item, idx) => {
                const isCenter = idx === activeIndex;
                return (
                  <View key={item.id} style={styles.stripCard}>
                    {/* Top Section */}
                    <View style={styles.topSection}>
                      <View style={styles.counterHeaderRow}>
                        <Pressable
                          onPress={() => navigateToItem(idx + 1)}
                          style={({ pressed }) => [styles.navArrowBtn, pressed && { opacity: 0.4 }]}
                          disabled={idx >= reversedItems.length - 1}
                        >
                          <MaterialIcons name="chevron-left" size={18} color={'rgba(255,255,255,0.3)'} />
                        </Pressable>

                        <View style={styles.titleCenter}>
                          <Text style={styles.activeTitle} numberOfLines={2}>{item.title}</Text>
                          <Text style={styles.targetIndicator}>
                            العدد المطلوب: {formatArabicNumber(item.target, useWesternNumerals)}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => navigateToItem(idx - 1)}
                          style={({ pressed }) => [styles.navArrowBtn, pressed && { opacity: 0.4 }]}
                          disabled={idx <= 0}
                        >
                          <MaterialIcons name="chevron-right" size={18} color={'rgba(255,255,255,0.3)'} />
                        </Pressable>
                      </View>

                      <View style={styles.fadlRow}>
                        <Text style={styles.fadlText}>{item.fadl}</Text>
                      </View>

                      {item.isQuran ? (
                        <View style={styles.hasanatBadgeRow}>
                          <View style={styles.quranBadgeInline}>
                            <MaterialIcons name="auto-awesome" size={12} color="#F59E0B" />
                            <Text style={styles.quranBadgeInlineText}>
                              {formatArabicNumber(getLetterCount(item.text) * 10, useWesternNumerals)} حسنة لكل مرة
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      <View style={styles.dhikrTextCard}>
                        <ScrollView
                          style={styles.dhikrTextScroll}
                          contentContainerStyle={styles.dhikrTextScrollContent}
                          showsVerticalScrollIndicator={true}
                          indicatorStyle="white"
                          nestedScrollEnabled
                        >
                          <Text style={styles.dhikrText}>{item.text}</Text>
                        </ScrollView>
                      </View>
                    </View>

                    <View style={styles.bottomSection}>
                      <Pressable onPress={isCenter ? handleTap : undefined} disabled={!isCenter || isAutoAdvancing}>
                        <Animated.View style={[styles.counterWrapper, isCenter ? buttonAnimStyle : undefined]}>
                          <Svg width={RING_SIZE} height={RING_SIZE}>
                            <Circle
                              cx={RING_SIZE / 2}
                              cy={RING_SIZE / 2}
                              r={radius}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth={STROKE_WIDTH}
                              fill="none"
                            />
                            <Circle
                              cx={RING_SIZE / 2}
                              cy={RING_SIZE / 2}
                              r={radius}
                              stroke={completedItems.has(item.id) ? '#10B981' : '#F59E0B'}
                              strokeWidth={STROKE_WIDTH}
                              strokeDasharray={circumference}
                              strokeDashoffset={isCenter ? strokeDashoffset : circumference}
                              strokeLinecap="round"
                              fill="none"
                              rotation="-90"
                              origin={`${RING_SIZE / 2},${RING_SIZE / 2}`}
                            />
                          </Svg>
                          <View style={styles.counterInner}>
                            <Text style={styles.counterNumber}>
                              {formatArabicNumber(isCenter ? sessionCount : 0, useWesternNumerals)}
                            </Text>
                            <Text style={styles.counterTarget}>
                              / {formatArabicNumber(item.target, useWesternNumerals)}
                            </Text>
                          </View>
                        </Animated.View>
                      </Pressable>

                      <View style={styles.completeBadgeReserved}>
                        {completedItems.has(item.id) ? (
                          <View style={styles.completeBanner}>
                            <MaterialIcons name="check-circle" size={16} color="#10B981" />
                            <Text style={styles.completeText}>
                              {isCenter && isAutoAdvancing ? 'التالي...' : 'أتممت هذا الذكر'}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Pressable
                        onPress={() => handleShowDalil(item)}
                        style={({ pressed }) => [styles.dalilBtn, pressed && { opacity: 0.7 }]}
                      >
                        <MaterialIcons name="info-outline" size={16} color="#F59E0B" />
                        <Text style={styles.dalilBtnText}>الدليل الشرعي</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          </View>
        ) : null}
      </SafeAreaView>

      {/* Dalil Modal */}
      <Modal visible={showDalilModal} transparent animationType="fade">
        <Pressable style={styles.dalilOverlay} onPress={() => setShowDalilModal(false)}>
          <View />
        </Pressable>
        <View style={styles.dalilModalWrapper}>
          <View style={styles.dalilModal}>
            <Pressable onPress={() => setShowDalilModal(false)} style={({ pressed }) => [styles.dalilCloseBtn, pressed && { opacity: 0.5 }]}>
              <MaterialIcons name="close" size={22} color="#999" />
            </Pressable>
            <View style={styles.dalilIconCircle}>
              <MaterialIcons name="menu-book" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.dalilModalTitle}>الدليل الشرعي</Text>
            {dalilItem ? (
              <>
                <Text style={styles.dalilDhikrName}>{dalilItem.title}</Text>
                <View style={styles.dalilContentCard}>
                  <Text style={styles.dalilContentText}>{dalilItem.dalil}</Text>
                </View>
                {dalilItem.isQuran ? (
                  <View style={styles.dalilQuranInfo}>
                    <MaterialIcons name="auto-awesome" size={14} color="#F59E0B" />
                    <Text style={styles.dalilQuranText}>
                      عدد الحروف: {getLetterCount(dalilItem.text)} حرف × 10 = {getLetterCount(dalilItem.text) * 10} حسنة لكل مرة
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0A00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerProgress: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallProgressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  stripContainer: {
    flexDirection: 'row',
    height: '100%',
    gap: 10,
  },
  stripCard: {
    width: SCREEN_WIDTH - 10,
    flexShrink: 0,
    paddingHorizontal: 16,
  },
  counterViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  counterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 4,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 30,
  },
  targetIndicator: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: 4,
  },
  fadlRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  fadlText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 30,
  },
  hasanatBadgeRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  quranBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  quranBadgeInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  dhikrTextCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    minHeight: 80,
  },
  dhikrTextScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dhikrTextScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingBottom: 16,
  },
  dhikrText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 34,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 4,
    paddingTop: 8,
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
  },
  counterNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F59E0B',
  },
  counterTarget: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
  },
  completeBadgeReserved: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  completeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
    writingDirection: 'rtl',
  },
  dalilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  dalilBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
    writingDirection: 'rtl',
  },
  dalilOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  dalilModalWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    pointerEvents: 'box-none',
  },
  dalilModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245,158,11,0.3)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  dalilCloseBtn: {
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
  dalilIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dalilModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  dalilDhikrName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  dalilContentCard: {
    width: '100%',
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.15)',
  },
  dalilContentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  dalilQuranInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    width: '100%',
  },
  dalilQuranText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
