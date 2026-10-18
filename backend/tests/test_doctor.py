def test_doctor_cms1500_workflow(client):
    # Register Doctor
    reg = client.post("/api/auth/register", json={
        "email": "dr_cms@claimsure.ai",
        "password": "Password123!",
        "full_name": "Dr. Alex Vance",
        "role": "Doctor"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Search medical codes
    search_res = client.get("/api/codes/search?q=diabetes", headers=headers)
    assert search_res.status_code == 200
    assert len(search_res.json()["results"]) > 0

    # Create CMS-1500 form
    form_payload = {
        "patient_name": "Robert Taylor",
        "patient_dob": "1978-11-22",
        "insurance_name": "United Healthcare",
        "policy_id": "UHC-9920194",
        "diagnosis_codes": ["E11.9", "I10"],
        "procedure_codes": ["99214"],
        "form_data": {
            "box1a_insured_id": "UHC-9920194",
            "box2_patient_name": "Robert Taylor",
            "box3_patient_dob": "1978-11-22",
            "box33_billing_provider": "City Medical Center"
        }
    }
    create_res = client.post("/api/doctor/claim-forms", json=form_payload, headers=headers)
    assert create_res.status_code == 200
    form_id = create_res.json()["id"]
    assert create_res.json()["status"] == "Validated"

    # Export PDF
    pdf_res = client.get(f"/api/doctor/claim-forms/{form_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 500
