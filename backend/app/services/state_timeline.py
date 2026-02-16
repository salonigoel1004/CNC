from app.db import get_influx_client
from app.settings import settings
from datetime import datetime


def get_state_timeline(machine_id: str, start: str, stop: str):
    query = f'''
    from(bucket: "{settings.INFLUX_BUCKET_REALTIME}")
      |> range(start: time(v: "{start}"), stop: time(v: "{stop}"))
      |> filter(fn: (r) =>
          r.machine_id == "{machine_id}" and
          r._measurement == "cnc_state" and
          r._field == "machine_state"
      )
      |> sort(columns: ["_time"])
    '''

    client = get_influx_client()
    tables = client.query_api().query(query)

    points = []

    for table in tables:
        for record in table.records:
            points.append({
                "time": record.get_time(),
                "state": record.get_value()
            })

    if not points:
        return []

    timeline = []

    current_state = points[0]["state"]
    start_time = points[0]["time"]

    for p in points[1:]:
        if p["state"] != current_state:
            end_time = p["time"]
            duration = int((end_time - start_time).total_seconds())

            timeline.append({
                "state": current_state,
                "start": start_time.isoformat() + "Z",
                "end": end_time.isoformat() + "Z",
                "duration_sec": duration
            })

            current_state = p["state"]
            start_time = p["time"]

    # close last interval
    end_time = points[-1]["time"]
    duration = int((end_time - start_time).total_seconds())

    timeline.append({
        "state": current_state,
        "start": start_time.isoformat() + "Z",
        "end": end_time.isoformat() + "Z",
        "duration_sec": duration
    })

    return timeline
