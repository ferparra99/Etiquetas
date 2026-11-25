import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRoute, routeLink } from '../navigation/app-route';
import { LookupSessionStore } from './lookup-session.store';

/** P02 solo existe si hay una marquilla encontrada; al recargar la página se vuelve al escáner. */
export const resultGuard: CanActivateFn = () => {
  const found = !!inject(LookupSessionStore).session()?.response.exact;
  return found || inject(Router).parseUrl(routeLink(AppRoute.Scan));
};

/** P04 solo existe tras una consulta sin coincidencia exacta. */
export const unregisteredGuard: CanActivateFn = () => {
  const session = inject(LookupSessionStore).session();
  const notFound = !!session && !session.response.exact;
  return notFound || inject(Router).parseUrl(routeLink(AppRoute.Scan));
};
