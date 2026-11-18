import { JPEG_QUALITY, MAX_IMAGE_SIDE_PX } from '../shared/constants';

/**
 * Reduce la foto a un lado máximo y la convierte a JPEG, todo en memoria.
 * Menos píxeles = subida y OCR más rápidos. No se guarda nada en el dispositivo.
 */
export async function resizeToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))),
      'image/jpeg',
      JPEG_QUALITY,
    ),
  );
}
