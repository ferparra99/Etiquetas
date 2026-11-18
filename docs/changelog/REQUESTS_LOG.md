# Registro de solicitudes y cambios

Se actualiza **siempre** que haya una solicitud o un cambio de código. Un cambio no se da por cerrado sin su entrada aquí y sus pruebas en verde.

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
- Estado: en curso (pendiente probar el despliegue en Render)
