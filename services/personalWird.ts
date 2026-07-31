export interface WirdDhikrItem {
  id: string;
  title: string;
  text: string;
  target: number;
  enabled: boolean;
  custom?: boolean;
  syncTarget?: string;
}

export const WIRD_CONFIG_VERSION = 1;

export const DEFAULT_WIRD_ITEMS: WirdDhikrItem[] = [
  {
    id: 'wird_ikhlas',
    title: 'سورة الإخلاص',
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَّهُ كُفُوًا أَحَدٌ',
    target: 10,
    enabled: true,
    syncTarget: 'multi_qasr_khatma',
  },
  { id: 'wird_subhan', title: 'سُبْحَانَ اللهِ', text: 'سُبْحَانَ اللهِ', target: 100, enabled: true },
  { id: 'wird_hamd', title: 'الْحَمْدُ لِلَّهِ', text: 'الْحَمْدُ لِلَّهِ', target: 100, enabled: true },
  { id: 'wird_tahlil', title: 'لَا إِلَهَ إِلَّا اللهُ', text: 'لَا إِلَهَ إِلَّا اللهُ', target: 100, enabled: true },
  { id: 'wird_takbir', title: 'اللهُ أَكْبَرُ', text: 'اللهُ أَكْبَرُ', target: 100, enabled: true },
  { id: 'wird_hawqala', title: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', target: 100, enabled: true },
  { id: 'wird_hasbi', title: 'حَسْبِيَ اللهُ وَنِعْمَ الْوَكِيلُ', text: 'حَسْبِيَ اللهُ وَنِعْمَ الْوَكِيلُ', target: 100, enabled: true },
  { id: 'wird_salawat', title: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ', target: 100, enabled: true },
  { id: 'wird_istighfar', title: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ', text: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ', target: 100, enabled: true },
  { id: 'wird_subhan_wadhim', title: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ', text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ', target: 100, enabled: true },
];
