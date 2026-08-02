import re
import math
from typing import List, Dict, Any, Tuple

class Chunk:
    def __init__(self, text: str, doc_name: str, page_num: int = 1, chunk_id: int = 0):
        self.text = text
        self.doc_name = doc_name
        self.page_num = page_num
        self.chunk_id = chunk_id

class RAGEngine:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, doc_name: str, page_num: int = 1) -> List[Chunk]:
        if not text or not text.strip():
            return []
        
        words = text.split()
        chunks = []
        step = max(1, self.chunk_size - self.chunk_overlap)
        
        chunk_idx = 0
        for i in range(0, len(words), step):
            chunk_words = words[i:i + self.chunk_size]
            if not chunk_words:
                continue
            chunk_str = " ".join(chunk_words)
            chunks.append(Chunk(text=chunk_str, doc_name=doc_name, page_num=page_num, chunk_id=chunk_idx))
            chunk_idx += 1
            
        return chunks

    def compute_similarity(self, query: str, text: str) -> float:
        """TF-IDF cosine similarity heuristic for lightweight fast local RAM execution."""
        def tokenize(s: str) -> List[str]:
            return re.findall(r'\w+', s.lower())

        query_tokens = set(tokenize(query))
        if not query_tokens:
            return 0.0

        text_tokens = tokenize(text)
        if not text_tokens:
            return 0.0

        match_count = sum(1 for token in text_tokens if token in query_tokens)
        length_penalty = math.sqrt(len(text_tokens)) if len(text_tokens) > 0 else 1.0
        
        return (match_count / length_penalty)

    def retrieve_context(
        self, query: str, chunks: List[Chunk], top_k: int = 4
    ) -> Tuple[str, List[Dict[str, Any]]]:
        if not chunks:
            return "", []

        scored_chunks = []
        for chunk in chunks:
            score = self.compute_similarity(query, chunk.text)
            scored_chunks.append((score, chunk))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        top_chunks = [c for s, c in scored_chunks[:top_k] if s > 0.01]
        if not top_chunks and chunks:
            # Fallback to first few chunks if no strong keyword matches
            top_chunks = chunks[:min(top_k, len(chunks))]

        formatted_context_parts = []
        citations = []

        for idx, chunk in enumerate(top_chunks):
            citation_num = idx + 1
            formatted_context_parts.append(
                f"[Source {citation_num}: {chunk.doc_name} (Page {chunk.page_num})]\n{chunk.text}"
            )
            citations.append({
                "id": citation_num,
                "doc_name": chunk.doc_name,
                "page_num": chunk.page_num,
                "snippet": chunk.text[:200] + "..." if len(chunk.text) > 200 else chunk.text
            })

        formatted_context = "\n\n".join(formatted_context_parts)
        return formatted_context, citations

rag_engine = RAGEngine()
