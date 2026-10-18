from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class CoderProfile(Base):
    __tablename__ = "coder_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    organization = Column(String, nullable=True, default="Apex Health Systems")
    certification_details = Column(String, nullable=True, default="CPC, CCS-P")
    experience_years = Column(Integer, nullable=True, default=5)
    preferred_coding_system = Column(String, nullable=True, default="ICD-10-CM / CPT / HCPCS")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="coder_profile")
