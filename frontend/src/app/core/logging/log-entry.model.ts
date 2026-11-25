export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly module: string;
  readonly feature: string;
  readonly message: string;
}

/** Mismo formato que el backend: `fecha | nivel | módulo | funcionalidad | mensaje`. */
export function formatLogLine(entry: LogEntry): string {
  return `${entry.timestamp} | ${entry.level.padEnd(5)} | ${entry.module} | ${entry.feature} | ${entry.message}`;
}

/** Fecha local `AAAA-MM-DD HH:mm:ss` (igual que el patrón de Logback del backend). */
export function formatTimestamp(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
