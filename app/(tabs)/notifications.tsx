import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Switch,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAlert } from '@/template';
import { theme } from '../../constants/theme';
import { useTourMeasure } from '../../hooks/useTourMeasure';
import { TOUR_TARGETS } from '../../constants/tour';
import { useApp } from '../../contexts/AppContext';
import CloudBadge from '../../components/CloudBadge';
import { ADHKAR_SCHEDULE, loadNotificationSettings, saveNotificationSettings, scheduleAllAdhkar, AdhkarNotificationSettings, AdhkarType } from '../../services/adhkarNotifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotifType {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
  color: string;
  read: boolean;
  route?: string;
}

const NOTIF_META: Record<AdhkarType, Omit<NotifType, 'time'>> = {
  wakeup: { id: 'wakeup', title: '☀️ أذكار الاستيقاظ', desc: 'استيقظت؟ ابدأ يومك بذكر الله، اذكره ليذكرك', icon: 'wb-twilight', color: '#D97706', read: true, route: '/wakeup-adhkar' },
  morning: { id: 'morning', title: '🌅 أذكار الصباح', desc: 'حان وقت أذكار الصباح، فاذكروني أذكركم', icon: 'wb-sunny', color: '#F59E0B', read: true, route: '/morning-adhkar' },
  evening: { id: 'evening', title: '🌇 أذكار المساء', desc: 'حان وقت أذكار المساء، اذكر الله يذكرك الله', icon: 'nightlight', color: '#8B5CF6', read: true, route: '/evening-adhkar' },
  sleep: { id: 'sleep', title: '🌙 أذكار النوم', desc: 'اختم يومك بعمل صالح - نم على ذكر الله', icon: 'bedtime', color: '#6366F1', read: true, route: '/sleep-adhkar' },
  wird: { id: 'wird', title: '📿 وردي الخاص', desc: 'حان وقت وردك اليومي، واصل ذكر الله', icon: 'menu-book', color: '#D4AF37', read: true, route: '/wird' },
};

type AlertType = 'morning' | 'evening' | 'sleep' | 'wakeup' | 'wird';

// Time labels
const TIME_RANGES: Record<AlertType, { label: string }> = {
  morning: { label: 'أذكار الصباح' },
  evening: { label: 'أذكار المساء' },
  sleep: { label: 'أذكار النوم' },
  wakeup: { label: 'أذكار الاستيقاظ' },
  wird: { label: 'وردي الخاص' },
};

const DEFAULT_TIMES: Record<AlertType, { hour: number; minute: number }> = {
  morning: ADHKAR_SCHEDULE.MORNING,
  evening: ADHKAR_SCHEDULE.EVENING,
  sleep: ADHKAR_SCHEDULE.SLEEP,
  wakeup: ADHKAR_SCHEDULE.WAKEUP,
  wird: ADHKAR_SCHEDULE.WIRD,
};

