import { runStellarSpike } from '@/features/wallet/services/stellar-spike';
import { AccountService } from '@/features/wallet/services/AccountService';

const mockLoadAccount = jest.fn();

jest.mock('@stellar/stellar-sdk', () => ({
  Horizon: {
    Server: jest.fn().mockImplementation(() => ({
      loadAccount: mockLoadAccount,
    })),
  },
}));

jest.mock('@/features/wallet/services/AccountService', () => ({
  AccountService: {
    getOrCreateKeypair: jest.fn(),
  },
}));

describe('runStellarSpike', () => {
  const TEST_PUBKEY = 'GBBD47IF6LWK7P7MUGHC2XLYUUXV6ZLW75PN7CHLIW2NSIW74UZEST66';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns publicKey and accountData without exposing secretKey', async () => {
    (AccountService.getOrCreateKeypair as jest.Mock).mockResolvedValue({
      publicKey: TEST_PUBKEY,
      isNew: false,
    });
    mockLoadAccount.mockResolvedValue({ id: TEST_PUBKEY, balances: [] });

    const result = await runStellarSpike();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.publicKey).toBe(TEST_PUBKEY);
      expect(result.accountData).toEqual({ id: TEST_PUBKEY, balances: [] });
      expect((result as any).secretKey).toBeUndefined();
    }
  });

  it('handles loadAccount errors gracefully without exposing sensitive material', async () => {
    (AccountService.getOrCreateKeypair as jest.Mock).mockResolvedValue({
      publicKey: TEST_PUBKEY,
      isNew: false,
    });
    mockLoadAccount.mockRejectedValue(new Error('Network error'));

    const result = await runStellarSpike();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('Network error');
      expect((result as any).secretKey).toBeUndefined();
    }
  });
});
