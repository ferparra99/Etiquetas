# Etiquetas — prototipo v0.1

Escanear una marquilla con el celular → OCR (PaddleOCR) → texto editable → buscar el cable en el inventario.
Si el OCR falla en algún carácter, se proponen los códigos más parecidos del inventario.

```
Angular PWA ──► Spring Boot ──► Servicio OCR (FastAPI + PaddleOCR)
                    │
                    └──► PostgreSQL (Flyway)
```

## Arrancar
```bash
cp .env.example .env
docker compose up --build
```
- App: http://localhost:8080
- API / Swagger: http://localhost:8081/swagger-ui.html
- Servicio OCR: http://localhost:8000/docs

La primera vez, el servicio `ocr` descarga los modelos (se guardan en el volumen `paddlex-cache`) y tarda en quedar listo.

## Probar desde el celular
La pantalla principal (P01) usa la **cámara trasera en vivo** (`getUserMedia`), que el navegador solo permite en **HTTPS** o en `localhost`.
- En la red local (`http://IP_DEL_PC:8080`) el navegador bloquea la cámara: la app lo avisa y se puede usar la pantalla P03 (escribir el código). Para probar la cámara en local usa un túnel HTTPS (p. ej. `cloudflared tunnel --url http://localhost:8080`) o Chrome en `chrome://flags` → *Insecure origins treated as secure*.

Probar solo el OCR: `curl -F "file=@marquilla.jpg" http://localhost:8000/ocr`

## Ajustar el OCR
Variables `OCR_*` en `.env` (ver `.env.example`) y `docker compose up -d ocr`. El tiempo de cada lectura se muestra en la app (`OCR: N ms`).

## Estructura
```
backend/src/main/java/com/etiquetas/cables/
├── scan/   domain(port OcrEngine) · application · infrastructure(PaddleOcrHttpAdapter) · api
├── cable/  domain(ports, Strategy, normalizadores) · application · infrastructure(JPA) · api
└── shared/ logging (@LogFeature + AOP) · exception · constants
```
Regla: `api → application → domain ← infrastructure`.

## Frontend (Angular · diseño de Figma «Cable Trace – UI Etiquetas»)
Ver `frontend/README.md`: pantallas P01–P05, escala de diseño, estructura y pruebas.

## Logs
- Cada caso de uso marcado con `@LogFeature("nombre")` registra inicio, fin, duración y errores.
- Salida en consola y en `backend/logs/etiquetas-AAAA-MM-DD.log` (30 días).
- El frontend usa `@LogFeature` y `LoggerService`: imprime en la consola del navegador y envía los eventos a `POST /api/client-logs`, que los escribe en ese mismo archivo (módulo `frontend`).
- Cambios de código: `docs/changelog/REQUESTS_LOG.md`.

## Pruebas del backend
`cd backend && mvn test` (JUnit 5, Mockito, AssertJ).

## Pendiente (siguientes fases)
Formato real de marquilla (`V07206 VJF B06`), importación de Excel, edición de destinos con cambio de código, historial de 10 escaneos, `pg_trgm` para buscar candidatos con inventarios grandes, cámara en vivo, E2E.
