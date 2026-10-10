import { NfcErrorMessages, getNfcErrorMessage } from './nfcErrors';
import type { NfcErrorCode } from './NfcService.types';

describe('nfcErrors', () => {
  const ALL_CODES: NfcErrorCode[] = [
    'UNSUPPORTED',
    'DISABLED',
    'SESSION_ACTIVE',
    'SESSION_CANCELLED',
    'SESSION_TIMEOUT',
    'EMPTY_NDEF',
    'PAYLOAD_MALFORMED',
    'PAYLOAD_OVERSIZE',
    'PAYLOAD_INVALID',
    'PAYLOAD_EXPIRED',
    'NATIVE_ERROR',
  ];

  it('provides a descriptive Spanish message for every defined NfcErrorCode', () => {
    for (const code of ALL_CODES) {
      const message = NfcErrorMessages[code];
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    }
  });

  it('retrieves the message via getNfcErrorMessage helper', () => {
    expect(getNfcErrorMessage('UNSUPPORTED')).toBe('NFC no es compatible en este dispositivo.');
    expect(getNfcErrorMessage('DISABLED')).toBe(
      'NFC está deshabilitado. Activa NFC en ajustes para continuar.'
    );
    expect(getNfcErrorMessage('SESSION_TIMEOUT')).toBe(
      'La operación NFC expiró. Acerca los dispositivos y vuelve a intentar.'
    );
    expect(getNfcErrorMessage('SESSION_CANCELLED')).toBe('Operación NFC cancelada.');
    expect(getNfcErrorMessage('PAYLOAD_INVALID')).toBe(
      'Solicitud NFC inválida o insegura. No se procesó la petición.'
    );
  });

  it('falls back to default error message for unknown code', () => {
    const fallback = getNfcErrorMessage('UNKNOWN_CODE' as unknown as NfcErrorCode);
    expect(fallback).toBe('Error de NFC inesperado.');
  });
});
