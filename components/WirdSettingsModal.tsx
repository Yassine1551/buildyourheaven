import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { useApp } from '../contexts/AppContext';
import { WirdDhikrItem } from '../services/personalWird';

interface WirdSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WirdSettingsModal({ visible, onClose }: WirdSettingsModalProps) {
  const { wirdConfig, wirdCounts, updateWirdConfig } = useApp();
  const [localItems, setLocalItems] = useState<WirdDhikrItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [newTarget, setNewTarget] = useState('100');
  const [draftTargets, setDraftTargets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setLocalItems(wirdConfig.map(i => ({ ...i })));
      setShowAdd(false);
      setNewText('');
      setNewTarget('100');
      setDraftTargets({});
    }
  }, [visible, wirdConfig]);

  const commitTarget = (id: string) => {
    const draft = (draftTargets[id] || '').replace(/[^0-9]/g, '');
    const parsed = parseInt(draft, 10);
    const target = isNaN(parsed) || parsed < 1 ? 1 : Math.min(5000, parsed);
    updateItem(id, { target });
    setDraftTargets(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateItem = (id: string, patch: Partial<WirdDhikrItem>) => {
    setLocalItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));
  };

  const adjustTarget = (id: string, delta: number) => {
    setDraftTargets(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setLocalItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        const next = Math.max(1, Math.min(5000, (i.target || 100) + delta));
        return { ...i, target: next };
      })
    );
  };

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    const target = parseInt(newTarget, 10);
    setLocalItems(prev => [
      ...prev,
      { id: `wird_custom_${Date.now()}`, title: text, text, target: isNaN(target) || target < 1 ? 100 : target, enabled: true, custom: true },
    ]);
    setNewText('');
    setNewTarget('100');
    setShowAdd(false);
  };

  const removeItem = (id: string) => {
    setLocalItems(prev => prev.filter(i => i.id !== id));
  };

  const save = () => {
    updateWirdConfig(localItems);
    onClose();
  };

  const enabledCount = localItems.filter(i => i.enabled).length;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <View />
        </Pressable>
        <View style={styles.wrapper}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.5 }]}
              >
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.6)" />
              </Pressable>
              <Text style={styles.title}>إعدادات وردي</Text>
              <Pressable
                onPress={save}
                style={({ pressed }) => [styles.headerBtn, styles.saveBtn, pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="check" size={20} color={theme.gold} />
              </Pressable>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.hint}>
                عدادك اليومي يتصفّر تلقائياً مع بداية كل يوم جديد. فعّل ما تريد ومَن أراد الزيادة فليزد.
              </Text>

              {localItems.map(item => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={styles.progressCol}>
                      <Text style={styles.progressText}>
                        {wirdCounts[item.id] || 0}/{item.target}
                      </Text>
                      <Text style={styles.progressLabel}>اليوم</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemText, !item.enabled && styles.itemTextOff]}>{item.text}</Text>
                      {item.custom ? (
                        <Pressable
                          onPress={() => removeItem(item.id)}
                          style={({ pressed }) => [styles.customBadge, pressed && { opacity: 0.6 }]}
                        >
                          <MaterialIcons name="delete-outline" size={12} color="#EF4444" />
                          <Text style={styles.customBadgeText}>حذف</Text>
                        </Pressable>
                      ) : item.syncTarget === 'multi_qasr_khatma' ? (
                        <View style={styles.rewardBadge}>
                          <MaterialIcons name="castle" size={12} color={theme.gold} />
                          <Text style={styles.rewardBadgeText}>عند إتمامها: قصر في الجنة + 3 ختمات</Text>
                        </View>
                      ) : (
                        <Text style={styles.itemSub}>من أذكار الوِرد</Text>
                      )}
                    </View>
                    <Switch
                      value={item.enabled}
                      onValueChange={v => updateItem(item.id, { enabled: v })}
                      trackColor={{ false: '#333', true: '#0D7A5F' }}
                      thumbColor={item.enabled ? theme.gold : '#999'}
                    />
                  </View>
                  <View style={styles.stepperRow}>
                    <Pressable
                      onPress={() => adjustTarget(item.id, -10)}
                      style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
                    >
                      <MaterialIcons name="remove" size={18} color={theme.gold} />
                    </Pressable>
                    <View style={styles.stepValueBox}>
                      <TextInput
                        style={styles.stepValueInput}
                        value={draftTargets[item.id] ?? String(item.target)}
                        onChangeText={t => {
                          const sanitized = t.replace(/[^0-9]/g, '');
                          setDraftTargets(prev => ({ ...prev, [item.id]: sanitized }));
                          const parsed = parseInt(sanitized, 10);
                          if (!isNaN(parsed) && parsed >= 1 && parsed <= 5000) {
                            updateItem(item.id, { target: parsed });
                          }
                        }}
                        onBlur={() => commitTarget(item.id)}
                        keyboardType="number-pad"
                        maxLength={4}
                        textAlign="center"
                        keyboardAppearance="dark"
                      />
                    </View>
                    <Pressable
                      onPress={() => adjustTarget(item.id, 10)}
                      style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
                    >
                      <MaterialIcons name="add" size={18} color={theme.gold} />
                    </Pressable>
                    <Text style={styles.stepLabel}>العدد المنشود</Text>
                  </View>
                </View>
              ))}

              {showAdd ? (
                <View style={styles.addCard}>
                  <TextInput
                    style={styles.addTextInput}
                    placeholder="نص الذكر المخصص (مثال: لا إله إلا الله وحده لا شريك له)"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={newText}
                    onChangeText={setNewText}
                    textAlign="right"
                    multiline
                    keyboardAppearance="dark"
                  />
                  <View style={styles.addTargetRow}>
                    <TextInput
                      style={styles.addTargetInput}
                      value={newTarget}
                      onChangeText={t => setNewTarget(t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={4}
                      textAlign="center"
                      keyboardAppearance="dark"
                    />
                    <Text style={styles.addTargetLabel}>العدد المنشود</Text>
                  </View>
                  <View style={styles.addActions}>
                    <Pressable
                      onPress={() => setShowAdd(false)}
                      style={({ pressed }) => [styles.addCancelBtn, pressed && { opacity: 0.7 }]}
                    >
                      <Text style={styles.addCancelText}>إلغاء</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAdd}
                      style={({ pressed }) => [styles.addConfirmBtn, pressed && { opacity: 0.7 }]}
                    >
                      <MaterialIcons name="add" size={16} color="#FFF" />
                      <Text style={styles.addConfirmText}>إضافة</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowAdd(true)}
                  style={({ pressed }) => [styles.addNewBtn, pressed && { opacity: 0.7 }]}
                >
                  <MaterialIcons name="add-circle-outline" size={20} color={theme.gold} />
                  <Text style={styles.addNewText}>إضافة ذِكر مخصص</Text>
                </Pressable>
              )}
            </ScrollView>

            <Pressable
              onPress={save}
              style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient colors={['#064E3B', '#0D7A5F']} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
              <Text style={styles.confirmText}>
                حفظ ({enabledCount} {enabledCount === 1 ? 'ذكر مفعل' : 'أذكار مفعلة'})
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#032D21',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  scroll: {
    flexGrow: 0,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 18,
    marginBottom: 14,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    padding: 14,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  itemTextOff: {
    color: 'rgba(255,255,255,0.35)',
  },
  itemSub: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    writingDirection: 'rtl',
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  customBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  rewardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  progressCol: {
    alignItems: 'center',
    minWidth: 64,
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValueBox: {
    width: 112,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
  },
  stepValueInput: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    padding: 0,
    paddingHorizontal: 2,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    writingDirection: 'rtl',
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.gold,
    writingDirection: 'rtl',
  },
  addCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  addTextInput: {
    minHeight: 60,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    writingDirection: 'rtl',
  },
  addTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addTargetInput: {
    width: 112,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    padding: 0,
    paddingHorizontal: 2,
  },
  addTargetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    writingDirection: 'rtl',
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  addCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  addConfirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.9)',
  },
  addConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#032D21',
  },
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 6,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    writingDirection: 'rtl',
  },
});
