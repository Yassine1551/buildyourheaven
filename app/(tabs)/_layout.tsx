import { useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { useApp } from '../../contexts/AppContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { setTourRoot } = useApp();
  const rootRef = useRef<View>(null);

  const measureRoot = () => {
    rootRef.current?.measureInWindow((x, y, width, height) => {
      setTourRoot({ x, y, width, height });
    });
  };

  return (
    <View ref={rootRef} style={{ flex: 1 }} onLayout={measureRoot}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: Platform.select({
              ios: insets.bottom + 60,
              android: insets.bottom + 60,
              default: 70,
            }),
            paddingTop: 8,
            paddingBottom: Platform.select({
              ios: insets.bottom + 8,
              android: insets.bottom + 8,
              default: 8,
            }),
            backgroundColor: '#021A13',
            borderTopWidth: 1,
            borderTopColor: 'rgba(212,175,55,0.15)',
          },
          tabBarActiveTintColor: '#D4AF37',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'الأذكار',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="grid-view" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="badges"
          options={{
            title: 'الأوسمة',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="military-tech" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'تنبيهات',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="notifications-none" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rankings"
          options={{
            title: 'آيات للحفظ',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="menu-book" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="quran"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
