from typing import Dict, Set
from fastapi import WebSocket
import asyncio
from sqlalchemy.orm import Session
from app.services.room_service import persist_room_code

class WSManager:
    def __init__(self):
        # map room_id -> set of websockets
        self.rooms: Dict[str, Set[WebSocket]] = {}
        # in-memory latest code state
        self.code_state: Dict[str, str] = {}
        # debounce tasks per room to avoid saving to DB too frequently
        self._debounce_tasks: Dict[str, asyncio.Task] = {}
        self._debounce_delay = 1.0  # seconds

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        conns = self.rooms.setdefault(room_id, set())
        conns.add(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        conns = self.rooms.get(room_id)
        if not conns:
            return
        conns.discard(websocket)
        if len(conns) == 0:
            # cleanup empty room (persist final state is already handled by debounce)
            self.rooms.pop(room_id, None)
            # do not immediately remove code_state - optional
            # self.code_state.pop(room_id, None)

    async def broadcast_code(self, room_id: str, payload: dict, sender: WebSocket = None):
        conns = list(self.rooms.get(room_id, set()))
        for conn in conns:
            if conn is sender:
                continue
            try:
                await conn.send_json(payload)
            except Exception:
                # failed to send (client closed) - remove
                try:
                    conns.remove(conn)
                except ValueError:
                    pass

    async def persist_room_debounced(self, room_id: str, db: Session):
        """
        Debounce persistence: cancel previous task and schedule a new save after delay.
        """
        # cancel existing if any
        prev = self._debounce_tasks.get(room_id)
        if prev and not prev.done():
            prev.cancel()

        async def _save_after_delay():
            try:
                await asyncio.sleep(self._debounce_delay)
                code = self.code_state.get(room_id, "")
                persist_room_code(db, room_id, code)
            except asyncio.CancelledError:
                return

        task = asyncio.create_task(_save_after_delay())
        self._debounce_tasks[room_id] = task
