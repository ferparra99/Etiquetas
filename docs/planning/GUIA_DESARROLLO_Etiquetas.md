# Etiquetas — Guía paso a paso de desarrollo (v1.0)

Complementa a `PLANNING_Etiquetas.md` (qué se construye). Esta guía explica **cómo y en qué orden** construirlo, con los casos que hay que cubrir en cada paso.

**Stack:** Java 21, Spring Boot 3, Angular (LTS), PostgreSQL, Flyway, Tesseract.js, JUnit 5, Mockito, Testcontainers, Docker Compose, GitHub Actions.

> Antes de empezar, confirma en <https://start.spring.io> cuál es la versión estable de Spring Boot vigente y usa esa; la guía asume la rama 3.x.

---

## Índice

0. Reglas de trabajo
1. Preparar el equipo
2. Fase 0 — Base del proyecto
3. Fase 1 — Dominio y parser de marquillas
4. Fase 2 — Inventario (esquema, importación, alta manual)
5. Fase 3 — Búsqueda y escaneos (API)
6. Fase 4 — Frontend y escaneo por foto
7. Fase 5 — Edición de cables e historial
8. Fase 6 — Cámara en vivo
9. Fase 7 — Cierre de la v1
10. Matriz de casos de prueba
11. Checklist final de la v1

---

## 0. Reglas de trabajo (valen para todos los pasos)

**Antes de cada tarea**
1. Crea la entrada en `docs/changelog/REQUESTS_LOG.md` con estado `en curso` (siguiente número `REQ-00X`).
2. Crea la rama `feature/REQ-00X-nombre-corto`.
3. Si es lógica de dominio, escribe primero la prueba (TDD).

**Durante la tarea**
- Commits pequeños y con prefijo: `feat(label): ...`, `fix(import): ...`, `refactor(cable): ...`, `test(...)`, `docs(...)`, `chore(...)`.
- Cada caso de uso lleva `@LogFeature("nombre")` (se crea en el paso 2.5). Así cada funcionalidad nueva imprime log en consola y en `logs/`.
- Dependencias solo hacia adentro: `api → application → domain ← infrastructure`. El paquete `domain` no importa nada de Spring ni de JPA.
- Inyección por constructor, atributos `private final`, objetos de dominio inmutables (`record` o clases con validación en el constructor).

**Definición de terminado (DoD) de cada tarea**
- [ ] Pruebas unitarias en verde (y de integración si toca base de datos).
- [ ] Cobertura ≥ 80 % en `domain` y `application` (JaCoCo en el build).
- [ ] La funcionalidad deja log al iniciar, al terminar y al fallar (verificado en consola y en el archivo).
- [ ] Entrada de `REQUESTS_LOG.md` actualizada a `hecho`, con los archivos cambiados.
- [ ] Sin textos ni números mágicos: constantes en `shared/constants` y mensajes en `i18n/messages_es.properties`.
- [ ] Revisión de POO: interfaz para cada servicio/repositorio, sin `if/else` por tipo (usar Strategy), sin lógica en controladores.
- [ ] Pull request revisado (aunque seas la única persona: léelo en la pantalla del PR antes de fusionar).

**Entradas sugeridas del log por fase**

| Fase | REQ sugeridos |
|---|---|
| 0 | REQ-010 repo y Docker, REQ-011 logging, REQ-012 excepciones, REQ-013 CI |
| 1 | REQ-020 modelo y parser, REQ-021 normalizador, REQ-022 formatter |
| 2 | REQ-030 esquema, REQ-031 catálogos, REQ-032 alta manual, REQ-033 importación |
| 3 | REQ-040 búsqueda, REQ-041 historial |
| 4 | REQ-050 base Angular, REQ-051 cámara, REQ-052 OCR, REQ-053 pantalla de escaneo, REQ-054 PWA |
| 5 | REQ-060 edición, REQ-061 re-etiquetado |
| 6 | REQ-070 cámara en vivo |
| 7 | REQ-080 E2E, REQ-081 precisión OCR, REQ-082 documentación, REQ-083 demo |

---

## 1. Preparar el equipo

| Herramienta | Versión | Verificar |
|---|---|---|
| JDK | 21 (Temurin) | `java -version` |
| Maven | 3.9+ | `mvn -v` |
| Node.js | LTS vigente | `node -v` |
| Angular CLI | la de la LTS | `npm i -g @angular/cli` y `ng version` |
| Docker Desktop | reciente | `docker compose version` |
| Git | 2.40+ | `git --version` |
| IDE | IntelliJ IDEA (backend) y VS Code o IntelliJ (frontend) | |
| Celular de pruebas | Android con Chrome (y un iPhone con Safari si es posible) | |

**Casos a cubrir**
- Si `JAVA_HOME` apunta a otra versión, Maven compila con la equivocada: revisa `mvn -v`.
- Docker Desktop apagado: `docker compose` falla con "cannot connect to the Docker daemon".
- Para probar la cámara desde el celular necesitas HTTPS o `localhost` (ver paso 6.3).

---

## 2. Fase 0 — Base del proyecto

### 2.1 Descomprimir y crear el repositorio
1. Descomprime `etiquetas-estructura.zip`.
2. En la raíz `etiquetas/`:
   ```bash
   git init
   git add .
   git commit -m "chore: estructura inicial del proyecto"
   ```
3. Git no versiona carpetas vacías: agrega un archivo `.gitkeep` en las que quieras conservar (por ejemplo con `find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \;`).
4. Verifica que `.env` **no** aparezca en `git status` (el `.gitignore` lo excluye) y que `.env.example` sí.

**Casos:** si `.env` ya fue añadido por error, sácalo con `git rm --cached .env`.

### 2.2 PostgreSQL con Docker Compose
Crea `docker/docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:17-alpine
    container_name: etiquetas-db
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 3s
      retries: 10
volumes:
  pgdata:
```

Arranque desde la raíz:
```bash
docker compose --env-file .env -f docker/docker-compose.yml up -d db
docker compose -f docker/docker-compose.yml ps    # debe decir "healthy"
```

**Casos a cubrir**
- Puerto 5432 ocupado por otro PostgreSQL: cambia `DB_PORT` en `.env` (por ejemplo 5433).
- Cambiaste la clave después de la primera vez: el volumen conserva la anterior. Borra con `docker compose down -v` (solo en desarrollo).
- Datos de prueba que quieras reiniciar: script `scripts/reset-db.sh` que haga `down -v` + `up -d`.

### 2.3 Crear el backend
1. En <https://start.spring.io>: Maven, Java 21, grupo `com.etiquetas`, artefacto `cables`, paquete `com.etiquetas.cables`.
2. Dependencias: Spring Web, Spring Data JPA, Validation, Spring AOP (`spring-boot-starter-aop`), PostgreSQL Driver, Flyway Migration (más `flyway-database-postgresql` si tu versión lo exige), Actuator, Testcontainers.
3. Agrega manualmente: `springdoc-openapi-starter-webmvc-ui`, `mapstruct` (+ procesador), `poi-ooxml`, y el plugin **JaCoCo** con una regla de cobertura mínima de 0.80 para los paquetes `domain` y `application`.
4. Descarga el `.zip` del proyecto y copia su contenido dentro de `backend/` (respetando las carpetas que ya existen en `src/main/java/com/etiquetas/cables/`).
5. Ejecuta `mvn -B verify` dentro de `backend/` para comprobar que compila.

