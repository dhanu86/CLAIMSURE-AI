def test_register_and_login_doctor(client):
    # Register Doctor
    reg_payload = {
        "email": "doctor_test@claimsure.ai",
        "password": "Password123!",
        "full_name": "Dr. Sarah Jenkins",
        "role": "Doctor",
        "specialty": "Cardiology"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Doctor"

    # Login
    login_payload = {
        "email": "doctor_test@claimsure.ai",
        "password": "Password123!"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_register_patient_and_access_patient_portal(client):
    # Register Patient
    reg_payload = {
        "email": "patient_test@claimsure.ai",
        "password": "Password123!",
        "full_name": "John Smith",
        "role": "Patient"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Access Patient claims
    claims_res = client.get("/api/patient/claims", headers=headers)
    assert claims_res.status_code == 200
    assert claims_res.json() == []

    # Attempt to access Doctor portal (should be 403 Forbidden)
    doc_res = client.get("/api/doctor/encounters", headers=headers)
    assert doc_res.status_code == 403

def test_reset_password_workflow(client):
    reg_payload = {
        "email": "coder_reset_test@claimsure.ai",
        "password": "InitialPassword123!",
        "full_name": "Coder User",
        "role": "Medical Coder"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200

    # Reset password
    reset_payload = {
        "email": "coder_reset_test@claimsure.ai",
        "new_password": "NewSecretPassword456!"
    }
    reset_res = client.post("/api/auth/reset-password", json=reset_payload)
    assert reset_res.status_code == 200
    assert "access_token" in reset_res.json()

    # Old password should now fail
    fail_res = client.post("/api/auth/login", json={
        "email": "coder_reset_test@claimsure.ai",
        "password": "InitialPassword123!"
    })
    assert fail_res.status_code == 401

    # New password succeeds
    ok_res = client.post("/api/auth/login", json={
        "email": "coder_reset_test@claimsure.ai",
        "password": "NewSecretPassword456!"
    })
    assert ok_res.status_code == 200
    assert "access_token" in ok_res.json()

