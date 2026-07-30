import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BadgeTier } from '../constants/badges';

export default function CongratulationsScreen() {
  const router = useRouter();
  const { title, type, badgeTier, rankColor } = useLocalSearchParams<{ title: string; type: string; badgeTier: string; rankColor: string }>();
  const isBadge = type === 'badge';

  const starScale = useSharedValue(0);
  const glowRadius = useSharedValue(0.3);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    starScale.value = withSequence(
      withTiming(1.2, { duration: 500, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 300 })
    );
    glowRadius.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowRadius.value,
    transform: [{ scale: 1 + glowRadius.value }],
  }));

  const handleClose = () => {
    if (router.canGoBack()) router.back();
  };

  const currentColor = rankColor || '#D4AF37';

  return (
    <View style={[styles.container, isBadge && styles.badgeContainer]}>
      {/* Close button */}
      <Pressable
        style={styles.closeBtn}
        onPress={handleClose}
        hitSlop={16}
      >
        <MaterialIcons name="close" size={28} color="#FFF" />
      </Pressable>

      <View style={styles.content}>
        <Animated.View style={[styles.glowRing1, { backgroundColor: `${currentColor}15` }]} />
        <Animated.View style={[styles.glowRing2, { backgroundColor: `${currentColor}20` }]} />
        <Animated.View style={[styles.glowRing3, { backgroundColor: `${currentColor}30` }]} />

        <Animated.View style={starStyle} entering={FadeIn.duration(300)}>
          {isBadge ? (
            <View style={styles.badgeIconWrap}>
              <View style={[styles.badgeShield, { backgroundColor: `${currentColor}20`, borderColor: currentColor }]}>
                <MaterialIcons
                  name="emoji-events"
                  size={56}
                  color={currentColor}
                />
              </View>
            </View>
          ) : (
            <MaterialIcons name="star" size={80} color="#F59E0B" />
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Text style={styles.title}>تهانينا!</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={[styles.subtitle, { color: isBadge ? currentColor : 'rgba(255,255,255,0.7)' }]}>
            {isBadge
              ? `تم ارتقاء لقبك إلى\n${title || ''}`
              : `لقد تم فتح بطاقة: ${title || 'جديدة'}`
            }
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(500)}>
          <Text style={[styles.bless, { color: isBadge ? currentColor : '#D4AF37' }]}>
            بارك الله في عملك
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021A13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: '#0A1628',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowRing2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  glowRing3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 20,
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    writingDirection: 'rtl',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 28,
  },
  bless: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  badgeIconWrap: {
    alignItems: 'center',
  },
  badgeShield: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
