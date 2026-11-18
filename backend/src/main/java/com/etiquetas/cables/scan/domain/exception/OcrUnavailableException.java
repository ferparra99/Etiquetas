package com.etiquetas.cables.scan.domain.exception;

import com.etiquetas.cables.shared.exception.DomainException;
import com.etiquetas.cables.shared.exception.ErrorType;

public class OcrUnavailableException extends DomainException {

    public OcrUnavailableException(String message) {
        super(ErrorType.DEPENDENCY_FAILURE, message);
    }
}
