package com.etiquetas.cables.cable.infrastructure.persistence;

import com.etiquetas.cables.cable.domain.model.Cable;
import com.etiquetas.cables.cable.domain.port.CableRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/** Adapter del puerto CableRepository sobre Spring Data JPA. */
@Repository
public class JpaCableRepository implements CableRepository {

    private final SpringDataCableRepository jpa;

    JpaCableRepository(SpringDataCableRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<Cable> findByCode(long projectId, String code) {
        return jpa.findByProjectIdAndCode(projectId, code).map(JpaCableRepository::toDomain);
    }

    @Override
    public List<Cable> findAll(long projectId) {
        return jpa.findByProjectId(projectId).stream().map(JpaCableRepository::toDomain).toList();
    }

    private static Cable toDomain(CableEntity e) {
        return new Cable(
                e.getId(),
                e.getCode(),
                e.getCableType(),
                e.getOriginLocation(),
                e.getOriginDetail(),
                e.getDestinationLocation(),
                e.getDestinationDetail());
    }
}
