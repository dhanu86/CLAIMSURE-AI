import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatWindow } from '../components/chat/ChatWindow';
import { FileSearch, Upload, Loader2, Sparkles, Save, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CodingAnalysis, CoverageAssessment, DocumentItem } from '../types';

export const CoderDashboardPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [analyses, setAnalyses] = useState<CodingAnalysis[]>([]);
  const [assessments, setAssessments] = useState<CoverageAssessment[]>([]);
  const [userDocs, setUserDocs] = useState<DocumentItem[]>([]);

  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [organization, setOrganization] = useState(user?.coder_profile?.organization || 'Apex Health Systems');
  const [certifications, setCertifications] = useState(user?.coder_profile?.certification_details || 'CPC, CCS-P, RHIT');
  const [experienceYears, setExperienceYears] = useState(user?.coder_profile?.experience_years || 5);
  const [preferredSystem, setPreferredSystem] = useState(user?.coder_profile?.preferred_coding_system || 'ICD-10-CM / CPT / HCPCS');
  const [savingProfile, setSavingProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCoderData();
  }, []);

  const fetchCoderData = async () => {
    try {
      const [anRes, caRes, docsRes] = await Promise.all([
        api.get('/coder/analyses').catch(() => ({ data: [] })),
        api.get('/coder/coverage-assessments').catch(() => ({ data: [] })),
        api.get('/documents').catch(() => ({ data: [] }))
      ]);
      setAnalyses(anRes.data);
      setAssessments(caRes.data);
      setUserDocs(docsRes.data);
    } catch (err) {
      console.error('Failed to load coder data:', err);
    }
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'clinical_summary');

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newDoc: DocumentItem = res.data.document;
      setUserDocs([newDoc, ...userDocs]);
      setSelectedDocId(newDoc.id);
      alert(`Document "${file.name}" uploaded successfully! Selected for analysis.`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedDocId) {
      alert('Please upload or select a clinical document to analyze.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<CodingAnalysis>('/coder/analyses', { document_id: selectedDocId });
      setAnalyses([res.data, ...analyses]);
      setActiveTab('code-review');
      alert('Clinical document analyzed! Candidate ICD-10 & CPT codes extracted.');
    } catch (err) {
      alert('Failed to run coding analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCoverageAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.post<CoverageAssessment>('/coder/coverage-assessments', {
        clinical_document_id: selectedDocId || null,
        policy_document_id: selectedPolicyId || null
      });
      setAssessments([res.data, ...assessments]);
      setActiveTab('coverage-assessment');
      alert('Insurance coverage assessment report generated!');
    } catch (err) {
      alert('Failed to generate coverage assessment.');
    } finally {
      setLoading(false);
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
          organization,
          certification_details: certifications,
          experience_years: experienceYears,
          preferred_coding_system: preferredSystem
        }
      });
      await refreshProfile();
      alert('Coder Profile updated & saved to database!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getCoverageBadgeStyle = (status: string) => {
    if (status === 'Potentially Covered') return 'bg-sage-100 text-sage-600 border-sage-200';
    if (status === 'Potentially Not Covered') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-nude-200 text-charcoal-700 border-nude-300';
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-taupe-100 via-ivory-200 to-nude-200 border border-ivory-300 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-taupe-500 text-xs font-bold mb-2">
                <FileSearch className="w-4 h-4" />
                Medical Coding & Coverage Intelligence
              </div>
              <h2 className="text-2xl font-bold text-charcoal-800">Welcome, {user?.full_name}</h2>
              <p className="text-xs text-taupe-500 mt-1 max-w-xl">
                Upload clinical summaries, review AI candidate code suggestions with page evidence, and generate policy coverage audit reports.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('upload-analysis')}
              className="px-5 py-3 rounded-2xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload & Analyze
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Coding Analyses</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{analyses.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Coverage Reports</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{assessments.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Clinical Docs</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{userDocs.length}</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-charcoal-800">Recent Coding Analyses</h3>
            {analyses.length === 0 ? (
              <p className="text-xs text-taupe-400 py-4 text-center">No coding analyses performed yet.</p>
            ) : (
              <div className="space-y-3">
                {analyses.map((an) => (
                  <div key={an.id} className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm text-charcoal-800 block">📄 {an.document_name}</span>
                      <span className="text-xs text-taupe-400">
                        Suggested Codes: {an.code_suggestions?.map((c) => c.code).join(', ')}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-nude-200 text-charcoal-800 text-xs font-bold border border-nude-300">
                      {an.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upload-analysis' && (
        <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft max-w-2xl space-y-6">
          <h2 className="text-xl font-bold text-charcoal-800">Upload & Analyze Clinical Document</h2>
          
          <div className="space-y-4">
            {/* Direct File Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-ivory-300 hover:border-nude-400 rounded-2xl bg-ivory-50 hover:bg-ivory-100/50 cursor-pointer text-center space-y-3 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-nude-200 text-charcoal-800 flex items-center justify-center mx-auto">
                {uploadingDoc ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <span className="font-bold text-sm text-charcoal-800 block">Click to Upload PDF, DOCX, or TXT File</span>
                <span className="text-xs text-taupe-400">Upload hospital summaries or discharge notes directly</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleDirectFileUpload} 
                className="hidden" 
                accept=".pdf,.docx,.txt" 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Or Select Previously Uploaded Document</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full p-3 rounded-xl border border-ivory-300 text-sm bg-ivory-50"
              >
                <option value="">-- Select Document --</option>
                {userDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    📄 {doc.filename} ({doc.document_type})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={loading || !selectedDocId}
              className="w-full py-3.5 rounded-xl bg-charcoal-700 text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Run AI Clinical Extraction & Code Suggestions
            </button>
          </div>
        </div>
      )}

      {activeTab === 'code-review' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
            <h2 className="text-lg font-bold text-charcoal-800">Medical Code Audit & Review Workspace</h2>
            {analyses.length === 0 ? (
              <p className="text-xs text-taupe-400">No active analyses. Upload or select a document in "Upload & Analysis".</p>
            ) : (
              analyses.map((an) => (
                <div key={an.id} className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-charcoal-800">📄 {an.document_name}</span>
                    <span className="text-xs font-bold text-nude-500">{an.status}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-taupe-500 block uppercase">Candidate Codes & Clinical Evidence:</span>
                    {an.code_suggestions?.map((codeObj, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white border border-ivory-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-charcoal-800">[{codeObj.system}] {codeObj.code}</span> - {codeObj.description}
                          <p className="text-[11px] text-taupe-400 mt-0.5">Evidence: "{codeObj.evidence}" (Page {codeObj.page || 1})</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-sage-100 text-sage-600 font-bold text-[10px]">
                          Accept Code
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'coverage-assessment' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
            <h2 className="text-lg font-bold text-charcoal-800">Insurance Coverage Assessment Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Clinical Summary Document</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                >
                  <option value="">-- Select Clinical Doc --</option>
                  {userDocs.map((d) => (
                    <option key={d.id} value={d.id}>{d.filename}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Insurance Policy Document</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                >
                  <option value="">-- Select Policy Doc --</option>
                  {userDocs.map((d) => (
                    <option key={d.id} value={d.id}>{d.filename}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunCoverageAssessment}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-charcoal-700 text-white font-bold text-xs shadow-soft"
            >
              Generate Coverage Assessment Report
            </button>
          </div>

          <div className="space-y-4">
            {assessments.map((ass) => (
              <div key={ass.id} className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
                <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
                  <h3 className="font-bold text-base text-charcoal-800">Preliminary Coverage Report #{ass.id.slice(0, 8)}</h3>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getCoverageBadgeStyle(ass.preliminary_status)}`}>
                    {ass.preliminary_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-charcoal-700">
                  <div className="p-3 bg-ivory-50 rounded-xl space-y-1">
                    <strong className="block text-taupe-500 uppercase text-[10px]">Diagnoses & Procedures</strong>
                    <p>{ass.report.relevant_diagnoses?.join(', ')}</p>
                    <p>Suggested Codes: {ass.report.suggested_codes?.join(', ')}</p>
                  </div>
                  <div className="p-3 bg-ivory-50 rounded-xl space-y-1">
                    <strong className="block text-taupe-500 uppercase text-[10px]">Identified Policy Clauses</strong>
                    {ass.report.policy_clauses_identified?.map((cl: string, idx: number) => (
                      <p key={idx}>{cl}</p>
                    ))}
                  </div>
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
            <div className="w-10 h-10 rounded-2xl bg-taupe-100 text-taupe-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-800">Coder Profile & Certification Settings</h2>
              <p className="text-xs text-taupe-400">Manage your organization and professional coding credentials.</p>
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
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Organization / Employer</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Professional Certifications</label>
                <input
                  type="text"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Years of Coding Experience</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Preferred Coding Systems</label>
                <input
                  type="text"
                  value={preferredSystem}
                  onChange={(e) => setPreferredSystem(e.target.value)}
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
              {savingProfile ? 'Saving...' : 'Save Coder Profile'}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};
