package com.etiquetas.cables.cable.application.usecase;

import static com.etiquetas.cables.shared.constants.ProjectConstants.DEFAULT_PROJECT_ID;
import static com.etiquetas.cables.shared.constants.SearchConstants.MAX_CANDIDATES;
import static com.etiquetas.cables.shared.constants.SearchConstants.MIN_SIMILARITY;

import com.etiquetas.cables.cable.application.dto.CableSearchResponse;
import com.etiquetas.cables.cable.application.mapper.CableMapper;
import com.etiquetas.cables.cable.domain.exception.InvalidSearchException;
import com.etiquetas.cables.cable.domain.model.Cable;
import com.etiquetas.cables.cable.domain.model.CableCandidate;
import com.etiquetas.cables.cable.domain.model.CableSearchResult;
import com.etiquetas.cables.cable.domain.port.CableRepository;
import com.etiquetas.cables.cable.domain.port.SimilarityStrategy;
import com.etiquetas.cables.cable.domain.port.TextNormalizer;
import com.etiquetas.cables.shared.logging.LogFeature;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Busca el código en el inventario. Si no hay coincidencia exacta, propone los códigos más parecidos:
 * el inventario es un conjunto cerrado, así que corrige errores típicos del OCR (O/0, I/1…).
 */
@Service
public class SearchCableService implements SearchCableUseCase {

    private final CableRepository repository;
    private final TextNormalizer normalizer;
    private final SimilarityStrategy similarity;

    public SearchCableService(CableRepository repository, TextNormalizer normalizer, SimilarityStrategy similarity) {
        this.repository = repository;
        this.normalizer = normalizer;
        this.similarity = similarity;
    }

    @Override
    @LogFeature("cable.search")
    public CableSearchResponse search(String rawCode) {
        String normalized = normalizer.apply(rawCode);
        if (normalized.isBlank()) {
            throw new InvalidSearchException("El código no puede estar vacío");
        }
        Optional<Cable> exact = repository.findByCode(DEFAULT_PROJECT_ID, normalized);
        List<CableCandidate> candidates = exact.isPresent() ? List.of() : findCandidates(normalized);
        return CableMapper.toResponse(new CableSearchResult(rawCode, normalized, exact, candidates));
    }

    private List<CableCandidate> findCandidates(String normalized) {
        return repository.findAll(DEFAULT_PROJECT_ID).stream()
                .map(cable -> new CableCandidate(cable, similarity.score(normalized, normalizer.apply(cable.code()))))
                .filter(candidate -> candidate.similarity() >= MIN_SIMILARITY)
                .sorted(Comparator.comparingDouble(CableCandidate::similarity).reversed())
                .limit(MAX_CANDIDATES)
                .toList();
    }
}
