package com.etiquetas.cables.scan.application.usecase;

import com.etiquetas.cables.scan.application.dto.ScanResponse;
import com.etiquetas.cables.scan.application.mapper.ScanResponseMapper;
import com.etiquetas.cables.scan.domain.exception.InvalidImageException;
import com.etiquetas.cables.scan.domain.port.OcrEngine;
import com.etiquetas.cables.shared.logging.LogFeature;
import org.springframework.stereotype.Service;

@Service
public class ScanLabelService implements ScanLabelUseCase {

    private final OcrEngine ocrEngine;

    public ScanLabelService(OcrEngine ocrEngine) {
        this.ocrEngine = ocrEngine;
    }

    @Override
    @LogFeature("scan.label")
    public ScanResponse scan(byte[] image, String filename) {
        if (image == null || image.length == 0) {
            throw new InvalidImageException("La imagen está vacía");
        }
        return ScanResponseMapper.toResponse(ocrEngine.recognize(image, filename));
    }
}
