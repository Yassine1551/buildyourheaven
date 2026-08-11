import { supabase, isSupabaseConfigured } from './supabaseClient';
import { WirdDhikrItem } from './personalWird';

export interface GameSnapshot {
  lastSavedAt: string;
  userName: string;
  hasanat: number;
  dhikrCounts: Record<string, number>;
  internalDhikrCounts: Record<string, number>;
  stats: Record<string, number>;
  morningCounts: Record<string, number>;
  sleepCounts: Record<string, number>;
  eveningCounts: Record<string, number>;
  wakeupCounts: Record<string, number>;
  wirdConfig: WirdDhikrItem[];
  wirdCounts: Record<string, number>;
  wirdDate: string;
  gender: string;
  epithet: string;
  badges: string[];
  level: number;
  istiqama: number;
  unlockedCards: string[];
  dailyLog: Record<string, number>;
  dailyGoal: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  useWesternNumerals: boolean;
  isDarkMode: boolean;
  darkAuto: boolean;
  targetYears: number;
  recitation: string;
  reviewState: string;
  onboardingDone: boolean;
  showWelcome: boolean;
}

export async function getServerSnapshot(userId: string): Promise<{ state: GameSnapshot; lastSavedAt: string } | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('game_state')
    .select('state, last_saved_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data?.state) return null;
  return { state: data.state as GameSnapshot, lastSavedAt: data.last_saved_at as string };
}

export async function pushServerSnapshot(userId: string, state: GameSnapshot): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('game_state').upsert(
      { user_id: userId, state, last_saved_at: state.lastSavedAt },
      { onConflict: 'user_id' },
    );
  } catch {}
}

export async function upsertProfile(
  userId: string,
  p: { displayName: string; gender?: string; deviceId?: string },
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('profiles').upsert(
      {
        id: userId,
        display_name: p.displayName,
        gender: p.gender || null,
        device_id: p.deviceId || null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
  } catch {}
}
