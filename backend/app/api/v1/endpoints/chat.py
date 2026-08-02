import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.session import get_db, SessionLocal
from app.database.models import Conversation, Message, FileAttachment
from app.models.model_manager import model_manager
from app.memory.memory_manager import memory_manager
from app.rag.rag_engine import rag_engine

router = APIRouter()

class ChatStreamRequest(BaseModel):
    conversation_id: str
    message: str
    model_name: Optional[str] = "llama-3.3-70b-versatile"
    system_prompt: Optional[str] = None
    file_ids: Optional[List[str]] = []

STRUCTURED_FORMATTING_PROMPT = (
    "You are NovaChat AI, an elite AI assistant comparable to ChatGPT and Claude.\n"
    "CRITICAL FORMATTING INSTRUCTIONS:\n"
    "- Organize answers using clear Title, Subheadings (##), Bullet Lists, and Numbered Lists.\n"
    "- Highlight key terms in **bold**.\n"
    "- Use markdown tables for comparative analysis.\n"
    "- Use callouts like '> [!NOTE]', '> [!TIP]', or '> [!IMPORTANT]' for key insights.\n"
    "- If asked for notes or study guides: produce clean, exam-ready structured notes with a Quick Revision Summary at the end."
)

@router.post("/stream")
async def chat_stream(req: ChatStreamRequest, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()
    if not conv:
        conv = Conversation(
            id=req.conversation_id,
            title=req.message[:30] if req.message else "New Chat",
            model_name=req.model_name or "llama-3.3-70b-versatile"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message to database
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    db.commit()

    # Gather attachments and build RAG context if present
    attachments = db.query(FileAttachment).filter(FileAttachment.conversation_id == conv.id).all()
    all_chunks = []
    for att in attachments:
        if att.extracted_text:
            chunks = rag_engine.chunk_text(att.extracted_text, doc_name=att.filename)
            all_chunks.extend(chunks)

    rag_context = ""
    citations = []
    if all_chunks:
        rag_context, citations = rag_engine.retrieve_context(req.message, all_chunks, top_k=4)

    # Gather user memories
    memory_context = memory_manager.build_memory_system_context(db)

    # System prompt composition
    base_prompt = req.system_prompt or conv.system_prompt or STRUCTURED_FORMATTING_PROMPT
    system_prompt_str = f"{base_prompt}\n\n{STRUCTURED_FORMATTING_PROMPT}"
    if memory_context:
        system_prompt_str += f"\n{memory_context}"
    if rag_context:
        system_prompt_str += f"\n\n--- RETRIEVED DOCUMENT CONTEXT ---\n{rag_context}\n--- END DOCUMENT CONTEXT ---\nUse the retrieved document context above to answer accurately and cite sources when applicable."

    # Fetch past conversation messages
    history_db_msgs = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at).all()
    
    formatted_history = [{"role": "system", "content": system_prompt_str}]
    for m in history_db_msgs:
        formatted_history.append({"role": m.role, "content": m.content})

    optimized_history = memory_manager.optimize_context_window(formatted_history, max_messages=20)
    conv_id_target = conv.id
    active_model = req.model_name or conv.model_name or "llama-3.3-70b-versatile"
    is_first_exchange = (len(history_db_msgs) <= 2)
    user_prompt_title = req.message[:35].strip() if req.message else "New Chat"

    async def event_generator():
        # Send metadata (citations) first
        if citations:
            meta_payload = {"type": "metadata", "citations": citations}
            yield f"data: {json.dumps(meta_payload)}\n\n"

        full_assistant_reply = ""
        
        async for chunk in model_manager.stream_chat_completion(
            messages=optimized_history,
            model_name=active_model
        ):
            full_assistant_reply += chunk
            chunk_payload = {"type": "token", "content": chunk}
            yield f"data: {json.dumps(chunk_payload)}\n\n"

        # Thread-safe database save using fresh SessionLocal
        db_write = SessionLocal()
        try:
            assistant_msg = Message(
                conversation_id=conv_id_target,
                role="assistant",
                content=full_assistant_reply,
                sources=citations if citations else None
            )
            db_write.add(assistant_msg)
            
            if is_first_exchange:
                c = db_write.query(Conversation).filter(Conversation.id == conv_id_target).first()
                if c and c.title == "New Chat":
                    c.title = user_prompt_title
                    db_write.add(c)

            db_write.commit()
            msg_id = assistant_msg.id
        except Exception:
            db_write.rollback()
            msg_id = "temp-id"
        finally:
            db_write.close()

        done_payload = {"type": "done", "message_id": msg_id}
        yield f"data: {json.dumps(done_payload)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
