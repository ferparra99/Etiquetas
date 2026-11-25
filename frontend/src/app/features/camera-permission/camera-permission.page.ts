import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CameraError } from '../../core/camera/camera-error';
import { CameraService } from '../../core/camera/camera.service';
import { LogFeature } from '../../core/logging/log-feature.decorator';
import { AppRoute } from '../../core/navigation/app-route';
import { NavigationService } from '../../core/navigation/navigation.service';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';
import { IconButtonComponent } from '../../shared/ui/icon-button.component';

/** P05 · Cámara sin permiso: explica cómo activarla y permite reintentar o escribir el código. */
@Component({
  selector: 'app-camera-permission-page',
  standalone: true,
  imports: [IconButtonComponent, ActionButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './camera-permission.page.html',
  styleUrl: './camera-permission.page.scss',
})
export class CameraPermissionPage {
  private readonly camera = inject(CameraService);
  private readonly navigation = inject(NavigationService);

  protected readonly steps = [
    'Toca el ícono del candado junto a la dirección.',
    'Entra a Permisos y luego a Cámara.',
    'Elige Permitir y recarga la página.',
  ] as const;

  protected readonly checking = signal(false);
  protected readonly message = signal<string | null>(null);

  protected goBack(): void {
    this.navigation.back(AppRoute.Manual);
  }

  @LogFeature('reintentar-camara')
  protected async retry(): Promise<void> {
    this.checking.set(true);
    this.message.set(null);
    try {
      this.camera.stop(await this.camera.open());
      await this.navigation.go(AppRoute.Scan, { replaceUrl: true });
    } catch (error) {
      const kind = error instanceof CameraError ? error.kind : 'unavailable';
      this.message.set(
        kind === 'denied'
          ? 'La cámara sigue bloqueada. Actívala en los ajustes del navegador y vuelve a intentar.'
          : kind === 'insecure'
            ? 'La cámara necesita una conexión segura (HTTPS).'
            : 'No se encontró una cámara trasera disponible.',
      );
    } finally {
      this.checking.set(false);
    }
  }

  protected writeLabel(): void {
    void this.navigation.go(AppRoute.Manual);
  }
}
