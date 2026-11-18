package com.etiquetas.cables.cable.domain.service;

import com.etiquetas.cables.cable.domain.port.TextNormalizer;

public class CollapseSpacesNormalizer implements TextNormalizer {

    @Override
    public String apply(String input) {
        return input.replaceAll("\\s+", " ");
    }
}
