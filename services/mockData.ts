export interface DhikrItem {
  id: string;
  title: string;
  dhikrText: string;
  fadl: string;
  targetCount: number;
  icon: string;
  color: string;
  hasanatPerCount: number;
  daleel: string;
  source: string;
  extraLifeMinutes?: number;
  slavesFreed?: number;
  isShield?: boolean;
  purgeSins?: number;
  sadaqah?: number;
  levels?: number;
  salat?: number;
  palms?: number;
  unlockRequirement?: string;
  unlockKey?: string;
  unlockValue?: number;
  secondUnlockKey?: string;
  secondUnlockValue?: number;
  requireAllPrevious?: boolean;
  order: number;
}

export interface StatItem {
  id: string;
  label: string;
  icon: string;
  key: string;
  color: string;
  defaultText?: string;
}

export const dhikrItems: DhikrItem[] = [
  {
    id: 'maghfira',
    title: 'مغفرة الذنوب',
    dhikrText: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    fadl: 'غُفِرَ له وإن كان قد فرَّ من الزَّحفِ',
    targetCount: 1,
    icon: 'water-drop',
    color: '#3B82F6',
    hasanatPerCount: 10,
    purgeSins: 1,
    daleel: 'عن شداد بن أوس رضي الله عنه أن النبي ﷺ قال: «مَن قال: أستغفرُ اللهَ الذي لا إلهَ إلا هو الحيَّ القيُّومَ وأتوبُ إليه، غُفِرَ له وإن كان قد فرَّ من الزَّحفِ»',
    source: 'رواه أبو داود والترمذي',
    order: 1,
  },
  {
    id: 'alf-hasana',
    title: 'ألف حسنة',
    dhikrText: 'سُبْحَانَ اللَّهِ',
    fadl: 'يُكتَبُ له ألفُ حسنةٍ أو يُحَطُّ عنه ألفُ خطيئةٍ',
    targetCount: 100,
    icon: 'stars',
    color: '#10B981',
    hasanatPerCount: 10,
    sadaqah: 1,
    daleel: 'عن سعد بن أبي وقاص رضي الله عنه أن النبي ﷺ قال: «أيَعجِزُ أحدُكم أن يَكسِبَ في اليومِ ألفَ حسنةٍ؟ فسأله سائلٌ: كيف يَكسِبُ أحدُنا ألفَ حسنةٍ؟ قال: يُسبِّحُ مئةَ تسبيحةٍ فيُكتَبُ له ألفُ حسنةٍ، أو يُحَطُّ عنه ألفُ خطيئةٍ»',
    source: 'رواه مسلم',
    unlockRequirement: 'أكمل "مغفرة الذنوب" 10 مرات',
    order: 2,
  },
  {
    id: 'nakhla',
    title: 'نخلة في الجنة',
    dhikrText: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ',
    fadl: 'غُرِسَتْ له نخلةٌ في الجنَّةِ',
    targetCount: 1,
    icon: 'park',
    color: '#10B981',
    hasanatPerCount: 10,
    palms: 1,
    sadaqah: 1,
    daleel: 'عن جابر بن عبدالله رضي الله عنه أن النبي ﷺ قال: «مَن قال: سُبحانَ اللهِ العظيمِ وبحَمدِه، غُرِسَتْ له نخلةٌ في الجنَّةِ»',
    source: 'رواه الترمذي — صحَّحه الألباني',
    unlockRequirement: 'أكمل "ألف حسنة" 3 مرات',
    order: 3,
  },
  {
    id: 'hirz',
    title: 'حرز من الشيطان',
    dhikrText: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    fadl: 'كانت له حِرزاً من الشيطان يومَه ذلك حتى يُمسي، وكُتبت له مئةُ حسنة، ومُحيت عنه مئةُ سيِّئة، وكانت له عَدلَ عشرِ رِقاب',
    targetCount: 100,
    icon: 'shield',
    color: '#3B82F6',
    hasanatPerCount: 10,
    slavesFreed: 10,
    extraLifeMinutes: 10.0,
    isShield: true,
    purgeSins: 100,
    sadaqah: 1,
    daleel: 'عن أبي هريرة رضي الله عنه أن النبي ﷺ قال: «مَن قال: لا إلهَ إلا اللهُ وحدَه لا شريكَ له، له المُلكُ وله الحمدُ وهو على كلِّ شيءٍ قدير، في يومٍ مئةَ مرَّة — كانت له عَدلَ عشرِ رِقاب، وكُتبت له مئةُ حسنة، ومُحيت عنه مئةُ سيِّئة، وكانت له حِرزاً من الشيطان يومَه ذلك حتى يُمسي»',
    source: 'متفق عليه',
    unlockRequirement: 'أكمل "صدقات الأذكار" 1000 مرة',
    order: 11,
  },
  {
    id: 'salat-nabi',
    title: 'الصلاة على النبي ﷺ',
    dhikrText: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ',
    fadl: 'صلَّى اللهُ عليه عَشرَ صلواتٍ، وحُطَّت عنه عشرُ خطيئاتٍ، ورُفعت له عشرُ درجاتٍ',
    targetCount: 1,
    icon: 'star',
    color: '#F59E0B',
    hasanatPerCount: 10,
    levels: 10,
    salat: 10,
    extraLifeMinutes: 0.5,
    purgeSins: 10,
    daleel: 'عن أنس بن مالك رضي الله عنه أن النبي ﷺ قال: «مَن صلَّى عليَّ صلاةً واحدةً، صلَّى اللهُ عليه عَشرَ صلواتٍ، وحُطَّت عنه عشرُ خطيئاتٍ، ورُفعت له عشرُ درجاتٍ»',
    source: 'رواه النسائي وأحمد — إسناده حسن',
    unlockRequirement: 'أكمل "حط الخطايا" 10 مرات',
    order: 5,
  },
  {
    id: 'thuluth-quran',
    title: 'ثلث القرآن',
    dhikrText: 'قُلْ هُوَ اللَّهُ أَحَدٌ (1) اللَّهُ الصَّمَدُ (2) لَمْ يَلِدْ وَلَمْ يُولَدْ (3) وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (4)',
    fadl: 'إنها لتعدِلُ ثلثَ القرآن',
    targetCount: 3,
    icon: 'menu-book',
    color: '#8B5CF6',
    hasanatPerCount: 47,
    extraLifeMinutes: 1.0,
    daleel: 'عن أبي سعيد الخدري رضي الله عنه أن النبي ﷺ قال: «والذي نفسي بيده، إنها لتعدِلُ ثلثَ القرآن — يعني ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾»',
    source: 'متفق عليه',
    unlockRequirement: 'أكمل "الصلاة على النبي" 200 مرة',
    order: 6,
  },
  {
    id: 'kanz',
    title: 'كنز الجنة',
    dhikrText: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    fadl: 'كنز من كنوز الجنة',
    targetCount: 1,
    icon: 'diamond',
    color: '#D4AF37',
    hasanatPerCount: 10,
    daleel: 'عن أبي موسى الأشعري رضي الله عنه أن النبي ﷺ قال: «ألا أدلُّك على كَنزٍ من كنوزِ الجنَّة؟ لا حولَ ولا قوَّةَ إلا باللهِ»',
    source: 'متفق عليه',
    unlockRequirement: 'أكمل "ثلث القرآن" 100 مرة',
    order: 7,
  },
  {
    id: 'sadaqat-dhikr',
    title: 'صدقات الأذكار',
    dhikrText: 'سُبْحَانَ اللَّهِ، الْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ، اللَّهُ أَكْبَرُ',
    fadl: 'التسبيحةُ صدقةٌ، والتحميدةُ صدقةٌ، والتهليلةُ صدقةٌ، والتكبيرةُ صدقةٌ',
    targetCount: 1,
    icon: 'volunteer-activism',
    color: '#EC4899',
    hasanatPerCount: 40,
    sadaqah: 4,
    daleel: 'عن أبي ذر الغفاري رضي الله عنه أن النبي ﷺ قال: «وتُجزِئُ عنكَ التسبيحةُ صدقةٌ، والتحميدةُ صدقةٌ، والتهليلةُ صدقةٌ، والتكبيرةُ صدقةٌ»',
    source: 'رواه مسلم',
    unlockRequirement: 'أكمل "ملء الميزان" 200 مرة',
    order: 10,
  },
  {
    id: 'milul-mizan',
    title: 'ملء الميزان',
    dhikrText: 'الْحَمْدُ لِلَّهِ',
    fadl: 'الحمدُ للهِ تملأُ الميزانَ',
    targetCount: 1,
    icon: 'balance',
    color: '#F59E0B',
    hasanatPerCount: 10,
    sadaqah: 1,
    daleel: 'عن أبي مالك الأشعري رضي الله عنه أن النبي ﷺ قال: «الحمدُ للهِ تملأُ الميزانَ، وسبحانَ اللهِ والحمدُ للهِ تملآنِ — أو تملأُ — ما بينَ السَّماواتِ والأرضِ»',
    source: 'رواه مسلم',
    unlockRequirement: 'أكمل "قصر في الجنة" 100 مرة',
    order: 9,
  },
  {
    id: 'jawamie',
    title: 'جوامع الكلم',
    dhikrText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',
    fadl: 'لو وُزِنت بما قلتِ منذُ اليومِ لوزَنتهن',
    targetCount: 3,
    icon: 'all-inclusive',
    color: '#8B5CF6',
    hasanatPerCount: 100,
    extraLifeMinutes: 180.0,
    sadaqah: 3,
    daleel: 'عن جُوَيرية بنت الحارث أم المؤمنين رضي الله عنها أن النبي ﷺ قال لها: «لقد قلتُ بعدَك أربعَ كلماتٍ ثلاثَ مرَّات، لو وُزِنت بما قلتِ منذُ اليومِ لوزَنتهن: سُبحانَ اللهِ وبحَمده، عددَ خَلقِه، ورضا نفسِه، وزِنةَ عرشِه، ومِدادَ كلِماته»',
    source: 'رواه مسلم',
    unlockRequirement: 'أكمل "حرز من الشيطان" مرة واحدة',
    order: 12,
  },
  {
    id: 'dhikr_qasr',
    title: 'قصر في الجنة',
    dhikrText: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    fadl: 'يبني الله تبارك وتعالى لقائلها قصراً في الجنة.',
    targetCount: 10,
    icon: 'castle',
    color: '#D97706',
    hasanatPerCount: 470,
    extraLifeMinutes: 2.0,
    daleel: 'قال النبي ﷺ: «مَنْ قَرَأَ: {قُلْ هُوَ اللَّهُ أَحَدٌ} حَتَّى يَخْتِمَهَا عَشْرَ مَرَّاتٍ؛ بَنَى اللَّهُ لَهُ قَصْرًا فِي الْجَنَّةِ» (السلسلة الصحيحة).',
    source: 'السلسلة الصحيحة للألباني',
    unlockRequirement: 'أكمل "كنز الجنة" 200 مرة',
    order: 8,
  },
  {
    id: 'jawahir',
    title: 'جوهرة الأذكار',
    dhikrText: 'سُبْحَانَ اللهِ عَدَدَ مَا خَلَق، سُبْحَانَ اللهِ مِلْءَ مَا خَلَق، سُبْحَانَ اللهِ عَدَدَ مَا فِي الأَرْضِ وَالسَّمَاء، سُبْحَانَ اللهِ مِلْءَ مَا فِي الأَرْضِ وَالسَّمَاء، سُبْحَانَ اللهِ عَدَدَ مَا أَحْصَى كِتَابُه، سُبْحَانَ اللهِ مِلْءَ مَا أَحْصَى كِتَابُه، سُبْحَانَ اللهِ عَدَدَ كُلِّ شَيْء، سُبْحَانَ اللهِ مِلْءَ كُلِّ شَيْء — وَالْحَمْدُ لِلهِ بِنَفْسِ الصِّيغَةِ',
    fadl: 'أكثرَ وأفضلَ من ذِكرِك الليلَ والنهارَ',
    targetCount: 1,
    icon: 'diamond',
    color: '#EC4899',
    hasanatPerCount: 10000,
    extraLifeMinutes: 1440.0,
    daleel: 'عن أبي أُمامة الباهلي رضي الله عنه قال: قال لي النبي ﷺ: «ألا أُخبرُكَ بأكثرَ وأفضلَ من ذِكرِك الليلَ والنهارَ؟ تقول: سُبحانَ اللهِ عددَ ما خلق، سُبحانَ اللهِ مِلءَ ما خلق، سُبحانَ اللهِ عددَ ما في الأرضِ والسماء، سُبحانَ اللهِ مِلءَ ما في الأرضِ والسماء، سُبحانَ اللهِ عددَ ما أحصى كتابُه، سُبحانَ اللهِ مِلءَ ما أحصى كتابُه، سُبحانَ اللهِ عددَ كلِّ شيء، سُبحانَ اللهِ مِلءَ كلِّ شيء، والحمدُ للهِ مثلَ ذلك»',
    source: 'رواه أحمد والنسائي — صحَّحه الأرناؤوط',
    unlockRequirement: 'أكمل "جوامع الكلم" 33 مرة',
    order: 13,
  },
  {
    id: 'hatt-khataya',
    title: 'حط الخطايا',
    dhikrText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    fadl: 'حُطَّتْ خطاياهُ وإن كانَت مثلَ زَبَدِ البحرِ',
    targetCount: 100,
    icon: 'cleaning-services',
    color: '#06B6D4',
    hasanatPerCount: 10,
    extraLifeMinutes: 2.0,
    purgeSins: 1,
    daleel: 'عن أبي هريرة رضي الله عنه أن النبي ﷺ قال: «مَن قال: سُبحانَ اللهِ وبحَمدِه، في يومٍ مائةَ مرَّةٍ، حُطَّتْ خطاياهُ وإن كانَت مثلَ زَبَدِ البحرِ»',
    source: 'متفق عليه',
    unlockRequirement: 'أكمل "نخلة في الجنة" 200 مرة',
    order: 4,
  },
];

