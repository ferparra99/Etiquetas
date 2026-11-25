import { Injectable, inject } from '@angular/core';
import { Cable } from '../../domain/cable.model';
import { PORTS_PER_ROW } from '../../shared/constants/app.constants';
import { CableView, EndpointView, PortLocationView, RouteRow } from './cable-view.model';
import { EquipmentIconResolver } from './equipment-icon';
import { parsePortNumber } from './port-parser';

const SEPARATOR = ' · ';

/** Texto limpio o `undefined`: así un dato vacío o en blanco nunca llega a la pantalla. */
const present = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/** Convierte un `Cable` de la base de datos en lo que P02 muestra, omitiendo lo que no existe. */
@Injectable({ providedIn: 'root' })
export class CableViewFactory {
  private readonly icons = inject(EquipmentIconResolver);

  create(cable: Cable): CableView {
    const origin = this.endpoint(cable.originLocation, cable.originDetail);
    const destination = this.endpoint(cable.destinationLocation, cable.destinationDetail);
    return {
      code: cable.code,
      description: present(cable.cableType),
      origin,
      destination,
      route: this.route(origin, destination, present(cable.medium)),
      portLocation: this.portLocation(cable),
    };
  }

  private endpoint(location: string, detail: string | null): EndpointView {
    return { name: location.trim(), detail: present(detail), icon: this.icons.resolve(location) };
  }

  private route(origin: EndpointView, destination: EndpointView, medium?: string): RouteRow[] {
    const join = (e: EndpointView): string => [e.name, e.detail].filter(Boolean).join(SEPARATOR);
    const rows: RouteRow[] = [
      { label: 'Desde', value: join(origin) },
      { label: 'Hasta', value: join(destination) },
    ];
    if (medium) {
      rows.push({ label: 'Medio', value: medium });
    }
    return rows;
  }

  private portLocation(cable: Cable): PortLocationView | undefined {
    const portNumber = parsePortNumber(cable.destinationDetail);
    const portLabel = present(cable.destinationDetail);
    if (portNumber === null || !portLabel) {
      return undefined;
    }
    return {
      equipmentName: cable.destinationLocation.trim().toUpperCase(),
      portLabel,
      portNumber,
      totalPorts: Math.max(PORTS_PER_ROW, Math.ceil(portNumber / PORTS_PER_ROW) * PORTS_PER_ROW),
    };
  }
}
