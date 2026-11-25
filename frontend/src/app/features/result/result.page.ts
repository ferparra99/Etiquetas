import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LookupSessionStore } from '../../core/lookup/lookup-session.store';
import { AppRoute } from '../../core/navigation/app-route';
import { NavigationService } from '../../core/navigation/navigation.service';
import { PORTS_PER_ROW } from '../../shared/constants/app.constants';
import { AppIconComponent } from '../../shared/ui/app-icon.component';
import { IconButtonComponent } from '../../shared/ui/icon-button.component';
import { toRows } from '../../shared/util/chunk';
import { designFont, designPx, fitFontSize } from '../../shared/util/design-units';
import { CableViewFactory } from './cable-view.factory';

/** P02 · Resultado de consulta: solo muestra los datos que la base de datos devolvió. */
@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [IconButtonComponent, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './result.page.html',
  styleUrl: './result.page.scss',
})
export class ResultPage {
  private readonly store = inject(LookupSessionStore);
  private readonly factory = inject(CableViewFactory);
  private readonly navigation = inject(NavigationService);

  protected readonly px = designPx;

  protected readonly view = computed(() => {
    const cable = this.store.session()?.response.exact;
    return cable ? this.factory.create(cable) : null;
  });

  protected readonly codeFont = computed(() => designFont(fitFontSize(68, this.view()?.code.length ?? 0, 17, 30)));

  protected readonly portRows = computed(() => {
    const port = this.view()?.portLocation;
    if (!port) {
      return [];
    }
    return toRows(Array.from({ length: port.totalPorts }, (_, i) => i + 1), PORTS_PER_ROW);
  });

  protected nameFont(name: string): string {
    return designFont(fitFontSize(36, name.length, 9, 24));
  }

  protected goBack(): void {
    this.navigation.back(AppRoute.Scan);
  }

  protected scanAgain(): void {
    this.store.clear();
    void this.navigation.go(AppRoute.Scan);
  }
}
