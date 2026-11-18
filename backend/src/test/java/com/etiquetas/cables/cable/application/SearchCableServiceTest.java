package com.etiquetas.cables.cable.application;

import static com.etiquetas.cables.shared.constants.ProjectConstants.DEFAULT_PROJECT_ID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.etiquetas.cables.cable.application.dto.CableSearchResponse;
import com.etiquetas.cables.cable.application.usecase.SearchCableService;
import com.etiquetas.cables.cable.domain.exception.InvalidSearchException;
import com.etiquetas.cables.cable.domain.model.Cable;
import com.etiquetas.cables.cable.domain.port.CableRepository;
import com.etiquetas.cables.cable.domain.service.CollapseSpacesNormalizer;
import com.etiquetas.cables.cable.domain.service.LevenshteinSimilarity;
import com.etiquetas.cables.cable.domain.service.TextNormalizationChain;
import com.etiquetas.cables.cable.domain.service.UppercaseNormalizer;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SearchCableServiceTest {

    private static final String CODE = "V07206 VJF B06";

    @Mock
    private CableRepository repository;

    private SearchCableService service;

    @BeforeEach
    void setUp() {
        var normalizer = new TextNormalizationChain(List.of(new UppercaseNormalizer(), new CollapseSpacesNormalizer()));
        service = new SearchCableService(repository, normalizer, new LevenshteinSimilarity());
    }

    @Test
    void returnsExactMatchAfterNormalizing() {
        when(repository.findByCode(DEFAULT_PROJECT_ID, CODE)).thenReturn(Optional.of(cable(CODE)));

        CableSearchResponse response = service.search("  v07206  vjf b06 ");

        assertThat(response.exact()).isNotNull();
        assertThat(response.exact().code()).isEqualTo(CODE);
        assertThat(response.candidates()).isEmpty();
    }

    @Test
    void suggestsClosestCodeWhenOcrConfusesCharacters() {
        when(repository.findByCode(DEFAULT_PROJECT_ID, "VO7206 VJF B06")).thenReturn(Optional.empty());
        when(repository.findAll(DEFAULT_PROJECT_ID)).thenReturn(List.of(cable(CODE), cable("ZZZZZZ")));

        CableSearchResponse response = service.search("VO7206 VJF B06");

        assertThat(response.exact()).isNull();
        assertThat(response.candidates()).hasSize(1);
        assertThat(response.candidates().get(0).cable().code()).isEqualTo(CODE);
    }

    @Test
    void rejectsBlankCode() {
        assertThatThrownBy(() -> service.search("   ")).isInstanceOf(InvalidSearchException.class);
    }

    private static Cable cable(String code) {
        return new Cable(1L, code, "Ejemplo", "Estudio A", "Wallbox 3", "Rack #2", "Puerto 6");
    }
}
