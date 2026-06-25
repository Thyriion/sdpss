const STATUS_MAP = {
  Low: "Zu niedrig",
  High: "Zu hoch",
  Ok: "Okay",
  OK: "Okay",
  ok: "Okay",
  Normal: "Okay"
};
function fmt(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString("de-DE", { maximumFractionDigits: 1 });
}
function translateStatus(status) {
  if (!status) return "Unbekannt";
  return STATUS_MAP[status] ?? status;
}
function statusCls(status) {
  if (!status) return "warning";
  return status === "Low" || status === "High" ? "problem" : "ok";
}
function getProblems(attrs) {
  return Array.isArray(attrs.problems) ? attrs.problems : [];
}
function problemByType(problems, type) {
  return problems.find((p) => p.sensor_type === type) ?? null;
}
function statusLabel(problems) {
  if (!problems.length) return "Alles okay";
  return problems.length === 1 ? "1 Problem" : `${problems.length} Probleme`;
}
function getRecommendation(problems, attrs) {
  if (!problems.length) {
    return "Aktuell sind keine Probleme erkannt. Die Pflanze liegt im Zielbereich.";
  }
  const name = attrs.friendly_name ?? "Die Pflanze";
  const moisture = problemByType(problems, "moisture");
  if ((moisture == null ? void 0 : moisture.current) !== void 0 && moisture.min !== void 0 && moisture.max !== void 0) {
    const c = fmt(moisture.current);
    const min = fmt(moisture.min);
    const max = fmt(moisture.max);
    if (moisture.status === "Low") {
      return `Die Bodenfeuchte ist zu niedrig: aktuell ${c} %, Zielbereich ${min}–${max} %. Gieße ${name} vorsichtig und prüfe später erneut.`;
    }
    if (moisture.status === "High") {
      return `Die Bodenfeuchte ist zu hoch: aktuell ${c} %, Zielbereich ${min}–${max} %. Nicht weiter gießen, Staunässe vermeiden.`;
    }
  }
  const light = problemByType(problems, "illuminance") ?? problemByType(problems, "brightness");
  if ((light == null ? void 0 : light.current) !== void 0 && light.min !== void 0 && light.max !== void 0) {
    const c = fmt(light.current);
    const min = fmt(light.min);
    const max = fmt(light.max);
    if (light.status === "Low") {
      return `Die Beleuchtung ist zu niedrig: aktuell ${c} lx, Zielbereich ${min}–${max} lx. Pflanze an einen helleren Standort stellen.`;
    }
    if (light.status === "High") {
      return `Die Beleuchtung ist zu hoch: aktuell ${c} lx, Zielbereich ${min}–${max} lx. Direkte Sonneneinstrahlung reduzieren.`;
    }
  }
  const types = problems.map((p) => p.sensor_type ?? "").filter(Boolean).join(", ");
  return `Probleme erkannt: ${types}.`;
}
const STYLES = `<style>
  .page {
    padding: 24px;
    min-height: 100vh;
    background: transparent;
    color: #e8eaf6;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  h1 {
    margin: 0 0 24px;
    color: #e8eaf6;
  }

  /* ---- Grid ---- */

  .plant-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    max-width: 1100px;
  }

  .plant-card {
    background: rgba(30, 32, 48, 0.75);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.06);
    border-top: 4px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .plant-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }

  .plant-card.ok      { border-top-color: #0b9e9e; }
  .plant-card.problem { border-top-color: #9b3a3a; }
  .plant-card.warning { border-top-color: #c8843a; }

  .card-image {
    height: 160px;
    background: #1e2030 center / cover no-repeat;
  }

  .card-body {
    padding: 16px;
    position: relative;
  }

  .card-name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
    padding-right: 20px;
    color: #e8eaf6;
  }

  .card-species {
    color: #7a8aaa;
    font-size: 13px;
  }

  .card-dot {
    position: absolute;
    top: 18px;
    right: 16px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #2a3a4a;
  }

  .card-dot.ok      { background: #0b9e9e; }
  .card-dot.problem { background: #9b3a3a; }
  .card-dot.warning { background: #c8843a; }

  .empty {
    color: #7a8aaa;
    font-size: 16px;
  }

  /* ---- Detail ---- */

  .back-btn {
    background: none;
    border: none;
    color: #7a8aaa;
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    display: block;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .back-btn:hover {
    color: #0b9e9e;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(260px, 360px) 1fr;
    gap: 24px;
    max-width: 1100px;
  }

  .image-card {
    background: rgba(30, 32, 48, 0.75);
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }

  .plant-image {
    width: 100%;
    height: 260px;
    object-fit: cover;
    display: block;
    background: #1e2030;
  }

  .plant-info {
    padding: 20px;
  }

  .plant-name {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #e8eaf6;
  }

  .plant-species {
    color: #7a8aaa;
    font-size: 16px;
  }

  .sensor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  .card {
    background: rgba(30, 32, 48, 0.75);
    border-radius: 14px;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }

  .label {
    color: #7a8aaa;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 24px;
    font-weight: 700;
    color: #e8eaf6;
  }

  .text-card {
    margin-top: 16px;
    padding: 20px;
    border-radius: 14px;
    background: rgba(30, 32, 48, 0.75);
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }

  .text {
    font-size: 18px;
    line-height: 1.5;
    color: #e8eaf6;
  }

  .recommendation {
    font-size: 20px;
    line-height: 1.5;
    font-weight: 700;
  }

  .ok      { color: #0b9e9e; }
  .warning { color: #c8843a; }
  .problem { color: #9b3a3a; }

  @media (max-width: 800px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>`;
