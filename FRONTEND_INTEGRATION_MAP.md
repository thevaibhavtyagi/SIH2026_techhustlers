# Frontend Integration Map — MPLADS Drishti (Step 10)

> Generated: 2026-09-16
> Branch: `step10-frontend-integration`

## Page → API Mapping

| Page | Route | API Endpoint(s) | Real/Mock | Fields Consumed | Status |
|------|-------|-----------------|-----------|-----------------|--------|
| Admin Dashboard | `/admin/dashboard` | `GET /analytics/overview` | ✅ Real | `totalProjects`, `totalSanctionedAmount`, `totalExpenditure`, `completedProjects`, `highCriticalProjects`, `mlDetectedProjects` | ✅ Fixed |
| Admin Dashboard | `/admin/dashboard` | `GET /risk/summary` | ✅ Real | `riskDistribution`, `averageRiskScore`, `highCriticalProjects` | ✅ Fixed |
| Admin Dashboard | `/admin/dashboard` | `GET /projects?limit=10` | ✅ Real | `id`, `name`, `state`, `riskScore` (top 5 by risk) | ✅ Fixed |
| Admin Dashboard | `/admin/dashboard` | `GET /investigations?limit=5` | ✅ Real | `workId`, `primarySignal`, `riskLevel`, `riskScore`, `state` | ✅ Fixed |
| Admin Dashboard (chart) | `/admin/dashboard` | _none_ | 🟡 Mock | Monthly expenditure time-series | 📌 Remaining — no timeseries API |
| Admin Projects List | `/admin/projects` | `GET /projects` | ✅ Real | `id`, `name`, `district`, `state`, `sanctionedAmount`, `progress`, `status`, `riskScore`, `sanctionDate` | ✅ Working |
| Admin Project Detail | `/admin/projects/:id` | `GET /projects/:workId` | ✅ Real | All project fields | ✅ Fixed |
| Admin Project Detail (contractor) | `/admin/projects/:id` | _none_ | 🔴 Was mock | Contractor profile | ✅ Fixed — placeholder shown |
| Admin Alerts / Anomalies | `/admin/alerts` | `GET /investigations` | ✅ Real | `workId`, `primarySignal`, `riskLevel`, `riskScore`, `priority`, `state` | ✅ Fixed |
| Admin Risk Engine | `/admin/risk-engine` | `GET /risk/summary` | ✅ Real | `totalProjects`, `riskDistribution`, `highCriticalProjects` | ✅ Working |
| Admin Risk Engine | `/admin/risk-engine` | `GET /analytics/overview` | ✅ Real | `mlDetectedProjects`, `multiEngineProjects` | ✅ Working |
| Admin Investigations | `/admin/investigations` | `GET /investigations` | ✅ Real | `workId`, `riskScore`, `riskLevel`, `priority`, `primarySignal`, `constituency`, `state` | ✅ Working |
| Admin Investigations (report) | `/admin/investigations` | `GET /investigations/:workId/report` | ✅ Real | `riskScore`, `riskLevel`, `priority`, `report`, `confidence` | ✅ Working |
| Admin Geographic Intel | `/admin/map` | `GET /analytics/states` | ✅ Real | `state`, `totalProjects`, `averageRiskScore`, `highRisk`, `criticalRisk` | ✅ Working |
| Admin Expenditure | `/admin/expenditure` | `GET /projects` | ✅ Real | `id`, `name`, `sanctionedAmount`, `expenditure`, `progress`, `financialRiskScore` | ✅ Working |
| Admin Progress & Delays | `/admin/progress` | `GET /projects` | ✅ Real | `id`, `name`, `status`, `sanctionDelayDays`, `completionDurationDays`, `ensembleRiskLevel` | ✅ Working |
| Admin Contractors | `/admin/contractors` | _none_ | 🟡 Mock | Contractor list | 📌 Remaining — no contractor API |
| Admin Reports | `/admin/reports` | `GET /risk/summary` + `GET /analytics/overview` | ✅ Real | All summary/overview fields | ✅ Working |
| MP Dashboard | `/mp/dashboard` | `GET /analytics/overview` | ✅ Real | `totalProjects`, `totalSanctionedAmount`, `completedProjects`, `highCriticalProjects` | ✅ Fixed |
| MP Dashboard | `/mp/dashboard` | `GET /projects?limit=5` | ✅ Real | `id`, `name`, `status`, `sanctionedAmount`, `progress` | ✅ Fixed |
| MP Dashboard | `/mp/dashboard` | `GET /investigations?limit=4` | ✅ Real | `workId`, `primarySignal`, `riskLevel` | ✅ Fixed |
| MP Projects | `/mp/projects` | `GET /projects` | ✅ Real | All project fields | ✅ Working |
| MP Risk Insights | `/mp/risk` | `GET /projects` | ✅ Real | `id`, `name`, `riskScore`, `riskLevel` | ✅ Fixed |
| MP Funds | `/mp/funds` | `GET /projects` | ✅ Real | `id`, `name`, `sanctionedAmount`, `expenditure` | ✅ Working |
| MP Alerts | `/mp/alerts` | `GET /investigations` | ✅ Real | `workId`, `primarySignal`, `riskLevel`, `riskScore`, `priority` | ✅ Fixed |
| District Dashboard | `/district/dashboard` | `GET /analytics/overview` | ✅ Real | `totalProjects`, `totalSanctionedAmount`, `completedProjects`, `highCriticalProjects` | ✅ Fixed |
| District Dashboard | `/district/dashboard` | `GET /projects?limit=5` | ✅ Real | `id`, `name`, `status`, `sanctionedAmount`, `progress` | ✅ Fixed |
| District Dashboard | `/district/dashboard` | `GET /investigations?limit=4` | ✅ Real | `workId`, `primarySignal`, `riskLevel` | ✅ Fixed |
| District Projects | `/district/projects` | `GET /projects` | ✅ Real | All project fields | ✅ Working |
| District Alerts | `/district/alerts` | `GET /investigations` | ✅ Real | All investigation fields | ✅ Fixed |
| Login | `/login` | `POST /auth/login` | ✅ Real | `user`, `accessToken` | ✅ Working |
| User Management | `/admin/provision-account` | `POST /users`, `GET /users`, `PATCH /users/:id` | ✅ Real | All user fields | ✅ Working |

