import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { useAlert } from '@/template';
import { useApp } from '../../contexts/AppContext';
import CloudBadge from '../../components/CloudBadge';
import { getAdhkarSlotAt } from '../../services/adhkarNotifications';
import { dhikrItems, DhikrItem, statItems, formatNumber, formatArabicNumber, formatCompactNumber, formatExtraLife } from '../../services/mockData';
import { DHIKR_BENEFITS_POOL } from '../../constants/benefits';
import { CARD_BADGE_DEFINITIONS, TIER_INFO } from '../../constants/badges';
import { theme } from '../../constants/theme';
import { TOUR_TARGETS } from '../../constants/tour';
import { COUNTRIES, getCountryByCode } from '../../constants/countries';
import { useTourMeasure } from '../../hooks/useTourMeasure';
import WirdSettingsModal from '../../components/WirdSettingsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MALE_NAMES = [
  'قانت الليل', 'مستغفر الأسحار', 'مناجي الدجى', 'سمير المحراب', 'قائم الأسحار',
  'باكي الغسق', 'متبتل الدجى', 'راكع السحر', 'ساجد الليل', 'ذاكر الأسحار',
  'مسبح الخلوات', 'طارق الدجى', 'ساهر المحراب', 'حارس الليل', 'خاشع الأسحار',
  'منيب الدجى', 'راجي السحر', 'أسير المحراب', 'حليف السهر', 'نديم الخلوة',
  'منيب الدهر', 'أواب العصر', 'تائب الزمان', 'رجاع الدروب', 'سائل العفو',
  'راجي الغفران', 'طامع الرحمة', 'هارب لله', 'آوي للظل', 'طالب الرضا',
  'معترف الزلل', 'مريق الدمع', 'طارق الباب', 'واصل القطيعة',
  'خادم المحراب', 'عابد الحرم', 'صوام الهواجر', 'قوام الليالي', 'تالي الكتاب',
  'حافظ العهد', 'خاشع الطرف', 'ساجد الجبهة', 'راكع الشكر', 'حامد النعم',
  'شاكر الفضل', 'مهلل الفجر', 'مكبر الأكوان', 'ذاكر الغيب', 'طاهر القلب',
  'نقي السريرة', 'سليم الصدر', 'موفي النذور',
  'وجل الفؤاد', 'خائف الوعيد', 'مشفق المآب', 'راجي المآل', 'طامح الجنان',
  'زاهد الدنا', 'هاجر الملذات', 'باغي الأجر', 'سائل الفردوس', 'خاشع الوجدان',
  'دامع العينين', 'منكسر الجناح', 'ذليل الوقفة', 'فقير الرحمة',
  'أسير الشوق', 'ظمآن الوصل', 'طالب النور', 'مستهدي السبيل',
  'صابر البلاء', 'شاكر الرخاء', 'راضي القضاء', 'محتسب الأجر', 'رفيق القرآن',
  'صائم النهار', 'تالي الآيات', 'دائم التسبيح', 'مصلي الفجر', 'راجي القبول',
  'طالب الفردوس', 'ملازم الطاعة', 'عامر المحراب', 'ذاكر المولى',
  'قاصد النجاة', 'محب التهجد', 'رفيق السجود', 'متبع الأثر', 'صادق العهد',
  'طاهر النية', 'كافل اليتيم', 'حبيب المساجد', 'باكي الخلوة', 'كاظم الغيظ',
  'ساتر العيوب', 'يقظ البصيرة', 'محب الصالحين', 'رفيق التوابين',
  'جليس الذاكرين', 'أنيس الخلوة', 'عابر السبيل', 'سائر الدرب', 'خالص الوجهة',
  'حي الفؤاد', 'سليم الروح',
];
const FEMALE_NAMES = [
  'قانتة الليل', 'مستغفرة الأسحار', 'مناجية الدجى', 'سميرة المحراب', 'قائمة الأسحار',
  'باكية الغسق', 'متبتلة الدجى', 'راكعة السحر', 'ساجدة الليل', 'ذاكرة الأسحار',
  'مسبحة الخلوات', 'طارقة الدجى', 'ساهرة المحراب', 'حارسة الليل', 'خاشعة الأسحار',
  'منيبة الدجى', 'راجية السحر', 'أسيرة المحراب', 'حليفة السهر', 'نديمة الخلوة',
  'منيبة الدهر', 'أوّابة العصر', 'تائبة الزمان', 'نادمة الخطيئة',
  'سائلة العفو', 'راجية الغفران', 'طامعة الرحمة', 'هاربة لله', 'آوية للظل',
  'طالبة الرضا', 'معترفة الزلل', 'مريقة الدمع', 'طارقة الباب', 'واصلة القطيعة',
  'خادمة المحراب', 'عابدة الحرم', 'صوّامة الهواجر', 'قوّامة الليالي', 'تالية الكتاب',
  'حافظة العهد', 'خاشعة الطرف', 'ساجدة الجبهة', 'راكعة الشكر', 'حامدة النعم',
  'شاكرة الفضل', 'مهللة الفجر', 'مكبرة الأكوان', 'ذاكرة الغيب', 'طاهرة القلب',
  'نقية السريرة', 'سليمة الصدر', 'موفية النذور',
  'وجلة الفؤاد', 'خائفة الوعيد', 'مشفقة المآب', 'راجية المآل', 'طامحة الجنان',
  'زاهدة الدنا', 'هاجرة الملذات', 'باغية الأجر', 'سائلة الفردوس', 'خاشعة الوجدان',
  'دامعة العينين', 'منكسرة الجناح', 'ذليلة الوقفة', 'فقيرة الرحمة',
  'أسيرة الشوق', 'ظمأى الوصل', 'طالبة النور', 'مستهدية السبيل',
  'صابرة البلاء', 'شاكرة الرخاء', 'راضية القضاء', 'محتسبة الأجر', 'رفيقة القرآن',
  'صائمة النهار', 'تالية الآيات', 'دائمة التسبيح', 'مصلية الفجر', 'راجية القبول',
  'طالبة الفردوس', 'ملازمة الطاعة', 'عامرة المحراب', 'ذاكرة المولى',
  'قاصدة النجاة', 'محبة التهجد', 'رفيقة السجود', 'متبعة الأثر', 'صادقة العهد',
  'طاهرة النية', 'كافلة اليتيم', 'حبيبة المساجد', 'باكية الخلوة', 'كاظمة الغيظ',
  'ساترة العيوب', 'يقظة البصيرة', 'محبة الصالحين', 'رفيقة التوابين',
  'جليسة الذاكرين', 'أنيسة الخلوة', 'عابرة السبيل', 'سائرة الدرب', 'خالصة الوجهة',
  'حية الفؤاد', 'سليمة الروح',
];

const RESET_HOLD_DURATION = 3000;

