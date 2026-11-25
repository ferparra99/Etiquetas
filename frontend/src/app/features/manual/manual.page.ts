import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild,
} from '@angular/core';
import { toUserMessage } from '../../core/api/error-message';
import { CableLookupFacade } from '../../core/lookup/cable-lookup.facade';
import { LookupSessionStore } from '../../core/lookup/lookup-session.store';
import { AppRoute } from '../../core/navigation/app-route';
import { NavigationService } from '../../core/navigation/navigation.service';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';
import { IconButtonComponent } from '../../shared/ui/icon-button.component';
import { designFont, fitFontSize } from '../../shared/util/design-units';

/** P03 · Ingreso manual: consulta escribiendo el código. Encontrada → P02, no encontrada → P04. */
@Component({
  selector: 'app-manual-page',
  standalone: true,
  imports: [IconButtonComponent, ActionButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manual.page.html',
  styleUrl: './manual.page.scss',
})
export class ManualPage implements AfterViewInit {
  private readonly lookup = inject(CableLookupFacade);
  private readonly store = inject(LookupSessionStore);
  private readonly navigation = inject(NavigationService);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('codeInput');

  protected readonly code = signal(this.store.manualDraft());
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canConsult = computed(() => this.code().trim().length > 0 && !this.busy());
  protected readonly codeFont = computed(() => designFont(fitFontSize(50, this.code().length, 21, 26)));

  ngAfterViewInit(): void {
    this.store.setManualDraft('');
    this.input().nativeElement.focus();
  }

  protected goBack(): void {
    this.navigation.back(AppRoute.Scan);
  }

  protected onInput(event: Event): void {
    this.code.set((event.target as HTMLInputElement).value);
    this.error.set(null);
  }

  protected async consult(): Promise<void> {
    if (!this.canConsult()) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.lookup.lookup(this.code(), 'manual');
    } catch (error) {
      this.error.set(toUserMessage(error, 'No se pudo consultar la marquilla. Intenta de nuevo.'));
    } finally {
      this.busy.set(false);
    }
  }

  protected scanAgain(): void {
    this.store.clear();
    void this.navigation.go(AppRoute.Scan);
  }
}
