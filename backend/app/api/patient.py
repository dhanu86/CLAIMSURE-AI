from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import random

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.models.claim import PatientClaim
from app.schemas.patient import PatientClaimCreate, PatientClaimUpdate, PatientClaimOut

router = APIRouter(prefix="/patient", tags=["Patient Portal"])
patient_auth = Depends(require_role(["Patient"]))

@router.post("/claims", response_model=PatientClaimOut)
def create_claim(
    claim_in: PatientClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = patient_auth
):
    ref_num = f"CLM-2026-{random.randint(10000, 99999)}"
    doc_ids_json = json.dumps(claim_in.supporting_document_ids or [])

    claim = PatientClaim(
        patient_id=current_user.id,
        claim_reference=ref_num,
        title=claim_in.title,
        description=claim_in.description,
        provider_name=claim_in.provider_name or "General Health Clinic",
        amount_claimed=claim_in.amount_claimed or "$230.00",
        status="Submitted",
        supporting_document_ids_json=doc_ids_json
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    return PatientClaimOut(
        id=claim.id,
        patient_id=claim.patient_id,
        claim_reference=claim.claim_reference,
        title=claim.title,
        description=claim.description,
        provider_name=claim.provider_name,
        amount_claimed=claim.amount_claimed,
        status=claim.status,
        supporting_document_ids=json.loads(claim.supporting_document_ids_json),
        submitted_at=claim.submitted_at,
        updated_at=claim.updated_at
    )

@router.get("/claims", response_model=List[PatientClaimOut])
def list_claims(
    db: Session = Depends(get_db),
    current_user: User = patient_auth
):
    claims = db.query(PatientClaim).filter(PatientClaim.patient_id == current_user.id).order_by(PatientClaim.submitted_at.desc()).all()
    
    output = []
    for c in claims:
        output.append(PatientClaimOut(
            id=c.id,
            patient_id=c.patient_id,
            claim_reference=c.claim_reference,
            title=c.title,
            description=c.description,
            provider_name=c.provider_name,
            amount_claimed=c.amount_claimed,
            status=c.status,
            supporting_document_ids=json.loads(c.supporting_document_ids_json) if c.supporting_document_ids_json else [],
            submitted_at=c.submitted_at,
            updated_at=c.updated_at
        ))
    return output

@router.get("/claims/{claim_id}", response_model=PatientClaimOut)
def get_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = patient_auth
):
    c = db.query(PatientClaim).filter(PatientClaim.id == claim_id, PatientClaim.patient_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Claim record not found")
        
    return PatientClaimOut(
        id=c.id,
        patient_id=c.patient_id,
        claim_reference=c.claim_reference,
        title=c.title,
        description=c.description,
        provider_name=c.provider_name,
        amount_claimed=c.amount_claimed,
        status=c.status,
        supporting_document_ids=json.loads(c.supporting_document_ids_json) if c.supporting_document_ids_json else [],
        submitted_at=c.submitted_at,
        updated_at=c.updated_at
    )

@router.patch("/claims/{claim_id}", response_model=PatientClaimOut)
def update_claim(
    claim_id: str,
    claim_up: PatientClaimUpdate,
    db: Session = Depends(get_db),
    current_user: User = patient_auth
):
    c = db.query(PatientClaim).filter(PatientClaim.id == claim_id, PatientClaim.patient_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Claim record not found")

    if claim_up.status: c.status = claim_up.status
    if claim_up.description: c.description = claim_up.description

    db.commit()
    db.refresh(c)
    return get_claim(claim_id, db, current_user)
