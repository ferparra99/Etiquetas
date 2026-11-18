package com.etiquetas.cables.scan.application.usecase;

import com.etiquetas.cables.scan.application.dto.ScanResponse;

public interface ScanLabelUseCase {

    ScanResponse scan(byte[] image, String filename);
}
