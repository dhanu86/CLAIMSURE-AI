export type UserRole = 'Doctor' | 'Patient' | 'Medical Coder';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  doctor_profile?: {
    designation?: string;
    specialty?: string;
    hospital?: string;
    license_number?: string;
    npi_number?: string;
  };
  patient_profile?: {
    dob?: string;
    address?: string;
    insurance_provider?: string;
    policy_number?: string;
    group_number?: string;
  };
  coder_profile?: {
    organization?: string;
    certification_details?: string;
    experience_years?: number;
    preferred_coding_system?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface MedicalCode {
  id: string;
  code: string;
  system: 'ICD-10-CM' | 'CPT' | 'HCPCS';
  description: string;
  effective_date?: string;
  usage_notes?: string;
  clinical_evidence?: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_size: number;
  content_type: string;
  document_type: string;
  total_pages: number;
  status: string;
  created_at: string;
}

export interface MessageCitation {
  document_name: string;
  page_number: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  content: string;
  citations?: MessageCitation[];
  created_at: string;
}

export interface Conversation {
  id: string;
  role: UserRole;
  title: string;
  document_id?: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface CMS1500ClaimForm {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_dob?: string;
  insurance_name?: string;
  policy_id?: string;
  diagnosis_codes: string[];
  procedure_codes: string[];
  status: 'Draft' | 'Validated' | 'Saved' | 'Exported';
  form_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PatientClaim {
  id: string;
  patient_id: string;
  claim_reference: string;
  title: string;
  description?: string;
  provider_name?: string;
  amount_claimed: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Additional Information Required' | 'Processed' | 'Closed';
  supporting_document_ids: string[];
  submitted_at: string;
  updated_at: string;
}

export interface CodingAnalysis {
  id: string;
  coder_id: string;
  document_id?: string;
  document_name: string;
  extracted_diagnoses: any[];
  extracted_procedures: any[];
  code_suggestions: any[];
  missing_documentation: string[];
  status: string;
  created_at: string;
}

export interface CoverageAssessment {
  id: string;
  coder_id: string;
  clinical_document_id?: string;
  policy_document_id?: string;
  preliminary_status: 'Potentially Covered' | 'Potentially Not Covered' | 'More Information Required' | 'Manual Review Required';
  report: Record<string, any>;
  created_at: string;
}
