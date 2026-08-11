import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabaseClient';

let started = false;
let activeSince: number | null = null;
let segmentSince: number | null = null;
let getUser: () => string | null = () => null;
let deviceIdCache: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (deviceIdCache) return deviceIdCache;
  let id = await AsyncStorage.getItem('device_id');
  if (!id) {
    id = 'device_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    await AsyncStorage.setItem('device_id', id);
  }
  deviceIdCache = id;
  return deviceIdCache;
}

export function initSessionTracker(getUserId: () => string | null): void {
  if (started) return;
  started = true;
  getUser = getUserId;
  AppState.addEventListener('change', handleAppStateChange);
  if (AppState.currentState === 'active') startSegment();
  setInterval(heartbeat, 30000);
}

function startSegment(): void {
  if (activeSince == null) activeSince = Date.now();
  if (segmentSince == null) segmentSince = Date.now();
}

function endSegment(): void {
  if (activeSince == null || segmentSince == null) return;
  const duration = Math.floor((Date.now() - segmentSince) / 1000);
  segmentSince = null;
  activeSince = null;
  if (duration >= 5) sendSession(duration);
}

function heartbeat(): void {
  if (activeSince == null || segmentSince == null) return;
  const duration = Math.floor((Date.now() - segmentSince) / 1000);
  if (duration >= 60) {
    sendSession(duration);
    segmentSince = Date.now();
    activeSince = Date.now();
  }
}

function handleAppStateChange(state: string): void {
  if (state === 'active') {
    startSegment();
  } else if (state === 'background' || state === 'inactive') {
    endSegment();
  }
}

async function sendSession(duration: number): Promise<void> {
  if (!isSupabaseConfigured) return;
  const now = new Date();
  const startedAt = new Date(now.getTime() - duration * 1000).toISOString();
  const endedAt = now.toISOString();
  const userId = getUser();
  try {
    if (userId) {
      await supabase.from('sessions').insert({
        user_id: userId,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: duration,
      });
    } else {
      const deviceId = await getDeviceId();
      await supabase.from('sessions').insert({
        user_id: null,
        device_id: deviceId,
        started_at: startedAt,
        ended_at: endedAt,
        duration_seconds: duration,
      });
    }
  } catch {}
}
