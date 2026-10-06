import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Screen } from '@/components/ui';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { env } from '@/lib/env';

const FEATURES = [
  {
    title: 'Connect with a tap',
    description: 'Share payment requests between supported NFC devices.',
  },
  {
    title: 'Access with a passkey',
    description: 'Use your device’s passkey prompt to access your wallet.',
  },
  {
    title: 'Keep control of your funds',
    description: 'A self-custodial wallet for XLM and USDC on Stellar.',
  },
];

export function WelcomeView() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const testnet = env.stellarNetwork === 'testnet';

  return (
    <Screen scrollable contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              source={require('../../../../assets/brand/vela-mark.png')}
              style={styles.mark}
              contentFit="contain"
              accessible={false}
            />
            <ThemedText style={styles.wordmark}>vela</ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {testnet ? 'Testnet preview' : 'Stellar wallet'}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.main, wide && styles.mainWide]}>
          <View style={[styles.hero, wide && styles.heroWide]}>
            <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.accent }]}>
              PAYMENTS, WITH YOU IN CONTROL
            </ThemedText>
            <ThemedText
              accessibilityRole="header"
              style={[
                styles.headline,
                width < 380 && styles.headlineCompact,
                wide && styles.headlineWide,
              ]}
            >
              A simpler way{'\n'}to pay.
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.introduction}>
              Share a payment request with a tap. Access your wallet with a passkey. Keep your funds
              under your control.
            </ThemedText>
            <View style={styles.assetList}>
              {['XLM', 'USDC'].map((asset) => (
                <View key={asset} style={[styles.assetChip, { borderColor: theme.border }]}>
                  <ThemedText type="smallBold">{asset}</ThemedText>
                </View>
              ))}
              <ThemedText type="small" themeColor="textSecondary">
                on Stellar
              </ThemedText>
            </View>
          </View>

          <Card style={[styles.onboardingCard, wide && styles.cardWide]}>
            <View style={styles.cardHeading}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
                GET STARTED
              </ThemedText>
              <ThemedText accessibilityRole="header" style={styles.cardTitle}>
                Your wallet starts here.
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Create a passkey to begin setting up Vela.
              </ThemedText>
            </View>

            <View style={styles.features}>
              {FEATURES.map((feature, index) => (
                <View key={feature.title} style={styles.featureRow}>
                  <View style={[styles.featureNumber, { backgroundColor: theme.primarySoft }]}>
                    <ThemedText type="smallBold" style={{ color: theme.accent }} accessible={false}>
                      {String(index + 1).padStart(2, '0')}
                    </ThemedText>
                  </View>
                  <View style={styles.featureText}>
                    <ThemedText type="smallBold">{feature.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {feature.description}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <Button
                label="Set up your wallet"
                onPress={() => router.push('/(onboarding)/create-passkey')}
                accessibilityLabel="Set up your Vela wallet"
                accessibilityHint="Create a passkey to begin wallet setup"
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.previewNote}>
                {testnet ? 'This preview uses test funds only.' : 'Your keys stay on your device.'}
              </ThemedText>
            </View>
          </Card>
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Vela Payments
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Built on Stellar
          </ThemedText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { maxWidth: 1120, paddingHorizontal: 24, paddingVertical: 24 },
  container: { flex: 1, gap: 48 },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mark: { width: 48, height: 48 },
  wordmark: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -1 },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill },
  main: { flex: 1, gap: 36, justifyContent: 'center' },
  mainWide: { flexDirection: 'row', alignItems: 'center', gap: 56 },
  hero: { gap: 20 },
  heroWide: { flex: 1 },
  eyebrow: { fontSize: 11, lineHeight: 18, letterSpacing: 1.4 },
  headline: { fontSize: 46, lineHeight: 52, fontWeight: '700', letterSpacing: -2 },
  headlineCompact: { fontSize: 38, lineHeight: 44, letterSpacing: -1.5 },
  headlineWide: { fontSize: 62, lineHeight: 68, letterSpacing: -2.5 },
  introduction: { fontSize: 17, lineHeight: 28, maxWidth: 440 },
  assetList: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  assetChip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  onboardingCard: { padding: 24, gap: 28 },
  cardWide: { width: 420 },
  cardHeading: { gap: 10 },
  cardTitle: { fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: -0.5 },
  features: { gap: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, gap: 4 },
  actions: { gap: 12 },
  previewNote: { textAlign: 'center', fontSize: 12, lineHeight: 18 },
  footer: {
    borderTopWidth: 1,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
