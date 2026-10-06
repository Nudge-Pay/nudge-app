import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import { SessionPolicyMount } from '@/features/auth/components/SessionPolicyMount';
import { ReceivePaymentProvider } from '@/features/receive/hooks/useReceivePayment';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.error,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <ErrorBoundary>
        <AuthProvider>
          <SessionPolicyMount />
          <AnimatedSplashOverlay />
          {/*
            ReceivePaymentProvider wraps every route so the FSM orchestrator
            (CLI-065) survives navigation between (tabs)/receive and the
            receive/* screens — Expo Router unmounts/remounts screens on
            navigation, so a per-screen hook instance would lose state.
          */}
          <ReceivePaymentProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="c05" />
            </Stack>
          </ReceivePaymentProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
