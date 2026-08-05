/**
 * Helper to build share messages for the daily adhkar screens.
 */

const APP_LINK = 'https://play.google.com/store/apps/details?id=YOUR_APP_ID';

export interface ShareAdhkarItem {
  title: string;
  text: string;
  target: number;
}

const formatCount = (count: number): string => {
  if (count === 1) return 'مرة واحدة';
  if (count === 2) return 'مرتين';
  if (count >= 3 && count <= 10) return `${count} مرات`;
  return `${count} مرة`;
};

const cleanTitle = (title: string): string => title.replace(/^\s*\d+[.)]\s+/, '');

const HEADER_EMOJI: Record<string, string> = {
  'أذكار الصباح': '🌄',
  'أذكار المساء': '🌇',
  'أذكار النوم': '🌙',
  'أذكار الاستيقاظ': '🌤️',
};

const REMAINING_LINE: Record<string, string> = {
  'أذكار الصباح': 'الصباح غنيمةٌ تنير يومك من أوله، لا تنسَها.',
  'أذكار المساء': 'المساء حصنٌ غليظ وبركة، لا تنسَها.',
  'أذكار النوم': 'النوم سكينةٌ وحصانة من الله، لا تنسَها.',
  'أذكار الاستيقاظ': 'الاستيقاظ يفتح يومك بالبركة والتفاؤل، لا تنسَها.',
};

export function buildAdhkarShareMessage(title: string, items: ShareAdhkarItem[]): string {
  const emoji = HEADER_EMOJI[title] ?? '📿';
  const remaining = `💚 أذكار ${REMAINING_LINE[title] ?? ''}`;

  const cta = `📌 حمّل تطبيق "ابنِ جنتك" لقراءة باقي ${title} كاملة، ستجد فيه كَنزاً من الأذكار المرتبة لكل وقت 👇`;

  // أذكار الاستيقاظ: تُعرض كلمة التشجيع مع نص «دعاء ردّ الروح والعافية»
  if (title === 'أذكار الاستيقاظ') {
    const dhikrText = items[1]?.text ?? '';
    return `${emoji} ${title} ${emoji}\n\n🤲 ${dhikrText}\n\n${remaining}\n\n------------------------------------------------\n${cta}\n${APP_LINK}`;
  }

  const preview = items.slice(0, 4);
  const lines = preview.map((it) => `🤲 ${cleanTitle(it.title)} (${formatCount(it.target)})`).join('\n');
  const hasMore = items.length > 4;

  return `${emoji} ${title} ${emoji}\n\n${lines}${hasMore ? '\n…' : ''}\n\n${remaining}\n\n------------------------------------------------\n${cta}\n${APP_LINK}`;
}