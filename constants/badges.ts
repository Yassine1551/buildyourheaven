export const MALE_TITLES_POOL = [
  'ذاكر الآصال', 'مهاجر الأنوار', 'مسافر الأسحار', 'مستمسك بالعروة', 'تائب المحراب',
  'أواب الدجى', 'ثابت العهد', 'مستثمر الفردوس', 'غارس الجنان', 'طالب الرضوان',
  'رفيق الترتيل', 'حارس القلب', 'مرتل الآيات', 'سابح النور', 'دائم الذكر',
  'مستغفر الأسحار', 'معتوق الرقبة', 'ملازم المحراب', 'قانت الليل', 'ساجد الغسق',
  'عابر الدنيا', 'مجاهد النفس', 'حافظ العهد', 'سائر للجنة', 'محب الرحمن',
  'منير الدرب', 'متبع السنة', 'صادق الوعد', 'خاشع الفؤاد', 'منيب السحر',
  'مشكاة الهدى', 'باغي الخير', 'دليل النور', 'تالي الكتاب', 'راجي العفو',
  'منفق السر', 'صابر البلاء', 'شاكر النعماء', 'مقيم الصلاة', 'محيي السنن',
  'مسبح البكور', 'مبصر الحق', 'زاهد الفناء', 'طالب البقاء', 'سليم الصدر',
  'نقي السريرة', 'خالص النية', 'مستنير القلب', 'جليس القرآن', 'طارق باب الله',
  'لاجئ الحمى', 'عائذ بالرحمن', 'واصل الرحم', 'كافل اليتيم', 'باذر الإحسان',
  'دائم الطهر', 'مأوى السكينة', 'ناشر الخير', 'كاظم الغيظ', 'عاف عن الناس',
  'رطب اللسان', 'دائم الاستغفار', 'منير البصيرة', 'خادم الدين', 'ناصر الحق',
  'داعي الهدى', 'مصلح الشأن', 'طيب الأثر', 'كريم الطبع', 'سمح التعامل',
  'صادق اللهجة', 'قوي الإيمان', 'راسخ اليقين', 'ممتد العطاء', 'دائم الشكر',
  'منيب الفؤاد', 'متوكل على الله', 'راض بالقضاء', 'قانع النصيب', 'عفيف النفس',
  'حيي الوجه', 'وقور الخطى', 'حكيم الرأي', 'صموت اللسان', 'متدبر الآي',
  'محب الصالحين', 'جليس الأبرار', 'مسارع الخيرات', 'سابق بالفضل', 'مستمسك بالحق',
  'حارس الثغور', 'ثابت الخطوة', 'بعيد النظر', 'عميق الفقه', 'ناصح أمين',
  'رفيق الدرب', 'محب المساكين', 'باكي الخشية', 'مستظل بالعرش', 'عابد المحراب',
];

export function feminizeTitle(title: string): string {
  const words = title.split(' ');
  let firstWord = words[0];

  if (firstWord === 'راضٍ') firstWord = 'راضية';
  else if (firstWord === 'عافٍ') firstWord = 'عافية';
  else if (firstWord === 'باكٍ') firstWord = 'باكية';
  else if (firstWord === 'ناشئ') firstWord = 'ناشئة';
  else if (firstWord === 'قانع') firstWord = 'قانعة';
  else if (firstWord === 'ثابت') firstWord = 'ثابتة';
  else if (firstWord === 'دائم') firstWord = 'دائمة';
  else if (firstWord === 'طالب') firstWord = 'طالبة';
  else if (firstWord === 'متبع') firstWord = 'متبعة';
  else if (firstWord === 'مقيم') firstWord = 'مقيمة';
  else if (firstWord === 'محيي') firstWord = 'محيية';
  else if (firstWord.endsWith('ة')) { /* already feminine */ }
  else if (firstWord.endsWith('ي')) {
    firstWord = firstWord.slice(0, -1) + 'ية';
  } else if (
    firstWord.endsWith('ع') || firstWord.endsWith('ر') ||
    firstWord.endsWith('د') || firstWord.endsWith('م') ||
    firstWord.endsWith('ب') || firstWord.endsWith('ق') ||
    firstWord.endsWith('ك') || firstWord.endsWith('ل') ||
    firstWord.endsWith('ت') || firstWord.endsWith('ز') ||
    firstWord.endsWith('س') || firstWord.endsWith('ش') ||
    firstWord.endsWith('ن') || firstWord.endsWith('ف') ||
    firstWord.endsWith('ض') || firstWord.endsWith('ص') ||
    firstWord.endsWith('ط')
  ) {
    firstWord = firstWord + 'ة';
  }

  words[0] = firstWord;
  return words.join(' ');
}

