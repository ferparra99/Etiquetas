package com.etiquetas.cables.cable.domain.exception;

import com.etiquetas.cables.shared.exception.DomainException;
import com.etiquetas.cables.shared.exception.ErrorType;

public class InvalidSearchException extends DomainException {

    public InvalidSearchException(String message) {
        super(ErrorType.INVALID_INPUT, message);
    }
}
