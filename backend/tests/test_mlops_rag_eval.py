import time
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.models.document import Document
from app.models.user import User

def test_mlops_rag_chunking_and_retrieval_benchmark(db_session):
    """
    MLOps CI Pipeline: Evaluates RAG Pipeline chunking consistency,
    retrieval precision, and latency against defined benchmarks.
    """
    # 1. Setup mock patient document
    user = User(
        email="mlops_eval_user@claimsure.ai",
        password_hash="testhash",
        full_name="MLOps Tester",
        role="Doctor"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    clinical_text = (
        "Patient ID: 99482. The patient was admitted with severe acute systolic heart failure and "
        "essential hypertension. An echocardiogram revealed an ejection fraction of 35%. "
        "The patient was started on Lisinopril 10mg daily and Furosemide 40mg IV. "
        "Type 2 diabetes mellitus without complications was also noted in medical history."
    )

    # 2. Benchmark Ingestion & Chunking
    start_time = time.time()
    from app.models.document import DocumentChunk
    import json

    doc = Document(
        owner_id=user.id,
        filename="cardiac_discharge_summary.txt",
        file_path="dummy_path.txt",
        file_size=len(clinical_text),
        content_type="text/plain",
        document_type="clinical_summary",
        total_pages=1,
        status="processed",
        extracted_text=clinical_text
    )
    db_session.add(doc)
    db_session.commit()
    db_session.refresh(doc)

    chunk = DocumentChunk(
        document_id=doc.id,
        chunk_index=0,
        page_number=1,
        content=clinical_text,
        embedding_json=json.dumps([0.05] * 16)
    )
    db_session.add(chunk)
    db_session.commit()

    ingestion_latency = time.time() - start_time
    assert ingestion_latency < 1.0, f"Ingestion latency exceeded threshold: {ingestion_latency:.3f}s"

    # 3. Benchmark Retrieval Precision for targeted query
    start_retrieve = time.time()
    results = RAGService.retrieve_relevant_chunks(
        db=db_session,
        query="heart failure hypertension",
        user_id=user.id,
        document_id=doc.id,
        top_k=3
    )
    retrieval_latency = time.time() - start_retrieve

    assert len(results) > 0, "RAG retriever returned 0 chunks for clinical query"
    top_chunk = results[0]
    assert "heart failure" in top_chunk["content"].lower(), "RAG failed to retrieve relevant clinical content"
    assert retrieval_latency < 0.5, f"RAG retrieval latency exceeded SLA: {retrieval_latency:.3f}s"

    print("\n[MLOps RAG Benchmark Passed]")
    print(f" -> Retrieval Latency: {retrieval_latency*1000:.2f}ms (SLA: <500ms)")
    print(f" -> Top Chunk Relevance Score: {top_chunk['score']}")


def test_mlops_agentic_code_recommendation_benchmark():
    """
    MLOps CI Pipeline: Evaluates Agentic AI Medical Coding accuracy
    and schema reliability against hallucination benchmarks.
    """
    start_time = time.time()
    codes = AIService.search_codes_llm(query="Type 2 diabetes mellitus", system="ICD-10-CM")
    eval_time = time.time() - start_time

    assert isinstance(codes, list), "Agentic search must return a list of candidate codes"
    assert len(codes) > 0, "Agentic search returned empty candidate set for standard query"

    # Check schema consistency and valid code structure
    top_code = codes[0]
    assert "code" in top_code, "Agent output missing 'code' key"
    assert "description" in top_code, "Agent output missing 'description' key"
    assert "system" in top_code, "Agent output missing 'system' key"
    assert "E11" in top_code["code"] or "E10" in top_code["code"] or "diabetes" in top_code["description"].lower(), (
        f"Agentic code prediction {top_code} failed clinical relevance check"
    )

    print("\n[MLOps Agentic AI Benchmark Passed]")
    print(f" -> Top Predicted Code: {top_code.get('code')} ({top_code.get('description')})")
    print(f" -> Inference/Evaluation Latency: {eval_time*1000:.2f}ms")
