import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, inject, signal, viewChild,
} from '@angular/core';
import { toUserMessage } from '../../core/api/error-message';
import { CameraError } from '../../core/camera/camera-error';
import { CameraService } from '../../core/camera/camera.service';
import { LogFeature } from '../../core/logging/log-feature.decorator';
import { LoggerService } from '../../core/logging/logger.service';
import { CableLookupFacade } from '../../core/lookup/cable-lookup.facade';
import { LookupSessionStore } from '../../core/lookup/lookup-session.store';
import { AppRoute } from '../../core/navigation/app-route';
import { NavigationService } from '../../core/navigation/navigation.service';
import { confidenceLevel, toPercent } from '../../core/ocr/confidence';
import { LabelReader, OcrReading } from '../../core/ocr/label-reader';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';
import { IconButtonComponent } from '../../shared/ui/icon-button.component';
import { AppIconComponent } from '../../shared/ui/app-icon.component';
import { designFont, fitFontSize } from '../../shared/util/design-units';

/** starting = abriendo cámara · live = vista en vivo · processing = leyendo · read = hay lectura · unavailable = sin cámara */
type Phase = 'starting' | 'live' | 'processing' | 'read' | 'unavailable';

/** P01 · Escaneo cable (pantalla principal): cámara trasera con guía de encuadre → OCR → consulta. */
@Component({
  selector: 'app-scan-page',
  standalone: true,
  imports: [IconButtonComponent, ActionButtonComponent, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scan.page.html',
  styleUrl: './scan.page.scss',
})
export class ScanPage implements AfterViewInit, OnDestroy {
  private readonly camera = inject(CameraService);
  private readonly reader = inject(LabelReader);
  private readonly lookup = inject(CableLookupFacade);
  private readonly store = inject(LookupSessionStore);
  private readonly navigation = inject(NavigationService);
  private readonly logger = inject(LoggerService);
  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  private stream: MediaStream | null = null;

  protected readonly phase = signal<Phase>('starting');
  protected readonly reading = signal<OcrReading | null>(null);
  protected readonly identifier = signal('');
  protected readonly message = signal<string | null>(null);
  protected readonly consulting = signal(false);

  protected readonly canCapture = computed(() => this.phase() === 'live');
  protected readonly canConsult = computed(
    () => this.phase() === 'read' && this.identifier().trim().length > 0 && !this.consulting(),
  );
  /** La confianza solo aplica mientras el texto sea el que leyó el OCR (si el usuario lo edita, deja de mostrarse). */
  protected readonly confidence = computed(() => {
    const reading = this.reading();
    if (!reading?.text || this.identifier().trim() !== reading.text) {
      return null;
    }
    return { percent: toPercent(reading.confidence), level: confidenceLevel(reading.confidence) };
  });
  protected readonly identifierFont = computed(() => designFont(fitFontSize(50, this.identifier().length, 13, 26)));

  ngAfterViewInit(): void {
    void this.startCamera();
  }

  ngOnDestroy(): void {
    this.camera.stop(this.stream);
  }

  protected goBack(): void {
    this.navigation.back();
  }

  protected onIdentifierInput(event: Event): void {
    this.identifier.set((event.target as HTMLInputElement).value);
  }

  @LogFeature('escanear-marquilla')
  protected async capture(): Promise<void> {
    if (!this.canCapture()) {
      return;
    }
    const video = this.videoRef().nativeElement;
    this.phase.set('processing');
    this.message.set(null);
    try {
      const image = await this.camera.capture(video);
      video.pause(); // congela el fotograma leído
      const reading = await this.reader.read(image);
      this.reading.set(reading);
      this.identifier.set(reading.text);
      this.phase.set('read');
      if (!reading.text) {
        this.message.set('No se leyó texto. Acércate a la marquilla y mejora la luz.');
      }
    } catch (error) {
      await video.play().catch(() => undefined);
      this.phase.set('live');
      this.message.set(toUserMessage(error, 'No se pudo leer la marquilla. Intenta de nuevo.'));
    }
  }

  @LogFeature('tomar-de-nuevo')
  protected async retake(): Promise<void> {
    this.reading.set(null);
    this.identifier.set('');
    this.message.set(null);
    if (this.stream?.active) {
      await this.videoRef().nativeElement.play().catch(() => undefined);
      this.phase.set('live');
    } else {
      await this.startCamera();
    }
  }

  protected async consult(): Promise<void> {
    if (!this.canConsult()) {
      return;
    }
    this.consulting.set(true);
    this.message.set(null);
    try {
      await this.lookup.lookup(this.identifier(), 'scan');
    } catch (error) {
      this.message.set(toUserMessage(error, 'No se pudo consultar la marquilla. Intenta de nuevo.'));
    } finally {
      this.consulting.set(false);
    }
  }

  /** Salida hacia P03 desde un estado de error (el diseño no trae un acceso permanente desde P01). */
  protected writeManually(): void {
    this.store.setManualDraft(this.identifier());
    void this.navigation.go(AppRoute.Manual);
  }

  @LogFeature('camara-iniciar')
  private async startCamera(): Promise<void> {
    this.phase.set('starting');
    this.message.set(null);
    try {
      this.stream = await this.camera.open();
      const video = this.videoRef().nativeElement;
      video.srcObject = this.stream;
      await video.play();
      this.phase.set('live');
    } catch (error) {
      this.onCameraError(error);
    }
  }

  private onCameraError(error: unknown): void {
    const kind = error instanceof CameraError ? error.kind : 'unavailable';
    this.logger.warn('camara', `no disponible (${kind})`);
    if (kind === 'denied') {
      void this.navigation.go(AppRoute.CameraPermission, { replaceUrl: true });
      return;
    }
    this.phase.set('unavailable');
    this.message.set(
      kind === 'insecure'
        ? 'La cámara necesita una conexión segura (HTTPS).'
        : 'No se pudo abrir la cámara trasera.',
    );
  }
}
