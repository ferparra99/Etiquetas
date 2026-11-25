"""Configuración del motor OCR (PaddleOCR 2.x). Todo se ajusta por variables de entorno."""

import os
from typing import Any


def _env_bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "si")


def build_engine_kwargs() -> dict[str, Any]:
    """Parámetros de PaddleOCR 2.x. Solo se envían los opcionales si están definidos."""
    kwargs: dict[str, Any] = {
        "use_angle_cls": _env_bool("OCR_USE_ANGLE_CLS", True),
        "lang": os.getenv("OCR_LANG", "en"),
        "ocr_version": os.getenv("OCR_VERSION", "PP-OCRv4"),
        "show_log": False,
    }
    optional = {
        "OCR_DET_LIMIT_SIDE_LEN": ("det_limit_side_len", int),
        "OCR_DET_LIMIT_TYPE": ("det_limit_type", str),
        "OCR_DET_THRESH": ("det_db_thresh", float),
        "OCR_DET_BOX_THRESH": ("det_db_box_thresh", float),
        "OCR_DET_UNCLIP_RATIO": ("det_db_unclip_ratio", float),
        "OCR_REC_SCORE_THRESH": ("drop_score", float),
    }
    for env_name, (param, cast) in optional.items():
        raw = os.getenv(env_name)
        if raw:
            kwargs[param] = cast(raw)
    return kwargs
