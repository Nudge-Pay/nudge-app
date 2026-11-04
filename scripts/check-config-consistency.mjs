#!/usr/bin/env node

/**
 * CI Quality Check: Validates Expo app.json and app.config.ts consistency,
 * ensuring NFC entitlements, permissions, usage descriptions, and asset paths match.
 */

import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const appJsonPath = path.join(projectRoot, 'app.json');

if (!fs.existsSync(appJsonPath)) {
  console.error('❌ app.json not found in working directory:', projectRoot);
  process.exit(1);
}

const rawAppJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const baseConfig = rawAppJson.expo || rawAppJson;

// Function to validate any given resolved Expo config
export function validateResolvedConfig(resolved) {
  const errors = [];

  // 1. Assert iOS NFC Entitlement
  const formats = resolved.ios?.entitlements?.['com.apple.developer.nfc.readersession.formats'];
  if (!Array.isArray(formats) || !formats.includes('NDEF') || !formats.includes('TAG')) {
    errors.push("Missing iOS NFC entitlement 'com.apple.developer.nfc.readersession.formats' with ['NDEF', 'TAG']");
  }

  // 2. Assert iOS NFCReaderUsageDescription in infoPlist
  const nfcDescription = resolved.ios?.infoPlist?.NFCReaderUsageDescription;
  if (!nfcDescription || typeof nfcDescription !== 'string' || nfcDescription.trim().length === 0) {
    errors.push("Missing or empty 'NFCReaderUsageDescription' in ios.infoPlist");
  }

  // 3. Assert Android android.permission.NFC
  const androidPermissions = resolved.android?.permissions || [];
  if (!androidPermissions.includes('android.permission.NFC')) {
    errors.push("Missing 'android.permission.NFC' in android.permissions");
  }

  // 4. Assert Asset path consistency
  const baseIcon = resolved.icon;
  const iosIcon = resolved.ios?.icon;
  const androidForeground = resolved.android?.adaptiveIcon?.foregroundImage;

  if (!baseIcon) {
    errors.push("Base 'icon' is not declared");
  }
  if (iosIcon && baseIcon && iosIcon !== baseIcon) {
    errors.push(`iOS icon mismatch: '${iosIcon}' does not match base icon '${baseIcon}'`);
  }
  if (androidForeground && baseIcon && androidForeground !== baseIcon) {
    errors.push(`Android adaptive foreground mismatch: '${androidForeground}' does not match base icon '${baseIcon}'`);
  }

  // 5. Assert NFC Plugin presence
  const hasNfcPlugin = resolved.plugins?.some(p => {
    const name = typeof p === 'string' ? p : p[0];
    return name === 'react-native-nfc-manager';
  });
  if (!hasNfcPlugin) {
    errors.push("Missing 'react-native-nfc-manager' plugin declaration in plugins array");
  }

  return errors;
}

// If executed directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  console.log('🔍 Validating Expo config consistency...');

  let configFunction;
  try {
    const appConfigModule = await import(path.join(projectRoot, 'app.config.ts'));
    configFunction = appConfigModule.default || appConfigModule;
  } catch (err) {
    try {
      const appConfigJs = await import(path.join(projectRoot, 'app.config.js'));
      configFunction = appConfigJs.default || appConfigJs;
    } catch {
      console.error('❌ Could not load app.config.ts or app.config.js:', err.message);
      process.exit(1);
    }
  }

  const resolved = typeof configFunction === 'function'
    ? configFunction({ config: baseConfig })
    : configFunction;

  const errors = validateResolvedConfig(resolved);

  if (errors.length > 0) {
    console.error('❌ Expo Config Consistency Check Failed with errors:');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log('✅ All Expo config consistency checks passed successfully!');
  console.log('  ✔ iOS NFC Entitlement verified');
  console.log('  ✔ iOS NFCReaderUsageDescription verified');
  console.log('  ✔ Android android.permission.NFC verified');
  console.log('  ✔ Asset icon path alignment verified');
  console.log('  ✔ react-native-nfc-manager plugin verified');
  process.exit(0);
}
