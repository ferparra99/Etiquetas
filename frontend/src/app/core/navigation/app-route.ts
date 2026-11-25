/** Rutas de la app y su pantalla en Figma. Fuente única: nadie escribe paths a mano. */
export const AppRoute = {
  /** P01 · Escaneo cable (pantalla principal) */
  Scan: '',
  /** P02 · Resultado de consulta */
  Result: 'resultado',
  /** P03 · Ingreso manual */
  Manual: 'manual',
  /** P04 · Marquilla no registrada */
  Unregistered: 'no-registrada',
  /** P05 · Cámara sin permiso */
  CameraPermission: 'permiso-camara',
} as const;

export type AppRouteValue = (typeof AppRoute)[keyof typeof AppRoute];

export const routeLink = (route: AppRouteValue): string => `/${route}`;
