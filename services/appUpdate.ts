/**
 * In-app update notice: show a "what's new" prompt once after the app is
 * updated to a newer version. The user may accept (dismiss permanently until
 * the next update) or say "later" (the notice reappears on a future launch).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_VERSION = '1.0.5';
const LAST_SEEN_KEY = 'last_seen_update_version';

export const UPDATE_FEATURES: string[] = [
  'رأس شاشات الأذكار: أزرار الصوت والهزاز يساراً، والعنوان والتقدم في المنتصف',
  'إصلاح نهائي للسحب بين بطاقات الأذكار (أذكار النوم وغيرها)',
  'دمج التسبيحات الأربع في بطاقة واحدة: كل نقرة 40 حسنة و4 صدقات',
];

export async function shouldShowUpdateNotice(): Promise<boolean> {
  try {
    const lastSeen = await AsyncStorage.getItem(LAST_SEEN_KEY);
    return lastSeen !== CURRENT_VERSION;
  } catch {
    return false;
  }
}

export async function markUpdateAccepted(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SEEN_KEY, CURRENT_VERSION);
  } catch {
    // silent
  }
}