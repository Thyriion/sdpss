export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface Hass {
  states: Record<string, HassEntity>;
}

export interface PlantProblem {
  sensor_type?: string;
  status?: string;
  current?: number;
  min?: number;
  max?: number;
}

export interface EntityConfig {
  light?: string;
  temperature?: string;
  humidity?: string;
  rainTank?: string;
  solarBattery?: string;
  lastAction?: string;
}

export interface PanelConfig {
  entities?: EntityConfig;
  rain_tank_max_l?: number;
}

export interface PlantAttributes {
  friendly_name?: string;
  species?: string;
  entity_picture?: string;
  problems?: PlantProblem[];
  moisture_status?: string;
  illuminance_status?: string;
  brightness_status?: string;
  moisture?: number;
  illuminance?: number;
  brightness?: number;
  care_watering?: string;
  care_sunlight?: string;
  care_soil?: string;
}
