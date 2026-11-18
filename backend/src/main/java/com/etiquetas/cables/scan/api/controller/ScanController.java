package com.etiquetas.cables.scan.api.controller;

import com.etiquetas.cables.scan.application.dto.ScanResponse;
import com.etiquetas.cables.scan.application.usecase.ScanLabelUseCase;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    private final ScanLabelUseCase scanLabel;

    public ScanController(ScanLabelUseCase scanLabel) {
        this.scanLabel = scanLabel;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ScanResponse scan(@RequestParam("file") MultipartFile file) throws IOException {
        return scanLabel.scan(file.getBytes(), file.getOriginalFilename());
    }
}
