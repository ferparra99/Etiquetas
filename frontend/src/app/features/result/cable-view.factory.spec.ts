import { TestBed } from '@angular/core/testing';
import { Cable } from '../../domain/cable.model';
import { CableViewFactory } from './cable-view.factory';

const cable = (overrides: Partial<Cable> = {}): Cable => ({
  code: 'BB.RK-RK.0801.12.07',
  cableType: 'BlackBox',
  originLocation: 'Rack #8',
  originDetail: 'Posición 12',
  destinationLocation: 'Rack #1',
  destinationDetail: 'Puerto 7',
  ...overrides,
});

describe('CableViewFactory', () => {
  let factory: CableViewFactory;

  beforeEach(() => {
    factory = TestBed.inject(CableViewFactory);
  });

  it('arma origen, destino, recorrido y ubicación del puerto con los datos de la BD', () => {
    const view = factory.create(cable());
    expect(view.code).toBe('BB.RK-RK.0801.12.07');
    expect(view.description).toBe('BlackBox');
    expect(view.origin.name).toBe('Rack #8');
    expect(view.destination.detail).toBe('Puerto 7');
    expect(view.route).toEqual([
      { label: 'Desde', value: 'Rack #8 · Posición 12' },
      { label: 'Hasta', value: 'Rack #1 · Puerto 7' },
    ]);
    expect(view.portLocation).toEqual({ equipmentName: 'RACK #1', portLabel: 'Puerto 7', portNumber: 7, totalPorts: 12 });
  });

  it('omite lo que la base de datos no tiene', () => {
    const view = factory.create(cable({ cableType: null, originDetail: '  ', destinationDetail: null }));
    expect(view.description).toBeUndefined();
    expect(view.origin.detail).toBeUndefined();
    expect(view.destination.detail).toBeUndefined();
    expect(view.portLocation).toBeUndefined();
    expect(view.route.map((r) => r.value)).toEqual(['Rack #8', 'Rack #1']);
  });

  it('agrega la fila "Medio" solo si el dato existe', () => {
    expect(factory.create(cable({ medium: 'UTP Cat 6A' })).route.at(-1)).toEqual({ label: 'Medio', value: 'UTP Cat 6A' });
    expect(factory.create(cable()).route.some((r) => r.label === 'Medio')).toBeFalse();
  });

  it('elige la ilustración según el tipo de ubicación (Strategy)', () => {
    expect(factory.create(cable()).origin.icon.name).toBe('patch-panel');
    expect(factory.create(cable({ originLocation: 'Estudio A' })).origin.icon.name).toBe('desk');
    expect(factory.create(cable({ originLocation: 'Sala 3' })).origin.icon.name).toBe('ethernet-port');
  });

  it('con puertos mayores a 12 amplía la rejilla en filas de 12', () => {
    expect(factory.create(cable({ destinationDetail: 'Puerto 18' })).portLocation?.totalPorts).toBe(24);
  });
});
