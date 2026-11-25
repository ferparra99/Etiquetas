import { Injectable } from '@angular/core';
import {
  CLIENT_LOG_ENDPOINT,
  LOG_BATCH_SIZE,
  LOG_FLUSH_INTERVAL_MS,
  LOG_MODULE_NAME,
} from '../../shared/constants/app.constants';
import { formatLogLine, formatTimestamp, LogEntry, LogLevel } from './log-entry.model';

/**
 * Registro por funcionalidad. Cada evento:
 *  1. se imprime en la consola del navegador, y
 *  2. se envía por lotes a `POST /api/client-logs`, que lo escribe en `backend/logs/etiquetas-AAAA-MM-DD.log`.
 * Un navegador no puede escribir archivos; por eso el archivo lo escribe el backend.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private static current?: LoggerService;

  /** Acceso para el decorador `@LogFeature`, que vive fuera del contenedor de DI. */
  static get instance(): LoggerService | undefined {
    return LoggerService.current;
  }

  private queue: LogEntry[] = [];

  constructor() {
    LoggerService.current = this;
    if (typeof window !== 'undefined') {
      window.setInterval(() => this.flush(), LOG_FLUSH_INTERVAL_MS);
      window.addEventListener('pagehide', () => this.flush());
    }
  }

  info(feature: string, message: string): void {
    this.write('INFO', feature, message);
  }

  warn(feature: string, message: string): void {
    this.write('WARN', feature, message);
  }

  error(feature: string, message: string): void {
    this.write('ERROR', feature, message);
  }

  /** Envía lo pendiente. Nunca lanza: un fallo de log no debe romper la app. */
  flush(): void {
    if (this.queue.length === 0) {
      return;
    }
    const batch = this.queue;
    this.queue = [];
    try {
      const body = JSON.stringify({ entries: batch });
      const sent = navigator.sendBeacon?.(CLIENT_LOG_ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (!sent) {
        void fetch(CLIENT_LOG_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => undefined);
      }
    } catch {
      // se descarta el lote: el log local en consola ya quedó impreso
    }
  }

  private write(level: LogLevel, feature: string, message: string): void {
    const entry: LogEntry = {
      timestamp: formatTimestamp(new Date()),
      level,
      module: LOG_MODULE_NAME,
      feature,
      message,
    };
    const line = formatLogLine(entry);
    if (level === 'ERROR') {
      console.error(line);
    } else if (level === 'WARN') {
      console.warn(line);
    } else {
      console.info(line);
    }
    this.queue.push(entry);
    if (this.queue.length >= LOG_BATCH_SIZE) {
      this.flush();
    }
  }
}
