"""Configuración del motor OCR. Todo se ajusta por variables de entorno (ver docker-compose.yml)."""
import os
from typing import Any


def _env_bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "si")


def build_engine_kwargs() -> dict[str, Any]:
    """Presets del prototipo de Gradio + parámetros opcionales (solo se envían si se definen)."""
    kwargs: dict[str, Any] = {
        "text_detection_model_name": os.getenv("OCR_DET_MODEL", "PP-OCRv5_mobile_det"),
        "text_recognition_model_name": os.getenv("OCR_REC_MODEL", "PP-OCRv5_mobile_rec"),
        "use_doc_orientation_classify": _env_bool("OCR_DOC_ORIENTATION", False),
        "use_doc_unwarping": _env_bool("OCR_DOC_UNWARPING", False),
        "use_textline_orientation": _env_bool("OCR_TEXTLINE_ORIENTATION", True),
    }
    mkldnn = os.getenv("OCR_ENABLE_MKLDNN")
    if mkldnn:  # plan B si oneDNN falla en tu CPU: OCR_ENABLE_MKLDNN=false
        kwargs["enable_mkldnn"] = mkldnn.strip().lower() in ("1", "true", "yes", "si")
    optional = {
        "OCR_DET_LIMIT_SIDE_LEN": ("text_det_limit_side_len", int),
        "OCR_DET_LIMIT_TYPE": ("text_det_limit_type", str),
        "OCR_DET_THRESH": ("text_det_thresh", float),
        "OCR_DET_BOX_THRESH": ("text_det_box_thresh", float),
        "OCR_DET_UNCLIP_RATIO": ("text_det_unclip_ratio", float),
        "OCR_REC_SCORE_THRESH": ("text_rec_score_thresh", float),
    }
    for env_name, (param, cast) in optional.items():
        raw = os.getenv(env_name)
        if raw:
            kwargs[param] = cast(raw)
    return kwargs
