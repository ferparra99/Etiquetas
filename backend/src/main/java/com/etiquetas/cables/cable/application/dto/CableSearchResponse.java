package com.etiquetas.cables.cable.application.dto;

import java.util.List;

public record CableSearchResponse(
        String query,
        String normalizedQuery,
        CableDto exact,
        List<CandidateDto> candidates) {

    public record CableDto(
            String code,
            String cableType,
            String originLocation,
            String originDetail,
            String destinationLocation,
            String destinationDetail) {
    }

    public record CandidateDto(CableDto cable, double similarity) {
    }
}
