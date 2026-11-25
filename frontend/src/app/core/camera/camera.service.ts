import { Injectable, isDevMode } from '@angular/core';
import { CAMERA_VIEW, JPEG_QUALITY, MAX_IMAGE_SIDE_PX } from '../../shared/constants/app.constants';
import { CameraError, classifyCameraError } from './camera-error';
import { guideRect, guideToVideoRect } from './camera-crop';

/** Acceso a la cámara TRASERA del dispositivo y captura recortada a la zona guía. */
@Injectable({ providedIn: 'root' })
export class CameraService {
  /**
   * Pide la cámara trasera (`environment`, exacta). Solo en desarrollo, si el equipo no tiene cámara
   * trasera (un PC), se acepta cualquier cámara para poder probar.
   */
  async open(): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new CameraError('insecure');
    }
    try {
      return await this.request({ exact: 'environment' });
    } catch (error) {
      const kind = classifyCameraError(error);
      if (kind === 'unavailable' && isDevMode()) {
        try {
          return await this.request('environment');
        } catch (fallbackError) {
          throw new CameraError(classifyCameraError(fallbackError), fallbackError);
        }
      }
      throw new CameraError(kind, error);
    }
  }

  stop(stream: MediaStream | null): void {
    stream?.getTracks().forEach((track) => track.stop());
  }

  /** Congela el fotograma actual, lo recorta a la zona guía y lo devuelve como JPEG reducido (todo en memoria). */
  async capture(video: HTMLVideoElement): Promise<Blob> {
    const box = { width: video.clientWidth, height: video.clientHeight };
    const guide = guideRect(
      box,
      { width: CAMERA_VIEW.innerWidth, height: CAMERA_VIEW.innerHeight },
      CAMERA_VIEW.guideInset,
    );
    const source = guideToVideoRect({ width: video.videoWidth, height: video.videoHeight }, box, guide);

    const scale = Math.min(1, MAX_IMAGE_SIDE_PX / Math.max(source.width, source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);
    canvas
      .getContext('2d')!
      .drawImage(video, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))),
        'image/jpeg',
        JPEG_QUALITY,
      ),
    );
  }

  private request(facingMode: ConstrainDOMString): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
    });
  }
}