**Casos a cubrir**
- Si usas MapStruct y otro procesador de anotaciones, el orden en `annotationProcessorPaths` importa.
- No uses Lombok en `domain`: la idea es practicar encapsulamiento explícito (`record` y constructores con validación).

### 2.4 Configuración y variables de entorno
`backend/src/main/resources/application.yml`:

```yaml
spring:
  config:
    import: optional:file:../.env[.properties]
  application:
    name: etiquetas
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        jdbc:
          batch_size: 50
        order_inserts: true
  flyway:
    enabled: true
  messages:
    basename: i18n/messages
    fallback-to-system-locale: false
  servlet:
    multipart:
      max-file-size: ${IMPORT_MAX_FILE_SIZE_MB}MB
      max-request-size: ${IMPORT_MAX_FILE_SIZE_MB}MB
server:
  port: ${SERVER_PORT:8080}
app:
  log-dir: ${LOG_DIR:./logs}
  scan-history-max-items: ${SCAN_HISTORY_MAX_ITEMS:10}
  default-project-code: ${DEFAULT_PROJECT_CODE:default}
```

- Ejecuta siempre con el directorio de trabajo en `backend/` (así `../.env` resuelve a la raíz del proyecto).
- Crea una clase `AppProperties` con `@ConfigurationProperties(prefix = "app")` y `@Validated`: así la aplicación **falla al arrancar** si falta una variable obligatoria, en vez de fallar más tarde.
- Perfiles: `application-dev.yml` (log DEBUG, seeds de desarrollo), `application-prod.yml` (log INFO, sin seeds), `application-test.yml`.

**Casos a cubrir**
- Falta `.env`: la app arranca con los valores por defecto del YAML; para variables sin defecto debe fallar con un mensaje claro.
- Clave de la base de datos nunca en el YAML ni en el repositorio.

### 2.5 Logging por funcionalidad (consola y archivo)
**a) `backend/src/main/resources/logback-spring.xml`**

```xml
<configuration>
  <springProperty scope="context" name="LOG_DIR" source="app.log-dir" defaultValue="./logs"/>
  <property name="PATTERN"
            value="%d{yyyy-MM-dd HH:mm:ss.SSS} | %-5level | %X{module:-app} | %X{feature:-general} | %msg%n"/>

  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder><pattern>${PATTERN}</pattern></encoder>
  </appender>

  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>${LOG_DIR}/etiquetas-%d{yyyy-MM-dd}.log</fileNamePattern>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder><pattern>${PATTERN}</pattern></encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="FILE"/>
  </root>
</configuration>
```

**b) Anotación y aspecto** (`shared/logging/annotation` y `shared/logging/aspect`)

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogFeature {
    String value();                 // nombre de la funcionalidad
    String module() default "";     // opcional; si está vacío se deduce del paquete
}
```

```java
@Aspect
@Component
public class LogFeatureAspect {
    private static final Logger log = LoggerFactory.getLogger(LogFeatureAspect.class);

    @Around("@annotation(logFeature)")
    public Object around(ProceedingJoinPoint pjp, LogFeature logFeature) throws Throwable {
        String previousModule = MDC.get("module");
        String previousFeature = MDC.get("feature");
        MDC.put("module", ModuleResolver.resolve(pjp, logFeature));
        MDC.put("feature", logFeature.value());
        long start = System.nanoTime();
        log.info("INICIO");
        try {
            Object result = pjp.proceed();
            log.info("FIN OK en {} ms", elapsedMs(start));
            return result;
        } catch (Throwable ex) {
            log.error("FIN CON ERROR en {} ms: {}", elapsedMs(start), ex.getMessage());
            throw ex;
        } finally {
            restore("module", previousModule);
            restore("feature", previousFeature);
        }
    }
    // elapsedMs(...) y restore(...) son métodos privados pequeños
}
```

**c) Cómo usarla:** en el método público del caso de uso:
```java
@LogFeature("buscar-cable-por-marquilla")
public CableLocationResult execute(SearchCableCommand command) { ... }
```

**d) Prueba obligatoria:** con `OutputCaptureExtension` verifica que al llamar un caso de uso aparecen `INICIO` y `FIN OK` en consola, y que el archivo del día existe y contiene la línea.

**Casos a cubrir**
- Auto-invocación: si un método con `@LogFeature` se llama desde otro método de la **misma** clase, el aspecto no se ejecuta (limitación de los proxies de Spring). Ponlo siempre en beans llamados desde fuera.
- Funcionalidades anidadas: el aspecto restaura el `module`/`feature` anterior al terminar (por eso guarda los previos).
- La carpeta `logs/` no existe: Logback la crea, pero verifica permisos de escritura.
- Nunca registrar datos sensibles ni imágenes. Los códigos de marquilla sí se pueden registrar.
- Con hilos asíncronos (importación) el MDC no se hereda: copia el MDC al ejecutor (`TaskDecorator`).

### 2.6 Excepciones y respuesta de error uniforme
1. `shared/exception`: `DomainException` (abstracta, con `code` y parámetros del mensaje) y las derivadas por módulo (`InvalidLabelFormatException`, `CableNotFoundException`, `DuplicateLabelException`, ...).
2. Un único `@RestControllerAdvice` que convierte cada excepción en `ProblemDetail` (RFC 7807) con: `status`, `title`, `detail` (mensaje amigable en español), `code` (para el frontend) y `timestamp`.
3. Mensajes en `i18n/messages_es.properties`, resueltos con `MessageSource` (la excepción lleva la clave, no el texto).
4. Mapa de estados: formato inválido → 422; no encontrado → 404; duplicado/conflicto → 409; archivo inválido → 400; error inesperado → 500 con mensaje genérico (el detalle solo va al log).

**Casos a cubrir:** `MethodArgumentNotValidException` (campos vacíos), JSON mal formado, archivo demasiado grande (`MaxUploadSizeExceededException`), `OptimisticLockingFailureException` (409), violación de unicidad de la base de datos (traducir a 409 con mensaje amigable).

### 2.7 Flyway y primer arranque
1. Crea `db/migration/V1__baseline.sql` con un comentario (el esquema real llega en la fase 2).
2. `mvn spring-boot:run` desde `backend/`.
3. Comprueba: arranca sin errores, existe la tabla `flyway_schema_history`, aparece `logs/etiquetas-AAAA-MM-DD.log`, y `GET http://localhost:8080/actuator/health` responde `UP`.

**Casos:** base de datos apagada (error claro, no un stack trace gigante); migración con checksum alterado (Flyway se niega a arrancar: nunca edites una migración ya aplicada, crea otra).

### 2.8 Integración continua
`.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21, cache: maven }
      - run: mvn -B verify
        working-directory: backend
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
        working-directory: frontend
      - run: npm test -- --watch=false --browsers=ChromeHeadless
        working-directory: frontend
```
Ajusta la versión de Node a la LTS vigente y el comando de pruebas a tu ejecutor (Karma o Jest). Activa en GitHub la protección de la rama `main`: solo se fusiona con CI en verde.

