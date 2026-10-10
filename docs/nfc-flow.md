# NFC flow and troubleshooting

## Payment request wire format

The NFC codec writes the shared `payment-request` version 1 contract used by
the server with wire `type: "payment-request"`. Its wire timestamps are ISO 8601 UTC strings; the app's internal
`PaymentRequest` object uses Unix seconds (including fractional seconds to preserve wire milliseconds) and supports `payment-request` canonically while allowing `payment_request` for backwards compatibility. The codec converts
between these representations at the NFC boundary. The matching fixture is
`src/features/nfc/fixtures/payment-request.v1.json` and is checked by the
server contract tests as well.

This document describes the NFC handshake, security constraints, and common troubleshooting steps for developers and beta testers.

### Overview

- **Roles:** Writer (receiver/merchant) and Reader (payer).
- **Format:** `payment-request.v1` JSON wire payload carrying non-sensitive fields only.

### Handshake

1. **Receiver (Writer):** `ReceiveListeningView` calls `useReceivePayment` → `useNfcWriter().startWriting()` → `startWriterSession(request)`. The request is serialized via `encodePaymentRequest` and broadcast over NDEF push.
2. **Payer (Reader):** `useNfcReader().startReading()` initiates `startReaderSession()`. When a tag or peer device is tapped, the raw bytes are dispatched.
3. **Payload Decoding & Validation:** On receive, `decodePaymentRequest(payload, { rejectExpired: true })` validates JSON structure, version, and schema constraints, enforces the 5-minute clock skew window, and converts ISO-8601 timestamps back to Unix seconds.
4. **Delivery & Confirmation:** The reader session dispatches the validated `PaymentRequest` to the payment confirmation screen. The internal `delivered` latch prevents duplicate delivery, and errors are surfaced as sanitized `NfcError` codes.

### Security rules

- **Forbidden fields:** `assertNoSecrets` rejects any payload containing `secret`, `private`, `seed`, `token`, `passphrase`, `password`, `privKey`, or `keyPair`.
- **Replay & Lifetime protection:** Payloads enforce a maximum 24-hour request lifetime, a 5-minute clock window (`Math.abs(timestamp * 1000 - nowMs) <= 5 min`), and a session-level `delivered` latch. Expired or duplicate payloads fail fast.
- **Payload size:** Payloads are strictly bounded to 880 bytes (`MAX_NDEF_PAYLOAD_BYTES`).

### Platform notes

- **iOS:** Core NFC requires entitlement `com.apple.developer.nfc.readersession.formats` and `NFCReaderUsageDescription` in Info.plist. Only physical devices supported.
- **Android:** Add `android.permission.NFC` and handle foreground dispatch. Test on physical Pixel and Samsung devices.

### Troubleshooting and Error Codes

The app surfaces typed `NfcError` instances with standardized `NfcErrorCode` values:

- `UNSUPPORTED`: Hardware lacks NFC capability or runtime does not support native NFC (e.g., web or simulator). Verify device specifications and dev-client build.
- `DISABLED`: NFC is disabled in device system settings. Prompt the user to enable NFC in system settings.
- `SESSION_ACTIVE`: Another NFC session is already in progress. Wait for the active session to finish or cancel before starting a new one.
- `SESSION_CANCELLED`: Session was explicitly cancelled by the user or navigation change before a tag was read.
- `SESSION_TIMEOUT`: Physical tap was not detected within the timeout window (45s for reader, 60s for writer). Prompt users to bring devices closer and align NFC antennas.
- `EMPTY_NDEF`: NFC tag contains no NDEF records or payload is empty.
- `PAYLOAD_MALFORMED`: NFC payload is not valid JSON or lacks mandatory wire fields.
- `PAYLOAD_OVERSIZE`: Payload exceeds the 880-byte `MAX_NDEF_PAYLOAD_BYTES` limit.
- `PAYLOAD_INVALID`: Payload violates schema rules (invalid Stellar public key, unsupported asset, non-positive amount).
- `PAYLOAD_EXPIRED`: Request timestamp expired or is outside the allowable 5-minute timestamp clock skew.
- `NATIVE_ERROR`: Underlying platform NFC driver reported a hardware or transport error.

## Validation and compatibility

Fresh native NFC reads enforce the shared five-minute timestamp clock window and the maximum 24-hour request lifetime. Amounts reject leading zeros and nonfinite values. UTC dates must represent a real calendar date, and supported optional fields retain their contract limits. Encoding validates a request before serializing it.

The decoder also accepts the previous internal request format for existing tags. Decoding without `rejectExpired` is for structural/archival inspection; live reads use `rejectExpired: true`. Milliseconds from version 1 timestamps are preserved through decode/encode. NFC MIME and app scheme identifiers remain unchanged.
