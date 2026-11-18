package com.etiquetas.cables.scan.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.etiquetas.cables.scan.application.dto.ScanResponse;
import com.etiquetas.cables.scan.application.usecase.ScanLabelService;
import com.etiquetas.cables.scan.domain.exception.InvalidImageException;
import com.etiquetas.cables.scan.domain.model.OcrLine;
import com.etiquetas.cables.scan.domain.model.OcrResult;
import com.etiquetas.cables.scan.domain.port.OcrEngine;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScanLabelServiceTest {

    @Mock
    private OcrEngine ocrEngine;

    @InjectMocks
    private ScanLabelService service;

    @Test
    void joinsRecognizedLinesIntoOneText() {
        byte[] image = {1, 2, 3};
        var result = new OcrResult(List.of(new OcrLine("V07206", 0.99), new OcrLine("VJF B06", 0.93)), 420);
        when(ocrEngine.recognize(image, "foto.jpg")).thenReturn(result);

        ScanResponse response = service.scan(image, "foto.jpg");

        assertThat(response.text()).isEqualTo("V07206 VJF B06");
        assertThat(response.lines()).hasSize(2);
        assertThat(response.elapsedMs()).isEqualTo(420);
    }

    @Test
    void rejectsEmptyImage() {
        assertThatThrownBy(() -> service.scan(new byte[0], "foto.jpg")).isInstanceOf(InvalidImageException.class);
    }
}
