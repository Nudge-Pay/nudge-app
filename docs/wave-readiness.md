# Wave preparation

Vela is an early open-source Stellar testnet payment prototype with an Expo client and NestJS backend. Its goal is contactless payment requests and self-custodial wallet access using NFC and passkeys.

## Submission description

> Vela explores NFC payment requests and passkey-protected wallets on Stellar testnet. The repositories contain native client flows, payload validation, wallet services, and backend authentication/payment modules. The web deployment is a UI preview. We are seeking contributors for shared protocol alignment, validation fixes, authentication failure handling and deterministic regression coverage. End-to-end transfers and native device behavior are not yet demonstrated, and client authentication integration remains incomplete.

Repositories:

- https://github.com/Nudge-Pay/nudge-app (upstream lineage: https://github.com/VelaPayments/vela-payments)
- https://github.com/Nudge-Pay/nudge-server (upstream lineage: https://github.com/VelaPayments/vela-server)
- Preview: https://nudge-payments.vercel.app/

## Verified preparation

- Both repositories provide an MIT license; existing Expo attribution is retained in the client.
- Contributor setup, focused PR expectations and check commands are in CONTRIBUTING.md.
- The original single-case backlog was reviewed and consolidated into seven scoped candidates per repository, with 31 pre-existing mobile PR-linked issues preserved for review. See [issue audit](issue-audit.md).
- Automated tests use mocks and fixtures. They establish regression coverage, not successful real-device payments or live transfer safety.
- Build-plan and architecture documents include planned functionality; the README project status records the current limits.

## Local verification — October 6, 2026

| Check               | Result                                                 |
| ------------------- | ------------------------------------------------------ |
| Formatting and lint | Passed (two existing NFC lint warnings)                |
| Type checking       | Passed                                                 |
| Build               | Passed                                                 |
| Unit tests          | 16 suites / 112 tests passed                           |
| End-to-end tests    | Physical-device payment/NFC/passkey flows not verified |

These results were recorded during preparation. Check the current GitHub Actions run for the latest remote result.

## First candidate set

Start with a manageable subset after maintainers confirm scope and dependencies. `wave-candidate` is a preparation label only; it does not enroll an issue in Drips.

- #17: NFC byte-size boundaries and decoding errors — deterministic codec coverage.
- #27: Receive precision and request construction — input regression coverage.
- #39: Timer concurrency and cancellation cleanup — fake-timer coverage.

Trustline key/reserve checks and passkey failure handling require careful review. Unknown-field validation must stay coordinated with the shared contract work in vela-server#3.

## Apply through Drips

1. Log into [Drips Wave](https://www.drips.network/wave) with the maintainer GitHub account.
2. In Maintainers → Orgs and Repos, install the Drips GitHub app on VelaPayments and select these public repositories.
3. Apply to the Stellar program, respecting the application limits displayed in the app, and use the description above.
4. Wait for organizer approval. Repository approval is not guaranteed and has not been verified for Vela.
5. Only after approval, add a small reviewed issue set to the program and set honest complexity values. Review applications promptly and verify PRs against their acceptance criteria.

The project remains a testnet prototype. Production hosting does not make it a mainnet wallet. The RP domain, storage identifiers, NFC MIME type and app scheme migration remain deferred. No contributor should bypass these compatibility decisions to make a demo appear complete.

References: [maintainer participation](https://docs.drips.network/wave/maintainers/participating-in-a-wave/), [program rules](https://docs.drips.network/wave/terms-and-rules/), [Stellar program](https://www.drips.network/wave/stellar).
