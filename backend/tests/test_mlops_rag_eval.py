import time
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.models.document import Document
from app.models.user import User


def test_mlops_rag_chunking_and_retrieval_benchmark(db_session):
    """
    Evaluates semantic retrieval, embedding dimensions,
    retrieval relevance and warm retrieval latency.
    """
    import json
    import time

    from app.models.document import DocumentChunk

    # 1. Create a test user.
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
        "Patient was admitted with severe acute systolic heart failure "
        "and essential hypertension. Echocardiogram revealed an "
        "ejection fraction of 35%. Patient received Lisinopril and "
        "Furosemide. Type 2 diabetes mellitus was also noted."
    )

    # 2. Create a document.
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

    # 3. Insert two chunks with old placeholder vectors.
    chunks = [
        DocumentChunk(
            document_id=doc.id,
            chunk_index=0,
            page_number=1,
            content=(
                "Severe acute systolic heart failure and "
                "essential hypertension were diagnosed."
            ),
            embedding_json=json.dumps([0.05] * 16)
        ),
        DocumentChunk(
            document_id=doc.id,
            chunk_index=1,
            page_number=1,
            content=(
                "The patient had a minor skin rash and "
                "was advised to use a topical moisturizer."
            ),
            embedding_json=json.dumps([0.05] * 16)
        )
    ]

    db_session.add_all(chunks)
    db_session.commit()

    # 4. Warm up MedEmbed outside the retrieval timer.
    RAGService.generate_embeddings(
        ["heart failure hypertension"]
    )

    # 5. Measure warm semantic retrieval.
    start_retrieve = time.perf_counter()

    results = RAGService.retrieve_relevant_chunks(
        db=db_session,
        query="heart failure hypertension",
        user_id=user.id,
        document_id=doc.id,
        top_k=2
    )

    retrieval_latency = time.perf_counter() - start_retrieve

    # 6. Verify retrieval results.
    assert len(results) == 2, (
        "Expected both document chunks to be retrieved."
    )

    top_chunk = results[0]

    assert "heart failure" in top_chunk["content"].lower(), (
        "Relevant clinical chunk was not ranked first."
    )

    assert top_chunk["score"] > 0, (
        "Expected positive semantic similarity."
    )

    # 7. Verify actual stored embedding dimensions.
    db_session.refresh(chunks[0])
    db_session.refresh(chunks[1])

    for chunk in chunks:
        embedding = json.loads(chunk.embedding_json)

        assert len(embedding) == 384, (
            "Stored embedding must have 384 dimensions."
        )

    # 8. Check warm retrieval SLA.
    assert retrieval_latency < 0.5, (
        f"Warm retrieval exceeded 500ms: "
        f"{retrieval_latency:.3f}s"
    )

    print("\n[MLOps Semantic RAG Benchmark Passed]")
    print(
        f" -> Warm Retrieval Latency: "
        f"{retrieval_latency * 1000:.2f}ms"
    )
    print(
        f" -> Top Similarity Score: "
        f"{top_chunk['score']:.4f}"
    )
    print(" -> Embedding Dimensions: 384")
    print(" -> Relevant Chunk Ranked First")



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
