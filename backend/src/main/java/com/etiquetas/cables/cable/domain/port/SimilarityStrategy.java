package com.etiquetas.cables.cable.domain.port;

/** Strategy: permite cambiar el algoritmo de parecido (Levenshtein, trigramas…) sin tocar el caso de uso. */
public interface SimilarityStrategy {

    /** Devuelve un valor entre 0 (nada parecido) y 1 (idéntico). */
    double score(String a, String b);
}
