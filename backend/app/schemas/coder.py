from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AnalysisCreate(BaseModel):
    document_id: str

class AnalysisOut(BaseModel):
    id: str
    coder_id: str
    document_id: Optional[str] = None
    document_name: str
    extracted_diagnoses: List[Any]
    extracted_procedures: List[Any]
    code_suggestions: List[Any]
    missing_documentation: List[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CoverageAssessmentCreate(BaseModel):
    clinical_document_id: Optional[str] = None
    policy_document_id: Optional[str] = None

class CoverageAssessmentOut(BaseModel):
    id: str
    coder_id: str
    clinical_document_id: Optional[str] = None
    policy_document_id: Optional[str] = None
    preliminary_status: str
    report: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
