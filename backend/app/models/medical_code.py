from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
import uuid
from app.core.database import Base

class MedicalCode(Base):
    __tablename__ = "medical_codes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, index=True, nullable=False)
    system = Column(String, index=True, nullable=False)  # "ICD-10-CM", "CPT", "HCPCS"
    description = Column(Text, nullable=False)
    effective_date = Column(String, default="2026-01-01")
    usage_notes = Column(Text, nullable=True)
    clinical_evidence = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
