import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAlert } from '@/template';
import { theme } from '../../constants/theme';

interface SurahType {
  id: string;
  name: string;
  ayat: number;
  type: string;
  snippet?: string;
}

const surahs: SurahType[] = [
  { id: '1', name: 'سورة الفاتحة', ayat: 7, type: 'مكية', snippet: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
  { id: '2', name: 'سورة البقرة', ayat: 286, type: 'مدنية', snippet: 'الم ۝ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ۝ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ' },
  { id: '3', name: 'سورة آل عمران', ayat: 200, type: 'مدنية', snippet: 'الم ۝ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۝ نَزَّلَ عَلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ' },
  { id: '4', name: 'سورة يس', ayat: 83, type: 'مكية', snippet: 'يس ۝ وَالْقُرْآنِ الْحَكِيمِ ۝ إِنَّكَ لَمِنَ الْمُرْسَلِينَ ۝ عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ' },
  { id: '5', name: 'سورة الملك', ayat: 30, type: 'مكية', snippet: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا' },
  { id: '6', name: 'سورة الكهف', ayat: 110, type: 'مكية', snippet: 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا ۜ ۝ قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ' },
  { id: '7', name: 'سورة الرحمن', ayat: 78, type: 'مدنية', snippet: 'الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ ۝ خَلَقَ الْإِنسَانَ ۝ عَلَّمَهُ الْبَيَانَ' },
  { id: '8', name: 'سورة الواقعة', ayat: 96, type: 'مكية', snippet: 'إِذَا وَقَعَتِ الْوَاقِعَةُ ۝ لَيْسَ لِوَقْعَتِهَا كَاذِبَةٌ ۝ خَافِضَةٌ رَّافِعَةٌ' },
  { id: '9', name: 'سورة الإخلاص', ayat: 4, type: 'مكية', snippet: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' },
  { id: '10', name: 'سورة الفلق', ayat: 5, type: 'مكية', snippet: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
  { id: '11', name: 'سورة الناس', ayat: 6, type: 'مدنية', snippet: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' },
];

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [selectedSurah, setSelectedSurah] = useState<SurahType | null>(null);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/bg-pattern.webp')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2,26,19,0.92)' }]} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>المصحف</Text>

          <Pressable
            onPress={() => showAlert('ورد القراءة', 'اقرأ جزءاً من القرآن يومياً لختم القرآن شهرياً\n\nابدأ من حيث توقفت واجعل لك ورداً يومياً ثابتاً')}
            style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          >
            <View style={styles.featuredCard}>
              <LinearGradient
                colors={['rgba(212,175,55,0.15)', 'rgba(6,78,59,0.3)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              />
              <MaterialIcons name="auto-stories" size={32} color={theme.gold} />
              <Text style={styles.featuredTitle}>ورد القراءة اليومي</Text>
              <Text style={styles.featuredDesc}>اقرأ جزءاً من القرآن يومياً لختم القرآن شهرياً</Text>
            </View>
          </Pressable>

          <Text style={styles.sectionTitle}>سور مختارة</Text>

          {surahs.map((surah, index) => (
            <Animated.View key={surah.id} entering={FadeInDown.delay(index * 50).duration(400)}>
              <Pressable
                onPress={() => setSelectedSurah(surah)}
                style={({ pressed }) => [styles.surahCard, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
              >
                <View style={styles.surahRight}>
                  <Text style={styles.surahName}>{surah.name}</Text>
                  <Text style={styles.surahInfo}>{surah.ayat} آيات  {surah.type}</Text>
                </View>
                <View style={styles.surahNumber}>
                  <Text style={styles.surahNumberText}>{surah.id}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Surah Detail Modal */}
      <Modal visible={selectedSurah !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedSurah(null)}>
          <View />
        </Pressable>
        <View style={styles.modalWrapper}>
          <View style={styles.surahModal}>
            <Pressable
              onPress={() => setSelectedSurah(null)}
              style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.5 }]}
            >
              <MaterialIcons name="close" size={22} color="#999" />
            </Pressable>

            <View style={styles.surahModalIcon}>
              <MaterialIcons name="auto-stories" size={28} color={theme.gold} />
            </View>

            <Text style={styles.surahModalTitle}>{selectedSurah?.name}</Text>
            <Text style={styles.surahModalInfo}>{selectedSurah?.ayat} آيات  {selectedSurah?.type}</Text>

            <View style={styles.surahSnippetCard}>
              <Text style={styles.surahSnippetText}>{selectedSurah?.snippet}</Text>
            </View>

            <Pressable
              onPress={() => {
                setSelectedSurah(null);
                showAlert('القراءة', 'ميزة قراءة السورة كاملة قيد التطوير');
              }}
              style={({ pressed }) => [styles.readBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient
                colors={['#064E3B', '#0D7A5F']}
                style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
              />
              <MaterialIcons name="menu-book" size={18} color="#FFF" />
              <Text style={styles.readBtnText}>قراءة السورة</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 8,
    marginBottom: 20,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    marginBottom: 24,
    gap: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  featuredDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: theme.surfaceCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.borderLight,
    gap: 12,
  },
  surahRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  surahName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    writingDirection: 'rtl',
  },
  surahInfo: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    writingDirection: 'rtl',
    marginTop: 2,
  },
  surahNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.gold,
  },
  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    pointerEvents: 'box-none',
  },
  surahModal: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  surahModalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  surahModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  surahModalInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  surahSnippetCard: {
    width: '100%',
    backgroundColor: '#FFFEF5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.12)',
  },
  surahSnippetText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 34,
  },
  readBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  readBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
  },
});
