# ClaimSure-AI — Full-Stack Healthcare Insurance & Medical Coding Intelligence Platform

**ClaimSure-AI** is a complete, full-stack, AI-powered healthcare insurance portal designed for Doctors, Patients, and Medical Coders.

---

## 🌟 Key Features & Role Portals

### 1. 🩺 Doctor Portal
* **Medical Code Search:** Instant search across ICD-10-CM, CPT, and HCPCS Level II code systems with clinical evidence guidelines and usage notes.
* **CMS-1500 Form Generator:** Interactive Box 1-33 official form editor with real-time field validation, draft saving, and pixel-perfect PDF export via ReportLab.
* **Clinical Encounter Logging:** Record patient notes and automatically extract candidate diagnoses and procedure codes.
* **Doctor AI Assistant:** Persistent RAG chatbot grounded in uploaded discharge summaries and coding guidelines.

### 2. 👤 Patient Portal
* **Claim Submission & Tracking:** Submit medical insurance claims, track live recorded status updates (`Submitted`, `Under Review`, `Processed`, etc.), and receive unique claim reference numbers.
* **AI Document Chatbot:** Ask patient-friendly questions about complex medical bills, policy terms, and clinical summaries with page citations.
* **Insurance Info:** View policy coverage parameters and attached supporting documents.

### 3. 📋 Medical Coder Portal
* **Clinical Document Intelligence:** Upload PDF/DOCX/TXT summaries to extract candidate ICD-10/CPT codes, clinical evidence snippets, and missing documentation flags.
* **Coding Audit & Review:** Review, accept, edit, or reject AI-suggested medical codes.
* **Policy Coverage Assessment:** Associate clinical summaries with insurance policy documents to generate structured preliminary coverage reports (`Potentially Covered`, `Potentially Not Covered`, `Manual Review Required`).
* **Coder AI Intelligence:** Interactive RAG assistant for policy clause verification.

---

## 🛠️ Technology Stack

* **Frontend:** React 18+, TypeScript, Vite, Tailwind CSS (Nude-shaded healthcare palette), Lucide React, Framer Motion, Axios.
* **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, ReportLab (PDF Generation), PyMuPDF (fitz), python-docx.
* **Database:** SQLite (default out-of-the-box local database) / PostgreSQL (configurable via `DATABASE_URL`).
* **Authentication & Security:** JWT Access & Refresh tokens, Argon2id & bcrypt password hashing, role-based authorization.
* **AI & RAG Engine:** Google Gen AI SDK (Gemini) with grounded vector chunking, semantic page citations, and fallback domain heuristic engine.

---

## 🎨 Design System & Color Palette

Built with a nude-shaded healthcare theme:
* **Warm Ivory:** `#F8F5F0` (Main surface background)
* **Soft Beige:** `#E9DFD3` (Cards & containers)
* **Nude Blush:** `#DCC7B8` (Accents & active states)
* **Muted Taupe:** `#A89586` (Subtle borders & icons)
* **Soft Sage:** `#A8B5A0` (Positive status badges)
* **Warm Charcoal:** `#343330` (Primary readable text)

---

## 🚀 Local Setup & Execution Guide (Windows PowerShell)

### Prerequisites
* Node.js v18+ and NPM
* Python 3.10+

---

### Step 1: Backend Setup & Execution

```powershell
# Navigate to the backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI Backend Server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* **Backend API Base URL:** `http://localhost:8000/api`
* **Swagger API Documentation:** `http://localhost:8000/docs`

---

### Step 2: Frontend Setup & Execution

Open a **second PowerShell terminal**:

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite React Dev Server
npm run dev
```

* **Frontend Application URL:** `http://localhost:5173`

---

### Step 3: Run Automated Test Suite

In the **backend PowerShell terminal**:

```powershell
# Run backend pytest suite
.\venv\Scripts\pytest.exe
```

---

## 📁 Repository Structure

```
claimsure-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/           # ChatGPT-style RAG Chat Window
│   │   │   ├── doctor/         # CMS-1500 Health Insurance Form Editor
│   │   │   └── layout/         # Role-aware Sidebar & Navbar
│   │   ├── context/            # AuthContext (JWT & Role state)
│   │   ├── pages/              # Landing, Login, Register, & 3 Role Dashboards
│   │   ├── services/           # Axios API Client with interceptors
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Protected Routing
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind CSS Nude Theme
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── api/                # FastAPI Routers (Auth, Codes, Docs, Chat, Doctor, Patient, Coder)
│   │   ├── core/               # Config, Database, Security, Dependencies
│   │   ├── models/             # SQLAlchemy ORM Models
│   │   ├── schemas/            # Pydantic Schemas
│   │   ├── services/           # AI, RAG, CMS-1500, & Code Services
│   │   └── main.py             # FastAPI App Entrypoint
│   ├── tests/                  # Automated Pytest Test Suite
│   ├── requirements.txt
│   └── .env
├── storage/                    # Local Secure File Storage
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔒 Security & Privacy Notes

* All protected API routes enforce role-based access control.
* Tokens are issued as JWT Access & Refresh pairs with expiration limits.
* Uploaded files are stored securely outside public static web roots.
