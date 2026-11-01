import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from app.models.coder import CoderProfile
from app.schemas.auth import UserRegister, UserLogin, PasswordResetRequest, TokenResponse, UserOut


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check duplicate email
    clean_email = user_in.email.lower().strip()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email is already registered. Please sign in or reset your password."
        )

    # Validate role
    valid_roles = ["Doctor", "Patient", "Medical Coder"]
    if user_in.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")

    # Flexible phone number handling (accepts 10 digits, international codes like +91, or optional blank)
    if user_in.phone_number and user_in.phone_number.strip():
        clean_phone = re.sub(r"\D", "", user_in.phone_number)
        if len(clean_phone) >= 10:
            user_in.phone_number = clean_phone[-10:]
        else:
            user_in.phone_number = clean_phone
    else:
        user_in.phone_number = None

    # Create user
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=clean_email,
        password_hash=hashed_pwd,
        full_name=user_in.full_name.strip(),
        role=user_in.role,
        phone_number=user_in.phone_number
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create role specific profile
    if user_in.role == "Doctor":
        doc_prof = DoctorProfile(
            user_id=user.id,
            specialty=user_in.specialty or "General Practice",
            hospital=user_in.organization or "City Medical Center"
        )
        db.add(doc_prof)
    elif user_in.role == "Patient":
        pat_prof = PatientProfile(
            user_id=user.id,
            insurance_provider=user_in.insurance_provider or "Blue Cross Blue Shield"
        )
        db.add(pat_prof)
    elif user_in.role == "Medical Coder":
        cod_prof = CoderProfile(
            user_id=user.id,
            organization=user_in.organization or "Apex Health Systems"
        )
        db.add(cod_prof)
        
    db.commit()

    # Generate tokens
    access_token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.from_orm(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    clean_email = login_in.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account does not exist with this email. Please check your email or Register."
        )
        
    if not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. If you forgot your password, please use 'Forgot Password' below to reset it."
        )

    access_token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.from_orm(user)
    )

@router.post("/reset-password", response_model=TokenResponse)
def reset_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email. Please register a new account."
        )
    
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.from_orm(user)
    )

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token(subject=user.id, extra_claims={"role": user.role})
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
