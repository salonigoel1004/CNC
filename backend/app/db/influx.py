from influxdb_client import InfluxDBClient
from app.config.settings import settings

_client = None

def get_influx_client():
    global _client
    if _client is None:
        _client = InfluxDBClient(
            url=settings.INFLUX_URL,
            token=settings.INFLUX_TOKEN,
            org=settings.INFLUX_ORG
        )
    return _client
