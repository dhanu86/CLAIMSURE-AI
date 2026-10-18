from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.services.text_extractor import TextExtractor
from typing import List, Dict, Any, Optional
import os
import json

class RAGService:
    @staticmethod
    def process_and_store_document(
        db: Session,
        owner_id: str,
        filename: str,
        file_path: str,
        file_size: int,
        content_type: str,
        document_type: str = "general"
    ) -> Document:
        # Extract text & pages
        extracted_text, pages = TextExtractor.extract_text(file_path, content_type)
        total_pages = len(pages) if pages else 1

        # Create Document record
        doc_obj = Document(
            owner_id=owner_id,
            filename=filename,
            file_path=file_path,
            file_size=file_size,
            content_type=content_type,
            document_type=document_type,
            total_pages=total_pages,
            status="processed",
            extracted_text=extracted_text
        )
        db.add(doc_obj)
        db.commit()
        db.refresh(doc_obj)

        # Chunk text
        chunks = TextExtractor.chunk_text(pages, chunk_size=300, overlap=50)
        for c in chunks:
            chunk_obj = DocumentChunk(
                document_id=doc_obj.id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                content=c["content"],
                embedding_json=json.dumps([0.0] * 16)  # Mock vector placeholder for fast search
            )
            db.add(chunk_obj)
            
        db.commit()
        return doc_obj

    @staticmethod
    def retrieve_relevant_chunks(
        db: Session,
        query: str,
        user_id: str,
        document_id: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant document chunks for the given query and user permission.
        """
        q = db.query(DocumentChunk).join(Document).filter(Document.owner_id == user_id)
        
        if document_id:
            q = q.filter(DocumentChunk.document_id == document_id)
            
        all_chunks = q.all()
        if not all_chunks:
            return []

        query_terms = set(query.lower().split())
        scored_chunks = []
        
        for chunk in all_chunks:
            content_lower = chunk.content.lower()
            score = sum(1 for term in query_terms if term in content_lower)
            doc_name = chunk.document.filename if chunk.document else "Document"
            
            scored_chunks.append({
                "score": score,
                "document_id": chunk.document_id,
                "document_name": doc_name,
                "page_number": chunk.page_number,
                "content": chunk.content
            })

        # Sort by relevance score
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]
