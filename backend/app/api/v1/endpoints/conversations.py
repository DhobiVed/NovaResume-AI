from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.database.models import Conversation, Message, Folder, FileAttachment
from app.services.export_service import export_service

router = APIRouter()

class FolderCreate(BaseModel):
    name: str
    color: Optional[str] = "#3b82f6"
    icon: Optional[str] = "folder"

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    folder_id: Optional[str] = None
    is_pinned: Optional[bool] = None
    system_prompt: Optional[str] = None
    model_name: Optional[str] = None

@router.get("/")
def get_conversations(
    folder_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Conversation)
    
    if folder_id:
        query = query.filter(Conversation.folder_id == folder_id)
    if search:
        query = query.filter(Conversation.title.ilike(f"%{search}%"))

    conversations = query.order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc()).all()
    
    result = []
    for c in conversations:
        msg_count = db.query(Message).filter(Message.conversation_id == c.id).count()
        result.append({
            "id": c.id,
            "title": c.title,
            "folder_id": c.folder_id,
            "is_pinned": c.is_pinned,
            "model_name": c.model_name,
            "system_prompt": c.system_prompt,
            "message_count": msg_count,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })
    return result

@router.post("/")
def create_conversation(data: ConversationUpdate, db: Session = Depends(get_db)):
    conv = Conversation(
        title=data.title or "New Chat",
        folder_id=data.folder_id,
        is_pinned=data.is_pinned or False,
        system_prompt=data.system_prompt or "You are NovaChat AI, an advanced intelligent AI assistant.",
        model_name=data.model_name or "llama-3.3-70b-versatile"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {"id": conv.id, "title": conv.title, "model_name": conv.model_name}

@router.get("/{conversation_id}")
def get_conversation_details(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
    attachments = db.query(FileAttachment).filter(FileAttachment.conversation_id == conversation_id).all()

    return {
        "id": conv.id,
        "title": conv.title,
        "folder_id": conv.folder_id,
        "is_pinned": conv.is_pinned,
        "system_prompt": conv.system_prompt,
        "model_name": conv.model_name,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "sources": m.sources,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in messages
        ],
        "attachments": [
            {
                "id": a.id,
                "filename": a.filename,
                "file_type": a.file_type,
                "file_size": a.file_size
            }
            for a in attachments
        ]
    }

@router.patch("/{conversation_id}")
def update_conversation(conversation_id: str, data: ConversationUpdate, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if data.title is not None:
        conv.title = data.title
    if data.folder_id is not None:
        conv.folder_id = data.folder_id
    if data.is_pinned is not None:
        conv.is_pinned = data.is_pinned
    if data.system_prompt is not None:
        conv.system_prompt = data.system_prompt
    if data.model_name is not None:
        conv.model_name = data.model_name

    db.commit()
    return {"message": "Conversation updated successfully"}

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}

@router.get("/{conversation_id}/export")
def export_chat(conversation_id: str, format: str = Query("json"), db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
    msg_dicts = [{"role": m.role, "content": m.content} for m in messages]

    export_path = export_service.export_conversation(conv.title, msg_dicts, format_type=format)
    return FileResponse(export_path, filename=f"{conv.title.replace(' ', '_')}.{format}")

# --- FOLDERS ---
@router.get("/folders/list")
def list_folders(db: Session = Depends(get_db)):
    folders = db.query(Folder).order_by(Folder.name).all()
    return [{"id": f.id, "name": f.name, "color": f.color, "icon": f.icon} for f in folders]

@router.post("/folders/create")
def create_folder(data: FolderCreate, db: Session = Depends(get_db)):
    folder = Folder(name=data.name, color=data.color, icon=data.icon)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return {"id": folder.id, "name": folder.name, "color": folder.color}

@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: str, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    return {"message": "Folder deleted"}
