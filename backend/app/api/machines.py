from fastapi import APIRouter
from app.services.machines import get_machines

router = APIRouter(prefix="/machines", tags=["machines"])

@router.get("")
def list_machines():
    return get_machines()
