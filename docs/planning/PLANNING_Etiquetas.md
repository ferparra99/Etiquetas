# Etiquetas — Planning v1.4

Aplicativo web (PWA) para escanear marquillas de cables con la cámara del celular y localizar la otra punta del cable en estudios de grabación.

---

## 1. Visión y alcance

**Problema:** identificar rápido hacia dónde va un cable a partir de su marquilla.

**Flujo principal v1**
1. El técnico abre la app en el celular y toma una foto de la marquilla (la foto no se guarda en el dispositivo).
2. La app lee el texto (OCR) y lo muestra en un textbox editable.
3. El técnico corrige si hace falta y pulsa "Buscar".
4. El sistema interpreta el código, busca el cable en la base de datos y muestra el tipo de cable, la ruta, el origen (con su posición) y el destino (con su puerto), en un texto amigable y fácil de entender.

**Dentro de la v1**
- Un solo formato de marquilla: `BB.RK-RK.0801.12.07`.
- Escaneo por foto con corrección manual.
- Importación masiva de inventario desde Excel.
- Alta manual de cables faltantes.
- Edición de origen/destino de cables (redistribuciones); al editar, la marquilla se regenera.
- Historial de los últimos 10 escaneos.
- Catálogo (biblioteca) de tipos de ubicación y equipos.
- Cámara en vivo (fase final de la v1, cuando la foto funcione bien).
- Español como idioma único.
- Un solo cliente, pero con el modelo de datos preparado para varios.

**Fuera de la v1 (v2.0 en adelante)**
- Configuración de formatos de marquilla desde la interfaz.
- Resaltado de la ubicación sobre un plano.
- Multi-cliente completo, cada uno con sus formatos.
- Login y roles.

---

## 2. Interpretación del formato (v1)

`BB.RK-RK.0801.12.07`

| Segmento | Valor | Significado |
|---|---|---|
| Tipo de cable | `BB` | BlackBox |
| Tipo de ruta | `RK-RK` | Rack a rack |
| Origen | `08` | Rack 8 |
| Destino | `01` | Rack 1 |
| Posición | `12` | Posición 12 del rack 8 (extremo de origen) |
| Puerto | `07` | Puerto 7 del rack 1 (extremo de destino) |

Ambas puntas llevan la misma marquilla, así que una búsqueda por código devuelve el cable completo (ambos extremos).

**Resultado esperado para este ejemplo:**

```
Equipo: BlackBox

Inicio: Rack #8
Posición: 12

Destino: Rack #1
Posición: 7
```

---

## 3. Stack tecnológico

### 3.1 Stack del proyecto (basado en tu experiencia)

Se parte de tu stack de trabajo (Java, Spring Boot y Angular) con PostgreSQL como base de datos, y de tus requisitos: POO estricta, interfaces, JUnit, Mockito y herramientas gratuitas. La lectura de texto queda detrás de una interfaz (`OcrEngine`), así que se puede cambiar de motor sin tocar el resto.

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Angular (última LTS), TypeScript, PWA | Cámara con `getUserMedia`, instalable en el celular |
| OCR (v1) | Tesseract.js en el navegador | Gratis; la foto nunca sale del dispositivo ni se guarda |
| Backend | Java 21 y Spring Boot 3 (Web, Data JPA, Validation, AOP) | Hexagonal por módulos |
| Base de datos | PostgreSQL (imagen oficial en Docker) | Gratuita; `JSONB` disponible para los formatos configurables de la v2 |
| Acceso a datos | Spring Data JPA / Hibernate | Repositorios detrás de interfaces |
| Carga masiva | Apache POI + `JdbcTemplate` por lotes con `INSERT ... ON CONFLICT` | Rápida y repetible, detrás del puerto `CableBulkWriter` |
| Migraciones | Flyway | Scripts SQL versionados en `db/migration` |
| Mapeo | MapStruct | Entidad ↔ DTO sin código repetitivo |
| Logs | SLF4J + Logback | Consola y archivo diario en `logs/` |
| Pruebas | JUnit 5, Mockito, AssertJ, Testcontainers (módulo PostgreSQL) | Automatizadas en CI |
| Documentación API | springdoc-openapi | Swagger UI |
| Contenedores | Docker Compose | PostgreSQL + backend + frontend |
| CI | GitHub Actions | Compila y corre pruebas en cada push |

