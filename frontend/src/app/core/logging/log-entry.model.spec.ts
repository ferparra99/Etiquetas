import { formatLogLine, formatTimestamp } from './log-entry.model';

describe('log-entry', () => {
  it('formatea la fecha como AAAA-MM-DD HH:mm:ss', () => {
    expect(formatTimestamp(new Date(2026, 10, 24, 9, 5, 7))).toBe('2026-11-24 09:05:07');
  });

  it('formatea la línea como fecha | nivel | módulo | funcionalidad | mensaje', () => {
    const line = formatLogLine({
      timestamp: '2026-11-24 09:05:07',
      level: 'INFO',
      module: 'frontend',
      feature: 'escanear-marquilla',
      message: 'inicio',
    });
    expect(line).toBe('2026-11-24 09:05:07 | INFO  | frontend | escanear-marquilla | inicio');
  });
});
