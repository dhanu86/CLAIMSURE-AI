from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import json

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.models.doctor import PatientEncounter
from app.models.claim_form import CMS1500Form
from app.schemas.doctor import (
    EncounterCreate, EncounterOut,
    CMS1500Create, CMS1500Update, CMS1500Out
)
from app.services.cms1500_service import CMS1500Service
from app.services.ai_service import AIService

router = APIRouter(prefix="/doctor", tags=["Doctor Portal"])
doctor_auth = Depends(require_role(["Doctor"]))

@router.post("/encounters", response_model=EncounterOut)
def create_encounter(
    enc_in: EncounterCreate,
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    # Analyze notes for candidate codes
    analysis = AIService.analyze_clinical_document(enc_in.clinical_notes, "Encounter Notes")
    diag_str = ", ".join([f"{d['code']} ({d['description']})" for d in analysis["extracted_diagnoses"]])
    proc_str = ", ".join([f"{p['code']} ({p['description']})" for p in analysis["extracted_procedures"]])

    enc = PatientEncounter(
        doctor_id=current_user.id,
        patient_name=enc_in.patient_name,
        patient_dob=enc_in.patient_dob or "1984-05-14",
        encounter_date=enc_in.encounter_date or "2026-10-01",
        clinical_notes=enc_in.clinical_notes,
        extracted_diagnoses=diag_str,
        extracted_procedures=proc_str
    )
    db.add(enc)
    db.commit()
    db.refresh(enc)
    return EncounterOut.from_orm(enc)

@router.get("/encounters", response_model=List[EncounterOut])
def list_encounters(
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    encs = db.query(PatientEncounter).filter(PatientEncounter.doctor_id == current_user.id).order_by(PatientEncounter.created_at.desc()).all()
    return [EncounterOut.from_orm(e) for e in encs]

@router.delete("/encounters/{encounter_id}")
def delete_encounter(
    encounter_id: str,
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    enc = db.query(PatientEncounter).filter(PatientEncounter.id == encounter_id, PatientEncounter.doctor_id == current_user.id).first()
    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")
    db.delete(enc)
    db.commit()
    return {"message": "Encounter deleted successfully"}

@router.post("/claim-forms", response_model=CMS1500Out)
def create_claim_form(
    form_in: CMS1500Create,
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    diag_json = json.dumps(form_in.diagnosis_codes or ["E11.9", "I10"])
    proc_json = json.dumps(form_in.procedure_codes or ["99214", "36415"])
    
    fdata = form_in.form_data or {}
    fdata.setdefault("patient_name", form_in.patient_name)
    fdata.setdefault("patient_dob", form_in.patient_dob or "1984-05-14")
    fdata.setdefault("insurance_name", form_in.insurance_name or "Blue Cross Shield")
    fdata.setdefault("policy_id", form_in.policy_id or "POL-994821102")

    is_valid, errors = CMS1500Service.validate_form(fdata, form_in.diagnosis_codes, form_in.procedure_codes)
    status_val = "Validated" if is_valid else "Draft"

    form_obj = CMS1500Form(
        doctor_id=current_user.id,
        patient_name=form_in.patient_name,
        patient_dob=form_in.patient_dob,
        insurance_name=form_in.insurance_name,
        policy_id=form_in.policy_id,
        diagnosis_codes_json=diag_json,
        procedure_codes_json=proc_json,
        status=status_val,
        form_data_json=json.dumps(fdata)
    )
    db.add(form_obj)
    db.commit()
    db.refresh(form_obj)

    return CMS1500Out(
        id=form_obj.id,
        doctor_id=form_obj.doctor_id,
        patient_name=form_obj.patient_name,
        patient_dob=form_obj.patient_dob,
        insurance_name=form_obj.insurance_name,
        policy_id=form_obj.policy_id,
        diagnosis_codes=json.loads(form_obj.diagnosis_codes_json),
        procedure_codes=json.loads(form_obj.procedure_codes_json),
        status=form_obj.status,
        form_data=json.loads(form_obj.form_data_json),
        created_at=form_obj.created_at,
        updated_at=form_obj.updated_at
    )

@router.get("/claim-forms", response_model=List[CMS1500Out])
def list_claim_forms(
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    forms = db.query(CMS1500Form).filter(CMS1500Form.doctor_id == current_user.id).order_by(CMS1500Form.updated_at.desc()).all()
    
    output = []
    for f in forms:
        output.append(CMS1500Out(
            id=f.id,
            doctor_id=f.doctor_id,
            patient_name=f.patient_name,
            patient_dob=f.patient_dob,
            insurance_name=f.insurance_name,
            policy_id=f.policy_id,
            diagnosis_codes=json.loads(f.diagnosis_codes_json) if f.diagnosis_codes_json else [],
            procedure_codes=json.loads(f.procedure_codes_json) if f.procedure_codes_json else [],
            status=f.status,
            form_data=json.loads(f.form_data_json) if f.form_data_json else {},
            created_at=f.created_at,
            updated_at=f.updated_at
        ))
    return output

@router.get("/claim-forms/{form_id}", response_model=CMS1500Out)
def get_claim_form(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    f = db.query(CMS1500Form).filter(CMS1500Form.id == form_id, CMS1500Form.doctor_id == current_user.id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Claim form not found")
        
    return CMS1500Out(
        id=f.id,
        doctor_id=f.doctor_id,
        patient_name=f.patient_name,
        patient_dob=f.patient_dob,
        insurance_name=f.insurance_name,
        policy_id=f.policy_id,
        diagnosis_codes=json.loads(f.diagnosis_codes_json) if f.diagnosis_codes_json else [],
        procedure_codes=json.loads(f.procedure_codes_json) if f.procedure_codes_json else [],
        status=f.status,
        form_data=json.loads(f.form_data_json) if f.form_data_json else {},
        created_at=f.created_at,
        updated_at=f.updated_at
    )

@router.patch("/claim-forms/{form_id}", response_model=CMS1500Out)
def update_claim_form(
    form_id: str,
    form_up: CMS1500Update,
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    f = db.query(CMS1500Form).filter(CMS1500Form.id == form_id, CMS1500Form.doctor_id == current_user.id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Claim form not found")

    if form_up.patient_name: f.patient_name = form_up.patient_name
    if form_up.patient_dob: f.patient_dob = form_up.patient_dob
    if form_up.insurance_name: f.insurance_name = form_up.insurance_name
    if form_up.policy_id: f.policy_id = form_up.policy_id
    if form_up.status: f.status = form_up.status
    if form_up.diagnosis_codes is not None: f.diagnosis_codes_json = json.dumps(form_up.diagnosis_codes)
    if form_up.procedure_codes is not None: f.procedure_codes_json = json.dumps(form_up.procedure_codes)
    if form_up.form_data is not None: f.form_data_json = json.dumps(form_up.form_data)

    db.commit()
    db.refresh(f)
    return get_claim_form(form_id, db, current_user)

@router.get("/claim-forms/{form_id}/pdf")
def export_claim_form_pdf(
    form_id: str,
    db: Session = Depends(get_db),
    current_user: User = doctor_auth
):
    f = db.query(CMS1500Form).filter(CMS1500Form.id == form_id, CMS1500Form.doctor_id == current_user.id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Claim form not found")

    form_data = json.loads(f.form_data_json) if f.form_data_json else {}
    diag_codes = json.loads(f.diagnosis_codes_json) if f.diagnosis_codes_json else []
    proc_codes = json.loads(f.procedure_codes_json) if f.procedure_codes_json else []

    pdf_bytes = CMS1500Service.generate_cms1500_pdf(form_data, diag_codes, proc_codes)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=CMS1500_{f.patient_name.replace(' ', '_')}_{f.id[:8]}.pdf"}
    )