export function getRandomTitle(gender: 'male' | 'female'): string {
  const title = MALE_TITLES_POOL[Math.floor(Math.random() * MALE_TITLES_POOL.length)];
  return gender === 'female' ? feminizeTitle(title) : title;
}

// ============================================================
// DYNAMIC RANK PROGRESSION SYSTEM
// ============================================================

export type BadgeTier = 'copper' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface RankLevel {
  tier: BadgeTier;
  title: string;
  required: number;
  color: string;
  metalColor: string;
  icon: string;
}

export interface CardBadgeDef {
  cardId: string;
  cardTitle: string;
  usesInternalCounter: boolean;
  levels: RankLevel[];
}

export const TIER_INFO: Record<BadgeTier, { label: string; metalColor: string }> = {
  copper: { label: 'نحاسي', metalColor: '#B87333' },
  bronze: { label: 'برونزي', metalColor: '#CD7F32' },
  silver: { label: 'فضي',   metalColor: '#C0C0C0' },
  gold:   { label: 'ذهبي',  metalColor: '#D4AF37' },
  diamond: { label: 'ماسي', metalColor: '#5CE1E6' },
};

const COPPER = '#B87333';
const BRONZE = '#CD7F32';
const SILVER = '#94A3B8';
const GOLD = '#D4AF37';
const DIAMOND = '#5CE1E6';

