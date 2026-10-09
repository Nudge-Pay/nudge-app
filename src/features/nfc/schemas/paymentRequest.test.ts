import {
  createPaymentRequest,
  parsePaymentRequest,
  parsePaymentRequestFresh,
  parsePaymentRequestWire,
  validateExpiry,
} from '@/features/nfc/schemas/paymentRequest';

const VALID_RECIPIENT = 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66';

describe('paymentRequest schema', () => {
  const basePayload = {
    type: 'payment_request' as const,
    recipient: VALID_RECIPIENT,
    asset: 'USDC' as const,
    amount: '25.00',
    timestamp: 1_740_000_000,
    expiresAt: 1_740_000_030,
  };

  it('accepts a valid payment request', () => {
    expect(parsePaymentRequest(basePayload)).toEqual(basePayload);
  });

  it('accepts a valid XLM payment request', () => {
    const request = { ...basePayload, asset: 'XLM', amount: '1000' };
    expect(parsePaymentRequest(request)).toEqual(request);
  });

  it('rejects invalid Stellar public keys', () => {
    expect(() => parsePaymentRequest({ ...basePayload, recipient: 'INVALID' })).toThrow();
  });

  it('rejects unsupported assets', () => {
    expect(() => parsePaymentRequest({ ...basePayload, asset: 'BTC' })).toThrow();
  });

  it('rejects non-decimal amount strings', () => {
    expect(() => parsePaymentRequest({ ...basePayload, amount: '25,00' })).toThrow();
  });

  it('rejects expiresAt before timestamp', () => {
    expect(() =>
      parsePaymentRequest({ ...basePayload, expiresAt: basePayload.timestamp })
    ).toThrow();
  });

  it('preserves supported optional contract fields and rejects unknown ones', () => {
    const optional = {
      ...basePayload,
      memo: 'Coffee',
      requestId: 'req_123',
      metadata: { table: 7 },
    };
    expect(parsePaymentRequest(optional)).toEqual(optional);
    expect(() => parsePaymentRequest({ ...basePayload, surprise: true })).toThrow();
  });

  it('validateExpiry returns false for past requests', () => {
    const request = createPaymentRequest({
      recipient: VALID_RECIPIENT,
      asset: 'USDC',
      amount: '1.00',
      timestamp: 1,
      expiresAt: 2,
    });

    expect(validateExpiry(request, 3_000)).toBe(false);
  });

  it('parsePaymentRequestFresh rejects expired payloads', () => {
    expect(() => parsePaymentRequestFresh(basePayload, basePayload.expiresAt * 1000 + 1)).toThrow(
      /expired/i
    );
  });

  describe('paymentRequestWire schema', () => {
    const validWirePayload = {
      type: 'payment-request' as const,
      version: 1 as const,
      recipient: VALID_RECIPIENT,
      asset: 'USDC' as const,
      amount: '25.00',
      timestamp: '2026-05-29T12:00:00.000Z',
      expiresAt: '2026-05-29T12:15:00.000Z',
    };

    it('accepts a valid payment-request.v1 wire payload', () => {
      expect(parsePaymentRequestWire(validWirePayload)).toEqual(validWirePayload);
    });

    it('rejects wire payload with non-ISO timestamps or invalid version', () => {
      expect(() =>
        parsePaymentRequestWire({ ...validWirePayload, timestamp: '1740000000' })
      ).toThrow();
      expect(() => parsePaymentRequestWire({ ...validWirePayload, version: 2 as any })).toThrow();
      expect(() =>
        parsePaymentRequestWire({ ...validWirePayload, type: 'payment_request' as any })
      ).toThrow();
    });
  });
});
