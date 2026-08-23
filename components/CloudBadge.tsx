import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

export default function CloudBadge({
  onPress,
  style,
}: {
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const { cloudUser } = useApp();
  const connected = !!cloudUser;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, style, pressed && { opacity: 0.7 }]}
      hitSlop={6}
    >
      <MaterialIcons
        name={connected ? 'cloud-done' : 'cloud'}
        size={20}
        color={connected ? '#34D399' : '#9CA3AF'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});