export const CARD_BADGE_DEFINITIONS: CardBadgeDef[] = [
  {
    cardId: 'maghfira',
    cardTitle: 'مغفرة الذنوب',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'المستغفر النحاسي',   required: 100,  color: COPPER, metalColor: COPPER, icon: 'water-drop' },
      { tier: 'bronze', title: 'مستغفر الأسحار',       required: 500,  color: BRONZE, metalColor: BRONZE, icon: 'cleaning-services' },
      { tier: 'silver', title: 'مستغفر الدهر',         required: 1000, color: SILVER, metalColor: SILVER, icon: 'cleaning-services' },
      { tier: 'gold',   title: 'المستغفر الرباني',     required: 5000, color: GOLD,   metalColor: GOLD,   icon: 'auto-awesome' },
    ],
  },
  {
    cardId: 'alf-hasana',
    cardTitle: 'ألف حسنة',
    usesInternalCounter: true,
    levels: [
      { tier: 'copper', title: 'المسبح النحاسي',     required: 1,   color: COPPER, metalColor: COPPER, icon: 'auto-awesome' },
      { tier: 'bronze', title: 'المسبح البرونزي',    required: 3,   color: BRONZE, metalColor: BRONZE, icon: 'auto-awesome' },
      { tier: 'silver', title: 'المسبح الفضي',       required: 5,   color: SILVER, metalColor: SILVER, icon: 'auto-awesome' },
      { tier: 'gold',   title: 'المسبح الذهبي',      required: 10,  color: GOLD,   metalColor: GOLD,   icon: 'auto-awesome' },
    ],
  },
  {
    cardId: 'nakhla',
    cardTitle: 'نخلة في الجنة',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'زارع النخيل النحاسي',  required: 100,  color: COPPER, metalColor: COPPER, icon: 'park' },
      { tier: 'bronze', title: 'زارع النخيل البرونزي', required: 300,  color: BRONZE, metalColor: BRONZE, icon: 'park' },
      { tier: 'silver', title: 'زارع النخيل الفضي',    required: 500,  color: SILVER, metalColor: SILVER, icon: 'park' },
      { tier: 'gold',   title: 'زارع النخيل الذهبي',   required: 1000, color: GOLD,   metalColor: GOLD,   icon: 'park' },
    ],
  },
  {
    cardId: 'hirz',
    cardTitle: 'حرز من الشيطان',
    usesInternalCounter: true,
    levels: [
      { tier: 'copper', title: 'المتحصن النحاسي',   required: 10,  color: COPPER, metalColor: COPPER, icon: 'shield' },
      { tier: 'bronze', title: 'المتحصن البرونزي',  required: 50,  color: BRONZE, metalColor: BRONZE, icon: 'shield' },
      { tier: 'silver', title: 'المتحصن الفضي',     required: 100, color: SILVER, metalColor: SILVER, icon: 'shield' },
      { tier: 'gold',   title: 'المتحصن الذهبي',    required: 500, color: GOLD,   metalColor: GOLD,   icon: 'verified' },
    ],
  },
  {
    cardId: 'salat-nabi',
    cardTitle: 'الصلاة على النبي ﷺ',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'المصلي على النبي',    required: 100,  color: COPPER, metalColor: COPPER, icon: 'star' },
      { tier: 'bronze', title: 'ملازم الصلاة',        required: 500,  color: BRONZE, metalColor: BRONZE, icon: 'star' },
      { tier: 'silver', title: 'صاحب الشفاعة',        required: 1000, color: SILVER, metalColor: SILVER, icon: 'star' },
      { tier: 'gold',   title: 'حبيب المصطفى',        required: 5000, color: GOLD,   metalColor: GOLD,   icon: 'emoji-events' },
    ],
  },
  {
    cardId: 'thuluth-quran',
    cardTitle: 'ثلث القرآن',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'تالي القرآن',       required: 10,  color: COPPER, metalColor: COPPER, icon: 'menu-book' },
      { tier: 'bronze', title: 'مرتل الآيات',       required: 50,  color: BRONZE, metalColor: BRONZE, icon: 'menu-book' },
      { tier: 'silver', title: 'حامل القرآن',        required: 100, color: SILVER, metalColor: SILVER, icon: 'menu-book' },
      { tier: 'gold',   title: 'خادم القرآن',        required: 500, color: GOLD,   metalColor: GOLD,   icon: 'auto-awesome' },
    ],
  },
  {
    cardId: 'kanz',
    cardTitle: 'كنز الجنة',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'صاحب الكنوز النحاسي',  required: 10,  color: COPPER, metalColor: COPPER, icon: 'diamond' },
      { tier: 'bronze', title: 'صاحب الكنوز البرونزي', required: 50,  color: BRONZE, metalColor: BRONZE, icon: 'diamond' },
      { tier: 'silver', title: 'صاحب الكنوز الفضي',    required: 100, color: SILVER, metalColor: SILVER, icon: 'diamond' },
      { tier: 'gold',   title: 'صاحب الكنوز الذهبي',   required: 500, color: GOLD,   metalColor: GOLD,   icon: 'treasure-chest' },
    ],
  },
  {
    cardId: 'sadaqat-dhikr',
    cardTitle: 'صدقات الأذكار',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'المتصدق النحاسي',   required: 10,  color: COPPER, metalColor: COPPER, icon: 'volunteer-activism' },
      { tier: 'bronze', title: 'المتصدق البرونزي',  required: 50,  color: BRONZE, metalColor: BRONZE, icon: 'volunteer-activism' },
      { tier: 'silver', title: 'المتصدق الفضي',     required: 100, color: SILVER, metalColor: SILVER, icon: 'volunteer-activism' },
      { tier: 'gold',   title: 'المتصدق الذهبي',    required: 500, color: GOLD,   metalColor: GOLD,   icon: 'volunteer-activism' },
    ],
  },
  {
    cardId: 'milul-mizan',
    cardTitle: 'ملء الميزان',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'ثقيل الميزان النحاسي',  required: 5,   color: COPPER, metalColor: COPPER, icon: 'balance' },
      { tier: 'bronze', title: 'ثقيل الميزان البرونزي', required: 25,  color: BRONZE, metalColor: BRONZE, icon: 'balance' },
      { tier: 'silver', title: 'ثقيل الميزان الفضي',    required: 50,  color: SILVER, metalColor: SILVER, icon: 'balance' },
      { tier: 'gold',   title: 'ثقيل الميزان الذهبي',   required: 100, color: GOLD,   metalColor: GOLD,   icon: 'balance' },
    ],
  },
  {
    cardId: 'jawamie',
    cardTitle: 'جوامع الكلم',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'جامع الكلم النحاسي',  required: 10,  color: COPPER, metalColor: COPPER, icon: 'all-inclusive' },
      { tier: 'bronze', title: 'جامع الكلم البرونزي', required: 50,  color: BRONZE, metalColor: BRONZE, icon: 'all-inclusive' },
      { tier: 'silver', title: 'جامع الكلم الفضي',    required: 100, color: SILVER, metalColor: SILVER, icon: 'all-inclusive' },
      { tier: 'gold',   title: 'جامع الكلم الذهبي',   required: 500, color: GOLD,   metalColor: GOLD,   icon: 'auto-awesome' },
    ],
  },
  {
    cardId: 'dhikr_qasr',
    cardTitle: 'قصر في الجنة',
    usesInternalCounter: true,
    levels: [
      { tier: 'copper', title: 'باني القصور النحاسي',  required: 10,  color: COPPER, metalColor: COPPER, icon: 'castle' },
      { tier: 'bronze', title: 'باني القصور البرونزي', required: 50,  color: BRONZE, metalColor: BRONZE, icon: 'castle' },
      { tier: 'silver', title: 'باني القصور الفضي',    required: 100, color: SILVER, metalColor: SILVER, icon: 'castle' },
      { tier: 'gold',   title: 'باني القصور الذهبي',   required: 500, color: GOLD,   metalColor: GOLD,   icon: 'castle' },
    ],
  },
  {
    cardId: 'jawahir',
    cardTitle: 'جوهرة الأذكار',
    usesInternalCounter: false,
    levels: [
      { tier: 'copper', title: 'ناظم الجواهر النحاسي',  required: 5,   color: COPPER, metalColor: COPPER, icon: 'diamond' },
      { tier: 'bronze', title: 'ناظم الجواهر البرونزي', required: 25,  color: BRONZE, metalColor: BRONZE, icon: 'diamond' },
      { tier: 'silver', title: 'ناظم الجواهر الفضي',    required: 50,  color: SILVER, metalColor: SILVER, icon: 'diamond' },
      { tier: 'gold',   title: 'ناظم الجواهر الذهبي',   required: 100, color: GOLD,   metalColor: GOLD,   icon: 'auto-awesome' },
    ],
  },
  {
    cardId: 'hatt-khataya',
    cardTitle: 'حط الخطايا',
    usesInternalCounter: true,
    levels: [
      { tier: 'copper', title: 'حاط الخطايا النحاسي',  required: 1,  color: COPPER, metalColor: COPPER, icon: 'cleaning-services' },
      { tier: 'bronze', title: 'حاط الخطايا البرونزي', required: 3,  color: BRONZE, metalColor: BRONZE, icon: 'cleaning-services' },
      { tier: 'silver', title: 'حاط الخطايا الفضي',    required: 5,  color: SILVER, metalColor: SILVER, icon: 'cleaning-services' },
      { tier: 'gold',   title: 'حاط الخطايا الذهبي',   required: 10, color: GOLD,   metalColor: GOLD,   icon: 'auto-awesome' },
    ],
  },
];

