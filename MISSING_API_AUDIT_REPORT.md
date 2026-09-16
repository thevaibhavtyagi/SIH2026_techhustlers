# Missing API Audit Report

## 1. Scope
This document provides a comprehensive audit of the MPLADS Drishti frontend (Step 11) to identify functional gaps requiring new backend APIs. The audit strictly adheres to the rule of reusing existing endpoints where possible and only proposes new endpoints when the data requirement cannot be met by the current backend architecture.

---

## 2. Frontend Feature Inventory
The frontend (`frontend/src/`) comprises the following major features and pages:
- **Dashboards (Admin, MP, District Nodal)**: KPIs, recent projects, ML flags, monthly trends, state map.
- **Expenditure (`Expenditure.jsx`)**: Project-level sanctioned vs. expenditure data table.
- **Progress & Delays (`ProgressDelays.jsx`)**: Timelines, sanction delays, and completion durations table.
- **Alerts (`Alerts.jsx`)**: Feed of ML anomalies requiring review.
- **Investigations (`Investigations.jsx`)**: Detailed ML flagged records and AI-generated narrative reports.
- **Geographic Intelligence (`GeographicIntel.jsx`)**: State-level risk distribution maps and charts.
- **Contractors (`Contractors.jsx`)**: Directory of executing agencies, active projects, delay rates, and risk scores.
- **Projects List & Detail (`ProjectsList.jsx`, `ProjectDetail.jsx`)**: Master list and individual drill-down.
- **Reports (`Reports.jsx`)**: Summary generation for export.
- **Risk Engine (`RiskEngine.jsx`)**: Operational ML engine telemetry.
- **Drishti Copilot**: Natural language AI assistant.

---

## 3. Existing Backend API Inventory
The current Node.js/Express gateway (backed by FastAPI ML Engine) exposes:
- `/auth/*`: Login, logout, refresh, password management.
- `/users/*`: RBAC provisioning and management.
- `/projects`: Project list and detail retrieval.
- `/risk/summary`, `/risk/distribution`: High-level AI risk rollups.
- `/investigations`: ML anomaly list, detail, and LLM-generated narrative reports.
- `/analytics/overview`: Real-time aggregated KPIs (projects, funds, ML anomalies).
- `/analytics/states`, `/analytics/categories`, `/analytics/constituencies`: Dimensional aggregated risk data.

---

## 4. Frontend-to-Backend Mapping

| Frontend Feature | Backend Route | Status |
|------------------|---------------|--------|
| **Dashboard KPIs** | `/api/analytics/overview` | A. REAL API COMPLETE |
| **Dashboard Recent Projects** | `/api/projects?limit=X` | A. REAL API COMPLETE |
| **Dashboard Recent Flags** | `/api/investigations?limit=X` | A. REAL API COMPLETE |
| **Dashboard Map** | `/api/analytics/states` | A. REAL API COMPLETE |
| **Dashboard Timeseries** | None | D. BACKEND API MISSING |
| **Expenditure Table** | `/api/projects` | A. REAL API COMPLETE |
| **Progress/Delays Table**| `/api/projects` | A. REAL API COMPLETE |
| **Geographic Intel** | `/api/analytics/states` | A. REAL API COMPLETE |
| **Alerts Feed** | `/api/investigations` | A. REAL API COMPLETE (Derived) |
| **Investigations** | `/api/investigations` | A. REAL API COMPLETE |
| **Investigation Reports**| `/api/investigations/:workId/report` | A. REAL API COMPLETE |
| **Risk Engine Stats** | `/api/risk/summary`, `/api/analytics/overview` | A. REAL API COMPLETE |
| **Projects List/Detail** | `/api/projects`, `/api/projects/:id` | A. REAL API COMPLETE |
| **Reports (Data)** | `/api/risk/summary`, `/api/analytics/overview` | A. REAL API COMPLETE |
| **Reports (PDF Export)** | None | D. BACKEND API MISSING |
| **Contractors** | None | D. BACKEND API MISSING |
| **Copilot** | None | D. BACKEND API MISSING |

---

## 5. Mock Data Inventory
Searched `frontend/src/` for all mock implementations. Found the following in `src/data/mockData.js`:
- `MOCK_PROJECTS`, `LOCATIONS`, `WORK_TYPES`, `STATUSES`: **Test Fixtures**. Retained for historical UI scaffolding; no longer actively powering core tables.
- `MOCK_CONTRACTORS`: **Fallback UI Data**. Currently powers the `Contractors.jsx` page and the `ProjectDetail.jsx` contractor profile widget since no backend contractor data exists.
- `MOCK_ALERTS`: **Test Fixture**. Superseded by the `/investigations` endpoint.
- `COPILOT_WELCOME`, `COPILOT_SUGGESTIONS`, `mockCopilotResponse`: **Demo Content**. Intentionally retained to mock the Copilot UI interaction pending a dedicated LLM backend integration.

Hardcoded arrays in components:
- `EXPENDITURE_TREND_MOCK` in `Dashboard.jsx`: **Fallback UI Data**. Used to render the monthly bar chart in the dashboard since no timeseries API exists.

---

