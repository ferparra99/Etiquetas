package com.etiquetas.cables.scan.domain.port;

import com.etiquetas.cables.scan.domain.model.OcrResult;

/** Puerto: hoy lo implementa el servicio PaddleOCR; mañana puede ser otro motor. */
public interface OcrEngine {

    OcrResult recognize(byte[] image, String filename);
}
