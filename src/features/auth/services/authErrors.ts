/**
 * CLI-021 — Auth error mapping
 *
 * Maps native passkey error codes to user-safe AuthErrorCode values
 * with English-language messages. Never expose raw stack traces or
 * sensitive platform internals to the UI layer.
 *
 * Policy:
 * - All user-facing message strings are in English.
 * - No private keys, seeds, or raw error details leak through.
 * - Errors are sanitized before toast or analytics emission.
 */

// ─── Error codes ────────────────────────────────────────────────────────────

export const AuthErrorCode = {
  /** User dismissed the biometric/passkey dialog */
  USER_CANCELLED: 'USER_CANCELLED',
  /** Device does not support passkeys */
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  /** Too many failed attempts — device-level lockout */
  LOCKOUT: 'LOCKOUT',
  /** No passkey credential found on device */
  NO_CREDENTIAL: 'NO_CREDENTIAL',
  /** Passkey already registered for this account */
  CREDENTIAL_EXISTS: 'CREDENTIAL_EXISTS',
  /** Challenge or request format was invalid */
  INVALID_REQUEST: 'INVALID_REQUEST',
  /** Network or timeout error during the request */
  TIMEOUT: 'TIMEOUT',
  /** Auth flow was interrupted (e.g. app went to background) */
  INTERRUPTED: 'INTERRUPTED',
  /** Secure store access denied or unavailable */
  STORE_ERROR: 'STORE_ERROR',
  /** Catch-all for unexpected native failures */
  UNKNOWN: 'UNKNOWN',
} as const;

export type AuthErrorCodeValue = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

// ─── Typed auth error ────────────────────────────────────────────────────────

export interface AuthError {
  code: AuthErrorCodeValue;
  /** User-safe English message — safe to show in toasts/UI */
  message: string;
  /** Original error for internal logging only — never expose to UI */
  cause?: unknown;
}

// ─── User-safe English messages ──────────────────────────────────────────────

const AUTH_ERROR_MESSAGES: Record<AuthErrorCodeValue, string> = {
  USER_CANCELLED: 'Verification cancelled. Try again when you are ready.',
  NOT_SUPPORTED: 'Passkeys are unavailable on this device. Use the Vela app on a supported device.',
  LOCKOUT: 'Too many unsuccessful attempts. Wait a moment before trying again.',
  NO_CREDENTIAL: 'No passkey was found. Create a passkey first.',
  CREDENTIAL_EXISTS: 'A passkey is already registered for this account.',
  INVALID_REQUEST: 'Unable to start verification. Contact support if the problem continues.',
  TIMEOUT: 'Verification timed out. Check your connection and try again.',
  INTERRUPTED: 'Verification was interrupted. Please try again.',
  STORE_ERROR: 'Unable to access secure storage. Check your device verification permissions.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

// ─── Native error-code → AuthErrorCode mapping ──────────────────────────────
// Matches error strings from react-native-passkey PasskeyError constants.

const NATIVE_ERROR_MAP: Record<string, AuthErrorCodeValue> = {
  UserCancelled: AuthErrorCode.USER_CANCELLED,
  UserCancelledError: AuthErrorCode.USER_CANCELLED,
  NotSupported: AuthErrorCode.NOT_SUPPORTED,
  NotSupportedError: AuthErrorCode.NOT_SUPPORTED,
  NoCredentials: AuthErrorCode.NO_CREDENTIAL,
  NoCredentialsError: AuthErrorCode.NO_CREDENTIAL,
  CredentialAlreadyExists: AuthErrorCode.CREDENTIAL_EXISTS,
  CredentialAlreadyExistsError: AuthErrorCode.CREDENTIAL_EXISTS,
  InvalidChallenge: AuthErrorCode.INVALID_REQUEST,
  InvalidChallengeError: AuthErrorCode.INVALID_REQUEST,
  InvalidUserId: AuthErrorCode.INVALID_REQUEST,
  InvalidUserIdError: AuthErrorCode.INVALID_REQUEST,
  BadConfiguration: AuthErrorCode.INVALID_REQUEST,
  RequestFailed: AuthErrorCode.UNKNOWN,
  RequestFailedError: AuthErrorCode.UNKNOWN,
  Interrupted: AuthErrorCode.INTERRUPTED,
  InterruptedError: AuthErrorCode.INTERRUPTED,
  Timeout: AuthErrorCode.TIMEOUT,
  TimeoutError: AuthErrorCode.TIMEOUT,
};

// ─── Factory helpers ─────────────────────────────────────────────────────────

/**
 * Creates a typed AuthError with user-safe English message.
 */
export function createAuthError(code: AuthErrorCodeValue, cause?: unknown): AuthError {
  return {
    code,
    message: AUTH_ERROR_MESSAGES[code],
    cause,
  };
}

/**
 * Maps a native passkey library error to a typed AuthError.
 * The native error object contains `error` (string code) and `message` fields.
 */
export function mapNativePasskeyError(nativeError: unknown): AuthError {
  if (
    nativeError !== null &&
    typeof nativeError === 'object' &&
    'error' in nativeError &&
    typeof (nativeError as { error: unknown }).error === 'string'
  ) {
    const nativeCode = (nativeError as { error: string }).error;
    const mapped = NATIVE_ERROR_MAP[nativeCode];
    if (mapped) {
      return createAuthError(mapped, nativeError);
    }
  }
  return createAuthError(AuthErrorCode.UNKNOWN, nativeError);
}

/**
 * Sanitizes an AuthError for safe logging/analytics.
 * Strips `cause` so no raw native errors are emitted externally.
 */
export function sanitizeAuthError(err: AuthError): {
  code: AuthErrorCodeValue;
  message: string;
} {
  return { code: err.code, message: err.message };
}
