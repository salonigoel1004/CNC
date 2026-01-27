from app.db.influx import get_influx_client
from app.config.settings import settings


def get_latest_machine_snapshot(machine_id: str):
    query = f'''
    from(bucket: "{settings.INFLUX_BUCKET_REALTIME}")
      |> range(start: -30s)
      |> filter(fn: (r) =>
          r.machine_id == "{machine_id}" and
          (
            r._measurement == "cnc_telemetry" or
            r._measurement == "cnc_state" or
            r._measurement == "cnc_business"
          )
      )
      |> group(columns: ["_measurement", "_field"])
      |> last()
    '''

    job_query = f'''
    from(bucket: "{settings.INFLUX_BUCKET_REALTIME}")
      |> range(start: -5m)
      |> filter(fn: (r) =>
          r.machine_id == "{machine_id}" and
          r._measurement == "cnc_job"
      )
      |> pivot(
          rowKey: ["_time"],
          columnKey: ["_field"],
          valueColumn: "_value"
      )
      |> filter(fn: (r) => r.event == 1)
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 1)
    '''

    client = get_influx_client()
    tables = client.query_api().query(query)
    job_tables = client.query_api().query(job_query)

    snapshot = {
        "telemetry": {},
        "state": None,
        "business": {},
        "current_job": None
    }

    # -------- telemetry / state / business --------
    for table in tables:
        for record in table.records:
            measurement = record.get_measurement()
            field = record.get_field()
            value = record.get_value()

            if measurement == "cnc_telemetry":
                snapshot["telemetry"][field] = value

            elif measurement == "cnc_state":
                snapshot["state"] = value

            elif measurement == "cnc_business":
                snapshot["business"][field] = value

    # -------- current job --------
    for table in job_tables:
        for record in table.records:
            snapshot["current_job"] = record.values.get("job_id")

    return snapshot