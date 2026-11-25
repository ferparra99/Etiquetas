import { OcrLine } from '../../domain/cable.model';

export interface OcrReading {
  readonly text: string;
  /** 0–1: promedio de la confianza de cada línea. */
  readonly confidence: number;
  readonly lines: readonly OcrLine[];
  readonly elapsedMs: number;
}

/**
 * Puerto (patrón Adapter): lo que la app necesita de un motor de OCR.
 * Hoy lo implementa `ServerLabelReader` (PaddleOCR); mañana puede ser Tesseract.js sin tocar las pantallas.
 */
export abstract class LabelReader {
  abstract read(image: Blob): Promise<OcrReading>;
}
