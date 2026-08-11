import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const REDIRECT_URI = AuthSession.makeRedirectUri();

console.log('[supabase] REDIRECT_URI =', REDIRECT_URI);
console.log('[supabase] أضف هذا الرابط إلى Supabase ← Authentication ← URL Configuration ← Redirect URLs');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
      removeItem: (key) => AsyncStorage.removeItem(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

export interface GoogleUser {
  id: string;
  email?: string;
  name?: string;
}

export async function signInWithGoogle(): Promise<{ user: GoogleUser | null; error?: string }> {
  if (!isSupabaseConfigured) {
    return { user: null, error: 'Supabase غير مكوّن: تحقق من EXPO_PUBLIC_SUPABASE_URL و EXPO_PUBLIC_SUPABASE_ANON_KEY في ملف .env' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { skipBrowserRedirect: true, redirectTo: REDIRECT_URI },
    });
    if (error || !data?.url) {
      return { user: null, error: error?.message || 'تعذر بدء تسجيل الدخول' };
    }

    const res = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
    console.log('[supabase] authorize URL (بداية):', data.url);
    console.log('[supabase] عودة المتصفح res.type =', res.type, '| res.url =', res.type === 'success' ? res.url : '(لا يوجد)');
    if (res.type !== 'success') {
      return {
        user: null,
        error: `لم تتم العودة إلى التطبيق. أضف هذا الرابط إلى Supabase ← Authentication ← URL Configuration ← Redirect URLs: ${REDIRECT_URI}`,
      };
    }

    const code = extractCode(res.url);
    if (!code) {
      return { user: null, error: `الرابط الذي أرسله Supabase لم يُعرَف. أضف هذا الرابط إلى Supabase ← Authentication ← URL Configuration ← Redirect URLs: ${REDIRECT_URI}` };
    }

    const { data: sessionData, error: exError } = await supabase.auth.exchangeCodeForSession(code);
    if (exError || !sessionData.user) {
      return { user: null, error: exError?.message || 'تعذر تبادل رمز الجلسة' };
    }

    const meta = sessionData.user.user_metadata as Record<string, any> | undefined;
    return {
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email ?? undefined,
        name: meta?.full_name || meta?.name || meta?.given_name || undefined,
      },
    };
  } catch (e: any) {
    return { user: null, error: e?.message || 'خطأ غير متوقع أثناء تسجيل الدخول' };
  }
}

function extractCode(url: string): string | null {
  const match = url.match(/[?&](?:code|token_hash)=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function signOutGoogle(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {}
}
