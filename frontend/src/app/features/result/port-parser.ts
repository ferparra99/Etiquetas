/**
 * Extrae el número de puerto de un texto como "Puerto 7", "Port 12" o "P08".
 * Devuelve `null` si el texto no habla de un puerto (p. ej. "Wallbox 3"): entonces no se dibuja la rejilla.
 */
export function parsePortNumber(detail: string | null | undefined): number | null {
  const match = /(?:puerto|port|\bp)\s*#?\s*(\d{1,3})\b/i.exec(detail ?? '');
  if (!match) {
    return null;
  }
  const port = Number(match[1]);
  return port > 0 ? port : null;
}
