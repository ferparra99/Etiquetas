import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LogFeature } from '../logging/log-feature.decorator';
import { AppRoute } from '../navigation/app-route';
import { NavigationService } from '../navigation/navigation.service';
import { LookupSessionStore, LookupSource } from './lookup-session.store';

/**
 * Patrón Facade: orquesta consulta + estado + navegación para las pantallas P01 y P03.
 * Encontrada → P02 · no encontrada → P04. Los errores de red se propagan para que la pantalla los muestre.
 */
@Injectable({ providedIn: 'root' })
export class CableLookupFacade {
  private readonly api = inject(ApiService);
  private readonly store = inject(LookupSessionStore);
  private readonly navigation = inject(NavigationService);

  @LogFeature('consultar-marquilla')
  async lookup(code: string, source: LookupSource): Promise<void> {
    const query = code.trim();
    if (!query) {
      return;
    }
    const response = await firstValueFrom(this.api.searchCable(query));
    this.store.save({ source, query, response });
    await this.navigation.go(response.exact ? AppRoute.Result : AppRoute.Unregistered);
  }
}
