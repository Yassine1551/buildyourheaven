export const TOUR_TARGETS = {
  hasanat: 'hasanat',
  dashboard: 'dashboard',
  timeAdhkar: 'timeAdhkar',
  benefit: 'benefit',
  dhikrGrid: 'dhikrGrid',
  tabBar: 'tabBar',
  badges: 'badges',
  notifications: 'notifications',
  notifHistory: 'notifHistory',
  rankings: 'rankings',
  verseList: 'verseList',
  lockedVerse: 'lockedVerse',
} as const;

export type TourTargetKey = keyof typeof TOUR_TARGETS;

export interface TourRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TourStep {
  target: TourTargetKey | null;
  screen: string;
  title: string;
  body: string;
  chip: string;
  tapHint?: string;
  manual?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: 'hasanat',
    screen: '/',
    title: 'رصيد الحسنات',
    chip: '1',
    body: 'كل تسبيحة تسجّل لك حسنة، وهذا الرقم الذهبي يتضخّم مع كل ذكر. جرّب بنفسك لمس أي عنصر لاستكشافه.',
  },
  {
    target: 'dashboard',
    screen: '/',
    title: 'لوحة الإنجاز',
    chip: '2',
    body: 'ثماني بطاقات تلخّص رحلتك: درجاتك، النخيل، الكنوز، قصورك في الجنة وختماتك. كل رقم هنا ثمرة ذِكرٍ سبق.',
  },
  {
    target: 'timeAdhkar',
    screen: '/',
    title: 'أذكار الصباح والمساء',
    chip: '3',
    body: 'بطاقة ورد الوقت الحالي تظهر هنا تلقائياً — صباحاً ومساءً وعند النوم والاستيقاظ — ومعه «وردي الخاص» الذي تجهّزه بنفسك.',
  },
  {
    target: 'benefit',
    screen: '/',
    title: 'فائدة اليوم',
    chip: '4',
    body: 'جرعة إيمانية يومية تتغيّر كل يوم، مع زر «انشر تؤجر» لتعمّ الخير.',
  },
  {
    target: 'dhikrGrid',
    screen: '/',
    title: 'بطاقات الذكر',
    chip: '5',
    body: 'البطاقة المفتوحة تسبّح بلمسة، والمقفلة تعرض شرط فتحها. أكمل العدد وافتح الباقي تدريجياً.',
  },
  {
    target: 'tabBar',
    screen: '/',
    title: 'الشريط السفلي',
    chip: '6',
    body: 'أربعة أقسام: الأذكار هنا، ثم الأوسمة، التنبيهات، وآيات الحفظ. سنزورها واحدة تلو الأخرى.',
  },
  {
    target: 'badges',
    screen: '/badges',
    title: 'الأوسمة',
    chip: '7',
    manual: true,
    tapHint: 'اضغط على أيقونة «الأوسمة» في الشريط السفلي لتنتقل إليها.',
    body: 'إجمالي أذكارك، أيامك المتتالية وأعلى حصاد لك. وكل ذكر له مراتبه وألقابه التي تكسبها بالإخلاد.',
  },
  {
    target: 'notifications',
    screen: '/notifications',
    title: 'التنبيهات',
    chip: '8',
    manual: true,
    tapHint: 'اضغط على أيقونة «التنبيهات» في الشريط السفلي لتنتقل إليها.',
    body: 'جدولة يومية لأذكارك — صباحاً ومساءً وعند النوم — بوقت تختاره، لتنبيهك قبل أن تنسى.',
  },
  {
    target: 'notifHistory',
    screen: '/notifications',
    title: 'سجل التنبيهات',
    chip: '9',
    manual: true,
    body: 'أسفل الجدولة سجلٌ لكل تنبيه حان وقته وتمّ — ليطمئن قلبك أن وردك في موعده مهما انشغلت.',
  },
  {
    target: 'rankings',
    screen: '/rankings',
    title: 'آيات للحفظ',
    chip: '10',
    manual: true,
    tapHint: 'اضغط على أيقونة «آيات للحفظ» في الشريط السفلي لتنتقل إليها.',
    body: 'لوحة حفظك: عدد المحفوظ من أصل الكل مع نسبة التقدم، وفلاتر للعرض — ابدأ بسورة قصيرة اليوم.',
  },
  {
    target: 'verseList',
    screen: '/rankings',
    title: 'قائمة الحفظ',
    chip: '11',
    manual: true,
    body: 'قائمة كل آيات الحفظ: بطاقة لكل آية بلمسة تفتحها وتقرؤها، وعند إتقانها عدّها محفوظة ليُفتح لك ما بعدها.',
  },
  {
    target: 'lockedVerse',
    screen: '/rankings',
    title: 'الآيات المقفلة',
    chip: '12',
    manual: true,
    body: 'الآيات التي لم تحفظها بعد تظهر مقفلة مع شرط فتحها. أتقن ما قبلها لتفتحها واحدة تلو الأخرى.',
  },
  {
    target: null,
    screen: '/',
    title: 'جاهز للانطلاق',
    chip: '13',
    body: 'انتهت المقدمة. بعد هذا سنتعرف على اسمك وهدفك، ثم تكون حراً في استكشاف كل عنصر بنفسك. كل شيء محفوظ على جهازك، ويمكنك إعادة العرض من الإعدادات في أي وقت.',
  },
];
