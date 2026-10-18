from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentOut(BaseModel):
    id: str
    filename: str
    file_size: int
    content_type: str
    document_type: str
    total_pages: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    document: DocumentOut
    extracted_text_preview: str
    chunk_count: int
