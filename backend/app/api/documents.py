from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.documents import DocumentOut, DocumentUploadResponse
from app.services.rag_service import RAGService
from app.core.config import settings
import os
import uuid

router = APIRouter(prefix="/documents", tags=["Document Management"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("clinical_summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, DOCX, TXT"
        )
        
    # Read file bytes
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 15MB limit")
        
    # Save file to storage
    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}_{filename}"
    file_path = os.path.join(settings.STORAGE_DIR, stored_filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    # Process document text & store RAG chunks
    doc_obj = RAGService.process_and_store_document(
        db=db,
        owner_id=current_user.id,
        filename=filename,
        file_path=file_path,
        file_size=len(contents),
        content_type=file.content_type or "application/octet-stream",
        document_type=document_type
    )

    preview = doc_obj.extracted_text[:300] if doc_obj.extracted_text else "No text extracted."
    chunk_cnt = len(doc_obj.chunks)

    return DocumentUploadResponse(
        document=DocumentOut.from_orm(doc_obj),
        extracted_text_preview=preview,
        chunk_count=chunk_cnt
    )

@router.get("", response_model=List[DocumentOut])
def list_user_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).filter(Document.owner_id == current_user.id).order_by(Document.created_at.desc()).all()
    return [DocumentOut.from_orm(d) for d in docs]

@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    return DocumentOut.from_orm(doc)

@router.get("/{document_id}/download")
def download_document(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.owner_id == current_user.id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(doc.file_path, filename=doc.filename, media_type=doc.content_type)

@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
