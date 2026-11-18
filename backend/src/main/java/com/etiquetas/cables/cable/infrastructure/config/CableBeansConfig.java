package com.etiquetas.cables.cable.infrastructure.config;

import com.etiquetas.cables.cable.domain.port.SimilarityStrategy;
import com.etiquetas.cables.cable.domain.port.TextNormalizer;
import com.etiquetas.cables.cable.domain.service.CollapseSpacesNormalizer;
import com.etiquetas.cables.cable.domain.service.LevenshteinSimilarity;
import com.etiquetas.cables.cable.domain.service.TextNormalizationChain;
import com.etiquetas.cables.cable.domain.service.UppercaseNormalizer;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** El dominio no usa Spring: aquí se ensamblan sus piezas. */
@Configuration
public class CableBeansConfig {

    @Bean
    TextNormalizer textNormalizer() {
        return new TextNormalizationChain(List.of(new UppercaseNormalizer(), new CollapseSpacesNormalizer()));
    }

    @Bean
    SimilarityStrategy similarityStrategy() {
        return new LevenshteinSimilarity();
    }
}
