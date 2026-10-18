from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
from app.core.database import Base

class CMS1500Form(Base):
    __tablename__ = "cms1500_forms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_name = Column(String, nullable=False)
    patient_dob = Column(String, nullable=True)
    insurance_name = Column(String, nullable=True)
    policy_id = Column(String, nullable=True)
    diagnosis_codes_json = Column(Text, nullable=True, default="[]")  # List of diagnosis codes
    procedure_codes_json = Column(Text, nullable=True, default="[]")  # List of procedure codes
    status = Column(String, default="Draft")  # Draft, Validated, Saved, Exported
    form_data_json = Column(Text, nullable=False, default="{}")  # Full box-by-box CMS-1500 structure
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
