import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (user?.role === 'Doctor') return '/doctor/dashboard';
    if (user?.role === 'Patient') return '/patient/dashboard';
    if (user?.role === 'Medical Coder') return '/coder/dashboard';
    return '/login';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-ivory-300 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-taupe-600 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl text-charcoal-700 tracking-tight">ClaimSure<span className="text-teal-600">-AI</span></span>
              <span className="block text-[10px] font-semibold text-taupe-400 uppercase tracking-widest flex items-center gap-1">
                Healthcare Intelligence
              </span>
            </div>
          </Link>

          {/* Live Clinical Telemetry Status Badge */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-50/80 border border-teal-200/60 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
            </span>
            <HeartPulse className="w-4 h-4 text-teal-600 vital-heartbeat" />
            <span className="text-xs font-semibold text-teal-800">
              Clinical Telemetry: <span className="font-bold text-teal-600">72 BPM Active</span>
            </span>
            <span className="text-teal-300">|</span>
            <span className="text-[11px] font-medium text-teal-700">RAG Engine Online</span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(getDashboardRoute())}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-soft flex items-center gap-2 hover:scale-[1.02]"
                >
                  Dashboard ({user.role})
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm font-medium text-charcoal-500 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-charcoal-700 hover:text-teal-700 hover:bg-ivory-100/70 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-charcoal-800 text-white hover:bg-charcoal-900 shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-1.5 hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
