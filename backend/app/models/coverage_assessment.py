from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
from app.core.database import Base

class CodingAnalysis(Base):
    __tablename__ = "coding_analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    coder_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    document_name = Column(String, nullable=False)
    extracted_diagnoses_json = Column(Text, default="[]")
    extracted_procedures_json = Column(Text, default="[]")
    code_suggestions_json = Column(Text, default="[]")
    missing_documentation_json = Column(Text, default="[]")
    status = Column(String, default="Analysis Complete")
    created_at = Column(DateTime, default=datetime.utcnow)

class CoverageAssessment(Base):
    __tablename__ = "coverage_assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    coder_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    clinical_document_id = Column(String, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    policy_document_id = Column(String, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    preliminary_status = Column(String, nullable=False, default="Manual Review Required") # Potentially Covered, Potentially Not Covered, More Information Required, Manual Review Required
    report_json = Column(Text, nullable=False, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
