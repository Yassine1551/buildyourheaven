import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { AppState } from 'react-native';

const NOTIFICATION_IDS = {
  WAKEUP: 'wakeup_adhkar',
  MORNING: 'morning_adhkar',
  EVENING: 'evening_adhkar',
  SLEEP: 'sleep_adhkar',
};

export async function purgeOldNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAllAdhkar() {
  await purgeOldNotifications();
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.WAKEUP,
    content: {
      title: 'أذكار الاستيقاظ ☀️',
      body: 'فاذكروني أذكركم - ابدأ يومك بأذكار الاستيقاظ',
    },
    trigger: { hour: 4, minute: 30, repeats: true },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.MORNING,
    content: {
      title: 'أذكار الصباح 🌅',
      body: 'فاذكروني أذكركم - حان وقت أذكار الصباح',
    },
    trigger: { hour: 6, minute: 25, repeats: true },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.EVENING,
    content: {
      title: 'أذكار المساء 🌇',
      body: 'فاذكروني أذكركم - حان وقت أذكار المساء',
    },
    trigger: { hour: 17, minute: 0, repeats: true },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.SLEEP,
    content: {
      title: 'أذكار النوم 🌙',
      body: 'فاذكروني أذكركم - نم على ذكر الله',
    },
    trigger: { hour: 21, minute: 30, repeats: true },
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
