from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role_details: Optional[Dict[str, Any]] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserProfileFullOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone_number: Optional[str] = None
    created_at: Any
    doctor_profile: Optional[Dict[str, Any]] = None
    patient_profile: Optional[Dict[str, Any]] = None
    coder_profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
