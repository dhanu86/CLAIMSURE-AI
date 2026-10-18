import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Stethoscope, UserCheck, FileText, Search, 
  MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight,
  PlusCircle, FolderOpen, Award, Layers, Bell, CheckCircle2, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsList = [
    { id: 1, time: 'Just now', title: 'LLM Medical Code Search Active', desc: 'LLM search engine ready for disease & CPT queries.' },
    { id: 2, time: '2 mins ago', title: 'CMS-1500 PDF Generator Ready', desc: 'Box 1-33 NUCC standard validation active.' },
    { id: 3, time: '5 mins ago', title: 'PostgreSQL & RAG Engine Connected', desc: 'Grounded document citations operational.' }
  ];

  const role = user?.role || 'Doctor';

  const getSidebarItems = (): SidebarItem[] => {
    if (role === 'Doctor') {
      return [
        { id: 'overview', label: 'Overview', icon: <Layers className="w-5 h-5" /> },
        { id: 'code-search', label: 'LLM Medical Code Search', icon: <Search className="w-5 h-5" /> },
        { id: 'cms1500', label: 'CMS-1500 Claim Forms', icon: <FileText className="w-5 h-5" /> },
        { id: 'encounters', label: 'Patient Encounters', icon: <Stethoscope className="w-5 h-5" /> },
        { id: 'ai-chat', label: 'AI Clinical Assistant', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'documents', label: 'Clinical Documents', icon: <FolderOpen className="w-5 h-5" /> },
        { id: 'profile', label: 'Doctor Profile', icon: <UserCheck className="w-5 h-5" /> },
      ];
    } else if (role === 'Patient') {
      return [
        { id: 'overview', label: 'Overview', icon: <Layers className="w-5 h-5" /> },
        { id: 'my-claims', label: 'My Claims & Status', icon: <FileText className="w-5 h-5" /> },
        { id: 'submit-claim', label: 'Submit New Claim', icon: <PlusCircle className="w-5 h-5" /> },
        { id: 'documents', label: 'My Medical Docs', icon: <FolderOpen className="w-5 h-5" /> },
        { id: 'ai-chat', label: 'AI Claim Coverage Chat', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'insurance', label: 'Insurance Info', icon: <ShieldCheck className="w-5 h-5" /> },
        { id: 'profile', label: 'Patient Profile', icon: <UserCheck className="w-5 h-5" /> },
      ];
    } else {
      return [
        { id: 'overview', label: 'Overview', icon: <Layers className="w-5 h-5" /> },
        { id: 'upload-analysis', label: 'Upload & Analysis', icon: <FolderOpen className="w-5 h-5" /> },
        { id: 'code-review', label: 'Coding Audit & Review', icon: <Award className="w-5 h-5" /> },
        { id: 'coverage-assessment', label: 'Coverage Assessment', icon: <ShieldCheck className="w-5 h-5" /> },
        { id: 'ai-chat', label: 'AI Coding Intelligence', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'profile', label: 'Coder Profile', icon: <UserCheck className="w-5 h-5" /> },
      ];
    }
  };

  const navItems = getSidebarItems();

  const getRoleBadgeStyle = () => {
    if (role === 'Doctor') return 'bg-nude-200 text-charcoal-700 border-nude-300';
    if (role === 'Patient') return 'bg-sage-100 text-sage-500 border-sage-200';
    return 'bg-taupe-100 text-taupe-500 border-taupe-200';
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col md:flex-row font-sans">
      <aside className={`bg-white border-r border-ivory-300 transition-all duration-300 flex flex-col justify-between z-20 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div>
          <div className="p-4 border-b border-ivory-200 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nude-300 to-taupe-400 flex items-center justify-center text-charcoal-800 shadow-soft shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              {!collapsed && (
                <div>
                  <span className="font-bold text-lg text-charcoal-700 block leading-tight">ClaimSure<span className="text-nude-500">-AI</span></span>
                  <span className="text-[10px] font-semibold text-taupe-400 uppercase tracking-wider">{role} Portal</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-charcoal-300 hover:bg-ivory-100 hover:text-charcoal-700 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {!collapsed && (
            <div className="p-4 m-3 rounded-2xl bg-ivory-50 border border-ivory-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-nude-300 text-charcoal-800 flex items-center justify-center font-bold text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <span className="font-semibold text-sm text-charcoal-800 block truncate">{user?.full_name}</span>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${getRoleBadgeStyle()}`}>
                    {role}
                  </span>
                </div>
              </div>
            </div>
          )}

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-nude-300 text-charcoal-800 font-semibold shadow-soft'
                      : 'text-charcoal-500 hover:bg-ivory-50 hover:text-charcoal-800'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={active ? 'text-charcoal-800' : 'text-taupe-400'}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-ivory-200 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-charcoal-500 hover:bg-ivory-50 hover:text-charcoal-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-taupe-400" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-ivory-300 px-6 flex items-center justify-between z-10 relative">
          <div>
            <h1 className="text-lg font-bold text-charcoal-800 capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-xs text-taupe-400">ClaimSure-AI Grounded Healthcare Intelligence System</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-50 text-sage-500 border border-sage-200 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-sage-400" />
              PostgreSQL & RAG Engine Connected
            </div>
            
            {/* Functional Notification Bell Icon */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-charcoal-400 hover:bg-ivory-100 hover:text-charcoal-700 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="w-2.5 h-2.5 rounded-full bg-nude-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-ivory-300 shadow-soft-lg z-50 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-ivory-200 pb-2">
                    <span className="font-bold text-xs text-charcoal-800 uppercase tracking-wider">System Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-taupe-400 hover:text-charcoal-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notificationsList.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200 text-xs space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-charcoal-800">{n.title}</span>
                          <span className="text-[10px] text-taupe-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-taupe-500">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-ivory-100">
          {children}
        </main>
      </div>
    </div>
  );
};
