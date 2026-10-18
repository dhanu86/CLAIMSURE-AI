from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.models.document import Document
from app.models.coverage_assessment import CodingAnalysis, CoverageAssessment
from app.schemas.coder import (
    AnalysisCreate, AnalysisOut,
    CoverageAssessmentCreate, CoverageAssessmentOut
)
from app.services.ai_service import AIService

router = APIRouter(prefix="/coder", tags=["Medical Coder Portal"])
coder_auth = Depends(require_role(["Medical Coder"]))

@router.post("/analyses", response_model=AnalysisOut)
def create_coding_analysis(
    an_in: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = coder_auth
):
    doc = db.query(Document).filter(Document.id == an_in.document_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    text_content = doc.extracted_text or ""
    analysis_res = AIService.analyze_clinical_document(text_content, doc.filename)

    an_obj = CodingAnalysis(
        coder_id=current_user.id,
        document_id=doc.id,
        document_name=doc.filename,
        extracted_diagnoses_json=json.dumps(analysis_res["extracted_diagnoses"]),
        extracted_procedures_json=json.dumps(analysis_res["extracted_procedures"]),
        code_suggestions_json=json.dumps(analysis_res["code_suggestions"]),
        missing_documentation_json=json.dumps(analysis_res["missing_documentation"]),
        status="Analysis Complete"
    )
    db.add(an_obj)
    db.commit()
    db.refresh(an_obj)

    return AnalysisOut(
        id=an_obj.id,
        coder_id=an_obj.coder_id,
        document_id=an_obj.document_id,
        document_name=an_obj.document_name,
        extracted_diagnoses=json.loads(an_obj.extracted_diagnoses_json),
        extracted_procedures=json.loads(an_obj.extracted_procedures_json),
        code_suggestions=json.loads(an_obj.code_suggestions_json),
        missing_documentation=json.loads(an_obj.missing_documentation_json),
        status=an_obj.status,
        created_at=an_obj.created_at
    )

@router.get("/analyses", response_model=List[AnalysisOut])
def list_analyses(
    db: Session = Depends(get_db),
    current_user: User = coder_auth
):
    ans = db.query(CodingAnalysis).filter(CodingAnalysis.coder_id == current_user.id).order_by(CodingAnalysis.created_at.desc()).all()
    output = []
    for a in ans:
        output.append(AnalysisOut(
            id=a.id,
            coder_id=a.coder_id,
            document_id=a.document_id,
            document_name=a.document_name,
            extracted_diagnoses=json.loads(a.extracted_diagnoses_json) if a.extracted_diagnoses_json else [],
            extracted_procedures=json.loads(a.extracted_procedures_json) if a.extracted_procedures_json else [],
            code_suggestions=json.loads(a.code_suggestions_json) if a.code_suggestions_json else [],
            missing_documentation=json.loads(a.missing_documentation_json) if a.missing_documentation_json else [],
            status=a.status,
            created_at=a.created_at
        ))
    return output

@router.get("/analyses/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = coder_auth
):
    a = db.query(CodingAnalysis).filter(CodingAnalysis.id == analysis_id, CodingAnalysis.coder_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    return AnalysisOut(
        id=a.id,
        coder_id=a.coder_id,
        document_id=a.document_id,
        document_name=a.document_name,
        extracted_diagnoses=json.loads(a.extracted_diagnoses_json) if a.extracted_diagnoses_json else [],
        extracted_procedures=json.loads(a.extracted_procedures_json) if a.extracted_procedures_json else [],
        code_suggestions=json.loads(a.code_suggestions_json) if a.code_suggestions_json else [],
        missing_documentation=json.loads(a.missing_documentation_json) if a.missing_documentation_json else [],
        status=a.status,
        created_at=a.created_at
    )

@router.post("/analyses/{analysis_id}/review")
def review_coding_analysis(
    analysis_id: str,
    review_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = coder_auth
):
    a = db.query(CodingAnalysis).filter(CodingAnalysis.id == analysis_id, CodingAnalysis.coder_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    if "code_suggestions" in review_data:
        a.code_suggestions_json = json.dumps(review_data["code_suggestions"])
    a.status = review_data.get("status", "Human Reviewed")
    
    db.commit()
    return {"message": "Coding review updated successfully"}

@router.post("/coverage-assessments", response_model=CoverageAssessmentOut)
def create_coverage_assessment(
    ca_in: CoverageAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = coder_auth
):
    clin_text = ""
    pol_text = ""
    
    if ca_in.clinical_document_id:
        c_doc = db.query(Document).filter(Document.id == ca_in.clinical_document_id).first()
        if c_doc: clin_text = c_doc.extracted_text or ""
        
    if ca_in.policy_document_id:
        p_doc = db.query(Document).filter(Document.id == ca_in.policy_document_id).first()
        if p_doc: pol_text = p_doc.extracted_text or ""

    assessment_data = AIService.assess_insurance_coverage(clin_text, pol_text)

    ca_obj = CoverageAssessment(
        coder_id=current_user.id,
        clinical_document_id=ca_in.clinical_document_id,
        policy_document_id=ca_in.policy_document_id,
        preliminary_status=assessment_data["preliminary_status"],
        report_json=json.dumps(assessment_data)
    )
    db.add(ca_obj)
    db.commit()
    db.refresh(ca_obj)

    return CoverageAssessmentOut(
        id=ca_obj.id,
        coder_id=ca_obj.coder_id,
        clinical_document_id=ca_obj.clinical_document_id,
        policy_document_id=ca_obj.policy_document_id,
        preliminary_status=ca_obj.preliminary_status,
        report=json.loads(ca_obj.report_json),
        created_at=ca_obj.created_at
    )

@router.get("/coverage-assessments/{assessment_id}", response_model=CoverageAssessmentOut)
def get_coverage_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = coder_auth
):
    ca = db.query(CoverageAssessment).filter(CoverageAssessment.id == assessment_id, CoverageAssessment.coder_id == current_user.id).first()
    if not ca:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return CoverageAssessmentOut(
        id=ca.id,
        coder_id=ca.coder_id,
        clinical_document_id=ca.clinical_document_id,
        policy_document_id=ca.policy_document_id,
        preliminary_status=ca.preliminary_status,
        report=json.loads(ca.report_json),
        created_at=ca.created_at
    )