### 2.9 Disciplina del registro de cambios
- Crea `.github/pull_request_template.md` con la casilla "¿Actualicé `REQUESTS_LOG.md`?" y el DoD de la sección 0.
- Opcional: un script `scripts/check-log.sh` (en CI) que falle si el PR cambia código y no toca `docs/changelog/REQUESTS_LOG.md`.

**Criterio de cierre de la fase 0:** el proyecto arranca, conecta a PostgreSQL, escribe logs en consola y archivo, devuelve errores uniformes y CI está en verde.

---

## 3. Fase 1 — Dominio y parser de marquillas

Módulo `label`. Todo en TDD y **sin Spring** en `domain`.

### 3.1 Piezas
| Pieza | Tipo | Responsabilidad |
|---|---|---|
| `ParsedLabel` | `record` en `domain/model` | `cableTypeCode`, `routeTypeCode`, `originCode`, `destinationCode`, `position`, `port`; valida en el constructor (todo > 0) |
| `LabelParser` | interfaz en `domain/port` | `boolean supports(String normalized)` y `ParsedLabel parse(String normalized)` |
| `LabelFormatter` | interfaz en `domain/port` | `String format(ParsedLabel label)` (el inverso del parser) |
| `BlackBoxRackParser` y `BlackBoxRackFormatter` | clases en `domain/service` | Formato v1 |
| `LabelParserFactory` | clase en `domain/service` | Recibe la lista de parsers y elige el que `supports` el texto |
| `LabelNormalizer` | cadena de pasos | Limpia el texto leído antes de interpretarlo |
| `InvalidLabelFormatException` | `domain/exception` | Con código `label.invalid-format` |

### 3.2 Expresión regular del formato v1
```java
private static final Pattern PATTERN = Pattern.compile(
    "^(?<type>[A-Z]{2})\\.(?<route>[A-Z]{2}-[A-Z]{2})\\.(?<origin>\\d{2})(?<dest>\\d{2})\\.(?<pos>\\d{2})\\.(?<port>\\d{2})$");
```
Guarda el patrón en `shared/constants` o como constante privada de la clase, nunca repetido.

### 3.3 Normalización (cadena de responsabilidad)
Pasos en orden, cada uno es una clase con una sola responsabilidad:
1. `TrimStep`: quita espacios al inicio y fin.
2. `UppercaseStep`: pasa a mayúsculas.
3. `WhitespaceStep`: elimina espacios internos (`BB. RK-RK .0801` → `BB.RK-RK.0801`).
4. `SeparatorStep`: coma o punto y coma → punto; guion largo (–, —) → `-`; guion bajo → `-` solo dentro del segmento de ruta.
5. `SegmentConfusionStep`: corrige confusiones de OCR **según el tipo de segmento**, no en todo el texto:
   - segmentos numéricos (origen/destino, posición, puerto): `O→0`, `I→1`, `L→1`, `S→5`, `B→8`;
   - segmentos de letras (tipo, ruta): `0→O`, `1→I`, `5→S`, `8→B`.

**Por qué por segmento:** una sustitución global convertiría la `B` de `BB` en `8`.

### 3.4 Tabla de casos para las pruebas parametrizadas
| Entrada | Resultado esperado |
|---|---|
| `BB.RK-RK.0801.12.07` | válido: BB, RK-RK, 08, 01, 12, 07 |
| `bb.rk-rk.0801.12.07` | válido tras pasar a mayúsculas |
| ` BB.RK-RK.0801.12.07 ` | válido tras recortar |
| `BB. RK-RK .0801.12.07` | válido tras quitar espacios |
| `BB,RK-RK,0801,12,07` | válido tras cambiar comas por puntos |
| `BB.RK-RK.O8O1.l2.O7` | válido: `O→0`, `l→1` en segmentos numéricos |
| `88.RK-RK.0801.12.07` | válido: `8→B` en el segmento de letras |
| `BB.RK_RK.0801.12.07` | válido: `_` → `-` en la ruta |
| `BB.RK-RK.0801.12` | inválido: falta el puerto |
| `BB.RK-RK.0801.12.07.01` | inválido: segmento extra |
| `BB.RK-RK.080.12.07` | inválido: origen/destino de 3 dígitos |
| `BB.RK-RK.0001.12.07` | inválido: rack `00` |
| `BB.RK-RK.0801.00.07` | inválido: posición `00` |
| `XX.RK-RK.0801.12.07` | formato válido pero tipo `XX` inexistente: lo decide el catálogo, no el parser |
| (vacío) / `null` | inválido con mensaje "Escribe o escanea una marquilla" |
| Texto largo basura | inválido; no explota ni se queda lento (límite de largo, por ejemplo 60 caracteres) |

### 3.5 Factory y Strategy
- `LabelParserFactory` recibe `List<LabelParser>` por constructor (Spring la llena sola).
- Si ningún parser `supports` el texto → `InvalidLabelFormatException`.
- Si dos parsers aceptan el mismo texto (posible en v2) → decide por prioridad (`@Order`) y registra un `WARN`.
- Prueba con Mockito: dos parsers simulados, uno que soporta y otro que no.

### 3.6 Formatter y prueba de ida y vuelta
- `BlackBoxRackFormatter.format(parsed)` rellena con ceros a 2 dígitos: `ParsedLabel(BB, RK-RK, 8, 1, 12, 7)` → `BB.RK-RK.0801.12.07`.
- Prueba de propiedad: para cualquier `ParsedLabel` válido, `parse(normalize(format(x))) == x`.
- Caso de borde: números de 3 dígitos (rack 100) no caben en el formato v1; el formatter debe lanzar una excepción clara en vez de generar un código inválido.

### 3.7 Criterio de cierre
La cadena `BB.RK-RK.0801.12.07` produce el `ParsedLabel` esperado, todos los casos de la tabla pasan y la cobertura del módulo supera el 80 %.

---

## 4. Fase 2 — Inventario (esquema, catálogos, importación, alta manual)

### 4.1 Esquema de base de datos (`V2__schema.sql`)
Reglas: toda tabla de negocio lleva `project_id`; claves con **secuencias de incremento 50** (nombre `<tabla>_seq`) para que Hibernate pueda insertar por lotes.