**Implicaciones de PostgreSQL**
- Claves primarias con secuencias (`SEQUENCE`), para que Hibernate pueda insertar por lotes.
- Código de marquilla único por proyecto: `UNIQUE (project_id, code)`.
- Fechas con `TIMESTAMPTZ` y booleanos nativos.
- `JSONB` para los formatos de marquilla configurables de la v2.
- El SQL específico de PostgreSQL queda solo en los adaptadores de `infrastructure`.

**Login futuro:** Spring Security con JWT dentro del mismo backend.

### 3.2 Mejorar la precisión del OCR (v1)

- Recortar solo la zona de la marquilla (guía en pantalla para encuadrar).
- Preprocesar: escala de grises, contraste, binarización.
- Tesseract con lista blanca de caracteres: `A-Z 0-9 . -`.
- Modo de una sola línea de texto.
- Normalizar errores típicos (`O`↔`0`, `I`↔`1`, `S`↔`5`) con reglas del formato.
- Validar con la expresión regular del formato y mostrar el resultado en un textbox editable antes de buscar.

---

## 4. Arquitectura

Arquitectura hexagonal (puertos y adaptadores) organizada **por módulo funcional**. Cada módulo tiene cuatro capas:

```
module/
├── domain/          → modelos, reglas, puertos (interfaces). Sin dependencias de Spring.
├── application/     → casos de uso (implementan interfaces), DTO, mappers.
├── infrastructure/  → persistencia, Excel, OCR: implementan los puertos.
└── api/             → controladores REST y DTO de entrada/salida.
```

**Módulos:** `label`, `cable`, `location`, `inventory`, `scan`, `project`, más `shared` (logging, excepciones, base común).

**Regla de dependencias:** `api → application → domain ← infrastructure`. El dominio no conoce a nadie.

**Modelo de datos (preparado para multi-cliente):**
- `project` (cliente/proyecto; en v1 existe uno solo)
- `cable_type` y `route_type` (catálogo: `BB` → BlackBox, `RK-RK` → Rack a rack)
- `location_type` y `equipment_type` (biblioteca/catálogo)
- `location` (rack, estudio, wallbox, etc., con jerarquía)
- `cable` (código único por proyecto; extremo de origen: ubicación + posición; extremo de destino: ubicación + puerto)
- `scan_history` (código escaneado, resultado, fecha; máximo 10 registros por proyecto)
- `cable_label_history` (códigos anteriores de un cable, con fecha de cambio)
- `import_job` (registro de cargas masivas y sus errores)

Toda tabla de negocio lleva `project_id`, para que el multi-cliente de la v2 no obligue a rediseñar.


### 4.1 Plantilla de importación (Excel)

Mientras no llegue el inventario real, se usa `database/sample-data/inventario_ejemplo.xlsx` (15 cables ficticios, incluido el de este documento). Todas las celdas son texto para conservar los ceros a la izquierda.

**Hoja `Cables`**

| Columna | Ejemplo | Descripción |
|---|---|---|
| `codigo_marquilla` | `BB.RK-RK.0801.12.07` | Texto completo de la marquilla |
| `tipo_cable` | `BB` | Debe coincidir con el segmento 1 del código |
| `tipo_ruta` | `RK-RK` | Debe coincidir con el segmento 2 del código |
| `origen_codigo` | `08` | Rack de origen |
| `posicion_origen` | `12` | Posición en el rack de origen |
| `destino_codigo` | `01` | Rack de destino |
| `puerto_destino` | `07` | Puerto en el rack de destino |
| `observaciones` | | Opcional |

**Hoja `Ubicaciones`:** `codigo`, `tipo_ubicacion`, `nombre` (por ejemplo `08`, `Rack`, `Rack #8`). El nombre es el que ve el usuario en el resultado.

El importador valida que las columnas coincidan con lo que dice el código, rechaza duplicados y devuelve un reporte de errores por fila.

### 4.2 Edición de origen y destino

- Se pueden editar el origen, la posición, el destino y el puerto. El tipo de cable y de ruta no se editan, porque cambiarían el formato.
- **La marquilla no se escribe a mano:** al guardar, `LabelFormatter` genera el código nuevo a partir de los datos. Ejemplo: al cambiar el origen de `08` a `05`, el código pasa de `BB.RK-RK.0801.12.07` a `BB.RK-RK.0501.12.07`.
- Si el código nuevo ya existe en el proyecto, el cambio se rechaza con un mensaje claro.
- El código anterior se guarda en `cable_label_history`. Si alguien escanea una marquilla física vieja, el resultado le avisa cuál es el código vigente.
- El cable queda marcado como "pendiente de re-etiquetar" hasta que el técnico confirme que cambió la marquilla física.
- El cambio y el código nuevo se guardan en una sola transacción.

