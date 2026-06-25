export const STYLES = `<style>
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
