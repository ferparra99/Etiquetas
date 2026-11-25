# Registro de solicitudes y cambios

Se actualiza **siempre** que haya una solicitud o un cambio de código. Un cambio no se da por cerrado sin su entrada aquí y sus pruebas en verde.

## [2026-11-25] REQ-006 — Quitar el despliegue en Render
- Solicitud: descartar Render (el plan gratuito no encaja con el proyecto) y limpiar el repositorio de todo lo relacionado.
- Cambios: eliminados `render.yaml` y `backend/docker-entrypoint.sh`; `backend/Dockerfile` arranca con `java -jar` directo; `backend/src/main/resources/application.yml` fija `server.port: 8080` y deja `OCR_BASE_URL` con valor por defecto `http://localhost:8000` (sin `PORT` ni `OCR_HOSTPORT`); `frontend/nginx.conf.template` escucha en el puerto 80 y `frontend/Dockerfile` ya no define `PORT`; `ocr-service/Dockerfile` fija el puerto 8000; `compose.local.yml` y `README.md` sin menciones a Render.
- Tipo: chore
- Estado: hecho (stack local reconstruido y verificado)

## [2026-11-24] REQ-005 — Frontend Angular según el diseño de Figma (P01–P05)
- Solicitud: construir el front del aplicativo con las dimensiones, formas y colores del mock de Figma «Cable Trace – UI Etiquetas»; P01 escáner con cámara trasera y marca de agua de encuadre, P02 resultado con datos de la BD (lo que no existe no se muestra), P03 consulta por teclado (→ P02 si existe, → P04 si no), P04 marquilla no registrada, P05 permiso de cámara; log por funcionalidad en consola y archivo.
- Cambios: `frontend/` reescrito (Angular standalone, SCSS con escala del lienzo de 709 px, fuente Inter local, iconos SVG exportados de Figma en `public/icons`, manifiesto PWA, 5 páginas en `src/app/features`, núcleo en `src/app/core`: logging con `@LogFeature`, cámara, OCR como puerto/adaptador, fachada de consulta, estado y guardas; pruebas Karma/Jasmine), `backend/.../shared/logging/ClientLogController.java` (nuevo: `POST /api/client-logs` escribe el log del frontend en `logs/`), `docs/changelog/REQUESTS_LOG.md`.
- Tipo: feature
- Estado: en curso (frontend compilado y con 21 pruebas en verde; recorrido manual en Chromium con cámara simulada; pendiente compilar el backend y probar con un celular real sobre HTTPS)

## [2026-11-18] REQ-002 — Prototipo con PaddleOCR (ruta delgada de punta a punta)
- Solicitud: prototipo con las herramientas conocidas (Angular, Spring Boot, PostgreSQL, Docker) que use PaddleOCR.
- Cambios: `ocr-service/` (FastAPI + PaddleOCR), `backend/` (módulos `scan`, `cable`, `shared`; Flyway; logging por funcionalidad), `frontend/` (PWA Angular), `docker-compose.yml`, `docs/adr/ADR-001`.
- Tipo: feature
- Estado: en curso (pendiente compilar y correr las pruebas del backend en el entorno local)

## [2026-11-17] REQ-001 — Evaluación de integración de PaddleOCR
- Solicitud: evaluar cómo integrar PaddleOCR (lenguaje, presets del prototipo de Gradio, frontend local).
- Cambios: ninguno en código; decisión documentada en `docs/adr/ADR-001`.
- Tipo: docs
- Estado: hecho

## [2026-11-18] REQ-003 — Fix: el servicio OCR no arrancaba (oneDNN)
- Solicitud: el contenedor `ocr` salía con `NotImplementedError: ConvertPirAttribute2RuntimeAttribute` en el calentamiento.
- Cambios: `ocr-service/requirements.txt` (paddlepaddle==3.2.2, paddleocr==3.3.3), `ocr-service/app/config.py` y `docker-compose.yml` (variable `OCR_ENABLE_MKLDNN`), `.env.example`.
- Tipo: fix
- Estado: en curso (pendiente confirmar en el equipo del usuario)

## [2026-11-18] REQ-004 — Despliegue en Render
- Solicitud: adaptar el docker compose para ejecutarlo en Render.
- Cambios: `render.yaml` (nuevo), `backend/docker-entrypoint.sh` y `backend/Dockerfile` (DATABASE_URL → JDBC), `backend/src/main/resources/application.yml` (PORT y OCR_HOSTPORT), `frontend/nginx.conf.template` y `frontend/Dockerfile` (PORT y BACKEND_HOSTPORT por variables), `ocr-service/Dockerfile` y `app/prefetch.py` (modelos en la imagen, puerto configurable), `README.md`.
- Tipo: feature
- Estado: revertido (ver REQ-006)
