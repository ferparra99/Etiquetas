package com.etiquetas.cables.cable.domain.service;

import com.etiquetas.cables.cable.domain.port.TextNormalizer;
import java.util.List;

/** Composite/pipeline: aplica los normalizadores en orden. Añadir una regla = añadir una clase. */
public class TextNormalizationChain implements TextNormalizer {

    private final List<TextNormalizer> steps;

    public TextNormalizationChain(List<TextNormalizer> steps) {
        this.steps = List.copyOf(steps);
    }

    @Override
    public String apply(String input) {
        String current = input;
        for (TextNormalizer step : steps) {
            current = step.apply(current);
        }
        return current;
    }
}
