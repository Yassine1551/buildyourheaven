import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
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
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { playTapSound, loadTapSound } from '../services/soundService';
import { useApp } from '../contexts/AppContext';
import { WirdDhikrItem } from '../services/personalWird';
import { formatArabicNumber } from '../services/mockData';
import { theme } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 145;
const STROKE_WIDTH = 6;

export default function WirdScreen() {
  const router = useRouter();
  const {
    wirdConfig,
    wirdCounts,
    incrementWirdDhikr,
    soundEnabled,
    vibrationEnabled,
    useWesternNumerals,
    fontSizeMap,
    setCardFontSize,
  } = useApp();

  const enabledItems = wirdConfig.filter(i => i.enabled);
  const reversedItems = [...enabledItems].reverse();

  const getWirdFont = (id: string, base: number) => fontSizeMap[`wird:${id}`] ?? base;
  const changeWirdFont = (id: string, delta: number, base: number) => {
    const next = Math.min(52, Math.max(16, getWirdFont(id, base) + delta));
    setCardFontSize(`wird:${id}`, next);
  };

  const [activeIndex, setActiveIndex] = useState<number | null>(reversedItems.length - 1);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const buttonScale = useSharedValue(1);
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

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    isAutoAdvancingRef.current = isAutoAdvancing;
  }, [isAutoAdvancing]);

  // Horizontal strip: native paging ScrollView handles swipes robustly on
  // Android while the vertical text ScrollView inside each card still scrolls.
  const stripScrollRef = useRef<ScrollView | null>(null);
  const pendingScrollRef = useRef<number | null>(null);
  const initializedStripRef = useRef(false);

  const scrollToIndex = (idx: number, animated = true) => {
    if (idx < 0 || idx >= reversedItems.length) return;
    if (stripScrollRef.current) {
      stripScrollRef.current.scrollTo({ x: idx * SCREEN_WIDTH, animated });
    } else {
      pendingScrollRef.current = idx;
    }
  };

  const navigateToItem = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= reversedItems.length) return;
    scrollToIndex(newIndex);
    activeIndexRef.current = newIndex;
    setActiveIndex(newIndex);
    setIsAutoAdvancing(false);
  };

  const handleOpenItem = (item: WirdDhikrItem) => {
    const idx = reversedItems.findIndex(d => d.id === item.id);
    if (idx < 0) return;
    scrollToIndex(idx, false);
    activeIndexRef.current = idx;
    setActiveIndex(idx);
    setIsAutoAdvancing(false);
  };

  const advanceToNext = useCallback(() => {
    if (activeIndex === null) return;
    const nextIndex = activeIndex - 1;
    if (nextIndex < 0) {
      router.back();
    } else {
      scrollToIndex(nextIndex);
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      setIsAutoAdvancing(false);
    }
  }, [activeIndex, router]);

  const handleTap = () => {
    if (activeIndex === null || isAutoAdvancing) return;
    const activeItem = reversedItems[activeIndex];

    buttonScale.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withSpring(1, { damping: 6, stiffness: 300 })
    );

    if (soundEnabled) {
      playTapSound();
    }

    const dailyCount = wirdCounts[activeItem.id] || 0;
    const newCount = dailyCount + 1;
    incrementWirdDhikr(activeItem.id);

    if (newCount >= activeItem.target && !completedItems.has(activeItem.id)) {
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCompletedItems(prev => new Set([...prev, activeItem.id]));

      setIsAutoAdvancing(true);
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNext();
      }, 600);
    }
  };

  const totalItems = reversedItems.length;
  const completedCount = reversedItems.filter(i => (wirdCounts[i.id] || 0) >= i.target).length;
  const overallProgress = activeIndex !== null ? (totalItems - activeIndex) / totalItems : 0;

  const activeItem = activeIndex !== null ? reversedItems[activeIndex] : null;
  const activeProgress = activeItem ? Math.min((wirdCounts[activeItem.id] || 0) / activeItem.target, 1) : 0;
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - activeProgress * circumference;

  if (totalItems === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#021A13', '#064E3B', '#021A13']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerProgress}>0/0</Text>
            </View>
            <Text style={styles.headerTitle}>وردي الخاص</Text>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}>
              <MaterialIcons name="close" size={24} color="#FFF" />
            </Pressable>
          </View>
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="favorite-border" size={40} color={theme.gold} />
            </View>
            <Text style={styles.emptyTitle}>لم تُفعّل أذكاراً بعد</Text>
            <Text style={styles.emptyText}>
              فعّل أذكار وردك من إعدادات «وردي الخاص» على الشاشة الرئيسية ثم عد إلى هنا.
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.emptyBtnText}>العودة للرئيسية</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#021A13', '#064E3B', '#021A13']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerProgress}>
              {formatArabicNumber(completedCount, useWesternNumerals)}/{formatArabicNumber(totalItems, useWesternNumerals)}
            </Text>
          </View>
          <Text style={styles.headerTitle}>وردي الخاص</Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]}>
            <MaterialIcons name="close" size={24} color="#FFF" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgressFill, { width: `${Math.max(overallProgress * 100, 1)}%` }]} />
        </View>

        {activeItem ? (
          /* native horizontal pager so swipes always work on Android while
             the vertical text ScrollView inside each card still scrolls */
          <ScrollView
            ref={stripScrollRef}
            style={styles.counterViewport}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onLayout={() => {
              if (!initializedStripRef.current) {
                initializedStripRef.current = true;
                const target = pendingScrollRef.current ?? activeIndexRef.current;
                pendingScrollRef.current = null;
                if (target != null && target > 0) {
                  stripScrollRef.current?.scrollTo({ x: target * SCREEN_WIDTH, animated: false });
                }
              }
            }}
            onScrollBeginDrag={() => {
              if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
                autoAdvanceTimerRef.current = null;
              }
              setIsAutoAdvancing(false);
            }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              if (idx >= 0 && idx < reversedItems.length && idx !== activeIndexRef.current) {
                activeIndexRef.current = idx;
                setActiveIndex(idx);
                setIsAutoAdvancing(false);
              }
            }}
          >
            <View style={styles.stripContainer}>
              {reversedItems.map((item, idx) => {
                const isCenter = idx === activeIndex;
                const dailyCount = wirdCounts[item.id] || 0;
                return (
                  <View key={item.id} style={styles.stripCard}>
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
                          <View style={styles.targetBar}>
                            <Text style={styles.targetIndicator}>
                              العدد المنشود: {formatArabicNumber(item.target, useWesternNumerals)}
                            </Text>
                            <View style={styles.fontCol} pointerEvents="box-none">
                              <Pressable onPress={() => changeWirdFont(item.id, -2, item.smallText ? 20 : 26)} style={({ pressed }) => [styles.fontBtn, pressed && { opacity: 0.5 }]} hitSlop={4}>
                                <Text style={styles.fontBtnText}>A−</Text>
                              </Pressable>
                              <Pressable onPress={() => changeWirdFont(item.id, 2, item.smallText ? 20 : 26)} style={({ pressed }) => [styles.fontBtn, pressed && { opacity: 0.5 }]} hitSlop={4}>
                                <Text style={styles.fontBtnText}>A+</Text>
                              </Pressable>
                            </View>
                          </View>
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
                        <Text style={styles.fadlText} numberOfLines={2}>
                          {!item.hideFadl && (item.fadl ?? 'وردٌ يومي في طاعة الله، يصفّر مع كل يوم جديد')}
                        </Text>
                      </View>

                      <View style={styles.dhikrTextCard}>
                        <ScrollView
                          style={styles.dhikrTextScroll}
                          contentContainerStyle={styles.dhikrTextScrollContent}
                          showsVerticalScrollIndicator={true}
                          indicatorStyle="white"
                          nestedScrollEnabled
                        >
                          {item.keyword ? (
                            <View style={styles.countedWrapper}>
                              {item.text.split('،').map((part, i) => {
                                const trimmed = part.trim();
                                if (!trimmed) return null;
                                const isSmall = item.smallText;
                                const hasKeyword = trimmed.includes(item.keyword!);
                                const rest = hasKeyword
                                  ? trimmed.slice(trimmed.indexOf(item.keyword!) + item.keyword!.length)
                                  : '';
                                const isShort = rest.length > 0 && rest.length <= 16;
                                const fz = fontSizeMap[`wird:${item.id}`];
                                const kwBump = fz ? { fontSize: fz, lineHeight: Math.max(20, Math.round(fz * 1.45)) } : undefined;
                                const restBump = fz ? { fontSize: Math.max(12, Math.round(fz * 0.85)), lineHeight: Math.max(20, Math.round(fz * 1.45)) } : undefined;
                                const keywordStyle = isSmall
                                  ? isShort
                                    ? styles.countedKeywordXL
                                    : styles.countedKeywordSmall
                                  : styles.countedKeyword;
                                const restStyle = isSmall
                                  ? isShort
                                    ? styles.countedRestXL
                                    : styles.countedRestSmall
                                  : styles.countedRest;
                                return (
                                  <Text key={i} style={styles.countedLine}>
                                    <Text style={[keywordStyle, kwBump]}>
                                      {hasKeyword ? trimmed.slice(0, trimmed.indexOf(item.keyword!) + item.keyword!.length) : trimmed}
                                    </Text>
                                    {hasKeyword && (
                                      <Text style={[restStyle, restBump]}>{rest}</Text>
                                    )}
                                  </Text>
                                );
                              })}
                            </View>
                          ) : (
                            <Text style={[
                              item.smallText ? styles.dhikrTextSmall : styles.dhikrText,
                              fontSizeMap[`wird:${item.id}`] ? { fontSize: fontSizeMap[`wird:${item.id}`], lineHeight: Math.max(22, Math.round(fontSizeMap[`wird:${item.id}`] * 1.6)) } : null,
                            ]}>{item.text}</Text>
                          )}
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
                              stroke={dailyCount >= item.target ? '#10B981' : theme.gold}
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
                              {formatArabicNumber(isCenter ? dailyCount : 0, useWesternNumerals)}
                            </Text>
                            <Text style={styles.counterTarget}>
                              / {formatArabicNumber(item.target, useWesternNumerals)}
                            </Text>
                          </View>
                        </Animated.View>
                      </Pressable>

                      <View style={styles.completeBadgeReserved}>
                        {dailyCount >= item.target ? (
                          <View style={styles.completeBanner}>
                            <MaterialIcons name="check-circle" size={16} color="#10B981" />
                            <Text style={styles.completeText}>
                              {isCenter && isAutoAdvancing ? 'التالي...' : 'أتممت وردك اليوم ✓'}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            {enabledItems.map((item, index) => {
              const isCompleted = (wirdCounts[item.id] || 0) >= item.target;

              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 40).duration(400)}>
                  <Pressable
                    onPress={() => handleOpenItem(item)}
                    style={({ pressed }) => [
                      styles.adhkarCard,
                      isCompleted && styles.adhkarCardCompleted,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <View style={styles.adhkarCardContent}>
                      <View style={[styles.statusDot, isCompleted && styles.statusDotCompleted]}>
                        {isCompleted ? (
                          <MaterialIcons name="check" size={14} color="#FFF" />
                        ) : (
                          <Text style={styles.statusNumber}>{formatArabicNumber(index + 1, useWesternNumerals)}</Text>
                        )}
                      </View>

                      <View style={styles.adhkarTextContent}>
                        <Text style={styles.adhkarTitle}>{item.title}</Text>
                        <View style={styles.adhkarMeta}>
                          <Text style={styles.adhkarTarget}>
                            {isCompleted ? 'مكتمل ✓' : `(العدد المنشود: ${formatArabicNumber(item.target, useWesternNumerals)})`}
                          </Text>
                        </View>
                      </View>

                      <MaterialIcons name="chevron-left" size={22} color={isCompleted ? '#10B981' : 'rgba(255,255,255,0.3)'} />
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021A13',
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
    color: theme.gold,
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
    backgroundColor: theme.gold,
    borderRadius: 2,
  },
  stripContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  stripCard: {
    width: SCREEN_WIDTH,
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
    alignItems: 'flex-start',
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
    height: 82,
    justifyContent: 'flex-start',
  },
  activeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 28,
  },
  targetIndicator: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: 6,
  },
  fadlRow: {
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fadlText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  dhikrTextCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    width: '100%',
  },
  dhikrTextScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dhikrTextScrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1,
    paddingBottom: 16,
  },
  dhikrText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 42,
  },
  dhikrTextSmall: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 32,
  },
  targetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 6,
    minHeight: 26,
    position: 'relative',
  },
  fontCol: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    gap: 6,
  },
  fontBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E4E4E7',
    writingDirection: 'ltr',
  },
  countedWrapper: {
    alignSelf: 'stretch',
    gap: 6,
    paddingHorizontal: 0,
  },
  countedLine: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E4E4E7',
    textAlign: 'right',
    writingDirection: 'rtl',
    width: '100%',
    lineHeight: 24,
    paddingHorizontal: 0,
  },
  countedKeyword: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4ADE80',
    writingDirection: 'rtl',
    lineHeight: 28,
  },
  countedRest: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E4E4E7',
    writingDirection: 'rtl',
    lineHeight: 28,
  },
  countedKeywordSmall: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4ADE80',
    writingDirection: 'rtl',
    lineHeight: 25,
  },
  countedRestSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E4E4E7',
    writingDirection: 'rtl',
    lineHeight: 25,
  },
  countedKeywordXL: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4ADE80',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  countedRestXL: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E4E4E7',
    writingDirection: 'rtl',
    lineHeight: 26,
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
    fontSize: 38,
    fontWeight: '800',
    color: theme.gold,
  },
  counterTarget: {
    fontSize: 14,
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },
  adhkarCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
  },
  adhkarCardCompleted: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.2)',
  },
  adhkarCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  statusDotCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.gold,
  },
  adhkarTextContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  adhkarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  adhkarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  adhkarTarget: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textMuted,
    writingDirection: 'rtl',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    writingDirection: 'rtl',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.gold,
    writingDirection: 'rtl',
  },
});
