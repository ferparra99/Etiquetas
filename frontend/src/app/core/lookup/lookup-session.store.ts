import { Injectable, signal } from '@angular/core';
import { CableSearchResponse } from '../../domain/cable.model';

/** Cómo se obtuvo el código consultado: escaneado con la cámara o escrito a mano. */
export type LookupSource = 'scan' | 'manual';

export interface LookupSession {
  readonly source: LookupSource;
  readonly query: string;
  readonly response: CableSearchResponse;
}

/** Estado compartido entre pantallas (P01/P03 → P02/P04). Basado en signals; vive solo en memoria. */
@Injectable({ providedIn: 'root' })
export class LookupSessionStore {
  private readonly _session = signal<LookupSession | null>(null);
  private readonly _manualDraft = signal('');

  readonly session = this._session.asReadonly();
  /** Texto con el que se abre P03 (p. ej. la lectura dudosa que el usuario quiere corregir). */
  readonly manualDraft = this._manualDraft.asReadonly();

  save(session: LookupSession): void {
    this._session.set(session);
  }

  setManualDraft(code: string): void {
    this._manualDraft.set(code);
  }

  clear(): void {
    this._session.set(null);
    this._manualDraft.set('');
  }
}
