import os
import zipfile
import docx
import pandas as pd
from typing import Dict, Any

def dataframe_to_markdown(df: pd.DataFrame, max_rows: int = 20) -> str:
    """Safely convert pandas DataFrame to Markdown table without requiring external optional libraries."""
    try:
        return df.head(max_rows).to_markdown()
    except Exception:
        # Fallback pure-python markdown table generator
        sample = df.head(max_rows)
        headers = [str(c) for c in sample.columns]
        header_row = "| " + " | ".join(headers) + " |"
        sep_row = "| " + " | ".join(["---"] * len(headers)) + " |"
        
        data_rows = []
        for _, row in sample.iterrows():
            vals = [str(val).replace("\n", " ") for val in row.values]
            data_rows.append("| " + " | ".join(vals) + " |")
            
        return "\n".join([header_row, sep_row] + data_rows)

class FileService:
    def process_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        ext = os.path.splitext(filename)[1].lower()
        extracted_text = ""
        metadata = {}

        if ext == ".pdf":
            pdf_res = pdf_service.extract_text_and_tables(file_path)
            extracted_text = pdf_res["full_text"]
            metadata = {
                "page_count": pdf_res["page_count"],
                "table_count": len(pdf_res["tables"]),
                "pages": pdf_res["pages"]
            }
        elif ext == ".docx":
            try:
                doc = docx.Document(file_path)
                full_text = [p.text for p in doc.paragraphs if p.text.strip()]
                extracted_text = "\n".join(full_text)
                metadata = {"paragraph_count": len(full_text)}
            except Exception as e:
                extracted_text = f"[DOCX Error: {str(e)}]"
        elif ext in [".csv", ".xlsx"]:
            try:
                if ext == ".csv":
                    df = pd.read_csv(file_path)
                else:
                    df = pd.read_excel(file_path)
                
                rows_preview = dataframe_to_markdown(df, max_rows=20)
                    
                extracted_text = f"Dataset Columns: {list(df.columns)}\nRows: {len(df)}, Columns: {len(df.columns)}\n\nPreview:\n{rows_preview}"
                metadata = {"rows": len(df), "columns": len(df.columns)}
            except Exception as e:
                extracted_text = f"[Spreadsheet Error: {str(e)}]"
        elif ext in [".png", ".jpg", ".jpeg"]:
            ocr_res = ocr_service.process_image(file_path)
            extracted_text = ocr_res["text"]
            metadata = ocr_res["metadata"]
        elif ext == ".zip":
            extracted_parts = []
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    file_list = zip_ref.namelist()
                    extracted_parts.append(f"ZIP File Contents ({len(file_list)} files):\n" + "\n".join(file_list))
                    
                    # Read small text files inside zip
                    for name in file_list[:5]:
                        if name.endswith(('.txt', '.md', '.py', '.json', '.csv')):
                            try:
                                content = zip_ref.read(name).decode('utf-8', errors='ignore')
                                extracted_parts.append(f"\n--- Content of {name} ---\n{content[:1000]}")
                            except Exception:
                                pass
                extracted_text = "\n".join(extracted_parts)
                metadata = {"zipped_files_count": len(file_list)}
            except Exception as e:
                extracted_text = f"[ZIP Error: {str(e)}]"
        else: # .txt, .md, code files
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()
                metadata = {"char_count": len(extracted_text)}
            except Exception as e:
                extracted_text = f"[Text File Error: {str(e)}]"

        return {
            "filename": filename,
            "file_type": ext.replace(".", ""),
            "extracted_text": extracted_text,
            "metadata": metadata
        }

file_service = FileService()
