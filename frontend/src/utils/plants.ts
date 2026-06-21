import { PlantAttributes, PlantProblem } from '../types';
import { fmt } from './format';

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
