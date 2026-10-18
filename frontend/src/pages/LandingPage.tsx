import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Stethoscope, UserCheck, FileSearch, ArrowRight, 
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col font-sans">
      <Navbar />

      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nude-200/50 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nude-200 text-charcoal-700 text-xs font-bold mb-8 border border-nude-300 shadow-soft">
          <Sparkles className="w-4 h-4 text-taupe-500" />
          Document-Grounded Healthcare Insurance & Medical Coding Intelligence
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-charcoal-800 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          AI-Powered Medical Coding & Insurance Claim Processing
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-taupe-500 max-w-2xl mx-auto font-normal leading-relaxed">
          ClaimSure-AI streamlines ICD-10/CPT medical code discovery, automates CMS-1500 claim form generation for doctors, empowers patient document clarity, and accelerates coder coverage audits.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-charcoal-700 text-white font-bold text-base hover:bg-charcoal-900 transition-all shadow-soft-lg hover:scale-105 flex items-center justify-center gap-3"
          >
            Launch ClaimSure Portal
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-base hover:bg-ivory-50 transition-all shadow-soft flex items-center justify-center gap-2"
          >
            Sign In to Account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-white/80 border border-ivory-300 shadow-soft">
            <Stethoscope className="w-8 h-8 text-taupe-500 mb-3" />
            <h3 className="font-bold text-charcoal-800 text-base">Doctor Portal</h3>
            <p className="text-xs text-taupe-400 mt-1">LLM medical code discovery & official CMS-1500 PDF claim form generator.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/80 border border-ivory-300 shadow-soft">
            <UserCheck className="w-8 h-8 text-sage-500 mb-3" />
            <h3 className="font-bold text-charcoal-800 text-base">Patient Portal</h3>
            <p className="text-xs text-taupe-400 mt-1">Claim submission, live recorded status tracking & insurance coverage AI auditor.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/80 border border-ivory-300 shadow-soft">
            <FileSearch className="w-8 h-8 text-nude-500 mb-3" />
            <h3 className="font-bold text-charcoal-800 text-base">Medical Coder Portal</h3>
            <p className="text-xs text-taupe-400 mt-1">Clinical document upload & extraction, code review & coverage assessments.</p>
          </div>
        </div>
      </section>

      <section id="workflow" className="py-20 bg-white border-y border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-charcoal-800">Addressing the Healthcare Insurance Challenge</h2>
            <p className="text-sm text-taupe-400 mt-3">
              Complex coding rules, incomplete clinical summaries, and ambiguous policy terms cause claim rejections. ClaimSure-AI bridges this gap with document-grounded AI intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-ivory-50 border border-ivory-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-nude-200 text-charcoal-800 flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="font-bold text-lg text-charcoal-800">Document Ingestion & Chunking</h3>
              <p className="text-xs text-taupe-400 leading-relaxed">
                Hospital discharge summaries, lab reports, and policy PDFs are parsed with page numbers preserved.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-ivory-50 border border-ivory-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-nude-200 text-charcoal-800 flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="font-bold text-lg text-charcoal-800">Grounded Code & Policy Search</h3>
              <p className="text-xs text-taupe-400 leading-relaxed">
                ICD-10-CM and CPT codes are matched against verified clinical evidence and exact policy clauses.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-ivory-50 border border-ivory-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-nude-200 text-charcoal-800 flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="font-bold text-lg text-charcoal-800">Human-In-The-Loop Validation</h3>
              <p className="text-xs text-taupe-400 leading-relaxed">
                Doctors validate CMS-1500 fields and coders review suggestions before saving to PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto bg-charcoal-800 text-white py-12 border-t border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nude-300 text-charcoal-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">ClaimSure-AI</span>
          </div>

          <p className="text-xs text-charcoal-300 text-center md:text-left">
            © 2026 ClaimSure-AI. Full-Stack Healthcare Insurance & Coding Platform. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-charcoal-300">
            <Link to="/login" className="hover:text-white">Doctor Sign In</Link>
            <Link to="/login" className="hover:text-white">Patient Portal</Link>
            <Link to="/login" className="hover:text-white">Medical Coder Audit</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
