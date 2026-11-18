package com.etiquetas.cables.scan.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ocr")
public record OcrProperties(String baseUrl, int connectTimeoutSeconds, int readTimeoutSeconds) {
}
