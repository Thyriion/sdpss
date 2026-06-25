import { HassEntity, EntityConfig } from '../types';
import { STYLES } from '../styles';
import { getPlantSensorValue } from '../utils/plants';

export const DEFAULT_ENTITIES: Required<EntityConfig> = {
  light:        'sensor.greenhouse_esp32_bh1750_illuminance',
  temperature:  'sensor.greenhouse_esp32_bme280_temperature',
  humidity:     'sensor.greenhouse_esp32_bme280_humidity',
  rainTank:     'sensor.regenwassertank_liter',
  solarBattery: 'sensor.solar_esp_outdoor_akku',
  lastAction:   'input_text.letzte_bewasserung',
};

export const DEFAULT_TANK_MAX_L = 200;

export function buildDashboardHTML(): string {
  return `${STYLES}
    <div class="dashboard">

      <div class="dashboard-header">
        <div class="header-left">
          <span class="header-star">✦</span>
          <div>
            <div class="header-title">Pflanzenmonitor</div>
            <div id="hdr-date" class="header-date"></div>
          </div>
        </div>
        <div class="header-badges">
          <span id="badge-ok" class="badge badge-ok"></span>
          <span id="badge-warn" class="badge badge-warn"></span>
        </div>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-label">Ø Bodenfeuchte</div>
          <div class="metric-icon">💧</div>
          <div id="m-moisture" class="metric-value">–</div>
          <div id="m-moisture-s" class="metric-status"></div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Licht (Gewächshaus)</div>
          <div class="metric-icon">☀</div>
          <div id="m-light" class="metric-value">–</div>
          <div id="m-light-s" class="metric-status"></div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Temperatur</div>
          <div class="metric-icon">🌡</div>
          <div id="m-temp" class="metric-value">–</div>
          <div id="m-temp-s" class="metric-status"></div>
        </div>
      </div>

      <div class="main-row">
        <div class="plant-list-card">
          <div class="section-label">Pflanzen — Feuchtigkeitsstatus</div>
          <div id="plant-list"></div>
        </div>
        <div class="greenhouse-card">
          <div class="section-label">Gewächshaus</div>
          <div class="greenhouse-grid">
            <div>
              <div class="gh-label">Luftfeuchte</div>
              <div id="gh-hum" class="gh-value">–</div>
            </div>
            <div>
              <div class="gh-label">Temp.</div>
              <div id="gh-temp" class="gh-value">–</div>
            </div>
            <div>
              <div class="gh-label">Licht</div>
              <div id="gh-light" class="gh-value">–</div>
            </div>
            <div>
              <div class="gh-label">Pflanzen</div>
              <div id="gh-plants" class="gh-value">–</div>
            </div>
          </div>
          <div class="section-label" style="margin-top:16px">Licht heute</div>
          <div id="light-chart" class="light-chart"></div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="bottom-card">
          <div class="bottom-label">Regenwassertank</div>
          <div class="bottom-icon">☁</div>
          <div id="b-tank" class="bottom-value">–</div>
          <div id="b-tank-s" class="bottom-status"></div>
        </div>
        <div class="bottom-card">
          <div class="bottom-label">Letzte Aktion</div>
          <div class="bottom-icon">🔔</div>
          <div id="b-action" class="bottom-value" style="font-size:20px;line-height:1.4">–</div>
          <div id="b-action-d" class="bottom-status"></div>
        </div>
        <div class="bottom-card">
          <div class="bottom-label">Solar-ESP (Outdoor)</div>
          <div class="bottom-icon">☀</div>
          <div id="b-solar" class="bottom-value">–</div>
          <div id="b-solar-s" class="bottom-status"></div>
        </div>
      </div>

    </div>`;
}