function getAdhkarTimeSlot(): 'morning' | 'evening' | 'sleep' | 'wakeup' | null {
  const now = new Date();
  return getAdhkarSlotAt(now.getHours(), now.getMinutes());
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const {
    hasanat, stats, getElapsedTime, getTargetProgress,
    dhikrCounts, istiqama, userName,
    showWelcome, loaded, setUserName, dismissWelcome, isCardUnlocked,
    getUnlockRequirement,
    celebrationQueue, clearFirstCelebration,
    soundEnabled, vibrationEnabled, toggleSound, toggleVibration,
    useWesternNumerals, toggleNumeralSystem,
    isDarkMode, toggleDarkMode,
    targetYears, setTargetYears,
    resetAllData, resetVersesData, resetAdhkarData,
    isDevUnlocked, toggleDevUnlock,
    shouldShowReview, markReviewAsRated, deferReview,
    gender, setGender,
    wirdConfig, wirdCounts,
    setOnboardingDone, onboardingDone,
    tourTarget, tourTick,
    country, setCountry,
    cloudUser, linkGoogle, cloudLoading, cloudError, unlinkGoogle,
  } = useApp();

  const { ensureVisible, scrollRef, scrollOffset } = useTourMeasure();

  const homeRefs = useRef<{
    hasanat: View | null;
    statsGrid: View | null;
    timeAdhkar: View | null;
    benefit: View | null;
    dhikrGrid: View | null;
  }>({ hasanat: null, statsGrid: null, timeAdhkar: null, benefit: null, dhikrGrid: null });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showWirdSettings, setShowWirdSettings] = useState(false);
  const [showExtraLifeInfo, setShowExtraLifeInfo] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [welcomeGender, setWelcomeGender] = useState<'male' | 'female' | ''>('');
  const [welcomeCountry, setWelcomeCountry] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTargetYears, setTempTargetYears] = useState(60);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [editShowGender, setEditShowGender] = useState<'male' | 'female'>('male');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showBalanceInfo, setShowBalanceInfo] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Full reset state
  const [isHoldingReset, setIsHoldingReset] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);
  const devTapCountRef = useRef(0);
  const [sharingBenefit, setSharingBenefit] = useState<boolean>(false);
  const benefitShareCardRef = useRef<any>(null);

  const progress = getTargetProgress();
  const extraLifeStr = formatExtraLife(stats.extra_life_minutes || 0, useWesternNumerals);

  const goldPulse = useSharedValue(1);

  useEffect(() => {
    goldPulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (resetCountdownRef.current) clearInterval(resetCountdownRef.current);
    };
  }, []);

  const handleCelebrationEvent = useCallback((event: string) => {
    // Tiered Celebration Handler
    if (event.startsWith('badge_')) {
      const badgeId = event.substring('badge_'.length);
      const parts = badgeId.split('_');
      const tier = parts.pop() as string;
      const cardId = parts.join('_');
      const def = CARD_BADGE_DEFINITIONS.find(d => d.cardId === cardId);
      const level = def?.levels.find(l => l.tier === tier);
      const tierInfo = TIER_INFO[tier as keyof typeof TIER_INFO];
      if (level && tierInfo) {
        router.push({
          pathname: '/congratulations',
          params: { title: level.title, type: 'badge', badgeTier: tierInfo.label, rankColor: level.color },
        });
      }
    } else if (event.startsWith('unlock_')) {
      const cardId = event.substring('unlock_'.length);
      const item = dhikrItems.find(d => d.id === cardId);
      if (item) {
        router.push({
          pathname: '/congratulations',
          params: { title: item.title.replace('\n', ' '), type: 'unlock' },
        });
      }
    } else if (event.startsWith('milestone_')) {
      const m = event.substring('milestone_'.length);
      const titles: Record<string, string> = {
        '100': '100 ذكر',
        '500': '500 ذكر',
        '1000': '1000 ذكر',
      };
      router.push({
        pathname: '/congratulations',
        params: { title: titles[m] || `${m} ذكر`, type: 'milestone', milestone: m },
      });
    } else {
      const item = dhikrItems.find(d => d.id === event);
      if (item) {
        router.push({ pathname: '/congratulations', params: { title: item.title.replace('\n', ' ') } });
      }
    }
  }, [router]);

  // Celebrations only fire when the dashboard is focused (i.e. after leaving the dhikr page),
  // one at a time, with a brief delay so the user feels they exited first.
  useFocusEffect(
    useCallback(() => {
      if (celebrationQueue.length === 0) return;
      const timer = setTimeout(() => {
        const event = celebrationQueue[0];
        clearFirstCelebration();
        handleCelebrationEvent(event);
      }, 500);
      return () => clearTimeout(timer);
    }, [celebrationQueue, clearFirstCelebration, handleCelebrationEvent])
  );

  // Cleanup hold timer
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
      }
    };
  }, []);

  // Track dashboard focus state
  const [dailyBenefit, setDailyBenefit] = useState('');
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setDailyBenefit(DHIKR_BENEFITS_POOL[Math.floor(Math.random() * DHIKR_BENEFITS_POOL.length)]);
      return () => setIsFocused(false);
    }, [])
  );

  // Smart Rating Modal Trigger - dashboard focused + no celebration + review pending
  useEffect(() => {
    if (isFocused && shouldShowReview && celebrationQueue.length === 0 && !showRatingModal) {
      const timer = setTimeout(() => setShowRatingModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isFocused, shouldShowReview, celebrationQueue, showRatingModal]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: goldPulse.value }],
  }));

  const handleDhikrPress = useCallback((dhikrId: string) => {
    if (!isCardUnlocked(dhikrId)) {
      const req = getUnlockRequirement(dhikrId);
      showAlert(
        'البطاقة مقفلة 🔒',
        req ? `لفتح هذه البطاقة:\n${req}` : 'استمر في الذكر لفتح هذه البطاقة',
        [{ text: 'حسناً', style: 'default' }]
      );
      return;
    }
    router.push({ pathname: '/mihrab', params: { id: dhikrId } });
  }, [isCardUnlocked, getUnlockRequirement, router, showAlert]);

  const handleShareBenefit = useCallback(async () => {
    const appLink = 'https://play.google.com/store/apps/details?id=YOUR_APP_ID';
    setSharingBenefit(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const uri = await captureRef(benefitShareCardRef, { format: 'png', quality: 1 });
      const msg = `📌 حمّل تطبيق "ابنِ جنتك" - لتغنم كنوز الأذكار 👇\n${appLink}`;
      if (Platform.OS === 'ios') {
        await Share.share({ message: msg, url: uri });
      } else {
        const contentUri = await FileSystem.getContentUriAsync(uri);
        const result = await Share.share({ url: contentUri });
        if (result.action === Share.sharedAction) {
          await new Promise(r => setTimeout(r, 500));
          await Share.share({ message: msg });
        }
      }
    } catch (e) {
      console.warn('Share benefit failed:', e);
      const msg = `✨ فائدة اليوم ✨\n\n${dailyBenefit}\n\n-------------------------------------\n📌 حمّل تطبيق "ابنِ جنتك" - لتغنم كنوز الأذكار 👇\n${appLink}`;
      await Share.share({ message: msg });
    }
    setSharingBenefit(false);
  }, [dailyBenefit]);

  const handleSelectDefaultNameWithGender = (gender: 'male' | 'female') => {
    const pool = gender === 'female' ? FEMALE_NAMES : MALE_NAMES;
    const randomName = pool[Math.floor(Math.random() * pool.length)];
    setUserName(randomName);
    setGender(gender);
    dismissWelcome();
  };

  const handleSelectDefaultName = () => {
    const pool = welcomeGender === 'female' ? FEMALE_NAMES : MALE_NAMES;
    const randomName = pool[Math.floor(Math.random() * pool.length)];
    setUserName(randomName);
    if (welcomeGender) setGender(welcomeGender);
    dismissWelcome();
  };

  const handleSubmitCustomName = () => {
    if (customNameInput.trim()) {
      setUserName(customNameInput.trim());
      if (welcomeGender) setGender(welcomeGender);
      if (welcomeCountry) setCountry(welcomeCountry);
      dismissWelcome();
    }
  };

  useEffect(() => {
    if (showWelcome && onboardingDone && cloudUser?.name) {
      setCustomNameInput(cloudUser.name);
      setShowNameInput(true);
    }
  }, [showWelcome, onboardingDone, cloudUser]);

  const onWelcomeGoogleLink = () => {
    linkGoogle().catch(() => {});
  };

  const handleDrawerNavigate = (route: string) => {
    setDrawerOpen(false);
    setTimeout(async () => {
      if (route === 'settings') {
        setShowSettingsModal(true);
      } else if (route === 'about') {
        setShowAboutModal(true);
      } else if (route === 'our-apps') {
        try {
          const url = 'https://play.google.com/store/apps/developer?id=Bani+Jannatak';
          const supported = await Linking.canOpenURL(url);
          if (supported) await Linking.openURL(url);
          else showAlert('تطبيقاتنا', 'سيتم نشر صفحة التطبيقات قريباً.');
        } catch (e) {
          showAlert('تطبيقاتنا', 'سيتم نشر صفحة التطبيقات قريباً.');
        }
      } else if (route === 'share') {
        try {
          await Share.share({
            message: 'حمل تطبيق ابنِ جنتك - صدقة جارية لك.',
          });
        } catch (e) {}
      } else if (route === 'privacy') {
        setShowPrivacyModal(true);
      }
    }, 200);
  };

  const openTargetModal = () => {
    setTempTargetYears(targetYears);
    setShowTargetModal(true);
  };

  const confirmTargetYears = () => {
    setTargetYears(tempTargetYears);
    setShowTargetModal(false);
  };

  const openEditName = () => {
    setEditNameInput(userName);
    setShowEditNameModal(true);
  };

  const confirmEditName = () => {
    if (editNameInput.trim()) {
      setUserName(editNameInput.trim());
      setGender(editShowGender);
      setShowEditNameModal(false);
      showAlert('تم التحديث', `تم تغيير الاسم إلى: ${editNameInput.trim()}`);
    }
  };

  // Full reset long press handlers
  const startHoldReset = () => {
    setIsHoldingReset(true);
    setResetProgress(0);
    holdStartRef.current = Date.now();

    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const prog = Math.min(elapsed / RESET_HOLD_DURATION, 1);
      setResetProgress(prog);

      if (vibrationEnabled) {
        if (Math.abs(prog - 0.5) < 0.02) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

      if (prog >= 1) {
        clearInterval(holdTimerRef.current!);
        holdTimerRef.current = null;
        setIsHoldingReset(false);
        setResetProgress(0);
        if (vibrationEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        setShowResetConfirmModal(true);
      }
    }, 50);
  };

  const cancelHoldReset = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHoldingReset(false);
    setResetProgress(0);
  };

  const performReset = (type: 'verses' | 'adhkar' | 'both') => {
    setShowResetConfirmModal(false);
    setShowSettingsModal(false);
    if (type === 'verses') resetVersesData();
    else if (type === 'adhkar') resetAdhkarData();
    else resetAllData();
    if (vibrationEnabled) Haptics.selectionAsync();
    const msgs: Record<string, string> = {
      verses: 'تم تصفير المحفوظ من الآيات',
      adhkar: 'تم تصفير الأذكار',
      both: 'تم تصفير جميع البيانات',
    };
    showAlert('تم التصفير', msgs[type]);
  };

  const cancelReset = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (resetCountdownRef.current) clearInterval(resetCountdownRef.current);
    setShowResetConfirmModal(false);
  };

  const statCardWidth = (SCREEN_WIDTH - 32 - 36) / 4;
  const dhikrCardWidth = (SCREEN_WIDTH - 32 - 24) / 3;

  useEffect(() => {
    if (!tourTarget) return;
    if (tourTarget === TOUR_TARGETS.hasanat) ensureVisible('hasanat', homeRefs.current.hasanat, 8);
    else if (tourTarget === TOUR_TARGETS.dashboard) ensureVisible('dashboard', homeRefs.current.statsGrid);
    else if (tourTarget === TOUR_TARGETS.timeAdhkar) ensureVisible('timeAdhkar', homeRefs.current.timeAdhkar);
    else if (tourTarget === TOUR_TARGETS.benefit) ensureVisible('benefit', homeRefs.current.benefit);
    else if (tourTarget === TOUR_TARGETS.dhikrGrid) ensureVisible('dhikrGrid', homeRefs.current.dhikrGrid);
  }, [tourTarget, tourTick, ensureVisible]);

  useEffect(() => {
    if (onboardingDone) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [onboardingDone, scrollRef]);

  const sortedDhikr = [...dhikrItems].sort((a, b) => a.order - b.order);
  const titleFontSizes: Record<string, number> = {
    nakhla: 14,
    'salat-nabi': 13,
    dhikr_qasr: 14,
    hirz: 12,
    'sadaqat-dhikr': 14,
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/bg-pattern.webp')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2,26,19,0.88)' }]} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {(!showWelcome || !onboardingDone) && (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconsRow}>
                <Pressable
                  style={({ pressed }) => [styles.headerSmallIcon, pressed && { opacity: 0.5 }, !soundEnabled && { backgroundColor: 'rgba(239,68,68,0.2)' }]}
                  onPress={toggleSound}
                >
                  <MaterialIcons name={soundEnabled ? 'volume-up' : 'volume-off'} size={18} color={soundEnabled ? theme.textSecondary : '#EF4444'} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.headerSmallIcon, pressed && { opacity: 0.5 }, !vibrationEnabled && { backgroundColor: 'rgba(239,68,68,0.2)' }]}
                  onPress={toggleVibration}
                >
                  <MaterialIcons name={vibrationEnabled ? 'vibration' : 'smartphone'} size={18} color={vibrationEnabled ? theme.textSecondary : '#EF4444'} />
                </Pressable>
                <CloudBadge onPress={() => setShowSettingsModal(true)} />
              </View>
              <View style={styles.hasanatCounterWrap} ref={(el) => { homeRefs.current.hasanat = el; }}>
                <View style={styles.hasanatLabelRow}>
                  <Text style={styles.hasanatLabel}>رصيد الحسنات</Text>
                  <Pressable
                    onPress={() => setShowBalanceInfo(true)}
                    style={styles.balanceInfoBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="help" size={13} color="rgba(255,255,255,0.5)" />
                  </Pressable>
                </View>
                <Animated.View style={pulseStyle}>
                  <Text style={styles.hasanatValue}>+{formatNumber(hasanat, useWesternNumerals)}</Text>
                </Animated.View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.userNameHeader}>{userName || 'مجهول'}</Text>
              <Pressable
                style={({ pressed }) => [styles.profileCircle, pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }]}
                onPress={() => {
                  devTapCountRef.current += 1;
                  if (devTapCountRef.current >= 5) {
                    devTapCountRef.current = 0;
                    toggleDevUnlock();
                    showAlert(isDevUnlocked ? 'Dev Locked' : 'Dev Unlocked', isDevUnlocked ? 'تم قفل كل البطاقات' : 'تم فتح كل البطاقات');
                  }
                }}
              >
                <MaterialIcons name="person-outline" size={28} color={theme.gold} />
              </Pressable>
              <Pressable
                onPress={() => setDrawerOpen(true)}
                style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.5 }]}
                hitSlop={8}
              >
                <MaterialIcons name="menu" size={26} color={theme.textPrimary} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Extra Life Display below header */}
          {extraLifeStr ? (
            <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.extraLifeRow}>
              <Pressable
                onPress={() => setShowExtraLifeInfo(true)}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                hitSlop={8}
              >
                <MaterialIcons name="info-outline" size={14} color={theme.gold} />
              </Pressable>
              <MaterialIcons name="schedule" size={14} color="#10B981" />
              <Text style={styles.extraLifeText}>{extraLifeStr}</Text>
              <Text style={styles.extraLifeLabel}>العمر الإضافي</Text>
            </Animated.View>
          ) : null}



          {/* Target Progress Card */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Pressable
              onPress={() => {
                const e = getElapsedTime();
                showAlert('هدف الذكر', `التقدم: ${(progress * 100).toFixed(4)}%\nالعمر الإضافي: ${formatArabicNumber(e.months, useWesternNumerals)} شهر و ${formatArabicNumber(e.days, useWesternNumerals)} يوم\nالهدف: ${formatArabicNumber(targetYears, useWesternNumerals)} سنة\n\nاستمر في الذكر لتحقيق هدفك!`);
              }}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            >
              <View style={styles.targetCard}>
                <LinearGradient
                  colors={['#064E3B', '#0D7A5F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.targetRow}>
                  <View style={styles.targetLeft}>
                    <Pressable
                      onPress={openTargetModal}
                      style={({ pressed }) => [styles.targetPercentBadge, pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }]}
                    >
                      <MaterialIcons name="settings" size={14} color={theme.gold} />
                      <Text style={styles.targetPercentText}>{useWesternNumerals ? (progress * 100).toFixed(2) : (progress * 100).toFixed(2).replace(/[0-9]/g, d => String.fromCharCode(0x0660 + parseInt(d)))}%</Text>
                    </Pressable>
                  </View>
                  <View style={styles.targetRight}>
                    <View style={styles.targetLabelRow}>
                      <MaterialIcons name="radio-button-checked" size={14} color={theme.gold} />
                      <Text style={styles.targetTitle}>هدف الـ {formatArabicNumber(targetYears, useWesternNumerals)} سنة ذكر</Text>
                      <MaterialIcons name="radio-button-checked" size={14} color={theme.gold} />
                    </View>
                  </View>
                </View>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={['#D4AF37', '#F0D060']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${Math.max(progress * 100, 1)}%` }]}
                  />
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Stats Grid - 4 per row */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.statsGrid} ref={(el) => { homeRefs.current.statsGrid = el; }}>
              {statItems.map((stat, index) => {
                const value = stats[stat.key] || 0;
                const displayValue = `+${formatCompactNumber(value, useWesternNumerals)}`;

                return (
                  <Animated.View
                    key={stat.id}
                    entering={FadeInDown.delay(250 + index * 50).duration(400)}
                  >
                    <View
                      style={[styles.statCard, { width: statCardWidth }]}
                    >
                      <View style={[styles.statIconBg, { backgroundColor: stat.color + '18' }]}>
                        <MaterialIcons name={stat.icon as any} size={18} color={stat.color} />
                      </View>
                      <Text style={[styles.statLabel, { fontSize: stat.label.length <= 5 ? 12 : stat.label.length <= 7 ? 11 : 10 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{stat.label}</Text>
                      <Text style={styles.statValue} numberOfLines={1}>
                        {displayValue}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* Dynamic Time-Based Adhkar Entry */}
          <View ref={(el) => { homeRefs.current.timeAdhkar = el; }}>
          {(() => {
            const slot = getAdhkarTimeSlot();
            if (slot === 'morning') {
              return (
                <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.morningSection}>
                  <Pressable
                    onPress={() => router.push('/morning-adhkar')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                  >
                    <View style={styles.morningCard}>
                      <LinearGradient
                        colors={['rgba(212,175,55,0.15)', 'rgba(6,78,59,0.25)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                      />
                      <View style={styles.morningCardContent}>
                        <MaterialIcons name="chevron-left" size={22} color={theme.gold} />
                        <View style={styles.morningCardText}>
                          <Text style={styles.morningCardTitle}>أذكار الصباح</Text>
                          <Text style={styles.morningCardSubtitle}>16 ذكراً • حصّن يومك</Text>
                        </View>
                        <View style={styles.morningIconCircle}>
                          <MaterialIcons name="wb-sunny" size={22} color="#F59E0B" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            } else if (slot === 'evening') {
              return (
                <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.morningSection}>
                  <Pressable
                    onPress={() => router.push('/evening-adhkar')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                  >
                    <View style={styles.morningCard}>
                      <LinearGradient
                        colors={['rgba(139,92,246,0.15)', 'rgba(6,78,59,0.25)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                      />
                      <View style={styles.morningCardContent}>
                        <MaterialIcons name="chevron-left" size={22} color="#8B5CF6" />
                        <View style={styles.morningCardText}>
                          <Text style={[styles.morningCardTitle, { color: '#8B5CF6' }]}>أذكار المساء</Text>
                          <Text style={styles.morningCardSubtitle}>16 ذكراً • حصّن مساءك</Text>
                        </View>
                        <View style={[styles.morningIconCircle, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                          <MaterialIcons name="nights-stay" size={22} color="#8B5CF6" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            } else if (slot === 'sleep') {
              return (
                <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.morningSection}>
                  <Pressable
                    onPress={() => router.push('/sleep-adhkar')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                  >
                    <View style={styles.morningCard}>
                      <LinearGradient
                        colors={['rgba(99,102,241,0.15)', 'rgba(10,10,46,0.25)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                      />
                      <View style={styles.morningCardContent}>
                        <MaterialIcons name="chevron-left" size={22} color="#6366F1" />
                        <View style={styles.morningCardText}>
                          <Text style={[styles.morningCardTitle, { color: '#6366F1' }]}>أذكار النوم</Text>
                          <Text style={styles.morningCardSubtitle}>10 أذكار • نم على ذكر الله</Text>
                        </View>
                        <View style={[styles.morningIconCircle, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
                          <MaterialIcons name="bedtime" size={22} color="#6366F1" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            } else if (slot === 'wakeup') {
              return (
                <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.morningSection}>
                  <Pressable
                    onPress={() => router.push('/wakeup-adhkar')}
                    style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                  >
                    <View style={styles.morningCard}>
                      <LinearGradient
                        colors={['rgba(245,158,11,0.15)', 'rgba(26,10,0,0.25)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                      />
                      <View style={styles.morningCardContent}>
                        <MaterialIcons name="chevron-left" size={22} color="#F59E0B" />
                        <View style={styles.morningCardText}>
                          <Text style={[styles.morningCardTitle, { color: '#F59E0B' }]}>أذكار الاستيقاظ</Text>
                          <Text style={styles.morningCardSubtitle}>4 أذكار • استقبل يومك</Text>
                        </View>
                        <View style={[styles.morningIconCircle, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                          <MaterialIcons name="wb-twilight" size={22} color="#F59E0B" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            }
            return null;
          })()}
          </View>

          {/* فائدة اليوم */}
          <View ref={(el) => { homeRefs.current.benefit = el; }}>
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.benefitSection}>
            <Pressable
              onPress={() => showAlert('فائدة اليوم', dailyBenefit)}
              style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
            >
              <View style={styles.benefitCard}>
                <LinearGradient
                  colors={['#064E3B', '#0D7A5F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                />
                <View style={styles.benefitHeader}>
                  <Pressable
                    onPress={handleShareBenefit}
                    style={({ pressed }) => [styles.benefitShareBtn, pressed && { opacity: 0.5 }]}
                  >
                    <MaterialIcons name="share" size={14} color={theme.gold} />
                    <Text style={styles.benefitShareText}>انشر تؤجر</Text>
                  </Pressable>
                  <View style={styles.benefitTitleRow}>
                    <MaterialIcons name="auto-awesome" size={20} color={theme.gold} />
                    <Text style={styles.benefitTitle}>فائدة اليوم</Text>
                  </View>
                </View>
                {(() => {
                  const idx = dailyBenefit.lastIndexOf(' - ');
                  const quote = idx !== -1 ? dailyBenefit.slice(0, idx) : dailyBenefit;
                  const narrator = idx !== -1 ? dailyBenefit.slice(idx + 3) : '';
                  return (
                    <View style={styles.benefitBody}>
                      <Text style={styles.benefitText} numberOfLines={2}>{quote}</Text>
                      {narrator !== '' && (
                        <Text style={styles.benefitNarrator}>{narrator}</Text>
                      )}
                    </View>
                  );
                })()}
              </View>
            </Pressable>
          </Animated.View>
          </View>

          {/* Dhikr Action Grid */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View style={styles.dhikrGrid} ref={(el) => { homeRefs.current.dhikrGrid = el; }}>
              {sortedDhikr.map((item, index) => {
                const unlocked = isCardUnlocked(item.id);
                const count = dhikrCounts[item.id] || 0;
                const displayCount =
                  item.id === 'tahlil'
                    ? Math.floor(count / item.targetCount) * (item.slavesFreed || 0)
                    : item.id === 'hasbiyallah'
                    ? Math.floor(count / item.targetCount)
                    : count;

                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(450 + index * 50).duration(400)}
                  >
                    <Pressable
                      onPress={() => handleDhikrPress(item.id)}
                      style={({ pressed }) => [
                        styles.dhikrCard,
                        { width: dhikrCardWidth, height: dhikrCardWidth * 1.4 },
                        unlocked && count > 0 && styles.dhikrCardActive,
                        pressed && styles.dhikrCardPressed,
                        !unlocked && pressed && { opacity: 0.5 },
                      ]}
                    >
                      {unlocked ? (
                        <View style={styles.dhikrCardInner}>
                          <View style={[styles.dhikrIconCircle, { backgroundColor: item.color + '18' }]}>
                            <MaterialIcons name={item.icon as any} size={32} color={item.color} />
                          </View>
                          <View style={styles.dhikrTitleCenter}>
                            <Text style={[styles.dhikrCardTitle, titleFontSizes[item.id] ? { fontSize: titleFontSizes[item.id] } : {}]} numberOfLines={2}>
                              {item.title}
                            </Text>
                          </View>
                          <View style={styles.dhikrCountSlot}>
                            <Text style={[styles.dhikrCountText, { color: item.color, opacity: displayCount > 0 ? 1 : 0 }]}>
                              {displayCount > 0 ? formatArabicNumber(displayCount, useWesternNumerals) : '0'}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.dhikrCardInnerLocked}>
                          <View style={styles.dhikrIconCircleLocked}>
                            <MaterialIcons name="lock-outline" size={32} color="rgba(0,0,0,0.25)" />
                          </View>
                          <View style={styles.dhikrTitleCenter}>
                            <Text style={[styles.dhikrCardTitle, titleFontSizes[item.id] ? { fontSize: titleFontSizes[item.id] } : {}]} numberOfLines={2}>
                              {item.title}
                            </Text>
                          </View>
                          <View style={styles.dhikrCountSlotLocked}>
                            <Text style={styles.dhikrReqText} numberOfLines={3}>
                              {item.unlockRequirement || ''}
                            </Text>
                          </View>
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* وردي الخاص */}
          <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.morningSection}>
            <View style={styles.wirdCardWrap}>
              <Pressable
                onPress={() => router.push('/wird')}
                style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
              >
                <View style={styles.morningCard}>
                  <LinearGradient
                    colors={['rgba(212,175,55,0.12)', 'rgba(6,78,59,0.2)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                  />
                  <View style={styles.morningCardContent}>
                    <View style={styles.morningNavGroup}>
                      <MaterialIcons name="chevron-left" size={22} color={theme.gold} />
                      <Pressable
                        onPress={() => setShowWirdSettings(true)}
                        style={({ pressed }) => [styles.wirdGearBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] }]}
                      >
                        <MaterialIcons name="settings" size={16} color={theme.gold} />
                      </Pressable>
                    </View>
                    <View style={styles.morningCardText}>
                      <Text style={styles.morningCardTitle}>وردي الخاص</Text>
                      <Text style={styles.morningCardSubtitle}>
                        {(() => {
                          const enabled = wirdConfig.filter(i => i.enabled);
                          const doneToday = enabled.filter(i => (wirdCounts[i.id] || 0) >= i.target).length;
                          return enabled.length === 0
                            ? 'أضف أذكارك وفعّلها'
                            : `${enabled.length} أذكار مفعلة • أتممت ${doneToday} اليوم`;
                        })()}
                      </Text>
                    </View>
                    <View style={styles.morningIconCircle}>
                      <MaterialIcons name="favorite" size={22} color={theme.gold} />
                    </View>
                  </View>
                  {(() => {
                    const enabled = wirdConfig.filter(i => i.enabled);
                    const doneToday = enabled.filter(i => (wirdCounts[i.id] || 0) >= i.target).length;
                    const pct = enabled.length ? Math.round((doneToday / enabled.length) * 100) : 0;
                    if (enabled.length === 0) return null;
                    return (
                      <View style={styles.wirdProgressWrap}>
                        <View style={styles.wirdProgressHeader}>
                          <Text style={styles.wirdProgressLabel}>إنجاز ورد اليوم</Text>
                          <Text style={styles.wirdProgressValue}>
                            {formatArabicNumber(doneToday, useWesternNumerals)}/{formatArabicNumber(enabled.length, useWesternNumerals)}
                          </Text>
                        </View>
                        <View style={styles.wirdProgressBarBg}>
                          <View style={[styles.wirdProgressBarFill, { width: `${Math.max(pct, 2)}%` }]} />
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
        )}
      </SafeAreaView>

      {/* Target Settings Modal */}
      <Modal visible={showTargetModal} transparent animationType="fade">
        <Pressable style={styles.targetModalOverlay} onPress={() => setShowTargetModal(false)}>
          <View />
        </Pressable>
        <View style={styles.targetModalWrapper}>
          <View style={styles.targetModalContent}>
            <View style={styles.targetModalOrnament}>
              <LinearGradient
                colors={['rgba(6,78,59,0.15)', 'rgba(212,175,55,0.1)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
              />
              <MaterialIcons name="flag" size={28} color={theme.gold} />
            </View>

            <Text style={styles.targetModalTitle}>ضبط الهدف</Text>
            <Text style={styles.targetModalSubtitle}>حدد المدة الزمنية لهدفك في الذكر</Text>

            <View style={styles.targetYearsDisplay}>
              <LinearGradient
                colors={['rgba(6,78,59,0.08)', 'rgba(212,175,55,0.06)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              />
              <Text style={styles.targetYearsNumber}>{formatArabicNumber(tempTargetYears, useWesternNumerals)}</Text>
              <Text style={styles.targetYearsUnit}>سنة ذكر</Text>
            </View>

            <View style={styles.targetAdjuster}>
              <Pressable
                onPress={() => setTempTargetYears(prev => Math.max(1, prev - 5))}
                style={({ pressed }) => [styles.targetAdjBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] }]}
              >
                <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
                <MaterialIcons name="remove" size={24} color="#FFF" />
              </Pressable>

              <Pressable
                onPress={() => setTempTargetYears(prev => Math.max(1, prev - 1))}
                style={({ pressed }) => [styles.targetAdjBtnSmall, pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] }]}
              >
                <MaterialIcons name="chevron-left" size={20} color="#064E3B" />
              </Pressable>

              <View style={styles.targetAdjCenter}>
                <Text style={styles.targetAdjCenterText}>{formatArabicNumber(tempTargetYears, useWesternNumerals)}</Text>
              </View>

              <Pressable
                onPress={() => setTempTargetYears(prev => Math.min(100, prev + 1))}
                style={({ pressed }) => [styles.targetAdjBtnSmall, pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] }]}
              >
                <MaterialIcons name="chevron-right" size={20} color="#064E3B" />
              </Pressable>

              <Pressable
                onPress={() => setTempTargetYears(prev => Math.min(100, prev + 5))}
                style={({ pressed }) => [styles.targetAdjBtn, pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] }]}
              >
                <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
                <MaterialIcons name="add" size={24} color="#FFF" />
              </Pressable>
            </View>

            <View style={styles.targetPresets}>
              {[10, 20, 40, 60, 80].map((y) => (
                <Pressable
                  key={y}
                  onPress={() => setTempTargetYears(y)}
                  style={({ pressed }) => [
                    styles.targetPresetBtn,
                    tempTargetYears === y && styles.targetPresetBtnActive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.targetPresetText, tempTargetYears === y && styles.targetPresetTextActive]}>
                    {formatArabicNumber(y, useWesternNumerals)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.targetSpiritualMsg}>
              <Text style={styles.targetSpiritualText}>
                {"كلما كبر الهدف عظم الأجر.. والله لا يضيع أجر المحسنين"}
              </Text>
            </View>

            <Pressable
              onPress={confirmTargetYears}
              style={({ pressed }) => [styles.targetConfirmBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
              <MaterialIcons name="check-circle" size={20} color="#FFF" />
              <Text style={styles.targetConfirmText}>تثبيت الهدف</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowTargetModal(false)}
              style={({ pressed }) => [styles.targetCancelBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.targetCancelText}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Welcome Modal */}
      <Modal visible={loaded && showWelcome && onboardingDone} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.welcomeOverlay}
        >
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIconCircle}>
              <MaterialIcons name="person-outline" size={36} color={theme.gold} />
            </View>
            <Text style={styles.welcomeTitle}>مرحباً بك في محرابك</Text>
            <Text style={styles.welcomeSubtitle}>اختر هويتك في رحلة اليقين</Text>

            {cloudUser?.name && (
              <View style={styles.welcomeGoogleNote}>
                <MaterialIcons name="check-circle" size={16} color="#059669" />
                <Text style={styles.welcomeGoogleNoteText}>
                  متصل بحساب جيمايل: {cloudUser.name} — يمكنك تغيير اسمك هنا
                </Text>
              </View>
            )}

            {!showNameInput ? (
              <>
                {!cloudUser && (
                  <>
                    <Pressable
                      onPress={onWelcomeGoogleLink}
                      disabled={cloudLoading}
                      style={({ pressed }) => [styles.welcomeGoogleBtn, pressed && { opacity: 0.7 }]}
                    >
                      <MaterialIcons name="email" size={20} color="#333" />
                      <Text style={styles.welcomeGoogleBtnText}>
                        {cloudLoading ? 'جاري الاتصال...' : 'اتصل بالبريد الإلكتروني'}
                      </Text>
                    </Pressable>
                    <Text style={styles.welcomeGoogleSub}>لحفظ رصيدك</Text>
                    {cloudError && (
                      <Text style={styles.welcomeGoogleError}>{cloudError}</Text>
                    )}
                  </>
                )}
                <Pressable
                  onPress={() => {
                    const gender = welcomeGender || 'male';
                    const pool = gender === 'female' ? FEMALE_NAMES : MALE_NAMES;
                    setCustomNameInput(pool[Math.floor(Math.random() * pool.length)]);
                    setWelcomeGender(gender);
                    setShowNameInput(true);
                  }}
                  style={({ pressed }) => [styles.welcomeBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                >
                  <LinearGradient
                    colors={['#064E3B', '#0D7A5F']}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                  />
                  <Text style={styles.welcomeBtnText}>اختيار اسم افتراضي</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!welcomeGender) setWelcomeGender('male');
                    setShowNameInput(true);
                  }}
                  style={({ pressed }) => [styles.welcomeBtnOutline, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
                >
                  <Text style={styles.welcomeBtnOutlineText}>كتابة اسمي الخاص</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                  <TextInput
                    style={[styles.welcomeInput, { flex: 1, marginBottom: 0 }]}
                    placeholder="اكتب اسمك هنا..."
                    placeholderTextColor="#999"
                    value={customNameInput}
                    onChangeText={setCustomNameInput}
                    textAlign="right"
                    autoFocus
                  />
                  <Pressable
                    onPress={() => {
                      const pool = welcomeGender === 'female' ? FEMALE_NAMES : MALE_NAMES;
                      setCustomNameInput(pool[Math.floor(Math.random() * pool.length)]);
                    }}
                    style={({ pressed }) => [{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      backgroundColor: '#064E3B',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
                  >
                    <MaterialIcons name="swap-horiz" size={24} color="#FFF" />
                  </Pressable>
                </View>
                <View style={styles.welcomeGenderRow}>
                  <Pressable
                    onPress={() => {
                      setWelcomeGender('male');
                      setCustomNameInput(MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]);
                    }}
                    style={({ pressed }) => [styles.welcomeGenderBtnSmall, welcomeGender === 'male' && styles.welcomeGenderBtnActive, pressed && { opacity: 0.8 }]}
                  >
                    <MaterialIcons name="man" size={18} color={welcomeGender === 'male' ? '#FFF' : '#064E3B'} />
                    <Text style={[styles.welcomeGenderTextSmall, welcomeGender === 'male' && styles.welcomeGenderTextActive]}>ذكر</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setWelcomeGender('female');
                      setCustomNameInput(FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]);
                    }}
                    style={({ pressed }) => [styles.welcomeGenderBtnSmall, welcomeGender === 'female' && styles.welcomeGenderBtnActive, pressed && { opacity: 0.8 }]}
                  >
                    <MaterialIcons name="woman" size={18} color={welcomeGender === 'female' ? '#FFF' : '#064E3B'} />
                    <Text style={[styles.welcomeGenderTextSmall, welcomeGender === 'female' && styles.welcomeGenderTextActive]}>أنثى</Text>
                  </Pressable>
                </View>

                {/* Country selector (below gender) */}
                <Pressable
                  onPress={() => setShowCountryList((v) => !v)}
                  style={({ pressed }) => [styles.countryField, showCountryList && styles.countryFieldActive, pressed && { opacity: 0.8 }]}
                >
                  {welcomeCountry && getCountryByCode(welcomeCountry) ? (
                    <View style={styles.countryOptionInner}>
                      <Text style={styles.countryOptionFlag}>{getCountryByCode(welcomeCountry)!.flag}</Text>
                      <Text style={styles.countryFieldText}>{getCountryByCode(welcomeCountry)!.name}</Text>
                    </View>
                  ) : (
                    <Text style={styles.countryFieldText}>اختر دولتك</Text>
                  )}
                  <MaterialIcons name={showCountryList ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color="rgba(6,78,59,0.7)" />
                </Pressable>
                {showCountryList && (
                  <View style={styles.countryList}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                      {COUNTRIES.map((c) => (
                        <Pressable
                          key={c.code}
                          onPress={() => { setWelcomeCountry(c.code); setShowCountryList(false); }}
                          style={({ pressed }) => [
                            styles.countryOption,
                            welcomeCountry === c.code && styles.countryOptionActive,
                            pressed && { backgroundColor: 'rgba(6,78,59,0.08)' },
                          ]}
                        >
                          <View style={styles.countryOptionInner}>
                            <Text style={styles.countryOptionFlag}>{c.flag}</Text>
                            <Text style={styles.countryOptionText}>{c.name}</Text>
                          </View>
                          {welcomeCountry === c.code && <MaterialIcons name="check" size={18} color="#064E3B" />}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Pressable
                  onPress={handleSubmitCustomName}
                  style={({ pressed }) => [styles.welcomeBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
                >
                  <LinearGradient
                    colors={['#064E3B', '#0D7A5F']}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                  />
                  <Text style={styles.welcomeBtnText}>ابدأ الرحلة</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowNameInput(false)}
                  style={({ pressed }) => [styles.welcomeBtnOutline, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.welcomeBtnOutlineText}>رجوع</Text>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Drawer */}
      <Modal visible={drawerOpen} transparent animationType="slide">
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Pressable style={styles.drawerOverlay} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawerPanel}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>محراب</Text>
              <MaterialIcons name="auto-awesome" size={22} color={theme.gold} />
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => setDrawerOpen(false)}
                style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                hitSlop={12}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </Pressable>
            </View>
            <View style={styles.drawerSep} />

            {[
              { icon: 'settings', label: 'الإعدادات', route: 'settings' },
              { icon: 'info-outline', label: 'عن التطبيق', route: 'about' },
              { icon: 'apps', label: 'تطبيقاتنا', route: 'our-apps' },
              { icon: 'share', label: 'شارك التطبيق', route: 'share' },
              { icon: 'privacy-tip', label: 'سياسة الخصوصية', route: 'privacy' },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => handleDrawerNavigate(item.route)}
                style={({ pressed }) => [
                  styles.drawerItem,
                  pressed && { opacity: 0.6, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Text style={styles.drawerItemText}>
                  {item.label}
                </Text>
                <MaterialIcons
                  name={item.icon as any}
                  size={22}
                  color="#666"
                />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} transparent animationType="fade">
        <Pressable style={styles.settingsOverlay} onPress={() => setShowSettingsModal(false)}>
          <View />
        </Pressable>
        <View style={styles.settingsWrapper}>
          <ScrollView style={{ maxHeight: '85%' }} showsVerticalScrollIndicator={false}>
            <View style={styles.settingsModal}>
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>الإعدادات</Text>
                <Pressable
                  onPress={() => setShowSettingsModal(false)}
                  style={({ pressed }) => [styles.settingsCloseBtn, pressed && { opacity: 0.5 }]}
                >
                  <MaterialIcons name="close" size={22} color="#999" />
                </Pressable>
              </View>

              <View style={styles.settingsSep} />

              {/* User Info + Edit Name */}
              <Pressable
                onPress={openEditName}
                style={({ pressed }) => [styles.settingsUserRow, pressed && { opacity: 0.7 }]}
              >
                <View style={styles.settingsUserCircle}>
                  <MaterialIcons name="person-outline" size={24} color={theme.gold} />
                </View>
                <View style={styles.settingsUserInfo}>
                  <Text style={styles.settingsUserName}>{userName || 'مجهول'}</Text>
                </View>
                <MaterialIcons name="edit" size={18} color="#999" />
              </Pressable>

              <View style={styles.settingsSep} />

              {/* Sound Toggle */}
              <View style={styles.settingRow}>
                <Switch
                  value={soundEnabled}
                  onValueChange={toggleSound}
                  trackColor={{ false: '#DDD', true: '#064E3B' }}
                  thumbColor={soundEnabled ? '#D4AF37' : '#999'}
                />
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingLabel}>الصوت</Text>
                  <Text style={styles.settingDesc}>تشغيل أصوات التسبيح</Text>
                </View>
                <MaterialIcons name={soundEnabled ? 'volume-up' : 'volume-off'} size={22} color={soundEnabled ? '#064E3B' : '#999'} />
              </View>

              {/* Vibration Toggle */}
              <View style={styles.settingRow}>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={toggleVibration}
                  trackColor={{ false: '#DDD', true: '#064E3B' }}
                  thumbColor={vibrationEnabled ? '#D4AF37' : '#999'}
                />
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingLabel}>الاهتزاز</Text>
                  <Text style={styles.settingDesc}>اهتزاز عند كل تسبيحة</Text>
                </View>
                <MaterialIcons name={vibrationEnabled ? 'vibration' : 'smartphone'} size={22} color={vibrationEnabled ? '#064E3B' : '#999'} />
              </View>

              {/* Numeral System Toggle */}
              <View style={styles.settingRow}>
                <Switch
                  value={useWesternNumerals}
                  onValueChange={toggleNumeralSystem}
                  trackColor={{ false: '#DDD', true: '#064E3B' }}
                  thumbColor={useWesternNumerals ? '#D4AF37' : '#999'}
                />
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingLabel}>نظام الأرقام</Text>
                  <Text style={styles.settingDesc}>{useWesternNumerals ? 'أرقام غربية (1, 2, 3)' : 'أرقام عربية (١، ٢، ٣)'}</Text>
                </View>
                <MaterialIcons name="translate" size={22} color={useWesternNumerals ? '#064E3B' : '#999'} />
              </View>

              {/* Night Mode Toggle */}
              <View style={styles.settingRow}>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: '#DDD', true: '#064E3B' }}
                  thumbColor={isDarkMode ? '#D4AF37' : '#999'}
                />
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingLabel}>الوضع الليلي</Text>
                  <Text style={styles.settingDesc}>ثيم داكن مريح للعين ليلاً</Text>
                </View>
                <MaterialIcons name={isDarkMode ? 'dark-mode' : 'light-mode'} size={22} color={isDarkMode ? '#064E3B' : '#999'} />
              </View>

              <View style={styles.settingsSep} />

              {/* Replay the first-run app tour */}
              <Pressable
                onPress={() => {
                  setShowSettingsModal(false);
                  setOnboardingDone(false);
                }}
                style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
              >
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingLabel}>عرض شرح التطبيق</Text>
                  <Text style={styles.settingDesc}>إعادة جولة التعريف بعناصر التطبيق</Text>
                </View>
                <MaterialIcons name="help-outline" size={22} color="#064E3B" />
              </Pressable>

              <View style={styles.settingsSep} />

              {/* Google connect state */}
              {cloudUser ? (
                <View style={styles.googleReminderWrap}>
                  <View style={[styles.googleReminderCard, styles.googleConnectedCard]}>
                    <View style={[styles.googleReminderIcon, { backgroundColor: '#10B981' }]}>
                      <MaterialIcons name="cloud-done" size={22} color="#FFF" />
                    </View>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>متصل بحساب جيمايل</Text>
                      <Text style={styles.settingDesc}>
                        {[cloudUser.name, cloudUser.email].filter(Boolean).join(' • ') || 'رصيدك محفوظ'} — رصيدك ومراجعاتك تُحفظ
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => { unlinkGoogle().catch(() => {}); }}
                      style={({ pressed }) => [styles.unlinkBtn, pressed && { opacity: 0.6 }]}
                      hitSlop={8}
                    >
                      <MaterialIcons name="link-off" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.googleReminderWrap}>
                  {cloudLoading ? (
                    <View style={styles.googleReminderCard}>
                      <ActivityIndicator size="small" color="#064E3B" />
                      <View style={styles.settingTextCol}>
                        <Text style={styles.settingLabel}>جاري الاتصال بجيمايل...</Text>
                        <Text style={styles.settingDesc}>يُرجى اختيار الحساب في المتصفح</Text>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => { linkGoogle().catch(() => {}); }}
                      style={({ pressed }) => [styles.googleReminderCard, pressed && { opacity: 0.8 }]}
                    >
                      <View style={styles.googleReminderIcon}>
                        <MaterialIcons name="cloud-upload" size={22} color="#FFF" />
                      </View>
                      <View style={styles.settingTextCol}>
                        <Text style={styles.settingLabel}>اربط حساب جيمايل</Text>
                        <Text style={styles.settingDesc}>ليُحفظ رصيد حسناتك ويراجعاتك معك أينما كنت</Text>
                      </View>
                      <MaterialIcons name="chevron-left" size={20} color="#064E3B" />
                    </Pressable>
                  )}
                  {cloudError && (
                    <Text style={styles.googleReminderError}>{cloudError}</Text>
                  )}
                </View>
              )}

              <View style={styles.settingsSep} />

              {/* Full Reset - Long Press */}
              <View style={styles.resetSection}>
                <Text style={styles.resetSectionTitle}>منطقة الخطر</Text>
                <Pressable
                  onPressIn={startHoldReset}
                  onPressOut={cancelHoldReset}
                  style={({ pressed }) => [styles.resetButton, isHoldingReset && styles.resetButtonActive]}
                >
                  <MaterialIcons name="delete-forever" size={20} color={isHoldingReset ? '#FFF' : '#EF4444'} />
                  <Text style={[styles.resetButtonText, isHoldingReset && { color: '#FFF' }]} numberOfLines={1}>
                    تصفير جميع البيانات (اضغط 3 ثوانٍ)
                  </Text>
                </Pressable>
                <View style={styles.resetProgressBar}>
                  <View style={[styles.resetProgressFill, { width: `${(isHoldingReset ? resetProgress : 0) * 100}%` }]} />
                </View>
              </View>

              <View style={styles.settingsSep} />

              <Text style={styles.settingsVersion}>ابنِ جنتك • الإصدار 1.0.0</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal visible={showEditNameModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.editNameOverlay}
        >
          <View style={styles.editNameCard}>
            <Text style={styles.editNameTitle}>تعديل الاسم</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <TextInput
                style={[styles.editNameInput, { flex: 1 }]}
                placeholder="اكتب اسمك الجديد..."
                placeholderTextColor="#999"
                value={editNameInput}
                onChangeText={setEditNameInput}
                textAlign="right"
                autoFocus
              />
              <Pressable
                onPress={() => {
                  const pool = editShowGender === 'female' ? FEMALE_NAMES : MALE_NAMES;
                  setEditNameInput(pool[Math.floor(Math.random() * pool.length)]);
                }}
                style={({ pressed }) => [{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  backgroundColor: '#064E3B',
                  alignItems: 'center',
                  justifyContent: 'center',
                }, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
              >
                <MaterialIcons name="swap-horiz" size={24} color="#FFF" />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
              <Pressable
                onPress={() => {
                  setEditShowGender('male');
                  setEditNameInput(MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]);
                }}
                style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: editShowGender === 'male' ? '#064E3B' : 'rgba(255,255,255,0.06)' }, pressed && { opacity: 0.8 }]}
              >
                <MaterialIcons name="man" size={16} color={editShowGender === 'male' ? '#FFF' : '#064E3B'} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: editShowGender === 'male' ? '#FFF' : '#064E3B' }}>ذكر</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setEditShowGender('female');
                  setEditNameInput(FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]);
                }}
                style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: editShowGender === 'female' ? '#064E3B' : 'rgba(255,255,255,0.06)' }, pressed && { opacity: 0.8 }]}
              >
                <MaterialIcons name="woman" size={16} color={editShowGender === 'female' ? '#FFF' : '#064E3B'} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: editShowGender === 'female' ? '#FFF' : '#064E3B' }}>أنثى</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={confirmEditName}
              style={({ pressed }) => [styles.editNameConfirm, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
              <Text style={styles.editNameConfirmText}>حفظ</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowEditNameModal(false);
                setEditShowGender('male');
              }}
              style={({ pressed }) => [styles.editNameCancel, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.editNameCancelText}>إلغاء</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Extra Life Info Modal */}
      <Modal visible={showExtraLifeInfo} transparent animationType="fade">
        <Pressable style={styles.settingsOverlay} onPress={() => setShowExtraLifeInfo(false)}>
          <View />
        </Pressable>
        <View style={styles.targetModalWrapper}>
          <View style={[styles.targetModalContent, { paddingTop: 24 }]}>
            <View style={styles.dalilIconCircleInfo}>
              <MaterialIcons name="schedule" size={28} color="#10B981" />
            </View>
            <Text style={styles.infoModalTitle}>مضاعف الزمن الروحي</Text>
            <View style={styles.infoModalCard}>
              <Text style={styles.infoModalText}>
                {'ستجد في البطاقات أدناه بعض الأذكار التي فيها كنزٌ استثماري؛ تنطق بها في ثوانٍ معدودة، فيُكتب في صحيفتك أجر من جلس يذكر الله لساعات أو لأيام متواصلة دون انقطاع. إنها استثمار حقيقي لعمرك الفاني.'}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowExtraLifeInfo(false)}
              style={({ pressed }) => [styles.targetConfirmBtn, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
              <Text style={styles.targetConfirmText}>فهمت</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Smart Rating Modal */}
      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.ratingOverlay}>
          <View style={styles.ratingModal}>
            <View style={styles.ratingIconCircle}>
              <MaterialIcons name="star-rate" size={32} color={theme.gold} />
            </View>
            <Text style={styles.ratingTitle}>طلب تقييم التطبيق</Text>
            <View style={styles.ratingMsgCard}>
              <Text style={styles.ratingMsg}>
                {"إن أعجبك التطبيق وأردت أن تكون شريكاً في انتشار الذكر، فضلاً قيّمه في المتجر. تقييمك صدقة جارية تنتفع بها أنت وغيرك."}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                markReviewAsRated();
                setShowRatingModal(false);
                Linking.openURL('https://play.google.com/store/apps/details?id=ai.onspace.banijannatak').catch(() => {});
              }}
              style={({ pressed }) => [styles.ratingPrimaryBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
              <MaterialIcons name="star" size={18} color={theme.gold} />
              <Text style={styles.ratingPrimaryText}>قيّم الآن</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                deferReview();
                setShowRatingModal(false);
              }}
              style={({ pressed }) => [styles.ratingSecondaryBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.ratingSecondaryText}>سأقيم لاحقاً</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={showAboutModal} transparent animationType="fade">
        <Pressable style={styles.settingsOverlay} onPress={() => setShowAboutModal(false)}>
          <View />
        </Pressable>
        <View style={styles.targetModalWrapper}>
          <View style={[styles.targetModalContent, { paddingTop: 24 }]}>
            <View style={styles.aboutIconCircle}>
              <MaterialIcons name="info" size={28} color={theme.gold} />
            </View>
            <Text style={styles.aboutTitle}>عن التطبيق</Text>
            <Text style={styles.aboutSubtitle}>ابنِ جنتك</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                {"تطبيق روحاني يساعدك على تتبع أذكارك اليومية والاستثمار في صدقاتك الجارية. كل ذكر تذكره هنا هو لبنة في جنتك الباقية، وكل دقيقة استثمارٌ لعمرك الفاني في حياة أبدية. اللهم تقبل."}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowAboutModal(false)}
              style={({ pressed }) => [styles.targetConfirmBtn, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
              <Text style={styles.targetConfirmText}>حسناً</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={showPrivacyModal} transparent animationType="fade">
        <Pressable style={styles.settingsOverlay} onPress={() => setShowPrivacyModal(false)}>
          <View />
        </Pressable>
        <View style={styles.targetModalWrapper}>
          <View style={[styles.targetModalContent, { paddingTop: 24 }]}>
            <View style={styles.aboutIconCircle}>
              <MaterialIcons name="privacy-tip" size={28} color={theme.gold} />
            </View>
            <Text style={styles.aboutTitle}>سياسة الخصوصية</Text>
            <Text style={styles.aboutSubtitle}>ابنِ جنتك</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                {"تطبيق ابنِ جنتك يحترم خصوصيتك ويحافظ عليها:\n\n- جميع بياناتك (الأذكار، الإحصائيات، تقدم الحفظ) تُحفظ محلياً على جهازك فقط.\n- لا نجمع أي بيانات شخصية ولا نشاركها مع أي طرف.\n- لا نستخدم إعلانات التتبع.\n- الإشعارات والتنبيهات محلية بالكامل على جهازك.\n- لا توجد مزامنة سحابية؛ فبياناتك ملكك وحدك."}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowPrivacyModal(false)}
              style={({ pressed }) => [styles.targetConfirmBtn, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
              <Text style={styles.targetConfirmText}>حسناً</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Full Reset Confirmation Modal */}
      <Modal visible={showResetConfirmModal} transparent animationType="fade">
        <Pressable onPress={cancelReset} style={styles.resetConfirmOverlay}>
          <Pressable onPress={() => {}} style={styles.resetConfirmModal}>
            <View style={styles.resetConfirmOrnament}>
              <MaterialIcons name="warning" size={32} color="#EF4444" />
            </View>
            <Text style={styles.resetConfirmTitle}>ما الذي تريد تصفيره؟</Text>
            <View style={styles.resetConfirmMsgCard}>
              <Text style={styles.resetConfirmMsg}>
                {"التصفير يمس البيانات المحلية فقط. أما ما خطته ملائكة الرحمن في صحائفك فهو محفوظ عند ربٍّ لا يغفل ولا ينسى."}
              </Text>
            </View>
            <Pressable
              onPress={() => performReset('verses')}
              style={({ pressed }) => [styles.resetOptionBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <MaterialIcons name="book" size={20} color="#D4AF37" />
              <Text style={styles.resetOptionBtnText}>
                المحفوظ من الآيات فقط
              </Text>
            </Pressable>
            <Pressable
              onPress={() => performReset('adhkar')}
              style={({ pressed }) => [styles.resetOptionBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={{fontSize: 20}}>📿</Text>
              <Text style={styles.resetOptionBtnText}>
                الأذكار فقط
              </Text>
            </Pressable>
            <Pressable
              onPress={() => performReset('both')}
              style={({ pressed }) => [styles.resetOptionBtn, styles.resetOptionBtnDanger, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <MaterialIcons name="delete-forever" size={20} color="#FFF" />
              <Text style={[styles.resetOptionBtnText, { color: '#FFF' }]}>
                كلاهما
              </Text>
            </Pressable>
            <Pressable
              onPress={cancelReset}
              style={({ pressed }) => [styles.resetConfirmCancelBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.resetConfirmCancelText}>إلغاء</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Balance Scale Info Modal */}
      <Modal visible={showBalanceInfo} transparent animationType="fade">
        <Pressable onPress={() => setShowBalanceInfo(false)} style={styles.resetConfirmOverlay}>
          <Pressable onPress={() => {}} style={styles.resetConfirmModal}>
            <View style={styles.resetConfirmOrnament}>
              <MaterialIcons name="info-outline" size={32} color="#D4AF37" />
            </View>
            <Text style={styles.resetConfirmTitle}>مقياس رصيد الحسنات</Text>
            <View style={styles.resetConfirmMsgCard}>
              {([
                ['K', '1000'],
                ['M', '1000000'],
                ['B', '1000000000'],
                ['T', '1000000000000'],
              ] as const).map(([unit, count]) => (
                <View key={unit} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#1a1a1a' }}>1{unit}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#666' }}>{count} حسنة</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => setShowBalanceInfo(false)}
              style={({ pressed }) => [styles.resetConfirmCancelBtn, { borderColor: 'rgba(212,175,55,0.5)', borderWidth: 1 }, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.resetConfirmCancelText}>حسناً</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {sharingBenefit && (() => {
        const idx = dailyBenefit.lastIndexOf(' - ');
        const quote = idx !== -1 ? dailyBenefit.slice(0, idx) : dailyBenefit;
        const narrator = idx !== -1 ? dailyBenefit.slice(idx + 3) : '';
        return (
          <View ref={benefitShareCardRef} collapsable={false} style={styles.shareCardCapture}>
            <LinearGradient
              colors={['#0D2B1D', '#1A4A2E', '#0D2B1D']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.benefitShareCardInner}>
              <View style={styles.shareOrnament}>
                <Image source={require('../../assets/images/logo.png')} style={styles.shareLogo} />
                <View style={styles.shareDividerLine} />
              </View>
              <View style={styles.benefitShareTextWrap}>
                <Text style={styles.benefitShareCardText}>{quote}</Text>
              </View>
              {narrator !== '' && (
                <Text style={styles.benefitShareNarrator}>{narrator}</Text>
              )}
              <Text style={styles.benefitShareTitle}>فائدة اليوم</Text>
            </View>
          </View>
        );
      })()}

      <WirdSettingsModal
        visible={showWirdSettings}
        onClose={() => setShowWirdSettings(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerLeft: {
    flex: 1,
  },
  headerIconsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  headerSmallIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hasanatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  hasanatCounterWrap: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  hasanatLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceInfoBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hasanatValue: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.gold,
    textAlign: 'left',
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userNameHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.gold,
    writingDirection: 'rtl',
    marginRight: 6,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Extra Life Row
  extraLifeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 4,
  },
  extraLifeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    writingDirection: 'rtl',
  },
  extraLifeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    writingDirection: 'rtl',
  },
  targetCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.gold,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  targetLeft: {},
  targetPercentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetPercentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  targetRight: {},
  targetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  statIconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 3,
  },
  // Morning Adhkar Entry
  morningSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  morningCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  morningCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  morningNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  morningCardText: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  morningCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  morningCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    writingDirection: 'rtl',
    marginTop: 2,
  },
  morningIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wirdCardWrap: {
    position: 'relative',
    marginTop: 20,
  },
  wirdGearBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wirdProgressWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,175,55,0.18)',
  },
  wirdProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  wirdProgressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textSecondary,
    writingDirection: 'rtl',
  },
  wirdProgressValue: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  wirdProgressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  wirdProgressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.gold,
  },
  benefitSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  benefitCard: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  benefitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  benefitShareText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  benefitBody: {
    height: 56,
    overflow: 'hidden',
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 28,
  },
  benefitNarrator: {
    position: 'absolute',
    left: 0,
    bottom: 1,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'left',
  },
  dhikrCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: 2,
  },
  dhikrCardInnerLocked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingTop: 2,
  },
  dhikrCountSlot: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dhikrCountSlotLocked: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  dhikrIconCircleLocked: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dhikrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'center',
  },
  dhikrCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  dhikrCardActive: {
    backgroundColor: '#F0FFF4',
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  dhikrCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  dhikrIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dhikrTitleCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  dhikrCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 21,
  },
  dhikrCountText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  dhikrReqText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 16,
  },
  // Target Settings Modal
  targetModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  targetModalWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    pointerEvents: 'box-none',
  },
  targetModalContent: {
    width: '100%',
    backgroundColor: '#FFFEF8',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.3)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  targetModalOrnament: {
    position: 'absolute',
    top: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.gold,
    backgroundColor: '#FFFEF8',
    overflow: 'hidden',
  },
  targetModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginTop: 4,
    marginBottom: 4,
  },
  targetModalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    writingDirection: 'rtl',
    marginBottom: 20,
  },
  targetYearsDisplay: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    marginBottom: 18,
  },
  targetYearsNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: '#064E3B',
  },
  targetYearsUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.gold,
    marginTop: 2,
  },
  targetAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  targetAdjBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  targetAdjBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,78,59,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.15)',
  },
  targetAdjCenter: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  targetAdjCenterText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
  },
  targetPresets: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  targetPresetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  targetPresetBtnActive: {
    backgroundColor: 'rgba(6,78,59,0.12)',
    borderColor: '#064E3B',
  },
  targetPresetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  targetPresetTextActive: {
    color: '#064E3B',
  },
  targetSpiritualMsg: {
    width: '100%',
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  targetSpiritualText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B8941E',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  targetConfirmBtn: {
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
  targetConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  targetCancelBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  // Welcome Modal
  welcomeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.gold,
  },
  welcomeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    writingDirection: 'rtl',
    marginBottom: 24,
  },
  welcomeGoogleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(5,150,105,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.25)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    maxWidth: '100%',
  },
  welcomeGoogleNoteText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    writingDirection: 'rtl',
    lineHeight: 18,
  },
  welcomeGoogleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
    marginBottom: 10,
  },
  welcomeGoogleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  welcomeGoogleSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  welcomeGoogleError: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
  },
  welcomeBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  welcomeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  welcomeBtnOutline: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  welcomeBtnOutlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  welcomeGenderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  welcomeGenderRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  welcomeGenderBtn: {
    flex: 1,
    height: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(6,78,59,0.3)',
    backgroundColor: 'rgba(6,78,59,0.08)',
  },
  welcomeGenderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
    writingDirection: 'rtl',
  },
  welcomeGenderBtnSmall: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(6,78,59,0.3)',
    backgroundColor: 'rgba(6,78,59,0.08)',
  },
  welcomeGenderBtnActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  welcomeGenderTextSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#064E3B',
    writingDirection: 'rtl',
  },
  welcomeGenderTextActive: {
    color: '#FFF',
  },
  countryField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    direction: 'rtl',
    width: '100%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(6,78,59,0.3)',
    backgroundColor: 'rgba(6,78,59,0.06)',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  countryFieldActive: {
    borderColor: '#064E3B',
    backgroundColor: 'rgba(6,78,59,0.1)',
  },
  countryFieldText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#064E3B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  countryList: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(6,78,59,0.2)',
    backgroundColor: '#FFF',
    marginBottom: 12,
    paddingVertical: 4,
    maxHeight: 190,
    direction: 'rtl',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    direction: 'rtl',
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  countryOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    direction: 'rtl',
    gap: 8,
    flex: 1,
  },
  countryOptionActive: {
    backgroundColor: 'rgba(6,78,59,0.1)',
  },
  countryOptionFlag: {
    fontSize: 18,
  },
  countryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#064E3B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  welcomeBackBtn: {
    alignSelf: 'center',
    marginTop: 4,
    padding: 8,
  },
  welcomeBackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    writingDirection: 'rtl',
  },
  welcomeInput: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDD',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    writingDirection: 'rtl',
  },
  // Drawer
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerPanel: {
    width: 280,
    backgroundColor: '#FAFAFA',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#064E3B',
    writingDirection: 'rtl',
  },
  drawerSep: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(6,78,59,0.08)',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    writingDirection: 'rtl',
  },
  drawerItemTextActive: {
    color: '#064E3B',
    fontWeight: '700',
  },
  // Settings Modal
  settingsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  settingsWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    pointerEvents: 'box-none',
  },
  settingsModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.25)',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  settingsCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsSep: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },
  settingsUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  settingsUserCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  settingsUserInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  settingsUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  settingsUserRank: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    writingDirection: 'rtl',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingVertical: 4,
  },
  settingTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  settingDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999',
    writingDirection: 'rtl',
  },
  // Reset section in settings
  resetSection: {
    alignItems: 'center',
    gap: 6,
  },
  googleReminderWrap: {
    width: '100%',
    marginTop: 2,
  },
  googleReminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(5,150,105,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.25)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  googleConnectedCard: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.4)',
  },
  unlinkBtn: {
    padding: 6,
  },
  googleReminderIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleReminderError: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  resetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    writingDirection: 'rtl',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  resetButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.05)',
    overflow: 'hidden',
  },
  resetButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    writingDirection: 'rtl',
  },
  resetProgressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(239,68,68,0.15)',
    overflow: 'hidden',
  },
  resetProgressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  settingsVersion: {
    fontSize: 12,
    fontWeight: '500',
    color: '#CCC',
    textAlign: 'center',
  },
  // Edit Name Modal
  editNameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  editNameCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  editNameTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  editNameInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDD',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FAFAFA',
    writingDirection: 'rtl',
  },
  editNameConfirm: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  editNameConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  editNameCancel: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editNameCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  editGenderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    writingDirection: 'rtl',
    marginBottom: 16,
    textAlign: 'center',
  },
  editNameDefaultBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  editNameDefaultText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  dalilIconCircleInfo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoModalCard: {
    width: '100%',
    backgroundColor: '#F0FFF4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
  },
  infoModalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  // Full Reset Confirm Modal
  resetConfirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  resetConfirmModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.2)',
    elevation: 12,
  },
  resetConfirmOrnament: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resetConfirmTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  resetConfirmMsgCard: {
    width: '100%',
    backgroundColor: '#FFF8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.1)',
  },
  resetConfirmMsg: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  resetOptionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginBottom: 8,
  },
  resetOptionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  resetOptionBtnDanger: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  resetConfirmBtnDanger: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    marginBottom: 10,
  },
  resetConfirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  resetConfirmCancelBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetConfirmCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  // Rating Modal
  ratingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  ratingModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.25)',
    elevation: 12,
  },
  ratingIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 14,
    textAlign: 'center',
  },
  ratingMsgCard: {
    width: '100%',
    backgroundColor: '#FFFEF5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  ratingMsg: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  ratingPrimaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  ratingPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  ratingSecondaryBtn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
    writingDirection: 'rtl',
  },
  // About Modal
  aboutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 4,
    textAlign: 'center',
  },
  aboutSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B8941E',
    writingDirection: 'rtl',
    marginBottom: 16,
    textAlign: 'center',
  },
  aboutCard: {
    width: '100%',
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  shareCardCapture: {
    position: 'absolute',
    left: -9999,
    top: 0,
    width: 500,
    height: 700,
    borderRadius: 24,
    overflow: 'hidden',
  },
  shareOrnament: {
    alignItems: 'center',
    gap: 10,
  },
  shareLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  shareDividerLine: {
    width: 180,
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.3)',
  },
  benefitShareCardInner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitShareTextWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  benefitShareCardText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 44,
  },
  benefitShareNarrator: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 10,
  },
  benefitShareTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(212,175,55,0.5)',
    writingDirection: 'rtl',
  },
});
