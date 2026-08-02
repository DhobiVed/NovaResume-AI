import os
import shutil
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.database.models import FileAttachment, Conversation
from app.services.file_service import file_service
from app.services.pdf_service import pdf_service
from app.core.config import UPLOADS_DIR, settings

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    conversation_id: str = Form(...),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        conv = Conversation(id=conversation_id, title="New Chat with File")
        db.add(conv)
        db.commit()

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{file_ext}' not supported. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Sanitize filename
    clean_original_filename = os.path.basename(file.filename)
    unique_filename = f"{uuid.uuid4().hex[:8]}_{clean_original_filename}"
    save_path = os.path.join(UPLOADS_DIR, unique_filename)

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(save_path)
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        os.remove(save_path)
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Process text/table content extraction
    res = file_service.process_file(save_path, clean_original_filename)
    
    attachment = FileAttachment(
        conversation_id=conversation_id,
        filename=clean_original_filename,
        file_type=res["file_type"],
        file_path=save_path,
        file_size=file_size,
        extracted_text=res["extracted_text"]
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "file_type": attachment.file_type,
        "file_size": attachment.file_size,
        "extracted_preview": res["extracted_text"][:300] if res["extracted_text"] else ""
    }

@router.get("/conversation/{conversation_id}")
def get_conversation_files(conversation_id: str, db: Session = Depends(get_db)):
    attachments = db.query(FileAttachment).filter(FileAttachment.conversation_id == conversation_id).all()
    return [
        {
            "id": a.id,
            "filename": a.filename,
            "file_type": a.file_type,
            "file_size": a.file_size,
            "extracted_preview": a.extracted_text[:200] if a.extracted_text else ""
        }
        for a in attachments
    ]

@router.get("/{file_id}/preview")
def preview_file(file_id: str, db: Session = Depends(get_db)):
    attachment = db.query(FileAttachment).filter(FileAttachment.id == file_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="File attachment not found")

    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "file_type": attachment.file_type,
        "extracted_text": attachment.extracted_text
    }

@router.get("/{file_id}/search-pdf")
def search_inside_pdf_endpoint(file_id: str, query: str = Query(...), db: Session = Depends(get_db)):
    attachment = db.query(FileAttachment).filter(FileAttachment.id == file_id).first()
    if not attachment or attachment.file_type != "pdf":
        raise HTTPException(status_code=400, detail="File is not a valid PDF")

    results = pdf_service.search_inside_pdf(attachment.file_path, query)
    return {"query": query, "results": results}

@router.delete("/{file_id}")
def delete_file(file_id: str, db: Session = Depends(get_db)):
    attachment = db.query(FileAttachment).filter(FileAttachment.id == file_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="File attachment not found")

    if os.path.exists(attachment.file_path):
        try:
            os.remove(attachment.file_path)
        except Exception:
            pass

    db.delete(attachment)
    db.commit()
    return {"message": "File deleted"}
