// @ts-nocheck
import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { UPDATE_FEATURES, markUpdateAccepted } from '../services/appUpdate';

interface Props {
  visible: boolean;
  onAccept: () => void;
  onLater: () => void;
}

export default function UpdateNoticeModal({ visible, onAccept, onLater }: Props) {
  const handleAccept = () => {
    markUpdateAccepted();
    onAccept();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.overlay}>
        <LinearGradient colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFill} />
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="new-releases" size={34} color={theme.gold} />
          </View>
          <Text style={styles.title}>تحديث جديد 🎉</Text>
          <Text style={styles.subtitle}>استفد من المزايا الجديدة في "ابنِ جنتك"</Text>

          <ScrollView style={styles.featuresScroll} showsVerticalScrollIndicator={false}>
            {UPDATE_FEATURES.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <MaterialIcons name="check-circle" size={18} color="#10B981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={handleAccept}
            style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          >
            <LinearGradient colors={['#064E3B', '#0D7A5F']} style={StyleSheet.absoluteFill} />
            <Text style={styles.acceptBtnText}>استفد من المزايا الجديدة</Text>
          </Pressable>

          <Pressable onPress={onLater} style={({ pressed }) => [styles.laterBtn, pressed && { opacity: 0.6 }]}>
            <Text style={styles.laterBtnText}>لاحقاً</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0E2A1F',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    padding: 22,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    writingDirection: 'rtl',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  featuresScroll: {
    maxHeight: 180,
    width: '100%',
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 21,
  },
  acceptBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  laterBtn: {
    width: '100%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  laterBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
});