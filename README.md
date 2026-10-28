# Multimodal Construction Intelligence Platform (SkillWallet)

An enterprise-grade, multimodal AI platform built with **FastAPI** (Python 3.11+) and **React.js + Vite**. The platform unifies visual safety audits, structural crack forensic classification, automated BOQ material estimation, defensible real estate valuation, and real-time meteorological site advisories.

---

## 🏗️ System Architecture & Features

The platform is organized into 9 modules inspired by the SkillWallet construction intelligence dashboard:

1. **Dashboard / Overview**: Consolidated executive KPI metrics, compliance scoring, audit counts, quick-action navigation, and system status indicators.
2. **Safety Monitor (Multimodal Vision)**: Upload site photos to detect missing PPE (helmets, high-vis vests, safety eyewear), scaffold guardrails, open unbarricaded edges, and tripping clutter. Generates safety risk scores, categorized observations, and immediate corrective action plans.
3. **Crack Detection & Structural Forensics**: High-resolution image analysis of concrete/masonry fractures. Classifies crack morphology (e.g. diagonal shear, drying shrinkage, differential settlement), estimates fissure width, identifies root causes, and advises licensed structural engineer review.
4. **Project Planner (BOQ & 3D Visualization)**: Calculates concrete volumes ($m^3$), cement bags, river/M-sand tons, coarse aggregate tons, TMT steel rebar tonnage, and bricks based on plot dimensions and floor plans. Generates a phased Gantt schedule, cost breakdown in INR, and conceptual 3D architectural renders via Flux AI.
5. **Real Estate Valuation Engine**: Hedonic pricing model evaluating locality indices across major metro markets (Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad, Chennai, etc.), structural age depreciation, building condition, and community amenities to compute fair market value range, monthly rental yields, and 5-year ROI forecasts.
6. **Knowledge Assistant**: Authoritative construction engineering specifications and codes (IS 456, ACI 318, OSHA 1926) across Safety, Technique, and Quality Documentation categories.
7. **Construction Chatbot**: Real-time conversational AI assisting site superintendents and quantity surveyors with mix designs, rebar thumb rules, concrete curing, and waterproofing protocols.
8. **Daily Site Assistant**: Generates actionable shift workflows, crew labor assignments, tool checklists, and proactive hazard mitigations tailored to available workforce count and terrain condition.
9. **Meteorological Risk Advisor**: Real-time global weather integration powered by Open-Meteo. Evaluates wind gusts, ambient temperatures, and precipitation probability against activity safety envelopes to deliver verified **GO / CAUTION / NO-GO** construction advisories.

---

## 📂 Project Structure

```text
construction intelligence/
├── backend/
│   ├── config.py              # Pydantic BaseSettings environment loader
│   ├── main.py                # FastAPI entry point, CORS, routers
│   ├── requirements.txt       # Python dependencies (fastapi, uvicorn, pydantic, httpx...)
│   ├── .env.example           # Backend environment template
│   ├── .env                   # Local backend configuration
│   ├── routers/               # Dedicated FastAPI route handlers
│   │   ├── health.py          # GET /api/health
│   │   ├── safety.py          # POST /api/safety/analyze
│   │   ├── crack.py           # POST /api/crack/analyze
│   │   ├── planner.py         # POST /api/planner/calculate
│   │   ├── valuation.py       # POST /api/valuation/estimate
│   │   ├── knowledge.py       # POST /api/knowledge/ask
│   │   ├── chat.py            # POST /api/chat/message
│   │   ├── daily_site.py      # POST /api/daily-site/plan
│   │   └── weather.py         # POST /api/weather/advisory
│   ├── schemas/
│   │   └── models.py          # Pydantic request & response models
│   ├── services/
│   │   ├── ai_service.py      # Multimodal Meta LLaMA service with heuristic demo fallback
│   │   ├── weather_service.py # Live Open-Meteo meteorological integration
│   │   └── image_gen_service.py # Flux AI architectural render generator
│   └── tests/
│       ├── conftest.py        # Pytest fixtures and mock image generators
│       └── test_api_endpoints.py # 20 automated unit and integration tests
├── frontend/
│   ├── index.html             # HTML shell with Google Inter font
│   ├── package.json           # React 18, Vite, Lucide React, Axios
│   ├── vite.config.js         # Vite configuration with /api proxy
│   ├── .env.example           # Frontend environment template
│   ├── .env                   # Local frontend configuration
│   └── src/
│       ├── App.jsx            # Main app shell & routing
│       ├── main.jsx           # React DOM root
│       ├── index.css          # Design system styling (Dark charcoal sidebar, Orange accents)
│       ├── components/
│       │   ├── Sidebar.jsx    # 9-module navigation sidebar with status indicator
│       │   ├── Header.jsx     # Top app bar with AI / Demo badge
│       │   ├── StatusBadge.jsx# Status indicators (GO / CAUTION / NO-GO / Risk)
│       │   ├── LoadingSpinner.jsx
│       │   └── ErrorAlert.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── SafetyMonitor.jsx
│       │   ├── CrackDetection.jsx
│       │   ├── RealEstateValuation.jsx
│       │   ├── ProjectPlanner.jsx
│       │   ├── KnowledgeAssistant.jsx
│       │   ├── ConstructionChatbot.jsx
│       │   ├── DailySiteAssistant.jsx
│       │   └── WeatherAdvisor.jsx
│       └── services/
│           └── api.js         # Central Axios client with response interceptors
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart Guide (Windows 10/11)

### Prerequisites
1. **Python 3.9+** (Python 3.11 recommended) installed and added to PATH.
2. **Node.js 18+** (Node v20+ recommended) installed.

---

### Step 1: Backend Setup

Open a PowerShell or Command Prompt terminal in the project directory:

```powershell
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# (Or in Command Prompt: .\venv\Scripts\activate.bat)

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start the backend server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will start at:
- **API Base:** `http://127.0.0.1:8000`
- **Swagger Interactive Docs:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/health`

---

### Step 2: Frontend Setup

Open a **second** terminal window:

```powershell
# 1. Navigate to the frontend directory
cd frontend

