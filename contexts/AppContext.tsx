import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { APP_CONFIG } from '../constants/config';
import { initialStats, initialDhikrCounts, dhikrItems, getRankTitle } from '../services/mockData';
import { getNewBadges } from '../constants/badges';
import { calculateAndApplyRewards, RewardableItem } from '../services/rewardEngine';
import { morningAdhkarItems } from '../services/morningAdhkar';
import { sleepAdhkarItems } from '../services/sleepAdhkar';
import { eveningAdhkarItems } from '../services/eveningAdhkar';
import { wakeupAdhkarItems } from '../services/wakeupAdhkar';

type ReviewState = 'pristine' | 'deferred' | 'rated';

interface AppState {
  hasanat: number;
  dhikrCounts: Record<string, number>;
  stats: Record<string, number>;
  targetStartDate: string;
  userName: string;
  showWelcome: boolean;
  level: number;
  istiqama: number;
  unlockedCards: string[];
  lastCelebration: string | null;
  morningCounts: Record<string, number>;
  sleepCounts: Record<string, number>;
  eveningCounts: Record<string, number>;
  wakeupCounts: Record<string, number>;
}

interface AppContextType extends AppState {
  incrementDhikr: (dhikrId: string, hasanatPerCount: number) => void;
  resetDhikr: (dhikrId: string) => void;
  updateStat: (key: string, value: number) => void;
  getElapsedTime: () => { months: number; days: number; hours: number; minutes: number };
  getTargetProgress: () => number;
  setUserName: (name: string) => void;
  dismissWelcome: () => void;
  isCardUnlocked: (dhikrId: string) => boolean;
  getUnlockRequirement: (dhikrId: string) => string;
  clearCelebration: () => void;
  rankTitle: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
  useWesternNumerals: boolean;
  toggleNumeralSystem: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  targetYears: number;
  setTargetYears: (years: number) => void;
  resetAllData: () => void;
  resetAdhkarData: () => void;
  resetVersesData: () => void;
  incrementMorningDhikr: (dhikrId: string) => void;
  completeMorningDhikr: (dhikrId: string) => void;
  incrementSleepDhikr: (dhikrId: string) => void;
  completeSleepDhikr: (dhikrId: string) => void;
  incrementEveningDhikr: (dhikrId: string) => void;
  completeEveningDhikr: (dhikrId: string) => void;
  incrementWakeupDhikr: (dhikrId: string) => void;
  completeWakeupDhikr: (dhikrId: string) => void;
  getTotalGlobalDhikr: () => number;
  isDevUnlocked: boolean;
  toggleDevUnlock: () => void;
  reviewState: ReviewState;
  shouldShowReview: boolean;
  markReviewAsRated: () => void;
  deferReview: () => void;
  gender: 'male' | 'female' | '';
  setGender: (g: 'male' | 'female') => void;
  epithet: string;
  setEpithet: (e: string) => void;
  badges: string[];
  loaded: boolean;
  dailyGoal: number;
  setDailyGoal: (goal: number) => void;
  getTodayCount: () => number;
  computeStreak: () => number;
  computeAllTimePeak: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================
// STRICT UNLOCKING TREE (Pure function)
// ============================================================
function computeIsUnlocked(
  dhikrId: string,
  counts: Record<string, number>,
  stats: Record<string, number>,
  isDevUnlocked: boolean
): boolean {
  if (isDevUnlocked) return true;
  switch (dhikrId) {
    case 'maghfira': return true;
    case 'alf-hasana': return (counts['maghfira'] || 0) >= 10;
    case 'nakhla': return (counts['alf-hasana'] || 0) >= 3;
    case 'hatt-khataya': return (counts['nakhla'] || 0) >= 200;
    case 'salat-nabi': return (counts['hatt-khataya'] || 0) >= 10;
    case 'thuluth-quran': return (counts['salat-nabi'] || 0) >= 200;
    case 'kanz': return (counts['thuluth-quran'] || 0) >= 100;
    case 'dhikr_qasr': return (counts['kanz'] || 0) >= 200;
    case 'milul-mizan': return (counts['dhikr_qasr'] || 0) >= 100;
    case 'sadaqat-dhikr': return (counts['milul-mizan'] || 0) >= 200;
    case 'hirz': return (counts['sadaqat-dhikr'] || 0) >= 1000;
    case 'jawamie': return (counts['hirz'] || 0) >= 1;
    case 'jawahir': return (counts['jawamie'] || 0) >= 33;
    default: return false;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasanat, setHasanat] = useState(0);
  const [dhikrCounts, setDhikrCounts] = useState<Record<string, number>>(initialDhikrCounts);
  const [internalDhikrCounts, setInternalDhikrCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<Record<string, number>>(initialStats);
  const [targetStartDate] = useState('2024-01-15');
  const [userName, setUserNameState] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [level, setLevel] = useState(1);
  const [istiqama, setIstiqama] = useState(0);
  const [unlockedCards, setUnlockedCards] = useState<string[]>(['maghfira']);
  const [lastCelebration, setLastCelebration] = useState<string | null>(null);
  const [dailyLog, setDailyLog] = useState<Record<string, number>>({});
  const [dailyGoal, setDailyGoalState] = useState(500);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [useWesternNumerals, setUseWesternNumerals] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [darkAuto, setDarkAuto] = useState(true);
  const [targetYears, setTargetYearsState] = useState(60);
  const [morningCounts, setMorningCounts] = useState<Record<string, number>>({});
  const [sleepCounts, setSleepCounts] = useState<Record<string, number>>({});
  const [eveningCounts, setEveningCounts] = useState<Record<string, number>>({});
  const [wakeupCounts, setWakeupCounts] = useState<Record<string, number>>({});
  const [gender, setGenderState] = useState<'male' | 'female' | ''>('');
  const [epithet, setEpithetState] = useState('');
  const [badges, setBadges] = useState<string[]>([]);
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [reviewState, setReviewState] = useState<ReviewState>('pristine');
  const [shouldShowReview, setShouldShowReview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadData(); }, []);

  // Auto dark mode: ON from 6 PM to 6 AM by default, unless manually toggled
  useEffect(() => {
    if (!darkAuto) return;
    const applySchedule = () => {
      const h = new Date().getHours();
      setIsDarkMode(h >= 18 || h < 6);
    };
    applySchedule();
    const id = setInterval(applySchedule, 60000);
    return () => clearInterval(id);
  }, [darkAuto]);

  useEffect(() => {
    if (loaded) saveData();
  }, [hasanat, dhikrCounts, internalDhikrCounts, stats, userName, showWelcome, level, istiqama, unlockedCards, dailyLog, dailyGoal, soundEnabled, vibrationEnabled, useWesternNumerals, isDarkMode, darkAuto, targetYears, morningCounts, sleepCounts, eveningCounts, wakeupCounts, reviewState, gender, epithet, badges]);

  // Smart Rating Trigger 1: hasanat reaches 1000 (only fires once - state stays pristine until user acts)
  useEffect(() => {
    if (loaded && hasanat >= 1000 && reviewState === 'pristine' && !shouldShowReview) {
      setShouldShowReview(true);
    }
  }, [hasanat, reviewState, loaded, shouldShowReview]);

  const loadData = async () => {
    try {
      const [savedHasanat, savedDhikr, savedInternal, savedStats, savedName, savedGender, savedEpithet, savedBadges, savedWelcome, savedLevel, savedIstiqama, savedUnlocked, savedSound, savedVibration, savedNumerals, savedDarkMode, savedDarkAuto, savedTargetYears, savedMorningCounts, savedSleepCounts, savedDailyLog, savedDailyGoal] = await Promise.all([
        AsyncStorage.getItem(APP_CONFIG.storageKeys.hasanat),
        AsyncStorage.getItem(APP_CONFIG.storageKeys.dhikrCounts),
        AsyncStorage.getItem('internal_dhikr_counts'),
        AsyncStorage.getItem(APP_CONFIG.storageKeys.stats),
        AsyncStorage.getItem('user_name'),
        AsyncStorage.getItem('user_gender'),
        AsyncStorage.getItem('user_epithet'),
        AsyncStorage.getItem('user_badges'),
        AsyncStorage.getItem('show_welcome'),
        AsyncStorage.getItem('user_level'),
        AsyncStorage.getItem('user_istiqama'),
        AsyncStorage.getItem('unlocked_cards'),
        AsyncStorage.getItem('sound_enabled'),
        AsyncStorage.getItem('vibration_enabled'),
        AsyncStorage.getItem('use_western_numerals'),
        AsyncStorage.getItem('dark_mode'),
        AsyncStorage.getItem('dark_auto'),
        AsyncStorage.getItem('target_years'),
        AsyncStorage.getItem('morning_counts'),
        AsyncStorage.getItem('sleep_counts'),
        AsyncStorage.getItem('daily_log'),
        AsyncStorage.getItem('daily_goal'),
      ]);
      if (savedHasanat) setHasanat(JSON.parse(savedHasanat));
      if (savedDhikr) setDhikrCounts(JSON.parse(savedDhikr));
      if (savedInternal) setInternalDhikrCounts(JSON.parse(savedInternal));
      if (savedStats) setStats(JSON.parse(savedStats));
      if (savedName) setUserNameState(savedName);
      if (savedGender) setGenderState(savedGender as 'male' | 'female');
      if (savedEpithet) setEpithetState(savedEpithet);
      if (savedBadges) setBadges(JSON.parse(savedBadges));
      if (savedWelcome !== null) setShowWelcome(JSON.parse(savedWelcome));
      if (savedLevel) setLevel(JSON.parse(savedLevel));
      if (savedIstiqama) setIstiqama(JSON.parse(savedIstiqama));
      if (savedUnlocked) setUnlockedCards(JSON.parse(savedUnlocked));
      if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));
      if (savedVibration !== null) setVibrationEnabled(JSON.parse(savedVibration));
      if (savedNumerals !== null) setUseWesternNumerals(JSON.parse(savedNumerals));
      if (savedDarkMode !== null) setIsDarkMode(JSON.parse(savedDarkMode));
      if (savedDarkAuto !== null) setDarkAuto(JSON.parse(savedDarkAuto));
      else if (savedDarkMode !== null) setDarkAuto(false);
      if (savedTargetYears !== null) setTargetYearsState(JSON.parse(savedTargetYears));
      if (savedMorningCounts) setMorningCounts(JSON.parse(savedMorningCounts));
      if (savedSleepCounts) setSleepCounts(JSON.parse(savedSleepCounts));
      if (savedDailyLog) setDailyLog(JSON.parse(savedDailyLog));
      if (savedDailyGoal) setDailyGoalState(JSON.parse(savedDailyGoal));
      const savedEveningCounts = await AsyncStorage.getItem('evening_counts');
      if (savedEveningCounts) setEveningCounts(JSON.parse(savedEveningCounts));
      const savedWakeupCounts = await AsyncStorage.getItem('wakeup_counts');
      if (savedWakeupCounts) setWakeupCounts(JSON.parse(savedWakeupCounts));
      const savedReviewState = await AsyncStorage.getItem('review_state');
      if (savedReviewState) setReviewState(JSON.parse(savedReviewState));
    } catch (e) {}
    setLoaded(true);
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(APP_CONFIG.storageKeys.hasanat, JSON.stringify(hasanat)),
        AsyncStorage.setItem(APP_CONFIG.storageKeys.dhikrCounts, JSON.stringify(dhikrCounts)),
        AsyncStorage.setItem('internal_dhikr_counts', JSON.stringify(internalDhikrCounts)),
        AsyncStorage.setItem('user_gender', gender),
        AsyncStorage.setItem('user_epithet', epithet),
        AsyncStorage.setItem('user_badges', JSON.stringify(badges)),
        AsyncStorage.setItem(APP_CONFIG.storageKeys.stats, JSON.stringify(stats)),
        AsyncStorage.setItem('user_name', userName),
        AsyncStorage.setItem('show_welcome', JSON.stringify(showWelcome)),
        AsyncStorage.setItem('user_level', JSON.stringify(level)),
        AsyncStorage.setItem('user_istiqama', JSON.stringify(istiqama)),
        AsyncStorage.setItem('unlocked_cards', JSON.stringify(unlockedCards)),
        AsyncStorage.setItem('sound_enabled', JSON.stringify(soundEnabled)),
        AsyncStorage.setItem('vibration_enabled', JSON.stringify(vibrationEnabled)),
        AsyncStorage.setItem('use_western_numerals', JSON.stringify(useWesternNumerals)),
        AsyncStorage.setItem('dark_mode', JSON.stringify(isDarkMode)),
        AsyncStorage.setItem('dark_auto', JSON.stringify(darkAuto)),
        AsyncStorage.setItem('target_years', JSON.stringify(targetYears)),
        AsyncStorage.setItem('morning_counts', JSON.stringify(morningCounts)),
        AsyncStorage.setItem('sleep_counts', JSON.stringify(sleepCounts)),
        AsyncStorage.setItem('daily_log', JSON.stringify(dailyLog)),
        AsyncStorage.setItem('daily_goal', JSON.stringify(dailyGoal)),
        AsyncStorage.setItem('evening_counts', JSON.stringify(eveningCounts)),
        AsyncStorage.setItem('wakeup_counts', JSON.stringify(wakeupCounts)),
        AsyncStorage.setItem('review_state', JSON.stringify(reviewState)),
      ]);
    } catch (e) {}
  };

  // ============================================================
  // GLOBAL TOTAL HELPER
  // ============================================================
  const getTotalGlobalDhikr = useCallback(() => {
    let total = 0;
    for (const [key, val] of Object.entries(dhikrCounts)) {
      if (key !== 'alf-hasana' && key !== 'dhikr_qasr') total += val;
    }
    Object.values(internalDhikrCounts).forEach(v => { total += v; });
    Object.values(morningCounts).forEach(v => { total += v; });
    Object.values(sleepCounts).forEach(v => { total += v; });
    Object.values(eveningCounts).forEach(v => { total += v; });
    Object.values(wakeupCounts).forEach(v => { total += v; });
    return total;
  }, [dhikrCounts, internalDhikrCounts, morningCounts, sleepCounts, eveningCounts, wakeupCounts]);

  const getTodayDateString = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const incrementTodayCount = useCallback(() => {
    const today = getTodayDateString();
    setDailyLog(prev => ({ ...prev, [today]: (prev[today] || 0) + 1 }));
  }, [getTodayDateString]);

  const getTodayCount = useCallback(() => {
    const today = getTodayDateString();
    return dailyLog[today] || 0;
  }, [getTodayDateString, dailyLog]);

  const computeStreak = useCallback(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 1; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const count = dailyLog[key] || 0;
      if (count >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [dailyLog, dailyGoal]);

  const computeAllTimePeak = useCallback(() => {
    let peak = 0;
    for (const val of Object.values(dailyLog)) {
      if (val > peak) peak = val;
    }
    return peak;
  }, [dailyLog]);

  // ============================================================
  // BADGE SYSTEM
  // ============================================================
  const awardBadge = useCallback((badgeId: string) => {
    setBadges(prev => {
      if (prev.includes(badgeId)) return prev;
      return [...prev, badgeId];
    });
    setLastCelebration(`badge_${badgeId}`);
  }, []);

  const checkBadges = useCallback((overrides?: { dhikrCounts?: Record<string, number>; stats?: Record<string, number>; hasanat?: number }): boolean => {
    const newIds = getNewBadges(badges, overrides?.dhikrCounts ?? dhikrCounts, overrides?.stats ?? stats, overrides?.hasanat ?? hasanat);
    newIds.forEach(id => awardBadge(id));
    return newIds.length > 0;
  }, [dhikrCounts, stats, hasanat, badges, awardBadge]);

  // ============================================================
  // INCREMENT DHIKR (Basic Cards) - Delayed Gratification Engine
  // ============================================================
  const incrementDhikr = useCallback((dhikrId: string, hasanatPerCount: number) => {
    const item = dhikrItems.find(d => d.id === dhikrId);
    if (!item) return;

    const isAlfHasana = dhikrId === 'alf-hasana';

    // Alf-hasana: internal counters track raw taps, dhikrCounts store completions
    const effectiveTapCount = isAlfHasana
      ? (internalDhikrCounts[dhikrId] || 0) + 1
      : (dhikrCounts[dhikrId] || 0) + 1;

    const isTargetHit = effectiveTapCount % item.targetCount === 0;

    let newDhikrCounts: Record<string, number>;
    let newInternalCounts: Record<string, number> | undefined;
    if (isAlfHasana) {
      newDhikrCounts = {
        ...dhikrCounts,
        [dhikrId]: isTargetHit ? (dhikrCounts[dhikrId] || 0) + 1 : (dhikrCounts[dhikrId] || 0),
      };
      newInternalCounts = { ...internalDhikrCounts, [dhikrId]: effectiveTapCount };
    } else {
      newDhikrCounts = { ...dhikrCounts, [dhikrId]: effectiveTapCount };
    }

    const newStats = { ...stats };

    // Alf-hasana: delayed gratification - only add hasanat on target hits (every 100)
    const newHasanat = isAlfHasana
      ? (isTargetHit ? hasanat + hasanatPerCount * item.targetCount : hasanat)
      : hasanat + hasanatPerCount;

    // Per-tap special: jawamie adds +60min (1h) per click
    if (dhikrId === 'jawamie') {
      newStats.extra_life_minutes = (newStats.extra_life_minutes || 0) + 60;
    }

    if (isTargetHit) {
      // Apply per-target stat increments (NOT per click)
      if (item.palms) newStats.palms = (newStats.palms || 0) + item.palms;
      if (item.sadaqah) newStats.sadaqat = (newStats.sadaqat || 0) + item.sadaqah;
      if (item.slavesFreed) newStats.riqab = (newStats.riqab || 0) + item.slavesFreed;
      if (item.isShield) newStats.hirz_status = (newStats.hirz_status || 0) + 1;
      // sayyiat tracking removed - app is positive-focused only
      if (item.salat) newStats.salawat = (newStats.salawat || 0) + item.salat;
      if (item.levels) newStats.level_points = (newStats.level_points || 0) + item.levels;

      // Special: dhikr_qasr (Surah Ikhlas) - Modulo math on TOTAL count
      if (dhikrId === 'dhikr_qasr') {
        const prevForCalc = Math.max(0, effectiveTapCount - item.targetCount);
        const deltaQusur = Math.floor(effectiveTapCount / 10) - Math.floor(prevForCalc / 10);
        const deltaKhatma = Math.floor(effectiveTapCount / 3) - Math.floor(prevForCalc / 3);
        newStats.qusur = (newStats.qusur || 0) + Math.max(0, deltaQusur);
        newStats.khatma = (newStats.khatma || 0) + Math.max(0, deltaKhatma);
      }

      // Special: kanz - +1 treasure on each target hit
      if (dhikrId === 'kanz') {
        newStats.treasures = (newStats.treasures || 0) + 1;
      }

      // Special: thuluth-quran - +1 khatma on each target hit
      if (dhikrId === 'thuluth-quran') {
        newStats.khatma = (newStats.khatma || 0) + 1;
      }

      // Special: salat-nabi - +1 palace per 10 reads
      if (dhikrId === 'salat-nabi' && effectiveTapCount % 10 === 0) {
        newStats.palaces = (newStats.palaces || 0) + 1;
      }

      // Virtual Age Logic on Target
      if (dhikrId === 'jawamie') {
        newStats.extra_life_minutes = (newStats.extra_life_minutes || 0) + 180;
      } else if (dhikrId === 'jawahir') {
        newStats.extra_life_minutes = (newStats.extra_life_minutes || 0) + 1440;
      } else if (item.extraLifeMinutes) {
        newStats.extra_life_minutes = (newStats.extra_life_minutes || 0) + item.extraLifeMinutes;
      }
    }

    const newIstiqama = istiqama + 1;
    const newLevel = Math.floor(newIstiqama / 50) + 1;

    const start = new Date(targetStartDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
    newStats.elapsed_days = diffDays;

    const oldGlobalTotal = getTotalGlobalDhikr();
    const newGlobalTotal = oldGlobalTotal + 1;

    // Detect newly unlocked card (excluding dev mode)
    let newlyUnlockedId: string | null = null;
    for (const dItem of dhikrItems) {
      const wasUnlocked = computeIsUnlocked(dItem.id, dhikrCounts, stats, false);
      const isUnlockedNow = computeIsUnlocked(dItem.id, newDhikrCounts, newStats, false);
      if (!wasUnlocked && isUnlockedNow) {
        newlyUnlockedId = dItem.id;
        break;
      }
    }

    setDhikrCounts(newDhikrCounts);
    if (newInternalCounts) setInternalDhikrCounts(newInternalCounts);
    setStats(newStats);
    setHasanat(newHasanat);
    setIstiqama(newIstiqama);
    if (newLevel > level) setLevel(newLevel);
    const hadNewBadge = checkBadges({ dhikrCounts: newDhikrCounts, stats: newStats, hasanat: newHasanat });
    incrementTodayCount();

    // Smart Haptics: target hit OR global multiple of 100
    if (vibrationEnabled) {
      if (isTargetHit) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (newGlobalTotal % 100 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }

    // Badge celebrations take priority over unlock
    if (!hadNewBadge) {
      if (newlyUnlockedId) {
        setLastCelebration(`unlock_${newlyUnlockedId}`);
        // Smart Rating Trigger 2: deferred + new unlock => re-arm review prompt
        if (reviewState === 'deferred') {
          setShouldShowReview(true);
        }
      }
    }
  }, [dhikrCounts, internalDhikrCounts, stats, hasanat, istiqama, level, vibrationEnabled, targetStartDate, getTotalGlobalDhikr, reviewState, checkBadges]);

  // ============================================================
  // ADHKAR INCREMENTS (Morning/Evening/Sleep/Wakeup)
  // ============================================================
  const handleAdhkarTickEffects = useCallback((oldTotal: number) => {
    const newTotal = oldTotal + 1;
    if (vibrationEnabled && newTotal % 100 === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [vibrationEnabled]);

  const applyRewardResult = useCallback((result: ReturnType<typeof calculateAndApplyRewards>) => {
    if (result.hasanatBonus > 0) {
      setHasanat(prev => prev + result.hasanatBonus);
    }
    if (result.syncStatKey) {
      setStats(prev => ({
        ...prev,
        [result.syncStatKey!]: (prev[result.syncStatKey!] || 0) + result.syncStatIncrement,
      }));
    }
    if (result.extraStats) {
      setStats(prev => {
        const updated = { ...prev };
        Object.entries(result.extraStats!).forEach(([key, val]) => {
          updated[key] = (updated[key] || 0) + val;
        });
        return updated;
      });
    }
  }, []);

  const incrementMorningDhikr = useCallback((dhikrId: string) => {
    const oldGlobalTotal = getTotalGlobalDhikr();
    setMorningCounts(prev => ({ ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 }));
    setHasanat(prev => prev + 10);
    setIstiqama(prev => prev + 1);
    incrementTodayCount();
    const newLevel = Math.floor((istiqama + 1) / 50) + 1;
    if (newLevel > level) setLevel(newLevel);
    handleAdhkarTickEffects(oldGlobalTotal);
  }, [istiqama, level, getTotalGlobalDhikr, handleAdhkarTickEffects]);

  const completeMorningDhikr = useCallback((dhikrId: string) => {
    const item = morningAdhkarItems.find(d => d.id === dhikrId);
    if (!item) return;
    const result = calculateAndApplyRewards({ id: item.id, text: item.text, target: item.target, isQuran: item.isQuran, syncTarget: item.syncTarget });
    applyRewardResult(result);
  }, [applyRewardResult]);

  const incrementSleepDhikr = useCallback((dhikrId: string) => {
    const oldGlobalTotal = getTotalGlobalDhikr();
    setSleepCounts(prev => ({ ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 }));
    setHasanat(prev => prev + 10);
    setIstiqama(prev => prev + 1);
    incrementTodayCount();
    const newLevel = Math.floor((istiqama + 1) / 50) + 1;
    if (newLevel > level) setLevel(newLevel);
    handleAdhkarTickEffects(oldGlobalTotal);
  }, [istiqama, level, getTotalGlobalDhikr, handleAdhkarTickEffects, incrementTodayCount]);

  const completeSleepDhikr = useCallback((dhikrId: string) => {
    const item = sleepAdhkarItems.find(d => d.id === dhikrId);
    if (!item) return;
    const result = calculateAndApplyRewards({ id: item.id, text: item.text, target: item.target, isQuran: item.isQuran, syncTarget: item.syncTarget });
    applyRewardResult(result);
  }, [applyRewardResult]);

  const incrementEveningDhikr = useCallback((dhikrId: string) => {
    const oldGlobalTotal = getTotalGlobalDhikr();
    setEveningCounts(prev => ({ ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 }));
    setHasanat(prev => prev + 10);
    setIstiqama(prev => prev + 1);
    incrementTodayCount();
    const newLevel = Math.floor((istiqama + 1) / 50) + 1;
    if (newLevel > level) setLevel(newLevel);
    handleAdhkarTickEffects(oldGlobalTotal);
  }, [istiqama, level, getTotalGlobalDhikr, handleAdhkarTickEffects, incrementTodayCount]);

  const completeEveningDhikr = useCallback((dhikrId: string) => {
    const item = eveningAdhkarItems.find(d => d.id === dhikrId);
    if (!item) return;
    const result = calculateAndApplyRewards({ id: item.id, text: item.text, target: item.target, isQuran: item.isQuran, syncTarget: item.syncTarget });
    applyRewardResult(result);
  }, [applyRewardResult]);

  const incrementWakeupDhikr = useCallback((dhikrId: string) => {
    const oldGlobalTotal = getTotalGlobalDhikr();
    setWakeupCounts(prev => ({ ...prev, [dhikrId]: (prev[dhikrId] || 0) + 1 }));
    setHasanat(prev => prev + 10);
    setIstiqama(prev => prev + 1);
    incrementTodayCount();
    const newLevel = Math.floor((istiqama + 1) / 50) + 1;
    if (newLevel > level) setLevel(newLevel);
    handleAdhkarTickEffects(oldGlobalTotal);
  }, [istiqama, level, getTotalGlobalDhikr, handleAdhkarTickEffects, incrementTodayCount]);

  const completeWakeupDhikr = useCallback((dhikrId: string) => {
    const item = wakeupAdhkarItems.find(d => d.id === dhikrId);
    if (!item) return;
    const result = calculateAndApplyRewards({ id: item.id, text: item.text, target: item.target, isQuran: item.isQuran, syncTarget: item.syncTarget });
    applyRewardResult(result);
  }, [applyRewardResult]);

  const resetDhikr = useCallback((dhikrId: string) => {
    setDhikrCounts(prev => ({ ...prev, [dhikrId]: 0 }));
    if (dhikrId === 'alf-hasana' || dhikrId === 'dhikr_qasr') {
      setInternalDhikrCounts(prev => ({ ...prev, [dhikrId]: 0 }));
    }
  }, []);

  const updateStat = useCallback((key: string, value: number) => {
    setStats(prev => ({ ...prev, [key]: (prev[key] || 0) + value }));
  }, []);

  const getElapsedTime = useCallback(() => {
    const extraMinutes = stats.extra_life_minutes || 0;
    const totalMinutes = Math.floor(extraMinutes);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    return { months, days, hours, minutes };
  }, [stats.extra_life_minutes]);

  const getTargetProgress = useCallback(() => {
    const targetMinutes = targetYears * 365.25 * 24 * 60;
    const currentMinutes = stats.extra_life_minutes || 0;
    return Math.min(currentMinutes / targetMinutes, 1);
  }, [stats.extra_life_minutes, targetYears]);

  const setUserName = useCallback((name: string) => { setUserNameState(name); }, []);
  const dismissWelcome = useCallback(() => { setShowWelcome(false); }, []);

  const setGender = useCallback((g: 'male' | 'female') => { setGenderState(g); }, []);
  const setEpithet = useCallback((e: string) => { setEpithetState(e); }, []);

  const isCardUnlocked = useCallback((dhikrId: string) => {
    return computeIsUnlocked(dhikrId, dhikrCounts, stats, isDevUnlocked);
  }, [dhikrCounts, stats, isDevUnlocked]);

  const clearCelebration = useCallback(() => { setLastCelebration(null); }, []);

  const getUnlockRequirement = useCallback((dhikrId: string): string => {
    switch (dhikrId) {
      case 'alf-hasana': { const r = Math.max(0, 10 - (dhikrCounts['maghfira'] || 0)); return r > 0 ? `مطلوب 10 مغفرة الذنوب (متبقي: ${r})` : ''; }
      case 'nakhla': { const r = Math.max(0, 3 - (dhikrCounts['alf-hasana'] || 0)); return r > 0 ? `مطلوب 3 ألف حسنة (متبقي: ${r})` : ''; }
      case 'hatt-khataya': { const r = Math.max(0, 200 - (dhikrCounts['nakhla'] || 0)); return r > 0 ? `مطلوب 200 نخلة في الجنة (متبقي: ${r})` : ''; }
      case 'salat-nabi': { const r = Math.max(0, 10 - (dhikrCounts['hatt-khataya'] || 0)); return r > 0 ? `مطلوب 10 حط الخطايا (متبقي: ${r})` : ''; }
      case 'thuluth-quran': { const r = Math.max(0, 200 - (dhikrCounts['salat-nabi'] || 0)); return r > 0 ? `مطلوب 200 صلاة على النبي (متبقي: ${r})` : ''; }
      case 'kanz': { const r = Math.max(0, 100 - (dhikrCounts['thuluth-quran'] || 0)); return r > 0 ? `مطلوب 100 ثلث القرآن (متبقي: ${r})` : ''; }
      case 'dhikr_qasr': { const r = Math.max(0, 200 - (dhikrCounts['kanz'] || 0)); return r > 0 ? `مطلوب 200 كنز الجنة (متبقي: ${r})` : ''; }
      case 'milul-mizan': { const r = Math.max(0, 100 - (dhikrCounts['dhikr_qasr'] || 0)); return r > 0 ? `مطلوب 100 قصر في الجنة (متبقي: ${r})` : ''; }
      case 'sadaqat-dhikr': { const r = Math.max(0, 200 - (dhikrCounts['milul-mizan'] || 0)); return r > 0 ? `مطلوب 200 ملء الميزان (متبقي: ${r})` : ''; }
      case 'hirz': { const r = Math.max(0, 1000 - (dhikrCounts['sadaqat-dhikr'] || 0)); return r > 0 ? `مطلوب 1000 صدقات الأذكار (متبقي: ${r})` : ''; }
      case 'jawamie': { const r = Math.max(0, 1 - (dhikrCounts['hirz'] || 0)); return r > 0 ? `مطلوب مرة واحدة حرز من الشيطان (متبقي: ${r})` : ''; }
      case 'jawahir': { const r = Math.max(0, 33 - (dhikrCounts['jawamie'] || 0)); return r > 0 ? `مطلوب 33 جوامع الكلم (متبقي: ${r})` : ''; }
      default: return '';
    }
  }, [dhikrCounts, stats]);

  const toggleSound = useCallback(() => { setSoundEnabled(prev => !prev); }, []);
  const toggleVibration = useCallback(() => { setVibrationEnabled(prev => !prev); }, []);
  const toggleNumeralSystem = useCallback(() => { setUseWesternNumerals(prev => !prev); }, []);
  const toggleDarkMode = useCallback(() => {
    setDarkAuto(false);
    setIsDarkMode(prev => !prev);
  }, []);
  const toggleDevUnlock = useCallback(() => { setIsDevUnlocked(prev => !prev); }, []);

  const setTargetYears = useCallback((years: number) => {
    if (years >= 1 && years <= 100) setTargetYearsState(years);
  }, []);

  const markReviewAsRated = useCallback(() => {
    setReviewState('rated');
    setShouldShowReview(false);
  }, []);

  const deferReview = useCallback(() => {
    setReviewState('deferred');
    setShouldShowReview(false);
  }, []);

  const resetAdhkarData = useCallback(async () => {
    setHasanat(0);
    setDhikrCounts(initialDhikrCounts);
    setInternalDhikrCounts({});
    setStats(initialStats);
    setMorningCounts({});
    setSleepCounts({});
    setEveningCounts({});
    setWakeupCounts({});
    setDailyLog({});
    setDailyGoalState(500);
    try {
      await AsyncStorage.multiRemove([
        'hasanat_total', 'dhikr_counts', 'internal_dhikr_counts',
        'stats_data', 'morning_counts', 'sleep_counts', 'evening_counts',
        'wakeup_counts', 'daily_log', 'daily_goal',
      ]);
    } catch (e) {}
  }, []);

  const resetVersesData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('verse_progress');
    } catch (e) {}
  }, []);

  const resetAllData = useCallback(async () => {
    setHasanat(0);
    setDhikrCounts(initialDhikrCounts);
    setInternalDhikrCounts({});
    setStats(initialStats);
    setLevel(1);
    setIstiqama(0);
    setUserNameState('');
    setShowWelcome(true);
    setGenderState('');
    setEpithetState('');
    setBadges([]);
    setUnlockedCards(['maghfira']);
    setLastCelebration(null);
    setSoundEnabled(true);
    setVibrationEnabled(true);
    setUseWesternNumerals(true);
    setIsDarkMode(false);
    setTargetYearsState(60);
    setMorningCounts({});
    setSleepCounts({});
    setEveningCounts({});
    setWakeupCounts({});
    setDailyLog({});
    setDailyGoalState(500);
    setReviewState('pristine');
    setShouldShowReview(false);
    try {
      await AsyncStorage.clear();
    } catch (e) {}
  }, []);

  const setDailyGoal = useCallback((goal: number) => {
    if (goal > 0) setDailyGoalState(goal);
  }, []);

  const rankTitle = getRankTitle(istiqama);

  return (
    <AppContext.Provider
      value={{
        hasanat, dhikrCounts, stats, targetStartDate, userName, showWelcome, level, istiqama,
        unlockedCards, lastCelebration, morningCounts, sleepCounts, eveningCounts, wakeupCounts,
        incrementDhikr, resetDhikr, updateStat, getElapsedTime, getTargetProgress, setUserName,
        dismissWelcome, isCardUnlocked, getUnlockRequirement, clearCelebration, rankTitle,
        soundEnabled, vibrationEnabled, toggleSound, toggleVibration, useWesternNumerals,
        toggleNumeralSystem, isDarkMode, toggleDarkMode, targetYears, setTargetYears, resetAllData, resetAdhkarData, resetVersesData,
        incrementMorningDhikr, completeMorningDhikr, incrementSleepDhikr, completeSleepDhikr,
        incrementEveningDhikr, completeEveningDhikr, incrementWakeupDhikr, completeWakeupDhikr,
        getTotalGlobalDhikr, isDevUnlocked, toggleDevUnlock,
        reviewState, shouldShowReview, markReviewAsRated, deferReview,
        gender, setGender, epithet, setEpithet, badges, loaded,
        dailyGoal, setDailyGoal, getTodayCount, computeStreak, computeAllTimePeak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be inside AppProvider');
  return context;
}
