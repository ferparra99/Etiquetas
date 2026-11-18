package com.etiquetas.cables.scan.domain.exception;

import com.etiquetas.cables.shared.exception.DomainException;
import com.etiquetas.cables.shared.exception.ErrorType;

public class InvalidImageException extends DomainException {

    public InvalidImageException(String message) {
        super(ErrorType.INVALID_INPUT, message);
    }
}