# 2. Install npm packages
npm install

# 3. Start the Vite development server
npm run dev
```

The frontend will start at `http://localhost:5173`. Open this URL in your web browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `HOST` | `0.0.0.0` | Host IP for FastAPI server |
| `PORT` | `8000` | Port for FastAPI server |
| `ENVIRONMENT` | `development` | Environment mode (`development` / `production`) |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `LLAMA_API_KEY` | *(Optional)* | Meta LLaMA API Key (Groq, Together AI, or OpenRouter). If left blank, platform runs in **Demonstration Mode** with verified civil engineering heuristics |
| `LLAMA_API_BASE_URL` | `https://api.groq.com/openai/v1` | Multimodal LLaMA endpoint base URL |
| `LLAMA_VISION_MODEL` | `llama-3.2-11b-vision-preview` | Model used for image inspection |
| `LLAMA_TEXT_MODEL` | `llama-3.3-70b-versatile` | Model used for text reasoning & chat |
| `WEATHER_API_PROVIDER`| `open-meteo` | Weather provider (`open-meteo` requires no API key!) |
| `ENABLE_IMAGE_GENERATION` | `true` | Enables Flux conceptual 3D renders |

### Frontend (`frontend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Base API route (proxied to backend in development) |

---

## 🧪 Testing and Verification

Run the comprehensive automated pytest suite covering all endpoints, boundary conditions, and validation:

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```

### Test Suite Coverage:
- `test_health_endpoint`: Healthcheck & configuration verification
- `test_safety_analyze_valid_jpeg`: Image audit & hazard extraction
- `test_safety_analyze_invalid_type`: Mime type validation (rejection of non-images)
- `test_safety_analyze_empty_file`: Zero-byte upload handling
- `test_safety_analyze_missing_file`: Missing file payload rejection
- `test_crack_analyze_valid_png`: Structural crack categorization & disclaimer check
- `test_crack_analyze_invalid_mime`: Format rejection
- `test_planner_calculate_valid`: Concrete volume, BOQ, and schedule calculations
- `test_planner_calculate_invalid_dimensions`: Pydantic dimension validation
- `test_valuation_estimate_valid`: Real estate appraisal & rental yield calculation
- `test_valuation_estimate_zero_area`: Pydantic area validation
- `test_knowledge_ask_valid`: Construction standards lookup
- `test_knowledge_ask_empty_question`: Empty query handling
- `test_chat_message_valid`: Construction chatbot conversation
- `test_chat_message_empty`: Empty message handling
- `test_daily_site_plan_valid`: Daily shift schedule & safety checklist
- `test_daily_site_plan_empty_activity`: Missing activity validation
- `test_weather_advisory_valid`: Live weather retrieval & GO/CAUTION/NO-GO determination
- `test_weather_advisory_empty_location`: Empty location validation

### Frontend Production Build Test:
```powershell
cd frontend
npm run build
```
Build output is saved to `frontend/dist/`.

---

## 🌐 Cloud Deployment Guide

### Backend: Render.com
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables under the **Environment** tab:
   - `LLAMA_API_KEY`: *(Your API key, e.g. from Groq)*
   - `CORS_ORIGINS`: `https://your-frontend-domain.vercel.app`

### Frontend: Vercel
1. Create a new project on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Configure project settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set environment variable:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com/api`

---

## 📦 How to Upload to GitHub

Initialize git, stage files, and push to your remote repository:

```powershell
# 1. Initialize git repository
git init

# 2. Stage all files (respects .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: initial commit of Multimodal Construction Intelligence Platform"

# 4. Link your GitHub remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 5. Push to main branch
git branch -M main
git push -u origin main
```

*(Note: API keys in `.env` and `venv/` are excluded by `.gitignore` and will never be committed).*

---

## ⚖️ Important Disclaimers & Assumptions

1. **Safety Monitor**: Visual safety screening is an advisory assistive tool. It does not replace on-site OSHA certified safety inspectors, site safety officers, or regulatory audits.
2. **Structural Crack Forensics**: Image-based crack analysis does not prove structural integrity or provide a definitive engineering diagnosis. Fissures or shear cracks must be physically evaluated by a licensed structural engineer with on-site non-destructive testing (NDT) instruments (rebound hammer, ultrasonic pulse velocity, tell-tale gauges).
3. **Project Planner & BOQ**: Material quantities and cost estimates are preliminary calculations derived from empirical IS 456 / CPWD thumb-rules. They do not replace structural architectural drawings, structural engineering analysis, or contractor firm tender bids.
4. **Real Estate Valuation**: Valuations are indicative estimates based on regional benchmarks and standard depreciation algorithms. They do not constitute an accredited commercial appraisal.
5. **Weather Data**: Real meteorological forecasts are sourced directly from the Open-Meteo API. Construction operations must also monitor local micro-climate conditions on site.
