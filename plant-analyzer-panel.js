const STYLES = `<style>
  .page {
    padding: 24px;
    min-height: 100vh;
    background: #111;
    color: white;
    font-family: sans-serif;
  }

  h1 {
    margin: 0 0 24px;
  }

  /* ---- Grid ---- */

  .plant-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    max-width: 1100px;
  }

  .plant-card {
    background: #222;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    border-top: 4px solid #555;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .plant-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .plant-card.ok      { border-top-color: #7ee787; }
  .plant-card.problem { border-top-color: #ff7b72; }
  .plant-card.warning { border-top-color: #ffd166; }

  .card-image {
    height: 160px;
    background: #333 center / cover no-repeat;
  }

  .card-body {
    padding: 16px;
    position: relative;
  }

  .card-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 4px;
    padding-right: 20px;
  }

  .card-species {
    color: #aaa;
    font-size: 13px;
  }

  .card-dot {
    position: absolute;
    top: 18px;
    right: 16px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #555;
  }

  .card-dot.ok      { background: #7ee787; }
  .card-dot.problem { background: #ff7b72; }
  .card-dot.warning { background: #ffd166; }

  .empty {
    color: #aaa;
    font-size: 16px;
  }

  /* ---- Detail ---- */

  .back-btn {
    background: none;
    border: none;
    color: #aaa;
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    display: block;
  }

  .back-btn:hover {
    color: white;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(260px, 360px) 1fr;
    gap: 24px;
    max-width: 1100px;
  }

  .image-card {
    background: #222;
    border-radius: 16px;
    overflow: hidden;
  }

  .plant-image {
    width: 100%;
    height: 260px;
    object-fit: cover;
    display: block;
    background: #333;
  }

  .plant-info {
    padding: 20px;
  }

  .plant-name {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .plant-species {
    color: #aaa;
    font-size: 16px;
  }

  .sensor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  .card {
    background: #222;
    border-radius: 16px;
    padding: 20px;
  }

  .label {
    color: #aaa;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 24px;
    font-weight: bold;
  }

  .text-card {
    margin-top: 16px;
    padding: 20px;
    border-radius: 12px;
    background: #222;
  }

  .text {
    font-size: 18px;
    line-height: 1.5;
  }

  .recommendation {
    font-size: 20px;
    line-height: 1.5;
    font-weight: bold;
  }

  .ok      { color: #7ee787; }
  .warning { color: #ffd166; }
  .problem { color: #ff7b72; }

  @media (max-width: 800px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>`;

