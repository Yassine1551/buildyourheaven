import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  FadeIn,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../constants/theme';
import { formatArabicNumber } from '../services/mockData';

const RING_SIZE = 176;
const STROKE_WIDTH = 8;

interface DhikrPlayerProps {
  dhikrText: string;
  fadl?: string;
  itemId: string;
  sessionCount: number;
  targetCount: number;
  color: string;
  onTap: () => void;
  onShowDalil: () => void;
  onShare: () => void;
  isComplete: boolean;
  useWesternNumerals: boolean;
  subMessage?: string;
  isAutoAdvancing?: boolean;
  isQuran?: boolean;
  letterCount?: number;
  buttonScale: SharedValue<number>;
  fontSizeReduction?: number;
}

export default function DhikrPlayer({
  dhikrText,
  fadl,
  itemId,
  sessionCount,
  targetCount,
  color,
  onTap,
  onShowDalil,
  onShare,
  isComplete,
  useWesternNumerals,
  subMessage,
  isAutoAdvancing,
  isQuran,
  letterCount,
  buttonScale,
  fontSizeReduction = 0,
}: DhikrPlayerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const progress = Math.min(sessionCount / targetCount, 1);
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const isJawahir = itemId === 'jawahir';

  const baseFontSize = dhikrText.length > 200 ? 22 : 24;
  const baseLineHeight = dhikrText.length > 200 ? 36 : 40;
  const dhikrFontSize = baseFontSize - fontSizeReduction;
  const dhikrLineHeight = baseLineHeight - (fontSizeReduction * 2);

  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <View style={styles.root}>
      {/* Virtue Frame (fixed above scroll) */}
      {fadl ? (
        <View style={[styles.virtueFrame, { backgroundColor: hexToRgba(color, 0.08), borderColor: hexToRgba(color, 0.3) }]}>
          <View style={styles.virtueHeaderRow}>
            <Pressable onPress={onShare} style={({ pressed }) => [styles.virtueShareBtn, { borderColor: hexToRgba(color, 0.3), borderWidth: 1 }, pressed && { opacity: 0.5 }]}>
              <MaterialIcons name="share" size={14} color={color} />
              <Text style={[styles.virtueShareText, { color }]}>انشر تؤجر</Text>
            </Pressable>
            <View style={[styles.virtueBadgeWrap, { backgroundColor: color }]}>
              <Text style={styles.virtueBadge}>الفضل</Text>
            </View>
          </View>
          <Text style={[styles.virtueText, { color: hexToRgba(color, 0.9) }]}>{fadl}</Text>
          <View style={[styles.virtueTargetBox, { backgroundColor: hexToRgba(color, 0.12) }]}>
            <Text style={[styles.virtueTarget, { color: hexToRgba(color, 0.8) }]}>
              العدد المطلوب لنيل الفضل: {formatArabicNumber(targetCount, useWesternNumerals)}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Text Area - fills space between virtue frame and info card */}
      <View style={styles.textArea}>
        {isJawahir ? (
          <View style={styles.jawahirCard}>
            <View style={styles.jawahirScrollWrap}>
              <ScrollView
                style={styles.jawahirScroll}
                contentContainerStyle={styles.jawahirContent}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                indicatorStyle="black"
                nestedScrollEnabled
              >
                {dhikrText.split(/[،—]/).map(s => s.trim()).filter(Boolean).map((part, idx) => {
                  if (part.startsWith('سُبْحَانَ اللهِ')) {
                    const rest = part.substring('سُبْحَانَ اللهِ'.length).trim();
                    return (
                      <Text key={idx} style={styles.jawahirLine}>
                        <Text style={styles.jawahirKeyword}>سُبْحَانَ اللهِ </Text>
                        {rest}
                      </Text>
                    );
                  }
                  if (part.startsWith('وَالْحَمْدُ لِلهِ')) {
                    const rest = part.substring('وَالْحَمْدُ لِلهِ'.length).trim();
                    return (
                      <Text key={idx} style={styles.jawahirLine}>
                        <Text style={styles.jawahirKeyword}>وَالْحَمْدُ لِلهِ </Text>
                        {rest}
                      </Text>
                    );
                  }
                  return <Text key={idx} style={styles.jawahirLine}>{part}</Text>;
                })}
              </ScrollView>
              <LinearGradient
                colors={['transparent', '#F5F0E8']}
                style={styles.jawahirFade}
                pointerEvents="none"
              />
              <View style={styles.scrollHint} pointerEvents="none">
                <MaterialIcons name="keyboard-arrow-down" size={18} color={theme.gold} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.dhikrFrame}>
            <ScrollView
              style={styles.dhikrTextScroll}
              contentContainerStyle={styles.dhikrTextScrollContent}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              indicatorStyle="white"
              nestedScrollEnabled
            >
              <Text style={[styles.dhikrText, { fontSize: dhikrFontSize, lineHeight: dhikrLineHeight }]}>{dhikrText}</Text>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Green Info Card (Jawahir only) */}
      {isJawahir ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            يمكنك إدخال : لا إله إلا الله ، الله أكبر،... على نفس الصيغة
          </Text>
          <Pressable onPress={() => setShowInfo(true)} hitSlop={8}>
            <MaterialIcons name="info-outline" size={18} color="#065F46" />
          </Pressable>
        </View>
      ) : null}

      {/* Info Modal */}
      <Modal visible={showInfo} transparent animationType="fade">
        <Pressable style={styles.infoOverlay} onPress={() => setShowInfo(false)}>
          <View />
        </Pressable>
        <View style={styles.infoModal}>
          <Text style={styles.infoModalTitle}>أمثلة الإدخال</Text>
          <Text style={styles.infoModalText}>
            يمكنك إدخال أذكار مثل:{'\n\n'}
            • أستغفر الله وأتوب إليه عدد ما خلق{'\n'}
            • لا حول ولا قوة إلا بالله عدد ما خلق{'\n'}
            • حسبي الله ونعم الوكيل عدد ما خلق{'\n'}
            • اللهم صل وسلم على نبينا محمد وآله عدد ما خلقت{'\n\n'}
            وهكذا... المهم أن تكون على نفس الصيغة
          </Text>
          <Pressable onPress={() => setShowInfo(false)} style={styles.infoModalBtn}>
            <Text style={styles.infoModalBtnText}>حسناً</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Tap Ring */}
      <View style={styles.ringSection}>
        <Pressable onPress={onTap} style={styles.ringPressable}>
          <Animated.View style={[styles.ringWrapper, buttonAnimStyle]}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke={isComplete ? '#10B981' : color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin={`${RING_SIZE / 2},${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.ringInner}>
              <Text style={[styles.ringNumber, { color: isComplete ? '#10B981' : color }]}>
                {formatArabicNumber(sessionCount, useWesternNumerals)}
              </Text>
              <Text style={styles.ringHint}>
                {isComplete ? 'أتممت الورد ✓' : 'انقر للتسبيح'}
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      </View>

      {/* Encouragement Message */}
      <View style={styles.encouragementFrame}>
        {isComplete || isQuran || subMessage ? (
          <>
            {isQuran && !isComplete && letterCount ? (
              <View style={styles.quranBadgeRow}>
                <MaterialIcons name="auto-awesome" size={12} color={theme.gold} />
                <Text style={styles.quranBadgeText}>
                  {formatArabicNumber(letterCount * 10 * targetCount, useWesternNumerals)} حسنة
                </Text>
              </View>
            ) : isComplete ? (
              <View style={styles.completeBanner}>
                <MaterialIcons name="celebration" size={18} color="#10B981" />
                <Text style={styles.completeText}>
                  {isAutoAdvancing ? 'التالي...' : 'أحسنت! أتممت الورد - واصل الذكر 🎉'}
                </Text>
              </View>
            ) : subMessage ? (
              <Text style={styles.subMessageText}>{subMessage}</Text>
            ) : null}
          </>
        ) : null}
      </View>

      {/* Dalil Button (fixed above bottom) */}
      <Pressable
        onPress={onShowDalil}
        style={({ pressed }) => [
          styles.dalilBtn,
          pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={[hexToRgba(color, 0.12), hexToRgba(color, 0.04)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />
        <MaterialIcons name="info-outline" size={20} color={color} />
        <Text style={[styles.dalilBtnText, { color }]}>اطلع على الدليل الشرعي</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 4,
    backgroundColor: '#F5F0E8',
  },
  textArea: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  virtueFrame: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  virtueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  virtueShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  virtueShareText: {
    fontSize: 12,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  virtueBadgeWrap: {
    backgroundColor: '#065F46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  virtueBadge: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
    writingDirection: 'rtl',
  },
  virtueText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 22,
    marginBottom: 8,
  },
  virtueTargetBox: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'center',
    marginTop: 6,
  },
  virtueTarget: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dhikrFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dhikrTextScroll: {
    flex: 1,
    width: '100%',
  },
  dhikrTextScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dhikrText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 42,
  },
  jawahirCard: {
    flex: 1,
    backgroundColor: 'rgba(255,248,231,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 16,
    padding: 12,
  },
  jawahirScrollWrap: {
    flex: 1,
    position: 'relative',
  },
  jawahirScroll: {
    flex: 1,
  },
  jawahirContent: {
    paddingHorizontal: 4,
    paddingRight: 10,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 8,
  },
  jawahirFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    pointerEvents: 'none',
  },
  scrollHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    opacity: 0.3,
  },
  jawahirLine: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  jawahirKeyword: {
    color: '#059669',
    fontWeight: '900',
  },
  ringSection: {
    alignItems: 'center',
    paddingVertical: 9,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5,150,105,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.25)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginBottom: 4,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 18,
  },
  infoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoModal: {
    position: 'absolute',
    top: '30%',
    left: 24,
    right: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  infoModalText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoModalBtn: {
    alignSelf: 'center',
    backgroundColor: '#065F46',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 10,
  },
  infoModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  ringPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumber: {
    fontSize: 52,
    fontWeight: '800',
  },
  ringHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
    writingDirection: 'rtl',
  },
  encouragementFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 27,
    marginBottom: 9,
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
  quranBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  quranBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.gold,
  },
  subMessageText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.5)',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  dalilBtn: {
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
    marginHorizontal: 20,
    marginBottom: 16,
  },
  dalilBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B8941E',
    writingDirection: 'rtl',
  },
});
