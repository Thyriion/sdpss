# Plant Manager — Architekturentscheidungen

## Projektziel

Pflanzensensor-System für ~20 Pflanzen mit Feuchtigkeits-, Licht- und (zukünftig)
Luftfeuchte-Überwachung, Pflegelog, Gieß-Erinnerungen, automatischer Bewässerung
und grafischer Darstellung in Home Assistant.

---

## Hardware

- **Mehrere ESP32s**, je 2–3 Pflanzen pro Gerät
- **Multiplexer** pro ESP32 für Feuchtigkeitssensoren (ein Kanal pro Pflanze)
- **1 Lichtsensor** pro ESP32/Zone (geteilt zwischen den Pflanzen der Zone)
- **Bewässerungsventile** pro Pflanze — hardware-seitig vorbereiten, aber noch nicht aktiv

---

## Kommunikation: MQTT mit Auto-Discovery

Jeder ESP32 publiziert beim Boot Discovery-Messages auf den HA-Standard-Topic:

```
homeassistant/sensor/<device_id>/<sensor_id>/config
```

HA registriert Sensoren damit **automatisch** — kein manuelles YAML pro Sensor.
Sensorwerte kommen weiterhin auf einem Datentopic, identifiziert per `kanal`-Feld
(nicht Arrayposition).

**Aktueller Übergangszustand**: Bis zur Firmware-Umstellung läuft die manuelle
MQTT-Config via `selectattr('kanal', 'equalto', N)` (siehe `mqtt-sensors.yaml`).

---

## Home Assistant Setup

### Bleibt erhalten
- **OpenPlantBook** (HACS): Artendatenbank, Schwellenwerte, Pflege-Infos
- **Plant Monitor** (HACS): Erzeugt `plant.*`-Entities, Problem-Detection,
  verknüpft Sensoren mit Pflanzenarten

### Neu: Custom Integration
- Pfad: `/config/custom_components/plant_manager/`
- **Python-Backend** mit eigenem `.storage/`-Speicher
- Verantwortlich für: Pflegelog, Gieß-Erinnerungen, (später) Bewässerungssteuerung
- Kommuniziert per MQTT-Commands mit ESP32 für Ventilsteuerung (Zukunft)
- Stellt Services bereit (z.B. `plant_manager.log_watering`)

### Frontend: Custom Panel
- Registriert als `panel_custom:` in HA (Seitenleisten-Eintrag bleibt)
- Gebaut mit **Vite** (Build-Step), Quelldateien in mehrere Module aufgeteilt
- Output: eine einzelne `plant-analyzer-panel.js` → `/config/www/`
- Dev-Workflow: lokal entwickeln, per SSH/Samba auf den Pi syncen

---

## Infrastruktur

- **Home Assistant OS** auf Raspberry Pi mit SSD
- Zugriff via SSH/Samba für Datei-Deployment
- Kein externer Server, keine externe Datenbank — alles lebt in HA

---

## Was NICHT gebaut wird (jetzt)

- Bewässerungsautomatik (Architektur vorsehen, aber nicht implementieren)
- Luftfeuchte-Regelung (Zukunft)
- Eigene Pflanzendatenbank (OpenPlantBook übernimmt das)

---

## Build-Reihenfolge

1. Vite-Projekt aufsetzen (bestehendes Panel als Startpunkt)
2. Custom Integration Scaffold (Python) mit Storage
3. ESP32 Firmware auf MQTT Auto-Discovery umstellen
4. Features: Charts, Pflegelog, Erinnerungen
5. (Später) Bewässerungssteuerung via MQTT-Commands
