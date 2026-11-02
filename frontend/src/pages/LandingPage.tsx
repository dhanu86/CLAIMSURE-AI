import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Stethoscope, UserCheck, FileSearch, ArrowRight, 
  Sparkles, Activity, FileText, CheckCircle2, Cpu, Database,
  Terminal, Zap, ChevronRight, Lock, RefreshCw
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

interface SampleCase {
  disease: string;
  category: string;
  icd10: string;
  cpt: string;
  confidence: number;
  cmsBox: string;
  clinicalNote: string;
}

export const LandingPage: React.FC = () => {
  // Live Interactive Medical Code Simulator States
  const sampleCases: SampleCase[] = [
    {
      disease: 'Type 2 Diabetes with Neuropathy',
      category: 'Endocrinology',
      icd10: 'E11.40',
      cpt: '99214',
      confidence: 98.7,
      cmsBox: 'Box 21A & 24D',
      clinicalNote: '62yo patient presents with tingling in extremities and fasting glucose 185 mg/dL. Chronic T2D with diabetic polyneuropathy confirmed.'
    },
    {
      disease: 'Acute Myocardial Infarction',
      category: 'Cardiology',
      icd10: 'I21.09',
      cpt: '92928',
      confidence: 99.4,
      cmsBox: 'Box 21A & 24E',
      clinicalNote: 'Severe substernal crushing chest pain with ST elevations in leads V1-V4. Emergent coronary angiography with single vessel drug-eluting stent.'
    },
    {
      disease: 'Knee Meniscal Tear Arthroscopy',
      category: 'Orthopedics',
      icd10: 'M23.22',
      cpt: '29881',
      confidence: 97.2,
      cmsBox: 'Box 21B & 24D',
      clinicalNote: 'Patient sustained twisting injury during sport. Right knee MRI demonstrates complex tear of the posterior horn medial meniscus.'
    },
    {
      disease: 'Hypertensive Heart Disease',
      category: 'Cardiovascular',
      icd10: 'I11.9',
      cpt: '93000',
      confidence: 96.8,
      cmsBox: 'Box 21A & 24A',
      clinicalNote: 'Routine checkup reveals BP 162/95 mmHg with trace lower extremity edema. Left ventricular hypertrophy noted on routine 12-lead ECG.'
    }
  ];

  const [activeCase, setActiveCase] = useState<SampleCase>(sampleCases[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = (sample: SampleCase) => {
    setIsSimulating(true);
    setActiveCase(sample);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans relative">
      <Navbar />

      {/* Hero Section with Clinical Cockpit */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating Ambient Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-teal-200/80 shadow-soft text-charcoal-800 text-xs font-semibold mb-6 backdrop-blur-md hover:border-teal-400 transition-all">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
          </span>
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Next-Gen Agentic RAG Clinical Intelligence & CMS-1500 Defense</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12] max-w-5xl mx-auto">
          Automated Medical Coding &amp; <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-taupe-700 to-charcoal-800">
            Insurance Claim Integrity
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-taupe-600 max-w-3xl mx-auto font-normal leading-relaxed">
          ClaimSure-AI harnesses Retrieval-Augmented Generation (RAG) and LLM clinical inference to automatically discover ICD-10 &amp; CPT codes, generate official NUCC CMS-1500 forms, audit policy coverage, and prevent rejections.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-charcoal-800 text-white font-bold text-base hover:bg-charcoal-950 transition-all shadow-soft-lg hover:scale-105 flex items-center justify-center gap-3 group"
          >
            Launch ClaimSure Cockpit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/90 border border-ivory-300 text-charcoal-700 font-bold text-base hover:bg-white hover:border-teal-300 transition-all shadow-soft flex items-center justify-center gap-2 backdrop-blur-md"
          >
            Sign In to Existing Portal
          </Link>
        </div>

        {/* Live Interactive Medical Code Simulator Box */}
        <div className="mt-14 max-w-5xl mx-auto text-left">
          <div className="rounded-3xl glass-clinical p-6 sm:p-8 shadow-xl border border-teal-200/50 relative overflow-hidden">
            {/* Header bar of Simulator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-700">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                    Live Clinical Inference Engine
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                      DEMO BENCHMARK
                    </span>
                  </h3>
                  <p className="text-xs text-taupe-500">
                    Test how our RAG pipeline extracts diagnosis &amp; procedural billing codes from clinical narratives
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200 self-start sm:self-auto">
                <Activity className="w-3.5 h-3.5 text-teal-600 vital-heartbeat" />
                <span>Zero Hallucination Grounding</span>
              </div>
            </div>

            {/* Quick-Pick Case Buttons */}
            <div className="py-4">
              <span className="text-xs font-bold text-taupe-400 uppercase tracking-wider block mb-2.5">
                Select Clinical Condition Scenario:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleCases.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulate(s)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                      activeCase.disease === s.disease
                        ? 'bg-teal-600 text-white shadow-soft scale-[1.02]'
                        : 'bg-white/80 text-charcoal-700 border border-ivory-300 hover:border-teal-300 hover:bg-white'
                    }`}
                  >
                    <span>{s.disease}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activeCase.disease === s.disease ? 'bg-teal-700 text-teal-100' : 'bg-ivory-200 text-charcoal-600'}`}>
                      {s.icd10}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Clinical Note & Extraction Result Grid */}
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Clinical Narrative */}
              <div className="lg:col-span-7 bg-white/90 rounded-2xl p-4 sm:p-5 border border-ivory-300 space-y-3">
                <div className="flex items-center justify-between text-xs text-taupe-400 font-semibold border-b border-ivory-200 pb-2">
                  <span className="flex items-center gap-1.5 text-charcoal-700 font-bold">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Doctor Clinical Encounter Summary
                  </span>
                  <span className="font-mono text-[10px] text-teal-700">{activeCase.category}</span>
                </div>
                <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed font-sans bg-ivory-50/60 p-3.5 rounded-xl border border-ivory-200 italic">
                  "{activeCase.clinicalNote}"
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-taupe-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    NUCC 1500 Standard
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    ICD-10-CM 2026 Ready
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    AMA CPT Verified
                  </span>
                </div>
              </div>

              {/* Right Column: AI Extraction Output */}
              <div className="lg:col-span-5 bg-charcoal-900 text-white rounded-2xl p-5 border border-charcoal-800 space-y-4 shadow-inner relative">
                <div className="flex items-center justify-between border-b border-charcoal-800 pb-2.5">
                  <span className="text-xs font-mono font-bold text-teal-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                    Extracted Billing Codes
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">
                    Confidence: {activeCase.confidence}%
                  </span>
                </div>

                <div className={`space-y-3 transition-opacity duration-300 ${isSimulating ? 'opacity-30' : 'opacity-100'}`}>
                  {/* ICD-10 Diagnosis */}
                  <div className="bg-charcoal-800/80 p-3 rounded-xl border border-charcoal-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-taupe-400 block uppercase">Primary Diagnosis (ICD-10-CM)</span>
                      <span className="font-mono text-base font-bold text-teal-300">{activeCase.icd10}</span>
                      <span className="text-[11px] text-charcoal-300 block truncate max-w-[180px] sm:max-w-xs">{activeCase.disease}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 bg-charcoal-700 rounded text-charcoal-300">
                      CMS Box 21
                    </span>
                  </div>

                  {/* CPT Procedure */}
                  <div className="bg-charcoal-800/80 p-3 rounded-xl border border-charcoal-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-taupe-400 block uppercase">Associated Procedure (CPT/HCPCS)</span>
                      <span className="font-mono text-base font-bold text-amber-300">{activeCase.cpt}</span>
                      <span className="text-[11px] text-charcoal-300 block">Outpatient Evaluation &amp; Management</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 bg-charcoal-700 rounded text-charcoal-300">
                      CMS Box 24D
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-charcoal-400">
                  <span>Target CMS Box: <strong className="text-white">{activeCase.cmsBox}</strong></span>
                  <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 hover:underline">
                    Generate Full CMS-1500 <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Experience Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full border border-teal-200">
            Tailored Role Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 mt-3">
            Designed for Doctors, Patients &amp; Coders
          </h2>
          <p className="text-sm sm:text-base text-taupe-500 mt-2">
            One unified healthcare platform with three specialized portals addressing distinct operational bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Doctor Portal Card */}
          <div className="rounded-3xl glass-card p-8 border border-teal-200/40 shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-teal-600/10 text-teal-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
              <Stethoscope className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Provider Suite
            </span>
            <h3 className="text-xl font-bold text-charcoal-900 mt-3">Doctor Portal</h3>
            <p className="text-xs sm:text-sm text-taupe-500 mt-2 leading-relaxed">
              Instantly discover accurate ICD-10 &amp; CPT codes using LLM inference and auto-populate standard NUCC CMS-1500 (HCFA) claim forms with one-click official PDF export.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-charcoal-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Boxes 1–33 NUCC Compliance Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Patient encounter &amp; diagnosis recorder</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>AI Clinical Assistant for billing guidance</span>
              </li>
            </ul>
            <Link
              to="/login"
              className="mt-6 w-full py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              Access Doctor Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Patient Portal Card */}
          <div className="rounded-3xl glass-card p-8 border border-sage-200/50 shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sage-500/5 rounded-bl-full pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-sage-500/10 text-sage-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sage-600 group-hover:text-white transition-all shadow-xs">
              <UserCheck className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
              Beneficiary Suite
            </span>
            <h3 className="text-xl font-bold text-charcoal-900 mt-3">Patient Portal</h3>
            <p className="text-xs sm:text-sm text-taupe-500 mt-2 leading-relaxed">
              Submit claims transparently, inspect real-time claim adjudication milestones, store clinical documents securely, and ask AI about complex deductible and copay rules.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-charcoal-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                <span>Real-time claim status tracking lifecycle</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                <span>Direct medical bill &amp; document uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                <span>AI Plain-English Insurance Policy explainer</span>
              </li>
            </ul>
            <Link
              to="/login"
              className="mt-6 w-full py-2.5 rounded-xl bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 transition-colors flex items-center justify-center gap-2"
            >
              Access Patient Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Medical Coder Portal Card */}
          <div className="rounded-3xl glass-card p-8 border border-nude-300/60 shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-nude-500/10 rounded-bl-full pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-nude-300 text-charcoal-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-charcoal-800 group-hover:text-white transition-all shadow-xs">
              <FileSearch className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700 bg-nude-200 px-2.5 py-1 rounded-full border border-nude-300">
              Audit &amp; Compliance Suite
            </span>
            <h3 className="text-xl font-bold text-charcoal-900 mt-3">Medical Coder Portal</h3>
            <p className="text-xs sm:text-sm text-taupe-500 mt-2 leading-relaxed">
              Upload discharge summaries, review AI-suggested ICD-10/CPT codes with clinical evidence snippets, and execute comprehensive insurance policy coverage assessments.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-charcoal-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-charcoal-700 shrink-0" />
                <span>Document chunking &amp; evidence extraction</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-charcoal-700 shrink-0" />
                <span>Human-In-The-Loop code validation audit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-charcoal-700 shrink-0" />
                <span>Pre-submission denial risk analysis</span>
              </li>
            </ul>
            <Link
              to="/login"
              className="mt-6 w-full py-2.5 rounded-xl bg-charcoal-800 text-white text-xs font-bold hover:bg-charcoal-900 transition-colors flex items-center justify-center gap-2"
            >
              Access Coder Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Official CMS-1500 Form Architecture Spotlight */}
      <section className="py-16 bg-white/70 backdrop-blur-md border-y border-ivory-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Official NUCC Standard
              </span>
              <h2 className="text-3xl font-extrabold text-charcoal-900 leading-tight">
                Turn Clinical Encounters into Official CMS-1500 Claim Forms
              </h2>
              <p className="text-sm text-taupe-500 leading-relaxed">
                Health insurance claims in the United States must strictly adhere to the National Uniform Claim Committee (NUCC) 1500 standard. ClaimSure-AI eliminates manual typing errors by synthesizing diagnosis codes, procedure codes, NPI numbers, and patient demographics directly into standardized claims.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                    B1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-800">Box 1–13: Patient &amp; Insured Demographics</h4>
                    <p className="text-[11px] text-taupe-400">Payer identification, Medicare/Medicaid/TRICARE/Commercial selection, and subscriber ID.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                    B21
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-800">Box 21: Diagnosis ICD-10-CM Pointers (A–L)</h4>
                    <p className="text-[11px] text-taupe-400">Strictly mapped primary and secondary diagnoses without decimal punctuation for OCR scanners.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-600/10 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                    B24
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-800">Box 24A–24J: Service Lines &amp; CPT Codes</h4>
                    <p className="text-[11px] text-taupe-400">Dates of service, Place of Service (POS 11/21/22), CPT modifiers, charge amounts, and diagnosis pointers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CMS-1500 Visual Form Replica */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-200 shadow-xl relative overflow-hidden font-mono">
                {/* Red NUCC Header Bar */}
                <div className="border-b-2 border-red-300 pb-3 mb-4 flex justify-between items-center text-red-700">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    HEALTH INSURANCE CLAIM FORM (CMS-1500 / 02-12)
                  </div>
                  <div className="text-[9px] px-2 py-0.5 rounded bg-red-100 font-bold">
                    APPROVED OMB-0938-1197
                  </div>
                </div>

                {/* Form Boxes Preview */}
                <div className="space-y-3 text-[11px] text-charcoal-800">
                  {/* Row 1 */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6 p-2 rounded border border-red-200 bg-red-50/20">
                      <span className="text-[9px] text-red-600 block">1. MEDICARE / MEDICAID / GROUP / OTHER</span>
                      <span className="font-bold text-charcoal-900">[X] COMMERCIAL / GROUP HEALTH PLAN</span>
                    </div>
                    <div className="col-span-12 sm:col-span-6 p-2 rounded border border-red-200 bg-red-50/20">
                      <span className="text-[9px] text-red-600 block">1a. INSURED'S I.D. NUMBER</span>
                      <span className="font-bold text-charcoal-900">CS-994827104-01</span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-7 p-2 rounded border border-red-200 bg-red-50/20">
                      <span className="text-[9px] text-red-600 block">2. PATIENT'S NAME (Last, First, M.I.)</span>
                      <span className="font-bold text-charcoal-900">REYNOLDS, ELEANOR M.</span>
                    </div>
                    <div className="col-span-5 p-2 rounded border border-red-200 bg-red-50/20">
                      <span className="text-[9px] text-red-600 block">3. PATIENT'S BIRTH DATE / SEX</span>
                      <span className="font-bold text-charcoal-900">04/18/1974 | FEMALE</span>
                    </div>
                  </div>

                  {/* Row 3: Diagnosis Box 21 */}
                  <div className="p-2.5 rounded border border-red-300 bg-teal-50/40 relative">
                    <span className="text-[9px] text-red-600 block font-bold">
                      21. DIAGNOSIS OR NATURE OF ILLNESS OR INJURY (ICD-10-CM Rel. Code Pointer)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                      <div className="p-1 rounded bg-white border border-teal-200 text-teal-800 font-bold">
                        A. E1140 (Type 2 Diab.)
                      </div>
                      <div className="p-1 rounded bg-white border border-teal-200 text-teal-800 font-bold">
                        B. I10 (Ess. HTN)
                      </div>
                      <div className="p-1 rounded bg-white border border-teal-200 text-teal-800 font-bold">
                        C. E785 (Hyperlipid.)
                      </div>
                      <div className="p-1 rounded bg-white border border-teal-200 text-teal-800 font-bold">
                        D. G629 (Neuropathy)
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Service Lines Box 24 */}
                  <div className="p-2.5 rounded border border-red-300 bg-amber-50/30">
                    <span className="text-[9px] text-red-600 block font-bold">
                      24. SERVICE LINES (Date of Service | POS | CPT/HCPCS | Diag Pointer | Charges)
                    </span>
                    <div className="mt-1 space-y-1 text-[10px]">
                      <div className="p-1.5 rounded bg-white border border-amber-200 flex justify-between items-center">
                        <span>10/24/2026 | POS 11 (Office)</span>
                        <span className="font-bold text-amber-900">CPT 99214 (Level 4 Office Visit)</span>
                        <span>Pointer: A, B</span>
                        <span className="font-bold">$215.00</span>
                      </div>
                      <div className="p-1.5 rounded bg-white border border-amber-200 flex justify-between items-center">
                        <span>10/24/2026 | POS 11 (Office)</span>
                        <span className="font-bold text-amber-900">CPT 82947 (Glucose Test)</span>
                        <span>Pointer: A</span>
                        <span className="font-bold">$45.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Box 31 & 33 */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6 p-2 rounded border border-red-200 bg-red-50/20">
                      <span className="text-[9px] text-red-600 block">31. SIGNATURE OF PHYSICIAN</span>
                      <span className="font-bold text-teal-800 text-[10px] italic">Electronically Certified by Dr. Marcus Shaw, MD</span>
                    </div>
                    <div className="col-span-6 p-2 rounded border border-red-200 bg-red-50/20">
                      <span className="text-[9px] text-red-600 block">33. BILLING PROVIDER INFO &amp; NPI</span>
                      <span className="font-bold text-charcoal-900 text-[10px]">Metro Health Clinic | NPI: 1487293019</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-red-200 flex justify-between items-center text-xs">
                  <span className="text-taupe-500 text-[11px] font-sans">
                    Auto-generated from clinical encounters with zero transcription lag
                  </span>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-sans font-bold text-xs hover:bg-teal-700 transition-colors flex items-center gap-1"
                  >
                    Generate Your Claim <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAG & Agentic MLOps Technical Architecture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 bg-ivory-200 px-3 py-1 rounded-full border border-ivory-300">
            MLOps &amp; Retrieval-Augmented Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 mt-3">
            Engineered for Production Rigor
          </h2>
          <p className="text-sm text-taupe-500 mt-2">
            Automated CI/CD testing, PostgreSQL persistence, and grounded vector embeddings prevent costly claim rejections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-ivory-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">LLM Medical Code Search</h3>
            <p className="text-xs text-taupe-500 leading-relaxed">
              Synthesizes clinical queries against standard ICD-10-CM and CPT codebooks with diagnostic definitions.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-ivory-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">Grounded RAG Pipeline</h3>
            <p className="text-xs text-taupe-500 leading-relaxed">
              Chunks discharge summaries and retrieves verifiable citations to guarantee hallucination-free coding.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-ivory-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">MLOps CI/CD Pipeline</h3>
            <p className="text-xs text-taupe-500 leading-relaxed">
              GitHub Actions automated workflows run comprehensive test suites on every pull request before cloud deployment.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-ivory-300 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal-900">Zero-Trust Role Security</h3>
            <p className="text-xs text-taupe-500 leading-relaxed">
              JWT token authentication and BCrypt password encryption enforce strict role-based separation of medical data.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-charcoal-900 text-white py-12 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-soft">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">ClaimSure<span className="text-teal-400">-AI</span></span>
              <span className="block text-[10px] text-charcoal-400 uppercase tracking-wider">Healthcare Intelligence Platform</span>
            </div>
          </div>

          <p className="text-xs text-charcoal-400 text-center md:text-left">
            © 2026 ClaimSure-AI. Built for Doctor, Patient, and Coder collaboration. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs text-charcoal-300">
            <Link to="/login" className="hover:text-teal-400 transition-colors">Doctor Portal</Link>
            <Link to="/login" className="hover:text-teal-400 transition-colors">Patient Portal</Link>
            <Link to="/login" className="hover:text-teal-400 transition-colors">Coder Audit</Link>
            <Link to="/register" className="hover:text-teal-400 transition-colors">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
