export const STYLES = `<style>
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
