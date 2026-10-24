import { validateResolvedConfig } from '../scripts/check-config-consistency.mjs';
import generateConfig from '../app.config';
import appJson from '../app.json';

describe('Expo Configuration & Permission Consistency', () => {
  const baseConfig = (appJson as any).expo || appJson;

  it('correctly resolves full configuration with all NFC and asset requirements', () => {
    const resolved = generateConfig({ config: baseConfig } as any);
    const errors = validateResolvedConfig(resolved);
    expect(errors).toEqual([]);
  });

  it('fails verification when iOS NFC entitlement is missing', () => {
    const resolved = generateConfig({ config: baseConfig } as any);
    delete (resolved.ios?.entitlements as any)['com.apple.developer.nfc.readersession.formats'];
    const errors = validateResolvedConfig(resolved);
    expect(errors.some(e => e.includes('com.apple.developer.nfc.readersession.formats'))).toBe(true);
  });

  it('fails verification when Android NFC permission is omitted', () => {
    const resolved = generateConfig({ config: baseConfig } as any);
    resolved.android = {
      ...resolved.android,
      permissions: (resolved.android?.permissions || []).filter(p => p !== 'android.permission.NFC'),
    };
    const errors = validateResolvedConfig(resolved);
    expect(errors.some(e => e.includes('android.permission.NFC'))).toBe(true);
  });

  it('fails verification when NFCReaderUsageDescription is missing or empty', () => {
    const resolved = generateConfig({ config: baseConfig } as any);
    resolved.ios = {
      ...resolved.ios,
      infoPlist: {
        ...(resolved.ios?.infoPlist || {}),
        NFCReaderUsageDescription: '',
      },
    };
    const errors = validateResolvedConfig(resolved);
    expect(errors.some(e => e.includes('NFCReaderUsageDescription'))).toBe(true);
  });

  it('fails verification when platform icon paths diverge from base icon', () => {
    const resolved = generateConfig({ config: baseConfig } as any);
    resolved.ios = {
      ...resolved.ios,
      icon: './assets/brand/different-icon.png',
    };
    const errors = validateResolvedConfig(resolved);
    expect(errors.some(e => e.includes('iOS icon mismatch'))).toBe(true);
  });
});
