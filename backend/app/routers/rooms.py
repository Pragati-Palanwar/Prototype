from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid
from app.db.session import SessionLocal
from app.services.room_service import create_room

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/rooms")
def create_room_endpoint(db: Session = Depends(get_db)):
    """
    Create a new room and persist it in DB. Returns { roomId }.
    """
    room = create_room(db)
    return {"roomId": str(room.id)}
