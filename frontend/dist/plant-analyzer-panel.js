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
customElements.define("plant-analyzer-panel", PlantAnalyzerPanel);