```sql
CREATE SEQUENCE project_seq             START 1 INCREMENT 50;
CREATE SEQUENCE location_type_seq       START 1 INCREMENT 50;
CREATE SEQUENCE equipment_type_seq      START 1 INCREMENT 50;
CREATE SEQUENCE location_seq            START 1 INCREMENT 50;
CREATE SEQUENCE cable_seq               START 1 INCREMENT 50;
CREATE SEQUENCE cable_label_history_seq START 1 INCREMENT 50;
CREATE SEQUENCE scan_history_seq        START 1 INCREMENT 50;
CREATE SEQUENCE import_job_seq          START 1 INCREMENT 50;
CREATE SEQUENCE import_job_error_seq    START 1 INCREMENT 50;

CREATE TABLE project (
  id          BIGINT PRIMARY KEY,
  code        VARCHAR(40)  NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cable_type (code VARCHAR(10) PRIMARY KEY, name VARCHAR(60) NOT NULL);
CREATE TABLE route_type (code VARCHAR(10) PRIMARY KEY, name VARCHAR(60) NOT NULL);

CREATE TABLE location_type (
  id BIGINT PRIMARY KEY, code VARCHAR(30) NOT NULL UNIQUE, name VARCHAR(60) NOT NULL);
CREATE TABLE equipment_type (
  id BIGINT PRIMARY KEY, code VARCHAR(30) NOT NULL UNIQUE, name VARCHAR(60) NOT NULL);

CREATE TABLE location (
  id               BIGINT PRIMARY KEY,
  project_id       BIGINT      NOT NULL REFERENCES project(id),
  location_type_id BIGINT      NOT NULL REFERENCES location_type(id),
  parent_id        BIGINT      REFERENCES location(id),
  code             VARCHAR(20) NOT NULL,
  name             VARCHAR(80) NOT NULL,
  UNIQUE (project_id, location_type_id, code)
);

CREATE TABLE cable (
  id                      BIGINT PRIMARY KEY,
  project_id              BIGINT       NOT NULL REFERENCES project(id),
  code                    VARCHAR(40)  NOT NULL,
  cable_type_code         VARCHAR(10)  NOT NULL REFERENCES cable_type(code),
  route_type_code         VARCHAR(10)  NOT NULL REFERENCES route_type(code),
  origin_location_id      BIGINT       NOT NULL REFERENCES location(id),
  origin_position         INTEGER      NOT NULL CHECK (origin_position > 0),
  destination_location_id BIGINT       NOT NULL REFERENCES location(id),
  destination_port        INTEGER      NOT NULL CHECK (destination_port > 0),
  relabel_pending         BOOLEAN      NOT NULL DEFAULT FALSE,
  notes                   VARCHAR(500),
  version                 BIGINT       NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (project_id, code)
);
CREATE INDEX ix_cable_origin ON cable (project_id, origin_location_id, origin_position);
CREATE INDEX ix_cable_dest   ON cable (project_id, destination_location_id, destination_port);

CREATE TABLE cable_label_history (
  id                BIGINT PRIMARY KEY,
  project_id        BIGINT      NOT NULL REFERENCES project(id),
  cable_id          BIGINT      NOT NULL REFERENCES cable(id),
  old_code          VARCHAR(40) NOT NULL,
  changed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  relabel_confirmed BOOLEAN     NOT NULL DEFAULT FALSE
);
CREATE INDEX ix_label_history_code ON cable_label_history (project_id, old_code);

CREATE TABLE scan_history (
  id           BIGINT PRIMARY KEY,
  project_id   BIGINT      NOT NULL REFERENCES project(id),
  scanned_text VARCHAR(80) NOT NULL,
  status       VARCHAR(20) NOT NULL,      -- FOUND, OUTDATED, NOT_FOUND, INVALID_FORMAT
  cable_id     BIGINT      REFERENCES cable(id),
  scanned_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_scan_history_recent ON scan_history (project_id, scanned_at DESC, id DESC);

CREATE TABLE import_job (
  id          BIGINT PRIMARY KEY,
  project_id  BIGINT       NOT NULL REFERENCES project(id),
  file_name   VARCHAR(255) NOT NULL,
  mode        VARCHAR(20)  NOT NULL,      -- SKIP_EXISTING, UPDATE_EXISTING
  status      VARCHAR(30)  NOT NULL,      -- RUNNING, COMPLETED, COMPLETED_WITH_ERRORS, FAILED
  total_rows  INTEGER NOT NULL DEFAULT 0,
  inserted    INTEGER NOT NULL DEFAULT 0,
  updated     INTEGER NOT NULL DEFAULT 0,
  skipped     INTEGER NOT NULL DEFAULT 0,
  failed      INTEGER NOT NULL DEFAULT 0,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
-- Solo una importación en curso por proyecto
CREATE UNIQUE INDEX ux_import_running ON import_job (project_id) WHERE status = 'RUNNING';

CREATE TABLE import_job_error (
  id            BIGINT PRIMARY KEY,
  import_job_id BIGINT       NOT NULL REFERENCES import_job(id) ON DELETE CASCADE,
  sheet_name    VARCHAR(60)  NOT NULL,
  row_number    INTEGER      NOT NULL,
  column_name   VARCHAR(60),
  message       VARCHAR(300) NOT NULL
);
```

**Casos a cubrir**
- Los códigos son únicos **por proyecto**, no globales (preparación para multi-cliente).
- Borrar una ubicación con cables: debe fallar con 409 y mensaje "Esta ubicación tiene cables asociados".
- Prueba de integración que intente insertar un código duplicado y verifique la violación de unicidad.

### 4.2 Catálogos iniciales (`V3__seed_catalogs.sql`)
- `cable_type`: `BB` → BlackBox. `route_type`: `RK-RK` → Rack a rack.
- `location_type`: Rack, Estudio, Sala de control, Sala de máquinas, Wallbox, Set, Backstage.
- `equipment_type` (biblioteca): BlackBox, Patch panel, Stage box, Consola, Mezclador, Interfaz de audio, Preamplificador, Micrófono, Monitor, Switcher, Cámara, Router de video, Capturadora, Convertidor SDI/HDMI, Switch de red, Router, Servidor, NAS.
- Proyecto por defecto con el código de `DEFAULT_PROJECT_CODE`.
- Datos de desarrollo (racks 1–10 con nombre `Rack #n`) en `db/seed/`, cargados solo con el perfil `dev` (`spring.flyway.locations: classpath:db/migration,classpath:db/seed`).

### 4.3 Dominio, puertos e infraestructura
Módulos `cable`, `location`, `project`:
- **Dominio:** `Cable` (con reglas: origen ≠ destino, posición y puerto > 0), `Location`, `Endpoint`; puertos `CableRepository`, `LocationRepository`, `ProjectContext`.
- **Infraestructura:** entidades JPA separadas del dominio (`CableEntity`), `JpaCableRepository` que implementa el puerto, y mappers con MapStruct. Las entidades no salen por la API.
- **`ProjectContext`:** en la v1 devuelve el proyecto de `DEFAULT_PROJECT_CODE`; en v2 se reemplaza por una implementación que lea el cliente de la petición. Toda consulta recibe el `projectId`.
- **Concurrencia:** `@Version` en `CableEntity` para bloqueo optimista.

### 4.4 Alta manual de un cable faltante
Caso de uso `CreateCableUseCase` (`@LogFeature("crear-cable")`):
1. Datos: tipo de cable, tipo de ruta, ubicación de origen, posición, ubicación de destino, puerto, notas.
2. **La marquilla no se escribe a mano:** la genera `LabelFormatter` a partir de los datos.
3. Validaciones: ubicaciones existentes y del mismo proyecto, posición y puerto > 0, origen distinto de destino, código no duplicado.
4. Endpoint auxiliar `POST /api/v1/cables/code-preview` para mostrar en pantalla "La marquilla será BB.RK-RK.0801.12.07" antes de guardar.

**Casos a cubrir**
- Código duplicado → 409 "Ya existe un cable con la marquilla ...".
- Posición ya ocupada en ese origen por otro cable: **advertencia no bloqueante** ("La posición 12 del Rack #8 ya tiene un cable"); pide confirmación.
- Ubicación inexistente → mensaje claro y enlace para crearla.
- Rack de 3 dígitos o valores que no caben en el formato v1 → mensaje "El formato actual de marquilla solo admite números de dos dígitos".

