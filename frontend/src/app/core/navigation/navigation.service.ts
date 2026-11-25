import { Location } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AppRouteValue, routeLink } from './app-route';

/** "Volver" real cuando hay historial dentro de la app; si la pantalla es la primera, usa un destino de respaldo. */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private navigations = 0;

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.navigations++);
  }

  back(fallback?: AppRouteValue): void {
    if (this.navigations > 1) {
      this.location.back();
    } else if (fallback !== undefined) {
      void this.router.navigateByUrl(routeLink(fallback), { replaceUrl: true });
    }
  }

  go(route: AppRouteValue, options?: { replaceUrl?: boolean }): Promise<boolean> {
    return this.router.navigateByUrl(routeLink(route), options);
  }
}
