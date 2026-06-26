export const STYLES = `<style>
  plant-analyzer-panel * { box-sizing: border-box; }

  plant-analyzer-panel .dashboard {
    padding: 20px 24px;
    min-height: 100vh;
    background-color: var(--secondary-background-color, #f0f0f0);
    color: var(--primary-text-color, #212121);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ---- Header ---- */

  plant-analyzer-panel .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  plant-analyzer-panel .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  plant-analyzer-panel .header-star {
    color: var(--primary-color, #0b9e9e);
    font-size: 22px;
  }

  plant-analyzer-panel .header-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-text-color, #212121);
  }

  plant-analyzer-panel .header-date {
    font-size: 13px;
    color: var(--secondary-text-color, #727272);
    margin-top: 2px;
  }

  plant-analyzer-panel .header-badges {
    display: flex;
    gap: 8px;
  }

  plant-analyzer-panel .badge {
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  }

  plant-analyzer-panel .badge-ok {
    background: color-mix(in srgb, var(--primary-color, #0b9e9e) 15%, transparent);
    color: var(--primary-color, #0b9e9e);
    border: 1px solid color-mix(in srgb, var(--primary-color, #0b9e9e) 30%, transparent);
  }

  plant-analyzer-panel .badge-ok::before { content: '● '; }

  plant-analyzer-panel .badge-warn {
    background: color-mix(in srgb, var(--warning-color, #c8843a) 12%, transparent);
    color: var(--warning-color, #c8843a);
    border: 1px solid color-mix(in srgb, var(--warning-color, #c8843a) 25%, transparent);
  }

  /* ---- Card base ---- */

  plant-analyzer-panel .metric-card,
  plant-analyzer-panel .plant-list-card,
  plant-analyzer-panel .greenhouse-card,
  plant-analyzer-panel .bottom-card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 14px);
    border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
    padding: 20px;
  }

  /* ---- Galaxy overrides ---- */

  plant-analyzer-panel .galaxy {
    background-color: transparent;
  }

  plant-analyzer-panel .galaxy .metric-card,
  plant-analyzer-panel .galaxy .plant-list-card,
  plant-analyzer-panel .galaxy .greenhouse-card,
  plant-analyzer-panel .galaxy .bottom-card {
    background: rgba(30,32,48,0.75);
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }

  /* ---- Section label ---- */

  plant-analyzer-panel .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--secondary-text-color, #727272);
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  /* ---- Metrics row ---- */

  plant-analyzer-panel .metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  plant-analyzer-panel .metric-card {
    position: relative;
    overflow: hidden;
  }

  plant-analyzer-panel .metric-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--secondary-text-color, #727272);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  plant-analyzer-panel .metric-icon {
    position: absolute;
    top: 18px;
    right: 18px;
    font-size: 20px;
    opacity: 0.3;
  }

  plant-analyzer-panel .metric-value {
    font-size: 42px;
    font-weight: 700;
    color: var(--primary-text-color, #212121);
    line-height: 1;
    margin-bottom: 10px;
  }

  plant-analyzer-panel .metric-value .unit {
    font-size: 20px;
    font-weight: 400;
    color: var(--secondary-text-color, #727272);
  }

  plant-analyzer-panel .metric-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--secondary-text-color, #727272);
  }

  /* ---- Main row ---- */

  plant-analyzer-panel .main-row {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 16px;
  }

  /* ---- Plant list ---- */

  plant-analyzer-panel .plant-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 11px 0;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
    cursor: pointer;
  }

  plant-analyzer-panel .plant-row:last-child { border-bottom: none; }

  plant-analyzer-panel .plant-row:hover .plant-row-name {
    color: var(--primary-color, #0b9e9e);
  }

  plant-analyzer-panel .plant-row-info {
    min-width: 200px;
  }

  plant-analyzer-panel .plant-row-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--primary-text-color, #212121);
    margin-bottom: 2px;
    transition: color 0.15s;
  }

  plant-analyzer-panel .plant-row-species {
    font-size: 12px;
    color: var(--secondary-text-color, #727272);
    font-style: italic;
  }

  plant-analyzer-panel .plant-row-right {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  plant-analyzer-panel .bar-track {
    flex: 1;
    height: 6px;
    background: var(--divider-color, rgba(0,0,0,0.12));
    border-radius: 3px;
    overflow: hidden;
  }

  plant-analyzer-panel .galaxy .bar-track {
    background: rgba(255,255,255,0.08);
  }

  plant-analyzer-panel .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  plant-analyzer-panel .bar-fill.ok      { background: var(--primary-color, #0b9e9e); }
  plant-analyzer-panel .bar-fill.warning { background: var(--warning-color, #c8843a); }
  plant-analyzer-panel .bar-fill.problem { background: var(--error-color, #9e1d09); }

  plant-analyzer-panel .bar-value {
    font-size: 14px;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }

  plant-analyzer-panel .bar-value.ok      { color: var(--primary-color, #0b9e9e); }
  plant-analyzer-panel .bar-value.warning { color: var(--warning-color, #c8843a); }
  plant-analyzer-panel .bar-value.problem { color: var(--error-color, #9e1d09); }

  /* ---- Greenhouse card ---- */

  plant-analyzer-panel .greenhouse-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 4px;
  }

  plant-analyzer-panel .gh-label {
    font-size: 11px;
    color: var(--secondary-text-color, #727272);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 3px;
  }

  plant-analyzer-panel .gh-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-text-color, #212121);
  }

  /* ---- Light chart ---- */

  plant-analyzer-panel .light-chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 48px;
  }

  plant-analyzer-panel .chart-bar {
    flex: 1;
    border-radius: 2px 2px 0 0;
    background: var(--divider-color, rgba(0,0,0,0.12));
    min-height: 4px;
  }

  plant-analyzer-panel .galaxy .chart-bar {
    background: rgba(255,255,255,0.08);
  }

  plant-analyzer-panel .chart-bar.active {
    background: var(--primary-color, #0b9e9e);
    opacity: 0.8;
  }

  /* ---- Bottom row ---- */

  plant-analyzer-panel .bottom-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  plant-analyzer-panel .bottom-card {
    position: relative;
    overflow: hidden;
  }

  plant-analyzer-panel .bottom-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--secondary-text-color, #727272);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  plant-analyzer-panel .bottom-icon {
    position: absolute;
    top: 18px;
    right: 18px;
    font-size: 20px;
    opacity: 0.25;
  }

  plant-analyzer-panel .bottom-value {
    font-size: 36px;
    font-weight: 700;
    color: var(--primary-text-color, #212121);
    line-height: 1.2;
    margin-bottom: 10px;
  }

  plant-analyzer-panel .bottom-value .unit {
    font-size: 18px;
    font-weight: 400;
    color: var(--secondary-text-color, #727272);
  }

  plant-analyzer-panel .bottom-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--secondary-text-color, #727272);
  }

  /* ---- Status dot ---- */

  plant-analyzer-panel .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  plant-analyzer-panel .dot.ok      { background: var(--primary-color, #0b9e9e); }
  plant-analyzer-panel .dot.warning { background: var(--warning-color, #c8843a); }
  plant-analyzer-panel .dot.problem { background: var(--error-color, #9e1d09); }

  /* ---- Responsive ---- */

  @media (max-width: 1000px) {
    plant-analyzer-panel .main-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 800px) {
    plant-analyzer-panel .metrics-row { grid-template-columns: 1fr 1fr; }
    plant-analyzer-panel .bottom-row  { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 500px) {
    plant-analyzer-panel .metrics-row { grid-template-columns: 1fr; }
    plant-analyzer-panel .bottom-row  { grid-template-columns: 1fr; }
  }
</style>`;

