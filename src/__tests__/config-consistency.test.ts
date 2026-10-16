import appConfig from '../../app.config';
import appJson from '../../app.json';
import { validateExpoConfigConsistency } from '../../scripts/check-config-consistency.mjs';

describe('app.json and app.config.ts consistency (#44)', () => {
  const baseConfig = (appJson as { expo: Record<string, unknown> }).expo;

  it('passes on the repository app.json and app.config.ts', () => {
    const resolved = appConfig({ config: baseConfig } as never);
    expect(validateExpoConfigConsistency(appJson, resolved)).toEqual([]);
  });

  it('fails when Android NFC permission or iOS NFC entitlement is removed', () => {
    const resolved = appConfig({ config: baseConfig } as never);
    resolved.android = {
      ...resolved.android,
      permissions: [],
    };
    const errors = validateExpoConfigConsistency(appJson, resolved);
    expect(errors.some((e) => e.includes('android.permission.NFC'))).toBe(true);
  });

  it('fails when asset paths diverge between app.json and resolved config', () => {
    const resolved = appConfig({ config: baseConfig } as never);
    resolved.ios = {
      ...resolved.ios,
      icon: './assets/brand/stale-icon.png',
    };
    const errors = validateExpoConfigConsistency(appJson, resolved);
    expect(errors.some((e) => e.includes('iOS icon'))).toBe(true);
  });
});
