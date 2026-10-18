from pydantic import BaseModel
from typing import Optional, List

class MedicalCodeOut(BaseModel):
    id: str
    code: str
    system: str
    description: str
    effective_date: Optional[str] = None
    usage_notes: Optional[str] = None
    clinical_evidence: Optional[str] = None

    class Config:
        from_attributes = True

class CodeSearchResult(BaseModel):
    query: str
    total_found: int
    results: List[MedicalCodeOut]
