package com.etiquetas.cables.scan.infrastructure.adapter;

import com.etiquetas.cables.scan.domain.exception.OcrUnavailableException;
import com.etiquetas.cables.scan.domain.model.OcrLine;
import com.etiquetas.cables.scan.domain.model.OcrResult;
import com.etiquetas.cables.scan.domain.port.OcrEngine;
import com.etiquetas.cables.scan.infrastructure.config.OcrProperties;
import java.time.Duration;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Adapter: traduce el contrato HTTP del servicio Python al puerto OcrEngine. */
@Component
public class PaddleOcrHttpAdapter implements OcrEngine {

    private static final String OCR_PATH = "/ocr";
    private static final String DEFAULT_FILENAME = "marquilla.jpg";

    private final RestClient client;

    public PaddleOcrHttpAdapter(RestClient.Builder builder, OcrProperties properties) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(properties.connectTimeoutSeconds()));
        factory.setReadTimeout(Duration.ofSeconds(properties.readTimeoutSeconds()));
        this.client = builder.baseUrl(properties.baseUrl()).requestFactory(factory).build();
    }

    @Override
    public OcrResult recognize(byte[] image, String filename) {
        String name = (filename == null || filename.isBlank()) ? DEFAULT_FILENAME : filename;
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(image) {
            @Override
            public String getFilename() {
                return name;
            }
        });
        try {
            OcrResponse response = client.post()
                    .uri(OCR_PATH)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(OcrResponse.class);
            if (response == null || response.lines() == null) {
                throw new OcrUnavailableException("El servicio OCR devolvió una respuesta vacía");
            }
            List<OcrLine> lines = response.lines().stream()
                    .map(l -> new OcrLine(l.text(), l.score()))
                    .toList();
            return new OcrResult(lines, response.elapsedMs());
        } catch (RestClientException ex) {
            throw new OcrUnavailableException("No se pudo contactar el servicio OCR: " + ex.getMessage());
        }
    }

    private record OcrResponse(List<Line> lines, long elapsedMs) {
    }

    private record Line(String text, double score) {
    }
}
