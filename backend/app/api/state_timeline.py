from fastapi import APIRouter, Query
from app.services.state_timeline import get_state_timeline

router = APIRouter(
    prefix="/machines/{machine_id}/state-timeline",
    tags=["state"]
)

@router.get("")
def machine_state_timeline(
    machine_id: str,
    from_time: str = Query(..., alias="from"),
    to_time: str = Query(..., alias="to")
):
    return get_state_timeline(
        machine_id=machine_id,
        start=from_time,
        stop=to_time
    )
