import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .storage import PlantManagerStorage

SERVICE_LOG_WATERING = "log_watering"

_LOG_WATERING_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_id,
        vol.Optional("notes", default=""): cv.string,
    }
)


async def async_register_services(hass: HomeAssistant, storage: PlantManagerStorage) -> None:
    async def handle_log_watering(call: ServiceCall) -> None:
        await storage.async_log_watering(
            call.data["entity_id"],
            call.data.get("notes", ""),
        )

    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_WATERING,
        handle_log_watering,
        schema=_LOG_WATERING_SCHEMA,
    )


def async_unregister_services(hass: HomeAssistant) -> None:
    hass.services.async_remove(DOMAIN, SERVICE_LOG_WATERING)
