import { HassEntity, PlantAttributes } from '../types';
import { fmt, translateStatus, statusCls } from '../utils/format';
import { getProblems, problemByType, statusLabel, getRecommendation, getPlantSensorValue } from '../utils/plants';
import { DETAIL_STYLES as STYLES } from '../styles';

export function buildDetailHTML(): string {
  return `${STYLES}
    <div class="page">
      <button class="back-btn">← Zurück</button>
      <div class="layout">
        <div class="image-card">
          <img id="plant-image" class="plant-image" alt="" />
          <div class="plant-info">
            <div id="plant-name" class="plant-name"></div>
            <div id="plant-species" class="plant-species"></div>
          </div>
        </div>
        <div>
          <div class="sensor-grid">
            <div class="card">
              <div class="label">Status</div>
              <div id="plant-status" class="value"></div>
            </div>
            <div class="card">
              <div class="label">Bodenfeuchte</div>
              <div id="moisture-value" class="value"></div>
            </div>
            <div class="card">
              <div class="label">Feuchte-Status</div>
              <div id="moisture-status" class="value"></div>
            </div>
            <div class="card">
              <div class="label">Licht</div>
              <div id="light-value" class="value"></div>
            </div>
            <div class="card">
              <div class="label">Licht-Status</div>
              <div id="light-status" class="value"></div>
            </div>
          </div>
          <div class="text-card">
            <div class="label">Empfehlung</div>
            <div id="recommendation" class="recommendation"></div>
          </div>
          <div class="text-card">
            <div class="label">Gießen</div>
            <div id="care-watering" class="text"></div>
          </div>
          <div class="text-card">
            <div class="label">Licht</div>
            <div id="care-sunlight" class="text"></div>
          </div>
          <div class="text-card">
            <div class="label">Boden</div>
            <div id="care-soil" class="text"></div>
          </div>
        </div>
      </div>
    </div>`;
}

export function updateDetail(
  root: HTMLElement,
  plant: HassEntity,
  states: Record<string, HassEntity>
): void {
  const a = plant.attributes as PlantAttributes;
  const problems = getProblems(a);

  setText(root, 'plant-name', a.friendly_name ?? 'Unbekannte Pflanze');
  setText(root, 'plant-species', a.species ?? '');
  setText(root, 'plant-status', statusLabel(problems));
  setCls(root, 'plant-status', problems.length ? 'problem' : 'ok');

  const moistureVal = getPlantSensorValue('moisture', plant.attributes, states, problems, plant.entity_id);
  setText(root, 'moisture-value', moistureVal != null ? `${fmt(moistureVal)} %` : '–');
  setText(root, 'moisture-status', translateStatus(a.moisture_status));
  setCls(root, 'moisture-status', statusCls(a.moisture_status));

  const lightVal =
    getPlantSensorValue('illuminance', plant.attributes, states, problems, plant.entity_id) ??
    getPlantSensorValue('brightness', plant.attributes, states, problems, plant.entity_id);
  setText(root, 'light-value', lightVal != null ? `${fmt(lightVal)} lx` : '–');
  const lightStatus = a.illuminance_status ?? a.brightness_status ?? null;
  setText(root, 'light-status', translateStatus(lightStatus));
  setCls(root, 'light-status', statusCls(lightStatus));

  setText(root, 'recommendation', getRecommendation(problems, a));
  setCls(root, 'recommendation', problems.length ? 'problem' : 'ok');

  setText(root, 'care-watering', a.care_watering ?? 'Keine Angaben.');
  setText(root, 'care-sunlight', a.care_sunlight ?? 'Keine Angaben.');
  setText(root, 'care-soil', a.care_soil ?? 'Keine Angaben.');
  setImg(root, 'plant-image', a.entity_picture);
}

function setText(root: HTMLElement, id: string, value: string): void {
  const el = root.querySelector(`#${id}`);
  if (el) el.textContent = value;
}

function setImg(root: HTMLElement, id: string, src?: string): void {
  const el = root.querySelector<HTMLImageElement>(`#${id}`);
  if (!el) return;
  if (!src) { el.removeAttribute('src'); return; }
  if (el.src !== src) el.src = src;
}

function setCls(root: HTMLElement, id: string, cls: string): void {
  const el = root.querySelector(`#${id}`);
  if (!el) return;
  el.classList.remove('ok', 'warning', 'problem');
  el.classList.add(cls);
}
