import { Horizon } from '@stellar/stellar-sdk';

import { AccountService } from './AccountService';
import { ensureStellarPolyfills } from './stellarPolyfills';

export type StellarSpikeResult =
  | { success: true; publicKey: string; accountData: unknown }
  | { success: false; reason: string };

export async function runStellarSpike(
  horizonUrl = 'https://horizon-testnet.stellar.org'
): Promise<StellarSpikeResult> {
  try {
    ensureStellarPolyfills();

    const { publicKey } = await AccountService.getOrCreateKeypair();

    const server = new Horizon.Server(horizonUrl);
    const accountData = await server.loadAccount(publicKey);

    return {
      success: true,
      publicKey,
      accountData,
    };
  } catch (error: unknown) {
    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown Stellar spike error.',
    };
  }
}