### 4.5 Importación masiva desde Excel
**Diseño (Template Method):** `AbstractImportUseCase` define el flujo `abrir trabajo → leer → validar → guardar por lotes → cerrar trabajo → reportar`. `ExcelCableImportUseCase` implementa cada paso. Puertos: `InventoryReader` (adaptador con Apache POI) y `CableBulkWriter` (adaptador con `JdbcTemplate` y `INSERT ... ON CONFLICT`).

**Paso a paso**
1. `POST /api/v1/imports` recibe el archivo (`multipart`) y el modo (`SKIP_EXISTING` por defecto o `UPDATE_EXISTING`).
2. Crea el `import_job` en `RUNNING`. El índice único parcial impide dos importaciones simultáneas en el mismo proyecto → 409 "Ya hay una importación en curso".
3. Valida el **archivo** (ver casos).
4. Lee la hoja `Ubicaciones` (si existe) y asegura las ubicaciones; luego la hoja `Cables`.
5. Valida cada **fila** con una cadena de validadores (ver casos).
6. Guarda las filas válidas en lotes de 500, cada lote en su propia transacción.
7. Cierra el trabajo con contadores (`inserted`, `updated`, `skipped`, `failed`) y estado `COMPLETED` o `COMPLETED_WITH_ERRORS`.
8. `GET /api/v1/imports/{id}` devuelve el resumen y `GET /api/v1/imports/{id}/errors.csv` descarga los errores por fila.

**Casos de archivo**
- Extensión distinta de `.xlsx` (`.xls`, `.csv`) → "Sube un archivo Excel .xlsx".
- Archivo vacío, corrupto o protegido con contraseña → mensaje claro, trabajo en `FAILED`.
- Tamaño mayor a `IMPORT_MAX_FILE_SIZE_MB` → 400.
- Verificar que sea un zip real (firma `PK`) y fijar los límites de POI (`ZipSecureFile`) contra archivos que se descomprimen enormes.
- Falta la hoja `Cables` o faltan columnas obligatorias → se aborta antes de procesar filas, indicando qué falta.
- Encabezados con mayúsculas, tildes o espacios distintos → se comparan sin distinguir mayúsculas ni acentos; columnas extra se ignoran.

**Casos de celda y fila**
- **Ceros a la izquierda:** leer todo como texto con `DataFormatter`. Si una celda numérica perdió el cero (`8` en vez de `08`), rellenar a 2 dígitos y registrar una advertencia.
- Filas completamente vacías: se omiten sin contarlas como error.
- Celdas con fórmula: usar el valor calculado; celdas combinadas: advertencia.
- Espacios sobrantes y minúsculas: se normalizan con la misma cadena del paso 3.3.
- El código no cumple el formato → error de fila con el motivo.
- `tipo_cable`/`tipo_ruta` no coinciden con el código → error "La columna tipo_cable dice X pero la marquilla indica Y".
- `origen_codigo`/`destino_codigo`/`posicion_origen`/`puerto_destino` no coinciden con el código → error equivalente.
- Ubicación inexistente en `Ubicaciones` y en la base de datos → error "El Rack #12 no existe" (opción futura: crearla automáticamente).
- Origen igual al destino → error.
- Código repetido dentro del mismo archivo → la segunda aparición es error; la primera se conserva.
- Código ya existente en la base de datos: `SKIP_EXISTING` lo omite y lo cuenta como `skipped`; `UPDATE_EXISTING` lo actualiza (y si cambia el origen o destino, la marquilla coincide por definición, así que solo cambian los demás campos).
- Importar el mismo archivo dos veces no duplica nada (idempotente).

**Rendimiento**
- Para decenas de miles de filas usa lectura en streaming (POI en modo eventos) para no cargar todo en memoria.
- Ejecuta la importación en un hilo aparte (`@Async` con un ejecutor de un solo hilo) y consulta el avance con `GET /api/v1/imports/{id}`.
- Prueba de carga: 50 000 filas deben importarse sin quedarse sin memoria.

**Pruebas:** usa `database/sample-data/inventario_ejemplo.xlsx` (copia en `backend/src/test/resources/fixtures/`). Crea además variantes con errores (`inventario_con_errores.xlsx`) que cubran cada caso de arriba.

### 4.6 Endpoints de inventario
| Método y ruta | Uso |
|---|---|
| `POST /api/v1/imports` | Importar Excel |
| `GET /api/v1/imports`, `GET /api/v1/imports/{id}`, `GET /api/v1/imports/{id}/errors.csv` | Historial y reporte |
| `GET /api/v1/cables?page&size&q&locationId` | Listado paginado y filtrado |
| `POST /api/v1/cables`, `GET /api/v1/cables/{id}` | Alta manual y detalle |
| `POST /api/v1/cables/code-preview` | Vista previa de la marquilla |
| `GET/POST/PUT /api/v1/locations` | Ubicaciones |
| `GET /api/v1/catalogs/location-types`, `/equipment-types` | Biblioteca |

Documenta todo con springdoc y verifica Swagger UI en `/swagger-ui.html`.

**Criterio de cierre:** el Excel de ejemplo se importa con su reporte, las variantes con errores devuelven los errores esperados por fila y se puede crear un cable a mano.

---

## 5. Fase 3 — Búsqueda y escaneos (API)

### 5.1 Caso de uso `SearchCableByLabelUseCase` (`@LogFeature("buscar-cable-por-marquilla")`)
Flujo:
1. Normaliza el texto recibido.
2. Interpreta con `LabelParserFactory`. Si falla → estado `INVALID_FORMAT`.
3. Busca por `(projectId, code)` en `cable`. Si existe → `FOUND`.
4. Si no existe, busca el código en `cable_label_history`. Si existe → `OUTDATED` (devuelve el cable con su código vigente y el aviso).
5. Si tampoco existe → `NOT_FOUND`.
6. En todos los casos publica un `ScanCompletedEvent`.

### 5.2 Respuesta
`POST /api/v1/scans` con `{ "text": "BB.RK-RK.0801.12.07" }`. Se usa `POST` y no `GET /labels/{codigo}` porque el código lleva puntos y algunos filtros de rutas pueden tratar `.07` como extensión.

```json
{
  "status": "FOUND",
  "label": "BB.RK-RK.0801.12.07",
  "equipment": "BlackBox",
  "route": "Rack a rack",
  "start": { "location": "Rack #8", "position": 12 },
  "destination": { "location": "Rack #1", "position": 7 },
  "text": "Equipo: BlackBox\n\nInicio: Rack #8\nPosición: 12\n\nDestino: Rack #1\nPosición: 7",
  "warnings": []
}
```

- `ResultMessageBuilder` arma el campo `text` con las plantillas de `messages_es.properties`; el frontend lo puede mostrar tal cual o armar su propia vista con los campos.
- El nombre amigable sale del catálogo (`location.name` = `Rack #8`). La posición y el puerto se muestran sin ceros a la izquierda.
- Códigos HTTP: `FOUND` y `OUTDATED` → 200; `NOT_FOUND` → 404; `INVALID_FORMAT` → 422. En todos se devuelve el mensaje amigable en `detail`.
- Construye el resultado con **Builder** (`CableLocationResult`).

