def test_coder_analysis_and_coverage(client):
    # Register Coder
    reg = client.post("/api/auth/register", json={
        "email": "coder_audit@claimsure.ai",
        "password": "Password123!",
        "full_name": "Marcus Wright",
        "role": "Medical Coder"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload test document
    files = {'file': ('discharge_summary.txt', b"Patient presents with type 2 diabetes and hypertension. Fasting glucose 140. BP 138/85.", 'text/plain')}
    data = {'document_type': 'clinical_summary'}
    upload_res = client.post("/api/documents/upload", files=files, data=data, headers=headers)
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["document"]["id"]

    # Perform Coding Analysis
    an_res = client.post("/api/coder/analyses", json={"document_id": doc_id}, headers=headers)
    assert an_res.status_code == 200
    an_data = an_res.json()
    assert len(an_data["extracted_diagnoses"]) > 0
    assert an_data["status"] == "Analysis Complete"

    # Perform Coverage Assessment
    cov_res = client.post("/api/coder/coverage-assessments", json={"clinical_document_id": doc_id}, headers=headers)
    assert cov_res.status_code == 200
    cov_data = cov_res.json()
    assert cov_data["preliminary_status"] in ["Potentially Covered", "Potentially Not Covered", "Manual Review Required"]
