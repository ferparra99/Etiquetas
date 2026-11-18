package com.etiquetas.cables.scan.application.dto;

import java.util.List;

public record ScanResponse(String text, List<LineDto> lines, long elapsedMs) {

    public record LineDto(String text, double score) {
    }
}
