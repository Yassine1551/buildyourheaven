import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_IDS = {
  WAKEUP: 'wakeup_adhkar',
  MORNING: 'morning_adhkar',
  EVENING: 'evening_adhkar',
  SLEEP: 'sleep_adhkar',
  WIRD: 'wird_adhkar',
};

export const ADHKAR_SCHEDULE = {
  WAKEUP: { hour: 5, minute: 30 },
  MORNING: { hour: 6, minute: 25 },
  EVENING: { hour: 17, minute: 0 },
  SLEEP: { hour: 22, minute: 30 },
  WIRD: { hour: 9, minute: 30 },
};

export type AdhkarType = 'morning' | 'evening' | 'sleep' | 'wakeup' | 'wird';

export interface AdhkarNotificationSettings {
  enabled: Record<AdhkarType, boolean>;
  times: Record<AdhkarType, { hour: number; minute: number }>;
}

const STORAGE_KEY = 'adhkar_notif_settings';

export const DEFAULT_SETTINGS: AdhkarNotificationSettings = {
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
};

export async function loadNotificationSettings(): Promise<AdhkarNotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const merged: AdhkarNotificationSettings = {
      enabled: { ...DEFAULT_SETTINGS.enabled, ...parsed.enabled },
      times: { ...DEFAULT_SETTINGS.times, ...parsed.times },
    };
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: AdhkarNotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // silent
  }
}

export function getAdhkarSlotAt(hour: number, minute: number): 'morning' | 'evening' | 'sleep' | 'wakeup' | null {
  const minutes = hour * 60 + minute;
  const toMin = (h: number, m: number) => h * 60 + m;
  const wakeStart = toMin(ADHKAR_SCHEDULE.WAKEUP.hour, ADHKAR_SCHEDULE.WAKEUP.minute);
  const morningStart = toMin(ADHKAR_SCHEDULE.MORNING.hour, ADHKAR_SCHEDULE.MORNING.minute);
  const eveningStart = toMin(ADHKAR_SCHEDULE.EVENING.hour, ADHKAR_SCHEDULE.EVENING.minute);
  const sleepStart = toMin(ADHKAR_SCHEDULE.SLEEP.hour, ADHKAR_SCHEDULE.SLEEP.minute);

  if (minutes >= sleepStart || minutes < wakeStart) return 'sleep';
  if (minutes >= wakeStart && minutes < morningStart) return 'wakeup';
  if (minutes >= morningStart && minutes < eveningStart) return 'morning';
  if (minutes >= eveningStart && minutes < sleepStart) return 'evening';
  return null;
}

const SCHEDULE_CONTENT: Record<AdhkarType, { identifier: string; title: string; body: string; route: string }> = {
  wakeup: { identifier: NOTIFICATION_IDS.WAKEUP, title: '☀️ أذكار الاستيقاظ', body: 'استيقظت؟ ابدأ يومك بذكر الله، اذكره ليذكرك', route: '/wakeup-adhkar' },
  morning: { identifier: NOTIFICATION_IDS.MORNING, title: '🌅 أذكار الصباح', body: 'حان وقت أذكار الصباح، فاذكروني أذكركم', route: '/morning-adhkar' },
  evening: { identifier: NOTIFICATION_IDS.EVENING, title: '🌇 أذكار المساء', body: 'حان وقت أذكار المساء، اذكر الله يذكرك الله', route: '/evening-adhkar' },
  sleep: { identifier: NOTIFICATION_IDS.SLEEP, title: '🌙 أذكار النوم', body: 'اختم يومك بعمل صالح - نم على ذكر الله', route: '/sleep-adhkar' },
  wird: { identifier: NOTIFICATION_IDS.WIRD, title: '📿 وردي الخاص', body: 'حان وقت وردك اليومي، واصل ذكر الله', route: '/wird' },
};

export async function scheduleAllAdhkar(settings: AdhkarNotificationSettings) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const types: AdhkarType[] = ['wakeup', 'morning', 'evening', 'sleep', 'wird'];

  for (const type of types) {
    if (!settings.enabled[type]) continue;
    const { identifier, title, body, route } = SCHEDULE_CONTENT[type];
    const { hour, minute } = settings.times[type];
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: { title, body, sound: true, data: { route } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}

export async function clearExpiredNotifications() {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    const now = Date.now();
    const staleMs = 10 * 60 * 60 * 1000;

    for (const notification of presented) {
      const deliveredAt = notification.date;
      if (!deliveredAt) continue;
      if (now - deliveredAt > staleMs) {
        await Notifications.dismissNotificationAsync(notification.request.identifier);
      }
    }
  } catch {
    // silent
  }
}