export function updateDashboard(
  root: HTMLElement,
  plants: HassEntity[],
  states: Record<string, HassEntity>,
  entities: Required<EntityConfig> = DEFAULT_ENTITIES,
  tankMaxL: number = DEFAULT_TANK_MAX_L
): void {
  updateClock(root);

  // Badges
  const problemCount = plants.filter(p =>
    Array.isArray(p.attributes['problems']) && (p.attributes['problems'] as unknown[]).length > 0
  ).length;
  setText(root, 'badge-ok', `${plants.length - problemCount} ok`);
  setText(root, 'badge-warn', `${problemCount} Aufmerksamkeit`);

  // Average moisture
  const moistureVals = plants.flatMap(p => {
    const v = p.attributes['moisture'] as number | undefined;
    return typeof v === 'number' && !isNaN(v) ? [v] : [];
  });
  if (moistureVals.length) {
    const avg = Math.round(moistureVals.reduce((a, b) => a + b) / moistureVals.length);
    setHtml(root, 'm-moisture', `${avg} <span class="unit">%</span>`);
    const cls = avg < 20 ? 'problem' : avg < 30 ? 'warning' : 'ok';
    setDot(root, 'm-moisture-s', cls, cls === 'ok' ? 'Optimal' : cls === 'warning' ? 'Zu trocken' : 'Kritisch');
  }

  // Light
  const lightEnt = states[entities.light];
  if (lightEnt && lightEnt.state !== 'unavailable') {
    const lux = parseFloat(lightEnt.state);
    const klx = (lux / 1000).toFixed(1);
    setHtml(root, 'm-light', `${klx} <span class="unit">klx</span>`);
    setDot(root, 'm-light-s', lux > 500 ? 'ok' : 'warning', lux > 500 ? 'Gut belichtet' : 'Schwach belichtet');
    setText(root, 'gh-light', `${klx} klx`);
    buildLightChart(root, lux);
  }

  // Temperature
  const tempEnt = states[entities.temperature];
  if (tempEnt && tempEnt.state !== 'unavailable') {
    const t = parseFloat(tempEnt.state);
    setHtml(root, 'm-temp', `${Math.round(t)} <span class="unit">°C</span>`);
    const cls = t >= 18 && t <= 28 ? 'ok' : 'warning';
    setDot(root, 'm-temp-s', cls, cls === 'ok' ? 'Idealer Bereich' : 'Außerhalb Bereich');
    setText(root, 'gh-temp', `${Math.round(t)} °C`);
  }

  // Humidity
  const humEnt = states[entities.humidity];
  if (humEnt && humEnt.state !== 'unavailable') {
    setText(root, 'gh-hum', `${Math.round(parseFloat(humEnt.state))} %`);
  }

  // Plant count
  setText(root, 'gh-plants', String(plants.length));

  // Plant list
  buildPlantList(root, plants, states);

  // Rain tank
  const tankEnt = states[entities.rainTank];
  if (tankEnt && tankEnt.state !== 'unavailable') {
    const liters = Math.round(parseFloat(tankEnt.state));
    setHtml(root, 'b-tank', `${liters} <span class="unit">L</span>`);
    const pct = Math.round((liters / tankMaxL) * 100);
    setDot(root, 'b-tank-s', pct > 20 ? 'ok' : 'warning', `${pct}% voll`);
  }

  // Solar battery
  const solarEnt = states[entities.solarBattery];
  if (solarEnt && solarEnt.state !== 'unavailable') {
    const pct = Math.round(parseFloat(solarEnt.state));
    setHtml(root, 'b-solar', `${pct} <span class="unit">%</span>`);
    const cls = pct > 20 ? 'ok' : 'warning';
    setDot(root, 'b-solar-s', cls, pct > 80 ? 'Akku geladen' : pct > 20 ? 'Akku lädt' : 'Akku niedrig');
  }

  // Last action
  const actionEnt = states[entities.lastAction];
  if (actionEnt && actionEnt.state !== 'unavailable' && actionEnt.state !== '') {
    const parts = actionEnt.state.split('|');
    setText(root, 'b-action', parts[0] ?? actionEnt.state);
    setText(root, 'b-action-d', parts[1] ?? '');
  }
}

function buildPlantList(root: HTMLElement, plants: HassEntity[], states: Record<string, HassEntity>): void {
  const list = root.querySelector('#plant-list');
  if (!list) return;

  list.innerHTML = plants.map(p => {
    const a = p.attributes;
    const name = (a['friendly_name'] as string) ?? p.entity_id;
    const species = (a['species'] as string) ?? '';
    const problems = Array.isArray(a['problems']) ? a['problems'] as { sensor_type?: string; current?: number }[] : [];
    const moisture = getPlantSensorValue('moisture', a, states, problems, p.entity_id);
    const moistureStatus = a['moisture_status'] as string | undefined;

    const cls = moisture != null
      ? (moisture < 20 ? 'problem' : moisture < 30 ? 'warning' : 'ok')
      : (moistureStatus === 'Low' ? 'problem' : moistureStatus === 'High' ? 'warning' : 'ok');
    const pct = moisture != null ? Math.min(100, Math.max(0, Math.round(moisture))) : null;

    return `<div class="plant-row" data-plant="${p.entity_id}">
      <div class="plant-row-info">
        <div class="plant-row-name">${name}</div>
        <div class="plant-row-species">${species}</div>
      </div>
      <div class="plant-row-right">
        <div class="bar-track">
          <div class="bar-fill ${cls}" style="width:${pct ?? 0}%"></div>
        </div>
        <span class="bar-value ${cls}">${pct != null ? pct + '%' : (moistureStatus ?? '–')}</span>
      </div>
    </div>`;
  }).join('');
}

function buildLightChart(root: HTMLElement, currentLux: number): void {
  const chart = root.querySelector('#light-chart');
  if (!chart) return;

  const hour = new Date().getHours();
  const slots = [7, 9, 11, 13, 15, 17, 19, 21];
  const lastActive = slots.filter(h => h <= hour).at(-1) ?? -1;

  const values = slots.map(h => {
    if (h > hour) return 0;
    if (h === lastActive) return Math.max(0.05, currentLux / 5000);
    return Math.exp(-Math.pow(h - 13, 2) / 20) * (currentLux / 5000);
  });

  const max = Math.max(...values, 0.01);
  chart.innerHTML = values.map((v, i) => {
    const heightPct = Math.max(4, Math.round((v / max) * 100));
    return `<div class="chart-bar ${slots[i] <= hour ? 'active' : ''}" style="height:${heightPct}%"></div>`;
  }).join('');
}

export function updateClock(root: HTMLElement): void {
  const el = root.querySelector('#hdr-date');
  if (!el) return;
  const now = new Date();
  const date = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  el.textContent = `${date} · ${time}`;
}

function setText(root: HTMLElement, id: string, val: string): void {
  const el = root.querySelector(`#${id}`);
  if (el) el.textContent = val;
}

function setHtml(root: HTMLElement, id: string, val: string): void {
  const el = root.querySelector(`#${id}`);
  if (el) el.innerHTML = val;
}

function setDot(root: HTMLElement, id: string, cls: 'ok' | 'warning' | 'problem', label: string): void {
  const el = root.querySelector(`#${id}`);
  if (el) el.innerHTML = `<span class="dot ${cls}"></span>${label}`;
}
