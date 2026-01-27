from fastapi import APIRouter, Query
from app.services.telemetry import get_telemetry_history

router = APIRouter(
    prefix="/machines/{machine_id}/telemetry",
    tags=["telemetry"]
)

@router.get("")
def telemetry_history(
    machine_id: str,
    metric: str = Query(...),
    from_time: str = Query(..., alias="from"),
    to_time: str = Query(..., alias="to")
):
    return get_telemetry_history(
        machine_id=machine_id,
        metric=metric,
        start=from_time,
        stop=to_time
    )
