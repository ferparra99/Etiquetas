"""Adaptador sobre PaddleOCR: expone solo lo que el backend necesita."""
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
        self._predict(blank)
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
            results = self._ocr.predict(image)
        lines: list[dict] = []
        for res in results:
            data = res["res"] if "res" in res else res
            for text, score in zip(data["rec_texts"], data["rec_scores"]):
                lines.append({"text": text, "score": round(float(score), 4)})
        return lines