export function getBadgeId(cardId: string, tier: BadgeTier): string {
  return `${cardId}_${tier}`;
}

export function getCurrentRank(cardId: string, dhikrCounts: Record<string, number>): { rankIndex: number; level: RankLevel | null; nextLevel: RankLevel | null } {
  const def = CARD_BADGE_DEFINITIONS.find(d => d.cardId === cardId);
  if (!def) return { rankIndex: -1, level: null, nextLevel: null };

  const current = dhikrCounts[cardId] || 0;
  let rankIndex = -1;
  for (let i = def.levels.length - 1; i >= 0; i--) {
    if (current >= def.levels[i].required) {
      rankIndex = i;
      break;
    }
  }

  const level = rankIndex >= 0 ? def.levels[rankIndex] : null;
  const nextLevel = (rankIndex >= 0 && rankIndex < def.levels.length - 1) ? def.levels[rankIndex + 1] : null;
  return { rankIndex, level, nextLevel };
}

// Legacy badge check system (used by AppContext)
export interface BadgeDef {
  id: string;
  label: string;
  check: (dhikrCounts: Record<string, number>, stats: Record<string, number>, hasanat: number) => boolean;
}

export function getNewBadges(
  currentBadges: string[],
  dhikrCounts: Record<string, number>,
  stats: Record<string, number>,
  hasanat: number,
): string[] {
  const newBadges: string[] = [];
  for (const def of CARD_BADGE_DEFINITIONS) {
    if (def.cardId === 'hatt-khataya') continue; // locked card - skip badge check
    const current = dhikrCounts[def.cardId] || 0;
    for (const level of def.levels) {
      const badgeId = getBadgeId(def.cardId, level.tier);
      if (!currentBadges.includes(badgeId) && current >= level.required) {
        newBadges.push(badgeId);
      }
    }
  }
  return newBadges;
}
