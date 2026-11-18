package com.etiquetas.cables.cable.application.usecase;

import com.etiquetas.cables.cable.application.dto.CableSearchResponse;

public interface SearchCableUseCase {

    CableSearchResponse search(String rawCode);
}
