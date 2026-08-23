import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  I18nManager,
  LayoutChangeEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { TOUR_STEPS, TOUR_TARGETS, TourRect } from '../constants/tour';

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');
const PAD = 4;
const TIP_WIDTH = Math.min(WIN_W - 20, 330);
const DIM = 'rgba(0,0,0,0.5)';
const AUTO_ADVANCE_MS = 5000;
const TAB_H = 60;
const TAB_COUNT = 4;
const TAB_INDEX: Record<string, number> = {
  [TOUR_TARGETS.badges]: 1,
  [TOUR_TARGETS.notifications]: 2,
  [TOUR_TARGETS.rankings]: 3,
};

const SCREEN_PATHS: Record<string, string> = {
  [TOUR_TARGETS.badges]: '/badges',
  [TOUR_TARGETS.notifications]: '/notifications',
  [TOUR_TARGETS.rankings]: '/rankings',
};

function sameRect(a: TourRect | null | undefined, b: TourRect | null | undefined) {
  return !!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

function Mask({
  rect,
  width,
  height,
  bottomReserve,
}: {
  rect: TourRect;
  width: number;
  height: number;
  bottomReserve: number;
}) {
  const x = Math.max(0, rect.x - PAD);
  const y = Math.max(0, rect.y - PAD);
  const w = rect.width + PAD * 2;
  const h = rect.height + PAD * 2;
  const right = x + w;
  const bottom = y + h;
  const bottomLimit = height - bottomReserve;
  const bottomH = Math.max(0, bottomLimit - bottom);

  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height: y, backgroundColor: DIM }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: y, width: x, height: h, backgroundColor: DIM }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: right, top: y, width: Math.max(0, width - right), height: h, backgroundColor: DIM }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: bottom, width, height: bottomH, backgroundColor: DIM }} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: 'rgba(212,175,55,0.95)',
        }}
      />
    </>
  );
}

