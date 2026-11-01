import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';
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
  const location = useLocation();
  const initialEmail = (location.state as any)?.email || '';
  const initialReset = (location.state as any)?.resetMode || false;

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(initialReset);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const role: UserRole = await login(email.trim(), password);
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

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const role: UserRole = await resetPassword(email.trim(), newPassword);
      setSuccessMsg('Password updated successfully! Logging you in...');
      setTimeout(() => {
        if (role === 'Doctor') navigate('/doctor/dashboard');
        else if (role === 'Patient') navigate('/patient/dashboard');
        else if (role === 'Medical Coder') navigate('/coder/dashboard');
        else navigate('/');
      }, 800);
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
          <h2 className="text-2xl font-bold text-charcoal-800">
            {isResetMode ? 'Set New Password' : 'Sign In to Your Portal'}
          </h2>
          <p className="text-xs text-taupe-400">
            {isResetMode
              ? 'Enter your email address and your new desired password'
              : 'Access your role-specific healthcare dashboard'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('incorrect password') && !isResetMode && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsResetMode(true);
                }}
                className="text-left font-bold text-nude-600 hover:underline pl-6"
              >
                Click here to reset your password with a new one →
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isResetMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-taupe-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@hospital.org"
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-charcoal-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setIsResetMode(true);
                  }}
                  className="text-xs font-semibold text-taupe-500 hover:text-charcoal-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-taupe-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-taupe-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@hospital.org"
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">New Desired Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-taupe-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  className="w-full pl-9 pr-10 py-3 text-sm rounded-xl border border-ivory-300 focus:outline-none focus:ring-2 focus:ring-nude-300 bg-ivory-50"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-charcoal-700 text-white font-bold text-sm hover:bg-charcoal-900 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save Password & Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setIsResetMode(false);
              }}
              className="w-full py-2.5 rounded-xl border border-ivory-300 text-charcoal-700 text-xs font-bold hover:bg-ivory-50 transition-all text-center block"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

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