export const DETAIL_STYLES = `<style>
  plant-analyzer-panel .page {
    padding: 24px;
    min-height: 100vh;
    background-color: var(--secondary-background-color, #f0f0f0);
    color: var(--primary-text-color, #212121);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  plant-analyzer-panel .back-btn {
    background: none;
    border: none;
    color: var(--secondary-text-color, #727272);
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    display: block;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  plant-analyzer-panel .back-btn:hover { color: var(--primary-color, #0b9e9e); }

  plant-analyzer-panel .layout {
    display: grid;
    grid-template-columns: minmax(260px, 360px) 1fr;
    gap: 24px;
    max-width: 1100px;
  }

  plant-analyzer-panel .image-card,
  plant-analyzer-panel .card,
  plant-analyzer-panel .text-card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 14px);
    border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
  }

  plant-analyzer-panel .galaxy .image-card,
  plant-analyzer-panel .galaxy .card,
  plant-analyzer-panel .galaxy .text-card {
    background: rgba(30,32,48,0.75);
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  }

  plant-analyzer-panel .image-card { overflow: hidden; }

  plant-analyzer-panel .plant-image {
    width: 100%;
    height: 260px;
    object-fit: cover;
    display: block;
    background: var(--secondary-background-color, #f0f0f0);
  }

  plant-analyzer-panel .plant-info { padding: 20px; }

  plant-analyzer-panel .plant-name {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--primary-text-color, #212121);
  }

  plant-analyzer-panel .plant-species {
    color: var(--secondary-text-color, #727272);
    font-size: 16px;
  }

  plant-analyzer-panel .sensor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  plant-analyzer-panel .card { padding: 20px; }

  plant-analyzer-panel .label {
    color: var(--secondary-text-color, #727272);
    font-size: 14px;
    margin-bottom: 8px;
  }

  plant-analyzer-panel .value {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-text-color, #212121);
  }

  plant-analyzer-panel .text-card {
    margin-top: 16px;
    padding: 20px;
  }

  plant-analyzer-panel .text {
    font-size: 18px;
    line-height: 1.5;
    color: var(--primary-text-color, #212121);
  }

  plant-analyzer-panel .recommendation {
    font-size: 20px;
    line-height: 1.5;
    font-weight: 700;
  }

  plant-analyzer-panel .ok      { color: var(--primary-color, #0b9e9e); }
  plant-analyzer-panel .warning { color: var(--warning-color, #c8843a); }
  plant-analyzer-panel .problem { color: var(--error-color, #9e1d09); }

  @media (max-width: 800px) {
    plant-analyzer-panel .layout { grid-template-columns: 1fr; }
  }
</style>`;
