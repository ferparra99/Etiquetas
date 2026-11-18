package com.etiquetas.cables.cable.domain.port;

import com.etiquetas.cables.cable.domain.model.Cable;
import java.util.List;
import java.util.Optional;

public interface CableRepository {

    Optional<Cable> findByCode(long projectId, String code);

    List<Cable> findAll(long projectId);
}