export const statItems: StatItem[] = [
  { id: 's1', label: 'الدرجات', icon: 'emoji-events', key: 'level_points', color: '#D4AF37' },
  { id: 's2', label: 'الرقاب المعتوقة', icon: 'person-outline', key: 'riqab', color: '#F59E0B' },
  { id: 's3', label: 'صلوات الله عليك', icon: 'star-outline', key: 'salawat', color: '#D4AF37' },
  { id: 's4', label: 'الصدقة', icon: 'favorite-border', key: 'sadaqat', color: '#EC4899' },
  { id: 's5', label: 'النخيل', icon: 'park', key: 'palms', color: '#10B981' },
  { id: 's7', label: 'الكنوز', icon: 'diamond', key: 'treasures', color: '#D4AF37' },
  { id: 's8', label: 'الختمات', icon: 'menu-book', key: 'khatma', color: '#8B5CF6' },
  { id: 's9', label: 'قصورك في الجنة', icon: 'castle', key: 'qusur', color: '#D97706' },
];

export const dailyBenefits: string[] = [
  '"إن في القلب قسوة لا يذيبها إلا ذكر الله." - ابن القيم',
  '"الذكر للقلب مثل الماء للسمك." - ابن تيمية',
  '"لا تترك الذكر لعدم حضورك مع الله فيه." - ابن عطاء الله السكندري',
  '"الذكر يغسل القلب من صدأ الغفلة." - عبد القادر الجيلاني',
  '"تفقدوا الحلاوة في الصلاة، وفي الذكر، وفي القرآن." - الحسن البصري',
  '"من ذكر الله ذكراً حقيقياً نسي في جنبه كل شيء." - ذو النون المصري',
  '"لكل شيء جلاء، وجلاء القلوب ذكر الله." - أبو الدرداء',
  '"ما عمل ابن آدم عملاً أنجى له من عذاب الله من ذكر الله." - معاذ بن جبل',
  '"عليكم بذكر الله فإنه شفاء، وإياكم وذكر الناس فإنه داء." - عمر بن الخطاب',
  '"ما تلذذ المتلذذون بمثل ذكر الله." - مالك بن دينار',
  '"الغاية من الذكر دوام حضور القلب مع المذكور." - أبو حامد الغزالي',
  '"الذكر ينبه القلب من نوم الغفلة ويحييه." - ابن الجوزي',
  '"من أراد أن ينور الله قلبه فليكثر من ذكر الله." - الشافعي',
  '"الناس محتاجون إلى الذكر أكثر من حاجتهم للخبز والماء." - أحمد بن حنبل',
  '"طوبى لمن استوحش من الناس وأنس بذكر الله." - الفضيل بن عياض',
  '"ذكر الله جلاء الصدور وطمأنينة القلوب." - علي بن أبي طالب',
  '"من ذاق من خالص محبة الله ألهاه عن ذكر غيره." - أبو بكر الصديق',
  '"ليس على النفس شيء أشق من الذكر." - سهل التستري',
  '"من غفل عن الذكر طرفة عين فليس له عوض." - أبو عثمان الحيري',
  '"كل شيء يعصي الله فهو داء، ودواؤه ذكر الله." - سفيان الثوري',
  '"الذكر يوجب حياة القلب، ونسيانه يوجب موته." - ابن رجب الحنبلي',
  '"ذكر الله شفاء، وذكر الناس داء." - مكحول الدمشقي',
  '"دواء القلب خمسة أشياء، منها دوام الذكر." - يحيى بن معاذ',
  '"الذكر يطوي المسافات بين العبد وربه." - الجنيد البغدادي',
  '"اجعل ذكر الله شعارك وحب الله دثارك." - السري السقطي',
  '"محب الله لا يسكت عن ذكره." - رابعة العدوية',
  '"الذكر يفتح باب الغيب للقلب." - أبو سليمان الداراني',
  '"من صح ذكره لله هانت عليه كل مصيبة." - الحارث المحاسبي',
  '"لأن أسبح الله مائة تسبيحة أحب إلي من أن أنفق دنانير." - عبد الله بن مسعود',
  '"إذا وافق الذكر القلب نطق اللسان بالحكمة." - ابن عيينة',
  '"من أراد أن يكلمه الله فليكثر من الذكر." - بكر بن عبد الله المزني',
  '"ذكر اللسان عادة، وذكر القلب عبادة." - أبو يزيد البسطامي',
  '"بالذكر تتنزل السكينة وتنجلي الغشاوة عن البصيرة." - إبراهيم بن أدهم',
  '"من كثر ذكره لله طاب موته." - شقيق البلخي',
  '"الذكر ثمرة المعرفة، فمن عرفه ذكره." - محمد بن واسع',
  '"علامة حب الله حب ذكره." - معروف الكرخي',
  '"لو تفكر الناس في عظمة الله ما عصوه، فالزموا الذكر." - بشر الحافي',
  '"من تحقق بالذكر نسي المذكورات وبقي مع المذكور." - أبو مدين التلمساني',
  '"الذكر نور، والغفلة نار." - الحارث بن أسد',
  '"أكثروا من ذكر الله في الفراغ ليذكركم في الشدة." - ابن كثير',
];

