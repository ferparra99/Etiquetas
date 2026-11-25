import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppIconComponent, IconName } from './app-icon.component';

/** Botón circular de 68 px del mock (variantes: relleno `Filled` y contorno `Outline`). */
@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="btn"
      [class.outline]="variant() === 'outline'"
      [attr.aria-label]="label()"
      [disabled]="disabled()"
      (click)="pressed.emit()"
    >
      <app-icon [name]="icon()" [width]="32" />
    </button>
  `,
  styleUrl: './icon-button.component.scss',
})
export class IconButtonComponent {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly variant = input<'filled' | 'outline'>('filled');
  readonly disabled = input(false);
  readonly pressed = output<void>();
}
