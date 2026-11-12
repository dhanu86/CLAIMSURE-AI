
import json
import logging
import re
from typing import List, Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class AIService:

    @staticmethod
    def _get_genai_client():
        if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
            try:
                return genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client: {e}")
        return None

    # ---------------------------------------------------------
    # MEDICAL CODE SEARCH
    # ---------------------------------------------------------

    @staticmethod
    def search_codes_llm(
        query: str,
        system: Optional[str] = "ALL"
    ) -> List[Dict[str, Any]]:

        client = AIService._get_genai_client()

        if client:
            prompt = f"""
You are a medical coding information assistant.

Find possible ICD-10-CM, CPT or HCPCS code candidates for:
{query}

Requested coding system: {system}

Return only a valid JSON array.
Each object must contain:
- id
- code
- system
- description
- effective_date
- usage_notes
- clinical_evidence

Do not invent codes. If uncertain, return an empty array.
These are candidates requiring verification, not final coding decisions.
"""

            try:
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt
                )

                if response and response.text:
                    json_text = response.text.strip()

                    if json_text.startswith("```"):
                        json_text = re.sub(
                            r"^```(?:json)?\s*|\s*```$",
                            "",
                            json_text
                        ).strip()

                    parsed = json.loads(json_text)

                    if isinstance(parsed, list):
                        valid_results = []

                        for item in parsed:
                            if not isinstance(item, dict):
                                continue

                            if not all(
                                item.get(field)
                                for field in ("code", "system", "description")
                            ):
                                continue

                            if (
                                system
                                and system.upper() != "ALL"
                                and item["system"].upper() != system.upper()
                            ):
                                continue

                            item["verification_status"] = (
                                "AI-generated candidate - verify against "
                                "official coding guidelines"
                            )

                            valid_results.append(item)

                        return valid_results

            except Exception as e:
                logger.error(f"Gemini Code Search failed: {e}")

        return AIService._heuristic_code_search(query, system)

    @staticmethod
    def _heuristic_code_search(
        query: str,
        system: Optional[str]
    ) -> List[Dict[str, Any]]:

        q_lower = query.lower().strip()

        if not q_lower:
            return []

        all_codes = [
            {
                "id": "E11.9",
                "code": "E11.9",
                "system": "ICD-10-CM",
                "description": "Type 2 diabetes mellitus without complications",
                "effective_date": "Not verified",
                "usage_notes": "Candidate only. Confirm documentation and coding guidelines.",
                "clinical_evidence": "Type 2 diabetes mellitus documented in the clinical record."
            },
            {
                "id": "E11.65",
                "code": "E11.65",
                "system": "ICD-10-CM",
                "description": "Type 2 diabetes mellitus with hyperglycemia",
                "effective_date": "Not verified",
                "usage_notes": "Requires documented hyperglycemia.",
                "clinical_evidence": "Type 2 diabetes with documented hyperglycemia."
            },
            {
                "id": "I10",
                "code": "I10",
                "system": "ICD-10-CM",
                "description": "Essential (primary) hypertension",
                "effective_date": "Not verified",
                "usage_notes": "Verify the documented diagnosis.",
                "clinical_evidence": "Essential hypertension documented by the provider."
            },
            {
                "id": "J18.9",
                "code": "J18.9",
                "system": "ICD-10-CM",
                "description": "Pneumonia, unspecified organism",
                "effective_date": "Not verified",
                "usage_notes": "Verify organism and clinical documentation.",
                "clinical_evidence": "Pneumonia documented without a specified organism."
            },
            {
                "id": "M54.50",
                "code": "M54.50",
                "system": "ICD-10-CM",
                "description": "Low back pain, unspecified",
                "effective_date": "Not verified",
                "usage_notes": "Verify the documented pain condition.",
                "clinical_evidence": "Unspecified low back pain documented."
            },
            {
                "id": "K21.9",
                "code": "K21.9",
                "system": "ICD-10-CM",
                "description": "Gastro-esophageal reflux disease without esophagitis",
                "effective_date": "Not verified",
                "usage_notes": "Verify whether esophagitis is documented.",
                "clinical_evidence": "GERD without documented esophagitis."
            },
            {
                "id": "99214",
                "code": "99214",
                "system": "CPT",
                "description": "Office or other outpatient visit for an established patient",
                "effective_date": "Not verified",
                "usage_notes": "Verify medical decision-making or time requirements.",
                "clinical_evidence": "Established patient outpatient evaluation."
            },
            {
                "id": "99213",
                "code": "99213",
                "system": "CPT",
                "description": "Office or other outpatient visit for an established patient",
                "effective_date": "Not verified",
                "usage_notes": "Verify medical decision-making or time requirements.",
                "clinical_evidence": "Established patient outpatient evaluation."
            },
            {
                "id": "71046",
                "code": "71046",
                "system": "CPT",
                "description": "Radiologic examination, chest, two views",
                "effective_date": "Not verified",
                "usage_notes": "Verify the actual imaging service performed.",
                "clinical_evidence": "Two-view chest radiologic examination."
            },
            {
                "id": "93000",
                "code": "93000",
                "system": "CPT",
                "description": "Routine electrocardiogram with at least 12 leads",
                "effective_date": "Not verified",
                "usage_notes": "Verify tracing, interpretation and report.",
                "clinical_evidence": "12-lead ECG performed and interpreted."
            },
            {
                "id": "36415",
                "code": "36415",
                "system": "CPT",
                "description": "Collection of venous blood by venipuncture",
                "effective_date": "Not verified",
                "usage_notes": "Verify the service performed.",
                "clinical_evidence": "Venous blood specimen collected."
            },
            {
                "id": "A0428",
                "code": "A0428",
                "system": "HCPCS",
                "description": "Basic life support ambulance service, non-emergency transport",
                "effective_date": "Not verified",
                "usage_notes": "Verify transport circumstances and applicable requirements.",
                "clinical_evidence": "Non-emergency basic life support ambulance transport."
            }
        ]

        results = []

        for code in all_codes:

            if (
                system
                and system.upper() != "ALL"
                and code["system"].upper() != system.upper()
            ):
                continue

            searchable_text = (
                code["code"] + " " +
                code["description"] + " " +
                code["clinical_evidence"]
            ).lower()

            if q_lower in searchable_text:
                candidate = code.copy()
                candidate["verification_status"] = (
                    "Unverified candidate - confirm using official coding guidelines"
                )
                results.append(candidate)

        return results

    # ---------------------------------------------------------
    # CHAT RESPONSE
    # ---------------------------------------------------------

    @staticmethod
    def generate_chat_response(
        role: str,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        document_chunks: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:

        client = AIService._get_genai_client()

        citations = []
        context_parts = []

        if document_chunks:

            for chunk in document_chunks:

                page_num = chunk.get("page_number")
                doc_name = chunk.get(
                    "document_name",
                    "Uploaded Document"
                )
                snippet = chunk.get("content", "")

                context_parts.append(
                    f"[{doc_name} - Page {page_num}]: {snippet}"
                )

                citations.append({
                    "document_name": doc_name,
                    "page_number": page_num,
                    "snippet": snippet[:150]
                })

        context_str = "\n\n".join(context_parts)

        history_str = ""

        if conversation_history:
            history_str = "\n".join(
                f"{message.get('role', 'user')}: "
                f"{message.get('content', '')}"
                for message in conversation_history[-6:]
            )

        system_instruction = f"""
You are ClaimSure-AI, a healthcare document information assistant
for the {role} portal.

Follow these rules:

1. Use retrieved document evidence when available.
2. Never invent medical diagnoses, procedure codes or clinical findings.
3. Never invent insurance coverage, copays, deductibles or reimbursement.
4. If information is missing, clearly say it is unavailable.
5. Do not claim that a medical code is officially verified unless
   an authoritative source confirms it.
6. Cite only the actual document names and page numbers supplied.
7. Do not make final medical, coding or insurance approval decisions.
8. Explain information clearly and use Markdown formatting.
"""

        full_prompt = f"""
{system_instruction}

RETRIEVED DOCUMENT EVIDENCE:
{context_str if context_str else "No document evidence is available."}

CONVERSATION HISTORY:
{history_str}

USER QUESTION:
{user_message}
"""

        if client:
            try:
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=full_prompt
                )

                if response and response.text:
                    return {
                        "content": response.text,
                        "citations": citations
                    }

            except Exception as e:
                logger.error(
                    f"Gemini API call failed: {e}. "
                    "Using safe fallback."
                )

        return AIService._heuristic_chat_response(
            role,
            user_message,
            document_chunks,
            citations
        )

    # ---------------------------------------------------------
    # SAFE CHAT FALLBACK - NO GEMINI REQUIRED
    # ---------------------------------------------------------

    @staticmethod
    def _heuristic_chat_response(
        role: str,
        user_message: str,
        document_chunks: Optional[List[Dict[str, Any]]],
        citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:

        if document_chunks:

            parts = [
                "### Document-Based Response",
                (
                    "Gemini is currently unavailable. The following "
                    "information is retrieved document evidence, "
                    "not an independently generated medical or "
                    "insurance decision."
                ),
                f"**Your question:** {user_message}",
                "### Retrieved Evidence"
            ]

            for index, chunk in enumerate(document_chunks[:3], 1):

                text = (chunk.get("content") or "").strip()

                if not text:
                    continue

                document_name = chunk.get(
                    "document_name",
                    "Uploaded Document"
                )

                page = chunk.get("page_number")

                page_label = (
                    f"Page {page}"
                    if page is not None
                    else "Page unavailable"
                )

                parts.append(
                    f"**{index}. {document_name} — {page_label}**\n\n"
                    f"{text}"
                )

            parts.extend([
                "### Important Limitations",
                "- Claim approval cannot be confirmed automatically.",
                "- Insurance coverage and policy exclusions require verification.",
                "- Copays, deductibles and reimbursement amounts cannot be assumed.",
                "- Medical codes must be checked against official coding guidelines.",
                "- Consult the insurer or a qualified professional for final decisions."
            ])

            content = "\n\n".join(parts)

        elif role == "Doctor":

            content = (
                "Hello Dr.! Upload a clinical document or ask a question "
                "about medical coding or CMS-1500 form guidance."
            )

        elif role == "Patient":

            content = (
                "Welcome to your Patient Portal! Upload your medical bill "
                "or insurance policy so I can retrieve relevant information. "
                "I cannot independently confirm claim approval."
            )

        else:

            content = (
                "Medical Coding Intelligence Portal is ready. Upload a "
                "clinical document or insurance policy for evidence-based review."
            )

        return {
            "content": content,
            "citations": citations
        }

    # ---------------------------------------------------------
    # CLINICAL DOCUMENT ANALYSIS
    # ---------------------------------------------------------

    @staticmethod
    def analyze_clinical_document(
        extracted_text: str,
        filename: str
    ) -> Dict[str, Any]:

        text = extracted_text or ""
        lower_text = text.lower()

        diagnoses = []

        diagnosis_rules = [
            (
                ["type 2 diabetes", "diabetes mellitus", "diabetes"],
                "Type 2 diabetes mellitus",
                "E11.9"
            ),
            (
                ["hypertension", "high blood pressure"],
                "Essential (primary) hypertension",
                "I10"
            ),
            (
                ["pneumonia"],
                "Pneumonia, unspecified organism",
                "J18.9"
            ),
            (
                ["gerd", "gastroesophageal reflux"],
                "Gastro-esophageal reflux disease",
                "K21.9"
            ),
            (
                ["low back pain"],
                "Low back pain",
                "M54.50"
            )
        ]

        for keywords, description, code in diagnosis_rules:
            if any(keyword in lower_text for keyword in keywords):
                diagnoses.append({
                    "code": code,
                    "description": description,
                    "system": "ICD-10-CM",
                    "verification_status": (
                        "Unverified candidate - requires professional review"
                    )
                })

        missing_info = []

        if not re.search(r"\bsignature\b", text, re.IGNORECASE):
            missing_info.append(
                "Physician signature - not found in extracted text"
            )

        if not re.search(
            r"\b(dob|date of birth)\b",
            text,
            re.IGNORECASE
        ):
            missing_info.append(
                "Patient date of birth - not found in extracted text"
            )

        return {
            "document_name": filename,
            "extracted_diagnoses": diagnoses,
            "extracted_procedures": [],
            "code_suggestions": diagnoses,
            "missing_documentation": missing_info,
            "status": "Document analysis completed - verify coding candidates",
            "analysis_note": (
                "Diagnoses are identified using keyword matching. "
                "Codes are unverified candidates, not final coding decisions."
            )
        }

    # ---------------------------------------------------------
    # INSURANCE COVERAGE ASSESSMENT
    # ---------------------------------------------------------

    @staticmethod
    def assess_insurance_coverage(
        clinical_text: str,
        policy_text: str
    ) -> Dict[str, Any]:

        clinical_text = clinical_text or ""
        policy_text = policy_text or ""

        clinical_available = bool(clinical_text.strip())
        policy_available = bool(policy_text.strip())

        clauses = []

        if policy_available:
            for line in policy_text.splitlines():
                line = line.strip()

                if line and any(
                    term in line.lower()
                    for term in (
                        "coverage", "exclusion", "deductible",
                        "copay", "co-pay", "coinsurance",
                        "pre-authorization", "waiting period"
                    )
                ):
                    clauses.append(line)

        gaps = []

        if not clinical_available:
            gaps.append("Clinical documentation not provided")

        if not policy_available:
            gaps.append("Insurance policy text not provided")

        if not clinical_available or not policy_available:
            status = "Manual Review Required"
        else:
            status = "Manual Review Required"

        return {
            "preliminary_status": status,
            "relevant_diagnoses": [],
            "suggested_codes": [],
            "policy_clauses_identified": clauses,
            "conditions_met": [],
            "exclusions_identified": [],
            "documentation_gaps": gaps,
            "recommended_next_steps": [
                "Review the clinical documentation.",
                "Review the applicable insurance policy.",
                "Verify coverage and exclusions with the insurer."
            ],
            "uncertainty_reasons": (
                "Automated insurance adjudication is not configured. "
                "Manual verification is required. No coverage or "
                "reimbursement amount has been assumed."
            )
        }
