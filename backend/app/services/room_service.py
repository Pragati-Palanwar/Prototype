from sqlalchemy.orm import Session
import uuid
from app.models.room import Room
import datetime

def create_room(db: Session) -> Room:
    new_room = Room(code="", created_at=datetime.datetime.utcnow())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

def get_room_by_id(db: Session, room_id: str):
    try:
        # room_id may be UUID string, model uses UUID type
        return db.query(Room).filter(Room.id == room_id).first()
    except Exception:
        return None

def ensure_room_exists(db: Session, room_id: str):
    room = get_room_by_id(db, room_id)
    if room:
        return room
    # create with provided id (if UUID)
    try:
        uid = uuid.UUID(room_id)
    except Exception:
        uid = uuid.uuid4()
    new_room = Room(id=uid, code="", created_at=datetime.datetime.utcnow())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

def persist_room_code(db: Session, room_id: str, code: str):
    room = get_room_by_id(db, room_id)
    if not room:
        room = ensure_room_exists(db, room_id)
    room.code = code
    room.updated_at = datetime.datetime.utcnow()
    db.add(room)
    db.commit()
    db.refresh(room)
    return room
