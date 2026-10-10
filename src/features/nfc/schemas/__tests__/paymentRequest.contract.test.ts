import fs from 'fs';
import path from 'path';

import { parsePaymentRequest } from '../paymentRequest';
import { decodePaymentRequest } from '@/features/nfc/services/NfcPayloadCodec';

describe('payment-request.v1.json contract test', () => {
  const fixturePath = path.resolve(__dirname, '../../fixtures/payment-request.v1.json');
  const rawContent = fs.readFileSync(fixturePath, 'utf8');
  const fixture = JSON.parse(rawContent);

  it('loads and validates payment-request.v1.json directly against canonical schema without createPaymentRequest', () => {
    expect(fixture.type).toBe('payment-request');
    expect(fixture.version).toBe(1);

    const bytes = new TextEncoder().encode(rawContent);
    const decoded = decodePaymentRequest(bytes);

    expect(decoded.type).toBe('payment_request');
    expect(decoded.recipient).toBe(fixture.recipient);
    expect(decoded.asset).toBe(fixture.asset);
    expect(decoded.amount).toBe(fixture.amount);
    expect(decoded.timestamp).toBe(Date.parse(fixture.timestamp) / 1000);
    expect(decoded.expiresAt).toBe(Date.parse(fixture.expiresAt) / 1000);

    const validated = parsePaymentRequest(decoded);
    expect(validated).toEqual(decoded);
  });

  it('fails with an error naming the field when a required field is removed', () => {
    const requiredFields = ['recipient', 'asset', 'amount', 'timestamp', 'expiresAt'] as const;

    for (const field of requiredFields) {
      const copy = { ...fixture };
      delete (copy as any)[field];

      const bytes = new TextEncoder().encode(JSON.stringify(copy));
      expect(() => decodePaymentRequest(bytes)).toThrow(new RegExp(field, 'i'));
    }
  });

  it('fails if the fixture type is not recognised by the codec', () => {
    const invalidType = { ...fixture, type: 'unknown-payment-type' };
    const bytes = new TextEncoder().encode(JSON.stringify(invalidType));

    expect(() => decodePaymentRequest(bytes)).toThrow();
  });

  it('fails if the fixture version is not recognised by the codec', () => {
    const invalidVersion = { ...fixture, version: 999 };
    const bytes = new TextEncoder().encode(JSON.stringify(invalidVersion));

    expect(() => decodePaymentRequest(bytes)).toThrow();
  });
});
