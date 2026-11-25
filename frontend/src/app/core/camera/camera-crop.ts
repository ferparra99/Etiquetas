export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Traduce la zona guía (en píxeles de la caja visible) a coordenadas del fotograma de video.
 * El video se muestra con `object-fit: cover`: se escala hasta cubrir la caja y se recorta el sobrante centrado.
 */
export function guideToVideoRect(video: Size, box: Size, guide: Rect): Rect {
  const scale = Math.max(box.width / video.width, box.height / video.height);
  const offsetX = (video.width * scale - box.width) / 2;
  const offsetY = (video.height * scale - box.height) / 2;
  return {
    x: (guide.x + offsetX) / scale,
    y: (guide.y + offsetY) / scale,
    width: guide.width / scale,
    height: guide.height / scale,
  };
}

/** Zona guía = la caja menos `inset` por lado, en proporción al tamaño real mostrado. */
export function guideRect(box: Size, inner: Size, inset: number): Rect {
  const insetX = (inset / inner.width) * box.width;
  const insetY = (inset / inner.height) * box.height;
  return {
    x: insetX,
    y: insetY,
    width: box.width - 2 * insetX,
    height: box.height - 2 * insetY,
  };
}
