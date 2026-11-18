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