export const initialStats: Record<string, number> = {
  treasures: 0,
  palms: 0,
  palaces: 0,
  khatma: 0,
  qusur: 0,
  salawat: 0,
  sadaqat: 0,
  riqab: 0,
  hirz_status: 0,
  level_points: 0,
  elapsed_days: 0,
  extra_life_minutes: 0,
};

export const initialDhikrCounts: Record<string, number> = {};

// Initialize all dhikr counts to 0
dhikrItems.forEach(item => {
  initialDhikrCounts[item.id] = 0;
});

export function formatNumber(num: number, western: boolean = true): string {
  if (num >= 1000000) {
    const val = (num / 1000000).toFixed(1) + 'M';
    return western ? val : val.replace(/[0-9]/g, d => String.fromCharCode(0x0660 + parseInt(d)));
  }
  if (num >= 1000) {
    const val = (num / 1000).toFixed(1) + 'K';
    return western ? val : val.replace(/[0-9]/g, d => String.fromCharCode(0x0660 + parseInt(d)));
  }
  return western ? num.toLocaleString('en-US') : num.toLocaleString('ar-EG');
}

export function formatArabicNumber(num: number, western: boolean = true): string {
  return western ? num.toLocaleString('en-US') : num.toLocaleString('ar-EG');
}

/**
 * Compact number formatter (1K, 1.5M, etc) using Intl.NumberFormat with notation: 'compact'.
 * Falls back to manual formatting for environments without Intl support.
 * Always returns English K/M/B suffix; converts digits to Arabic if `western` is false.
 */
