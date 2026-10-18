from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    designation = Column(String, nullable=True, default="M.D.")
    specialty = Column(String, nullable=True, default="General Practice")
    hospital = Column(String, nullable=True, default="City Medical Center")
    license_number = Column(String, nullable=True)
    npi_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="doctor_profile")


class PatientEncounter(Base):
    __tablename__ = "patient_encounters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_name = Column(String, nullable=False)
    patient_dob = Column(String, nullable=True)
    encounter_date = Column(String, nullable=True)
    clinical_notes = Column(Text, nullable=False)
    extracted_diagnoses = Column(Text, nullable=True)
    extracted_procedures = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
