import React, { useState, useEffect } from 'react';
import { Save, Download, AlertCircle } from 'lucide-react';
import type { CMS1500ClaimForm, MedicalCode } from '../../types';
import { api } from '../../services/api';

interface CMS1500EditorProps {
  formId?: string | null;
  onSaved?: () => void;
}

export const CMS1500Editor: React.FC<CMS1500EditorProps> = ({ formId, onSaved }) => {
  const [patientName, setPatientName] = useState('');
  const [patientDob, setPatientDob] = useState('1984-05-14');
  const [insuranceName, setInsuranceName] = useState('Blue Cross Blue Shield');
  const [policyId, setPolicyId] = useState('POL-994821102');
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>(['E11.9', 'I10']);
  const [procedureCodes, setProcedureCodes] = useState<string[]>(['99214', '36415']);
  
  const [formData, setFormData] = useState<Record<string, any>>({
    insurance_type: 'Group Health Plan',
    box1a_insured_id: 'POL-994821102',
    box2_patient_name: '',
    box3_patient_dob: '1984-05-14',
    box4_insured_name: '',
    box5_address: '124 Healthcare Ave, Suite 300',
    box11_group_num: 'GRP-881920',
    box33_provider: 'City Medical Center - Dr. Marcus Vance, M.D. (NPI: 1948201948)'
  });

  const [codeQuery, setCodeQuery] = useState('');
  const [codeSearchResults, setCodeSearchResults] = useState<MedicalCode[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [savedForm, setSavedForm] = useState<CMS1500ClaimForm | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id: string) => {
    try {
      const res = await api.get<CMS1500ClaimForm>(`/doctor/claim-forms/${id}`);
      const f = res.data;
      setSavedForm(f);
      setPatientName(f.patient_name);
      setPatientDob(f.patient_dob || '1984-05-14');
      setInsuranceName(f.insurance_name || 'Blue Cross Blue Shield');
      setPolicyId(f.policy_id || 'POL-994821102');
      setDiagnosisCodes(f.diagnosis_codes || []);
      setProcedureCodes(f.procedure_codes || []);
      setFormData(f.form_data || {});
    } catch (err) {
      console.error('Failed to load claim form:', err);
    }
  };

  const handleSearchCodes = async () => {
    if (!codeQuery.trim()) return;
    try {
      const res = await api.get('/codes/search', { params: { q: codeQuery } });
      setCodeSearchResults(res.data.results);
    } catch (err) {
      console.error('Code search error:', err);
    }
  };

  const validateFormLocal = () => {
    const errs: string[] = [];
    if (!patientName.trim()) errs.push("Box 2: Patient Name is required.");
    if (!patientDob) errs.push("Box 3: Patient Date of Birth is required.");
    if (!policyId.trim()) errs.push("Box 1a: Insured's ID Number is required.");
    if (diagnosisCodes.length === 0) errs.push("Box 21: At least one ICD-10 diagnosis code is required.");
    if (procedureCodes.length === 0) errs.push("Box 24D: At least one CPT/HCPCS procedure code is required.");
    setValidationErrors(errs);
    return errs.length === 0;
  };

  const handleSaveForm = async (statusOverride?: string) => {
    const isValid = validateFormLocal();
    setLoading(true);

    const payload = {
      patient_name: patientName || 'Jane Doe',
      patient_dob: patientDob,
      insurance_name: insuranceName,
      policy_id: policyId,
      diagnosis_codes: diagnosisCodes,
      procedure_codes: procedureCodes,
      form_data: {
        ...formData,
        box2_patient_name: patientName,
        box3_patient_dob: patientDob,
        box1a_insured_id: policyId
      }
    };

    try {
      if (savedForm) {
        const res = await api.patch<CMS1500ClaimForm>(`/doctor/claim-forms/${savedForm.id}`, {
          ...payload,
          status: statusOverride || (isValid ? 'Validated' : 'Draft')
        });
        setSavedForm(res.data);
      } else {
        const res = await api.post<CMS1500ClaimForm>('/doctor/claim-forms', payload);
        setSavedForm(res.data);
      }
      if (onSaved) onSaved();
      alert('CMS-1500 Claim Form saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!savedForm) {
      await handleSaveForm();
    }
    const targetId = savedForm?.id;
    if (!targetId) return;

    try {
      const res = await api.get(`/doctor/claim-forms/${targetId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CMS1500_${patientName.replace(/\s+/g, '_')}_Claim.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-ivory-300 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
              CMS-1500 (02/12) Official Standard
            </span>
            <span className="text-xs font-semibold text-taupe-400">
              Status: {savedForm?.status || (validationErrors.length === 0 ? 'Validated' : 'Draft')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-charcoal-800 mt-1">Health Insurance Claim Form Generator</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveForm('Draft')}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-ivory-300 bg-white text-charcoal-700 font-semibold text-sm hover:bg-ivory-100 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={handleExportPDF}
            className="px-5 py-2.5 rounded-xl bg-charcoal-700 text-white font-semibold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CMS-1500 PDF
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sm text-red-800">
            <AlertCircle className="w-4 h-4" /> Incomplete or Missing CMS-1500 Fields:
          </div>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-red-900/30 p-6 space-y-6 shadow-soft">
        <div className="bg-red-950/90 text-white p-3 rounded-xl flex justify-between items-center text-xs font-bold uppercase tracking-wider">
          <span>Health Insurance Claim Form - Box 1 through Box 33</span>
          <span>NUCC Standard Approved</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-ivory-50 border border-ivory-200">
          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Box 1a. Insured's ID Number *</label>
            <input
              type="text"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              placeholder="e.g. POL-994821102"
              className="w-full text-xs p-2.5 rounded-lg border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Box 2. Patient's Name (Last, First) *</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="DOE, JANE A."
              className="w-full text-xs p-2.5 rounded-lg border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Box 3. Patient Birth Date *</label>
            <input
              type="date"
              value={patientDob}
              onChange={(e) => setPatientDob(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-white"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
              Box 21. ICD-10-CM Diagnosis Codes (Pointers A-L) *
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search diagnosis code..."
                value={codeQuery}
                onChange={(e) => setCodeQuery(e.target.value)}
                className="text-xs p-1.5 px-3 rounded-lg border border-ivory-300 bg-white"
              />
              <button
                type="button"
                onClick={handleSearchCodes}
                className="p-1.5 px-3 rounded-lg bg-taupe-400 text-white text-xs font-semibold hover:bg-taupe-500"
              >
                Search
              </button>
            </div>
          </div>

          {codeSearchResults.length > 0 && (
            <div className="p-3 rounded-xl bg-white border border-ivory-300 max-h-40 overflow-y-auto space-y-1">
              <span className="text-[10px] font-bold text-taupe-400 block uppercase">Search Results:</span>
              {codeSearchResults.map((c) => (
                <div key={c.id} className="flex justify-between items-center text-xs p-1.5 hover:bg-ivory-50 rounded">
                  <span><strong>[{c.system}] {c.code}</strong> - {c.description}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (c.system === 'ICD-10-CM' && !diagnosisCodes.includes(c.code)) {
                        setDiagnosisCodes([...diagnosisCodes, c.code]);
                      } else if (!procedureCodes.includes(c.code)) {
                        setProcedureCodes([...procedureCodes, c.code]);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-sage-100 text-sage-600 text-[11px] font-bold"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {diagnosisCodes.map((code, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-nude-200 text-charcoal-800 text-xs font-bold border border-nude-300">
                Pointer {String.fromCharCode(65 + idx)}: {code}
                <button
                  type="button"
                  onClick={() => setDiagnosisCodes(diagnosisCodes.filter((c) => c !== code))}
                  className="text-taupe-400 hover:text-red-600 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-3">
          <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
            Box 24D. CPT / HCPCS Procedure Codes *
          </h4>
          <div className="flex flex-wrap gap-2">
            {procedureCodes.map((proc, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-taupe-100 text-charcoal-800 text-xs font-bold border border-taupe-200">
                CPT: {proc}
                <button
                  type="button"
                  onClick={() => setProcedureCodes(procedureCodes.filter((p) => p !== proc))}
                  className="text-taupe-400 hover:text-red-600 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-ivory-50 border border-ivory-200">
          <label className="text-xs font-bold text-charcoal-700 block mb-1">Box 33. Billing Provider Name, Address & NPI *</label>
          <input
            type="text"
            value={formData.box33_provider || ''}
            onChange={(e) => setFormData({ ...formData, box33_provider: e.target.value })}
            className="w-full text-xs p-2.5 rounded-lg border border-ivory-300 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
