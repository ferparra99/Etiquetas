import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LogFeature } from '../../core/logging/log-feature.decorator';
import { LookupSessionStore } from '../../core/lookup/lookup-session.store';
import { AppRoute } from '../../core/navigation/app-route';
import { NavigationService } from '../../core/navigation/navigation.service';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';
import { IconButtonComponent } from '../../shared/ui/icon-button.component';
import { designFont, fitFontSize } from '../../shared/util/design-units';

/** P04 · Marquilla no registrada: muestra lo leído/escrito y, si existe, el código más parecido del inventario. */
@Component({
  selector: 'app-unregistered-page',
  standalone: true,
  imports: [IconButtonComponent, ActionButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './unregistered.page.html',
  styleUrl: './unregistered.page.scss',
})
export class UnregisteredPage {
  private readonly store = inject(LookupSessionStore);
  private readonly navigation = inject(NavigationService);

  protected readonly session = this.store.session;
  protected readonly suggestion = computed(() => this.session()?.response.candidates[0] ?? null);
  protected readonly readingLabel = computed(() =>
    this.session()?.source === 'manual' ? 'Código ingresado' : 'Lectura de la cámara',
  );
  protected readonly suggestionFont = computed(() =>
    designFont(fitFontSize(42, this.suggestion()?.cable.code.length ?? 0, 22, 22)),
  );

  protected goBack(): void {
    this.navigation.back(AppRoute.Scan);
  }

  /** Acepta la sugerencia: ya tenemos su cable completo, no hace falta otra consulta. */
  @LogFeature('aceptar-sugerencia')
  protected async acceptSuggestion(): Promise<void> {
    const session = this.session();
    const suggestion = this.suggestion();
    if (!session || !suggestion) {
      return;
    }
    const code = suggestion.cable.code;
    this.store.save({
      source: session.source,
      query: code,
      response: { query: code, normalizedQuery: code, exact: suggestion.cable, candidates: [] },
    });
    await this.navigation.go(AppRoute.Result, { replaceUrl: true });
  }

  /** "Escribir etiqueta": abre P03 con lo leído para corregirlo. */
  protected editReading(): void {
    this.store.setManualDraft(this.session()?.query ?? '');
    void this.navigation.go(AppRoute.Manual);
  }

  /** "Volver a escribir": abre P03 con el campo vacío. */
  protected writeAgain(): void {
    this.store.setManualDraft('');
    void this.navigation.go(AppRoute.Manual);
  }
}