class PlantAnalyzerPanel extends HTMLElement {
  constructor() {
    super();
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
    return Object.values(this._hass.states)
      .filter((e) => e.entity_id.startsWith("plant."))
      .sort((a, b) =>
        (a.attributes.friendly_name ?? a.entity_id).localeCompare(
          b.attributes.friendly_name ?? b.entity_id,
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

  // ---- Grid ----

  _buildGrid() {
    const plants = this._getPlants();

    this.innerHTML = `${STYLES}
      <div class="page">
        <h1>Plant Analyzer</h1>
        <div class="plant-grid">
          ${
            plants.length
              ? plants.map((p) => this._cardHTML(p)).join("")
              : '<p class="empty">Keine Pflanzen gefunden.</p>'
          }
        </div>
      </div>`;

    plants.forEach((p) => {
      this.querySelector(`[data-plant="${p.entity_id}"]`)?.addEventListener(
        "click",
        () => {
          this._selectedPlantId = p.entity_id;
          this._update();
        }
      );
    });
  }

  _cardHTML(plant) {
    const { attributes: a, entity_id } = plant;
    const cls = this._getProblems(a).length ? "problem" : "ok";
    const img = a.entity_picture
      ? `background-image:url('${a.entity_picture}')`
      : "";

    return `
      <div class="plant-card ${cls}" data-plant="${entity_id}">
        <div class="card-image" style="${img}"></div>
        <div class="card-body">
          <div class="card-name">${a.friendly_name ?? entity_id}</div>
          <div class="card-species">${a.species ?? ""}</div>
          <div class="card-dot ${cls}"></div>
        </div>
      </div>`;
  }

  _updateGrid() {
    this._getPlants().forEach((plant) => {
      const card = this.querySelector(`[data-plant="${plant.entity_id}"]`);
      if (!card) return;

      const cls = this._getProblems(plant.attributes).length
        ? "problem"
        : "ok";
      card.className = `plant-card ${cls}`;

      const dot = card.querySelector(".card-dot");
      if (dot) dot.className = `card-dot ${cls}`;
    });
  }

  // ---- Detail ----

  _buildDetail() {
    const plant = this._hass?.states[this._selectedPlantId];
    if (!plant) {
      this._selectedPlantId = null;
      this._buildGrid();
      return;
    }

    this.innerHTML = `${STYLES}
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

    this.querySelector(".back-btn").addEventListener("click", () => {
      this._selectedPlantId = null;
      this._update();
    });

    this._updateDetail();
  }

  _updateDetail() {
    const plant = this._hass?.states[this._selectedPlantId];
    if (!plant) return;

    const a = plant.attributes;
    const problems = this._getProblems(a);
    const moisture = this._problemByType(problems, "moisture");
    const light =
      this._problemByType(problems, "illuminance") ??
      this._problemByType(problems, "brightness");

    this._text("plant-name", a.friendly_name ?? "Unbekannte Pflanze");
    this._text("plant-species", a.species ?? "");
    this._text("plant-status", this._statusLabel(problems));
    this._cls("plant-status", problems.length ? "problem" : "ok");

    const moistureVal = moisture?.current ?? a.moisture ?? null;
    this._text(
      "moisture-value",
      moistureVal != null ? `${this._fmt(moistureVal)} %` : "–"
    );
    this._text("moisture-status", this._translateStatus(a.moisture_status));
    this._cls("moisture-status", this._statusCls(a.moisture_status));

    const lightVal =
      light?.current ?? a.illuminance ?? a.brightness ?? null;
    this._text(
      "light-value",
      lightVal != null ? `${this._fmt(lightVal)} lx` : "–"
    );
    const lightStatus = a.illuminance_status ?? a.brightness_status ?? null;
    this._text("light-status", this._translateStatus(lightStatus));
    this._cls("light-status", this._statusCls(lightStatus));

    this._text("recommendation", this._recommend(problems, a));
    this._cls("recommendation", problems.length ? "problem" : "ok");

    this._text("care-watering", a.care_watering ?? "Keine Angaben.");
    this._text("care-sunlight", a.care_sunlight ?? "Keine Angaben.");
    this._text("care-soil", a.care_soil ?? "Keine Angaben.");
    this._img("plant-image", a.entity_picture);
  }

  // ---- Helpers ----

  _getProblems(attrs) {
    return Array.isArray(attrs.problems) ? attrs.problems : [];
  }

  _problemByType(problems, type) {
    return problems.find((p) => p.sensor_type === type) ?? null;
  }

  _statusLabel(problems) {
    if (!problems.length) return "Alles okay";
    return problems.length === 1 ? "1 Problem" : `${problems.length} Probleme`;
  }

  _translateStatus(status) {
    const map = {
      Low: "Zu niedrig",
      High: "Zu hoch",
      Ok: "Okay",
      OK: "Okay",
      ok: "Okay",
      Normal: "Okay",
    };
    return status ? (map[status] ?? status) : "Unbekannt";
  }

  _statusCls(status) {
    if (!status) return "warning";
    return status === "Low" || status === "High" ? "problem" : "ok";
  }

  _recommend(problems, attrs) {
    if (!problems.length) {
      return "Aktuell sind keine Probleme erkannt. Die Pflanze liegt im Zielbereich.";
    }

    const name = attrs.friendly_name ?? "Die Pflanze";

    const moisture = this._problemByType(problems, "moisture");
    if (moisture) {
      const c = this._fmt(moisture.current);
      const min = this._fmt(moisture.min);
      const max = this._fmt(moisture.max);
      if (moisture.status === "Low") {
        return `Die Bodenfeuchte ist zu niedrig: aktuell ${c} %, Zielbereich ${min}–${max} %. Gieße ${name} vorsichtig und prüfe später erneut.`;
      }
      if (moisture.status === "High") {
        return `Die Bodenfeuchte ist zu hoch: aktuell ${c} %, Zielbereich ${min}–${max} %. Nicht weiter gießen, Staunässe vermeiden.`;
      }
    }

    const light =
      this._problemByType(problems, "illuminance") ??
      this._problemByType(problems, "brightness");
    if (light) {
      const c = this._fmt(light.current);
      const min = this._fmt(light.min);
      const max = this._fmt(light.max);
      if (light.status === "Low") {
        return `Die Beleuchtung ist zu niedrig: aktuell ${c} lx, Zielbereich ${min}–${max} lx. Pflanze an einen helleren Standort stellen.`;
      }
      if (light.status === "High") {
        return `Die Beleuchtung ist zu hoch: aktuell ${c} lx, Zielbereich ${min}–${max} lx. Direkte Sonneneinstrahlung reduzieren.`;
      }
    }

    return `Probleme erkannt: ${problems.map((p) => p.sensor_type ?? "").join(", ")}.`;
  }

  _fmt(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString("de-DE", { maximumFractionDigits: 1 });
  }

  _text(id, value) {
    const el = this.querySelector(`#${id}`);
    if (el) el.textContent = value;
  }

  _img(id, src) {
    const el = this.querySelector(`#${id}`);
    if (!el) return;
    if (!src) {
      el.removeAttribute("src");
      return;
    }
    if (el.src !== src) el.src = src;
  }

  _cls(id, cls) {
    const el = this.querySelector(`#${id}`);
    if (!el) return;
    el.classList.remove("ok", "warning", "problem");
    el.classList.add(cls);
  }
}

customElements.define("plant-analyzer-panel", PlantAnalyzerPanel);
