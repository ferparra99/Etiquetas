import { Injectable, InjectionToken, inject } from '@angular/core';
import { IconName } from '../../shared/ui/app-icon.component';

/** Ilustración de un extremo y su posición dentro de la tarjeta (medidas del mock, px de diseño). */
export interface EquipmentIcon {
  readonly name: IconName;
  readonly width: number;
  readonly height: number;
  /** Espacio sobre la ilustración. */
  readonly padTop: number;
  /** Espacio entre la ilustración y el rol (Origen/Destino). */
  readonly gapAfter: number;
  readonly align: 'center' | 'start';
}

export const EQUIPMENT_ICONS = {
  desk: { name: 'desk', width: 131, height: 104, padTop: 44, gapAfter: 31, align: 'center' },
  patchPanel: { name: 'patch-panel', width: 161, height: 41, padTop: 74, gapAfter: 34, align: 'start' },
  generic: { name: 'ethernet-port', width: 52, height: 52, padTop: 70, gapAfter: 34, align: 'center' },
} as const satisfies Record<string, EquipmentIcon>;

/** Patrón Strategy: cada estrategia sabe reconocer un tipo de ubicación y qué ilustración le toca. */
export interface EquipmentIconStrategy {
  readonly icon: EquipmentIcon;
  supports(location: string): boolean;
}

class RackStrategy implements EquipmentIconStrategy {
  readonly icon = EQUIPMENT_ICONS.patchPanel;
  supports(location: string): boolean {
    return /rack|patch|gabinete/i.test(location);
  }
}

class DeskStrategy implements EquipmentIconStrategy {
  readonly icon = EQUIPMENT_ICONS.desk;
  supports(location: string): boolean {
    return /mesa|puesto|escritorio|estudio|wallbox/i.test(location);
  }
}

export const EQUIPMENT_ICON_STRATEGIES = new InjectionToken<readonly EquipmentIconStrategy[]>(
  'EQUIPMENT_ICON_STRATEGIES',
  { providedIn: 'root', factory: () => [new RackStrategy(), new DeskStrategy()] },
);

/** Elige la ilustración de un extremo sin `if/else` por tipo; si ninguna aplica, usa la genérica. */
@Injectable({ providedIn: 'root' })
export class EquipmentIconResolver {
  private readonly strategies = inject(EQUIPMENT_ICON_STRATEGIES);

  resolve(location: string): EquipmentIcon {
    return this.strategies.find((strategy) => strategy.supports(location))?.icon ?? EQUIPMENT_ICONS.generic;
  }
}
