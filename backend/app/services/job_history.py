from app.db import get_influx_client
from app.settings import settings


def get_job_history(machine_id: str, start: str, stop: str):
    query = f'''
    from(bucket: "{settings.INFLUX_BUCKET_REALTIME}")
      |> range(start: time(v: "{start}"), stop: time(v: "{stop}"))
      |> filter(fn: (r) =>
          r.machine_id == "{machine_id}" and
          r._measurement == "cnc_job"
      )
      |> pivot(
          rowKey: ["_time"],
          columnKey: ["_field"],
          valueColumn: "_value"
      )
      |> sort(columns: ["_time"])
    '''

    client = get_influx_client()
    tables = client.query_api().query(query)

    events = []

    for table in tables:
        for record in table.records:
            events.append({
                "time": record.get_time(),
                "job_id": record.values.get("job_id"),
                "event": record.values.get("event")
            })

    jobs = []
    active_jobs = {}

    for e in events:
        job_id = e["job_id"]

        if e["event"] == 1:  
            active_jobs[job_id] = e["time"]

        elif e["event"] == 0 and job_id in active_jobs:  
            start_time = active_jobs.pop(job_id)
            end_time = e["time"]
            duration = int((end_time - start_time).total_seconds())

            jobs.append({
                "job_id": job_id,
                "start": start_time.isoformat() + "Z",
                "end": end_time.isoformat() + "Z",
                "duration_sec": duration
            })

    return jobs
