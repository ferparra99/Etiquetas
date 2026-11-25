"""Adaptador sobre PaddleOCR 2.x: expone solo lo que el backend necesita."""

import logging
import threading
import time

import cv2
import numpy as np
from paddleocr import PaddleOCR

from .config import build_engine_kwargs

log = logging.getLogger("ocr.engine")


class OcrEngine:
    def __init__(self) -> None:
        kwargs = build_engine_kwargs()
        log.info("Cargando PaddleOCR con: %s", kwargs)
        self._ocr = PaddleOCR(**kwargs)
        self._lock = threading.Lock()  # una inferencia a la vez por instancia

    def warm_up(self) -> None:
        blank = np.full((64, 256, 3), 255, dtype=np.uint8)
        try:
            self._predict(blank)
        except Exception:
            log.exception("Fallo en el warm-up (se ignora)")
        log.info("Motor OCR calentado")

    def read(self, image_bytes: bytes) -> tuple[list[dict], int]:
        image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Imagen inválida")
        started = time.perf_counter()
        lines = self._predict(image)
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        return lines, elapsed_ms

    def _predict(self, image: np.ndarray) -> list[dict]:
        with self._lock:
            results = self._ocr.ocr(image, cls=True)
        lines: list[dict] = []
        for page in results or []:
            for item in page or []:
                if not item or len(item) < 2:
                    continue
                text_score = item[1]
                if not text_score:
                    continue
                text, score = text_score[0], text_score[1]
                lines.append({"text": text, "score": round(float(score), 4)})
        return lines
