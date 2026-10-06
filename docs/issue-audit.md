# Contributor issue audit

Reviewed October 6, 2026. The initial 75 single-case tickets in this repository were compared with their referenced test suites and implementation. Existing coverage, incorrect assumptions and tiny duplicate scopes were consolidated into seven substantive tasks. Original issue bodies and links are retained on closed issues. Thirty-one issues with existing open PRs remain open with their original scopes for maintainer review; those submissions were not automatically accepted or rejected.

Examples of findings: Wallet reset and trustline idempotence are already covered. Expiry equality is rejected by validateExpiry, absent USDC is represented by null, and Zod currently strips unknown payload fields. Tests should establish the intended behavior rather than repeat covered cases.

| Issue                                                          | Reviewed task                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| [#3](https://github.com/VelaPayments/vela-payments/issues/3)   | Reject unknown NFC payload fields and cover expiry boundaries      |
| [#17](https://github.com/VelaPayments/vela-payments/issues/17) | Cover NFC byte-size boundaries and decoding error classifications  |
| [#27](https://github.com/VelaPayments/vela-payments/issues/27) | Cover receive amount precision and request construction boundaries |
| [#39](https://github.com/VelaPayments/vela-payments/issues/39) | Cover receive timer concurrency and NFC cancellation cleanup       |
| [#48](https://github.com/VelaPayments/vela-payments/issues/48) | Cover absent wallet balances and nonfinite display inputs          |
| [#61](https://github.com/VelaPayments/vela-payments/issues/61) | Cover trustline key ownership and available-reserve checks         |
| [#75](https://github.com/VelaPayments/vela-payments/issues/75) | Sanitize passkey challenge and secure-storage failures             |

These are preparation candidates only. Maintainers must confirm scope, dependencies and acceptance criteria before adding them to an approved Drips Wave Program. Completing a task does not guarantee a reward.

## Existing work awaiting review

- [Issue #16](https://github.com/VelaPayments/vela-payments/issues/16) → [PR #78](https://github.com/VelaPayments/vela-payments/pull/78)
- [Issue #28](https://github.com/VelaPayments/vela-payments/issues/28) → [PR #108](https://github.com/VelaPayments/vela-payments/pull/108)
- [Issue #30](https://github.com/VelaPayments/vela-payments/issues/30) → [PR #107](https://github.com/VelaPayments/vela-payments/pull/107)
- [Issue #31](https://github.com/VelaPayments/vela-payments/issues/31) → [PR #106](https://github.com/VelaPayments/vela-payments/pull/106)
- [Issue #32](https://github.com/VelaPayments/vela-payments/issues/32) → [PR #105](https://github.com/VelaPayments/vela-payments/pull/105)
- [Issue #34](https://github.com/VelaPayments/vela-payments/issues/34) → [PR #104](https://github.com/VelaPayments/vela-payments/pull/104)
- [Issue #35](https://github.com/VelaPayments/vela-payments/issues/35) → [PR #103](https://github.com/VelaPayments/vela-payments/pull/103)
- [Issue #41](https://github.com/VelaPayments/vela-payments/issues/41) → [PR #102](https://github.com/VelaPayments/vela-payments/pull/102)
- [Issue #44](https://github.com/VelaPayments/vela-payments/issues/44) → [PR #101](https://github.com/VelaPayments/vela-payments/pull/101)
- [Issue #45](https://github.com/VelaPayments/vela-payments/issues/45) → [PR #100](https://github.com/VelaPayments/vela-payments/pull/100)
- [Issue #46](https://github.com/VelaPayments/vela-payments/issues/46) → [PR #81](https://github.com/VelaPayments/vela-payments/pull/81)
- [Issue #50](https://github.com/VelaPayments/vela-payments/issues/50) → [PR #99](https://github.com/VelaPayments/vela-payments/pull/99)
- [Issue #51](https://github.com/VelaPayments/vela-payments/issues/51) → [PR #98](https://github.com/VelaPayments/vela-payments/pull/98)
- [Issue #52](https://github.com/VelaPayments/vela-payments/issues/52) → [PR #97](https://github.com/VelaPayments/vela-payments/pull/97)
- [Issue #53](https://github.com/VelaPayments/vela-payments/issues/53) → [PR #96](https://github.com/VelaPayments/vela-payments/pull/96)
- [Issue #54](https://github.com/VelaPayments/vela-payments/issues/54) → [PR #95](https://github.com/VelaPayments/vela-payments/pull/95)
- [Issue #55](https://github.com/VelaPayments/vela-payments/issues/55) → [PR #94](https://github.com/VelaPayments/vela-payments/pull/94)
- [Issue #56](https://github.com/VelaPayments/vela-payments/issues/56) → [PR #80](https://github.com/VelaPayments/vela-payments/pull/80)
- [Issue #57](https://github.com/VelaPayments/vela-payments/issues/57) → [PR #93](https://github.com/VelaPayments/vela-payments/pull/93)
- [Issue #59](https://github.com/VelaPayments/vela-payments/issues/59) → [PR #91](https://github.com/VelaPayments/vela-payments/pull/91)
- [Issue #60](https://github.com/VelaPayments/vela-payments/issues/60) → [PR #90](https://github.com/VelaPayments/vela-payments/pull/90)
- [Issue #62](https://github.com/VelaPayments/vela-payments/issues/62) → [PR #89](https://github.com/VelaPayments/vela-payments/pull/89)
- [Issue #65](https://github.com/VelaPayments/vela-payments/issues/65) → [PR #88](https://github.com/VelaPayments/vela-payments/pull/88)
- [Issue #67](https://github.com/VelaPayments/vela-payments/issues/67) → [PR #82](https://github.com/VelaPayments/vela-payments/pull/82)
- [Issue #68](https://github.com/VelaPayments/vela-payments/issues/68) → [PR #92](https://github.com/VelaPayments/vela-payments/pull/92)
- [Issue #70](https://github.com/VelaPayments/vela-payments/issues/70) → [PR #87](https://github.com/VelaPayments/vela-payments/pull/87)
- [Issue #71](https://github.com/VelaPayments/vela-payments/issues/71) → [PR #86](https://github.com/VelaPayments/vela-payments/pull/86)
- [Issue #72](https://github.com/VelaPayments/vela-payments/issues/72) → [PR #85](https://github.com/VelaPayments/vela-payments/pull/85)
- [Issue #73](https://github.com/VelaPayments/vela-payments/issues/73) → [PR #84](https://github.com/VelaPayments/vela-payments/pull/84)
- [Issue #74](https://github.com/VelaPayments/vela-payments/issues/74) → [PR #83](https://github.com/VelaPayments/vela-payments/pull/83)
- [Issue #77](https://github.com/VelaPayments/vela-payments/issues/77) → [PR #79](https://github.com/VelaPayments/vela-payments/pull/79)
