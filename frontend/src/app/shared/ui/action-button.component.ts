import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppIconComponent, IconName } from './app-icon.component';

/** Botón de acción del mock: `primary` (verde, contorno 2 px) o `secondary` (gris). 90 px de alto, forma de píldora. */
@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="btn" [class]="variant()" [disabled]="disabled()" (click)="pressed.emit()">
      <app-icon [name]="icon()" [width]="iconSize()" />
      <span>{{ label() }}</span>
    </button>
  `,
  styleUrl: './action-button.component.scss',
})
export class ActionButtonComponent {
  readonly label = input.required<string>();
  readonly icon = input.required<IconName>();
  readonly variant = input<'primary' | 'secondary'>('secondary');
  readonly iconSize = input(34);
  readonly disabled = input(false);
  readonly pressed = output<void>();
}
