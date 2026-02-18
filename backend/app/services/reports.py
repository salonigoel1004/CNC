from app.db import get_influx_client
from app.settings import settings
from app.services.machines import get_machines
from app.services.state_timeline import get_state_timeline
from datetime import datetime, timezone


def get_daily_report():
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)

    start_iso = start_of_day.isoformat().replace("+00:00", "Z")
    stop_iso = now.isoformat().replace("+00:00", "Z")

    machines = get_machines()
    client = get_influx_client()

    result = []

    for m in machines:
        mid = m["machine_id"]

        # --- Runtime: sum duration where state == 1 (RUNNING) ---
        timeline = get_state_timeline(mid, start_iso, stop_iso)
        runtime_sec = sum(
            seg["duration_sec"] for seg in timeline if seg["state"] == 1
        )

        # --- Part count: latest value today ---
        pc_query = f'''
        from(bucket: "{settings.INFLUX_BUCKET_REALTIME}")
          |> range(start: time(v: "{start_iso}"), stop: time(v: "{stop_iso}"))
          |> filter(fn: (r) =>
              r.machine_id == "{mid}" and
              r._measurement == "cnc_business" and
              r._field == "part_count"
          )
          |> last()
        '''
        tables = client.query_api().query(pc_query)
        part_count = 0
        for table in tables:
            for record in table.records:
                part_count = int(record.get_value())

        result.append({
            "machine_id": mid,
            "runtime_sec": runtime_sec,
            "part_count": part_count,
        })

    return result
