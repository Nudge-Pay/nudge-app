import { ExpoConfig, ConfigContext } from '@expo/config';

/**
 * Dynamic Expo configuration for Vela Payments.
 * Reconciles base configuration from app.json while adding platform-specific
 * native capabilities (NFC, FaceID, SecureStore).
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const baseIcon = config.icon ?? './assets/brand/vela-app-icon.png';
  const baseSplashAndroid = config.plugins?.find(
    (p): p is [string, any] => Array.isArray(p) && p[0] === 'expo-splash-screen'
  )?.[1]?.android?.image ?? './assets/brand/vela-mark.png';

  return {
    ...config,
    name: config.name ?? 'Vela',
    slug: config.slug ?? 'vela-payments',
    version: config.version ?? '1.0.0',
    orientation: config.orientation ?? 'portrait',
    icon: baseIcon,
    scheme: config.scheme ?? 'dingpayments',
    userInterfaceStyle: config.userInterfaceStyle ?? 'automatic',
    ios: {
      ...config.ios,
      icon: config.ios?.icon ?? baseIcon,
      entitlements: {
        ...(config.ios?.entitlements ?? {}),
        'com.apple.developer.nfc.readersession.formats': ['NDEF', 'TAG'],
      },
      infoPlist: {
        ...(config.ios?.infoPlist ?? {}),
        NFCReaderUsageDescription:
          'Vela uses NFC to share and receive payment requests between devices.',
        NSFaceIDUsageDescription: 'Use Face ID to authenticate passkey operations safely.',
      },
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        backgroundColor: config.android?.adaptiveIcon?.backgroundColor ?? '#FFFFFF',
        foregroundImage: config.android?.adaptiveIcon?.foregroundImage ?? baseIcon,
      },
      permissions: Array.from(
        new Set([...(config.android?.permissions ?? []), 'android.permission.NFC'])
      ),
      predictiveBackGestureEnabled: config.android?.predictiveBackGestureEnabled ?? false,
    },
    web: {
      ...config.web,
      output: 'static',
      favicon: config.web?.favicon ?? './assets/brand/vela-favicon.png',
    },
    plugins: [
      // Preserve external plugins declared in app.json while eliminating duplicates
      ...(config.plugins ?? []).filter((p) => {
        const name = typeof p === 'string' ? p : p[0];
        return !['expo-dev-client', 'expo-secure-store', 'react-native-nfc-manager'].includes(name);
      }),
      'expo-dev-client',
      [
        'expo-secure-store',
        {
          faceIDPermission: 'Use Face ID to authenticate passkey operations safely.',
          configureAndroidBackup: true,
        },
      ],
      [
        'react-native-nfc-manager',
        {
          nfcPermission: 'Vela uses NFC to share and receive payment requests between devices.',
          includeNdefEntitlement: true,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
      ...config.experiments,
    },
  };
};
