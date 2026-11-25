import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile

from .engine import OcrEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")
log = logging.getLogger("ocr.api")

engine: OcrEngine | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global engine
    engine = OcrEngine()
    engine.warm_up()
    yield


app = FastAPI(title="Servicio OCR de marquillas", lifespan=lifespan)


@app.get("/health")
def health() -> dict:
    return {"status": "ok" if engine else "starting"}


@app.post("/ocr")
def ocr(file: UploadFile = File(...)) -> dict:
    """Contrato estable: {lines: [{text, score}], elapsedMs}. El backend no conoce el formato de Paddle."""
    if engine is None:
        raise HTTPException(status_code=503, detail="Motor OCR iniciando")
    try:
        lines, elapsed_ms = engine.read(file.file.read())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    log.info("OCR | %d líneas | %d ms", len(lines), elapsed_ms)
    return {"lines": lines, "elapsedMs": elapsed_ms}
