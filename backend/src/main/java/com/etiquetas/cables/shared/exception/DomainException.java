package com.etiquetas.cables.shared.exception;

public abstract class DomainException extends RuntimeException {

    private final ErrorType type;

    protected DomainException(ErrorType type, String message) {
        super(message);
        this.type = type;
    }

    public ErrorType getType() {
        return type;
    }
}
