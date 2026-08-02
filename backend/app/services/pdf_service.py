import fitz  # PyMuPDF
import pdfplumber
from typing import Dict, Any, List

class PDFService:
    def extract_text_and_tables(self, file_path: str) -> Dict[str, Any]:
        """Extract text page by page along with tables using PyMuPDF and pdfplumber."""
        pages_content = []
        full_text = []
        tables = []
        page_count = 0

        try:
            # PyMuPDF for fast text extraction
            doc = fitz.open(file_path)
            page_count = len(doc)
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                text = page.get_text("text") or ""
                pages_content.append({
                    "page": page_num + 1,
                    "text": text
                })
                full_text.append(text)
            doc.close()
        except Exception as e:
            print(f"Error reading PDF with PyMuPDF: {e}")

        try:
            # pdfplumber for table extraction
            with pdfplumber.open(file_path) as pdf:
                for idx, page in enumerate(pdf.pages):
                    page_tables = page.extract_tables()
                    for t in page_tables:
                        if t:
                            tables.append({
                                "page": idx + 1,
                                "data": t
                            })
        except Exception as e:
            print(f"Error extracting tables with pdfplumber: {e}")

        return {
            "page_count": page_count,
            "full_text": "\n\n".join(full_text),
            "pages": pages_content,
            "tables": tables
        }

    def search_inside_pdf(self, file_path: str, query: str) -> List[Dict[str, Any]]:
        results = []
        query_lower = query.lower()

        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text("text") or ""
                if query_lower in text.lower():
                    # Find snippet surrounding match
                    idx = text.lower().find(query_lower)
                    start = max(0, idx - 80)
                    end = min(len(text), idx + 120)
                    snippet = text[start:end].replace("\n", " ")
                    results.append({
                        "page": page_num + 1,
                        "snippet": f"...{snippet}..."
                    })
            doc.close()
        except Exception as e:
            print(f"Error searching inside PDF: {e}")

        return results

pdf_service = PDFService()
