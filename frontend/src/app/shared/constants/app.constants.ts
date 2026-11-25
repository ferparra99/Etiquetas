/** Lienzo del mock de Figma (px). Base de la escala `--u` de styles.scss. */
export const DESIGN_WIDTH_PX = 709;

/** Reducción de la foto antes de enviarla al OCR: menos píxeles = subida y lectura más rápidas. */
export const MAX_IMAGE_SIDE_PX = 1280;
export const JPEG_QUALITY = 0.85;

/** Umbrales de confianza del OCR (JSON de diseño: alta ≥ 90 %, media 70–89 %, baja < 70 %). */
export const CONFIDENCE_THRESHOLDS = { high: 0.9, medium: 0.7 } as const;

/**
 * Vista de cámara (P01), medidas internas del mock en px de diseño:
 * caja de 641×415 menos el borde de 2 px por lado; las esquinas de enfoque están a 34 px del borde.
 */
export const CAMERA_VIEW = { innerWidth: 637, innerHeight: 411, guideInset: 34 } as const;

/** Puertos que caben en una fila de la tarjeta "Ubicación del puerto". */
export const PORTS_PER_ROW = 12;

/** Logging del frontend: se imprime en consola y se envía por lotes al backend (que lo escribe en logs/). */
export const CLIENT_LOG_ENDPOINT = '/api/client-logs';
export const LOG_FLUSH_INTERVAL_MS = 5000;
export const LOG_BATCH_SIZE = 10;
export const LOG_MODULE_NAME = 'frontend';
