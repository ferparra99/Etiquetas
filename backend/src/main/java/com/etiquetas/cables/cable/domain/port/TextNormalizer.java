package com.etiquetas.cables.cable.domain.port;

@FunctionalInterface
public interface TextNormalizer {

    String apply(String input);
}
