# ADR-001 — PaddleOCR como servicio Python detrás del puerto `OcrEngine`

**Estado:** propuesta (prototipo)

## Contexto
Tesseract.js en el navegador dio resultados inferiores a PaddleOCR (PP-OCRv5 mobile) en las pruebas con marquillas reales. PaddleOCR es una librería Python; el backend del proyecto es Java/Spring Boot.

## Decisión
- El OCR corre en un servicio Python pequeño (FastAPI) con un contrato propio: `POST /ocr` → `{lines:[{text,score}], elapsedMs}`.
- Spring Boot lo consume mediante el puerto `OcrEngine` y el adaptador `PaddleOcrHttpAdapter` (patrón Adapter).
- La foto se procesa en memoria y **no se guarda**; viaja al servidor (red local en las pruebas).
- Tras el OCR, el código se valida contra el inventario (conjunto cerrado) y se proponen candidatos parecidos.

## Consecuencias
- (+) Misma precisión que el prototipo; el dominio sigue en Java; el motor es intercambiable.
- (+) Los presets se ajustan por variables de entorno sin tocar código.
- (−) Un contenedor más y la foto sale del celular hacia el servidor.
- Alternativa evaluada y pospuesta: PaddleOCR.js en el navegador (la foto no sale del dispositivo, pero es un SDK 0.x y exige cabeceras COOP/COEP para hilos).
