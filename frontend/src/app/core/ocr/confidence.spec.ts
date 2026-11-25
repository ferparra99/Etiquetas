import { averageConfidence, confidenceLevel, toPercent } from './confidence';

describe('confidence', () => {
  it('promedia la confianza de las líneas', () => {
    expect(averageConfidence([{ text: 'A', score: 1 }, { text: 'B', score: 0.5 }])).toBeCloseTo(0.75);
  });

  it('sin líneas la confianza es 0', () => {
    expect(averageConfidence([])).toBe(0);
  });

  it('clasifica con los umbrales del diseño (≥90 alta, 70–89 media, <70 baja)', () => {
    expect(confidenceLevel(0.98)).toBe('high');
    expect(confidenceLevel(0.9)).toBe('high');
    expect(confidenceLevel(0.89)).toBe('medium');
    expect(confidenceLevel(0.7)).toBe('medium');
    expect(confidenceLevel(0.69)).toBe('low');
  });

  it('convierte a porcentaje entero', () => {
    expect(toPercent(0.984)).toBe(98);
  });
});
