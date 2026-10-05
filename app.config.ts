import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Vela',
  slug: 'vela-payments',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/brand/vela-app-icon.png',
  scheme: 'dingpayments',
  userInterfaceStyle: 'automatic',
  ios: {
    ...config.ios,
    icon: './assets/brand/vela-app-icon.png',
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
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/brand/vela-app-icon.png',
    },
    permissions: ['android.permission.NFC'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    ...config.web,
    output: 'static',
    favicon: './assets/brand/vela-favicon.png',
  },
  plugins: [
    'expo-dev-client',
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFFFFF',
        android: {
          image: './assets/brand/vela-mark.png',
          imageWidth: 76,
        },
      },
    ],
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
        nfcPermission:
          'Vela uses NFC to share and receive payment requests between devices.',
        includeNdefEntitlement: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
