import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nude-400 to-taupe-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl text-charcoal-700 tracking-tight">ClaimSure<span className="text-nude-500">-AI</span></span>
              <span className="block text-[10px] font-semibold text-taupe-400 uppercase tracking-widest">Healthcare Intelligence</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(getDashboardRoute())}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-taupe-400 text-white hover:bg-taupe-500 transition-colors shadow-soft flex items-center gap-2"
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
