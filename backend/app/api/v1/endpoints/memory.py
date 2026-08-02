from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db
from app.memory.memory_manager import memory_manager

router = APIRouter()

class MemoryCreate(BaseModel):
    key: str
    value: str
    category: Optional[str] = "general"
    is_pinned: Optional[bool] = False

@router.get("/")
def get_user_memories(db: Session = Depends(get_db)):
    memories = memory_manager.get_all_user_memories(db)
    return [
        {
            "id": m.id,
            "key": m.key,
            "value": m.value,
            "category": m.category,
            "is_pinned": m.is_pinned,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in memories
    ]

@router.post("/")
def create_user_memory(data: MemoryCreate, db: Session = Depends(get_db)):
    memory = memory_manager.add_user_memory(
        db, key=data.key, value=data.value, category=data.category, is_pinned=data.is_pinned
    )
    return {
        "id": memory.id,
        "key": memory.key,
        "value": memory.value,
        "is_pinned": memory.is_pinned
    }

@router.delete("/{memory_id}")
def delete_user_memory(memory_id: str, db: Session = Depends(get_db)):
    success = memory_manager.delete_user_memory(db, memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"message": "Memory deleted"}
