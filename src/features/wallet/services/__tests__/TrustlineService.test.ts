import { TrustlineService } from '@/features/wallet/services/TrustlineService';

const mockLoadAccount = jest.fn();

jest.mock('@stellar/stellar-sdk', () => ({
  Networks: {
    PUBLIC: 'Public Global Stellar Network ; September 2015',
    TESTNET: 'Test SDF Network ; September 2015',
  },
  Horizon: {
    Server: jest.fn().mockImplementation(() => ({
      loadAccount: mockLoadAccount,
    })),
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
