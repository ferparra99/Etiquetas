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
Abre `http://IP_DEL_PC:8080` en el celular (misma red). El botón usa `<input capture>`, que abre la cámara nativa y **no necesita HTTPS**.
La cámara integrada con `getUserMedia` (fase 6) sí requiere HTTPS.

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

## Logs
- Cada caso de uso marcado con `@LogFeature("nombre")` registra inicio, fin, duración y errores.
- Salida en consola y en `backend/logs/etiquetas-AAAA-MM-DD.log` (30 días).
- Cambios de código: `docs/changelog/REQUESTS_LOG.md`.

## Pruebas del backend
`cd backend && mvn test` (JUnit 5, Mockito, AssertJ).

## Pendiente (siguientes fases)
Formato real de marquilla (`V07206 VJF B06`), importación de Excel, edición de destinos con cambio de código, historial de 10 escaneos, `pg_trgm` para buscar candidatos con inventarios grandes, cámara en vivo, E2E.

## Desplegar en Render
Render no ejecuta `docker-compose.yml`; usa el Blueprint `render.yaml` (en la raíz del repo).
1. Sube el proyecto a GitHub (el `render.yaml` debe estar en la raíz).
2. En Render: **New → Blueprint** y elige el repositorio. Crea 3 servicios (OCR privado, backend, frontend) y una base Postgres.
3. Abre la URL `onrender.com` del servicio `etiquetas-frontend`.
- Los logs de archivo no persisten en Render (disco efímero); el log por consola sí se ve en el panel.
- Sin login en la v1: la URL pública queda abierta a cualquiera que la conozca.
