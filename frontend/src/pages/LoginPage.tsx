import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

const formatApiError = (err: any): string => {
  if (!err) return 'Invalid email or password.';
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
  return err.message || 'Invalid email or password.';
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const role: UserRole = await login(email, password);
      if (role === 'Doctor') navigate('/doctor/dashboard');
      else if (role === 'Patient') navigate('/patient/dashboard');
      else if (role === 'Medical Coder') navigate('/coder/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-ivory-300 p-8 shadow-soft-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nude-300 to-taupe-400 flex items-center justify-center text-charcoal-800 shadow-soft">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-charcoal-800">ClaimSure<span className="text-nude-500">-AI</span></span>
          </Link>
          <h2 className="text-2xl font-bold text-charcoal-800">Sign In to Your Portal</h2>
          <p className="text-xs text-taupe-400">Access your role-specific healthcare dashboard</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-taupe-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@hospital.org"
                className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-taupe-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-taupe-400 pt-2 border-t border-ivory-200">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-charcoal-800 hover:underline">
            Register New Account
          </Link>
        </div>
      </div>
    </div>
  );
};
