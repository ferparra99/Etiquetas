import { CONFIDENCE_THRESHOLDS } from '../../shared/constants/app.constants';
import { OcrLine } from '../../domain/cable.model';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

/** Confianza global de la lectura = promedio de las líneas reconocidas (0–1). */
export function averageConfidence(lines: readonly OcrLine[]): number {
  if (lines.length === 0) {
    return 0;
  }
  return lines.reduce((sum, line) => sum + line.score, 0) / lines.length;
}

export function confidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) {
    return 'high';
  }
  return confidence >= CONFIDENCE_THRESHOLDS.medium ? 'medium' : 'low';
}

export const toPercent = (confidence: number): number => Math.round(confidence * 100);
