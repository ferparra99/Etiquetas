package com.etiquetas.cables.shared.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Decorator vía AOP: el logging por funcionalidad no ensucia los casos de uso. */
@Aspect
@Component
public class FeatureLoggingAspect {

    private static final Logger LOG = LoggerFactory.getLogger(FeatureLoggingAspect.class);
    private static final long NANOS_PER_MILLI = 1_000_000L;

    @Around("@annotation(logFeature)")
    public Object log(ProceedingJoinPoint joinPoint, LogFeature logFeature) throws Throwable {
        String feature = logFeature.value();
        long start = System.nanoTime();
        LOG.info("{} | inicio", feature);
        try {
            Object result = joinPoint.proceed();
            LOG.info("{} | fin en {} ms", feature, (System.nanoTime() - start) / NANOS_PER_MILLI);
            return result;
        } catch (Throwable error) {
            LOG.error("{} | error: {}", feature, error.getMessage());
            throw error;
        }
    }
}