### 4.3 Historial de escaneos

- Se guardan como máximo **10** escaneos (`SCAN_HISTORY_MAX_ITEMS=10`). Al registrar el 11.º, se elimina el más antiguo en la misma transacción.
- Cada registro guarda el código, si se encontró o no, y la fecha.
- Sin login, el historial es compartido por todos los técnicos del proyecto.

### 4.4 Texto del resultado (amigable)

El resultado se muestra como un bloque corto, con nombres del catálogo ("Rack #8") y sin ceros a la izquierda en la posición. El código técnico queda en una línea secundaria. Ejemplo para `BB.RK-RK.0801.12.07`:

```
Equipo: BlackBox

Inicio: Rack #8
Posición: 12

Destino: Rack #1
Posición: 7

Marquilla: BB.RK-RK.0801.12.07
```

Mensajes de error y avisos, todos en lenguaje sencillo:
- **No encontrado:** "No encontramos un cable con la marquilla BB.RK-RK.0801.12.07. Revisa que el texto esté bien escrito o agrégalo al inventario."
- **Texto no válido:** "El texto no coincide con el formato de las marquillas. Corrígelo e inténtalo de nuevo."
- **Marquilla antigua:** "Esta marquilla ya no está vigente. El cable ahora se identifica como BB.RK-RK.0501.12.07."

Los textos viven en `i18n/messages_es.properties`, no en el código, y los arma un componente propio (`ResultMessageBuilder`).

---

## 5. Estructura de carpetas

El archivo `etiquetas-estructura.zip` trae todas las carpetas vacías. Resumen:

```
etiquetas/
├── backend/
│   ├── logs/                          ← logs en archivo
│   └── src/
│       ├── main/java/com/etiquetas/cables/
│       │   ├── label/ cable/ location/ inventory/ scan/ project/
│       │   │   ├── domain/{model,port,service,exception}
│       │   │   ├── application/{dto,usecase,mapper}
│       │   │   ├── infrastructure/{persistence,adapter}
│       │   │   └── api/{controller,dto}
│       │   └── shared/{config,logging,exception,util,constants,base}
│       ├── main/resources/{db/migration,db/seed,i18n}
│       └── test/java/…                ← espeja main
├── frontend/src/app/{core,shared,features/{scan,cables,locations,import,history}}
├── .env  .env.example  .gitignore
├── docs/{planning,architecture,adr,api,changelog,manuals}
├── database/{scripts,diagrams,sample-data}   ← sample-data/inventario_ejemplo.xlsx
├── docker/  scripts/  .github/workflows/
```

---

## 6. Principios de POO y código limpio

- **Interfaces primero:** cada servicio y repositorio tiene interfaz (`CableRepository`) e implementación (`JpaCableRepository`). Los controladores y casos de uso dependen solo de interfaces.
- **Encapsulamiento:** atributos privados, objetos de dominio inmutables o con validación en el constructor, sin setters públicos innecesarios.
- **Abstracción:** puertos que ocultan el detalle técnico (`OcrEngine`, `InventoryReader`).
- **Herencia:** clases base en `shared/base` (por ejemplo `AuditableEntity`, `BaseUseCase`) solo donde haya reutilización real.
- **Polimorfismo:** varios parsers de marquilla bajo la misma interfaz; el sistema elige cuál usar sin `if/else` por tipo.
- **SOLID** y **DRY**; funciones pequeñas, nombres claros, sin números ni textos mágicos (constantes en `shared/constants`).
- **Inyección de dependencias por constructor**, nunca por campo.
- **Excepciones de dominio** propias, manejadas en un único `@RestControllerAdvice`.
- **DTO** en los bordes; las entidades de base de datos no salen por la API.

---

## 7. Patrones de diseño

| Patrón | Dónde se usa |
|---|---|
| Strategy | `LabelParser` y `LabelFormatter`: un lector y un generador de marquilla por formato (v1: `BlackBoxRackParser` y `BlackBoxRackFormatter`; v2: más formatos) |
| Factory | `LabelParserFactory` elige el parser según el código leído |
| Adapter | `OcrEngine`: Tesseract.js hoy; otro motor mañana |
| Chain of Responsibility | Validaciones y normalización del texto leído |
| Repository | Acceso a datos desacoplado de JPA |
| Builder | Construcción del resultado de ubicación (`CableLocationResult`) y de su texto amigable |
| Template Method | Flujo común de importación (leer → validar → guardar → reportar) para distintas fuentes |
| Observer / eventos de Spring | Registrar el historial al completarse un escaneo |
| Decorator / AOP | Logging automático por funcionalidad |
| Facade | Servicio de aplicación que orquesta escaneo + búsqueda + historial |