function buildGridHTML(plants) {
  const cards = plants.length ? plants.map(cardHTML).join("") : '<p class="empty">Keine Pflanzen gefunden.</p>';
  return `${STYLES}
    <div class="page">
      <h1>Plant Analyzer</h1>
      <div class="plant-grid">${cards}</div>
    </div>`;
}
function updateGrid(root, plants) {
  for (const plant of plants) {
    const card = root.querySelector(`[data-plant="${plant.entity_id}"]`);
    if (!card) continue;
    const cls = getProblems(plant.attributes).length ? "problem" : "ok";
    card.className = `plant-card ${cls}`;
    const dot = card.querySelector(".card-dot");
    if (dot) dot.className = `card-dot ${cls}`;
  }
}
function cardHTML(plant) {
  const a = plant.attributes;
  const cls = getProblems(a).length ? "problem" : "ok";
  const img = a.entity_picture ? `background-image:url('${a.entity_picture}')` : "";
  return `
    <div class="plant-card ${cls}" data-plant="${plant.entity_id}">
      <div class="card-image" style="${img}"></div>
      <div class="card-body">
        <div class="card-name">${a.friendly_name ?? plant.entity_id}</div>
        <div class="card-species">${a.species ?? ""}</div>
        <div class="card-dot ${cls}"></div>
      </div>
    </div>`;
}
function buildDetailHTML() {
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
function updateDetail(root, plant) {
  const a = plant.attributes;
  const problems = getProblems(a);
  const moisture = problemByType(problems, "moisture");
  const light = problemByType(problems, "illuminance") ?? problemByType(problems, "brightness");
  setText(root, "plant-name", a.friendly_name ?? "Unbekannte Pflanze");
  setText(root, "plant-species", a.species ?? "");
  setText(root, "plant-status", statusLabel(problems));
  setCls(root, "plant-status", problems.length ? "problem" : "ok");
  const moistureVal = (moisture == null ? void 0 : moisture.current) ?? a.moisture ?? null;
  setText(root, "moisture-value", moistureVal != null ? `${fmt(moistureVal)} %` : "–");
  setText(root, "moisture-status", translateStatus(a.moisture_status));
  setCls(root, "moisture-status", statusCls(a.moisture_status));
  const lightVal = (light == null ? void 0 : light.current) ?? a.illuminance ?? a.brightness ?? null;
  setText(root, "light-value", lightVal != null ? `${fmt(lightVal)} lx` : "–");
  const lightStatus = a.illuminance_status ?? a.brightness_status ?? null;
  setText(root, "light-status", translateStatus(lightStatus));
  setCls(root, "light-status", statusCls(lightStatus));
  setText(root, "recommendation", getRecommendation(problems, a));
  setCls(root, "recommendation", problems.length ? "problem" : "ok");
  setText(root, "care-watering", a.care_watering ?? "Keine Angaben.");
  setText(root, "care-sunlight", a.care_sunlight ?? "Keine Angaben.");
  setText(root, "care-soil", a.care_soil ?? "Keine Angaben.");
  setImg(root, "plant-image", a.entity_picture);
}
function setText(root, id, value) {
  const el = root.querySelector(`#${id}`);
  if (el) el.textContent = value;
}
function setImg(root, id, src) {
  const el = root.querySelector(`#${id}`);
  if (!el) return;
  if (!src) {
    el.removeAttribute("src");
    return;
  }
  if (el.src !== src) el.src = src;
}
function setCls(root, id, cls) {
  const el = root.querySelector(`#${id}`);
  if (!el) return;
  el.classList.remove("ok", "warning", "problem");
  el.classList.add(cls);
}
class PlantAnalyzerPanel extends HTMLElement {
  constructor() {
    super(...arguments);
    this._hass = null;
    this._selectedPlantId = null;
    this._renderedView = null;
  }
  set hass(hass) {
    this._hass = hass;
    this._update();
  }
  connectedCallback() {
    this._renderedView = null;
    this._update();
  }
  _getPlants() {
    if (!this._hass) return [];
    return Object.values(this._hass.states).filter((e) => e.entity_id.startsWith("plant.")).sort(
      (a, b) => (a.attributes["friendly_name"] ?? a.entity_id).localeCompare(
        b.attributes["friendly_name"] ?? b.entity_id,
        "de"
      )
    );
  }
  _update() {
    if (!this._hass || !this.isConnected) return;
    const view = this._selectedPlantId ?? "grid";
    if (view !== this._renderedView) {
      this._renderedView = view;
      view === "grid" ? this._buildGrid() : this._buildDetail();
    } else {
      view === "grid" ? this._updateGrid() : this._updateDetail();
    }
  }
  _buildGrid() {
    var _a;
    const plants = this._getPlants();
    this.innerHTML = buildGridHTML(plants);
    for (const plant of plants) {
      (_a = this.querySelector(`[data-plant="${plant.entity_id}"]`)) == null ? void 0 : _a.addEventListener("click", () => {
        this._selectedPlantId = plant.entity_id;
        this._update();
      });
    }
  }
  _updateGrid() {
    updateGrid(this, this._getPlants());
  }
  _buildDetail() {
    var _a, _b;
    const plant = (_a = this._hass) == null ? void 0 : _a.states[this._selectedPlantId];
    if (!plant) {
      this._selectedPlantId = null;
      this._buildGrid();
      return;
    }
    this.innerHTML = buildDetailHTML();
    (_b = this.querySelector(".back-btn")) == null ? void 0 : _b.addEventListener("click", () => {
      this._selectedPlantId = null;
      this._update();
    });
    this._updateDetail();
  }
  _updateDetail() {
    var _a;
    const plant = (_a = this._hass) == null ? void 0 : _a.states[this._selectedPlantId];
    if (!plant) return;
    updateDetail(this, plant);
  }
}
const DASHBOARD_STYLES = `<style>
  * { box-sizing: border-box; }

  .dashboard {
    padding: 20px 24px;
    min-height: 100vh;
    background: transparent;
    color: #e8eaf6;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ---- Header ---- */

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-star {
    color: #0b9e9e;
    font-size: 22px;
  }

  .header-title {
    font-size: 22px;
    font-weight: 700;
    color: #e8eaf6;
  }

  .header-date {
    font-size: 13px;
    color: #7a8aaa;
    margin-top: 2px;
  }

  .header-badges {
    display: flex;
    gap: 8px;
  }

  .badge {
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }

  .badge-ok {
    background: rgba(11, 158, 158, 0.15);
    color: #0b9e9e;
    border: 1px solid rgba(11, 158, 158, 0.3);
  }

  .badge-ok::before { content: '● '; }

  .badge-warn {
    background: rgba(200, 132, 58, 0.12);
    color: #c8843a;
    border: 1px solid rgba(200, 132, 58, 0.25);
  }

  /* ---- Card base ---- */

  .metric-card,
  .plant-list-card,
  .greenhouse-card,
  .bottom-card {
    background: rgba(30, 32, 48, 0.75);
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    padding: 20px;
  }

  /* ---- Section label ---- */

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #7a8aaa;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  /* ---- Metrics row ---- */

  .metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .metric-card {
    position: relative;
    overflow: hidden;
  }

  .metric-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #7a8aaa;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .metric-icon {
    position: absolute;
    top: 18px;
    right: 18px;
    font-size: 20px;
    opacity: 0.3;
  }

  .metric-value {
    font-size: 42px;
    font-weight: 700;
    color: #e8eaf6;
    line-height: 1;
    margin-bottom: 10px;
  }

  .metric-value .unit {
    font-size: 20px;
    font-weight: 400;
    color: #7a8aaa;
  }

  .metric-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #7a8aaa;
  }

  /* ---- Main row ---- */

  .main-row {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 16px;
  }

  /* ---- Plant list ---- */

  .plant-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 11px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .plant-row:last-child { border-bottom: none; }

  .plant-row-info {
    min-width: 200px;
  }

  .plant-row-name {
    font-size: 15px;
    font-weight: 600;
    color: #e8eaf6;
    margin-bottom: 2px;
  }

  .plant-row-species {
    font-size: 12px;
    color: #7a8aaa;
    font-style: italic;
  }

  .plant-row-right {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bar-track {
    flex: 1;
    height: 6px;
    background: rgba(255,255,255,0.08);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .bar-fill.ok      { background: #0b9e9e; }
  .bar-fill.warning { background: #c8843a; }
  .bar-fill.problem { background: #9b3a3a; }

  .bar-value {
    font-size: 14px;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }

  .bar-value.ok      { color: #0b9e9e; }
  .bar-value.warning { color: #c8843a; }
  .bar-value.problem { color: #9b3a3a; }

  /* ---- Greenhouse card ---- */

  .greenhouse-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 4px;
  }

  .gh-label {
    font-size: 11px;
    color: #7a8aaa;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 3px;
  }

  .gh-value {
    font-size: 22px;
    font-weight: 700;
    color: #e8eaf6;
  }

  /* ---- Light chart ---- */

  .light-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 48px;
  }

  .chart-bar {
    flex: 1;
    border-radius: 2px 2px 0 0;
    background: rgba(255,255,255,0.08);
    min-height: 4px;
  }

  .chart-bar.active { background: #0b9e9e; opacity: 0.8; }

  /* ---- Bottom row ---- */

  .bottom-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .bottom-card {
    position: relative;
    overflow: hidden;
  }

  .bottom-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #7a8aaa;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .bottom-icon {
    position: absolute;
    top: 18px;
    right: 18px;
    font-size: 20px;
    opacity: 0.25;
  }

  .bottom-value {
    font-size: 36px;
    font-weight: 700;
    color: #e8eaf6;
    line-height: 1.2;
    margin-bottom: 10px;
  }

  .bottom-value .unit {
    font-size: 18px;
    font-weight: 400;
    color: #7a8aaa;
  }

  .bottom-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #7a8aaa;
  }

  /* ---- Status dot ---- */

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot.ok      { background: #0b9e9e; }
  .dot.warning { background: #c8843a; }
  .dot.problem { background: #9b3a3a; }

  /* ---- Responsive ---- */

  @media (max-width: 1000px) {
    .main-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 800px) {
    .metrics-row { grid-template-columns: 1fr 1fr; }
    .bottom-row  { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 500px) {
    .metrics-row { grid-template-columns: 1fr; }
    .bottom-row  { grid-template-columns: 1fr; }
  }
</style>`;
const ENTITIES = {
  light: "sensor.greenhouse_esp32_bh1750_illuminance",
  // lux
  temperature: "sensor.greenhouse_esp32_bme280_temperature",
  // °C
  humidity: "sensor.greenhouse_esp32_bme280_humidity",
  // %
  rainTank: "sensor.regenwassertank_liter",
  // L (template sensor)
  solarBattery: "sensor.solar_esp_outdoor_akku",
  // %
  lastAction: "input_text.letzte_bewasserung"
  // format: "Titel|Details"
};
const RAIN_TANK_MAX_L = 200;
class PflanzenmonitorDashboard extends HTMLElement {
  constructor() {
    super(...arguments);
    this._hass = null;
    this._built = false;
    this._timer = null;
  }
  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._build();
    } else {
      this._update();
    }
  }
  connectedCallback() {
    this._built = false;
    if (this._hass) this._build();
    this._timer = setInterval(() => this._updateClock(), 3e4);
  }
  disconnectedCallback() {
    if (this._timer !== null) clearInterval(this._timer);
    this._timer = null;
  }
  _build() {
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
  _update() {
    if (!this._hass || !this._built) return;
    const s = this._hass.states;
    const plants = this._getPlants();
    const problemCount = plants.filter(
      (p) => Array.isArray(p.attributes["problems"]) && p.attributes["problems"].length > 0
    ).length;
    this._text("badge-ok", `${plants.length - problemCount} ok`);
    this._text("badge-warn", `${problemCount} Aufmerksamkeit`);
    const moistureVals = plants.flatMap((p) => {
      const v = p.attributes["moisture"];
      return typeof v === "number" && !isNaN(v) ? [v] : [];
    });
    if (moistureVals.length) {
      const avg = Math.round(moistureVals.reduce((a, b) => a + b) / moistureVals.length);
      this._html("m-moisture", `${avg} <span class="unit">%</span>`);
      const cls = avg < 20 ? "problem" : avg < 30 ? "warning" : "ok";
      const label = cls === "ok" ? "Optimal" : cls === "warning" ? "Zu trocken" : "Kritisch";
      this._dot("m-moisture-s", cls, label);
    }
    const lightEnt = s[ENTITIES.light];
    if (lightEnt && lightEnt.state !== "unavailable") {
      const lux = parseFloat(lightEnt.state);
      const klx = (lux / 1e3).toFixed(1);
      this._html("m-light", `${klx} <span class="unit">klx</span>`);
      this._dot("m-light-s", lux > 500 ? "ok" : "warning", lux > 500 ? "Gut belichtet" : "Schwach belichtet");
      this._text("gh-light", `${klx} klx`);
      this._buildLightChart(lux);
    }
    const tempEnt = s[ENTITIES.temperature];
    if (tempEnt && tempEnt.state !== "unavailable") {
      const t = parseFloat(tempEnt.state);
      this._html("m-temp", `${Math.round(t)} <span class="unit">°C</span>`);
      const cls = t >= 18 && t <= 28 ? "ok" : "warning";
      this._dot("m-temp-s", cls, cls === "ok" ? "Idealer Bereich" : "Außerhalb Bereich");
      this._text("gh-temp", `${Math.round(t)} °C`);
    }
    const humEnt = s[ENTITIES.humidity];
    if (humEnt && humEnt.state !== "unavailable") {
      this._text("gh-hum", `${Math.round(parseFloat(humEnt.state))} %`);
    }
    this._text("gh-plants", String(plants.length));
    this._buildPlantList(plants);
    const tankEnt = s[ENTITIES.rainTank];
    if (tankEnt && tankEnt.state !== "unavailable") {
      const liters = Math.round(parseFloat(tankEnt.state));
      this._html("b-tank", `${liters} <span class="unit">L</span>`);
      const pct = Math.round(liters / RAIN_TANK_MAX_L * 100);
      this._dot("b-tank-s", pct > 20 ? "ok" : "warning", `${pct}% voll`);
    }
    const solarEnt = s[ENTITIES.solarBattery];
    if (solarEnt && solarEnt.state !== "unavailable") {
      const pct = Math.round(parseFloat(solarEnt.state));
      this._html("b-solar", `${pct} <span class="unit">%</span>`);
      const cls = pct > 20 ? "ok" : "warning";
      const label = pct > 80 ? "Akku geladen" : pct > 20 ? "Akku lädt" : "Akku niedrig";
      this._dot("b-solar-s", cls, label);
    }
    const actionEnt = s[ENTITIES.lastAction];
    if (actionEnt && actionEnt.state !== "unavailable" && actionEnt.state !== "") {
      const parts = actionEnt.state.split("|");
      this._text("b-action", parts[0] ?? actionEnt.state);
      this._text("b-action-d", parts[1] ?? "");
    }
  }
  _buildPlantList(plants) {
    const list = this.querySelector("#plant-list");
    if (!list) return;
    list.innerHTML = plants.map((p) => {
      const a = p.attributes;
      const name = a["friendly_name"] ?? p.entity_id;
      const species = a["species"] ?? "";
      const moisture = a["moisture"];
      const moistureStatus = a["moisture_status"];
      const cls = moisture != null ? moisture < 20 ? "problem" : moisture < 30 ? "warning" : "ok" : moistureStatus === "Low" ? "problem" : moistureStatus === "High" ? "warning" : "ok";
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
          <span class="bar-value ${cls}">${pct != null ? pct + "%" : moistureStatus ?? "–"}</span>
        </div>
      </div>`;
    }).join("");
  }
  _buildLightChart(currentLux) {
    const chart = this.querySelector("#light-chart");
    if (!chart) return;
    const hour = (/* @__PURE__ */ new Date()).getHours();
    const slots = [7, 9, 11, 13, 15, 17, 19, 21];
    const lastActive = slots.filter((h) => h <= hour).at(-1) ?? -1;
    const values = slots.map((h) => {
      if (h > hour) return 0;
      if (h === lastActive) return Math.max(0.05, currentLux / 5e3);
      return Math.exp(-Math.pow(h - 13, 2) / 20) * (currentLux / 5e3);
    });
    const max = Math.max(...values, 0.01);
    chart.innerHTML = values.map((v, i) => {
      const heightPct = Math.max(4, Math.round(v / max * 100));
      const active = slots[i] <= hour;
      return `<div class="chart-bar ${active ? "active" : ""}" style="height:${heightPct}%"></div>`;
    }).join("");
  }
  _updateClock() {
    const now = /* @__PURE__ */ new Date();
    const date = now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const time = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    this._text("hdr-date", `${date} · ${time}`);
  }
  _getPlants() {
    if (!this._hass) return [];
    return Object.values(this._hass.states).filter((e) => e.entity_id.startsWith("plant.")).sort(
      (a, b) => (a.attributes["friendly_name"] ?? a.entity_id).localeCompare(
        b.attributes["friendly_name"] ?? b.entity_id,
        "de"
      )
    );
  }
  _text(id, val) {
    const el = this.querySelector(`#${id}`);
    if (el) el.textContent = val;
  }
  _html(id, val) {
    const el = this.querySelector(`#${id}`);
    if (el) el.innerHTML = val;
  }
  _dot(id, cls, label) {
    const el = this.querySelector(`#${id}`);
    if (el) el.innerHTML = `<span class="dot ${cls}"></span>${label}`;
  }
}
customElements.define("plant-analyzer-panel", PlantAnalyzerPanel);
customElements.define("pflanzenmonitor-dashboard", PflanzenmonitorDashboard);
