import io
import json
from typing import Dict, Any, List, Tuple
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class CMS1500Service:
    @staticmethod
    def validate_form(form_data: Dict[str, Any], diagnosis_codes: List[str], procedure_codes: List[str]) -> Tuple[bool, List[str]]:
        errors = []
        
        if not form_data.get("patient_name") and not form_data.get("box2_patient_name"):
            errors.append("Box 2: Patient Name is required.")
        if not form_data.get("patient_dob") and not form_data.get("box3_patient_dob"):
            errors.append("Box 3: Patient Date of Birth is required.")
        if not form_data.get("insured_id") and not form_data.get("box1a_insured_id"):
            errors.append("Box 1a: Insured's ID Number is required.")
        if not diagnosis_codes and not form_data.get("box21_diagnoses"):
            errors.append("Box 21: At least one ICD-10 Diagnosis Code is required.")
        if not procedure_codes and not form_data.get("box24_procedures"):
            errors.append("Box 24D: At least one CPT/HCPCS Procedure Code is required.")
        if not form_data.get("billing_provider_name") and not form_data.get("box33_billing_provider"):
            errors.append("Box 33: Billing Provider Name & Address is required.")

        is_valid = len(errors) == 0
        return is_valid, errors

    @staticmethod
    def generate_cms1500_pdf(form_data: Dict[str, Any], diagnosis_codes: List[str], procedure_codes: List[str]) -> bytes:
        """
        Generates an official CMS-1500 Health Insurance Claim Form PDF.
        """
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Header Banner
        p.setFillColor(colors.HexColor("#7A1C1C")) # CMS Red header
        p.rect(20, height - 50, width - 40, 35, fill=1, stroke=0)
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 14)
        p.drawString(30, height - 35, "HEALTH INSURANCE CLAIM FORM")
        p.setFont("Helvetica", 9)
        p.drawRightString(width - 30, height - 35, "APPROVED BY NATIONAL UNIFORM CLAIM COMMITTEE (NUCC) 02/12")

        # Top Section - Insured & Patient Info
        p.setFillColor(colors.HexColor("#343330"))
        p.setFont("Helvetica-Bold", 10)
        
        # Grid Outer Box
        p.setStrokeColor(colors.HexColor("#A89586"))
        p.setLineWidth(1)
        p.rect(20, height - 280, width - 40, 220)
        
        # Box 1: Medicare/Medicaid/TRICARE/FECA/Group
        p.setFont("Helvetica-Bold", 8)
        p.drawString(25, height - 62, "1. MEDICARE / MEDICAID / TRICARE / CHAMPVA / GROUP HEALTH PLAN / FECA / OTHER")
        ins_type = form_data.get("insurance_type", "Group Health Plan")
        p.setFont("Helvetica", 9)
        p.drawString(25, height - 75, f"[X] {ins_type}")

        # Box 1a: Insured ID
        p.setFont("Helvetica-Bold", 8)
        p.drawString(350, height - 62, "1a. INSURED'S I.D. NUMBER")
        p.setFont("Helvetica", 10)
        p.drawString(350, height - 75, str(form_data.get("box1a_insured_id", form_data.get("policy_id", "POL-994821102"))))

        # Box 2: Patient Name
        p.line(20, height - 82, width - 20, height - 82)
        p.setFont("Helvetica-Bold", 8)
        p.drawString(25, height - 92, "2. PATIENT'S NAME (Last Name, First Name, Middle Initial)")
        p.setFont("Helvetica", 10)
        p.drawString(25, height - 105, str(form_data.get("box2_patient_name", form_data.get("patient_name", "DOE, JANE A."))))

        # Box 3: Patient DOB & Sex
        p.drawString(280, height - 92, "3. PATIENT'S BIRTH DATE (MM/DD/YYYY)")
        p.drawString(280, height - 105, str(form_data.get("box3_patient_dob", form_data.get("patient_dob", "05/14/1984"))))

        # Box 4: Insured's Name
        p.drawString(420, height - 92, "4. INSURED'S NAME")
        p.drawString(420, height - 105, str(form_data.get("box4_insured_name", "DOE, JANE A.")))

        # Box 5: Patient Address
        p.line(20, height - 112, width - 20, height - 112)
        p.setFont("Helvetica-Bold", 8)
        p.drawString(25, height - 122, "5. PATIENT'S ADDRESS (No., Street)")
        p.setFont("Helvetica", 9)
        p.drawString(25, height - 135, str(form_data.get("box5_address", "124 Healthcare Ave, Suite 300")))

        # Box 11: Insured Group Policy Number
        p.setFont("Helvetica-Bold", 8)
        p.drawString(350, height - 122, "11. INSURED'S POLICY GROUP OR FECA NUMBER")
        p.setFont("Helvetica", 9)
        p.drawString(350, height - 135, str(form_data.get("box11_group_num", "GRP-881920")))

        # Box 21: Diagnoses
        p.line(20, height - 150, width - 20, height - 150)
        p.setFont("Helvetica-Bold", 8)
        p.drawString(25, height - 160, "21. DIAGNOSIS OR NATURE OF ILLNESS OR INJURY (ICD-10-CM Pointers A-L)")
        
        diag_str = "  ".join([f"{chr(65+i)}. {code}" for i, code in enumerate(diagnosis_codes or ["E11.9", "I10"])])
        p.setFont("Helvetica-Bold", 10)
        p.drawString(25, height - 178, diag_str)

        # Box 24: Procedures Table Header
        p.line(20, height - 190, width - 20, height - 190)
        p.setFillColor(colors.HexColor("#E9DFD3"))
        p.rect(20, height - 210, width - 40, 20, fill=1, stroke=1)
        p.setFillColor(colors.HexColor("#343330"))
        p.setFont("Helvetica-Bold", 8)
        p.drawString(25, height - 203, "24A. DATES OF SERVICE")
        p.drawString(140, height - 203, "24B. POS")
        p.drawString(180, height - 203, "24D. CPT/HCPCS CODE")
        p.drawString(300, height - 203, "24E. DIAG POINTER")
        p.drawString(400, height - 203, "24F. $ CHARGES")
        p.drawString(490, height - 203, "24G. UNITS")

        # Procedures Rows
        y_pos = height - 225
        procs = procedure_codes or ["99214", "36415"]
        charges = ["$185.00", "$45.00", "$90.00"]
        for idx, proc_code in enumerate(procs[:4]):
            p.setFont("Helvetica", 9)
            p.drawString(25, y_pos, "10/01/2026")
            p.drawString(140, y_pos, "11") # Office
            p.drawString(180, y_pos, proc_code)
            p.drawString(300, y_pos, "A, B")
            p.drawString(400, y_pos, charges[idx % len(charges)])
            p.drawString(490, y_pos, "1")
            y_pos -= 15

        # Box 28, 29, 30 Total Charges
        p.line(20, height - 280, width - 20, height - 280)
        p.setFont("Helvetica-Bold", 8)
        p.drawString(25, height - 292, "28. TOTAL CHARGE: $230.00")
        p.drawString(200, height - 292, "29. AMOUNT PAID: $0.00")
        p.drawString(380, height - 292, "30. RETAINAGE / BALANCE DUE: $230.00")

        # Provider Box 33
        p.rect(20, height - 350, width - 40, 50)
        p.drawString(25, height - 310, "33. BILLING PROVIDER INFO & PHONE #")
        p.setFont("Helvetica", 9)
        p.drawString(25, height - 325, str(form_data.get("box33_provider", "City Medical Center - Dr. Marcus Vance, M.D. (NPI: 1948201948)")))
        p.drawString(25, height - 338, "100 Hospital Plaza, Suite 400 | Phone: (555) 234-5678")

        p.showPage()
        p.save()
        
        buffer.seek(0)
        return buffer.getvalue()