### 5.3 Historial de 10 escaneos
- Un listener (`@EventListener` + `@Transactional(REQUIRES_NEW)`) guarda el escaneo. Si falla, registra un `WARN` pero **no rompe la búsqueda**.
- Tras insertar, recorta el historial:
  ```sql
  DELETE FROM scan_history
  WHERE project_id = :projectId
    AND id NOT IN (
      SELECT id FROM scan_history
      WHERE project_id = :projectId
      ORDER BY scanned_at DESC, id DESC
      LIMIT :max);   -- app.scan-history-max-items = 10
  ```
- `GET /api/v1/scans` devuelve los últimos 10, del más reciente al más antiguo.

**Casos a cubrir**
- Dos escaneos casi simultáneos: el `DELETE` deja siempre 10 como máximo.
- Texto con formato inválido: también se guarda en el historial con estado `INVALID_FORMAT`.
- Texto vacío o solo espacios → 400 (no se guarda).
- El mismo código escaneado dos veces seguidas: cuenta como dos registros (decisión simple de la v1).
- Marquilla antigua: la respuesta incluye el código vigente y la advertencia.
- Cable cuyo origen o destino fue borrado/cambiado: la respuesta siempre refleja el estado actual.
- Pruebas: Mockito para el caso de uso (repositorios simulados), `MockMvc` para el controlador y Testcontainers para el recorte del historial.

**Criterio de cierre:** con `curl` o Swagger se busca `BB.RK-RK.0801.12.07` y devuelve el resultado esperado; los demás estados responden con su mensaje; el historial nunca pasa de 10.

---

## 6. Fase 4 — Frontend y escaneo por foto

### 6.1 Crear el proyecto Angular
```bash
cd frontend
ng new etiquetas --directory . --routing --style=scss --skip-git
ng add @angular/pwa
```
Respeta la estructura `src/app/{core,shared,features/{scan,cables,locations,import,history}}`. Usa componentes standalone, rutas con carga perezosa por funcionalidad y `strict` activado.

### 6.2 Principios en el frontend
- Componentes "tontos" (presentación) y servicios con la lógica; nada de lógica de negocio en las plantillas.
- Una clase abstracta o interfaz por capacidad: `OcrEngine`, `CameraService`, `ImagePreprocessor`, y se enlazan por inyección (`{ provide: OcrEngine, useClass: TesseractOcrEngine }`).
- Todos los textos de pantalla en `assets/i18n/es.json` (o constantes), no dispersos en HTML.
- Estado simple con *signals* o servicios con `BehaviorSubject`; no agregues librerías de estado que no necesites.

### 6.3 Configuración local
- `proxy.conf.json` para que `/api` apunte a `http://localhost:8080` (así no necesitas CORS en desarrollo). En el backend deja una configuración CORS restrictiva solo para el origen del frontend.
- **La cámara exige contexto seguro (HTTPS o `localhost`).** Opciones para probar en el celular:
  1. Android + USB: activa la depuración, ejecuta `adb reverse tcp:4200 tcp:4200` y abre `http://localhost:4200` en el celular (cuenta como seguro).
  2. HTTPS en red local: certificado local con `mkcert` y `ng serve --host 0.0.0.0 --ssl --ssl-cert ... --ssl-key ...`.
  3. Un túnel HTTPS temporal (solo para demos).
- Archivo `environments/environment.ts` con `apiBaseUrl`, `historyMaxItems` (10) y banderas de funcionalidades.

### 6.4 Núcleo (`core`)
- `ApiClient` (envoltorio de `HttpClient`) con tipos para cada endpoint.
- `ErrorInterceptor`: convierte `ProblemDetail` en mensajes amigables y los muestra con un componente de aviso; maneja sin conexión, 404, 409, 422 y 500.
- `LoggerService`: imprime en consola con el mismo formato del backend y envía eventos relevantes a `POST /api/v1/client-logs`. Reglas: nunca enviar imágenes ni datos personales, limitar el tamaño del mensaje, agrupar y limitar la frecuencia, y que un fallo del envío nunca rompa la pantalla.
- En el backend, `client-logs` escribe por el mismo Logback con `module=frontend`, valida el tamaño y descarta el exceso.

### 6.5 Cámara sin guardar la foto
**Importante:** no uses `<input type="file" capture>`: el sistema operativo puede guardar la foto en la galería. Usa `getUserMedia` y captura el fotograma en un `canvas` en memoria.

```ts
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
  audio: false,
});
```
- `<video autoplay playsinline muted>` (en iPhone, `playsinline` es obligatorio).
- Captura: dibuja el fotograma del `<video>` en un `<canvas>`, recorta la zona de la guía de encuadre y trabaja ahí. No generes archivos ni subas la imagen.
- Al terminar: `stream.getTracks().forEach(t => t.stop())`, liberar el canvas y `URL.revokeObjectURL` si se usó.

**Casos a cubrir**
- Permiso denegado (`NotAllowedError`) → mensaje con instrucciones y botón "Escribir la marquilla a mano".
- Sin cámara (`NotFoundError`), cámara ocupada (`NotReadableError`) o restricciones no satisfechas (`OverconstrainedError`) → reintentar con restricciones más simples y, si no, ofrecer la entrada manual.
- Pantalla girada: recalcular el recorte al cambiar la orientación.
- Cambio de pestaña o de aplicación: detener la cámara (`visibilitychange`) y reanudar al volver.
- Salir de la pantalla: detener la cámara y cancelar el OCR en curso (`ngOnDestroy`).
- Linterna/flash (`track.applyConstraints({ advanced: [{ torch: true }] })`): solo mostrar el botón si el dispositivo lo soporta.

### 6.6 Preprocesado de imagen (Chain of Responsibility)
Interfaz `ImageStep { apply(canvas: HTMLCanvasElement): HTMLCanvasElement }` y pasos combinables:
1. `CropStep` (zona de la guía de encuadre).
2. `UpscaleStep` (ampliar ×2 si el texto es pequeño; el alto de las letras debería quedar en unos 30–40 px o más).
3. `GrayscaleStep`.
4. `ContrastStep` (estiramiento de histograma).
5. `OtsuThresholdStep` (binarización automática).
6. `DeskewStep` (opcional: enderezar si la marquilla está inclinada, como en la foto de referencia).

**Casos:** poca luz (subir contraste antes de binarizar), brillo/reflejo sobre el plástico (probar también con umbral adaptativo), marquilla curva, letras muy pequeñas. Cada paso se prueba solo con imágenes de ejemplo.

### 6.7 OCR con Tesseract.js
- `OcrEngine` (abstracta) con `recognize(canvas): Promise<OcrResult>` y `dispose()`; `OcrResult = { text, confidence }`.
- `TesseractOcrEngine` crea **un solo worker** reutilizable y lo termina al destruir el servicio.
- Parámetros: lista blanca `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-` y modo de una sola línea (`tessedit_pageseg_mode: 7`).
- Verifica que la lista blanca se respete con la versión del núcleo que uses; si no, filtra los caracteres en el post-proceso.
- **Funciona sin internet:** copia los archivos del idioma (`eng.traineddata`), el núcleo WASM y el worker a `src/assets/tesseract/` (declarados en `angular.json`) y configura `langPath`, `corePath` y `workerPath` hacia ahí. El service worker los cachea.
- Estrategia de intentos: leer la imagen preprocesada; si el resultado no valida contra el formato, reintentar con la imagen invertida o con otro umbral; elegir primero la que valide y, si ninguna, la de mayor confianza.
- Post-proceso: aplicar la misma limpieza que el backend (mayúsculas, espacios, separadores).

