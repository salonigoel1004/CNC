from app.db import get_influx_client
from app.settings import settings

def get_machines():
    query = f'''
    from(bucket: "{settings.INFLUX_BUCKET_REALTIME}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "cnc_state")
      |> keep(columns: ["machine_id", "_value", "_time"])
      |> group(columns: ["machine_id"])
      |> last()
    '''

    client = get_influx_client()
    tables = client.query_api().query(query)

    machines = []
    for table in tables:
        for record in table.records:
            machines.append({
                "machine_id": record["machine_id"],
                "current_state": record.get_value(),  
                "last_seen": record.get_time().isoformat() + "Z" if record.get_time() else None
            })

    return machines