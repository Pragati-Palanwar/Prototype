from pydantic import BaseModel


class RoomCreate(BaseModel):
    pass  # No fields needed, we just generate a room ID


class RoomResponse(BaseModel):
    roomId: str


class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str = "python"


class AutocompleteResponse(BaseModel):
    suggestion: str