## Authentication Flow

| Step | Mechanism | Status |
|------|-----------|--------|
| Login | `POST /auth/login` → accessToken in memory | ✅ Real |
| Session restore | `POST /auth/refresh` on app mount (httpOnly cookie) | ✅ Real |
| Authenticated requests | `Authorization: Bearer <token>` header | ✅ Real |
| Silent refresh on 401 | Interceptor retries once, `_retried` guard prevents loops | ✅ Real |
| 403 handling | Does NOT trigger refresh (correct) | ✅ Real |
| Logout | `POST /auth/logout` → clears in-memory token | ✅ Real |
| Token storage | Memory only — never localStorage or sessionStorage | ✅ Secure |

## Remaining Mocks

| Feature | File | Reason | Backend API Needed |
|---------|------|--------|-------------------|
| Monthly expenditure time-series | `admin/Dashboard.jsx` | No time-series endpoint exists | Step 11: `GET /analytics/timeseries` |
| Copilot welcome/suggestions/response | `api.js`, `data/mockData.js` | Copilot is out of Step 10 scope | Future |
| Contractor list / contractor profile | `api.js`, `admin/Contractors.jsx` | No contractor backend API exists | Future |
| PDF report export | `api.js`, `admin/Reports.jsx` | No report rendering service exists | Future |
| Submit concern | `api.js` | No concerns backend API exists | Future |

## Step 8 Security — Backend Enforced

All data-scope filtering is enforced in the Express gateway (`ml.service.js`) before requests reach the ML engine:

| Role | Automatic Scope |
|------|----------------|
| `admin` | All-India — no filter applied |
| `mp` | Filtered to `constituency` from JWT claims |
| `district_nodal` | Filtered to `state` + `district` from JWT claims |

The frontend does **not** perform authorization — it simply displays what the backend returns.
