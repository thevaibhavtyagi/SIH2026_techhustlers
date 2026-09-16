# MPLADS Drishti

AI-powered monitoring and risk-intelligence platform for the **M**embers of
**P**arliament **L**ocal **A**rea **D**evelopment **S**cheme (MPLADS) — built
for Smart India Hackathon 2026, Problem Statement #26102 (Ministry of
Statistics & Programme Implementation).

It gives Admins, Members of Parliament, and District Authorities a single
dashboard to track project sanctions, expenditure, physical progress, and
AI-flagged fraud/anomaly risk across MPLADS-funded works nationwide.

## Live deployment

| Service | URL |
|---|---|
| App (frontend) | https://sih2026-techhustlers-1.onrender.com |
| API Gateway (backend) | https://sih2026-techhustlers-xup9.onrender.com |
| Risk Intelligence Engine (ml_engine) | https://sih2026-techhustlers.onrender.com |

> Hosted on Render's free tier — the first request after a period of
> inactivity can take 30–50s while the service wakes up. That's expected.

## Architecture

```
┌─────────────┐        ┌──────────────────┐        ┌────────────────────┐
│   Frontend   │ ─────▶ │  Backend (API     │ ─────▶ │  ml_engine          │
│ React + Vite │  HTTPS │  Gateway, Express)│  HTTPS │  (FastAPI, Python)  │
└─────────────┘        └──────────────────┘        └────────────────────┘
                               │
                               │ Supabase client (service-role key)
                               ▼
                        ┌──────────────┐
                        │   Supabase    │
                        │  (Postgres)   │
                        └──────────────┘
```

- **Frontend** never talks to `ml_engine` or Supabase directly — every request
  goes through the backend, which authenticates the caller and enforces RBAC
  before forwarding.
- **Auth is custom** (JWT access + refresh tokens), not Supabase's built-in
  Auth/GoTrue — see [`backend/README.md`](backend/README.md) for the full model.
- **ml_engine** has no auth of its own by design; it must only ever be reached
  through the backend gateway, never exposed to the browser.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Recharts, D3 / Leaflet (maps), Axios |
| Backend | Node.js, Express, JWT (`jsonwebtoken`), `bcryptjs`, `zod` validation, `@supabase/supabase-js` |
| ml_engine | Python, FastAPI, pandas, scikit-learn (Isolation Forest + Local Outlier Factor ensemble), Groq LLM (investigation report generation) |
| Database | Supabase (managed Postgres) |
| Hosting | Render (Web Services + Static Site) |

## Repository structure

```
├── frontend/          React/Vite web app
├── backend/           Express API gateway — auth, RBAC, ml_engine proxy
├── ml_engine/         FastAPI risk-intelligence service (ML + rule engines)
├── database/          SQL schema (auth tables + legacy scaffold)
└── README.md          You are here
```

Each of `frontend/`, `backend/`, and `ml_engine/` is deployed as an
independent Render service with its own build/start commands (see
**Getting started** below for local dev, or `backend/README.md` for the
production deployment notes).

## Getting started (local development)

You'll need Node.js 18+, Python 3.10+, and a Supabase project.

### 1. Database
Run [`database/auth_schema.sql`](database/auth_schema.sql) once in your
Supabase project's SQL Editor. This creates the `users`, `refresh_tokens`,
and `password_reset_tokens` tables the backend depends on.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your Supabase URL/secret key, generate JWT secrets
npm run seed            # bootstraps the first admin account from SEED_ADMIN_* in .env
npm run dev              # http://localhost:5000
```
Full details (auth model, API reference, RBAC): [`backend/README.md`](backend/README.md).

### 3. ml_engine
```bash
cd ml_engine
python -m venv .venv
./.venv/Scripts/pip install fastapi uvicorn pandas numpy pydantic   # or the full requirements.txt
./.venv/Scripts/python -m uvicorn api.main:app --port 8000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173, expects VITE_API_URL=http://localhost:5000/api
```

Set `VITE_API_URL` in a `frontend/.env` file if your backend isn't on the
default port.

## Roles & access control

There is **no public self-registration** — every account is provisioned by
an admin. Three roles exist:

| Role | Scope |
|---|---|
| `admin` (MoSPI Admin) | Full national access; provisions all other accounts |
| `mp` (Member of Parliament) | Own constituency's projects, funds, alerts |
| `district_nodal` (District Authority) | Own district's projects and alerts |

Admins create MP/District accounts via **Sidebar → Create Account**
(`/admin/provision-account`) once logged in.

## API overview

The backend exposes `/api/auth/*` (login, refresh, logout, password reset),
`/api/users/*` (admin-only account management), and a proxied risk-intelligence
surface (`/api/projects`, `/api/risk/*`, `/api/investigations/*`,
`/api/analytics/*`) backed live by ml_engine. Full endpoint reference,
request/response shapes, and the RBAC matrix: [`backend/README.md`](backend/README.md).
