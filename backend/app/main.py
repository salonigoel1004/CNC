from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import machines, telemetry, websocket, state_timeline, jobs

app = FastAPI(title="CNC Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(machines.router)
app.include_router(telemetry.router)
app.include_router(websocket.router)
app.include_router(state_timeline.router)
app.include_router(jobs.router)