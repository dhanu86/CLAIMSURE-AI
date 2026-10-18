from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    document_id: Optional[str] = None

class ConversationUpdate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    content: str
    document_id: Optional[str] = None

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    citations: Optional[List[Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    role: str
    title: str
    document_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None

    class Config:
        from_attributes = True
