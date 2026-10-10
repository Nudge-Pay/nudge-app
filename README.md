<p align="center"><img src="assets/brand/vela-mark.png" alt="Nudge" width="120" /></p>

# Nudge — Mobile Client

![CI](https://github.com/Nudge-Pay/nudge-app/actions/workflows/ci-client.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Stellar](https://img.shields.io/badge/Stellar-Soroban-7D00FF?logo=stellar&logoColor=white)

An open-source mobile prototype exploring contactless payment requests, a self-custodial wallet and passkey access on [Stellar](https://stellar.org) testnet.

Nudge mobile app from the [Nudge-Pay](https://github.com/Nudge-Pay) organization, built with Expo and React Native.

> **Backend:** The NestJS API lives in [Nudge-Pay/nudge-server](https://github.com/Nudge-Pay/nudge-server).

## Table of Contents

- [How Nudge uses Stellar](#how-nudge-uses-stellar)
- [Project status](#project-status)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [EAS Development Build](#eas-development-build)
- [Quality checks (CI)](#quality-checks-ci)
- [C05 Spike documentation](#c05-spike-documentation)
- [NFC development (C10)](#nfc-development-c10)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [Environment variables](#environment-variables)
- [Security](#security)

## How Nudge uses Stellar

Nudge brings Stellar account and asset primitives into a mobile payment experience. A receiver prepares a request containing their Stellar public address, asset, amount and expiry, then shares it over NFC. The intended next step is for the payer to approve a Stellar transaction and for both devices to observe network confirmation. The client send/settlement integration is still unfinished.

The implemented wallet and request modules use `@stellar/stellar-sdk`:

| Capability            | Implementation                                                                                                                        | Role in Nudge                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Wallet keys           | [AccountService](src/features/wallet/services/AccountService.ts)                                                                      | Creates a Stellar keypair when needed and persists keys through the app's native secure-storage wrapper                   |
| Testnet onboarding    | `AccountService.fundTestnetAccount`                                                                                                   | Uses Friendbot for testnet funding; automatic funding is blocked on mainnet                                               |
| Account balances      | [BalanceService](src/features/wallet/services/BalanceService.ts)                                                                      | Loads accounts through Horizon and reads native XLM and the configured USDC code/issuer pair                              |
| USDC trustlines       | [TrustlineService](src/features/wallet/services/TrustlineService.ts)                                                                  | Checks existing trustlines, available XLM reserves and key ownership; builds and signs `changeTrust` when setup is needed |
| Payment requests      | [PaymentRequestBuilder](src/features/receive/services/PaymentRequestBuilder.ts)                                                       | Builds expiring requests from the receiver's public key, asset and decimal amount                                         |
| Contactless transport | [NFC codec](src/features/nfc/services/NfcPayloadCodec.ts) and [receive orchestrator](src/features/receive/hooks/useReceivePayment.ts) | Encodes requests, enforces byte limits and coordinates broadcast, waiting and cancellation states                         |

NFC delivery reports that the request reached the other device. A successful payment requires a separate confirmed Stellar transaction. Passkeys currently protect the app's access flow; the authentication-to-payment integration still needs server wiring and physical-device verification.

### Network and assets

The web build defaults to a testnet UI preview. Native wallet and trustline code uses the network endpoints and issuer configured in [src/lib/env.ts](src/lib/env.ts). Mainnet requires explicit configuration and is not the verified operating mode of this prototype.

- **XLM:** Stellar's native asset, used by the wallet and its reserve checks.
- **USDC:** Selected using both asset code and configured issuer. Testnet values are for testing; they do not represent real funds.
- **Amount precision:** Wallet asset definitions allow seven decimal places. The current receive UI restricts USDC input to two decimals as a product rule; that is distinct from Stellar's asset precision.

See [Stellar's asset model](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/assets) for code/issuer identification and amount precision.

### Work that advances the Stellar integration

- Coordinate the [shared payment contract](https://github.com/Nudge-Pay/nudge-server/issues/3) across both repositories.
- [Cover trustline key ownership and reserve checks](https://github.com/VelaPayments/vela-payments/issues/61).
- [Improve NFC byte-size and decoding coverage](https://github.com/VelaPayments/vela-payments/issues/17).

## Project status

Nudge is an early Stellar testnet prototype under active development. It is not ready for real funds or production payment use.

| Area             | Current status                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Web preview      | [Live UI preview](https://nudge-payments.vercel.app/); browser passkey setup and NFC are unavailable                    |
| Mobile           | Native onboarding, wallet and receive-flow code; requires a development build and physical-device validation            |
| Sending payments | Client Send screen is a scaffold; end-to-end payment completion is not demonstrated                                     |
| Authentication   | Client auth uses local challenges and placeholder API responses; server verification integration remains unfinished     |
| Shared payload   | Client and server currently use different type/timestamp formats; reconciliation is tracked in the contribution backlog |
| Compatibility    | Passkey RP domain and app/storage/NFC identifiers are pending a coordinated migration decision                          |

See [contributing](CONTRIBUTING.md) and [Wave preparation](docs/wave-readiness.md) for current priorities. Architecture/build-plan documents include intended features and must not be treated as proof of completed functionality.

## Prerequisites

- **Node.js** v20+
- **npm**
- **Xcode** (iOS) or **Android Studio** (Android)
- Physical NFC devices for end-to-end NFC validation

> **Expo Go is not supported.** NFC, passkeys, and SecureStore require a **development build** (`npx expo run:ios` or `npx expo run:android`, or EAS dev build).

## Setup

1. Clone and install dependencies:

   ```bash
   npm install
   cp .env.example .env
   ```

2. Build requirements for native features:

   - Run `npx expo prebuild` and `npx expo run:android` / `npx expo run:ios` for device validation.
   - Use `npm run dev-client` to launch a dev-client session after native dependencies are installed.

## EAS Development Build

1. Install and authenticate EAS CLI:

   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Create a development build:

   ```bash
   npm run dev:build:android
   # or
   npm run dev:build:ios
   ```

3. Start the dev client:

   ```bash
   npm run dev-client
   ```

4. **Native rebuild required** after changes to `app.config.ts` plugins, permissions, or native dependencies (`expo-dev-client`, `expo-secure-store`, `react-native-nfc-manager`, `react-native-passkey`).

## Quality checks (CI)

Run before opening a PR:

```bash
npm run typecheck
npm run lint
npm run test
npm run format:check
```

## C05 Spike documentation

- Passkey ADR: [`docs/adr-passkey-library.md`](docs/adr-passkey-library.md)
- Stellar ADR: [`docs/adr-stellar-sdk.md`](docs/adr-stellar-sdk.md)
- NFC ADR: [`docs/adr-nfc-library.md`](docs/adr-nfc-library.md)
- Spike PoC page: open `/c05` in the app after starting the dev-client.

## NFC development (C10)

The NFC core stack lives under `src/features/nfc/`:

| Module                                   | Purpose                                               |
| ---------------------------------------- | ----------------------------------------------------- |
| `services/NfcService.*`                  | Native abstraction (support checks, sessions)         |
| `schemas/paymentRequest.ts`              | Zod schema for `payment_request.v1` payloads          |
| `services/NfcPayloadCodec.ts`            | Compact JSON encode/decode with size guard            |
| `services/NfcWriter.ts` / `NfcReader.ts` | Writer (receiver) and reader (payer) sessions         |
| `state/nfcSessionStore.ts`               | Session state machine + `nfcActive` lock coordination |
| `services/nfc-spike.ts`                  | Manual PoC helpers for device verification            |

### Rebuild after native NFC changes

```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

### Smoke test on device

```typescript
import { nfcSpikeCheckSupport } from '@/features/nfc/services/nfc-spike';

const { supported, enabled } = await nfcSpikeCheckSupport();
```

See [docs/adr-nfc-library.md](docs/adr-nfc-library.md) for platform constraints and payload limits (880 bytes max).

## Scripts

| Command                | Description                |
| ---------------------- | -------------------------- |
| `npm start`            | Start Expo dev server      |
| `npm run dev-client`   | Start Expo with dev-client |
| `npm run build`        | Export the web app to dist |
| `npm run typecheck`    | TypeScript check           |
| `npm test`             | Run unit tests             |
| `npm run lint`         | ESLint via Expo            |
| `npm run format:check` | Prettier check (CI)        |

## Documentation

- [Vercel deployment](docs/deployment.md)

- [Product flows & system definition](docs/vela-overview.md)
- [Client MVP build plan](docs/build-plan-client-mvp.md)
- [NFC library ADR](docs/adr-nfc-library.md)
- [Receive payment flow (C12)](docs/receive-flow.md)
- [NFC runtime flow and troubleshooting](docs/nfc-flow.md)
- [NFC device checklist](docs/nfc-device-checklist.md)

## Environment variables

Copy `.env.example` to `.env` and fill in your values (see the file for inline docs). Key groups:

| Variable group | Key variables                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Stellar        | `EXPO_PUBLIC_STELLAR_NETWORK`, `EXPO_PUBLIC_HORIZON_URL`, `EXPO_PUBLIC_RPC_URL`, `EXPO_PUBLIC_USDC_ISSUER` |

## Security

- **Never commit secrets** — keep keys, seed phrases, and `.env` files out of source control.
- **Testnet values have no real-world value**; treat testnet deployments as experimental.
- **Keys never leave the wallet** — signing is delegated to the user's Stellar wallet; the app does not store secret keys.
- Report vulnerabilities per `SECURITY.md` where present rather than opening a public issue.

## License

[MIT](LICENSE). Existing Expo attribution is preserved.
