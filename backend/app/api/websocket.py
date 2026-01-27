from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from datetime import datetime
from app.services.live import get_latest_machine_snapshot

router = APIRouter()

@router.websocket("/ws/machines/{machine_id}")
async def machine_live_ws(websocket: WebSocket, machine_id: str):
    await websocket.accept()

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

            payload = {
                "machine_id": machine_id,
                "current_state": state_value,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "telemetry": snapshot.get("telemetry", {}),  
                "current_job": snapshot.get("current_job")  
            }

            await websocket.send_json(payload)
            
            await asyncio.sleep(0.2)  

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for {machine_id}")