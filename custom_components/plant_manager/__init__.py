from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .services import async_register_services, async_unregister_services
from .storage import PlantManagerStorage


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    storage = PlantManagerStorage(hass)
    await storage.async_load()

    hass.data[DOMAIN] = storage

    await async_register_services(hass, storage)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    async_unregister_services(hass)
    hass.data.pop(DOMAIN, None)
    return True
