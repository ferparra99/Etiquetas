package com.etiquetas.cables.cable.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Entidad de persistencia: nunca sale por la API (se mapea a Cable de dominio). */
@Entity
@Table(name = "cable")
public class CableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;
    private String code;
    private String cableType;
    private String originLocation;
    private String originDetail;
    private String destinationLocation;
    private String destinationDetail;

    protected CableEntity() {
    }

    public Long getId() { return id; }
    public Long getProjectId() { return projectId; }
    public String getCode() { return code; }
    public String getCableType() { return cableType; }
    public String getOriginLocation() { return originLocation; }
    public String getOriginDetail() { return originDetail; }
    public String getDestinationLocation() { return destinationLocation; }
    public String getDestinationDetail() { return destinationDetail; }
}
