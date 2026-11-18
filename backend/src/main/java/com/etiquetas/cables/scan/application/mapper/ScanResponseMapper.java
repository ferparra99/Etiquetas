package com.etiquetas.cables.scan.application.mapper;

import com.etiquetas.cables.scan.application.dto.ScanResponse;
import com.etiquetas.cables.scan.domain.model.OcrResult;

public final class ScanResponseMapper {

    private ScanResponseMapper() {
    }

    public static ScanResponse toResponse(OcrResult result) {
        var lines = result.lines().stream()
                .map(line -> new ScanResponse.LineDto(line.text(), line.score()))
                .toList();
        return new ScanResponse(result.joinedText(), lines, result.elapsedMs());
    }
}
