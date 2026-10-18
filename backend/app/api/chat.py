from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.chat import Conversation, Message
from app.schemas.chat import (
    ConversationCreate, ConversationUpdate, ConversationOut,
    MessageCreate, MessageOut
)
from app.services.rag_service import RAGService
from app.services.ai_service import AIService

router = APIRouter(prefix="/chat", tags=["Persistent Chatbot & Conversations"])

@router.post("/conversations", response_model=ConversationOut)
def create_conversation(
    conv_in: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = Conversation(
        user_id=current_user.id,
        role=current_user.role,
        title=conv_in.title or "New Conversation",
        document_id=conv_in.document_id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Initial welcome message based on role
    welcome_texts = {
        "Doctor": "Hello Doctor! I am your AI Clinical & Coding Assistant. How can I help with your encounter or CMS-1500 form today?",
        "Patient": "Welcome! I can help you understand medical terms, explain policy clauses, and review your claims.",
        "Medical Coder": "Welcome Coder! Upload clinical discharge summaries or policy PDFs to extract codes and perform preliminary coverage audits."
    }
    init_msg = Message(
        conversation_id=conv.id,
        sender="assistant",
        content=welcome_texts.get(current_user.role, "Hello! How can I assist you today?"),
        citations_json="[]"
    )
    db.add(init_msg)
    db.commit()

    res = ConversationOut.from_orm(conv)
    res.last_message = init_msg.content
    return res

@router.get("/conversations", response_model=List[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.id,
        Conversation.role == current_user.role
    ).order_by(Conversation.updated_at.desc()).all()

    result = []
    for c in convs:
        last_m = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.desc()).first()
        co = ConversationOut.from_orm(c)
        co.last_message = last_m.content[:80] if last_m else None
        result.append(co)

    return result

@router.get("/conversations/search", response_model=List[ConversationOut])
def search_conversations(
    q: str = Query(..., description="Query term to search in titles and messages"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pattern = f"%{q.strip()}%"
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.id,
        Conversation.role == current_user.role,
        Conversation.title.ilike(pattern)
    ).all()

    result = []
    for c in convs:
        co = ConversationOut.from_orm(c)
        result.append(co)
    return result

@router.get("/conversations/{conversation_id}", response_model=ConversationOut)
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationOut.from_orm(conv)

@router.patch("/conversations/{conversation_id}", response_model=ConversationOut)
def update_conversation(
    conversation_id: str,
    conv_up: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.title = conv_up.title
    db.commit()
    db.refresh(conv)
    return ConversationOut.from_orm(conv)

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully"}

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageOut])
def list_messages(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msgs = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    
    output = []
    for m in msgs:
        cit = json.loads(m.citations_json) if m.citations_json else []
        output.append(MessageOut(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            content=m.content,
            citations=cit,
            created_at=m.created_at
        ))
    return output

@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut)
def send_message(
    conversation_id: str,
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # 1. Save user message
    user_msg = Message(
        conversation_id=conv.id,
        sender="user",
        content=msg_in.content,
        citations_json="[]"
    )
    db.add(user_msg)
    
    # Auto update title if still default
    if conv.title == "New Conversation":
        conv.title = msg_in.content[:30] + ("..." if len(msg_in.content) > 30 else "")
        
    db.commit()

    # 2. Retrieve grounded RAG document context if doc associated
    doc_id = msg_in.document_id or conv.document_id
    doc_chunks = []
    if doc_id:
        doc_chunks = RAGService.retrieve_relevant_chunks(db, query=msg_in.content, user_id=current_user.id, document_id=doc_id)

    # 3. Generate AI response
    ai_result = AIService.generate_chat_response(
        role=current_user.role,
        user_message=msg_in.content,
        conversation_history=[],
        document_chunks=doc_chunks
    )

    # 4. Save assistant message
    citations_json = json.dumps(ai_result.get("citations", []))
    asst_msg = Message(
        conversation_id=conv.id,
        sender="assistant",
        content=ai_result.get("content", ""),
        citations_json=citations_json
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return MessageOut(
        id=asst_msg.id,
        conversation_id=asst_msg.conversation_id,
        sender=asst_msg.sender,
        content=asst_msg.content,
        citations=ai_result.get("citations", []),
        created_at=asst_msg.created_at
    )
