from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class EncounterCreate(BaseModel):
    patient_name: str
    patient_dob: Optional[str] = None
    encounter_date: Optional[str] = None
    clinical_notes: str

class EncounterOut(BaseModel):
    id: str
    patient_name: str
    patient_dob: Optional[str] = None
    encounter_date: Optional[str] = None
    clinical_notes: str
    extracted_diagnoses: Optional[str] = None
    extracted_procedures: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CMS1500Create(BaseModel):
    patient_name: str
    patient_dob: Optional[str] = None
    insurance_name: Optional[str] = None
    policy_id: Optional[str] = None
    diagnosis_codes: List[str] = []
    procedure_codes: List[str] = []
    form_data: Dict[str, Any] = {}

class CMS1500Update(BaseModel):
    patient_name: Optional[str] = None
    patient_dob: Optional[str] = None
    insurance_name: Optional[str] = None
    policy_id: Optional[str] = None
    diagnosis_codes: Optional[List[str]] = None
    procedure_codes: Optional[List[str]] = None
    status: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None

class CMS1500Out(BaseModel):
    id: str
    doctor_id: str
    patient_name: str
    patient_dob: Optional[str] = None
    insurance_name: Optional[str] = None
    policy_id: Optional[str] = None
    diagnosis_codes: List[str]
    procedure_codes: List[str]
    status: str
    form_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
