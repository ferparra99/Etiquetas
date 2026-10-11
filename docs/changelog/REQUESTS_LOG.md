# Registro de solicitudes y cambios

> Se actualiza siempre que haya una solicitud o un cambio en el código.

## [2026-10-11] REQ-001 — Definición inicial del proyecto
- Solicitud: requerimientos iniciales, stack, planning y estructura de carpetas.
- Cambios: `docs/planning/PLANNING_Etiquetas.md`, estructura de carpetas.
- Tipo: docs
- Estado: hecho

## [2026-10-11] REQ-002 — Planning v1.1 y archivos base
- Solicitud: incluir el planning en la estructura, crear `.gitignore` y `.env`; aclarar que la posición 12 es del rack 8 y el puerto 7 del rack 1.
- Cambios: `docs/planning/PLANNING_Etiquetas.md`, `.gitignore`, `.env`, `.env.example`, `docs/changelog/REQUESTS_LOG.md`.
- Tipo: docs
- Estado: hecho

## [2026-10-11] REQ-003 — Planning v1.2: stack basado en la experiencia y resultado con BlackBox
- Solicitud: usar el stack basado en la experiencia (Java, Spring Boot, Angular, Oracle/PL-SQL) con todas sus implicaciones; el resultado esperado debe indicar `BB: BlackBox`.
- Cambios: `docs/planning/PLANNING_Etiquetas.md` (sección 2, 3.2, 5, 9, 10, 11), `.env`, `.env.example`, carpeta `database/scripts/plsql`.
- Tipo: docs
- Estado: hecho

## [2026-10-11] REQ-004 — Planning v1.3: Excel de ejemplo, edición con nueva marquilla, historial de 10 y texto amigable
- Solicitud: crear un Excel simple de inventario para pruebas; al editar origen o destino la marquilla debe cambiar; guardar máximo 10 escaneos; resultado en texto amigable.
- Cambios: `database/sample-data/inventario_ejemplo.xlsx` (copia en `backend/src/test/resources/fixtures/`), `docs/planning/PLANNING_Etiquetas.md` (secciones 1, 4.1–4.4, 7, 10, 12), `.env` y `.env.example` (`SCAN_HISTORY_MAX_ITEMS=10`).
- Tipo: feature | docs
- Estado: hecho

## [2026-10-11] REQ-005 — Planning v1.4, guía de desarrollo y PostgreSQL
- Solicitud: integrar los archivos al zip; crear una guía paso a paso de desarrollo (archivo aparte); eliminar del planning el stack que no corresponde a la experiencia (Oracle y alternativas); nuevo formato del resultado (Equipo / Inicio / Destino).
- Cambios: `docs/planning/PLANNING_Etiquetas.md` (secciones 2, 3, 4.1, 4.4, 5, 9, 10, 11, 12), `docs/planning/GUIA_DESARROLLO_Etiquetas.md` (nuevo), `database/sample-data/inventario_ejemplo.xlsx` (nombres `Rack #n`), `.env` y `.env.example` (variables de PostgreSQL), eliminada la carpeta `database/scripts/plsql`.
- Tipo: docs
- Estado: hecho
