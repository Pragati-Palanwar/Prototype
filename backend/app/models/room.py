import uuid
import datetime
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from app.db.base import Base
from sqlalchemy import func


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(length=36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(Text, nullable=False, default="")
    language = Column(String(32), nullable=True, default="python")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
