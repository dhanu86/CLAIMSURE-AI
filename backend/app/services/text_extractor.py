import fitz  # PyMuPDF
import docx
from typing import List, Dict, Any, Tuple
import os

class TextExtractor:
    @staticmethod
    def extract_text(file_path: str, content_type: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Extracts text from PDF, DOCX, or TXT files.
        Returns: (full_text, pages_list)
        where pages_list is [{'page': 1, 'text': '...'}]
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        filename = os.path.basename(file_path).lower()
        pages = []
        full_text_parts = []
        
        if filename.endswith(".pdf") or "pdf" in content_type:
            doc = fitz.open(file_path)
            for i, page in enumerate(doc):
                text = page.get_text()
                pages.append({
                    "page": i + 1,
                    "text": text.strip()
                })
                full_text_parts.append(text.strip())
            doc.close()
            
        elif filename.endswith(".docx") or "officedocument" in content_type:
            doc = docx.Document(file_path)
            full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            pages.append({
                "page": 1,
                "text": full_text
            })
            full_text_parts.append(full_text)
            
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                full_text = f.read()
                pages.append({
                    "page": 1,
                    "text": full_text
                })
                full_text_parts.append(full_text)
                
        full_text = "\n\n".join(full_text_parts)
        return full_text, pages

    @staticmethod
    def chunk_text(pages: List[Dict[str, Any]], chunk_size: int = 500, overlap: int = 100) -> List[Dict[str, Any]]:
        chunks = []
        chunk_idx = 0
        
        for p in pages:
            page_num = p["page"]
            text = p["text"]
            words = text.split()
            
            if not words:
                continue
                
            start = 0
            while start < len(words):
                end = min(start + chunk_size, len(words))
                chunk_words = words[start:end]
                chunk_str = " ".join(chunk_words)
                
                chunks.append({
                    "chunk_index": chunk_idx,
                    "page_number": page_num,
                    "content": chunk_str
                })
                chunk_idx += 1
                
                if end == len(words):
                    break
                start += (chunk_size - overlap)
                
        return chunks
