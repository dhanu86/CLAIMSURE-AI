def test_patient_claim_submission_and_chat(client):
    # Register Patient
    reg = client.post("/api/auth/register", json={
        "email": "patient_claims@claimsure.ai",
        "password": "Password123!",
        "full_name": "Alice Cooper",
        "role": "Patient"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit claim
    claim_payload = {
        "title": "Hospital Emergency Room Visit",
        "description": "Acute abdominal pain evaluation and lab work",
        "provider_name": "St. Jude Hospital",
        "amount_claimed": "$1,450.00"
    }
    create_res = client.post("/api/patient/claims", json=claim_payload, headers=headers)
    assert create_res.status_code == 200
    claim_data = create_res.json()
    assert claim_data["status"] == "Submitted"
    assert claim_data["claim_reference"].startswith("CLM-2026-")

    # List claims
    list_res = client.get("/api/patient/claims", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # Create persistent chat conversation
    conv_res = client.post("/api/chat/conversations", json={"title": "Policy Coverage Q&A"}, headers=headers)
    assert conv_res.status_code == 200
    conv_id = conv_res.json()["id"]

    # Send message in chat
    msg_res = client.post(f"/api/chat/conversations/{conv_id}/messages", json={"content": "What is the status of my claim?"}, headers=headers)
    assert msg_res.status_code == 200
    assert msg_res.json()["sender"] == "assistant"
    assert "claim" in msg_res.json()["content"].lower()
