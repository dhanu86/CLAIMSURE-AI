from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from app.models.coder import CoderProfile
from app.schemas.profile import ProfileUpdate, PasswordChange, UserProfileFullOut

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("/me", response_model=UserProfileFullOut)
def get_full_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc_p = None
    pat_p = None
    cod_p = None
    
    if current_user.doctor_profile:
        doc_p = {
            "designation": current_user.doctor_profile.designation,
            "specialty": current_user.doctor_profile.specialty,
            "hospital": current_user.doctor_profile.hospital,
            "license_number": current_user.doctor_profile.license_number,
            "npi_number": current_user.doctor_profile.npi_number,
        }
    if current_user.patient_profile:
        pat_p = {
            "dob": current_user.patient_profile.dob,
            "address": current_user.patient_profile.address,
            "insurance_provider": current_user.patient_profile.insurance_provider,
            "policy_number": current_user.patient_profile.policy_number,
            "group_number": current_user.patient_profile.group_number,
        }
    if current_user.coder_profile:
        cod_p = {
            "organization": current_user.coder_profile.organization,
            "certification_details": current_user.coder_profile.certification_details,
            "experience_years": current_user.coder_profile.experience_years,
            "preferred_coding_system": current_user.coder_profile.preferred_coding_system,
        }

    return UserProfileFullOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        phone_number=current_user.phone_number,
        created_at=current_user.created_at,
        doctor_profile=doc_p,
        patient_profile=pat_p,
        coder_profile=cod_p
    )

@router.patch("/me", response_model=UserProfileFullOut)
def update_profile(prof_in: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if prof_in.full_name:
        current_user.full_name = prof_in.full_name
    if prof_in.phone_number is not None:
        current_user.phone_number = prof_in.phone_number
        
    # Update role-specific fields
    rd = prof_in.role_details or {}
    if current_user.role == "Doctor" and current_user.doctor_profile:
        if "designation" in rd: current_user.doctor_profile.designation = rd["designation"]
        if "specialty" in rd: current_user.doctor_profile.specialty = rd["specialty"]
        if "hospital" in rd: current_user.doctor_profile.hospital = rd["hospital"]
        if "license_number" in rd: current_user.doctor_profile.license_number = rd["license_number"]
        if "npi_number" in rd: current_user.doctor_profile.npi_number = rd["npi_number"]

    elif current_user.role == "Patient" and current_user.patient_profile:
        if "dob" in rd: current_user.patient_profile.dob = rd["dob"]
        if "address" in rd: current_user.patient_profile.address = rd["address"]
        if "insurance_provider" in rd: current_user.patient_profile.insurance_provider = rd["insurance_provider"]
        if "policy_number" in rd: current_user.patient_profile.policy_number = rd["policy_number"]

    elif current_user.role == "Medical Coder" and current_user.coder_profile:
        if "organization" in rd: current_user.coder_profile.organization = rd["organization"]
        if "certification_details" in rd: current_user.coder_profile.certification_details = rd["certification_details"]
        if "experience_years" in rd: current_user.coder_profile.experience_years = rd["experience_years"]

    db.commit()
    db.refresh(current_user)
    return get_full_profile(current_user, db)

@router.post("/change-password")
def change_password(pwd_in: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(pwd_in.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
        
    current_user.password_hash = get_password_hash(pwd_in.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