## 6. Existing API Reuse Opportunities
- **Alerts**: The `Alerts.jsx` page requires a feed of anomalies. Instead of creating a redundant `/alerts` API, it successfully consumes the existing `/investigations` endpoint and derives the UI (Status: New/Pending) from the `reportStatus`. **No new API required.**
- **Expenditure / Progress**: The `Expenditure.jsx` and `ProgressDelays.jsx` pages rely on project-level data rather than aggregates. The existing `/projects` API handles these requirements perfectly with pagination and state filtering. **No new API required.**
- **Geographic Intelligence**: Consumes `/analytics/states` successfully. If district-level map drill-downs are added in the future, `/analytics/districts` would be required, but it is not currently needed by the UI. **No new API required.**
- **Fraud/Anomalies**: Displayed across the Dashboard and Risk Engine, perfectly served by `/analytics/overview` (fields: `mlDetectedProjects`, `multiEngineProjects`). **No new API required.**

---

## 7. Gap Analysis & Proposed Specifications

### 7.1 Dashboard Time-Series Gap
**Issue**: The Dashboard displays a monthly expenditure and utilization trend chart (`EXPENDITURE_TREND_MOCK`). The backend does not currently aggregate data by month.

**Dataset Investigation Results**:
- **Valid Date Columns**: `recommended_date`, `sanction_date`, `completion_date`.
- **Date Completeness**: 
  - `recommended_date`: 0% nulls (100% complete)
  - `sanction_date`: 41.75% nulls
  - `completion_date`: 59.72% nulls (expected for incomplete projects)
- **Expenditure Limitation**: **DATA NOT CURRENTLY AVAILABLE**. The dataset provides a scalar `total_expenditure` value but possesses absolutely no transaction dates or payout ledgers. Therefore, it is **impossible** to legitimately calculate or render a monthly expenditure trend.

**Proposed Specification**:
- **Endpoint**: `GET /api/analytics/timeseries`
- **Purpose**: Monthly trend data for dashboard rendering, strictly limited to project milestones (recommendations/sanctions/completions) based on valid dates.
- **Authentication**: Required.
- **RBAC**: Admin / MP / District Nodal.
- **Data Scope**: 
  - Admin = national
  - MP = assigned constituency
  - District Nodal = assigned state + district
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "month": "YYYY-MM",
      "totalSanctioned": 0,
      "completedProjects": 0,
      "recommendedProjects": 0
    }
  ]
}
```
- **Note**: Records with missing dates must NOT be artificially assigned to a month. The `totalExpenditure` field has been omitted from the proposed response because the dataset cannot support it. Do NOT fabricate date mappings.

### 7.2 Contractors Gap
**Issue**: The `Contractors.jsx` page relies entirely on `MOCK_CONTRACTORS`.
**Data Source**: **DATA NOT CURRENTLY AVAILABLE.** The underlying ML dataset only possesses `impl_agency` strings (which are messy government department names) and lacks a structured "Contractor" entity with delay history and risk scores.
**Proposed Specification**:
- **Endpoint**: `GET /api/contractors` and `GET /api/contractors/:id`
- **Purpose**: Directory and performance metrics for executing agencies.
- **Note**: Cannot be implemented until the backend dataset is enriched with structured contractor vendor tables and historical tracking.

### 7.3 Reports Export Gap
**Issue**: The `Reports.jsx` page generates an on-screen JSON summary but lacks the ability to generate a downloadable PDF report as promised by the UI ("Export as PDF").
**Proposed Specification**:
- **Endpoint**: `POST /api/reports/export`
- **Purpose**: Generates a PDF buffer for a specified risk report configuration.
- **Authentication/RBAC**: Standard.
- **Response**: `application/pdf` binary stream.

### 7.4 Copilot Gap
**Issue**: The Drishti Copilot uses hardcoded logic to parse natural language queries.
**Proposed Specification**:
- **Endpoint**: `POST /api/copilot/query`
- **Purpose**: NLP-to-SQL or RAG processing of user queries against MPLADS data.
- **Authentication/RBAC**: Standard (highly critical that the LLM respects row-level security).
- **Response**: `{ text: "...", type: "table|text|list", data: [...] }` matching existing mock contract.

---

## 8. Security & Response Contracts
All proposed APIs **must** enforce Step 8 role-based access control (Admin = National, MP = Constituency, District Nodal = State+District). 
They **must** adhere to Step 9 response formatting conventions, returning a `{ "success": true, "data": { ... } }` envelope with frontend-facing `camelCase` fields.

---

## 9. Priority & Final API Gap Table

| Feature | Frontend Need | Existing API | Gap | Proposed API | Priority |
|---------|---------------|--------------|-----|--------------|----------|
| Dashboard Chart | Monthly expenditure/completion trends | None | Timeseries missing | `GET /api/analytics/timeseries` | **P0** (Required) |
| Reports Export | Downloadable PDF summary | None | PDF Generator missing | `POST /api/reports/export` | **P2** (Enhancement) |
| Contractors Page | Contractor directory & metrics | None | Source data missing | `GET /api/contractors` | **P3** (Blocked by Data) |
| Drishti Copilot | Natural language query responses | None | LLM integration missing| `POST /api/copilot/query` | **P3** (Future Phase) |

**Final Recommendation**: 
Do NOT implement the `GET /api/analytics/timeseries` API yet. The dashboard's promise of a "monthly expenditure trend" is fundamentally incompatible with the current dataset (which lacks expenditure transaction dates). The UI should eventually be redesigned to display only metrics that the dataset can truthfully support (e.g., monthly recommended/sanctioned/completed projects), rather than fabricating expenditure timelines.

**Final Status**: MISSING API AUDIT COMPLETE. No new backend development is required to maintain the current operational baseline, with the exception of the P0 timeseries endpoint needed to remove the final dashboard mock data (pending UI redesign to remove the impossible expenditure metric).
