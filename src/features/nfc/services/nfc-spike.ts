import { Buffer } from 'buffer';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

import { createPaymentRequest, type PaymentRequest } from '@/features/nfc/schemas/paymentRequest';
import { encodePaymentRequest } from '@/features/nfc/services/NfcPayloadCodec';
import { nfcService } from '@/features/nfc/services/nfcServiceImpl';

export type NfcSpikeResult =
  | { success: true; message: string }
  | { success: false; reason: string };

const JSON_TAG_TYPE = 'application/vnd.ding-payments.v1+json';

/** C05 spike: check NFC runtime support in dev build. */
export async function initializeNfcSpike(): Promise<{ supported: boolean; details: string }> {
  const supported = await NfcManager.isSupported();
  return {
    supported,
    details: supported
      ? 'NFC is supported in this runtime. Use a dev-client build with native NFC permission configured.'
      : 'NFC is not supported in this runtime. Ensure the runtime is a native dev-client with NFC support.',
  };
}

/** C05 spike: write canonical PaymentRequest payload via NfcPayloadCodec on `/c05`. */
export async function writeNdefPaymentRequest(request: PaymentRequest): Promise<NfcSpikeResult> {
  try {
    await NfcManager.start();
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const bytes = encodePaymentRequest(request);
    const record = Ndef.record(Ndef.TNF_MIME_MEDIA, JSON_TAG_TYPE, [], Array.from(bytes));
    const ndefBytes = Ndef.encodeMessage([record]);
    await NfcManager.ndefHandler.writeNdefMessage(ndefBytes);
    await NfcManager.cancelTechnologyRequest();

    return { success: true, message: `Wrote ${bytes.byteLength} bytes payload` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'NFC write failed.';
    return { success: false, reason: message };
  }
}

/** C05 spike: write raw JSON or PaymentRequest NDEF payload for PoC roundtrip on `/c05`. */
export async function writeNdefJsonPayload(
  payload: PaymentRequest | Record<string, unknown>
): Promise<NfcSpikeResult> {
  try {
    await NfcManager.start();
    await NfcManager.requestTechnology(NfcTech.Ndef);

    let bytes: Uint8Array;
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'recipient' in payload &&
      'asset' in payload &&
      'amount' in payload
    ) {
      bytes = encodePaymentRequest(payload as PaymentRequest);
    } else {
      bytes = new TextEncoder().encode(JSON.stringify(payload));
    }

    const record = Ndef.record(Ndef.TNF_MIME_MEDIA, JSON_TAG_TYPE, [], Array.from(bytes));
    const ndefBytes = Ndef.encodeMessage([record]);
    await NfcManager.ndefHandler.writeNdefMessage(ndefBytes);
    await NfcManager.cancelTechnologyRequest();

    return { success: true, message: `Wrote ${bytes.byteLength} bytes payload` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'NFC write failed.';
    return { success: false, reason: message };
  }
}

/** C05 spike: read raw JSON NDEF payload for PoC roundtrip on `/c05`. */
export async function readNdefJsonPayload(): Promise<NfcSpikeResult> {
  try {
    await NfcManager.start();
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();
    await NfcManager.cancelTechnologyRequest();

    const ndefMessage = tag?.ndefMessage;
    if (!ndefMessage?.length) {
      return { success: false, reason: 'No NDEF message found on tag.' };
    }

    const record = ndefMessage[0];
    const text = Buffer.from(record.payload).toString('utf8');
    JSON.parse(text);

    return { success: true, message: `Read JSON payload (${text.length} bytes)` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'NFC read failed.';
    return { success: false, reason: message };
  }
}

/** C10 helper: check support via NfcService abstraction. */
export async function nfcSpikeCheckSupport(): Promise<{ supported: boolean; enabled: boolean }> {
  const supported = await nfcService.isSupported();
  const enabled = supported ? await nfcService.isEnabled() : false;
  return { supported, enabled };
}

export function nfcSpikeSamplePayload(recipient: string) {
  return createPaymentRequest({
    recipient,
    asset: 'USDC',
    amount: '1.00',
    ttlSeconds: 60,
  });
}

/** C10 helper: broadcast sample payment request via writer session. */
export async function nfcSpikeWriteSample(recipient: string): Promise<void> {
  const request = nfcSpikeSamplePayload(recipient);
  const bytes = encodePaymentRequest(request);

  await nfcService.startWriterSession(bytes, {
    alertMessage: 'NFC spike: ready to broadcast sample payment request',
  });
}

export async function nfcSpikeCancel(): Promise<void> {
  await nfcService.cancelSession();
}
