package com.etiquetas.cables.scan.domain.model;

public record OcrLine(String text, double score) {

    public OcrLine {
        text = text == null ? "" : text.trim();
    }
}
