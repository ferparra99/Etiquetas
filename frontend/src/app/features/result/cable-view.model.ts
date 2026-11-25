import { EquipmentIcon } from './equipment-icon';

export interface EndpointView {
  readonly name: string;
  /** Posición/puerto del extremo; ausente si la base de datos no lo tiene. */
  readonly detail?: string;
  readonly icon: EquipmentIcon;
}

export interface RouteRow {
  readonly label: string;
  readonly value: string;
}

export interface PortLocationView {
  readonly equipmentName: string;
  readonly portLabel: string;
  readonly portNumber: number;
  readonly totalPorts: number;
}

/** Lo que P02 dibuja. Todo campo opcional que falte aquí simplemente no aparece en pantalla. */
export interface CableView {
  readonly code: string;
  readonly description?: string;
  readonly origin: EndpointView;
  readonly destination: EndpointView;
  readonly route: readonly RouteRow[];
  readonly portLocation?: PortLocationView;
}
