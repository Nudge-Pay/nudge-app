#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateExpoConfigConsistency(appJson, resolvedConfig) {
  const base = appJson?.expo ?? appJson ?? {};
  const errors = [];

  // 1. iOS NFC entitlement
  const formats =
    resolvedConfig?.ios?.entitlements?.[
      'com.apple.developer.nfc.readersession.formats'
    ];
  if (
    !Array.isArray(formats) ||
    !formats.includes('NDEF') ||
    !formats.includes('TAG')
  ) {
    errors.push(
      "Missing iOS entitlement 'com.apple.developer.nfc.readersession.formats' with ['NDEF', 'TAG']"
    );
  }

  // 2. iOS NFCReaderUsageDescription
  const nfcUsage = resolvedConfig?.ios?.infoPlist?.NFCReaderUsageDescription;
  if (typeof nfcUsage !== 'string' || nfcUsage.trim().length === 0) {
    errors.push(
      "Missing or empty 'ios.infoPlist.NFCReaderUsageDescription' in resolved Expo config"
    );
  }

  // 3. Android NFC permission
  const androidPermissions = resolvedConfig?.android?.permissions ?? [];
  if (
    !Array.isArray(androidPermissions) ||
    !androidPermissions.includes('android.permission.NFC')
  ) {
    errors.push(
      "Missing 'android.permission.NFC' in resolved 'android.permissions'"
    );
  }

  // 4. Plugins consistency (every plugin in app.json must appear in resolvedConfig, plus NFC plugin)
  const resolvedPluginNames = new Set(
    (resolvedConfig?.plugins ?? []).map((p) => (Array.isArray(p) ? p[0] : p))
  );
  for (const rawPlugin of base.plugins ?? []) {
    const name = Array.isArray(rawPlugin) ? rawPlugin[0] : rawPlugin;
    if (!resolvedPluginNames.has(name)) {
      errors.push(
        `Plugin '${name}' declared in app.json is missing from resolved app.config.ts plugins`
      );
    }
  }
  if (!resolvedPluginNames.has('react-native-nfc-manager')) {
    errors.push(
      "Missing 'react-native-nfc-manager' plugin in resolved Expo config"
    );
  }

  // 5. Asset paths consistency across app.json and resolved config
  const baseIcon = base.icon;
  if (!baseIcon || resolvedConfig?.icon !== baseIcon) {
    errors.push(
      `Icon path mismatch between app.json ('${baseIcon}') and resolved config ('${resolvedConfig?.icon}')`
    );
  }
  if (resolvedConfig?.ios?.icon !== baseIcon) {
    errors.push(
      `iOS icon '${resolvedConfig?.ios?.icon}' does not match base icon '${baseIcon}'`
    );
  }
  if (resolvedConfig?.android?.adaptiveIcon?.foregroundImage !== baseIcon) {
    errors.push(
      `Android adaptiveIcon.foregroundImage '${resolvedConfig?.android?.adaptiveIcon?.foregroundImage}' does not match base icon '${baseIcon}'`
    );
  }
  if (base.web?.favicon && resolvedConfig?.web?.favicon !== base.web.favicon) {
    errors.push(
      `Web favicon '${resolvedConfig?.web?.favicon}' does not match app.json '${base.web.favicon}'`
    );
  }

  const baseSplash = (base.plugins ?? []).find(
    (p) => Array.isArray(p) && p[0] === 'expo-splash-screen'
  )?.[1]?.android?.image;
  const resolvedSplash = (resolvedConfig?.plugins ?? []).find(
    (p) => Array.isArray(p) && p[0] === 'expo-splash-screen'
  )?.[1]?.android?.image;
  if (!baseSplash || resolvedSplash !== baseSplash) {
    errors.push(
      `Splash image mismatch between app.json ('${baseSplash}') and resolved config ('${resolvedSplash}')`
    );
  }

  return errors;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
  );
  const appJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'app.json'), 'utf8')
  );
  const baseConfig = appJson.expo ?? appJson;
  const appConfigModule = await import(
    `file://${path.join(repoRoot, 'app.config.ts').replace(/\\/g, '/')}`
  );
  const buildConfig = appConfigModule.default ?? appConfigModule;
  const resolved =
    typeof buildConfig === 'function'
      ? buildConfig({ config: baseConfig })
      : buildConfig;

  const errors = validateExpoConfigConsistency(appJson, resolved);
  if (errors.length > 0) {
    console.error('Expo config consistency check failed:');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    'Expo config consistency verified (NFC entitlement, NFCReaderUsageDescription, android.permission.NFC, plugins, and asset paths).'
  );
}
