package com.etiquetas.cables.scan.domain.model;

import java.util.List;
import java.util.stream.Collectors;

public record OcrResult(List<OcrLine> lines, long elapsedMs) {

    public OcrResult {
        lines = List.copyOf(lines);
    }

    public String joinedText() {
        return lines.stream().map(OcrLine::text).filter(t -> !t.isBlank()).collect(Collectors.joining(" "));
    }
}
