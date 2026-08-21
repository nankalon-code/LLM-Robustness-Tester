# LLM Robustness Tester

A local-first, free open-source web application designed to evaluate LLM system prompts, base prompts, and API endpoints against adversarial inputs (jailbreaks, prompt injection, hallucination triggers) including multi-turn escalation sequences. Produces severity-weighted robustness scores and regression diff reports.

---

## 🚀 Quickstart Guide

### Prerequisites
1. **Python 3.10+**
2. **Node.js 18+** & `npm`
3. **Ollama** (Local LLM server)

---

### Step 1: Install & Launch Ollama
1. Download Ollama from [ollama.com](https://ollama.com) and start the background service (`localhost:11434`).
2. Pull the default evaluation model:
   ```bash
   ollama pull llama3.1:8b
   ```

---

### Step 2: Set Up Backend (FastAPI + SQLite)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend development server
uvicorn app.main:app --reload --port 8000
```
*Backend API will be live at `http://localhost:8000` (Docs available at `http://localhost:8000/docs`).*

---

### Step 3: Set Up Frontend (React + Vite + Tailwind CSS)
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
*Open your browser and navigate to `http://localhost:3000`.*

---

## 🛠 Features & Architecture

- **Local-First & Zero Paid Keys**: Defaults to Ollama running locally on port `11434`.
- **LLM Provider Abstraction**: Switchable to cloud endpoints (such as Groq free tier) via `.env`.
- **Adversarial Categories**: Single-turn and multi-turn escalation attacks covering `roleplay_bypass`, `encoding_obfuscation`, `prompt_leakage`, `hallucination_trigger`, and `refusal_failure`.
- **Multi-Turn Escalation Tracking**: Tracks conversation history and records exact `broke_at_turn` metrics.
- **LLM-as-Judge Evaluation**: Scores target responses using strict JSON rubrics.
- **Regression Analysis**: Compare baseline and candidate runs to flag newly introduced vulnerabilities or remediations.
