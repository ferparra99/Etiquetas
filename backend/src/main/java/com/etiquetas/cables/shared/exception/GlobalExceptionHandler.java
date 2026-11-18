package com.etiquetas.cables.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Único punto de traducción de excepciones de dominio a respuestas HTTP. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DomainException.class)
    public ProblemDetail handleDomain(DomainException ex) {
        HttpStatus status = switch (ex.getType()) {
            case INVALID_INPUT -> HttpStatus.BAD_REQUEST;
            case DEPENDENCY_FAILURE -> HttpStatus.BAD_GATEWAY;
        };
        return ProblemDetail.forStatusAndDetail(status, ex.getMessage());
    }
}
