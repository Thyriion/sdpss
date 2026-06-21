#!/usr/bin/env bash
set -euo pipefail

# Lokale Konfiguration: .deploy.env anlegen (wird nicht committed)
# Inhalt: PI_HOST=192.168.x.x
if [[ -f ".deploy.env" ]]; then
  # shellcheck source=/dev/null
  source ".deploy.env"
fi

PI_HOST="${PI_HOST:?Bitte PI_HOST setzen: export PI_HOST=<ip> oder .deploy.env anlegen}"
PI_USER="${PI_USER:-root}"
PI_PORT="${PI_PORT:-22}"
HA_CONFIG="/config"

echo "==> Building frontend..."
(cd frontend && npm run build)

echo "==> Ensuring /config/www exists..."
ssh -p "$PI_PORT" "$PI_USER@$PI_HOST" "mkdir -p $HA_CONFIG/www"

echo "==> Deploying integration..."
rsync -av --delete -e "ssh -p $PI_PORT" \
  custom_components/plant_manager/ \
  "$PI_USER@$PI_HOST:$HA_CONFIG/custom_components/plant_manager/"

echo "==> Deploying panel..."
rsync -av -e "ssh -p $PI_PORT" \
  frontend/dist/plant-analyzer-panel.js \
  "$PI_USER@$PI_HOST:$HA_CONFIG/www/"

echo ""
echo "Deploy complete!"
echo "  -> Integration: HA Developer Tools -> YAML -> Custom Integrations neu laden"
echo "  -> Panel: Browser hard refresh (Strg+Shift+R)"
