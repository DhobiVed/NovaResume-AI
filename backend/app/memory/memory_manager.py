from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database.models import UserMemory, Message, Conversation

class MemoryManager:
    def get_all_user_memories(self, db: Session) -> List[UserMemory]:
        return db.query(UserMemory).order_by(UserMemory.is_pinned.desc(), UserMemory.created_at.desc()).all()

    def add_user_memory(self, db: Session, key: str, value: str, category: str = "general", is_pinned: bool = False) -> UserMemory:
        memory = UserMemory(key=key, value=value, category=category, is_pinned=is_pinned)
        db.add(memory)
        db.commit()
        db.refresh(memory)
        return memory

    def delete_user_memory(self, db: Session, memory_id: str) -> bool:
        memory = db.query(UserMemory).filter(UserMemory.id == memory_id).first()
        if memory:
            db.delete(memory)
            db.commit()
            return True
        return False

    def build_memory_system_context(self, db: Session) -> str:
        memories = self.get_all_user_memories(db)
        if not memories:
            return ""
        
        lines = ["\n--- USER LONG-TERM MEMORY & PREFERENCES ---"]
        for m in memories:
            pin_str = "[PINNED] " if m.is_pinned else ""
            lines.append(f"- {pin_str}{m.key}: {m.value}")
        lines.append("--- END USER MEMORY ---\n")
        return "\n".join(lines)

    def optimize_context_window(self, messages: List[Dict[str, str]], max_messages: int = 20) -> List[Dict[str, str]]:
        """Keep system message + last N messages to optimize RAM & token speed."""
        if len(messages) <= max_messages:
            return messages
        
        system_msgs = [m for m in messages if m.get("role") == "system"]
        recent_msgs = messages[-(max_messages - len(system_msgs)):]
        return system_msgs + recent_msgs

memory_manager = MemoryManager()
