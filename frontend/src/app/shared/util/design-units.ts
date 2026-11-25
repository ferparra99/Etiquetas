/** Equivalentes en TypeScript de px()/fs() de styles/_functions.scss, para estilos dinámicos. */
export const designPx = (n: number): string => `calc(${n} * var(--u))`;
export const designFont = (n: number): string => `max(11px, calc(${n} * var(--u)))`;

/**
 * Reduce el tamaño de letra cuando el texto es más largo de lo que cabe, para que un código
 * largo (p. ej. BB.RK-RK.0801.12.07) no se salga de su caja. `fitChars` = caracteres que caben a tamaño base.
 */
export function fitFontSize(base: number, length: number, fitChars: number, min: number): number {
  if (length <= fitChars) {
    return base;
  }
  return Math.max(min, Math.floor((base * fitChars) / length));
}