export function formatCompactNumber(num: number, western: boolean = true): string {
  let result: string;
  if (num < 1000) {
    result = Math.floor(num).toString();
  } else {
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      });
      result = formatter.format(num);
    } catch (e) {
      if (num >= 1_000_000_000) {
        const b = num / 1_000_000_000;
        result = (b % 1 === 0 ? b.toFixed(0) : b.toFixed(1)) + 'B';
      } else if (num >= 1_000_000) {
        const m = num / 1_000_000;
        result = (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + 'M';
      } else {
        const k = num / 1000;
        result = (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K';
      }
    }
  }
  if (!western) {
    result = result.replace(/[0-9]/g, d => String.fromCharCode(0x0660 + parseInt(d)));
  }
  return result;
}

export function getDailyBenefit(): string {
  return dailyBenefits[Math.floor(Math.random() * dailyBenefits.length)];
}

export function getRandomBenefit(): string {
  return dailyBenefits[Math.floor(Math.random() * dailyBenefits.length)];
}

export const rankTitles = [
  { min: 0, title: 'مبتدئ' },
  { min: 10, title: 'صاحب' },
  { min: 30, title: 'مواظب' },
  { min: 60, title: 'ذاكر' },
  { min: 100, title: 'مسبّح' },
  { min: 200, title: 'عابد' },
  { min: 500, title: 'قانت' },
];

