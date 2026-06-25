import { Hass, HassEntity } from './types';
import { buildDashboardHTML, updateDashboard, updateClock } from './views/GridView';
import { buildDetailHTML, updateDetail } from './views/DetailView';

export class PlantAnalyzerPanel extends HTMLElement {
  private _hass: Hass | null = null;
  private _selectedPlantId: string | null = null;
  private _renderedView: string | null = null;
  private _timer: ReturnType<typeof setInterval> | null = null;

  set hass(hass: Hass) {
    this._hass = hass;
    this._update();
  }

  connectedCallback(): void {
    this._renderedView = null;
    this._update();
    this._timer = setInterval(() => updateClock(this), 30_000);
  }

  disconnectedCallback(): void {
    if (this._timer !== null) clearInterval(this._timer);
    this._timer = null;
  }

  private _getPlants(): HassEntity[] {
    if (!this._hass) return [];
    return Object.values(this._hass.states)
      .filter((e) => e.entity_id.startsWith('plant.'))
      .sort((a, b) =>
        (a.attributes['friendly_name'] as string ?? a.entity_id).localeCompare(
          b.attributes['friendly_name'] as string ?? b.entity_id,
          'de'
        )
      );
  }

  private _update(): void {
    if (!this._hass || !this.isConnected) return;

    const view = this._selectedPlantId ?? 'grid';

    if (view !== this._renderedView) {
      this._renderedView = view;
      view === 'grid' ? this._buildGrid() : this._buildDetail();
    } else {
      view === 'grid' ? this._updateGrid() : this._updateDetail();
    }
  }

  private _buildGrid(): void {
    this.innerHTML = buildDashboardHTML();

    this.querySelector('#plant-list')?.addEventListener('click', (e) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>('[data-plant]');
      if (row?.dataset['plant']) {
        this._selectedPlantId = row.dataset['plant'];
        this._update();
      }
    });

    this._updateGrid();
  }

  private _updateGrid(): void {
    if (!this._hass) return;
    updateDashboard(this, this._getPlants(), this._hass.states);
  }

  private _buildDetail(): void {
    const plant = this._hass?.states[this._selectedPlantId!];
    if (!plant) {
      this._selectedPlantId = null;
      this._buildGrid();
      return;
    }

    this.innerHTML = buildDetailHTML();
    this.querySelector('.back-btn')?.addEventListener('click', () => {
      this._selectedPlantId = null;
      this._update();
    });

    this._updateDetail();
  }

  private _updateDetail(): void {
    const plant = this._hass?.states[this._selectedPlantId!];
    if (!plant) return;
    updateDetail(this, plant);
  }
}
