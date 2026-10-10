import { Horizon } from '@stellar/stellar-sdk';

import { SecureKeyStore } from '@/lib/SecureKeyStore';
import {
  ensureUsdcTrustline,
  hasSufficientReserveForTrustline,
  hasUsdcTrustline,
  TrustlineService,
} from '../TrustlineService';

const mockLoadAccount = jest.fn();
const mockSubmitTransaction = jest.fn();
const mockSign = jest.fn();

jest.mock('@stellar/stellar-sdk', () => {
  class MockAsset {
    code: string;
    issuer?: string;
    constructor(code: string, issuer?: string) {
      this.code = code;
      this.issuer = issuer;
    }
  }

  class MockTransactionBuilder {
    addOperation() {
      return this;
    }
    setTimeout() {
      return this;
    }
    build() {
      return { sign: mockSign };
    }
  }

  return {
    Asset: MockAsset,
    BASE_FEE: '100',
    Horizon: {
      Server: jest.fn(() => ({
        loadAccount: mockLoadAccount,
        submitTransaction: mockSubmitTransaction,
      })),
    },
    Keypair: {
      fromSecret: jest.fn().mockReturnValue({ publicKey: () => 'GPUB' }),
    },
    Networks: {
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      TESTNET: 'Test SDF Network ; September 2015',
    },
    Operation: {
      changeTrust: jest.fn().mockReturnValue({}),
    },
    TransactionBuilder: MockTransactionBuilder,
  };
});

