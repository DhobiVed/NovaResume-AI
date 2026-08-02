import os
import json
import uuid
from typing import List, Dict, Any
from app.services.doc_gen_service import doc_gen_service
from app.core.config import GENERATED_DIR

class ExportService:
    def export_conversation(self, title: str, messages: List[Dict[str, Any]], format_type: str) -> str:
        format_type = format_type.lower()
        
        if format_type == "json":
            filename = f"export_{uuid.uuid4().hex[:8]}.json"
            file_path = os.path.join(GENERATED_DIR, filename)
            export_data = {
                "title": title,
                "exported_at": str(uuid.uuid4()),
                "messages": messages
            }
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(export_data, f, indent=2)
            return file_path
        
        # Build plain text content
        content_lines = []
        for msg in messages:
            role = msg.get("role", "user").upper()
            body = msg.get("content", "")
            content_lines.append(f"[{role}]\n{body}\n")
        
        full_text = "\n----------------------------------------\n".join(content_lines)

        if format_type == "pdf":
            return doc_gen_service.generate_pdf(title, full_text)
        elif format_type == "docx":
            return doc_gen_service.generate_docx(title, full_text)
        else: # markdown
            return doc_gen_service.generate_markdown(title, full_text)

export_service = ExportService()
