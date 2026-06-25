import { PlantAttributes, PlantProblem, HassEntity } from '../types';
import { fmt } from './format';

const SENSOR_DEVICE_CLASS: Record<string, string> = {
  moisture:     'moisture',
  illuminance:  'illuminance',
  brightness:   'illuminance',
  temperature:  'temperature',
  conductivity: 'conductivity',
};

export function getPlantSensorValue(
  type: string,
  attrs: Record<string, unknown>,
  states: Record<string, HassEntity>,
  problems: PlantProblem[] = [],
  plantEntityId?: string
): number | null {
  // 1. from problems[].current — stored as string by the integration
  const fromProblem = problems.find(p => p.sensor_type === type)?.current;
  if (fromProblem != null) {
    const val = Number(fromProblem);
    if (!isNaN(val)) return val;
  }

  // 2. direct attribute (some integration versions set this)
  const direct = attrs[type];
  if (typeof direct === 'number' && !isNaN(direct)) return direct;

  // 3. via sensors dict: { moisture: "sensor.foo", illuminance: "sensor.bar" }
  const sensors = attrs['sensors'] as Record<string, string> | undefined;
  const sensorId = sensors?.[type];
  if (sensorId) {
    const val = parseFloat(states[sensorId]?.state ?? '');
    if (!isNaN(val)) return val;
  }

  // 4. helper sensors created by the integration: sensor.{plant_slug}_{name}
  //    matched by device_class — no entity IDs hardcoded
  if (plantEntityId?.startsWith('plant.')) {
    const slug = plantEntityId.slice(6);
    const prefix = `sensor.${slug}_`;
    const deviceClass = SENSOR_DEVICE_CLASS[type];
    if (deviceClass) {
      const match = Object.values(states).find(e =>
        e.entity_id.startsWith(prefix) &&
        (e.attributes['device_class'] as string | undefined) === deviceClass
      );
      if (match) {
        const val = parseFloat(match.state);
        if (!isNaN(val)) return val;
      }
    }
  }

  return null;
}

export function getProblems(attrs: PlantAttributes): PlantProblem[] {
  return Array.isArray(attrs.problems) ? attrs.problems : [];
}

export function problemByType(problems: PlantProblem[], type: string): PlantProblem | null {
  return problems.find((p) => p.sensor_type === type) ?? null;
}

export function statusLabel(problems: PlantProblem[]): string {
  if (!problems.length) return 'Alles okay';
  return problems.length === 1 ? '1 Problem' : `${problems.length} Probleme`;
}

export function getRecommendation(problems: PlantProblem[], attrs: PlantAttributes): string {
  if (!problems.length) {
    return 'Aktuell sind keine Probleme erkannt. Die Pflanze liegt im Zielbereich.';
  }

  const name = attrs.friendly_name ?? 'Die Pflanze';

  const moisture = problemByType(problems, 'moisture');
  if (moisture?.current !== undefined && moisture.min !== undefined && moisture.max !== undefined) {
    const c = fmt(moisture.current);
    const min = fmt(moisture.min);
    const max = fmt(moisture.max);
    if (moisture.status === 'Low') {
      return `Die Bodenfeuchte ist zu niedrig: aktuell ${c} %, Zielbereich ${min}–${max} %. Gieße ${name} vorsichtig und prüfe später erneut.`;
    }
    if (moisture.status === 'High') {
      return `Die Bodenfeuchte ist zu hoch: aktuell ${c} %, Zielbereich ${min}–${max} %. Nicht weiter gießen, Staunässe vermeiden.`;
    }
  }

  const light =
    problemByType(problems, 'illuminance') ?? problemByType(problems, 'brightness');
  if (light?.current !== undefined && light.min !== undefined && light.max !== undefined) {
    const c = fmt(light.current);
    const min = fmt(light.min);
    const max = fmt(light.max);
    if (light.status === 'Low') {
      return `Die Beleuchtung ist zu niedrig: aktuell ${c} lx, Zielbereich ${min}–${max} lx. Pflanze an einen helleren Standort stellen.`;
    }
    if (light.status === 'High') {
      return `Die Beleuchtung ist zu hoch: aktuell ${c} lx, Zielbereich ${min}–${max} lx. Direkte Sonneneinstrahlung reduzieren.`;
    }
  }

  const types = problems.map((p) => p.sensor_type ?? '').filter(Boolean).join(', ');
  return `Probleme erkannt: ${types}.`;
}
