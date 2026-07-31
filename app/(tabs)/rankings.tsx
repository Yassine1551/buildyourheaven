import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { versesData, VerseItem } from '../../constants/verses';

const STORAGE_KEY = 'memorized_verses';

function FocusModal({ item, visible, onClose, isMemorized, onToggleMemorize, onNext, onPrev, hasNext, hasPrev }: {
  item: VerseItem;
  visible: boolean;
  onClose: () => void;
  isMemorized: boolean;
  onToggleMemorize: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  const [showStrategy, setShowStrategy] = useState(false);
  const [fontSize, setFontSize] = useState(() => item.id === '9' ? 16 : item.id === '10' ? 16.5 : item.id === '13' ? 16 : item.id === '14' ? 17 : 18);
  const [readingPhase, setReadingPhase] = useState<'natharan' | 'ghayban' | 'complete'>('natharan');
  const [readingCount, setReadingCount] = useState(0);
  const nextUnlocked = readingPhase === 'complete' || isMemorized;
  const titleFontSize = item.id === "3" ? 12 : item.id === "10" ? 15 : item.id === "11" ? 16 : item.title.length > 32 ? 14 : 18;

  const handleReadingPress = useCallback(() => {
    if (readingPhase === 'natharan' && readingCount < 10) {
      setReadingCount(prev => prev + 1);
    } else if (readingPhase === 'ghayban' && readingCount < 5) {
      setReadingCount(prev => prev + 1);
    }
  }, [readingPhase, readingCount]);

  useEffect(() => {
    if (readingPhase === 'natharan' && readingCount === 10) {
      const timer = setTimeout(() => {
        setReadingPhase('ghayban');
        setReadingCount(0);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (readingPhase === 'ghayban' && readingCount === 5) {
      const timer = setTimeout(() => {
        setReadingPhase('complete');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [readingPhase, readingCount]);

  useEffect(() => {
    setReadingPhase('natharan');
    setReadingCount(0);
    setFontSize(item.id === '9' ? 16 : item.id === '10' ? 16.5 : item.id === '13' ? 16 : item.id === '14' ? 17 : 18);
  }, [item.id]);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#021A13', '#042F2E', '#0C1E2E']}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={{ flex: 1 }}>
          {/* Top bar: close + title */}
          <View style={styles.modalTopBar}>
            <Pressable onPress={onClose} style={styles.modalCloseBtn}>
              <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.6)" />
            </Pressable>
            <View style={styles.modalTitleRow}>
              <Text style={[styles.modalTitle, { fontSize: titleFontSize }]} numberOfLines={1}>{item.title}</Text>
            </View>
            <Text style={styles.modalOrder}>{item.order}</Text>
          </View>

          {/* Controls row: − + 💡 below title */}
            <View style={styles.controlsRow}>
              <View style={styles.fontSizeRow}>
                <Pressable onPress={() => setFontSize(s => Math.max(12, s - 2))} style={styles.fontSizeBtn}>
                  <Text style={styles.fontSizeBtnText}>−</Text>
                </Pressable>
                <Text style={styles.fontSizeValue}>{fontSize}</Text>
                <Pressable onPress={() => setFontSize(s => Math.min(36, s + 2))} style={styles.fontSizeBtn}>
                  <Text style={styles.fontSizeBtnText}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => setShowStrategy(s => !s)} style={[styles.toggleBtn, showStrategy && { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                <MaterialIcons name="lightbulb-outline" size={16} color={showStrategy ? theme.gold : 'rgba(255,255,255,0.3)'} />
                <Text style={[styles.toggleBtnText, showStrategy && { color: theme.gold }]}>استراتيجية الحفظ</Text>
              </Pressable>
            </View>

          {/* Strategy Popup */}
          <Modal visible={showStrategy} transparent animationType="fade" statusBarTranslucent>
            <Pressable style={styles.strategyPopupOverlay} onPress={() => setShowStrategy(false)}>
              <View style={styles.strategyPopupBox}>
                <Text style={styles.strategyTitle}>استراتيجية الحفظ</Text>
                <View style={styles.strategyStepRow}>
                  <Text style={styles.strategyStep}>اقرأ الآية ناظراً 10 مرات.</Text>
                  <Text style={styles.strategyStepNum}>.1</Text>
                </View>
                <View style={styles.strategyStepRow}>
                  <Text style={styles.strategyStep}>رددها غيباً 5 مرات.</Text>
                  <Text style={styles.strategyStepNum}>.2</Text>
                </View>
                <View style={styles.strategyStepRow}>
                  <Text style={styles.strategyStep}>كررها في صلواتك اليوم لضمان التثبيت.</Text>
                  <Text style={styles.strategyStepNum}>.3</Text>
                </View>
                <Pressable onPress={() => setShowStrategy(false)} style={styles.strategyPopupClose}>
                  <Text style={styles.strategyPopupCloseText}>حسناً</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          {/* Content */}
          <View style={{ flex: 1, overflow: 'hidden' }}>
            <View style={styles.modalContent}>
              {/* Verse text - fixed frame, scroll inside */}
              <View style={styles.modalVersesWrap}>
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ alignItems: 'center', paddingVertical: 0 }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  <Text style={[styles.modalVersesText, { fontSize, lineHeight: fontSize + 22 }]}>{item.verses}</Text>
                </ScrollView>
              </View>

              {/* Virtue - fixed */}
              <View style={styles.modalVirtueWrap}>
                <View style={styles.modalVirtueDivider} />
                <Text style={styles.modalVirtueLabel}>فضل الآية</Text>
                <Text style={styles.modalVirtueText}>{item.virtue}</Text>
              </View>
            </View>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomBar}>
            {/* Labels row */}
            <View style={styles.bottomLabelsRow}>
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                {hasNext && (
                  <Pressable onPress={() => onToggleMemorize(item.id)} style={styles.memorizeQuick}>
                    <Text style={[styles.memorizeQuickText, isMemorized && { color: '#4CAF50' }]}>
                      {isMemorized ? '✓ محفوظة' : 'حفظتها مسبقاً'}
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text style={[styles.readingLabel, readingPhase === 'complete' && { opacity: 0 }, { marginLeft: -4 }]}>
                {readingPhase === 'natharan' ? 'اقرأ الآية ناظراً' : 'اقرأها غيباً'}
              </Text>
              <View style={{ flex: 1 }} />
            </View>

            {/* Buttons row: all three on same line */}
            <View style={styles.bottomButtonsRow}>
              {hasNext ? (
                <Pressable onPress={nextUnlocked ? onNext : undefined} style={[styles.navBtn, !nextUnlocked && { opacity: 0.35, borderColor: 'rgba(255,255,255,0.1)' }]}>
                  <MaterialIcons name="chevron-left" size={20} color={nextUnlocked ? "#D4AF37" : "rgba(255,255,255,0.25)"} />
                  <Text style={[styles.navBtnText, !nextUnlocked && { color: 'rgba(255,255,255,0.25)' }]}>الآية التالية</Text>
                </Pressable>
              ) : <View style={{ flex: 1 }} />}

              <View style={{ alignItems: 'center' }}>
                <Pressable onPress={handleReadingPress} style={styles.repeatBtn}>
                  {readingPhase === 'complete' ? (
                    <>
                      <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                      <Text style={[styles.repeatBtnText, { color: '#4CAF50' }]}>تم</Text>
                    </>
                  ) : (
                    <Text style={styles.repeatBtnText}>
                      {readingPhase === 'natharan' ? `${readingCount}/10` : `${readingCount}/5`}
                    </Text>
                  )}
                </Pressable>
              </View>

              {hasPrev ? (
                <Pressable onPress={onPrev} style={styles.navBtn}>
                  <Text style={styles.navBtnText}>الآية السابقة</Text>
                  <MaterialIcons name="chevron-right" size={22} color="#D4AF37" />
                </Pressable>
              ) : <View style={{ flex: 1 }} />}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function MemorizationCard({ item, isMemorized, onPress }: {
  item: VerseItem;
  isMemorized: boolean;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <Pressable onPress={onPress} style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
        />
        <View style={styles.cardHeader}>
          <MaterialIcons name="chevron-left" size={20} color="rgba(255,255,255,0.2)" />
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {isMemorized && <MaterialIcons name="check-circle" size={18} color="#4CAF50" style={{ marginLeft: 6 }} />}
          </View>
          <Text style={styles.orderBadge}>{item.order}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function RankingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDevUnlocked, toggleDevUnlock } = useApp();
  const [memorizedIds, setMemorizedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'memorized' | 'remaining'>('all');
  const [selectedItem, setSelectedItem] = useState<VerseItem | null>(null);
  const [titleTapCount, setTitleTapCount] = useState(0);
  const sortedVerses = [...versesData].sort((a, b) => a.order - b.order);
  const totalCount = sortedVerses.length;
  const memorizedCount = sortedVerses.filter(v => memorizedIds.includes(v.id)).length;
  const progress = totalCount > 0 ? memorizedCount / totalCount : 0;

  const isVerseUnlocked = useCallback((order: number) => {
    if (isDevUnlocked) return true;
    if (order <= 1) return true;
    const prevItem = sortedVerses.find(v => v.order === order - 1);
    if (!prevItem) return true;
    return memorizedIds.includes(prevItem.id);
  }, [isDevUnlocked, memorizedIds, sortedVerses]);

  const filteredVerses = sortedVerses.filter((v) => {
    if (!isVerseUnlocked(v.order) && activeFilter !== 'all') return false;
    if (activeFilter === 'memorized') return memorizedIds.includes(v.id);
    if (activeFilter === 'remaining') return !memorizedIds.includes(v.id);
    return true;
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setMemorizedIds(JSON.parse(data));
    });
  }, []);

  const handleToggleMemorize = useCallback((id: string) => {
    setMemorizedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleNavigate = useCallback((dir: 'prev' | 'next') => {
    if (!selectedItem) return;
    const idx = sortedVerses.findIndex(v => v.id === selectedItem.id);
    const nextIdx = dir === 'next' ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < sortedVerses.length) {
      setSelectedItem(sortedVerses[nextIdx]);
    }
  }, [selectedItem, sortedVerses]);

  const handleTitleTap = useCallback(() => {
    setTitleTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        toggleDevUnlock();
        return 0;
      }
      return next;
    });
  }, [toggleDevUnlock]);

  const filterTabs: { key: 'all' | 'memorized' | 'remaining'; label: string; icon: string }[] = [
    { key: 'all', label: 'الكل', icon: 'list' },
    { key: 'memorized', label: 'محفوظة', icon: 'check-circle' },
    { key: 'remaining', label: 'متبقية', icon: 'hourglass-empty' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#021A13', '#042F2E', '#0C1E2E']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
            <Pressable onPress={handleTitleTap}>
              <Text style={styles.pageTitle}>آيات للحفظ</Text>
            </Pressable>
            <Text style={styles.pageSubtitle}>احفظ كتاب الله وتمسك به</Text>
          </Animated.View>

          {/* Dashboard / Filter Tabs */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.dashboard}>
            <LinearGradient
              colors={['rgba(212,175,55,0.12)', 'rgba(2,26,19,0.8)']}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.dashboardContent}>
              <Text style={styles.dashboardTitle}>لوحة الحفظ</Text>
              <Text style={styles.dashboardCount}>
                تم حفظ {memorizedCount} من أصل {totalCount}
              </Text>

              <View style={styles.dashProgressWrap}>
                <View style={styles.dashProgressBg}>
                  <View style={[styles.dashProgressFill, { width: `${Math.max(progress * 100, 1)}%` }]} />
                </View>
                <Text style={styles.dashProgressText}>{Math.round(progress * 100)}%</Text>
              </View>

              <View style={styles.filterRow}>
                {filterTabs.map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => setActiveFilter(tab.key)}
                      style={[
                        styles.filterTab,
                        isActive && styles.filterTabActive,
                      ]}
                    >
                      <MaterialIcons
                        name={tab.icon as any}
                        size={16}
                        color={isActive ? theme.gold : 'rgba(255,255,255,0.4)'}
                      />
                      <Text style={[
                        styles.filterTabText,
                        isActive && styles.filterTabTextActive,
                      ]}>
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Motivational card */}
          <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.motivationCard}>
            <Text style={styles.motivationText}>
              هذه الآيات بمثابة جرعات إيمانية مركزة لتحفيز الذاكرة وتعويد النفس على الحفظ الميسر. لعلها تكون بوابتك لانطلاقة كبرى نحو الحفظ المتقن والبحث عن مجالس القرآن لضبط التلاوة.
            </Text>
          </Animated.View>

          {/* List */}
          <Text style={styles.sectionTitle}>قائمة الحفظ</Text>

          {filteredVerses.map((item) => {
            const unlocked = isVerseUnlocked(item.order);
            if (!unlocked && activeFilter === 'all') {
              return (
                <Animated.View key={item.id} entering={FadeInUp.duration(400)}>
                    <View style={styles.lockedCard}>
                    <MaterialIcons name="lock-outline" size={24} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.lockedCardTitle}>{item.title}</Text>
                  </View>
                </Animated.View>
              );
            }
            return (
              <MemorizationCard
                key={item.id}
                item={item}
                isMemorized={memorizedIds.includes(item.id)}
                onPress={() => setSelectedItem(item)}
              />
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Focus Modal */}
      {selectedItem && (
        <FocusModal
          item={selectedItem}
          visible={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          isMemorized={memorizedIds.includes(selectedItem.id)}
          onToggleMemorize={handleToggleMemorize}
          onNext={() => handleNavigate('next')}
          onPrev={() => handleNavigate('prev')}
          hasNext={sortedVerses.findIndex(v => v.id === selectedItem.id) < sortedVerses.length - 1}
          hasPrev={sortedVerses.findIndex(v => v.id === selectedItem.id) > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.gold,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  dashboard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  dashboardContent: {
    padding: 20,
    gap: 10,
  },
  dashboardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(212,175,55,0.7)',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  dashboardCount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  dashProgressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dashProgressBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dashProgressFill: {
    height: '100%',
    backgroundColor: theme.gold,
    borderRadius: 4,
  },
  dashProgressText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.gold,
    minWidth: 36,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: 'rgba(212,175,55,0.4)',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    writingDirection: 'rtl',
  },
  filterTabTextActive: {
    color: theme.gold,
  },
  motivationCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    backgroundColor: 'rgba(212,175,55,0.04)',
    padding: 16,
    marginBottom: 16,
  },
  motivationText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,248,0.7)',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: 10,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    writingDirection: 'rtl',
    textAlign: 'right',
    flex: 1,
  },
  orderBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  /* Modal styles */
  modalOverlay: {
    flex: 1,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginHorizontal: 10,
    writingDirection: 'rtl',
  },
  modalOrder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 40,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    flex: 1,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  strategyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strategyPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strategyPopupBox: {
    marginHorizontal: 40,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#042F2E',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    gap: 12,
  },
  strategyPopupClose: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  strategyPopupCloseText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.gold,
  },
  strategyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 8,
  },
  strategyStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  strategyStepNum: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(212,175,55,0.7)',
    width: 26,
    textAlign: 'center',
    lineHeight: 26,
  },
  strategyStep: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,248,0.75)',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 26,
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalVersesWrap: {
    flex: 1,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalVersesText: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    writingDirection: 'rtl',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  modalVirtueWrap: {
    marginTop: 4,
  },
  modalVirtueDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 16,
  },
  modalVirtueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.gold,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 6,
  },
  modalVirtueText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 8,
  },
  bottomLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    writingDirection: 'rtl',
  },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fontSizeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  fontSizeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    minWidth: 20,
    textAlign: 'center',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
    writingDirection: 'rtl',
  },

  readingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  memorizeQuick: {
    paddingVertical: 2,
  },
  memorizeQuickText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    writingDirection: 'rtl',
    textDecorationLine: 'underline',
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    width: 110,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  repeatBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.gold,
    minWidth: 24,
    textAlign: 'center',
  },
  lockedCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.35)',
    writingDirection: 'rtl',
    textAlign: 'right',
    flex: 1,
  },
});
