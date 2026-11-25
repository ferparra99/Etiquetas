import { HttpErrorResponse } from '@angular/common/http';

/** Mensaje legible para el usuario a partir de un error HTTP del backend (RFC 7807: campo `detail`). */
export function toUserMessage(error: unknown, fallback = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No hay conexión con el servidor. Revisa tu red.';
    }
    const detail = (error.error as { detail?: unknown } | null)?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
  }
  return fallback;
}
