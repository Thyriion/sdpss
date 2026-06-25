import { Hass, HassEntity } from './types';
import { DASHBOARD_STYLES } from './dashboard/DashboardStyles';

// Adjust these entity IDs to match your HA setup
const ENTITIES = {
  light:        'sensor.greenhouse_esp32_bh1750_illuminance',  // lux
  temperature:  'sensor.greenhouse_esp32_bme280_temperature',  // °C
  humidity:     'sensor.greenhouse_esp32_bme280_humidity',     // %
  rainTank:     'sensor.regenwassertank_liter',                // L (template sensor)
  solarBattery: 'sensor.solar_esp_outdoor_akku',              // %
  lastAction:   'input_text.letzte_bewasserung',              // format: "Titel|Details"
};

// Adjust to your actual tank capacity in liters
const RAIN_TANK_MAX_L = 200;

export class PflanzenmonitorDashboard extends HTMLElement {
  private _hass: Hass | null = null;
  private _built = false;
  private _timer: ReturnType<typeof setInterval> | null = null;

  set hass(hass: Hass) {
    this._hass = hass;
    if (!this._built) {
      this._build();
    } else {
      this._update();
    }
  }

  connectedCallback(): void {
    this._built = false;
    if (this._hass) this._build();
    this._timer = setInterval(() => this._updateClock(), 30_000);
  }

  disconnectedCallback(): void {
    if (this._timer !== null) clearInterval(this._timer);
    this._timer = null;
  }

