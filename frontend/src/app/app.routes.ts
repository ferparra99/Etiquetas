import { Routes } from '@angular/router';
import { resultGuard, unregisteredGuard } from './core/lookup/lookup.guards';
import { AppRoute } from './core/navigation/app-route';

/** Una ruta por pantalla de Figma (P01–P05), cargadas bajo demanda. */
export const routes: Routes = [
  {
    path: AppRoute.Scan,
    pathMatch: 'full',
    loadComponent: () => import('./features/scan/scan.page').then((m) => m.ScanPage),
  },
  {
    path: AppRoute.Result,
    canActivate: [resultGuard],
    loadComponent: () => import('./features/result/result.page').then((m) => m.ResultPage),
  },
  {
    path: AppRoute.Manual,
    loadComponent: () => import('./features/manual/manual.page').then((m) => m.ManualPage),
  },
  {
    path: AppRoute.Unregistered,
    canActivate: [unregisteredGuard],
    loadComponent: () => import('./features/unregistered/unregistered.page').then((m) => m.UnregisteredPage),
  },
  {
    path: AppRoute.CameraPermission,
    loadComponent: () =>
      import('./features/camera-permission/camera-permission.page').then((m) => m.CameraPermissionPage),
  },
  { path: '**', redirectTo: AppRoute.Scan },
];
