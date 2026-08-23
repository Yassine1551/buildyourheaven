import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { useApp } from '../../contexts/AppContext';
import CloudBadge from '../../components/CloudBadge';
import { useTourMeasure } from '../../hooks/useTourMeasure';
import { TOUR_TARGETS } from '../../constants/tour';
import { theme } from '../../constants/theme';
import { CARD_BADGE_DEFINITIONS, getCurrentRank, TIER_INFO, CardBadgeDef } from '../../constants/badges';
import { dhikrItems } from '../../services/mockData';

const GOAL_OPTIONS = [500, 1000, 2000] as const;

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userName, epithet, dhikrCounts, getTotalGlobalDhikr, getTodayCount, computeStreak, computeAllTimePeak, dailyGoal, setDailyGoal, isCardUnlocked, tourTarget, tourTick } = useApp();
  const { ensureVisible, scrollRef, scrollOffset } = useTourMeasure();
  const { showAlert } = useAlert();
  const highlightRef = useRef<View | null>(null);

  useEffect(() => {
    if (tourTarget === TOUR_TARGETS.badges) {
      ensureVisible(TOUR_TARGETS.badges, highlightRef.current);
    }
  }, [tourTarget, tourTick, ensureVisible]);

  const [badgeModal, setBadgeModal] = useState<{
    visible: boolean;
    title: string;
    desc: string;
    color: string;
  }>({ visible: false, title: '', desc: '', color: '#D4AF37' });
  const [guideModal, setGuideModal] = useState<{ visible: boolean; cardId: string | null }>({ visible: false, cardId: null });
  const [customGoalInput, setCustomGoalInput] = useState('');

  const totalDhikr = getTotalGlobalDhikr();
  const displayName = epithet || userName || 'ياسين';
  const todayCount = getTodayCount();
  const streak = computeStreak();
  const peak = computeAllTimePeak();
  const dailyProgress = dailyGoal > 0 ? Math.min(todayCount / dailyGoal, 1) : 0;

  const ACTION_LABELS: Record<string, string> = {
    maghfira: 'استغفر وارتقِ',
    'alf-hasana': 'سبح وارتقِ',
    nakhla: 'ازرع نخلة',
    hirz: 'تحصن وارتقِ',
    'salat-nabi': 'صلِّ على النبي',
    'thuluth-quran': 'اقرأ وارتقِ',
    kanz: 'اكنز وارتقِ',
    'sadaqat-dhikr': 'تصدق وارتقِ',
    'milul-mizan': 'احمد وارتقِ',
    jawamie: 'سبح وارتقِ',
    dhikr_qasr: 'اقرأ وارتقِ',
    jawahir: 'قل وارتقِ',
  };

  const getProgress = (cardDef: CardBadgeDef, current: number) => {
    const { nextLevel } = getCurrentRank(cardDef.cardId, dhikrCounts);
    const maxLevel = cardDef.levels[cardDef.levels.length - 1];
    if (current >= maxLevel.required) return 1;
    const target = nextLevel ? nextLevel.required : cardDef.levels[0].required;
    return Math.min(current / target, 1);
  };

  const handleBadgePress = (cardDef: CardBadgeDef) => {
    const current = dhikrCounts[cardDef.cardId] || 0;
    const { level, nextLevel } = getCurrentRank(cardDef.cardId, dhikrCounts);
    const maxLevel = cardDef.levels[cardDef.levels.length - 1];

    if (level && level.tier === 'diamond') {
      setBadgeModal({
        visible: true,
        title: level.title,
        desc: `أتممت جميع مراتب هذا الوسام!\nالمجموع: ${current.toLocaleString()}\nبارك الله فيك`,
        color: level.color,
      });
    } else if (level) {
      const currentTier = TIER_INFO[level.tier];
      const nextTier = nextLevel ? TIER_INFO[nextLevel.tier] : null;
      const nextRequired = nextLevel?.required || maxLevel.required;
      const progress = Math.min(current / nextRequired, 1);

      setBadgeModal({
        visible: true,
        title: `${currentTier.label} ${level.title}`,
        desc: `المرتبة الحالية: ${level.title}\nالرتبة التالية: ${nextTier?.label || ''} ${nextLevel?.title || ''}\nالمطلوب: ${nextRequired.toLocaleString()}\nالتقدم: ${current.toLocaleString()} / ${nextRequired.toLocaleString()} (${Math.floor(progress * 100)}%)`,
        color: level.color,
      });
    } else {
      const firstLevel = cardDef.levels[0];
      const progress = current / firstLevel.required;
      setBadgeModal({
        visible: true,
        title: `🔒 ${firstLevel.title}`,
        desc: `${cardDef.cardTitle}\nالمطلوب: ${firstLevel.required.toLocaleString()}\nالتقدم: ${current.toLocaleString()} / ${firstLevel.required.toLocaleString()} (${Math.floor(progress * 100)}%)`,
        color: 'rgba(255,255,255,0.3)',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/bg-pattern.webp')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2,26,19,0.92)' }]} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
        >
          {/* Interactive Faith Dashboard Header */}
          <View ref={(el) => { highlightRef.current = el; }}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.dashboardCard}>
            <LinearGradient
              colors={['rgba(212,175,55,0.12)', 'rgba(2,26,19,0.95)']}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.dashboardInner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text style={styles.greeting}>تقبل الله طاعتك</Text>
                <CloudBadge />
              </View>
              <Text style={styles.userNameText}>{displayName}</Text>

              {/* Stats row: total + streak + peak */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialIcons name="menu-book" size={20} color={theme.gold} />
                  <Text style={styles.statValue}>{totalDhikr.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>إجمالي الأذكار</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons name="whatshot" size={20} color="#F97316" />
                  <Text style={styles.statValue}>{streak}</Text>
                  <Text style={styles.statLabel}>أيام متتالية</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialIcons name="emoji-events" size={20} color={theme.gold} />
                  <Text style={styles.statValue}>{peak.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>أعلى حصاد</Text>
                </View>
              </View>

              {/* Daily goal progress */}
              <View style={styles.dailyGoalWrap}>
                <View style={styles.dailyGoalHeader}>
                  <Text style={styles.dailyGoalLabel}>الهدف اليومي</Text>
                  <Text style={styles.dailyGoalValue}>{todayCount.toLocaleString()} / {dailyGoal.toLocaleString()}</Text>
                </View>
                <View style={styles.dailyProgressBarBg}>
                  <View style={[styles.dailyProgressBarFill, { width: `${Math.max(dailyProgress * 100, 1)}%`, backgroundColor: theme.gold }]} />
                </View>
                <Text style={styles.progressPercent}>{Math.round(dailyProgress * 100)}%</Text>

                {/* Goal quick-selector */}
                <View style={styles.goalSelector}>
                  {GOAL_OPTIONS.map(g => (
                    <Pressable
                      key={g}
                      onPress={() => setDailyGoal(g)}
                      style={({ pressed }) => [
                        styles.goalOption,
                        dailyGoal === g && styles.goalOptionActive,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={[styles.goalOptionText, dailyGoal === g && styles.goalOptionTextActive]}>
                        {g.toLocaleString()}
                      </Text>
                    </Pressable>
                  ))}
                  <TextInput
                    style={styles.customGoalInput}
                    placeholder="رقم آخر"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="number-pad"
                    value={customGoalInput}
                    onChangeText={setCustomGoalInput}
                    onSubmitEditing={() => {
                      const num = parseInt(customGoalInput, 10);
                      if (num > 0) setDailyGoal(num);
                      setCustomGoalInput('');
                    }}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </Animated.View>
          </View>

          <Text style={styles.sectionTitle}>
            الأوسمة — بطاقة تلو الأخرى
          </Text>

          {CARD_BADGE_DEFINITIONS.map((cardDef, index) => {
            const current = dhikrCounts[cardDef.cardId] || 0;
            const { level, nextLevel } = getCurrentRank(cardDef.cardId, dhikrCounts);
            const maxLevel = cardDef.levels[cardDef.levels.length - 1];
            const hasMaxRank = level?.tier === 'diamond';
            const currentTier = level ? TIER_INFO[level.tier] : null;
            const nextTier = nextLevel ? TIER_INFO[nextLevel.tier] : null;
            const cardItem = dhikrItems.find(d => d.id === cardDef.cardId);

            const progress = getProgress(cardDef, current);
            const displayColor = level?.color || 'rgba(255,255,255,0.15)';
            const btnColor = cardItem?.color || '#D4AF37';
            const isLocked = !level;
            const cardUnlocked = isCardUnlocked(cardDef.cardId);

            return (
              <Animated.View key={cardDef.cardId} entering={FadeInDown.delay(200 + index * 60).duration(400)}>
                <Pressable
                  onPress={() => handleBadgePress(cardDef)}
                  style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                >
                  <View style={[styles.badgeCard, { borderColor: isLocked ? 'rgba(255,255,255,0.08)' : `${displayColor}40` }]}>
                    <LinearGradient
                      colors={isLocked
                        ? ['rgba(255,255,255,0.03)', 'rgba(0,0,0,0.1)']
                        : [`${displayColor}08`, `${displayColor}15`]
                      }
                      style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                    />

                    {/* Rank decorative side bar */}
                    <View style={[styles.rankBar, { backgroundColor: displayColor }]} />

                    <View style={styles.cardContent}>
                      {/* Top row: card title + rank badge */}
                      <View style={styles.topRow}>
                        <Text style={styles.cardTitle}>{cardDef.cardTitle}</Text>
                        <View style={styles.topRowActions}>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              setGuideModal({ visible: true, cardId: cardDef.cardId });
                            }}
                            hitSlop={10}
                            style={({ pressed }) => [styles.cardInfoBtn, pressed && { opacity: 0.7 }]}
                          >
                            <MaterialIcons name="help-outline" size={16} color="rgba(255,255,255,0.5)" />
                          </Pressable>
                          {level ? (
                            <View style={[styles.currentRankBadge, { backgroundColor: `${displayColor}25`, borderColor: displayColor }]}>
                              <Text style={[styles.currentRankText, { color: displayColor }]}>{currentTier?.label || ''}</Text>
                            </View>
                          ) : (
                            <View style={styles.currentRankBadge}>
                              <Text style={[styles.currentRankText, { color: 'rgba(255,255,255,0.3)' }]}>مغلق</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Middle: current rank info */}
                      <View style={styles.rankInfoRow}>
                        {/* Icon shield */}
                        <View style={[styles.iconShield, { backgroundColor: level ? `${displayColor}20` : 'rgba(255,255,255,0.05)' }]}>
                          <MaterialIcons
                            name={(cardItem?.icon as any) || 'stars'}
                            size={32}
                            color={level ? displayColor : 'rgba(255,255,255,0.2)'}
                          />
                        </View>

                        {/* Rank title + next rank hint */}
                        <View style={styles.rankTextWrap}>
                          <Text style={[styles.rankTitle, { color: level ? displayColor : 'rgba(255,255,255,0.3)' }]}>
                            {level ? level.title : `مطلوب ${cardDef.levels[0].required.toLocaleString()}`}
                          </Text>

                          {hasMaxRank ? (
                            <Text style={styles.nextRankHint}>✓ أتممت جميع المراتب</Text>
                          ) : nextLevel ? (
                            <Text style={styles.nextRankHint}>
                              {nextTier?.label || ''}: المطلوب {nextLevel.required.toLocaleString()}
                            </Text>
                          ) : (
                            <Text style={styles.nextRankHint}>
                              {TIER_INFO[cardDef.levels[0].tier].label}: المطلوب {cardDef.levels[0].required.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Progress bar */}
                      {!hasMaxRank && (
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${Math.max(progress * 100, 2)}%`, backgroundColor: displayColor }]} />
                          </View>
                          <Text style={[styles.progressText, { color: displayColor }]}>{Math.floor(progress * 100)}%</Text>
                        </View>
                      )}

                      {/* All ranks mini preview */}
                      <View style={styles.ranksPreview}>
                        {cardDef.levels.map((lvl, i) => {
                          const isUnlocked = current >= lvl.required;
                          const isCurrent = level?.tier === lvl.tier;
                          return (
                            <View key={lvl.tier} style={[styles.rankDot, {
                              backgroundColor: isUnlocked ? lvl.color : 'rgba(255,255,255,0.1)',
                              borderColor: isCurrent ? lvl.color : 'transparent',
                              borderWidth: isCurrent ? 2 : 0,
                            }]} />
                          );
                        })}
                      </View>

                      {/* Go to dhikr button */}
                      <Pressable
                        onPress={() => {
                          const unlocked = isCardUnlocked(cardDef.cardId);
                          if (!unlocked) return;
                          router.push({ pathname: '/mihrab', params: { id: cardDef.cardId } });
                        }}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          cardUnlocked
                            ? { backgroundColor: `${btnColor}30`, borderColor: `${btnColor}60` }
                            : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text style={[styles.actionBtnText, { color: cardUnlocked ? btnColor : 'rgba(255,255,255,0.2)' }]}>
                          {ACTION_LABELS[cardDef.cardId] || 'اذكر وارتقِ'}
                        </Text>
                        <MaterialIcons name="arrow-back" size={16} color={cardUnlocked ? btnColor : 'rgba(255,255,255,0.2)'} />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* Badge Detail Modal */}
        <Modal visible={badgeModal.visible} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setBadgeModal(prev => ({ ...prev, visible: false }))}>
            <Pressable style={[styles.modalCard, { borderColor: `${badgeModal.color}50` }]}>
              <LinearGradient
                colors={['rgba(6,78,59,0.95)', 'rgba(2,44,34,0.98)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              />
              <View style={[styles.modalAccent, { backgroundColor: badgeModal.color }]} />
              <Text style={[styles.modalTitle, { color: badgeModal.color }]}>{badgeModal.title}</Text>
              <Text style={styles.modalDesc}>{badgeModal.desc}</Text>
              <Pressable
                onPress={() => setBadgeModal(prev => ({ ...prev, visible: false }))}
                style={({ pressed }) => [
                  styles.modalBtn,
                  { borderColor: `${badgeModal.color}50` },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.modalBtnText, { color: badgeModal.color }]}>حسناً</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Badges Guide Modal */}
        <Modal visible={guideModal.visible} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setGuideModal({ visible: false, cardId: null })}>
            <Pressable style={[styles.infoModalCard, { borderColor: 'rgba(212,175,55,0.4)' }]}>
              <LinearGradient
                colors={['rgba(6,78,59,0.95)', 'rgba(2,44,34,0.98)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              />
              {(() => {
                const cardDef = CARD_BADGE_DEFINITIONS.find(d => d.cardId === guideModal.cardId);
                if (!cardDef) return null;
                const cardItem = dhikrItems.find(d => d.id === cardDef.cardId);
                return (
                  <>
                    <View style={styles.infoModalHeader}>
                      <View style={[styles.infoModalIcon, { backgroundColor: `${cardItem?.color || '#D4AF37'}25` }]}>
                        <MaterialIcons name={(cardItem?.icon as any) || 'stars'} size={20} color={cardItem?.color || '#D4AF37'} />
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
                        <Text style={styles.infoModalTitle}>{cardDef.cardTitle}</Text>
                        <Text style={styles.infoModalSubtitle}>تدرّج المراتب والعدد المطلوب</Text>
                      </View>
                    </View>
                    <ScrollView style={{ height: 260 }} showsVerticalScrollIndicator={false}>
                      {cardDef.levels.map(lvl => (
                        <View key={lvl.tier} style={[styles.infoLevelRow, { borderColor: `${lvl.metalColor}40` }]}>
                          <View style={[styles.infoLevelAccent, { backgroundColor: lvl.metalColor }]} />
                          <View style={[styles.infoTierChip, { backgroundColor: `${lvl.metalColor}25`, borderColor: lvl.metalColor }]}>
                            <Text style={[styles.infoTierText, { color: lvl.metalColor }]}>{TIER_INFO[lvl.tier].label}</Text>
                          </View>
                          <Text style={[styles.infoLevelTitle, { color: lvl.color }]}>{lvl.title}</Text>
                          <Text style={[styles.infoLevelRequired, { color: lvl.color }]}>{lvl.required.toLocaleString()}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                );
              })()}
              <Pressable
                onPress={() => setGuideModal({ visible: false, cardId: null })}
                style={({ pressed }) => [
                  styles.modalBtn,
                  { borderColor: 'rgba(212,175,55,0.5)', marginTop: 16, alignSelf: 'center' },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.modalBtnText, { color: theme.gold }]}>حسناً</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  dashboardCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  dashboardInner: {
    padding: 16,
    gap: 12,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.gold,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  dailyGoalWrap: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  dailyGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyGoalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    writingDirection: 'rtl',
  },
  dailyGoalValue: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  dailyProgressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dailyProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.gold,
    textAlign: 'right',
  },
  goalSelector: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  goalOption: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  goalOptionActive: {
    backgroundColor: 'rgba(212,175,55,0.2)',
    borderWidth: 1,
    borderColor: theme.gold,
  },
  goalOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  goalOptionTextActive: {
    color: theme.gold,
  },
  customGoalInput: {
    width: 70,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    writingDirection: 'rtl',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textMuted,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 14,
  },
  topRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardInfoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoModalCard: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'right',
    writingDirection: 'rtl',
    includeFontPadding: false,
  },
  infoModalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    direction: 'rtl',
  },
  infoModalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    direction: 'rtl',
  },
  infoLevelAccent: {
    width: 3,
    height: '70%',
    borderRadius: 1.5,
  },
  infoTierChip: {
    width: 44,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoTierText: {
    fontSize: 10,
    fontWeight: '800',
  },
  infoLevelTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  infoLevelRequired: {
    fontSize: 13,
    fontWeight: '900',
  },
  badgeCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
    minHeight: 120,
    direction: 'rtl',
  },
  rankBar: {
    width: 4,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingRight: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    writingDirection: 'rtl',
  },
  currentRankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  currentRankText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconShield: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTextWrap: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 17,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  nextRankHint: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  ranksPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 24,
    alignItems: 'center',
  },
  modalAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
});
