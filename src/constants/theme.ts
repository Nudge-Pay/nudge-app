import '@/global.css';

import { Platform } from 'react-native';

/** Shared Vela palette. Keep interactive labels readable in both color schemes. */
export const Colors = {
  light: {
    text: '#17243B',
    background: '#F7F8FA',
    backgroundElement: '#EDF1F6',
    backgroundSelected: '#DBE2EC',
    textSecondary: '#57657A',
    primary: '#245BCE',
    primaryPressed: '#1C49AA',
    primarySoft: '#EAF0FD',
    accent: '#245BCE',
    onPrimary: '#FFFFFF',
    border: '#DBE2EC',
    success: '#18794E',
    error: '#B42336',
    surface: '#FFFFFF',
  },
  dark: {
    text: '#EEF2FA',
    background: '#0E1625',
    backgroundElement: '#202D42',
    backgroundSelected: '#34445C',
    textSecondary: '#B0BDD0',
    primary: '#245BCE',
    primaryPressed: '#1C49AA',
    primarySoft: '#1B2D4E',
    accent: '#93BAFF',
    onPrimary: '#FFFFFF',
    border: '#34445C',
    success: '#67D9A2',
    error: '#FFA6B1',
    surface: '#172238',
  },
} as const;

export const Radius = { input: 12, card: 20, pill: 999 } as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
