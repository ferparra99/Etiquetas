import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { resizeToJpeg } from '../../core/image.util';
import { LOW_CONFIDENCE_THRESHOLD } from '../../shared/constants';
import { CableCandidate, CableSearchResponse, OcrLine, ScanResponse } from '../../shared/models/api.models';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.css',
})
export class ScanComponent {
  private readonly api = inject(ApiService);

  readonly lowConfidence = LOW_CONFIDENCE_THRESHOLD;
  readonly previewUrl = signal<string | null>(null);
  readonly text = signal('');
  readonly lines = signal<OcrLine[]>([]);
  readonly ocrMs = signal<number | null>(null);
  readonly result = signal<CableSearchResponse | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  async onPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.resetResult();
    this.busy.set(true);
    try {
      const image = await resizeToJpeg(file);
      this.replacePreview(URL.createObjectURL(image));
      this.api.scan(image).subscribe({
        next: (res) => this.onScanned(res),
        error: (err) => this.onError(err),
      });
    } catch {
      this.busy.set(false);
      this.error.set('No se pudo leer la foto. Intenta de nuevo.');
    } finally {
      input.value = '';
    }
  }

  search(): void {
    const code = this.text().trim();
    if (!code) {
      this.error.set('Escribe o escanea un código primero.');
      return;
    }
    this.error.set(null);
    this.busy.set(true);
    this.api.searchCable(code).subscribe({
      next: (res) => {
        this.result.set(res);
        this.busy.set(false);
      },
      error: (err) => this.onError(err),
    });
  }

  pick(candidate: CableCandidate): void {
    this.text.set(candidate.cable.code);
    this.search();
  }

  percent(value: number): string {
    return `${Math.round(value * 100)} %`;
  }

  private onScanned(res: ScanResponse): void {
    this.busy.set(false);
    this.text.set(res.text);
    this.lines.set(res.lines);
    this.ocrMs.set(res.elapsedMs);
    if (!res.text) {
      this.error.set('No se leyó texto. Acércate y mejora la luz.');
    }
  }

  private onError(err: HttpErrorResponse): void {
    this.busy.set(false);
    this.error.set(err.error?.detail ?? 'Ocurrió un error. Intenta de nuevo.');
  }

  private resetResult(): void {
    this.error.set(null);
    this.result.set(null);
    this.lines.set([]);
    this.ocrMs.set(null);
  }

  private replacePreview(url: string): void {
    const old = this.previewUrl();
    if (old) {
      URL.revokeObjectURL(old);
    }
    this.previewUrl.set(url);
  }
}