**Casos a cubrir**
- Primera carga lenta (archivos de idioma grandes): mostrar progreso "Preparando lector...".
- Dispositivo lento: el OCR corre en un Web Worker para no congelar la pantalla; mostrar "Leyendo...".
- Resultado vacío o muy corto: "No pudimos leer la marquilla. Acércate un poco y evita reflejos."
- Confianza baja: resaltar el cuadro de texto para que la persona lo revise.

### 6.8 Pantalla de escaneo (`features/scan`)
Estados: `inactivo → camara → capturado → leyendo → texto → buscando → resultado | error`.

1. Botón principal "Escanear marquilla": abre la cámara con un marco guía.
2. Botón "Tomar foto": captura, muestra la vista previa y lanza el OCR. Botones "Repetir" y "Girar".
3. El texto leído aparece en un **cuadro de texto editable** (mayúsculas automáticas, `autocomplete="off"`, `spellcheck="false"`).
4. Indicador de validez en vivo (llama a `POST /api/v1/labels/validate` con un retardo de 300 ms, o usa un chequeo local) y, si falta algo, un mensaje como "Faltan el puerto y la posición".
5. Botón "Buscar" (también con Enter). Se desactiva mientras busca para evitar dobles envíos.
6. Resultado en una tarjeta con el formato:
   ```
   Equipo: BlackBox

   Inicio: Rack #8
   Posición: 12

   Destino: Rack #1
   Posición: 7
   ```
   Con la marquilla en una línea secundaria, botones "Copiar" y "Escanear otra".
7. Debajo, el historial de los últimos 10 (tocar uno repite la búsqueda).

**Casos a cubrir**
- Se puede escribir la marquilla sin usar la cámara.
- Editar el texto después de buscar limpia el resultado anterior.
- Aviso de marquilla antigua con el código vigente y resaltado.
- Cable no encontrado: botón "Agregar este cable al inventario" que lleva al alta manual con los datos ya interpretados.
- Error de red: mensaje amigable y botón "Reintentar"; conservar el texto escrito.
- Accesibilidad: botones grandes para usar con una mano, contraste alto, etiquetas para lectores de pantalla.

### 6.9 Otras pantallas
- **Cables:** listado paginado con búsqueda y filtro por ubicación, detalle y alta manual (con vista previa de la marquilla).
- **Ubicaciones:** listado y alta/edición con tipo de ubicación (biblioteca).
- **Importación:** subir el Excel, elegir modo, ver el avance y el reporte de errores descargable.
- **Historial:** los últimos 10 escaneos.

### 6.10 PWA
- `manifest.webmanifest` con nombre "Etiquetas", íconos (192 y 512 px, versión *maskable*) y `display: standalone`.
- Service worker (el de `@angular/pwa`): cachear el *app shell* y los archivos de Tesseract; las llamadas `/api` van siempre a la red.
- Aviso de nueva versión disponible (`SwUpdate`).
- Probar la instalación en Android (Chrome) e iPhone (Safari, "Añadir a pantalla de inicio") y la cámara dentro de la app instalada.

### 6.11 Pruebas del frontend
- Unitarias de servicios (`ApiClient`, normalización, pasos de preprocesado) y componentes con dobles de `OcrEngine` y `CameraService`.
- E2E con Playwright. Para simular la cámara usa Chromium con:
  `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-video-capture=fixtures/marquilla.y4m`
  y el permiso `camera`. Flujo: abrir cámara → capturar → texto editable → corregir → buscar → ver el resultado.

**Criterio de cierre:** desde un celular real se toma la foto de la marquilla de referencia, el texto aparece en el cuadro editable, se corrige si hace falta y el resultado se muestra en el formato pedido, sin guardar la foto.

---

## 7. Fase 5 — Edición de cables e historial

### 7.1 Editar origen y destino (`UpdateCableUseCase`, `@LogFeature("editar-cable")`)
Datos editables: ubicación de origen, posición, ubicación de destino, puerto y notas. El tipo de cable y de ruta **no** se editan.

Flujo en una sola transacción:
1. Cargar el cable y comparar la versión (`version`) enviada con la guardada.
2. Si no cambió nada relevante → responder sin tocar nada.
3. Generar la marquilla nueva con `LabelFormatter`.
4. Verificar que el código nuevo no exista en `cable` del proyecto → si existe, 409.
5. Verificar que el código nuevo no esté en `cable_label_history` de **otro** cable con `relabel_confirmed = false` (esa marquilla física vieja sigue en la calle y se confundiría) → 409 con explicación.
6. Guardar el código anterior en `cable_label_history`.
7. Actualizar el cable, marcarlo `relabel_pending = true` y publicar el evento.

**Casos a cubrir**
- Dos personas editan a la vez → el segundo recibe 409 "Otra persona modificó este cable. Actualiza la pantalla e inténtalo de nuevo".
- Editar y volver a dejar los valores originales: el código vuelve al anterior; el historial conserva ambos movimientos y el cable queda consistente.
- Cambiar solo las notas: no cambia la marquilla ni se marca para re-etiquetar.
- Origen igual al destino → error.
- Valores fuera del formato v1 (3 dígitos) → mensaje claro.
- Si falla cualquier paso, nada se guarda (transacción).

### 7.2 Re-etiquetado
- Lista "Pendientes de re-etiquetar" con el código anterior y el nuevo.
- `POST /api/v1/cables/{id}/relabel-confirmation`: el técnico confirma que cambió la marquilla física; se limpia `relabel_pending` y se marca `relabel_confirmed = true` en el historial de ese cable.
- Mientras esté pendiente, el resultado de búsqueda muestra un aviso: "Esta marquilla fue actualizada recientemente; revisa que la etiqueta física sea la nueva".

### 7.3 Pantalla de edición
- Formulario con selectores de ubicación (catálogo) y campos numéricos.
- **Vista previa en vivo** de la nueva marquilla ("Pasará de BB.RK-RK.0801.12.07 a BB.RK-RK.0501.12.07").
- Diálogo de confirmación antes de guardar, indicando que habrá que cambiar la marquilla física.

### 7.4 Historial
Ya funciona desde la fase 3; aquí se revisa la interfaz (últimos 10, tocar para repetir) y se verifica el recorte con pruebas de integración.

**Criterio de cierre:** editar un destino cambia la marquilla, la marquilla vieja avisa el código vigente y el listado de pendientes funciona.

---

## 8. Fase 6 — Cámara en vivo

Se construye **solo cuando la foto ya es confiable**.

