package com.etiquetas.cables.cable.domain.model;

import java.util.List;
import java.util.Optional;

public record CableSearchResult(
        String query,
        String normalizedQuery,
        Optional<Cable> exact,
        List<CableCandidate> candidates) {

    public CableSearchResult {
        candidates = List.copyOf(candidates);
    }
}
