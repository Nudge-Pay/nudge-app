import { ExpoConfig, ConfigContext } from '@expo/config';

const NFC_READER_USAGE_DESCRIPTION =
  'Vela uses NFC to share and receive payment requests between devices.';
const FACE_ID_USAGE_DESCRIPTION =
  'Use Face ID to authenticate passkey operations safely.';

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseIcon = config.icon ?? './assets/brand/vela-app-icon.png';
  const basePlugins = (config.plugins ?? []).filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return ![
      'expo-dev-client',
      'expo-secure-store',
      'react-native-nfc-manager',
    ].includes(name);
  });

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
        NFCReaderUsageDescription: NFC_READER_USAGE_DESCRIPTION,
        NSFaceIDUsageDescription: FACE_ID_USAGE_DESCRIPTION,
      },
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        backgroundColor: config.android?.adaptiveIcon?.backgroundColor ?? '#FFFFFF',
        foregroundImage:
          config.android?.adaptiveIcon?.foregroundImage ?? baseIcon,
      },
      permissions: Array.from(
        new Set([...(config.android?.permissions ?? []), 'android.permission.NFC'])
      ),
      predictiveBackGestureEnabled:
        config.android?.predictiveBackGestureEnabled ?? false,
    },
    web: {
      ...config.web,
      output: config.web?.output ?? 'static',
      favicon: config.web?.favicon ?? './assets/brand/vela-favicon.png',
    },
    plugins: [
      'expo-dev-client',
      ...basePlugins,
      [
        'expo-secure-store',
        {
          faceIDPermission: FACE_ID_USAGE_DESCRIPTION,
          configureAndroidBackup: true,
        },
      ],
      [
        'react-native-nfc-manager',
        {
          nfcPermission: NFC_READER_USAGE_DESCRIPTION,
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
