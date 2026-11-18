package com.etiquetas.cables.cable.application.mapper;

import com.etiquetas.cables.cable.application.dto.CableSearchResponse;
import com.etiquetas.cables.cable.application.dto.CableSearchResponse.CableDto;
import com.etiquetas.cables.cable.application.dto.CableSearchResponse.CandidateDto;
import com.etiquetas.cables.cable.domain.model.Cable;
import com.etiquetas.cables.cable.domain.model.CableSearchResult;

public final class CableMapper {

    private CableMapper() {
    }

    public static CableSearchResponse toResponse(CableSearchResult result) {
        var candidates = result.candidates().stream()
                .map(c -> new CandidateDto(toDto(c.cable()), c.similarity()))
                .toList();
        return new CableSearchResponse(
                result.query(), result.normalizedQuery(), result.exact().map(CableMapper::toDto).orElse(null), candidates);
    }

    private static CableDto toDto(Cable cable) {
        return new CableDto(
                cable.code(),
                cable.cableType(),
                cable.originLocation(),
                cable.originDetail(),
                cable.destinationLocation(),
                cable.destinationDetail());
    }
}
