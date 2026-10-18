from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
from app.core.database import Base

class PatientClaim(Base):
    __tablename__ = "patient_claims"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    claim_reference = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    provider_name = Column(String, nullable=True)
    amount_claimed = Column(String, nullable=True, default="$0.00")
    status = Column(String, default="Submitted")  # Draft, Submitted, Under Review, Additional Information Required, Processed, Closed
    supporting_document_ids_json = Column(Text, default="[]")
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
