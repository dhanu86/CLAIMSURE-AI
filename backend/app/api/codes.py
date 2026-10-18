from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.ai_service import AIService
from app.schemas.codes import MedicalCodeOut, CodeSearchResult

router = APIRouter(prefix="/codes", tags=["Medical Codes"])

@router.get("/search", response_model=CodeSearchResult)
def search_codes(
    q: Optional[str] = Query(default="", description="Search by disease, procedure, or medical query"),
    system: Optional[str] = Query(default="ALL", description="Filter by coding system: ICD-10-CM, CPT, HCPCS, or ALL"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    results = AIService.search_codes_llm(query=q, system=system)
    
    code_outs = []
    for c in results:
        code_outs.append(MedicalCodeOut(
            id=c.get("id", c.get("code", "0")),
            code=c.get("code", "N/A"),
            system=c.get("system", "ICD-10-CM"),
            description=c.get("description", "Medical Code"),
            effective_date=c.get("effective_date", "2026-01-01"),
            usage_notes=c.get("usage_notes", ""),
            clinical_evidence=c.get("clinical_evidence", "")
        ))

    return CodeSearchResult(
        query=q,
        total_found=len(code_outs),
        results=code_outs
    )

@router.get("/{code_str}", response_model=MedicalCodeOut)
def get_code(code_str: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    results = AIService.search_codes_llm(query=code_str, system="ALL")
    if not results:
        raise HTTPException(status_code=404, detail=f"Medical code '{code_str}' not found")
    c = results[0]
    return MedicalCodeOut(
        id=c.get("id", c.get("code", "0")),
        code=c.get("code", "N/A"),
        system=c.get("system", "ICD-10-CM"),
        description=c.get("description", "Medical Code"),
        effective_date=c.get("effective_date", "2026-01-01"),
        usage_notes=c.get("usage_notes", ""),
        clinical_evidence=c.get("clinical_evidence", "")
    )
