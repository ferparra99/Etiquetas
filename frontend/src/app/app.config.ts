import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LoggerService } from './core/logging/logger.service';
import { LabelReader } from './core/ocr/label-reader';
import { ServerLabelReader } from './core/ocr/server-label-reader';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // El logger se crea al arrancar para que `@LogFeature` ya lo encuentre.
    provideAppInitializer(() => {
      inject(LoggerService);
    }),
    // Para cambiar de motor OCR (p. ej. Tesseract.js) basta con cambiar esta línea.
    { provide: LabelReader, useClass: ServerLabelReader },
  ],
};
