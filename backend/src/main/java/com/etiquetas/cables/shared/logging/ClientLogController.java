package com.etiquetas.cables.shared.logging;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Recibe los eventos de log del frontend y los escribe con el mismo formato y los mismos appenders
 * que el resto del backend: consola y {@code logs/etiquetas-AAAA-MM-DD.log}.
 * El navegador no puede escribir archivos; este endpoint es el puente.
 */
@RestController
@RequestMapping("/api/client-logs")
public class ClientLogController {

    private static final Logger FRONTEND_LOG = LoggerFactory.getLogger("frontend");
    private static final int MAX_ENTRIES_PER_BATCH = 50;
    private static final int MAX_FIELD_LENGTH = 300;

    public record ClientLogEntry(String timestamp, String level, String module, String feature, String message) {}

    public record ClientLogBatch(List<ClientLogEntry> entries) {}

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void receive(@RequestBody ClientLogBatch batch) {
        if (batch == null || batch.entries() == null) {
            return;
        }
        batch.entries().stream().limit(MAX_ENTRIES_PER_BATCH).forEach(this::write);
    }

    private void write(ClientLogEntry entry) {
        String line = sanitize(entry.feature()) + " | " + sanitize(entry.message());
        switch (String.valueOf(entry.level())) {
            case "ERROR" -> FRONTEND_LOG.error(line);
            case "WARN" -> FRONTEND_LOG.warn(line);
            default -> FRONTEND_LOG.info(line);
        }
    }

    /** Evita inyección de líneas falsas en el archivo de log y acota el tamaño de cada campo. */
    private static String sanitize(String value) {
        if (value == null) {
            return "";
        }
        String clean = value.replaceAll("[\\r\\n\\t]+", " ");
        return clean.length() > MAX_FIELD_LENGTH ? clean.substring(0, MAX_FIELD_LENGTH) : clean;
    }
}
