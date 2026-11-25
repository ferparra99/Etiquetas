/** denied = el usuario/navegador bloqueó la cámara (P05) · insecure = sin HTTPS · unavailable = sin cámara trasera/ocupada. */
export type CameraErrorKind = 'denied' | 'insecure' | 'unavailable';

export class CameraError extends Error {
  constructor(
    readonly kind: CameraErrorKind,
    override readonly cause?: unknown,
  ) {
    super(`Cámara no disponible: ${kind}`);
    this.name = 'CameraError';
  }
}

export function classifyCameraError(error: unknown): CameraErrorKind {
  const name = (error as { name?: string } | null)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
    return 'denied';
  }
  return 'unavailable';
}
