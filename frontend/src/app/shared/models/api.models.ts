export interface OcrLine {
  text: string;
  score: number;
}

export interface ScanResponse {
  text: string;
  lines: OcrLine[];
  elapsedMs: number;
}

export interface Cable {
  code: string;
  cableType: string | null;
  originLocation: string;
  originDetail: string | null;
  destinationLocation: string;
  destinationDetail: string | null;
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
