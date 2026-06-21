from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util.dt import utcnow

STORAGE_KEY = "plant_manager"
STORAGE_VERSION = 1
MAX_LOG_ENTRIES = 100


class PlantManagerStorage:
    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict = {"watering_logs": {}}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if data:
            self._data = data

    async def async_log_watering(self, plant_entity_id: str, notes: str = "") -> None:
        logs = self._data.setdefault("watering_logs", {})
        entries = logs.setdefault(plant_entity_id, [])
        entries.append({"timestamp": utcnow().isoformat(), "notes": notes})
        logs[plant_entity_id] = entries[-MAX_LOG_ENTRIES:]
        await self._store.async_save(self._data)

    def get_watering_logs(self, plant_entity_id: str) -> list[dict]:
        return self._data.get("watering_logs", {}).get(plant_entity_id, [])

    def get_last_watered(self, plant_entity_id: str) -> str | None:
        logs = self.get_watering_logs(plant_entity_id)
        return logs[-1]["timestamp"] if logs else None
