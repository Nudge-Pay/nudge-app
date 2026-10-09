import { assertNoSecrets, parsePaymentRequest } from '../paymentRequest';

describe('paymentRequest security guard', () => {
  it('throws when forbidden keys present', () => {
    const bad = { id: '1', secret: 'no', amount: 10 };
    expect(() => assertNoSecrets(bad)).toThrow(/forbidden fields/);
  });

  it('allows normal payloads', () => {
    const ok = { id: '1', amount: 10, currency: 'USD' };
    expect(() => assertNoSecrets(ok)).not.toThrow();
  });

  it('rejects a payment request containing a constructor key', () => {
    const payload = {
      type: 'payment_request',
      recipient: 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66',
      asset: 'USDC',
      amount: '1.00',
      timestamp: 1_740_000_000,
      expiresAt: 1_740_000_030,
      constructor: { prototype: { compromised: true } },
    };

    expect(() => parsePaymentRequest(payload)).toThrow();
  });

  it('rejects a payload whose memo matches the Stellar secret StrKey pattern', () => {
    const secretMemoPayload = {
      type: 'payment_request',
      recipient: 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66',
      asset: 'USDC',
      amount: '1.00',
      timestamp: 1_740_000_000,
      expiresAt: 1_740_000_030,
      memo: 'SBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66',
    };

    expect(() => parsePaymentRequest(secretMemoPayload)).toThrow(/forbidden fields|secret/i);
  });

  it('rejects a payload whose metadata contains a forbidden key at any depth', () => {
    const badMetadataPayload = {
      type: 'payment_request',
      recipient: 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66',
      asset: 'USDC',
      amount: '1.00',
      timestamp: 1_740_000_000,
      expiresAt: 1_740_000_030,
      metadata: { nested: { recoveryPhrase: 'mnemonic phrase' } },
    };

    expect(() => parsePaymentRequest(badMetadataPayload)).toThrow(/forbidden fields/i);
  });

  it('allows legitimate memo and benign metadata', () => {
    const valid = {
      type: 'payment_request',
      recipient: 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66',
      asset: 'USDC',
      amount: '1.00',
      timestamp: 1_740_000_000,
      expiresAt: 1_740_000_030,
      memo: 'Coffee',
      metadata: { table: 7 },
    };

    expect(() => parsePaymentRequest(valid)).not.toThrow();
  });
});
