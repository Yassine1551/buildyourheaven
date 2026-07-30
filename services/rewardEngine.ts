/**
 * Reward Engine - المحرك المشترك
 * Reusable calculation engine for Dhikr rewards
 */

export interface RewardableItem {
  id: string;
  text: string;
  target: number;
  isQuran?: boolean;
  syncTarget?: string;
  hasanatPerCount?: number;
}

export interface RewardResult {
  hasanatBonus: number;
  syncStatKey: string | null;
  syncStatIncrement: number;
  letterCount?: number;
}

// Map from Arabic syncTarget labels to internal stat keys
const SYNC_TARGET_MAP: Record<string, string> = {
  'حرزك من الشيطان': 'hirz_status',
  'سيئاتك الممحية': 'sayyiat',
  'ختمة': 'khatma',
  'الأصول (Assets)': 'treasures',
  'multi_qasr_khatma': 'multi_qasr_khatma',
};

/**
 * Strip Arabic diacritics (Tashkeel) and spaces to count base letters only.
 * Regex removes: Fathah, Kasrah, Dammah, Sukun, Shadda, Tanwin, etc.
 */
function countArabicLetters(text: string): number {
  const stripped = text.replace(/[\s\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  return stripped.length;
}

/**
 * Calculate rewards when a user completes a Dhikr target.
 *
 * Quranic Formula:
 *   letterCount = countBaseLetters(text)
 *   hasanat = letterCount * 10 * targetCount
 *
 * Non-Quranic:
 *   hasanat = hasanatPerCount * targetCount (already handled per-tap in context)
 *   Completion bonus = 0 (rewards are per-tap)
 *
 * syncTarget: Maps to dashboard stat key and increments it.
 */
export interface MultiRewardResult {
  hasanatBonus: number;
  syncStatKey: string | null;
  syncStatIncrement: number;
  letterCount?: number;
  extraStats?: Record<string, number>;
}

export function calculateAndApplyRewards(item: RewardableItem): MultiRewardResult {
  let hasanatBonus = 0;
  let letterCount = 0;

  if (item.isQuran) {
    letterCount = countArabicLetters(item.text);
    hasanatBonus = letterCount * 10 * item.target;
  }

  // Determine sync target
  let syncStatKey: string | null = null;
  let syncStatIncrement = 1;
  let extraStats: Record<string, number> | undefined = undefined;

  if (item.syncTarget) {
    // Handle multi-reward: qasr + khatma
    if (item.syncTarget === 'multi_qasr_khatma') {
      // Increment qusur by 1, and khatma by floor(target / 3)
      syncStatKey = 'qusur';
      syncStatIncrement = 1;
      const khatmaIncrement = Math.floor(item.target / 3);
      if (khatmaIncrement > 0) {
        extraStats = { khatma: khatmaIncrement };
      }
    } else {
      syncStatKey = SYNC_TARGET_MAP[item.syncTarget] || null;
      // For hirz and sayyiat, increment by target to reflect completion
      if (syncStatKey === 'hirz_status') {
        syncStatIncrement = item.target;
      } else if (syncStatKey === 'sayyiat') {
        syncStatIncrement = item.target;
      } else {
        syncStatIncrement = 1;
      }
    }
  }

  return {
    hasanatBonus,
    syncStatKey,
    syncStatIncrement,
    letterCount,
    extraStats,
  };
}

/**
 * Get letter count for display purposes
 */
export function getLetterCount(text: string): number {
  return countArabicLetters(text);
}
