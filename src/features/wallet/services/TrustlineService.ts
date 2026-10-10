/**
 * USDC trustline checks (CLI-070).
 *
 * The receive flow must confirm the receiver already has a USDC trustline
 * before broadcasting a USDC payment request over NFC — a payer cannot send
 * an asset the receiver has no line for.
 *
 * @see docs/receive-flow.md — error matrix (trustline_missing)
 */
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

import { env } from '@/lib/env';
import { SecureKeyStore } from '@/lib/SecureKeyStore';
import { SECURE_KEYS } from '@/lib/SecureKeyStore.types';

type TrustlineAccount = Pick<Horizon.AccountResponse, 'balances'>;

export function hasUsdcTrustline(account: TrustlineAccount): boolean {
  return account.balances.some(
    (balance) =>
      'asset_code' in balance &&
      balance.asset_code === 'USDC' &&
      'asset_issuer' in balance &&
      balance.asset_issuer === env.usdcIssuer
  );
}

// Include a small fee cushion above Stellar's 0.5 XLM base reserve.
export function hasSufficientReserveForTrustline(
  availableXlm: number,
  subentryCount: number,
  sponsoring = 0,
  sponsored = 0
): boolean {
  const requiredXlm = (2 + subentryCount + sponsoring - sponsored + 1) * 0.5 + 0.01;
  return Number.isFinite(availableXlm) && availableXlm >= requiredXlm;
}

export interface EnsureTrustlineResult {
  status: 'already_trusted' | 'created' | 'insufficient_reserve' | 'error';
  message?: string;
}

export async function ensureUsdcTrustline(publicKey: string): Promise<EnsureTrustlineResult> {
  try {
    const server = new Horizon.Server(env.horizonUrl);
    const account = await server.loadAccount(publicKey);
    if (hasUsdcTrustline(account)) return { status: 'already_trusted' };
    const sponsorship = account as Horizon.AccountResponse & {
      num_sponsoring?: number;
      num_sponsored?: number;
    };

    const native = account.balances.find((balance) => balance.asset_type === 'native');
    const availableXlm = native
      ? Number(native.balance) - Number(native.selling_liabilities ?? 0)
      : 0;
    if (
      !hasSufficientReserveForTrustline(
        availableXlm,
        account.subentry_count,
        sponsorship.num_sponsoring ?? 0,
        sponsorship.num_sponsored ?? 0
      )
    ) {
      return {
        status: 'insufficient_reserve',
        message: 'Add XLM to cover the USDC trustline reserve.',
      };
    }

    const secret = await SecureKeyStore.get(SECURE_KEYS.WALLET_STELLAR_SECRET_KEY);
    if (!secret)
      return { status: 'error', message: 'The wallet key is unavailable on this device.' };
    const keypair = Keypair.fromSecret(secret);
    if (keypair.publicKey() !== publicKey) {
      return { status: 'error', message: 'The stored key does not match this wallet.' };
    }
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: env.networkPassphrase,
    })
      .addOperation(Operation.changeTrust({ asset: new Asset('USDC', env.usdcIssuer) }))
      .setTimeout(30)
      .build();
    transaction.sign(keypair);
    await server.submitTransaction(transaction);
    return { status: 'created' };
  } catch {
    return { status: 'error', message: 'Unable to set up USDC. Please try again.' };
  }
}

export interface TrustlineCheckResult {
  hasLine: boolean;
  sufficientReserve: boolean;
}

export class TrustlineService {
  async checkUsdcTrustline(publicKey: string): Promise<TrustlineCheckResult> {
    try {
      const server = new Horizon.Server(env.horizonUrl);
      const account = await server.loadAccount(publicKey);

      const hasLine = hasUsdcTrustline(account);
      const sponsorship = account as Horizon.AccountResponse & {
        num_sponsoring?: number;
        num_sponsored?: number;
      };

      const native = account.balances.find((balance) => balance.asset_type === 'native');
      const availableXlm = native
        ? Number(native.balance) - Number(native.selling_liabilities ?? 0)
        : 0;

      const sufficientReserve = hasSufficientReserveForTrustline(
        availableXlm,
        account.subentry_count,
        sponsorship.num_sponsoring ?? 0,
        sponsorship.num_sponsored ?? 0
      );

      return {
        hasLine,
        sufficientReserve,
      };
    } catch {
      return { hasLine: false, sufficientReserve: false };
    }
  }
}

export const trustlineService = new TrustlineService();
