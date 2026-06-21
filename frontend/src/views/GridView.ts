import { HassEntity, PlantAttributes } from '../types';
import { getProblems } from '../utils/plants';
import { STYLES } from '../styles';

export function buildGridHTML(plants: HassEntity[]): string {
  const cards = plants.length
    ? plants.map(cardHTML).join('')
    : '<p class="empty">Keine Pflanzen gefunden.</p>';

  return `${STYLES}
    <div class="page">
      <h1>Plant Analyzer</h1>
      <div class="plant-grid">${cards}</div>
    </div>`;
}

export function updateGrid(root: HTMLElement, plants: HassEntity[]): void {
  for (const plant of plants) {
    const card = root.querySelector<HTMLElement>(`[data-plant="${plant.entity_id}"]`);
    if (!card) continue;

    const cls = getProblems(plant.attributes as PlantAttributes).length ? 'problem' : 'ok';
    card.className = `plant-card ${cls}`;

    const dot = card.querySelector('.card-dot');
    if (dot) dot.className = `card-dot ${cls}`;
  }
}

function cardHTML(plant: HassEntity): string {
  const a = plant.attributes as PlantAttributes;
  const cls = getProblems(a).length ? 'problem' : 'ok';
  const img = a.entity_picture ? `background-image:url('${a.entity_picture}')` : '';

  return `
    <div class="plant-card ${cls}" data-plant="${plant.entity_id}">
      <div class="card-image" style="${img}"></div>
      <div class="card-body">
        <div class="card-name">${a.friendly_name ?? plant.entity_id}</div>
        <div class="card-species">${a.species ?? ''}</div>
        <div class="card-dot ${cls}"></div>
      </div>
    </div>`;
}
