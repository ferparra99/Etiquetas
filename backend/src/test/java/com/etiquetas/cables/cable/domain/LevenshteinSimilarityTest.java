package com.etiquetas.cables.cable.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import com.etiquetas.cables.cable.domain.service.LevenshteinSimilarity;
import org.junit.jupiter.api.Test;

class LevenshteinSimilarityTest {

    private final LevenshteinSimilarity similarity = new LevenshteinSimilarity();

    @Test
    void identicalTextsScoreOne() {
        assertThat(similarity.score("V07206 VJF B06", "V07206 VJF B06")).isEqualTo(1.0);
    }

    @Test
    void oneConfusedCharacterLowersScoreSlightly() {
        // 1 sustitución (O por 0) sobre 14 caracteres
        assertThat(similarity.score("VO7206 VJF B06", "V07206 VJF B06")).isCloseTo(1.0 - 1.0 / 14, within(0.0001));
    }

    @Test
    void unrelatedTextsScoreLow() {
        assertThat(similarity.score("ZZZZZZ", "V07206 VJF B06")).isLessThan(0.3);
    }
}
