from app.db.influx import get_influx_client
from app.config.settings import settings

def get_telemetry_history(machine_id: str, metric: str, start: str, stop: str):
    query = f'''
    from(bucket: "{settings.INFLUX_BUCKET_1S}")
      |> range(start: time(v: "{start}"), stop: time(v: "{stop}"))
      |> filter(fn: (r) =>
          r._measurement == "cnc_telemetry" and
          r.machine_id == "{machine_id}" and
          r._field == "{metric}"
      )
      |> keep(columns: ["_time", "_value"])
      |> sort(columns: ["_time"])
    '''

    client = get_influx_client()
    tables = client.query_api().query(query)

    result = []

    for table in tables:
        for record in table.records:
            result.append({
                "ts": record.get_time().isoformat(),
                "value": record.get_value()
            })

    return result
