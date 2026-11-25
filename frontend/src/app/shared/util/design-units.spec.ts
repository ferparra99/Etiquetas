import { toRows } from './chunk';
import { designFont, designPx, fitFontSize } from './design-units';

describe('design-units', () => {
  it('px y fuente de diseño usan la escala --u', () => {
    expect(designPx(34)).toBe('calc(34 * var(--u))');
    expect(designFont(21)).toBe('max(11px, calc(21 * var(--u)))');
  });

  it('no reduce la letra si el texto cabe', () => {
    expect(fitFontSize(68, 10, 17, 30)).toBe(68);
  });

  it('reduce proporcionalmente si el texto es largo, sin bajar del mínimo', () => {
    expect(fitFontSize(68, 19, 17, 30)).toBe(60);
    expect(fitFontSize(68, 100, 17, 30)).toBe(30);
  });

  it('divide en filas completando la última con null', () => {
    expect(toRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5, null]]);
  });
});
