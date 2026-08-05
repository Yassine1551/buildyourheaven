import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { AppState } from 'react-native';

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

export async function purgeOldNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAllAdhkar() {
  await purgeOldNotifications();
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.WAKEUP,
    content: {
      title: '☀️ أذكار الاستيقاظ',
      body: 'استيقظت؟ ابدأ يومك بذكر الله، اذكره ليذكرك',
      data: { route: '/wakeup-adhkar' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: ADHKAR_SCHEDULE.WAKEUP.hour,
      minute: ADHKAR_SCHEDULE.WAKEUP.minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.MORNING,
    content: {
      title: '🌅 أذكار الصباح',
      body: 'حان وقت أذكار الصباح، فاذكروني أذكركم',
      data: { route: '/morning-adhkar' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: ADHKAR_SCHEDULE.MORNING.hour,
      minute: ADHKAR_SCHEDULE.MORNING.minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.EVENING,
    content: {
      title: '🌇 أذكار المساء',
      body: 'حان وقت أذكار المساء، اذكر الله يذكرك الله',
      data: { route: '/evening-adhkar' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: ADHKAR_SCHEDULE.EVENING.hour,
      minute: ADHKAR_SCHEDULE.EVENING.minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.SLEEP,
    content: {
      title: '🌙 أذكار النوم',
      body: 'اختم يومك بعمل صالح - نم على ذكر الله',
      data: { route: '/sleep-adhkar' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: ADHKAR_SCHEDULE.SLEEP.hour,
      minute: ADHKAR_SCHEDULE.SLEEP.minute,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.WIRD,
    content: {
      title: '📿 وردي الخاص',
      body: 'حان وقت وردك اليومي، واصل ذكر الله',
      data: { route: '/wird' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: ADHKAR_SCHEDULE.WIRD.hour,
      minute: ADHKAR_SCHEDULE.WIRD.minute,
    },
  });
}

export async function clearExpiredNotifications() {
  const currentHour = new Date().getHours();

  if (currentHour >= 3 && currentHour < 4) {
    await Notifications.dismissAllNotificationsAsync();
    return;
  }

  if (currentHour >= 11) {
    await Notifications.dismissNotificationAsync(NOTIFICATION_IDS.WAKEUP);
  }

  if (currentHour >= 13) {
    await Notifications.dismissNotificationAsync(NOTIFICATION_IDS.MORNING);
  }
}
