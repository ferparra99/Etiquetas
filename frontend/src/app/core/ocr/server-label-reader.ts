import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LogFeature } from '../logging/log-feature.decorator';
import { averageConfidence } from './confidence';
import { LabelReader, OcrReading } from './label-reader';

/** Adaptador: lee la marquilla con el servicio OCR del backend (`POST /api/scan`). */
@Injectable()
export class ServerLabelReader extends LabelReader {
  private readonly api = inject(ApiService);

  @LogFeature('ocr-lectura')
  async read(image: Blob): Promise<OcrReading> {
    const response = await firstValueFrom(this.api.scan(image));
    return {
      text: response.text.trim(),
      lines: response.lines,
      elapsedMs: response.elapsedMs,
      confidence: averageConfidence(response.lines),
    };
  }
}
