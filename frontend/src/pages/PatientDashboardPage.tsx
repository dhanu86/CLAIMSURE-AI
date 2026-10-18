import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatWindow } from '../components/chat/ChatWindow';
import { UserCheck, PlusCircle, Save } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PatientClaim, DocumentItem } from '../types';

export const PatientDashboardPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [claims, setClaims] = useState<PatientClaim[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Claim Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [providerName, setProviderName] = useState('');
  const [amountClaimed, setAmountClaimed] = useState('$230.00');

  // Patient Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [dob, setDob] = useState(user?.patient_profile?.dob || '1992-08-24');
  const [address, setAddress] = useState(user?.patient_profile?.address || '742 Evergreen Terrace');
  const [insuranceProvider, setInsuranceProvider] = useState(user?.patient_profile?.insurance_provider || 'Blue Cross Blue Shield');
  const [policyNumber, setPolicyNumber] = useState(user?.patient_profile?.policy_number || 'POL-994821102');
  const [groupNumber, setGroupNumber] = useState(user?.patient_profile?.group_number || 'GRP-881920');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const [claimsRes, docsRes] = await Promise.all([
        api.get('/patient/claims').catch(() => ({ data: [] })),
        api.get('/documents').catch(() => ({ data: [] }))
      ]);
      setClaims(claimsRes.data);
      setDocuments(docsRes.data);
    } catch (err) {
      console.error('Failed to load patient data:', err);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await api.post<PatientClaim>('/patient/claims', {
        title,
        description,
        provider_name: providerName || 'General Health Clinic',
        amount_claimed: amountClaimed,
        supporting_document_ids: []
      });
      setClaims([res.data, ...claims]);
      setTitle('');
      setDescription('');
      setActiveTab('my-claims');
      alert(`Claim submitted successfully! Reference Number: ${res.data.claim_reference}`);
    } catch (err) {
      alert('Failed to submit claim');
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
          dob,
          address,
          insurance_provider: insuranceProvider,
          policy_number: policyNumber,
          group_number: groupNumber
        }
      });
      await refreshProfile();
      alert('Patient Profile updated and saved to database!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status === 'Processed') return 'bg-sage-100 text-sage-600 border-sage-200';
    if (status === 'Under Review') return 'bg-nude-200 text-charcoal-700 border-nude-300';
    if (status === 'Additional Information Required') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-taupe-100 text-taupe-600 border-taupe-200';
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-sage-100 via-ivory-200 to-nude-100 border border-ivory-300 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-sage-600 text-xs font-bold mb-2">
                <UserCheck className="w-4 h-4" />
                Patient Portal & Claim Tracking
              </div>
              <h2 className="text-2xl font-bold text-charcoal-800">Welcome, {user?.full_name}</h2>
              <p className="text-xs text-taupe-500 mt-1 max-w-xl">
                Submit claims, track live recorded processing statuses, view attached bills, and ask the AI chatbot whether your hospital bill can be claimed.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('submit-claim')}
              className="px-5 py-3 rounded-2xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Submit New Claim
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Submitted Claims</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{claims.length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Active Reviews</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">
                {claims.filter((c) => c.status === 'Under Review' || c.status === 'Submitted').length}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-ivory-300 shadow-soft">
              <span className="text-xs font-semibold text-taupe-400 uppercase tracking-wider block">Uploaded Documents</span>
              <span className="text-3xl font-extrabold text-charcoal-800 mt-2 block">{documents.length}</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-charcoal-800">My Claim Status Records</h3>
            {claims.length === 0 ? (
              <p className="text-xs text-taupe-400 py-4 text-center">No claims submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-nude-500">{claim.claim_reference}</span>
                        <span className="font-bold text-sm text-charcoal-800">{claim.title}</span>
                      </div>
                      <p className="text-xs text-taupe-400 mt-0.5">{claim.provider_name} • Amount: {claim.amount_claimed}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadgeStyle(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'submit-claim' && (
        <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft max-w-2xl space-y-6">
          <h2 className="text-xl font-bold text-charcoal-800">Submit New Health Insurance Claim</h2>
          
          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Claim Title / Visit Reason *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Outpatient Visit & Lab Work"
                className="w-full p-3 rounded-xl border border-ivory-300 text-sm bg-ivory-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Healthcare Provider / Hospital Name</label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="City Medical Center"
                className="w-full p-3 rounded-xl border border-ivory-300 text-sm bg-ivory-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Total Amount Billed / Claimed</label>
              <input
                type="text"
                value={amountClaimed}
                onChange={(e) => setAmountClaimed(e.target.value)}
                placeholder="$230.00"
                className="w-full p-3 rounded-xl border border-ivory-300 text-sm bg-ivory-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Description & Patient Notes</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional information about the visit or medical bill..."
                className="w-full p-3 rounded-xl border border-ivory-300 text-sm bg-ivory-50"
              />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-charcoal-700 text-white font-bold text-sm shadow-soft">
              Submit Claim to Portal Workflow
            </button>
          </form>
        </div>
      )}

      {activeTab === 'my-claims' && (
        <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft space-y-4">
          <h2 className="text-lg font-bold text-charcoal-800">All Submitted Insurance Claims</h2>
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm text-charcoal-800 block">{claim.claim_reference} - {claim.title}</span>
                  <span className="text-xs text-taupe-400">Provider: {claim.provider_name} | Billed: {claim.amount_claimed}</span>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadgeStyle(claim.status)}`}>
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai-chat' && <ChatWindow />}

      {activeTab === 'insurance' && (
        <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft max-w-xl space-y-4">
          <h2 className="text-lg font-bold text-charcoal-800">My Registered Insurance Policy Details</h2>
          <div className="space-y-3 text-xs text-charcoal-700">
            <div className="p-3 bg-ivory-50 rounded-xl"><strong>Insurance Provider:</strong> {user?.patient_profile?.insurance_provider || 'Blue Cross Blue Shield'}</div>
            <div className="p-3 bg-ivory-50 rounded-xl"><strong>Policy Number:</strong> {user?.patient_profile?.policy_number || 'POL-994821102'}</div>
            <div className="p-3 bg-ivory-50 rounded-xl"><strong>Group Number:</strong> {user?.patient_profile?.group_number || 'GRP-881920'}</div>
            <div className="p-3 bg-ivory-50 rounded-xl"><strong>Coverage Type:</strong> Comprehensive Outpatient & Inpatient</div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-6 bg-white rounded-2xl border border-ivory-300 shadow-soft max-w-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-800">Patient Profile & Account Settings</h2>
              <p className="text-xs text-taupe-400">View and edit your patient contact & insurance details.</p>
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
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Home Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Insurance Provider</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Policy Number</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-xs bg-ivory-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">Group Number</label>
                <input
                  type="text"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
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
              {savingProfile ? 'Saving...' : 'Save Patient Profile'}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};
