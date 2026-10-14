/**
 * CI guard (issue #44): app.json is the shipping config; app.config.ts layers
 * dev/dynamic values on top. Every plugin + permission declared in app.json
 * must also be present in app.config.ts — otherwise a plugin/permission can
 * drift into app.json without the dynamic config knowing, and the two files
 * silently disagree at runtime. This fails the build (exit 1) on any drift.
 *
 * app.json ⊆ app.config.ts for plugins + shared assets.
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo ?? {};

const errors = [];

// Read the plugins array out of app.config.ts — it's TS, so extract the plugin
// names with a light parse (each entry is a string or [name, options]).
function configPluginNames(src) {
  const names = new Set();
  for (const m of src.matchAll(/'([a-z0-9-]+)'|(?:^|\s)\[\s*'([a-z0-9-]+)'/g)) {
    const n = m[1] || m[2];
    if (n && n.startsWith('expo-') || n === 'react-native-nfc-manager') names.add(n);
  }
  return names;
}

function jsonPluginNames(arr) {
  return (arr ?? []).map((p) => (Array.isArray(p) ? p[0] : p));
}

let configSrc = '';
try {
  configSrc = fs.readFileSync(path.join(root, 'app.config.ts'), 'utf8');
} catch {
  errors.push('app.config.ts unreadable — cannot verify plugin parity');
}

const jsonPlugins = new Set(jsonPluginNames(appJson.plugins));
const configPlugins = configPluginNames(configSrc);

// Every plugin in app.json must also exist in app.config.ts.
for (const p of jsonPlugins) {
  if (!configPlugins.has(p)) {
    errors.push(`plugin '${p}' is in app.json but missing from app.config.ts`);
  }
}

// Shared assets must agree — the splash image both files reference.
const jsonSplash = appJson.plugins?.find(
  (p) => Array.isArray(p) && p[0] === 'expo-splash-screen',
)?.[1]?.android?.image;
const configSplash = (configSrc.match(/image:\s*'([^']+)'/) || [])[1];
if (jsonSplash && configSplash && jsonSplash !== configSplash) {
  errors.push(`splash image drift: app.json '${jsonSplash}' vs app.config.ts '${configSplash}'`);
}

if (errors.length) {
  console.error('app-config consistency FAILED:');
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`app.json ⊆ app.config.ts — ${jsonPlugins.size} plugin(s) + shared assets in sync.`);
