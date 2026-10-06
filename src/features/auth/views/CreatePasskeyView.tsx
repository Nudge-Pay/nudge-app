/** Passkey registration screen shown during onboarding. */
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '../hooks/useAuth';
import { PasskeyService } from '../services/PasskeyService';

type ViewState = 'idle' | 'loading' | 'success' | 'error';

export function CreatePasskeyView() {
  const router = useRouter();
  const theme = useTheme();
  const { registerPasskey, state } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('idle');
  const supportInfo = PasskeyService.getSupportInfo();

  useEffect(() => {
    if (viewState !== 'success') return;
    const timeout = setTimeout(() => router.replace('/(onboarding)/wallet-setup'), 1200);
    return () => clearTimeout(timeout);
  }, [viewState, router]);

  const handleCreatePasskey = useCallback(async () => {
    if (!supportInfo.isSupported || viewState === 'loading') return;
    setViewState('loading');
    try {
      const success = await registerPasskey('Vela user');
      setViewState(success ? 'success' : 'error');
    } catch {
      setViewState('error');
    }
  }, [registerPasskey, supportInfo.isSupported, viewState]);

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Image
            source={require('../../../../assets/brand/vela-mark.png')}
            style={styles.mark}
            accessible={false}
          />
          <ThemedText type="smallBold">Vela</ThemedText>
        </View>
        <View style={styles.header}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            SECURE WALLET SETUP
          </ThemedText>
          <ThemedText type="title">Create your passkey.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Use a passkey to access your Vela wallet and authorize payments without a password.
          </ThemedText>
        </View>

        <Card style={styles.infoCard}>
          <InfoRow
            number="01"
            title="Protected by your device"
            text="Your device's passkey provider manages your credential securely."
          />
          <InfoRow
            number="02"
            title="Confirm it's you"
            text="Use Face ID, your fingerprint, or your device's screen lock when prompted."
          />
          <InfoRow
            number="03"
            title="One less password"
            text="Sign in without creating or remembering a password."
          />
        </Card>

        {!supportInfo.isSupported && (
          <Card style={styles.notice}>
            <ThemedText type="smallBold">
              {Platform.OS === 'web' ? 'Continue in the mobile app' : 'Passkeys unavailable'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {Platform.OS === 'web'
                ? 'Passkey setup is not available in this web preview. Use the Vela mobile app on a supported device to continue.'
                : 'Passkey setup is not available on this device. Continue on a supported device with the Vela app installed.'}
            </ThemedText>
          </Card>
        )}

        {viewState === 'success' && (
          <Card style={styles.notice} accessibilityLiveRegion="polite">
            <ThemedText type="smallBold" style={{ color: theme.success }}>
              Passkey created
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Continuing to wallet setup…
            </ThemedText>
          </Card>
        )}

        {viewState === 'error' && (
          <Card style={styles.notice} accessibilityRole="alert">
            <ThemedText type="small" style={{ color: theme.error }}>
              {state.lastError ?? 'Unable to create your passkey. Please try again.'}
            </ThemedText>
          </Card>
        )}

        {viewState !== 'success' && (
          <View style={styles.actions}>
            <Button
              label={
                viewState === 'loading'
                  ? 'Creating passkey…'
                  : viewState === 'error'
                    ? 'Try again'
                    : 'Create passkey'
              }
              onPress={handleCreatePasskey}
              loading={viewState === 'loading'}
              disabled={!supportInfo.isSupported || viewState === 'loading'}
              accessibilityLabel="Create your Vela passkey"
              accessibilityHint={
                supportInfo.isSupported
                  ? 'Opens your device verification prompt'
                  : 'Passkey setup is unavailable in this environment'
              }
            />
            <Button
              label="Back to welcome"
              variant="secondary"
              onPress={() => router.replace('/(onboarding)/welcome')}
              disabled={viewState === 'loading'}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

function InfoRow({ number, title, text }: { number: string; title: string; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.infoRow}>
      <ThemedText type="smallBold" style={{ color: theme.accent }} accessible={false}>
        {number}
      </ThemedText>
      <View style={styles.infoText}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {text}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 32, height: 32, resizeMode: 'contain' },
  header: { gap: 12 },
  description: { lineHeight: 26 },
  infoCard: { gap: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  infoText: { flex: 1, gap: 4 },
  notice: { gap: 8 },
  actions: { gap: 12 },
});
