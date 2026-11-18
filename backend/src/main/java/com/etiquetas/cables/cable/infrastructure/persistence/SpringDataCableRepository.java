package com.etiquetas.cables.cable.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataCableRepository extends JpaRepository<CableEntity, Long> {

    Optional<CableEntity> findByProjectIdAndCode(Long projectId, String code);

    List<CableEntity> findByProjectId(Long projectId);
}
