from fastapi import APIRouter, Query
from app.services.job_history import get_job_history

router = APIRouter(
    prefix="/machines/{machine_id}/jobs",
    tags=["jobs"]
)

@router.get("")
def job_history(
    machine_id: str,
    from_time: str = Query(..., alias="from"),
    to_time: str = Query(..., alias="to")
):
    return get_job_history(
        machine_id=machine_id,
        start=from_time,
        stop=to_time
    )
