import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Stethoscope, UserCheck, FileSearch, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

const formatApiError = (err: any): string => {
  if (!err) return 'Registration failed. Please check inputs.';
  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: any) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join(' | ');
    }
  }
  if (err.message === 'Network Error' || !err.response) {
    return 'Unable to connect to backend server. Please verify backend is running on http://localhost:8000';
  }
  return err.message || 'Registration failed. Please check inputs.';
};

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('Patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [insuranceProvider, setInsuranceProvider] = useState('Blue Cross Blue Shield');
  const [organization, setOrganization] = useState('Apex Health Systems');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const payload = {
      role,
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      phone_number: phoneNumber.trim(),
      specialty,
      insurance_provider: insuranceProvider,
      organization
    };

    try {
      const assignedRole: UserRole = await register(payload);
      if (assignedRole === 'Doctor') navigate('/doctor/dashboard');
      else if (assignedRole === 'Patient') navigate('/patient/dashboard');
      else if (assignedRole === 'Medical Coder') navigate('/coder/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyRegistered = error && error.toLowerCase().includes('already registered');

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-ivory-300 p-8 shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nude-300 to-taupe-400 flex items-center justify-center text-charcoal-800 shadow-soft">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-charcoal-800">ClaimSure<span className="text-nude-500">-AI</span></span>
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-800">Create Your Portal Account</h2>
          <p className="text-xs text-taupe-400">Select your role to access customized healthcare AI features</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setRole('Doctor')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              role === 'Doctor'
                ? 'bg-nude-200 border-nude-400 text-charcoal-800 font-bold shadow-soft'
                : 'bg-ivory-50 border-ivory-200 text-taupe-500 hover:bg-ivory-100'
            }`}
          >
            <Stethoscope className="w-5 h-5" />
            <span className="text-xs">Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('Patient')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              role === 'Patient'
                ? 'bg-sage-100 border-sage-300 text-sage-600 font-bold shadow-soft'
                : 'bg-ivory-50 border-ivory-200 text-taupe-500 hover:bg-ivory-100'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="text-xs">Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('Medical Coder')}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              role === 'Medical Coder'
                ? 'bg-taupe-100 border-taupe-300 text-taupe-500 font-bold shadow-soft'
                : 'bg-ivory-50 border-ivory-200 text-taupe-500 hover:bg-ivory-100'
            }`}
          >
            <FileSearch className="w-5 h-5" />
            <span className="text-xs">Medical Coder</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {isAlreadyRegistered && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-red-200">
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { email } })}
                  className="px-3 py-1.5 rounded-lg bg-charcoal-700 text-white font-bold hover:bg-charcoal-900 transition-colors"
                >
                  Sign In With This Email →
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { email, resetMode: true } })}
                  className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-red-800 font-bold hover:bg-red-50 transition-colors"
                >
                  Reset / Set New Password →
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Marcus Vance"
                className="w-full px-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@hospital.org"
                className="w-full px-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-4 pr-10 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-taupe-400 hover:text-charcoal-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">
                Phone Number <span className="text-taupe-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
          </div>

          {role === 'Doctor' && (
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Medical Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Internal Medicine / Cardiology"
                className="w-full px-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
          )}

          {role === 'Patient' && (
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Primary Insurance Provider</label>
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="Blue Cross Blue Shield / United Health"
                className="w-full px-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
          )}

          {role === 'Medical Coder' && (
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Organization / Employer</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Apex Medical Systems"
                className="w-full px-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Registering...' : `Create ${role} Account`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-taupe-400 pt-2 border-t border-ivory-200">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-charcoal-800 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
