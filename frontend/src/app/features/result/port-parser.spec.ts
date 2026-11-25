import { parsePortNumber } from './port-parser';

describe('parsePortNumber', () => {
  it('reconoce "Puerto N", "Port N" y "PNN"', () => {
    expect(parsePortNumber('Puerto 7')).toBe(7);
    expect(parsePortNumber('Port 12')).toBe(12);
    expect(parsePortNumber('P08')).toBe(8);
    expect(parsePortNumber('puerto #3')).toBe(3);
  });

  it('ignora textos que no son un puerto', () => {
    expect(parsePortNumber('Posición 12')).toBeNull();
    expect(parsePortNumber('Wallbox 3')).toBeNull();
    expect(parsePortNumber(null)).toBeNull();
    expect(parsePortNumber('')).toBeNull();
  });
});
