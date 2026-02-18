from fastapi import APIRouter
from app.services.reports import get_daily_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/daily")
def daily_report():
    return get_daily_report()
