import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CMS1500Editor } from '../components/doctor/CMS1500Editor';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Stethoscope, PlusCircle, Trash2, Save, Sparkles, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CMS1500ClaimForm, MedicalCode, DocumentItem } from '../types';

export const DoctorDashboardPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [encounters, setEncounters] = useState<any[]>([]);
  const [claimForms, setClaimForms] = useState<CMS1500ClaimForm[]>([]);
  const [codeQuery, setCodeQuery] = useState('');
  const [codeResults, setCodeResults] = useState<MedicalCode[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  const [patientName, setPatientName] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [editingFormId, setEditingFormId] = useState<string | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [specialty, setSpecialty] = useState(user?.doctor_profile?.specialty || 'General Practice');
  const [hospital, setHospital] = useState(user?.doctor_profile?.hospital || 'City Medical Center');
  const [licenseNumber, setLicenseNumber] = useState(user?.doctor_profile?.license_number || 'MD-9948201948');
  const [npiNumber, setNpiNumber] = useState(user?.doctor_profile?.npi_number || '1948201948');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [encRes, formsRes, docsRes, codesRes] = await Promise.all([
        api.get('/doctor/encounters').catch(() => ({ data: [] })),
        api.get('/doctor/claim-forms').catch(() => ({ data: [] })),
        api.get('/documents').catch(() => ({ data: [] })),
        api.get('/codes/search', { params: { q: 'diabetes' } }).catch(() => ({ data: { results: [] } }))
      ]);
      setEncounters(encRes.data);
      setClaimForms(formsRes.data);
      setDocuments(docsRes.data);
      setCodeResults(codesRes.data.results || []);
    } catch (err) {
      console.error('Failed to load doctor dashboard data:', err);
    }
  };

  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !clinicalNotes) return;
    try {
      const res = await api.post('/doctor/encounters', {
        patient_name: patientName,
        clinical_notes: clinicalNotes
      });
      setEncounters([res.data, ...encounters]);
      setPatientName('');
      setClinicalNotes('');
      alert('Patient encounter saved to database! Diagnostic codes extracted.');
    } catch (err) {
      alert('Failed to save encounter');
    }
  };

  const handleDeleteEncounter = async (encId: string) => {
    if (!window.confirm('Delete this saved encounter?')) return;
    try {
      await api.delete(`/doctor/encounters/${encId}`);
      setEncounters(encounters.filter((e) => e.id !== encId));
    } catch (err) {
      alert('Failed to delete encounter');
    }
  };

  const handleSearchCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get('/codes/search', { params: { q: codeQuery } });
      setCodeResults(res.data.results);
    } catch (err) {
      console.error('Code search error:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/profile/me', {
        full_name: fullName,
        phone_number: phone,
        role_details: {
          specialty,
          hospital,
          license_number: licenseNumber,
          npi_number: npiNumber
        }
      });
      await refreshProfile();
      alert('Doctor profile updated & saved to database!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-nude-200 via-ivory-200 to-sage-100 border border-ivory-300 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-charcoal-700 text-xs font-bold mb-2">
                <Stethoscope className="w-4 h-4 text-taupe-500" />
                Doctor Clinical Hub
              </div>
              <h2 className="text-2xl font-bold text-charcoal-800">Welcome Back, {user?.full_name}</h2>
              <p className="text-xs text-taupe-500 mt-1 max-w-xl">
                Search medical codes via LLM, record patient encounters, generate official CMS-1500 claim forms, and inspect document-grounded AI coding suggestions.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('cms1500')}
              className="px-5 py-3 rounded-2xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              New CMS-1500 Claim Form
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Saved Encounters</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{encounters.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">CMS-1500 Forms</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{claimForms.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Code References</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{codeResults.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Uploaded Docs</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{documents.length}</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-charcoal-800">Recent CMS-1500 Claim Forms</h3>
              <button onClick={() => setActiveTab('cms1500')} className="text-xs font-bold text-taupe-500 hover:underline">
                View All Forms →
              </button>
            </div>

            {claimForms.length === 0 ? (
              <p className="text-xs text-taupe-400 py-4 text-center">No claim forms created yet. Click "New CMS-1500 Claim Form" to start.</p>
            ) : (
              <div className="space-y-2">
                {claimForms.slice(0, 3).map((form) => (
                  <div key={form.id} className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm text-charcoal-800 block">{form.patient_name}</span>
                      <span className="text-xs text-taupe-400">
                        Diagnoses: {form.diagnosis_codes?.join(', ') || 'N/A'} | Procedures: {form.procedure_codes?.join(', ') || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full bg-sage-100 text-sage-600 text-xs font-bold">
                        {form.status}
                      </span>
                      <button
                        onClick={() => {
                          setEditingFormId(form.id);
                          setActiveTab('cms1500');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-charcoal-700 text-white text-xs font-semibold hover:bg-charcoal-900"
                      >
                        Edit / Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'code-search' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-charcoal-800">LLM-Powered Medical Code Search</h2>
                <p className="text-xs text-taupe-400">Type any disease, procedure, or symptom to fetch ICD-10, CPT, and HCPCS codes.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-nude-200 text-charcoal-800 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> LLM Med-Code Engine
              </span>
            </div>
            
            <form onSubmit={handleSearchCodes} className="flex gap-3">
              <input
                type="text"
                placeholder="Search by disease or procedure (e.g. Type 2 Diabetes, Knee Arthroscopy, Pneumonia X-Ray)..."
                value={codeQuery}
                onChange={(e) => setCodeQuery(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-ivory-300 text-sm focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 shadow-soft"
              >
                Search Codes
              </button>
            </form>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs text-charcoal-700">
                <thead className="bg-ivory-100 text-taupe-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">System</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Official Description</th>
                    <th className="p-3">Clinical Evidence Required</th>
                    <th className="p-3">Usage Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {codeResults.map((c) => (
                    <tr key={c.id} className="hover:bg-ivory-50">
                      <td className="p-3 font-bold text-nude-500">{c.system}</td>
                      <td className="p-3 font-extrabold text-charcoal-800">{c.code}</td>
                      <td className="p-3 font-medium">{c.description}</td>
                      <td className="p-3 text-taupe-500">{c.clinical_evidence || 'Standard clinical documentation'}</td>
                      <td className="p-3 text-taupe-400 italic">{c.usage_notes || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cms1500' && (
        <CMS1500Editor formId={editingFormId} onSaved={fetchDashboardData} />
      )}

      {activeTab === 'encounters' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
            <h2 className="text-lg font-bold text-charcoal-800">Record New Clinical Encounter</h2>
            <form onSubmit={handleCreateEncounter} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Robert Taylor"
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-sm bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Clinical Notes & Discharge Summary</label>
                <textarea
                  rows={4}
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Patient presented with chest pain and elevated fasting glucose..."
                  className="w-full p-3 rounded-xl border border-ivory-300 text-sm bg-ivory-50"
                />
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-charcoal-700 text-white text-xs font-bold shadow-soft">
                Save Encounter to Database
              </button>
            </form>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-charcoal-800">Saved Database Encounters ({encounters.length})</h3>
            {encounters.map((enc) => (
              <div key={enc.id} className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-charcoal-800 block">{enc.patient_name} ({enc.encounter_date})</span>
                  <p className="text-xs text-charcoal-600">{enc.clinical_notes}</p>
                  <div className="text-[11px] font-semibold text-nude-500 pt-1">
                    Extracted Codes: {enc.extracted_diagnoses} | {enc.extracted_procedures}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('cms1500')}
                    className="px-3 py-1.5 rounded-lg bg-charcoal-700 text-white text-xs font-semibold hover:bg-charcoal-900"
                  >
                    Generate Form
                  </button>
                  <button
                    onClick={() => handleDeleteEncounter(enc.id)}
                    className="p-1.5 text-taupe-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai-chat' && <ChatWindow />}

      {activeTab === 'profile' && (
        <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-nude-200 text-charcoal-800 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-800">Doctor Profile & Credentials</h2>
              <p className="text-xs text-taupe-400">View and update your registered credentials in PostgreSQL.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Medical Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Hospital / Clinic Name</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Medical License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">NPI Provider Number</label>
                <input
                  type="text"
                  value={npiNumber}
                  onChange={(e) => setNpiNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-3 rounded-xl bg-charcoal-700 text-white font-bold text-xs shadow-soft flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};
