import { Tabs } from 'expo-router';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AuthGuard } from '@/features/auth/components/AuthGuard';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
          tabBarLabelStyle: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tabs.Screen name="receive" options={{ title: 'Receive' }} />
        <Tabs.Screen name="send" options={{ title: 'Send' }} />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </AuthGuard>
  );
}
