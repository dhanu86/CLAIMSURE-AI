from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PatientClaimCreate(BaseModel):
    title: str
    description: Optional[str] = None
    provider_name: Optional[str] = None
    amount_claimed: Optional[str] = "$0.00"
    supporting_document_ids: List[str] = []

class PatientClaimUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None

class PatientClaimOut(BaseModel):
    id: str
    patient_id: str
    claim_reference: str
    title: str
    description: Optional[str] = None
    provider_name: Optional[str] = None
    amount_claimed: str
    status: str
    supporting_document_ids: List[str]
    submitted_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
