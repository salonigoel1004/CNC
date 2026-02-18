from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import time
from datetime import datetime, timezone
from app.services.live import get_latest_machine_snapshot
from app.services.state_timeline import get_state_timeline

router = APIRouter()

RUNTIME_CACHE_TTL = 30  # refresh runtime from DB every 30 seconds


def _calc_today_runtime(machine_id: str) -> int:
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_iso = start_of_day.isoformat().replace("+00:00", "Z")
    stop_iso = now.isoformat().replace("+00:00", "Z")
    timeline = get_state_timeline(machine_id, start_iso, stop_iso)
    return sum(seg["duration_sec"] for seg in timeline if seg["state"] == 1)


@router.websocket("/ws/machines/{machine_id}")
async def machine_live_ws(websocket: WebSocket, machine_id: str):
    await websocket.accept()

    cached_runtime = 0
    last_runtime_fetch = 0.0

    try:
        while True:
            try:
                snapshot = get_latest_machine_snapshot(machine_id)
            except Exception as e:
                print(f"Snapshot error for {machine_id}:", e)
                await asyncio.sleep(0.1)
                continue

            if not snapshot:
                await asyncio.sleep(0.1)
                continue

            state_value = snapshot.get("state")

            if state_value is None:
                await asyncio.sleep(0.1)
                continue

            # Refresh runtime from DB every RUNTIME_CACHE_TTL seconds
            now = time.monotonic()
            if now - last_runtime_fetch >= RUNTIME_CACHE_TTL:
                try:
                    cached_runtime = _calc_today_runtime(machine_id)
                    last_runtime_fetch = now
                except Exception as e:
                    print(f"Runtime calc error for {machine_id}:", e)

            raw_telemetry = snapshot.get("telemetry", {})
            # Remove simulator counter, use DB-calculated runtime
            raw_telemetry.pop("running_time", None)
            raw_telemetry["runtime"] = cached_runtime

            payload = {
                "machine_id": machine_id,
                "current_state": state_value,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "telemetry": raw_telemetry,
                "current_job": snapshot.get("current_job"),
                "business": snapshot.get("business", {})
            }

            await websocket.send_json(payload)

            await asyncio.sleep(0.2)

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for {machine_id}")