/**
 * Cable del inventario tal como lo devuelve el backend.
 * Los campos opcionales son los que el diseño muestra pero la base de datos aún no tiene
 * (medio, etc.): si no llegan, la pantalla no los muestra.
 */
export interface Cable {
  code: string;
  cableType: string | null;
  originLocation: string;
  originDetail: string | null;
  destinationLocation: string;
  destinationDetail: string | null;
  medium?: string | null;
}

export interface CableCandidate {
  cable: Cable;
  similarity: number;
}

export interface CableSearchResponse {
  query: string;
  normalizedQuery: string;
  exact: Cable | null;
  candidates: CableCandidate[];
}

export interface OcrLine {
  text: string;
  score: number;
}

export interface ScanResponse {
  text: string;
  lines: OcrLine[];
  elapsedMs: number;
}