---

## 8. Logging y trazabilidad

### 8.1 Log por funcionalidad (consola y archivo)
- Anotación propia `@LogFeature("nombre")` + aspecto AOP: registra inicio, fin, duración y errores de cada caso de uso.
- Logback con dos *appenders*: consola y archivo `logs/etiquetas-AAAA-MM-DD.log` (rotación diaria, retención de 30 días).
- Formato: `fecha | nivel | módulo | funcionalidad | mensaje`.
- En el frontend, un `LoggerService` imprime en consola y envía eventos relevantes al backend.

### 8.2 Registro de solicitudes y cambios
- Archivo `docs/changelog/REQUESTS_LOG.md`, que se actualiza **siempre** que haya una solicitud o un cambio de código.
- Formato de cada entrada:

```
## [AAAA-MM-DD] REQ-001 — Título corto
- Solicitud: qué se pidió
- Cambios: archivos/módulos modificados
- Tipo: feature | fix | refactor | docs
- Estado: hecho | en curso
```

- Definición de "terminado": ningún cambio se da por cerrado sin su entrada en este archivo y sus pruebas en verde.

---

## 9. Estrategia de pruebas

- **Unitarias (JUnit 5 + Mockito):** dominio y casos de uso con dependencias simuladas por interfaz. Meta: cobertura mínima del 80 % en `domain` y `application`.
- **Integración (Testcontainers):** repositorios contra PostgreSQL real.
- **API (MockMvc):** controladores y manejo de errores.
- **Frontend:** Jest/Karma para servicios y componentes; Playwright para el flujo escanear → editar → buscar.
- **Datos de prueba:** carpeta `fixtures` y `sample-data` con Excel de ejemplo.
- **CI:** GitHub Actions ejecuta todo en cada push.

---

## 10. Plan por fases

| Fase | Contenido | Resultado |
|---|---|---|
| 0. Base | Repo, estructura, Docker Compose, PostgreSQL, Flyway, logging, `REQUESTS_LOG.md`, CI | Proyecto que arranca y registra logs |
| 1. Dominio y parser | Modelo de cable/ubicación, `LabelParser`, factory, validaciones y pruebas | Código `BB.RK-RK.0801.12.07` interpretado correctamente |
| 2. Inventario | Esquema final, importación Excel (carga masiva por lotes con upsert y reporte de errores), alta manual de cable, catálogo de tipos | Inventario cargado y consultable |
| 3. Búsqueda | Caso de uso de consulta por código, resultado en texto amigable, API REST | Búsqueda funcional por API |
| 4. Escaneo por foto | PWA, captura con la cámara sin guardar, OCR, preprocesado, textbox editable, botón buscar | Flujo completo: foto → texto → resultado |
| 5. Edición e historial | Editar origen/destino con regeneración de la marquilla, historial de 10 escaneos | Datos mantenibles ante redistribuciones |
| 6. Cámara en vivo | Escaneo continuo con detección y confirmación | Opción de cámara activa |
| 7. Cierre de v1 | Pruebas E2E, ajuste de precisión OCR, documentación, demo | Primera versión completa |

**Hoja de ruta posterior**
- **v2.0:** formatos de marquilla configurables, multi-cliente, resaltado en plano.
- **v2.x:** login y roles, reportes, generación e impresión de marquillas.

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| Precisión del OCR con poca luz o marquilla curva | Preprocesado, guía de encuadre, textbox editable, motor intercambiable |
| Formato del Excel desconocido | Definir plantilla de importación y validar con reporte de errores por fila |
| Volumen de datos no definido | Índices por `project_id` y código; paginación |
| Cambio de formatos en v2 | Strategy/Factory desde la v1 |

---

## 12. Preguntas abiertas

1. ¿Qué columnas trae el Excel de inventario real? La plantilla de la sección 4.1 es de ejemplo y se ajustará cuando llegue.
2. Al escanear, ¿el técnico debe indicar desde qué punta escanea para mostrar solo la otra, o se muestran siempre las dos puntas?
3. En el resultado, el destino muestra "Posición: 7", según el formato pedido. ¿Debe decir "Puerto" o "Posición"?
