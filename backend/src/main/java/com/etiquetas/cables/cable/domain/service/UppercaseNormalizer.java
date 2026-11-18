package com.etiquetas.cables.cable.domain.service;

import com.etiquetas.cables.cable.domain.port.TextNormalizer;
import java.util.Locale;

public class UppercaseNormalizer implements TextNormalizer {

    @Override
    public String apply(String input) {
        return input == null ? "" : input.trim().toUpperCase(Locale.ROOT);
    }
}