export default function OnboardingTour({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { tourRects, setTourRects, requestTourMeasure, tourRoot } = useApp();
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isFinal = current.target === null;

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;
  const lastAppliedKey = useRef<string | null>(null);
  const lastRect = useRef<TourRect | null>(null);

  const [displayRect, setDisplayRect] = useState<TourRect | null>(null);
  const [pendingRect, setPendingRect] = useState(false);
  const [awaitingTab, setAwaitingTab] = useState(false);
  const [tipH, setTipH] = useState(180);

  useEffect(() => {
    Animated.timing(containerOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    return () => {
      setTourRects({});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyRect = useCallback(
    (rect: TourRect, withTooltip = true) => {
      setDisplayRect(rect);
      setPendingRect(false);
      if (withTooltip) {
        Animated.sequence([
          Animated.timing(tooltipAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(tooltipAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();
      }
    },
    [tooltipAnim],
  );

  const finishTour = useCallback(() => {
    router.navigate('/' as never);
    onClose();
  }, [router, onClose]);

  const getTabIconRect = useCallback(
    (target: string): TourRect => {
      const rootW = tourRoot ? tourRoot.width : WIN_W;
      const rootH = tourRoot ? tourRoot.height : WIN_H;
      const iconW = rootW / TAB_COUNT;
      const orderIndex = TAB_INDEX[target] ?? 0;
      const rtlIndex = I18nManager.isRTL ? TAB_COUNT - 1 - orderIndex : orderIndex;
      return { x: rtlIndex * iconW, y: rootH - (insets.bottom + TAB_H), width: iconW, height: TAB_H };
    },
    [tourRoot, insets.bottom],
  );

  const goNext = useCallback(() => {
    if (awaitingTab) return;
    if (isFinal) {
      finishTour();
      return;
    }
    setStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1));
  }, [awaitingTab, isFinal, finishTour]);

  useEffect(() => {
    if (isFinal) {
      Animated.sequence([
        Animated.timing(tooltipAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(tooltipAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      return;
    }
    const target = current.target;
    if (!target) return;
    const path = SCREEN_PATHS[target];
    if (path && pathname !== path) {
      setAwaitingTab(true);
      setPendingRect(true);
      applyRect(getTabIconRect(target), true);
      return;
    }
    setAwaitingTab(false);
    setPendingRect(true);
    const t1 = setTimeout(() => requestTourMeasure(target), 400);
    const t2 = setTimeout(() => requestTourMeasure(target), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step, isFinal, requestTourMeasure, current.target, tooltipAnim, pathname, applyRect, getTabIconRect]);

  useEffect(() => {
    if (pendingRect && !isFinal) {
      const t = setTimeout(
        () => setStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1)),
        5000,
      );
      return () => clearTimeout(t);
    }
  }, [pendingRect, isFinal, step]);

  useEffect(() => {
    if (pendingRect || awaitingTab || isFinal || !displayRect || current.manual) return;
    const t = setTimeout(goNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [step, pendingRect, awaitingTab, isFinal, displayRect, goNext, current.manual]);

  useEffect(() => {
    const target = current.target;
    if (!target) return;
    if (target === TOUR_TARGETS.tabBar) {
      const rootW = tourRoot ? tourRoot.width : WIN_W;
      const rootH = tourRoot ? tourRoot.height : WIN_H;
      const rect = { x: 0, y: rootH - (insets.bottom + TAB_H), width: rootW, height: TAB_H };
      if (lastAppliedKey.current !== target || !sameRect(lastRect.current, rect)) {
        const isCorrection = lastAppliedKey.current === target;
        lastAppliedKey.current = target;
        lastRect.current = rect;
        applyRect(rect, !isCorrection);
      }
      return;
    }
    const rect = tourRects[target];
    if (rect && (lastAppliedKey.current !== target || !sameRect(lastRect.current, rect))) {
      const isCorrection = lastAppliedKey.current === target;
      lastAppliedKey.current = target;
      lastRect.current = rect;
      applyRect(rect, !isCorrection);
    }
  }, [tourRects, current.target, isFinal, insets.bottom, applyRect, tourRoot]);

  const computeTipTop = () => {
    if (!displayRect) return insets.top + 80;
    const below = displayRect.y + displayRect.height + 18;
    const above = displayRect.y - tipH - 18;
    const desired = displayRect.y < WIN_H / 2 ? below : above;
    return Math.min(Math.max(desired, insets.top + 8), WIN_H - tipH - 10);
  };

  const computeTipLeft = () => {
    if (!displayRect) return (WIN_W - TIP_WIDTH) / 2;
    const cx = displayRect.x + displayRect.width / 2 - TIP_WIDTH / 2;
    return Math.min(Math.max(cx, 8), WIN_W - TIP_WIDTH - 8);
  };

  const showMask = !!displayRect && !pendingRect && !isFinal;
  const showTooltip = !!displayRect && !pendingRect && !isFinal;
  const dimDuringPending = !isFinal && (pendingRect || !displayRect);
  const bottomReserve = insets.bottom + 60;

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]} pointerEvents="box-none">
      <Pressable
        style={awaitingTab ? [StyleSheet.absoluteFill, { bottom: bottomReserve }] : StyleSheet.absoluteFill}
        onPress={goNext}
      />

      {dimDuringPending && (
        <View style={[styles.fullDim, { bottom: bottomReserve }]} pointerEvents="none" />
      )}

      {showMask && (
        <Mask rect={displayRect!} width={WIN_W} height={WIN_H} bottomReserve={bottomReserve} />
      )}

      {showTooltip && (
        <Animated.View
          style={[
            styles.tip,
            {
              width: TIP_WIDTH,
              left: computeTipLeft(),
              top: computeTipTop(),
              opacity: tooltipAnim,
              transform: [
                {
                  translateY: tooltipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
          onLayout={(e: LayoutChangeEvent) => setTipH(e.nativeEvent.layout.height)}
        >
          <View style={styles.tipHeader}>
            <View style={styles.tipChip}>
              <Text style={styles.tipChipText}>{current.chip}</Text>
            </View>
            <Text style={styles.tipTitle}>{current.title}</Text>
          </View>
          {awaitingTab ? (
            <View style={styles.tapHintWrap}>
              <MaterialIcons name="touch-app" size={20} color="#D4AF37" />
              <Text style={styles.tapHintText}>{current.tapHint}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.tipBody}>{current.body}</Text>
              <Pressable
                onPress={goNext}
                style={({ pressed }) => [styles.tipNext, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.tipNextText}>التالي</Text>
                <MaterialIcons name="arrow-back-ios" size={16} color="#021A13" />
              </Pressable>
            </>
          )}
        </Animated.View>
      )}

      {isFinal && (
        <View style={styles.finalWrap} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.finalCard,
              {
                opacity: tooltipAnim,
                transform: [
                  {
                    translateY: tooltipAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.finalIcon}>
              <MaterialIcons name="rocket-launch" size={42} color="#D4AF37" />
            </View>
            <Text style={styles.finalTitle}>{current.title}</Text>
            <Text style={styles.finalBody}>{current.body}</Text>
            <Pressable
              onPress={finishTour}
              style={({ pressed }) => [styles.finalBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.finalBtnText}>ابدأ التطبيق</Text>
              <MaterialIcons name="arrow-back-ios" size={18} color="#021A13" />
            </Pressable>
          </Animated.View>
        </View>
      )}

      <Pressable
        onPress={finishTour}
        style={({ pressed }) => [
          styles.skipBtn,
          { top: insets.top + 58 },
          pressed && { opacity: 0.6 },
        ]}
        hitSlop={10}
      >
        <Text style={styles.skipText}>تخطي الكل</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
    elevation: 998,
  },
  fullDim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DIM,
  },
  tip: {
    position: 'absolute',
    backgroundColor: '#FFFDF5',
    borderRadius: 18,
    padding: 18,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  tipChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipChipText: {
    color: '#021A13',
    fontSize: 15,
    fontWeight: '800',
  },
  tipTitle: {
    flex: 1,
    color: '#064E3B',
    fontSize: 18,
    fontWeight: '800',
  },
  tipBody: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 14,
  },
  tapHintWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  tapHintText: {
    flex: 1,
    color: '#334155',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
  },
  tipNext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    borderRadius: 24,
    paddingVertical: 12,
  },
  tipNextText: {
    color: '#021A13',
    fontSize: 16,
    fontWeight: '800',
  },
  finalWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  finalCard: {
    width: '100%',
    backgroundColor: '#FFFDF5',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  finalIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  finalTitle: {
    color: '#064E3B',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  finalBody: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  finalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  finalBtnText: {
    color: '#021A13',
    fontSize: 17,
    fontWeight: '800',
  },
  skipBtn: {
    position: 'absolute',
    right: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.5)',
    borderRadius: 20,
    zIndex: 999,
  },
  skipText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
});
