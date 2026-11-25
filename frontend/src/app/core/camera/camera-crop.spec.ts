import { guideRect, guideToVideoRect } from './camera-crop';

describe('camera-crop', () => {
  it('la zona guía deja el margen de las esquinas a cada lado', () => {
    const rect = guideRect({ width: 637, height: 411 }, { width: 637, height: 411 }, 34);
    expect(rect).toEqual({ x: 34, y: 34, width: 569, height: 343 });
  });

  it('la zona guía escala con el tamaño real mostrado', () => {
    const rect = guideRect({ width: 318.5, height: 205.5 }, { width: 637, height: 411 }, 34);
    expect(rect.x).toBeCloseTo(17);
    expect(rect.width).toBeCloseTo(284.5);
  });

  it('video con la misma proporción que la caja: sin recorte, solo escala', () => {
    const rect = guideToVideoRect({ width: 1274, height: 822 }, { width: 637, height: 411 }, { x: 34, y: 34, width: 100, height: 100 });
    expect(rect.x).toBeCloseTo(68);
    expect(rect.width).toBeCloseTo(200);
  });

  it('video más ancho que la caja (object-fit: cover): descuenta el sobrante lateral centrado', () => {
    // video 1600×800 en caja 400×400 → escala 0.5, se muestran 800 px de ancho, sobran 200 por lado
    const rect = guideToVideoRect({ width: 1600, height: 800 }, { width: 400, height: 400 }, { x: 0, y: 0, width: 400, height: 400 });
    expect(rect).toEqual({ x: 400, y: 0, width: 800, height: 800 });
  });
});
