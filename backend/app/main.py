import os
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.room import Room
from app.routers import rooms as rooms_router
from app.routers import autocomplete as autocomplete_router
from app.services.ws_manager import WSManager
from app.services.room_service import get_room_by_id, ensure_room_exists

# create tables if not existing (quick prototype)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Realtime Pair Programming Prototype")

# CORS configuration - environment-based
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms_router.router)
app.include_router(autocomplete_router.router)

manager = WSManager()

# dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, db: Session = Depends(get_db)):
    # accept & connect
    await manager.connect(room_id, websocket)
    try:
        # ensure room exists in DB (create if missing) and load persisted code
        room = get_room_by_id(db, room_id)
        if room is None:
            # creates a new row with given uuid
            room = ensure_room_exists(db, room_id)

        # send init message with latest code to the connected client
        init_payload = {"type": "init", "code": room.code or ""}
        await websocket.send_json(init_payload)

        # Listen for messages
        while True:
            data = await websocket.receive_json()
            # expected message format: {"type":"update", "code": "...", "cursor": 123}
            msg_type = data.get("type")
            if msg_type == "update":
                code = data.get("code", "")
                cursor = data.get("cursor", 0)
                # save into in-memory state
                manager.code_state[room_id] = code
                # broadcast to other clients
                await manager.broadcast_code(room_id, {"type": "update", "code": code, "cursor": cursor}, sender=websocket)
                # optionally persist asynchronously (debounce style)
                # For prototype keep simple: schedule a small delay save to DB to avoid saving on every keystroke
                asyncio.create_task(manager.persist_room_debounced(room_id, db))
            else:
                # unknown types ignored
                pass

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
