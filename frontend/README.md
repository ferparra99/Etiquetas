# Frontend — Cable Trace / Etiquetas (Angular)

Implementación del diseño de Figma **«Cable Trace – UI Etiquetas»**. Las medidas, colores y formas salen del mock.

## Pantallas
| Pantalla | Ruta | Qué hace |
|---|---|---|
| **P01** Escaneo cable (principal) | `/` | Cámara **trasera** en vivo con marca de agua de encuadre → captura recortada → OCR → texto editable → consultar |
| **P02** Resultado de consulta | `/resultado` | Muestra la marquilla encontrada. **Solo dibuja lo que la BD devolvió** |
| **P03** Ingreso manual | `/manual` | Consulta por teclado. Encontrada → P02 · no encontrada → P04 |
| **P04** Marquilla no registrada | `/no-registrada` | Lo leído/escrito, sugerencia más parecida del inventario y acciones |
| **P05** Cámara sin permiso | `/permiso-camara` | Pasos para activar la cámara; reintentar o escribir el código |

## Fidelidad con el mock (escala de diseño)
El lienzo de Figma mide 709 px de ancho. En `src/styles.scss`: `--u = min(100vw, 480px) / 709`.
En SCSS se escribe con las medidas del mock: `padding: px(34)`, `font-size: fs(42)`, `border: bw(2)`
(`src/styles/_functions.scss`). Así **34 px del mock = 34 × --u** en cualquier teléfono, sin redondeos a mano.
Tokens de color = variables de Figma (`:root` en `styles.scss`). Iconos = SVG exportados de Figma (`public/icons`). Fuente: Inter (local).

## Estructura
```
src/app/
├── core/                 lógica sin UI
│   ├── api/              ApiService (único contacto con el backend)
│   ├── camera/           CameraService (cámara trasera, captura recortada), cálculo del recorte
│   ├── logging/          LoggerService + @LogFeature (consola + backend → logs/)
│   ├── lookup/           CableLookupFacade, LookupSessionStore (signals), guardas de ruta
│   ├── navigation/       AppRoute (rutas ↔ P01–P05), NavigationService
│   └── ocr/              LabelReader (puerto) · ServerLabelReader (adaptador PaddleOCR) · confianza
├── domain/               modelos (Cable, respuestas)
├── features/             una carpeta por pantalla (scan, result, manual, unregistered, camera-permission)
└── shared/               ui (icon, icon-button, action-button) · util · constants
```
Patrones: **Adapter** (`LabelReader`), **Strategy** (`EquipmentIconStrategy`), **Facade** (`CableLookupFacade`),
**Decorator** (`@LogFeature`), **Factory** (`CableViewFactory`), **Observer** (signals), inyección de dependencias.
Regla de dependencias: `features → core → domain`; `core` no conoce las pantallas.

## Cambiar el motor de OCR
Implementa `LabelReader` y cámbialo en `app.config.ts` (`{ provide: LabelReader, useClass: ... }`). Las pantallas no cambian.

## Logs
Cada funcionalidad decorada con `@LogFeature('nombre')` registra inicio, fin, duración y errores:
`2026-11-24 09:05:07 | INFO  | frontend | escanear-marquilla | inicio`. Se imprime en la consola del navegador y se envía por
lotes a `POST /api/client-logs`; el backend lo escribe en `logs/etiquetas-AAAA-MM-DD.log`.

## Comandos
```bash
npm ci
npm start                # http://localhost:4200 (proxy a /api → backend en :8081, ver proxy.conf.json)
npm run build            # producción → dist/frontend/browser
npm test                 # Karma/Jasmine (Chrome); CI: npm test -- --watch=false --browsers=ChromeHeadlessCI
```
La cámara trasera exige HTTPS o `localhost`. En desarrollo (`isDevMode`) se acepta cualquier cámara si no hay trasera.
