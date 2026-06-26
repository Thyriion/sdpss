export const STYLES = `<style>
  * { box-sizing: border-box; }

  .dashboard {
    padding: 20px 24px;
    min-height: 100vh;
    background: transparent;
    color: var(--primary-text-color, #e8eaf6);
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
    color: var(--primary-color, #0b9e9e);
    font-size: 22px;
  }

  .header-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-text-color, #e8eaf6);
  }

  .header-date {
    font-size: 13px;
    color: var(--secondary-text-color, #7a8aaa);
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
    background: color-mix(in srgb, var(--primary-color, #0b9e9e) 15%, transparent);
    color: var(--primary-color, #0b9e9e);
    border: 1px solid color-mix(in srgb, var(--primary-color, #0b9e9e) 30%, transparent);
  }

  .badge-ok::before { content: '● '; }

  .badge-warn {
    background: color-mix(in srgb, var(--warning-color, #c8843a) 12%, transparent);
    color: var(--warning-color, #c8843a);
    border: 1px solid color-mix(in srgb, var(--warning-color, #c8843a) 25%, transparent);
  }

  /* ---- Card base ---- */

  .metric-card,
  .plant-list-card,
  .greenhouse-card,
  .bottom-card {
    background: var(--ha-card-background, var(--card-background-color, rgba(30,32,48,0.85)));
    border-radius: var(--ha-card-border-radius, 14px);
    border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(255,255,255,0.06)));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.15));
    padding: 20px;
  }

  /* ---- Section label ---- */

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--secondary-text-color, #7a8aaa);
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
    color: var(--secondary-text-color, #7a8aaa);
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
    color: var(--primary-text-color, #e8eaf6);
    line-height: 1;
    margin-bottom: 10px;
  }

  .metric-value .unit {
    font-size: 20px;
    font-weight: 400;
    color: var(--secondary-text-color, #7a8aaa);
  }

  .metric-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--secondary-text-color, #7a8aaa);
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
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
    cursor: pointer;
  }

  .plant-row:last-child { border-bottom: none; }

  .plant-row:hover .plant-row-name { color: var(--primary-color, #0b9e9e); }

  .plant-row-info {
    min-width: 200px;
  }

  .plant-row-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--primary-text-color, #e8eaf6);
    margin-bottom: 2px;
    transition: color 0.15s;
  }

  .plant-row-species {
    font-size: 12px;
    color: var(--secondary-text-color, #7a8aaa);
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
    background: var(--divider-color, rgba(0,0,0,0.12));
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .bar-fill.ok      { background: var(--primary-color, #0b9e9e); }
  .bar-fill.warning { background: var(--warning-color, #c8843a); }
  .bar-fill.problem { background: var(--error-color, #9e1d09); }

  .bar-value {
    font-size: 14px;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
  }

  .bar-value.ok      { color: var(--primary-color, #0b9e9e); }
  .bar-value.warning { color: var(--warning-color, #c8843a); }
  .bar-value.problem { color: var(--error-color, #9e1d09); }

  /* ---- Greenhouse card ---- */

  .greenhouse-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 4px;
  }

  .gh-label {
    font-size: 11px;
    color: var(--secondary-text-color, #7a8aaa);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 3px;
  }

  .gh-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--primary-text-color, #e8eaf6);
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
    background: var(--divider-color, rgba(0,0,0,0.12));
    min-height: 4px;
  }

  .chart-bar.active { background: var(--primary-color, #0b9e9e); opacity: 0.8; }

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
    color: var(--secondary-text-color, #7a8aaa);
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
    color: var(--primary-text-color, #e8eaf6);
    line-height: 1.2;
    margin-bottom: 10px;
  }

  .bottom-value .unit {
    font-size: 18px;
    font-weight: 400;
    color: var(--secondary-text-color, #7a8aaa);
  }

  .bottom-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--secondary-text-color, #7a8aaa);
  }

  /* ---- Status dot ---- */

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot.ok      { background: var(--primary-color, #0b9e9e); }
  .dot.warning { background: var(--warning-color, #c8843a); }
  .dot.problem { background: var(--error-color, #9e1d09); }

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

export const DETAIL_STYLES = `<style>
  .page {
    padding: 24px;
    min-height: 100vh;
    background: transparent;
    color: #e8eaf6;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .back-btn {
    background: none;
    border: none;
    color: var(--secondary-text-color, #7a8aaa);
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    display: block;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .back-btn:hover { color: var(--primary-color, #0b9e9e); }

  .layout {
    display: grid;
    grid-template-columns: minmax(260px, 360px) 1fr;
    gap: 24px;
    max-width: 1100px;
  }

  .image-card {
    background: var(--ha-card-background, var(--card-background-color, rgba(30,32,48,0.85)));
    border-radius: var(--ha-card-border-radius, 14px);
    overflow: hidden;
    border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(255,255,255,0.06)));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.15));
  }

  .plant-image {
    width: 100%;
    height: 260px;
    object-fit: cover;
    display: block;
    background: var(--secondary-background-color, #f0f0f0);
  }

  .plant-info { padding: 20px; }

  .plant-name {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--primary-text-color, #e8eaf6);
  }

  .plant-species {
    color: var(--secondary-text-color, #7a8aaa);
    font-size: 16px;
  }

  .sensor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  .card {
    background: var(--ha-card-background, var(--card-background-color, rgba(30,32,48,0.85)));
    border-radius: var(--ha-card-border-radius, 14px);
    padding: 20px;
    border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(255,255,255,0.06)));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.15));
  }

  .label {
    color: var(--secondary-text-color, #7a8aaa);
    font-size: 14px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-text-color, #e8eaf6);
  }

  .text-card {
    margin-top: 16px;
    padding: 20px;
    border-radius: var(--ha-card-border-radius, 14px);
    background: var(--ha-card-background, var(--card-background-color, rgba(30,32,48,0.85)));
    border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(255,255,255,0.06)));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.15));
  }

  .text {
    font-size: 18px;
    line-height: 1.5;
    color: var(--primary-text-color, #e8eaf6);
  }

  .recommendation {
    font-size: 20px;
    line-height: 1.5;
    font-weight: 700;
  }

  .ok      { color: var(--primary-color, #0b9e9e); }
  .warning { color: var(--warning-color, #c8843a); }
  .problem { color: var(--error-color, #9e1d09); }

  @media (max-width: 800px) {
    .layout { grid-template-columns: 1fr; }
  }
</style>`;
