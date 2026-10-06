# Development Guide

Peer-to-peer contactless (NFC) payments on Stellar with a self-custodial wallet and passkey authentication.

## Technology
- Node.js

## Setup
- Install dependencies with `npm ci`.
- `npm run android` runs `expo start --android`.
- `npm run dev-client` runs `expo start --dev-client`.
- `npm run format` runs `prettier --write .`.
- `npm run ios` runs `expo start --ios`.
- `npm run reset-project` runs `node ./scripts/reset-project.js`.
- `npm run start` runs `expo start`.
- `npm run web` runs `expo start --web`.

## Project checks
- `npm run build` runs `tsc --noEmit`.
- `npm run dev:build:android` runs `eas build --profile development --platform android`.
- `npm run dev:build:ios` runs `eas build --profile development --platform ios`.
- `npm run format:check` runs `prettier --check .`.
- `npm run lint` runs `expo lint`.
- `npm run lint:fix` runs `expo lint --fix`.
- `npm run test` runs `jest`.
- `npm run test:watch` runs `jest --watch`.
- `npm run typecheck` runs `tsc --noEmit`.

## Configuration
Environment variable names documented in `.env.example` (values intentionally omitted):
- `EXPO_PUBLIC_HORIZON_URL`
- `EXPO_PUBLIC_RPC_URL`
- `EXPO_PUBLIC_STELLAR_NETWORK`
- `EXPO_PUBLIC_USDC_ISSUER`

## Repository layout
- `.agents/`
- `.claude/`
- `.cursor/`
- `.vscode/`
- `assets/`
- `docs/`
- `src/`
- `types/`

## Contributing
Keep changes focused, update documentation when behavior changes, and include a clear summary with proposed changes.

