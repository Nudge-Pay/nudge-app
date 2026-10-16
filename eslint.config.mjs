// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // eslint-plugin-import re-parses imported files with its own parser; point
    // TS sources at the TS parser so import/namespace stops flagging valid
    // TypeScript syntax as parse errors.
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'web-build/*'],
  },
]);