function formatTimeDisplay(hour: number, minute: number): string {
  const period = hour >= 12 ? 'مساءً' : 'صباحاً';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMin = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${period}`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { ensureVisible, scrollRef, scrollOffset } = useTourMeasure();
  const highlightRef = useRef<View | null>(null);
  const historyRef = useRef<View | null>(null);
  const { tourTarget, tourTick } = useApp();

  useEffect(() => {
    if (tourTarget === TOUR_TARGETS.notifications) {
      ensureVisible(TOUR_TARGETS.notifications, highlightRef.current);
    }
    if (tourTarget === TOUR_TARGETS.notifHistory) {
      ensureVisible(TOUR_TARGETS.notifHistory, historyRef.current);
    }
  }, [tourTarget, tourTick, ensureVisible]);

  const [readIds, setReadIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<AdhkarNotificationSettings>({
    enabled: {
      wakeup: true,
      morning: true,
      evening: true,
      sleep: true,
      wird: true,
    },
    times: {
      wakeup: { ...ADHKAR_SCHEDULE.WAKEUP },
      morning: { ...ADHKAR_SCHEDULE.MORNING },
      evening: { ...ADHKAR_SCHEDULE.EVENING },
      sleep: { ...ADHKAR_SCHEDULE.SLEEP },
      wird: { ...ADHKAR_SCHEDULE.WIRD },
    },
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // System notification permission status (server-side/OS-level)
  const [sysNotifGranted, setSysNotifGranted] = useState<boolean | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);
  // Motivational banner: shown only when system notifications are disabled,
  // and at most once every 3 days (respecting the user's comfort).
  const [showMotivBanner, setShowMotivBanner] = useState(false);

  // Time picker modal
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerType, setPickerType] = useState<AlertType>('morning');
  const [tempHour, setTempHour] = useState(7);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempHourStr, setTempHourStr] = useState('7');
  const [tempMinuteStr, setTempMinuteStr] = useState('0');

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    requestPermissions();
    loadNotificationSettings().then((saved) => {
      setSettings(saved);
      setSettingsLoaded(true);
    });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const perm = await Notifications.getPermissionsAsync();
        if (!active) return;
        setSysNotifGranted(perm.granted);
        setCanAskAgain(perm.canAskAgain ?? true);
        if (perm.granted) {
          setShowMotivBanner(false);
          return;
        }
        const last = await AsyncStorage.getItem('notifMotivDismissedAt');
        const lastTs = last ? parseInt(last, 10) : 0;
        if (Date.now() - lastTs > 3 * 24 * 60 * 60 * 1000) {
          setShowMotivBanner(true);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  // عند فتح الشاشة (الضغط على أيقونة التنبيهات): إذا لم تكن التفعيلات مفعّلة نعرض رسالة التفعيل
  useFocusEffect(
    useCallback(() => {
      if (!settingsLoaded) return;
      const anyEnabled = Object.values(settings.enabled).some(Boolean);
      if (!anyEnabled) {
        const timer = setTimeout(() => {
          showAlert(
            'تفعيل التذكيرات 📿',
            'التنبيهات غير مفعّلة حالياً. فعِّل تذكيرات الأذكار لتصل إليك في أوقاتها 🌅🌙',
            [{ text: 'حسناً', style: 'cancel' as const }]
          );
        }, 400);
        return () => clearTimeout(timer);
      }
    }, [settingsLoaded, settings, showAlert])
  );

  useEffect(() => {
    if (!settingsLoaded) return;
    scheduleAllAdhkar(settings).catch(() => {});
    saveNotificationSettings(settings);
  }, [settings, settingsLoaded]);

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        // Permission not granted
      }
    } catch (e) {
      // Silent fail
    }
  };

  const handleEnableSystemNotifs = async () => {
    try {
      const cur = await Notifications.getPermissionsAsync();
      if (cur.granted) {
        setSysNotifGranted(true);
        setShowMotivBanner(false);
        return;
      }
      if (cur.canAskAgain) {
        const res = await Notifications.requestPermissionsAsync();
        setSysNotifGranted(res.granted);
        setCanAskAgain(res.canAskAgain ?? true);
        if (res.granted) {
          setShowMotivBanner(false);
          return;
        }
      }
      // Either permanently denied or the OS won't show a prompt again:
      // guide the user to system settings.
      Linking.openSettings();
    } catch {}
  };

  const dismissMotivBanner = async () => {
    setShowMotivBanner(false);
    try {
      await AsyncStorage.setItem('notifMotivDismissedAt', String(Date.now()));
    } catch {}
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const openTimePicker = (type: AlertType) => {
    setPickerType(type);
    const t = settings.times[type as AdhkarType];
    setTempHour(t.hour);
    setTempMinute(t.minute);
    setTempHourStr(String(t.hour));
    setTempMinuteStr(String(t.minute).padStart(2, '0'));
    setShowTimePicker(true);
  };

  const confirmTimePicker = () => {
    const hour = parseInt(tempHourStr, 10);
    const minute = parseInt(tempMinuteStr, 10);

    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      showToast('الرجاء إدخال وقت صحيح');
      return;
    }

    setSettings(prev => ({
      ...prev,
      times: { ...prev.times, [pickerType as AdhkarType]: { hour, minute } },
    }));
    setShowTimePicker(false);
  };

  const resetTimeToDefault = () => {
    const def = DEFAULT_TIMES[pickerType];
    setTempHour(def.hour);
    setTempMinute(def.minute);
    setTempHourStr(String(def.hour));
    setTempMinuteStr(String(def.minute).padStart(2, '0'));
    showToast('أُعيد الوقت إلى الافتراضي');
  };

  const handleNotifPress = (notif: NotifType) => {
    setReadIds(prev => prev.includes(notif.id) ? prev : [...prev, notif.id]);
    if (notif.route) {
      if (notif.route === '/morning-adhkar') {
        router.push('/morning-adhkar');
      } else if (notif.route === '/sleep-adhkar') {
        router.push('/sleep-adhkar');
      } else if (notif.route === '/evening-adhkar') {
        router.push('/evening-adhkar');
      } else if (notif.route === '/wakeup-adhkar') {
        router.push('/wakeup-adhkar');
      } else if (notif.route === '/wird') {
        router.push('/wird');
      } else {
        showAlert(notif.title, 'ستتوفر هذه الشاشة قريباً بإذن الله.');
      }
    }
  };

  const handleMarkAllRead = () => {
    setReadIds(todayNotifs.map(n => n.id));
  };

  const handleDismiss = (notifId: string) => {
    setDismissedIds(prev => prev.includes(notifId) ? prev : [...prev, notifId]);
  };

  const todayNotifs = (Object.keys(NOTIF_META) as AdhkarType[])
    .filter((type) => settings.enabled[type] && !dismissedIds.includes(type))
    .map((type) => {
      const t = settings.times[type];
      const { hour, minute } = t;
      const meta = NOTIF_META[type];
      const period = hour >= 12 ? 'مساءً' : 'صباحاً';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayMin = minute.toString().padStart(2, '0');
      return { ...meta, time: `${displayHour}:${displayMin} ${period}`, read: readIds.includes(type) };
    });

  const unreadCount = todayNotifs.filter((n) => !n.read).length;

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
          <View style={styles.titleRow}>
            <Pressable
              onPress={handleMarkAllRead}
              style={({ pressed }) => [styles.markAllBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.markAllText}>قراءة الكل</Text>
              <MaterialIcons name="done-all" size={16} color={theme.gold} />
            </Pressable>
            <View style={styles.titleWithBadge}>
              <Text style={styles.pageTitle}>التنبيهات</Text>
              <CloudBadge />
              {unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Motivational banner when system notifications are disabled (max once/3 days) */}
          {showMotivBanner ? (
            <View style={styles.motivCard}>
              <View style={styles.motivHeader}>
                <MaterialIcons name="notifications-active" size={22} color={theme.gold} />
                <Text style={styles.motivTitle}>تفعيل التنبيهات الروحية</Text>
              </View>
              <Text style={styles.motivText}>
                «اذكروني أذكركم» — التذكيرات رفيقٌ صامت يبقيك على ذكر الله في أذكار اليوم والليلة.
                فعّل إشعارات النظام لتصل إليك في أوقاتها 🌅🌙
              </Text>
              <View style={styles.motivActions}>
                <Pressable
                  onPress={handleEnableSystemNotifs}
                  style={({ pressed }) => [styles.motivPrimaryBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.motivPrimaryText}>تفعيل التنبيهات</Text>
                </Pressable>
                <Pressable
                  onPress={dismissMotivBanner}
                  style={({ pressed }) => [styles.motivLaterBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.motivLaterText}>لاحقاً</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Schedule Settings */}
          <View style={styles.scheduleCard} ref={(el) => { highlightRef.current = el; }}>
            <Text style={styles.scheduleTitle}>التنبيهات المجدولة</Text>

            {/* Morning */}
            <View style={styles.scheduleRow}>
              <Switch
                value={settings.enabled.morning}
                onValueChange={(v) => setSettings(prev => ({ ...prev, enabled: { ...prev.enabled, morning: v } }))}
                trackColor={{ false: '#333', true: '#064E3B' }}
                thumbColor={settings.enabled.morning ? '#D4AF37' : '#999'}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>أذكار الصباح</Text>
                <Pressable
                  onPress={() => openTimePicker('morning')}
                  style={({ pressed }) => [styles.timeBtn, pressed && { opacity: 0.6 }]}
                >
                  <MaterialIcons name="access-time" size={12} color={theme.gold} />
                  <Text style={styles.timeBtnText}>{formatTimeDisplay(settings.times.morning.hour, settings.times.morning.minute)} يومياً</Text>
                </Pressable>
              </View>
              <View style={[styles.scheduleIconCircle, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <MaterialIcons name="wb-sunny" size={22} color="#F59E0B" />
              </View>
            </View>

            <View style={styles.scheduleSep} />

            {/* Evening */}
            <View style={styles.scheduleRow}>
              <Switch
                value={settings.enabled.evening}
                onValueChange={(v) => setSettings(prev => ({ ...prev, enabled: { ...prev.enabled, evening: v } }))}
                trackColor={{ false: '#333', true: '#064E3B' }}
                thumbColor={settings.enabled.evening ? '#D4AF37' : '#999'}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>أذكار المساء</Text>
                <Pressable
                  onPress={() => openTimePicker('evening')}
                  style={({ pressed }) => [styles.timeBtn, pressed && { opacity: 0.6 }]}
                >
                  <MaterialIcons name="access-time" size={12} color={theme.gold} />
                  <Text style={styles.timeBtnText}>{formatTimeDisplay(settings.times.evening.hour, settings.times.evening.minute)} يومياً</Text>
                </Pressable>
              </View>
              <View style={[styles.scheduleIconCircle, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                <MaterialIcons name="nightlight" size={22} color="#8B5CF6" />
              </View>
            </View>

            <View style={styles.scheduleSep} />

            {/* Sleep */}
            <View style={styles.scheduleRow}>
              <Switch
                value={settings.enabled.sleep}
                onValueChange={(v) => setSettings(prev => ({ ...prev, enabled: { ...prev.enabled, sleep: v } }))}
                trackColor={{ false: '#333', true: '#064E3B' }}
                thumbColor={settings.enabled.sleep ? '#D4AF37' : '#999'}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>أذكار النوم</Text>
                <Pressable
                  onPress={() => openTimePicker('sleep')}
                  style={({ pressed }) => [styles.timeBtn, pressed && { opacity: 0.6 }]}
                >
                  <MaterialIcons name="access-time" size={12} color={theme.gold} />
                  <Text style={styles.timeBtnText}>{formatTimeDisplay(settings.times.sleep.hour, settings.times.sleep.minute)} يومياً</Text>
                </Pressable>
              </View>
              <View style={[styles.scheduleIconCircle, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
                <MaterialIcons name="bedtime" size={22} color="#6366F1" />
              </View>
            </View>

            <View style={styles.scheduleSep} />

            {/* Wakeup */}
            <View style={styles.scheduleRow}>
              <Switch
                value={settings.enabled.wakeup}
                onValueChange={(v) => setSettings(prev => ({ ...prev, enabled: { ...prev.enabled, wakeup: v } }))}
                trackColor={{ false: '#333', true: '#064E3B' }}
                thumbColor={settings.enabled.wakeup ? '#D4AF37' : '#999'}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>أذكار الاستيقاظ</Text>
                <Pressable
                  onPress={() => openTimePicker('wakeup')}
                  style={({ pressed }) => [styles.timeBtn, pressed && { opacity: 0.6 }]}
                >
                  <MaterialIcons name="access-time" size={12} color={theme.gold} />
                  <Text style={styles.timeBtnText}>{formatTimeDisplay(settings.times.wakeup.hour, settings.times.wakeup.minute)} يومياً</Text>
                </Pressable>
              </View>
              <View style={[styles.scheduleIconCircle, { backgroundColor: 'rgba(217,119,6,0.12)' }]}>
                <MaterialIcons name="wb-twilight" size={22} color="#D97706" />
              </View>
            </View>

            <View style={styles.scheduleSep} />

            {/* Wird */}
            <View style={styles.scheduleRow}>
              <Switch
                value={settings.enabled.wird}
                onValueChange={(v) => setSettings(prev => ({ ...prev, enabled: { ...prev.enabled, wird: v } }))}
                trackColor={{ false: '#333', true: '#064E3B' }}
                thumbColor={settings.enabled.wird ? '#D4AF37' : '#999'}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>وردي الخاص</Text>
                <Pressable
                  onPress={() => openTimePicker('wird')}
                  style={({ pressed }) => [styles.timeBtn, pressed && { opacity: 0.6 }]}
                >
                  <MaterialIcons name="access-time" size={12} color={theme.gold} />
                  <Text style={styles.timeBtnText}>{formatTimeDisplay(settings.times.wird.hour, settings.times.wird.minute)} يومياً</Text>
                </Pressable>
              </View>
              <View style={[styles.scheduleIconCircle, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                <MaterialIcons name="menu-book" size={22} color="#D4AF37" />
              </View>
            </View>
          </View>

          {/* Notifications History */}
          <View ref={(el) => { historyRef.current = el; }}>
            <Text style={styles.sectionTitle}>سجل التنبيهات</Text>
          </View>

          {todayNotifs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="notifications-none" size={48} color={theme.textMuted} />
              <Text style={styles.emptyText}>لا توجد تنبيهات</Text>
            </View>
          ) : null}

          {todayNotifs.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(index * 80).duration(400)} exiting={FadeOut.duration(300)}>
              <Pressable
                onPress={() => handleNotifPress(item)}
                onLongPress={() => {
                  showAlert('حذف التنبيه', `هل تريد حذف "${item.title}"؟`, [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'حذف', style: 'destructive', onPress: () => handleDismiss(item.id) },
                  ]);
                }}
                style={({ pressed }) => [
                  styles.notifCard,
                  !item.read && styles.notifCardUnread,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={[styles.notifIcon, { backgroundColor: item.color + '20' }]}>
                  <MaterialIcons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifHeader}>
                    <Text style={styles.notifTime}>{item.time}</Text>
                    <View style={styles.notifTitleRow}>
                      {!item.read ? <View style={styles.unreadDot} /> : null}
                      <Text style={[styles.notifTitle, !item.read && { fontWeight: '800' }]}>{item.title}</Text>
                    </View>
                  </View>
                  <Text style={styles.notifDesc}>{item.desc}</Text>
                </View>
                {/* Chevron indicator for deep link */}
                <View style={styles.notifChevron}>
                  <MaterialIcons name="chevron-left" size={20} color="rgba(255,255,255,0.25)" />
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <Pressable style={styles.pickerOverlay} onPress={() => setShowTimePicker(false)}>
          <View />
        </Pressable>
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Pressable
                onPress={() => setShowTimePicker(false)}
                style={({ pressed }) => [styles.pickerCloseBtn, pressed && { opacity: 0.5 }]}
              >
                <MaterialIcons name="close" size={20} color="#999" />
              </Pressable>
              <Text style={styles.pickerTitle}>اختر الوقت</Text>
              <Pressable
                onPress={resetTimeToDefault}
                style={({ pressed }) => [styles.pickerResetBtn, pressed && { opacity: 0.5 }]}
              >
                <MaterialIcons name="restore" size={20} color={theme.gold} />
              </Pressable>
            </View>

            <Text style={styles.pickerRangeHint}>
              اضبط الوقت لـ {TIME_RANGES[pickerType].label} — يمكنك كتابة الساعة والدقيقة بدقة
            </Text>

            {/* Custom Time Selector */}
            <View style={styles.timeSelector}>
              {/* Hour */}
              <View style={styles.timeSelectorCol}>
                <Pressable
                  onPress={() => {
                    const next = (tempHour + 1) % 24;
                    setTempHour(next);
                    setTempHourStr(String(next).padStart(2, '0'));
                  }}
                  style={({ pressed }) => [styles.timeArrowBtn, pressed && { opacity: 0.5 }]}
                >
                  <MaterialIcons name="keyboard-arrow-up" size={28} color={theme.gold} />
                </Pressable>
                <View style={styles.timeValueBox}>
                  <TextInput
                    style={styles.timeValueInput}
                    value={tempHourStr}
                    onChangeText={(t) => {
                      setTempHourStr(t.replace(/[^0-9]/g, ''));
                      const parsed = parseInt(t.replace(/[^0-9]/g, ''), 10);
                      if (!isNaN(parsed)) setTempHour(parsed);
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    textAlign="center"
                    selectTextOnFocus
                  />
                </View>
                <Pressable
                  onPress={() => {
                    const next = (tempHour - 1 + 24) % 24;
                    setTempHour(next);
                    setTempHourStr(String(next).padStart(2, '0'));
                  }}
                  style={({ pressed }) => [styles.timeArrowBtn, pressed && { opacity: 0.5 }]}
                >
                  <MaterialIcons name="keyboard-arrow-down" size={28} color={theme.gold} />
                </Pressable>
                <Text style={styles.timeColLabel}>ساعة</Text>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              {/* Minute */}
              <View style={styles.timeSelectorCol}>
                <Pressable
                  onPress={() => {
                    const next = (tempMinute + 5) % 60;
                    setTempMinute(next);
                    setTempMinuteStr(String(next).padStart(2, '0'));
                  }}
                  style={({ pressed }) => [styles.timeArrowBtn, pressed && { opacity: 0.5 }]}
                >
                  <MaterialIcons name="keyboard-arrow-up" size={28} color={theme.gold} />
                </Pressable>
                <View style={styles.timeValueBox}>
                  <TextInput
                    style={styles.timeValueInput}
                    value={tempMinuteStr}
                    onChangeText={(t) => {
                      setTempMinuteStr(t.replace(/[^0-9]/g, ''));
                      const parsed = parseInt(t.replace(/[^0-9]/g, ''), 10);
                      if (!isNaN(parsed)) setTempMinute(parsed);
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    textAlign="center"
                    selectTextOnFocus
                  />
                </View>
                <Pressable
                  onPress={() => {
                    const next = (tempMinute - 5 + 60) % 60;
                    setTempMinute(next);
                    setTempMinuteStr(String(next).padStart(2, '0'));
                  }}
                  style={({ pressed }) => [styles.timeArrowBtn, pressed && { opacity: 0.5 }]}
                >
                  <MaterialIcons name="keyboard-arrow-down" size={28} color={theme.gold} />
                </Pressable>
                <Text style={styles.timeColLabel}>دقيقة</Text>
              </View>
            </View>

            <Text style={styles.pickerPreview}>
              {formatTimeDisplay(tempHour, tempMinute)}
            </Text>

            <Pressable
              onPress={confirmTimePicker}
              style={({ pressed }) => [styles.pickerConfirmBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.pickerConfirmText}>تأكيد</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toastVisible ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.toast}>
          <MaterialIcons name="error-outline" size={16} color="#EF4444" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textPrimary,
    writingDirection: 'rtl',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  // Schedule Card
  scheduleCard: {
    backgroundColor: theme.surfaceCard,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 14,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  scheduleInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
    writingDirection: 'rtl',
  },
  scheduleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
  },
  timeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  scheduleSep: {
    height: 1,
    backgroundColor: theme.borderLight,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textMuted,
    writingDirection: 'rtl',
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.borderLight,
    gap: 12,
  },
  notifCardUnread: {
    borderColor: 'rgba(212,175,55,0.2)',
    backgroundColor: 'rgba(212,175,55,0.04)',
  },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.gold,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
    writingDirection: 'rtl',
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.textMuted,
    writingDirection: 'rtl',
  },
  notifDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 20,
  },
  notifChevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Time Picker Modal
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pickerWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    pointerEvents: 'box-none',
  },
  pickerModal: {
    width: '100%',
    backgroundColor: '#FFFEF8',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.25)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  pickerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerResetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRangeHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    writingDirection: 'rtl',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timeSelectorCol: {
    alignItems: 'center',
    gap: 6,
  },
  timeArrowBtn: {
    width: 44,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,78,59,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(6,78,59,0.1)',
  },
  timeValueBox: {
    width: 70,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(6,78,59,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  timeValueInput: {
    width: '100%',
    height: '100%',
    fontSize: 28,
    fontWeight: '800',
    color: '#064E3B',
    textAlign: 'center',
    padding: 0,
  },
  timeColLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 28,
  },
  pickerPreview: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.gold,
    marginBottom: 20,
    writingDirection: 'rtl',
  },
  pickerConfirmBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  // Toast
  toast: {
    position: 'absolute',
    bottom: 120,
    left: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  // Motivational banner (system notifications disabled)
  motivCard: {
    marginTop: 14,
    marginBottom: 2,
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(6,78,59,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  motivHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  motivTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  motivText: {
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(245,231,200,0.92)',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 12,
  },
  motivActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  motivPrimaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
  },
  motivPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B1E16',
  },
  motivLaterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  motivLaterText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(245,231,200,0.85)',
  },
});
