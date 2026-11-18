"""Se ejecuta al construir la imagen: descarga los modelos para que no se bajen en cada arranque."""
from paddleocr import PaddleOCR

from .config import build_engine_kwargs

PaddleOCR(**build_engine_kwargs())
