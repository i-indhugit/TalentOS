# TalentOS — The Operating System for Intelligent Hiring

TalentOS is a startup-grade SaaS recruiting platform designed to transform traditional resume screening into intelligent, contextual candidate matching. By leveraging local NLP models, semantic vector embeddings, and an interactive recruiter assistant, TalentOS helps scaling teams surface top-tier candidates, analyze skill gaps, and generate tailored technical assessments.

---

## Key Feature Modules

1. **Talent Command Center (Dashboard)**: Executive control board tracking candidate pipeline counts, active open roles, average match scores, workflow funnels, recent upload histories, and urgent AI match alerts.
2. **Talent Intake**: Interactive drag-and-drop workspace supporting bulk PDF/Word document resume uploads with simulated status tracking and copy-paste text fields for quick validations.
3. **Resume Intelligence**: Deep structural analysis yielding candidate details (Alma mater, contact info, total experience, technical capabilities) along with parsing confidence bounds.
4. **Job Intelligence & Requirement Parsing**: Custom role creations that automatically parse experience limits, geographic hubs, and target tech skills into active hiring profiles.
5. **Weighted Semantic Matching**: Compares candidates contextually against job profiles using cosine similarity vectors. Scores are aggregated as:
   * **Skills Alignment**: 50%
   * **Experience Match**: 25%
   * **Education Credentials**: 15%
   * **Projects Scope**: 10%
6. **Talent Radar Mapping**: Interactive polar charts mapping candidate DNA averages (Technical, Leadership, Continuous Learning, Communication, System Innovation).
7. **Recruiter Copilot**: Conversational ChatGPT-style workspace providing SQL-search, summary queries, and custom assessment drafts.
8. **Interview Intelligence**: Printable candidate assessment guides segmented by technical, behavioral, and scenario categories, with Easy/Medium/Hard difficulty filters.

---

## Tech Stack Overview

### Backend Service
* **Framework**: FastAPI (Python 3.14)
* **Web Server**: Uvicorn
* **Database**: SQLite (SQLAlchemy ORM)
* **NLP & ML Models**:
  * `sentence-transformers` (Pre-loading `all-MiniLM-L6-v2` for semantic vectors)
  * `spaCy` (Heuristics contact extraction & tech skills filtering)
  * `pypdf` & `python-docx` (Word/PDF document parsers)
* **Security**: PyJWT validation & bcrypt password hashing

### Frontend Workspace
* **Framework**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS (dark mode by default, custom glassmorphism panels)
* **Telemetry Visuals**: Recharts (Area charts, bar charts, radar vectors)
* **Animations**: Framer Motion & Lucide icons

---

## Database Schemas

* **`users`**: Recruiter accounts, signup logs, onboarding states.
* **`jobs`**: Open requirements, target experience, education parameters, and skills.
* **`candidates`**: Structured candidate data, risk evaluations, and AI summary notes.
* **`resumes`**: Raw document text source and parsed JSON profiles.
* **`skills`**: Master taxonomy of tech skills.
* **`candidate_skills`**: Mapping of candidates to extracted capabilities.
* **`rankings`**: Match weights and shortlist explanation fields.
* **`interview_plans`**: Custom technical interview plans.
* **`settings`**: System configurations.

---

## Installation & Setup Guide

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### 1. Backend Service Set Up
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Unix/macOS:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install email-validator
   ```
4. Seed default admin and database:
   The backend includes an exposed seeding API to immediately spin up 3 hiring positions and 10 detailed engineering profiles:
   ```bash
   # Run the server
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   * *Seeding can be triggered in settings panel or via `POST http://127.0.0.1:8000/api/v1/seed`*

### 2. Frontend Workspace Set Up
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
   * *Vite dev server runs on `http://localhost:5173` proxying `/api` to backend `http://127.0.0.1:8000`*

---

## Production Deployment Guide

### Option 1: Docker Orchestration (Recommended)
We provide Docker blueprints to build standalone backend and frontend images.
Create a `docker-compose.yml` in root:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=your_production_secret_key
      - DATABASE_URL=sqlite:///app/talentos.db
    volumes:
      - talentos_data:/app/data
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  talentos_data:
```

### Option 2: Render / Vercel Deployments
* **Backend**: Deploy the FastAPI backend to **Render** or **Railway**. Set the start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Configure persistent SQLite disk mounts.
* **Frontend**: Build production bundle (`npm run build`) and deploy the resulting `dist/` directory to **Vercel** or **Netlify**. Add rewrite rules routing API queries to your hosted backend address.
