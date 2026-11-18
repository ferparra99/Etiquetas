package com.etiquetas.cables.cable.domain.model;

/** Cable del inventario. Los extremos son genéricos: el formato real de marquilla se define en la v1. */
public record Cable(
        Long id,
        String code,
        String cableType,
        String originLocation,
        String originDetail,
        String destinationLocation,
        String destinationDetail) {

    public Cable {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("El código del cable es obligatorio");
        }
        if (originLocation == null || originLocation.isBlank()
                || destinationLocation == null || destinationLocation.isBlank()) {
            throw new IllegalArgumentException("Origen y destino son obligatorios");
        }
    }
}