  private _build(): void {
    this._built = true;
    this.innerHTML = DASHBOARD_STYLES + `
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

    this._updateClock();
    this._update();
  }

  private _update(): void {
    if (!this._hass || !this._built) return;

    const s = this._hass.states;
    const plants = this._getPlants();

    // Status badges
    const problemCount = plants.filter(p =>
      Array.isArray(p.attributes['problems']) && (p.attributes['problems'] as unknown[]).length > 0
    ).length;
    this._text('badge-ok', `${plants.length - problemCount} ok`);
    this._text('badge-warn', `${problemCount} Aufmerksamkeit`);

    // Average moisture
    const moistureVals = plants.flatMap(p => {
      const v = p.attributes['moisture'] as number | undefined;
      return typeof v === 'number' && !isNaN(v) ? [v] : [];
    });
    if (moistureVals.length) {
      const avg = Math.round(moistureVals.reduce((a, b) => a + b) / moistureVals.length);
      this._html('m-moisture', `${avg} <span class="unit">%</span>`);
      const cls = avg < 20 ? 'problem' : avg < 30 ? 'warning' : 'ok';
      const label = cls === 'ok' ? 'Optimal' : cls === 'warning' ? 'Zu trocken' : 'Kritisch';
      this._dot('m-moisture-s', cls, label);
    }

    // Light
    const lightEnt = s[ENTITIES.light];
    if (lightEnt && lightEnt.state !== 'unavailable') {
      const lux = parseFloat(lightEnt.state);
      const klx = (lux / 1000).toFixed(1);
      this._html('m-light', `${klx} <span class="unit">klx</span>`);
      this._dot('m-light-s', lux > 500 ? 'ok' : 'warning', lux > 500 ? 'Gut belichtet' : 'Schwach belichtet');
      this._text('gh-light', `${klx} klx`);
      this._buildLightChart(lux);
    }

    // Temperature
    const tempEnt = s[ENTITIES.temperature];
    if (tempEnt && tempEnt.state !== 'unavailable') {
      const t = parseFloat(tempEnt.state);
      this._html('m-temp', `${Math.round(t)} <span class="unit">°C</span>`);
      const cls = t >= 18 && t <= 28 ? 'ok' : 'warning';
      this._dot('m-temp-s', cls, cls === 'ok' ? 'Idealer Bereich' : 'Außerhalb Bereich');
      this._text('gh-temp', `${Math.round(t)} °C`);
    }

    // Humidity
    const humEnt = s[ENTITIES.humidity];
    if (humEnt && humEnt.state !== 'unavailable') {
      this._text('gh-hum', `${Math.round(parseFloat(humEnt.state))} %`);
    }

    // Plant count
    this._text('gh-plants', String(plants.length));

    // Plant list
    this._buildPlantList(plants);

    // Rain tank
    const tankEnt = s[ENTITIES.rainTank];
    if (tankEnt && tankEnt.state !== 'unavailable') {
      const liters = Math.round(parseFloat(tankEnt.state));
      this._html('b-tank', `${liters} <span class="unit">L</span>`);
      const pct = Math.round((liters / RAIN_TANK_MAX_L) * 100);
      this._dot('b-tank-s', pct > 20 ? 'ok' : 'warning', `${pct}% voll`);
    }

    // Solar battery
    const solarEnt = s[ENTITIES.solarBattery];
    if (solarEnt && solarEnt.state !== 'unavailable') {
      const pct = Math.round(parseFloat(solarEnt.state));
      this._html('b-solar', `${pct} <span class="unit">%</span>`);
      const cls = pct > 20 ? 'ok' : 'warning';
      const label = pct > 80 ? 'Akku geladen' : pct > 20 ? 'Akku lädt' : 'Akku niedrig';
      this._dot('b-solar-s', cls, label);
    }

    // Last action
    const actionEnt = s[ENTITIES.lastAction];
    if (actionEnt && actionEnt.state !== 'unavailable' && actionEnt.state !== '') {
      const parts = actionEnt.state.split('|');
      this._text('b-action', parts[0] ?? actionEnt.state);
      this._text('b-action-d', parts[1] ?? '');
    }
  }

  private _buildPlantList(plants: HassEntity[]): void {
    const list = this.querySelector('#plant-list');
    if (!list) return;

    list.innerHTML = plants.map(p => {
      const a = p.attributes;
      const name = (a['friendly_name'] as string) ?? p.entity_id;
      const species = (a['species'] as string) ?? '';
      const moisture = a['moisture'] as number | undefined;
      const moistureStatus = a['moisture_status'] as string | undefined;

      const cls = moisture != null
        ? (moisture < 20 ? 'problem' : moisture < 30 ? 'warning' : 'ok')
        : (moistureStatus === 'Low' ? 'problem' : moistureStatus === 'High' ? 'warning' : 'ok');
      const pct = moisture != null ? Math.min(100, Math.max(0, Math.round(moisture))) : null;

      return `<div class="plant-row">
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

  private _buildLightChart(currentLux: number): void {
    const chart = this.querySelector('#light-chart');
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
      const active = slots[i] <= hour;
      return `<div class="chart-bar ${active ? 'active' : ''}" style="height:${heightPct}%"></div>`;
    }).join('');
  }

  private _updateClock(): void {
    const now = new Date();
    const date = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    this._text('hdr-date', `${date} · ${time}`);
  }

  private _getPlants(): HassEntity[] {
    if (!this._hass) return [];
    return Object.values(this._hass.states)
      .filter(e => e.entity_id.startsWith('plant.'))
      .sort((a, b) =>
        ((a.attributes['friendly_name'] as string) ?? a.entity_id).localeCompare(
          (b.attributes['friendly_name'] as string) ?? b.entity_id, 'de'
        )
      );
  }

  private _text(id: string, val: string): void {
    const el = this.querySelector(`#${id}`);
    if (el) el.textContent = val;
  }

  private _html(id: string, val: string): void {
    const el = this.querySelector(`#${id}`);
    if (el) el.innerHTML = val;
  }

  private _dot(id: string, cls: 'ok' | 'warning' | 'problem', label: string): void {
    const el = this.querySelector(`#${id}`);
    if (el) el.innerHTML = `<span class="dot ${cls}"></span>${label}`;
  }
}
