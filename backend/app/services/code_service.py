from sqlalchemy.orm import Session
from app.models.medical_code import MedicalCode
from typing import List, Optional, Dict, Any

SEED_MEDICAL_CODES = [
    # ICD-10-CM Diagnoses
    {
        "code": "E11.9",
        "system": "ICD-10-CM",
        "description": "Type 2 diabetes mellitus without complications",
        "effective_date": "2026-01-01",
        "usage_notes": "Use additional code to identify control, insulin use, or hypoglycemia.",
        "clinical_evidence": "Documented fasting plasma glucose >= 126 mg/dL or HbA1c >= 6.5%."
    },
    {
        "code": "I10",
        "system": "ICD-10-CM",
        "description": "Essential (primary) hypertension",
        "effective_date": "2026-01-01",
        "usage_notes": "Includes high blood pressure, systemic arterial hypertension.",
        "clinical_evidence": "Repeated blood pressure readings exceeding 130/80 mmHg."
    },
    {
        "code": "J18.9",
        "system": "ICD-10-CM",
        "description": "Pneumonia, unspecified organism",
        "effective_date": "2026-01-01",
        "usage_notes": "Code specific organism if confirmed by sputum or blood culture.",
        "clinical_evidence": "Infiltrate on chest radiography, fever, purulent cough."
    },
    {
        "code": "M54.50",
        "system": "ICD-10-CM",
        "description": "Low back pain, unspecified",
        "effective_date": "2026-01-01",
        "usage_notes": "Excludes lumbago with sciatica (M54.4-).",
        "clinical_evidence": "Localized lumbar spine tenderness, muscle spasm."
    },
    {
        "code": "K21.9",
        "system": "ICD-10-CM",
        "description": "Gastro-esophageal reflux disease without esophagitis",
        "effective_date": "2026-01-01",
        "usage_notes": "Commonly referred to as GERD or acid reflux.",
        "clinical_evidence": "Heartburn, acid regurgitation responsive to PPI therapy."
    },
    {
        "code": "J44.9",
        "system": "ICD-10-CM",
        "description": "Chronic obstructive pulmonary disease, unspecified",
        "effective_date": "2026-01-01",
        "usage_notes": "Includes chronic bronchitis and emphysema.",
        "clinical_evidence": "Post-bronchodilator FEV1/FVC < 0.70 on spirometry."
    },
    {
        "code": "N39.0",
        "system": "ICD-10-CM",
        "description": "Urinary tract infection, site not specified",
        "effective_date": "2026-01-01",
        "usage_notes": "Use additional code to identify organism (B95-B97).",
        "clinical_evidence": "Dysuria, pyuria, positive urine culture > 10^5 CFU/mL."
    },
    
    # CPT Procedures
    {
        "code": "99213",
        "system": "CPT",
        "description": "Office or other outpatient visit for established patient, low complexity decision making, 20-29 minutes",
        "effective_date": "2026-01-01",
        "usage_notes": "Requires low level of medical decision making or 20 minutes total time.",
        "clinical_evidence": "Review of 2+ chronic stable conditions or 1 acute uncomplicated illness."
    },
    {
        "code": "99214",
        "system": "CPT",
        "description": "Office or other outpatient visit for established patient, moderate complexity decision making, 30-39 minutes",
        "effective_date": "2026-01-01",
        "usage_notes": "Requires moderate level of medical decision making or 30 minutes total time.",
        "clinical_evidence": "Multiple chronic illnesses with mild exacerbation or prescription drug management."
    },
    {
        "code": "99204",
        "system": "CPT",
        "description": "Office or other outpatient visit for new patient, moderate complexity decision making, 45-59 minutes",
        "effective_date": "2026-01-01",
        "usage_notes": "Comprehensive evaluation for a new patient.",
        "clinical_evidence": "Detailed history, examination, and moderate complexity MDM."
    },
    {
        "code": "71046",
        "system": "CPT",
        "description": "Radiologic examination, chest; 2 views",
        "effective_date": "2026-01-01",
        "usage_notes": "Standard PA and Lateral chest X-ray views.",
        "clinical_evidence": "Diagnostic imaging for dyspnea, fever, cough, or chest trauma."
    },
    {
        "code": "93000",
        "system": "CPT",
        "description": "Electrocardiogram, routine ECG with at least 12 leads; with interpretation and report",
        "effective_date": "2026-01-01",
        "usage_notes": "Global service including tracing, interpretation, and official report.",
        "clinical_evidence": "12-lead tracing performed to evaluate chest pain, arrhythmia, or preoperative risk."
    },
    {
        "code": "36415",
        "system": "CPT",
        "description": "Routine venipuncture (blood draw)",
        "effective_date": "2026-01-01",
        "usage_notes": "Collection of venous blood specimen.",
        "clinical_evidence": "Venous puncture for diagnostic laboratory panels."
    },

    # HCPCS Level II
    {
        "code": "A0428",
        "system": "HCPCS",
        "description": "Ambulance service, basic life support, non-emergency transport",
        "effective_date": "2026-01-01",
        "usage_notes": "Requires medical necessity documentation for transport.",
        "clinical_evidence": "Patient unable to travel by wheelchair or commercial transport due to medical condition."
    },
    {
        "code": "E0601",
        "system": "HCPCS",
        "description": "Continuous positive airway pressure (CPAP) device",
        "effective_date": "2026-01-01",
        "usage_notes": "Requires diagnostic polysomnography demonstrating AHI >= 15.",
        "clinical_evidence": "Sleep study proving obstructive sleep apnea diagnosis."
    },
    {
        "code": "J7030",
        "system": "HCPCS",
        "description": "Infusion, normal saline solution, 1000 cc",
        "effective_date": "2026-01-01",
        "usage_notes": "1000ml IV hydration fluid.",
        "clinical_evidence": "Documented dehydration, volume depletion, or IV drug dilution."
    }
]

class CodeService:
    @staticmethod
    def seed_codes_if_needed(db: Session):
        count = db.query(MedicalCode).count()
        if count == 0:
            for c_data in SEED_MEDICAL_CODES:
                code_obj = MedicalCode(**c_data)
                db.add(code_obj)
            db.commit()

    @staticmethod
    def search_codes(db: Session, query: str, system: Optional[str] = None) -> List[MedicalCode]:
        CodeService.seed_codes_if_needed(db)
        
        q = db.query(MedicalCode)
        if system and system != "ALL":
            q = q.filter(MedicalCode.system == system)
            
        if query:
            pattern = f"%{query.strip()}%"
            q = q.filter(
                (MedicalCode.code.ilike(pattern)) |
                (MedicalCode.description.ilike(pattern)) |
                (MedicalCode.usage_notes.ilike(pattern)) |
                (MedicalCode.clinical_evidence.ilike(pattern))
            )
            
        return q.all()

    @staticmethod
    def get_by_code(db: Session, code_str: str) -> Optional[MedicalCode]:
        CodeService.seed_codes_if_needed(db)
        return db.query(MedicalCode).filter(MedicalCode.code.ilike(code_str.strip())).first()