export function getRankTitle(istiqama: number): string {
  let title = 'مبتدئ';
  for (const rank of rankTitles) {
    if (istiqama >= rank.min) title = rank.title;
  }
  return title;
}

export function formatExtraLife(totalMinutes: number, western: boolean = true): string {
  if (totalMinutes < 1) return '';

  const totalMins = Math.floor(totalMinutes);
  const totalHours = Math.floor(totalMins / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalMonths = Math.floor(totalDays / 30);
  const totalYears = Math.floor(totalMonths / 12);

  const years = totalYears;
  const months = totalMonths % 12;
  const days = totalDays % 30;
  const hours = totalHours % 24;
  const minutes = totalMins % 60;

  const fmt = (n: number) => formatArabicNumber(n, western);

  // Build parts from largest to smallest
  const parts: string[] = [];

  if (years > 0) parts.push(`${fmt(years)} سنة`);
  if (months > 0) parts.push(`${fmt(months)} شهر`);
  if (days > 0) parts.push(`${fmt(days)} يوم`);
  if (hours > 0) parts.push(`${fmt(hours)} ساعة`);
  if (minutes > 0 && parts.length < 4) parts.push(`${fmt(minutes)} د`);

  // Limit to 4 largest units
  return parts.slice(0, 4).join(' • ') || `${fmt(totalMins)} د`;
}