1. Botón "Cámara en vivo" que abre el video con el marco guía y un indicador de lectura.
2. Bucle de análisis con `requestVideoFrameCallback` (si no existe, `setInterval`), a 2–4 cuadros por segundo.
3. **Contrapresión:** si el worker de OCR sigue ocupado, se salta el cuadro (nunca se acumulan).
4. Descartar cuadros borrosos con una medida de nitidez (varianza del Laplaciano) antes de enviarlos al OCR.
5. **Confirmación por votación:** se acepta un código cuando el **mismo código válido** aparece en 3 cuadros seguidos (configurable).
6. Al aceptar: detener el bucle, vibrar si el dispositivo lo permite (`navigator.vibrate` no existe en iPhone), mostrar el texto en el cuadro editable y esperar el "Buscar" de la persona.
7. Tiempo máximo (por ejemplo 30 s) y botón "Tomar foto" como alternativa.

**Casos a cubrir**
- Varias marquillas en el cuadro: elegir la que valide contra el formato con mayor confianza, o pedir que se acerque a una.
- Consumo de batería y calor: pausar con la pestaña oculta, bajar la frecuencia si el procesamiento se retrasa.
- Lecturas que cambian de un cuadro a otro: la votación evita falsos positivos.
- Dispositivos sin `requestVideoFrameCallback`: alternativa con temporizador.
- Prueba E2E con video falso que contenga la marquilla.

---

## 9. Fase 7 — Cierre de la v1

### 9.1 Medir la precisión del OCR
- Reúne al menos 50 fotos reales de marquillas (distinta luz, ángulo, distancia, reflejos) en una carpeta de pruebas, con su texto correcto en un CSV.
- Script que corra el lector sobre todas y calcule: lecturas exactas, lecturas corregibles con una edición y fallos.
- Meta sugerida: ≥ 90 % de lecturas exactas o con una sola corrección. Ajusta preprocesado, umbrales y guía de encuadre hasta lograrla.

### 9.2 Pruebas y calidad
- E2E completos: foto → editar → buscar; importación; alta manual; edición con cambio de marquilla.
- Rendimiento: búsqueda por código < 200 ms con 100 000 cables (índice `UNIQUE (project_id, code)`); importación de 50 000 filas.
- Revisar cobertura (≥ 80 % en `domain` y `application`) y análisis estático.

### 9.3 Seguridad básica (sin login)
- Validar tamaño y tipo de todo lo que entra (archivos, JSON, `client-logs`).
- CORS restrictivo, cabeceras de seguridad y política CSP en el servidor web del frontend.
- Sin trazas de error ni datos internos en las respuestas; secretos solo en variables de entorno.
- Auditar dependencias (`mvn dependency-check` o similar y `npm audit`).
- Recordar que sin login cualquiera con acceso a la red puede modificar el inventario: desplegar detrás de una red privada o VPN hasta que llegue el login.

### 9.4 Contenedores y copias de seguridad
- `docker/backend.Dockerfile` (compilación con Maven y ejecución en un JRE ligero) y `docker/frontend.Dockerfile` (compilación con Node y servido con Nginx, con proxy a `/api`).
- `docker-compose.yml` completo con base de datos, backend y frontend, y chequeos de salud.
- `scripts/backup-db.sh` con `pg_dump` y prueba de restauración.

### 9.5 Documentación
- `README.md` en la raíz: qué es, cómo arrancar, variables de entorno.
- `docs/architecture`: diagrama de módulos y de flujo de escaneo.
- `docs/adr`: decisiones (arquitectura hexagonal, PostgreSQL, OCR en el navegador, regeneración de la marquilla al editar, historial de 10).
- `docs/manuals`: manual del técnico (cómo escanear, qué hacer si no lee) y manual de importación.
- `docs/api`: exportar el OpenAPI.

### 9.6 Demo y versión
- Guion de demo: importar el Excel → escanear la marquilla de referencia → corregir un carácter → buscar → editar un destino → ver el aviso de marquilla antigua.
- Etiqueta `v1.0.0` en Git y entrada final en `REQUESTS_LOG.md`.
- Después de la demo se decide el despliegue (tema pendiente).

---

## 10. Matriz de casos de prueba

| Módulo | Caso | Resultado esperado |
|---|---|---|
| Parser | Formato válido, minúsculas, espacios, comas | Se interpreta tras normalizar |
| Parser | `O`/`0`, `I`/`1` mezclados por segmento | Se corrigen según el tipo de segmento |
| Parser | Segmentos faltantes o sobrantes | `INVALID_FORMAT` con mensaje amigable |
| Formatter | Ida y vuelta | `parse(format(x)) == x` |
| Formatter | Número de 3 dígitos | Error claro |
| Importación | Archivo no `.xlsx`, vacío, corrupto, grande | Rechazo con mensaje claro |
| Importación | Falta hoja o columna | Se aborta indicando qué falta |
| Importación | Ceros perdidos (`8` por `08`) | Se corrige con advertencia |
| Importación | Código duplicado en el archivo / en la base | Error de fila / omitido o actualizado según el modo |
| Importación | Columnas que contradicen el código | Error de fila |
| Importación | Ubicación inexistente | Error de fila |
| Importación | Dos importaciones simultáneas | 409 en la segunda |
| Importación | Mismo archivo dos veces | Sin duplicados |
| Alta manual | Duplicado, origen = destino, ubicación inexistente | Errores claros |
| Búsqueda | Cable existente | `FOUND` con el formato pedido |
| Búsqueda | Código inexistente | 404 con mensaje amigable |
| Búsqueda | Marquilla antigua | `OUTDATED` con código vigente |
| Búsqueda | Texto vacío | 400 |
| Historial | 11.º escaneo | Elimina el más antiguo; máximo 10 |
| Historial | Fallo al guardar el historial | La búsqueda igual responde |
| Edición | Cambio de origen/destino | Marquilla nueva y código viejo guardado |
| Edición | Código nuevo ya existente | 409 |
| Edición | Código nuevo igual a una marquilla vieja sin confirmar | 409 |
| Edición | Edición simultánea | 409 por versión |
| Edición | Solo notas | Marquilla intacta |
| Cámara | Permiso denegado / sin cámara / ocupada | Entrada manual disponible |
| Cámara | Salir de la pantalla | Cámara apagada y OCR cancelado |
| OCR | Poca luz, reflejo, inclinación | Lectura editable; confianza baja resaltada |
| Logs | Cualquier funcionalidad | `INICIO` y `FIN` en consola y archivo |
| Logs | Falla | `FIN CON ERROR` con la causa |
| Registro | Cualquier cambio de código | Entrada en `REQUESTS_LOG.md` |

---

## 11. Checklist final de la v1

- [ ] El flujo foto → texto editable → búsqueda funciona en un celular real y la foto no se guarda.
- [ ] El resultado se muestra como `Equipo / Inicio / Destino` con nombres amigables.
- [ ] Importación de Excel con reporte de errores y alta manual operativas.
- [ ] Editar origen o destino regenera la marquilla y conserva la anterior.
- [ ] Historial limitado a 10 escaneos.
- [ ] Cámara en vivo disponible como opción.
- [ ] Cada funcionalidad escribe log en consola y en `logs/`.
- [ ] `REQUESTS_LOG.md` al día.
- [ ] Cobertura ≥ 80 % en `domain` y `application`, y CI en verde.
- [ ] Documentación y manuales listos; demo ensayada; etiqueta `v1.0.0`.
