
import json
from typing import List, Dict, Any, Optional

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk
from app.services.text_extractor import TextExtractor


class RAGService:

    MODEL_NAME = "abhinand/MedEmbed-small-v0.1"
    EMBEDDING_DIMENSION = 384

    # Load the embedding model only once per backend process.
    _model = None

    @classmethod
    def get_embedding_model(cls):
        if cls._model is None:
            cls._model = SentenceTransformer(cls.MODEL_NAME)
        return cls._model

    @classmethod
    def generate_embeddings(cls, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, cls.EMBEDDING_DIMENSION), dtype="float32")

        model = cls.get_embedding_model()

        embeddings = model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        return np.asarray(embeddings, dtype="float32")

    @classmethod
    def process_and_store_document(
        cls,
        db: Session,
        owner_id: str,
        filename: str,
        file_path: str,
        file_size: int,
        content_type: str,
        document_type: str = "general"
    ) -> Document:

        try:
            # 1. Extract document text and page information.
            extracted_text, pages = TextExtractor.extract_text(
                file_path, content_type
            )

            # 2. Split document into chunks.
            chunks = TextExtractor.chunk_text(
                pages,
                chunk_size=300,
                overlap=50
            )

            if not chunks:
                raise ValueError("No readable text found in the document.")

            # 3. Generate real MedEmbed embeddings.
            chunk_texts = [c["content"] for c in chunks]

            embeddings = cls.generate_embeddings(chunk_texts)

            if embeddings.shape != (
                len(chunks), cls.EMBEDDING_DIMENSION
            ):
                raise ValueError("Invalid embedding dimensions.")

            # 4. Create document record.
            doc_obj = Document(
                owner_id=owner_id,
                filename=filename,
                file_path=file_path,
                file_size=file_size,
                content_type=content_type,
                document_type=document_type,
                total_pages=len(pages) if pages else 1,
                status="processed",
                extracted_text=extracted_text
            )

            db.add(doc_obj)
            db.flush()

            # 5. Store each chunk and its actual embedding.
            for i, chunk in enumerate(chunks):
                chunk_obj = DocumentChunk(
                    document_id=doc_obj.id,
                    chunk_index=chunk["chunk_index"],
                    page_number=chunk["page_number"],
                    content=chunk["content"],
                    embedding_json=json.dumps(
                        embeddings[i].tolist()
                    )
                )

                db.add(chunk_obj)

            db.commit()
            db.refresh(doc_obj)

            return doc_obj

        except Exception:
            db.rollback()
            raise

    @classmethod
    def retrieve_relevant_chunks(
        cls,
        db: Session,
        query: str,
        user_id: str,
        document_id: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:

        if not query or not query.strip() or top_k <= 0:
            return []

        # 1. Retrieve only documents belonging to this user.
        db_query = (
            db.query(DocumentChunk)
            .join(Document)
            .filter(Document.owner_id == user_id)
        )

        if document_id:
            db_query = db_query.filter(
                DocumentChunk.document_id == document_id
            )

        all_chunks = db_query.order_by(
            DocumentChunk.document_id,
            DocumentChunk.chunk_index
        ).all()

        if not all_chunks:
            return []

        # 2. Read existing vectors and identify invalid old vectors.
        valid_vectors = []
        missing_chunks = []

        for chunk in all_chunks:
            try:
                vector = json.loads(chunk.embedding_json)

                vector = np.asarray(vector, dtype="float32")

                if (
                    vector.shape == (cls.EMBEDDING_DIMENSION,)
                    and np.isfinite(vector).all()
                    and np.linalg.norm(vector) > 0
                ):
                    valid_vectors.append(vector)
                else:
                    valid_vectors.append(None)
                    missing_chunks.append(chunk)

            except (TypeError, ValueError, json.JSONDecodeError):
                valid_vectors.append(None)
                missing_chunks.append(chunk)

        # 3. Repair old placeholder or missing embeddings.
        if missing_chunks:
            repaired_embeddings = cls.generate_embeddings(
                [chunk.content for chunk in missing_chunks]
            )

            embedding_map = {
                chunk.id: repaired_embeddings[i]
                for i, chunk in enumerate(missing_chunks)
            }

            for i, chunk in enumerate(all_chunks):
                if chunk.id in embedding_map:
                    vector = embedding_map[chunk.id]

                    chunk.embedding_json = json.dumps(
                        vector.tolist()
                    )

                    valid_vectors[i] = vector

            db.commit()

        # 4. Create the FAISS index.
        document_vectors = np.vstack(valid_vectors).astype("float32")

        index = faiss.IndexFlatIP(cls.EMBEDDING_DIMENSION)
        index.add(document_vectors)

        # 5. Embed the user's query.
        query_vector = cls.generate_embeddings([query])

        # 6. Search for the most similar chunks.
        search_count = min(top_k, len(all_chunks))

        scores, indices = index.search(
            query_vector,
            search_count
        )

        # 7. Return results with source information.
        results = []

        for score, position in zip(scores[0], indices[0]):

            if position < 0:
                continue

            chunk = all_chunks[int(position)]

            results.append({
                "score": float(score),
                "document_id": chunk.document_id,
                "document_name": (
                    chunk.document.filename
                    if chunk.document else "Document"
                ),
                "page_number": chunk.page_number,
                "content": chunk.content
            })

        return results