jest.mock('@/lib/SecureKeyStore', () => ({
  SecureKeyStore: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

// jest.setup.ts sets EXPO_PUBLIC_USDC_ISSUER to this value.
const USDC_ISSUER = 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66';
const PUBLIC_KEY = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXY';

describe('TrustlineService', () => {
  beforeEach(() => {
    mockLoadAccount.mockReset();
  });

  it('returns hasLine: true when the account has a matching USDC trustline', async () => {
    mockLoadAccount.mockResolvedValue({
      subentry_count: 1,
      balances: [
        { asset_type: 'native', balance: '100' },
        {
          asset_type: 'credit_alphanum4',
          asset_code: 'USDC',
          asset_issuer: USDC_ISSUER,
          balance: '50',
        },
      ],
    });

    const service = new TrustlineService();
    const result = await service.checkUsdcTrustline(PUBLIC_KEY);

    expect(result).toEqual({ hasLine: true, sufficientReserve: true });
  });

  it('returns hasLine: false when no USDC trustline entry exists', async () => {
    mockLoadAccount.mockResolvedValue({
      subentry_count: 0,
      balances: [{ asset_type: 'native', balance: '100' }],
    });

    const service = new TrustlineService();
    const result = await service.checkUsdcTrustline(PUBLIC_KEY);

    expect(result).toEqual({ hasLine: false, sufficientReserve: true });
  });

  it('returns sufficientReserve: false when native balance is below required reserve', async () => {
    mockLoadAccount.mockResolvedValue({
      subentry_count: 2,
      balances: [
        { asset_type: 'native', balance: '1.50', selling_liabilities: '0' },
        {
          asset_type: 'credit_alphanum4',
          asset_code: 'USDC',
          asset_issuer: USDC_ISSUER,
          balance: '50',
        },
      ],
    });

    const service = new TrustlineService();
    const result = await service.checkUsdcTrustline(PUBLIC_KEY);

    expect(result).toEqual({ hasLine: true, sufficientReserve: false });
  });

  it('accounts for selling_liabilities when computing sufficientReserve', async () => {
    mockLoadAccount.mockResolvedValue({
      subentry_count: 1,
      balances: [
        { asset_type: 'native', balance: '10.00', selling_liabilities: '9.00' },
        {
          asset_type: 'credit_alphanum4',
          asset_code: 'USDC',
          asset_issuer: USDC_ISSUER,
          balance: '50',
        },
      ],
    });

    const service = new TrustlineService();
    const result = await service.checkUsdcTrustline(PUBLIC_KEY);

    expect(result).toEqual({ hasLine: true, sufficientReserve: false });
  });

  it('returns false when the account has no balance entries', async () => {
    mockLoadAccount.mockResolvedValue({ balances: [] });

    const service = new TrustlineService();
    const result = await service.checkUsdcTrustline(PUBLIC_KEY);

    expect(result.hasLine).toBe(false);
  });

  it('returns hasLine: false when the account cannot be found', async () => {
    mockLoadAccount.mockRejectedValue(new Error('Not Found'));

    const service = new TrustlineService();
    const result = await service.checkUsdcTrustline(PUBLIC_KEY);

    expect(result).toEqual({ hasLine: false, sufficientReserve: false });
  });
});

describe('hasUsdcTrustline', () => {
  it('returns true when a matching USDC trustline exists', () => {
    const result = hasUsdcTrustline({
      balances: [
        { asset_type: 'credit_alphanum4', asset_code: 'USDC', asset_issuer: USDC_ISSUER } as never,
      ],
    });
    expect(result).toBe(true);
  });

  it('returns false when no USDC trustline is present', () => {
    const result = hasUsdcTrustline({ balances: [{ asset_type: 'native' } as never] });
    expect(result).toBe(false);
  });
});

describe('hasSufficientReserveForTrustline', () => {
  it('allows a trustline when the balance comfortably covers the new reserve', () => {
    expect(hasSufficientReserveForTrustline(10, 0)).toBe(true);
  });

  it('rejects a trustline when the balance sits at the base reserve floor', () => {
    expect(hasSufficientReserveForTrustline(1, 0)).toBe(false);
  });

  it('accounts for existing subentries when computing the required reserve', () => {
    expect(hasSufficientReserveForTrustline(3.005, 3)).toBe(false);
    expect(hasSufficientReserveForTrustline(3.02, 3)).toBe(true);
  });
});

describe('ensureUsdcTrustline', () => {
  beforeEach(() => {
    mockLoadAccount.mockReset();
    mockSubmitTransaction.mockReset();
    mockSign.mockReset();
    (SecureKeyStore.get as jest.Mock).mockReset();
  });

  it('is idempotent when a trustline already exists', async () => {
    mockLoadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'credit_alphanum4', asset_code: 'USDC', asset_issuer: USDC_ISSUER }],
      subentry_count: 1,
    });

    const result = await ensureUsdcTrustline('GPUB');

    expect(result).toEqual({ status: 'already_trusted' });
    expect(mockSubmitTransaction).not.toHaveBeenCalled();
  });

  it('returns a safe error when account lookup fails', async () => {
    mockLoadAccount.mockRejectedValueOnce(new Error('private Horizon details'));

    const result = await ensureUsdcTrustline('GPUB');

    expect(result.status).toBe('error');
    expect(result.message).toBeTruthy();
    expect(result.message).not.toContain('private Horizon details');
  });

  it('surfaces a user-safe error when the reserve is insufficient, without touching the secret key', async () => {
    mockLoadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '1.0000000' }],
      subentry_count: 0,
    });

    const result = await ensureUsdcTrustline('GPUB');

    expect(result.status).toBe('insufficient_reserve');
    expect(result.message).toBeTruthy();
    expect(SecureKeyStore.get).not.toHaveBeenCalled();
  });

  it('creates the trustline when funds are sufficient', async () => {
    mockLoadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '10.0000000' }],
      subentry_count: 0,
    });
    (SecureKeyStore.get as jest.Mock).mockResolvedValueOnce('SFAKESECRET');
    mockSubmitTransaction.mockResolvedValueOnce({});

    const result = await ensureUsdcTrustline('GPUB');

    expect(result).toEqual({ status: 'created' });
    expect(mockSign).toHaveBeenCalled();
    expect(mockSubmitTransaction).toHaveBeenCalled();
  });

  it('returns a user-safe error when no secret key is stored on this device', async () => {
    mockLoadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '10.0000000' }],
      subentry_count: 0,
    });
    (SecureKeyStore.get as jest.Mock).mockResolvedValueOnce(null);

    const result = await ensureUsdcTrustline('GPUB');

    expect(result.status).toBe('error');
    expect(mockSubmitTransaction).not.toHaveBeenCalled();
  });

  it('returns a user-safe error when submission fails', async () => {
    mockLoadAccount.mockResolvedValueOnce({
      balances: [{ asset_type: 'native', balance: '10.0000000' }],
      subentry_count: 0,
    });
    (SecureKeyStore.get as jest.Mock).mockResolvedValueOnce('SFAKESECRET');
    mockSubmitTransaction.mockRejectedValueOnce(new Error('tx_failed'));

    const result = await ensureUsdcTrustline('GPUB');

    expect(result.status).toBe('error');
  });
});
