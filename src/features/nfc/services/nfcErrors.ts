import type { NfcErrorCode } from './NfcService.types';

export const NfcErrorMessages: Record<NfcErrorCode, string> = {
  UNSUPPORTED: 'NFC no es compatible en este dispositivo.',
  DISABLED: 'NFC está deshabilitado. Activa NFC en ajustes para continuar.',
  SESSION_ACTIVE: 'Ya hay una sesión NFC activa.',
  SESSION_CANCELLED: 'Operación NFC cancelada.',
  SESSION_TIMEOUT: 'La operación NFC expiró. Acerca los dispositivos y vuelve a intentar.',
  EMPTY_NDEF: 'La etiqueta NFC está vacía.',
  PAYLOAD_INVALID: 'Solicitud NFC inválida o insegura. No se procesó la petición.',
  PAYLOAD_EXPIRED: 'La solicitud de pago ha expirado.',
  PAYLOAD_MALFORMED: 'Formato de carga útil inválido.',
  PAYLOAD_OVERSIZE: 'El tamaño de la carga útil excede el límite permitido.',
  NATIVE_ERROR: 'La sesión NFC fue interrumpida por el sistema.',
};

export function getNfcErrorMessage(code: NfcErrorCode): string {
  return NfcErrorMessages[code] ?? 'Error de NFC inesperado.';
}
