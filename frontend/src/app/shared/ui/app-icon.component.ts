import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { designPx } from '../util/design-units';

export type IconName =
  | 'alert' | 'arrow-left' | 'cam' | 'camera-off' | 'check-circle' | 'corner-bl' | 'corner-br'
  | 'corner-tl' | 'corner-tr' | 'desk' | 'ethernet-port' | 'info' | 'list' | 'patch-panel'
  | 'pencil' | 'plug' | 'refresh-cw' | 'scan' | 'scan-text' | 'search';

/** Icono SVG exportado de Figma (public/icons). Tamaño en px de diseño, escalado con `--u`. */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img [src]="src()" alt="" draggable="false" [style.width]="w()" [style.height]="h()" />`,
  styles: [':host { display: inline-flex; flex: none; line-height: 0; } img { display: block; max-width: none; }'],
})
export class AppIconComponent {
  readonly name = input.required<IconName>();
  readonly width = input(32);
  readonly height = input<number | undefined>(undefined);

  protected readonly src = computed(() => `icons/${this.name()}.svg`);
  protected readonly w = computed(() => designPx(this.width()));
  protected readonly h = computed(() => designPx(this.height() ?? this.width()));
}
