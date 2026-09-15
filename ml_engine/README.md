# MPLADS AI — Government Project Risk Intelligence & Investigation System

An AI-powered risk intelligence platform for analyzing **MPLADS (Members of Parliament Local Area Development Scheme)** projects using machine learning, rule-based analysis, financial risk analysis, statistical anomaly detection, ML ensemble techniques, and grounded LLM-assisted investigation.

> **Important:** This system is a risk-prioritization and decision-support system. An anomaly or high-risk score does **not** prove fraud, corruption, misuse of funds, or illegal activity.

## 1. Project Objective

The system answers:

> **Which government projects deserve attention first, and why?**

End-to-end pipeline:

```text
MPLADS Data
    ↓
Data Preparation
    ↓
Feature Engineering
    ↓
Master Dataset
    ↓
Isolation Forest + LOF
    ↓
ML Ensemble
    ↓
Rule-Based Risk
    ↓
Financial Risk
    ↓
Statistical Anomaly Detection
    ↓
Unified Risk Engine
    ↓
Final AI Risk Score (0–100)
    ↓
LOW / MEDIUM / HIGH / CRITICAL
    ↓
Investigation Queue
    ↓
Grounded LLM Investigation Report
    ↓
FastAPI
    ↓
React / Next.js Dashboard
```

## 2. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │     MPLADS DATA     │
                         │ Government Datasets │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │     DATA PREPARATION       │
                    │ Cleaning + Joining +       │
                    │ Feature Engineering        │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │      MASTER DATASET        │
                    │       13,694 Projects      │
                    └─────────────┬──────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
      │ Isolation    │    │     LOF      │    │ Rule-Based   │
      │ Forest       │    │              │    │ Risk Engine  │
      └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
             │                   │                   │
             └─────────┬─────────┘                   │
                       ▼                             │
              ┌─────────────────┐                    │
              │   ML ENSEMBLE   │                    │
              │   IF + LOF      │                    │
              └────────┬────────┘                    │
                       │                             │
                       └─────────────┬───────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
             ┌────────────┐   ┌──────────────┐  ┌──────────────┐
             │ Financial  │   │ Statistical  │  │ ML Ensemble  │
             │ Risk       │   │ Anomaly      │  │ Risk         │
             └─────┬──────┘   └──────┬───────┘  └──────┬───────┘
                   │                 │                 │
                   └─────────────────┼─────────────────┘
                                     ▼
                         ┌──────────────────────┐
                         │ Unified Risk Engine  │
                         │ ML 35% | Rule 25%    │
                         │ Fin 20%| Stat 20%    │
                         └───────────┬──────────┘
                                     │
                                     ▼
                         ┌──────────────────────┐
                         │ Final AI Risk Score  │
                         │       0 – 100        │
                         └───────────┬──────────┘
                                     │
                                     ▼
                       ┌─────────────────────────┐
                       │ Investigation Queue     │
                       │ HIGH + CRITICAL         │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ Grounded LLM Copilot    │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │       FastAPI           │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ React / Next.js UI      │
                       └─────────────────────────┘
```

## 3. Technology Stack

### Machine Learning
- Python
- Pandas
- NumPy
- Scikit-learn
- Isolation Forest
- Local Outlier Factor (LOF)
- RobustScaler
- Median Imputation

### Risk Intelligence
- ML Ensemble
- Rule-Based Risk Engine
- Financial Risk Engine
- Statistical Anomaly Engine
- Unified Risk Engine

### Generative AI
- LangChain
- Groq
- GPT-OSS models
- Grounded LLM investigation reports

### Backend
- FastAPI
- Pydantic
- Uvicorn
- REST APIs

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts
- React Router

## 4. Dataset

Source datasets used during development include:

| Dataset | Approx. Rows |
|---|---:|
| Recommended | 14,001 |
| Sanctioned | 8,001 |
| Completed | 7,001 |
| Expenditure | 44,001 |
| Allocated | 544 |
| Calamity | 13 |

After cleaning, joining and deduplication, the project-level master dataset contains:

```text
13,694 unique projects
```

Primary identifier:

```text
work_id
```

## 5. Master Dataset

Main file:

```text
data/processed/master_dataset.csv
```

Important fields:

```text
work_id
state
constituency
work_category
work_description

recommended_amount
sanction_amount
total_expenditure

payment_count
unique_vendors
payments_per_vendor

sanction_delay_days
completion_duration_days

sanction_ratio
expenditure_ratio
```

## 6. Feature Engineering

Important engineered features include:

### Sanction Difference

```text
sanction_difference =
sanction_amount - recommended_amount
```

### Sanction Ratio

```text
sanction_ratio =
sanction_amount / recommended_amount
```

### Expenditure Difference

```text
expenditure_difference =
total_expenditure - sanction_amount
```

### Expenditure Ratio

```text
expenditure_ratio =
total_expenditure / sanction_amount
```

### Lifecycle Features

```text
sanction_delay_days
completion_duration_days
```

Earlier analysis showed approximately:

```text
Mean sanction delay ≈ 119.45 days
Mean completion duration ≈ 232 days
```

## 7. ML Feature Representation

The anomaly models use financial/project features plus missingness indicators.

The final ML representation contains:

```text
8 financial/project features
+
6 missingness indicators
=
14 ML features
```

Missingness is preserved as information so the model can distinguish:

```text
Actual zero
```

from:

```text
Information unavailable
```

## 8. Isolation Forest

Isolation Forest detects observations that are easier to isolate from the rest of the dataset.

Pipeline:

```text
Raw Features
     ↓
Numeric Conversion
     ↓
Median Imputation
     ↓
RobustScaler
     ↓
Isolation Forest
```

Configuration:

```python
IsolationForest(
    n_estimators=300,
    contamination=0.05,
    random_state=42
)
```

| Parameter | Value |
|---|---:|
| Trees | 300 |
| Contamination | 5% |
| Random State | 42 |
| Imputation | Median |
| Scaling | RobustScaler |

Final results:

```text
Total projects: 13,694
Anomalies:          685
Normal:          13,009
```

Output:

```text
data/processed/financial_anomalies.csv
```

Important output fields:

```text
work_id
anomaly_prediction
is_anomaly
anomaly_score
if_normalized_score
if_risk_score
```

## 9. Local Outlier Factor (LOF)

LOF identifies projects whose local density differs from neighboring projects.

Pipeline:

```text
Financial Features
        +
Missingness Indicators
        ↓
Median Imputation
        ↓
RobustScaler
        ↓
LOF
```

Configuration:

```python
LocalOutlierFactor(
    n_neighbors=50,
    contamination=0.05,
    novelty=True
)
```

The dataset contained:

```text
13,694 project rows
4,937 unique feature patterns
8,757 duplicate rows
```

LOF was fitted on unique scaled feature patterns and then used to score the complete project population.

Final results:

```text
Total projects:       13,694
LOF anomalies:            341
Normal:                13,353
```

Anomaly rate:

```text
≈ 2.49%
```

Output:

```text
data/processed/lof_anomalies.csv
```

> LOF risk score is a prioritization/ranking signal, not a calibrated probability.

## 10. ML Ensemble

Isolation Forest and LOF are combined:

```text
Isolation Forest → 60%
LOF              → 40%
```

```text
IF × 0.60 + LOF × 0.40
        ↓
Combined ML Risk
```

Model agreement states:

```text
NO_MODEL_ANOMALY
ISOLATION_FOREST_ONLY
LOF_ONLY
BOTH_MODELS
```

Final ML results:

```text
Isolation Forest anomalies: 685
LOF anomalies:              341
Both models:                 44
Any model:                  982
```

Agreement:

```text
NO_MODEL_ANOMALY          12,712
ISOLATION_FOREST_ONLY        641
LOF_ONLY                     297
BOTH_MODELS                   44
```

The broader ensemble criterion produced:

```text
Final Ensemble Anomalies: 2,280
```

This broader count also includes very-high combined-risk projects and should not be interpreted as 2,280 direct model flags.

Output:

```text
data/processed/ensemble_anomalies.csv
```

## 11. Rule-Based Risk Engine

The rule engine provides interpretable risk indicators.

It evaluates project conditions involving areas such as:

```text
Financial inconsistencies
Lifecycle irregularities
Payment-related patterns
Project-level risk indicators
```

Outputs include:

```text
rule_risk_score
rule_risk_level
risk_factors
recommended_actions
risk_factor_count
```

## 12. Financial Risk Engine

The financial engine focuses on financial/project behavior.

Features include:

```text
recommended_amount
sanction_amount
total_expenditure

payment_count
unique_vendors
payments_per_vendor

sanction_difference
sanction_ratio

expenditure_difference
expenditure_ratio
```

Outputs:

```text
financial_risk_score
financial_risk_level
financial_risk_factors
```

## 13. Statistical Anomaly Engine

The statistical engine identifies extreme observations using percentile-based thresholds.

Latest thresholds included:

```text
Expenditure:
95th percentile ≈ ₹799,359.90
99th percentile ≈ ₹1,749,944.11

Payment Count:
95th percentile = 5
99th percentile = 10

Payments per Vendor:
95th percentile = 3
99th percentile = 6
```

Latest distribution:

```text
LOW         12,985
MEDIUM         655
HIGH            45
CRITICAL         9
```

Score statistics:

```text
Mean ≈ 1.4199
Median = 0
Maximum = 65
```

## 14. Unified Risk Engine

The unified risk engine combines four risk sources:

```text
ML Anomaly
Rule-Based
Financial
Statistical
```

Weights:

| Engine | Weight |
|---|---:|
| ML Anomaly | 35% |
| Rule-Based | 25% |
| Financial | 20% |
| Statistical | 20% |

Conceptually:

```text
Base Risk =
    ML × 0.35
  + Rule × 0.25
  + Financial × 0.20
  + Statistical × 0.20
```

Scores are normalized before aggregation.

### Detection Thresholds

```text
ML threshold          = 30
Rule threshold        = 25
Financial threshold   = 25
Statistical threshold = 25
```

The implementation preserves unavailable engine outputs rather than treating missing information as zero risk.

## 15. Active Engines and Consensus

Each project gets:

```text
active_risk_engines
```

Possible values:

```text
0, 1, 2, 3, 4
```

Consensus bonus:

| Active Engines | Bonus |
|---:|---:|
| 1 | +0 |
| 2 | +5 |
| 3 | +12 |
| 4 | +20 |

Final score:

```text
Final AI Risk Score =
    Base Risk Score
    +
    Consensus Bonus
```

Clipped to:

```text
0–100
```

## 16. Final Risk Classification

| Score | Risk Level |
|---:|---|
| 0 – <25 | LOW |
| 25 – <50 | MEDIUM |
| 50 – <75 | HIGH |
| 75 – 100 | CRITICAL |

## 17. Risk Detection Confidence

Confidence is based primarily on the number of independent active risk engines.

```text
One signal
    ↓
Lower confidence

Multiple signals
    ↓
Higher confidence

All four engines
    ↓
Very strong multi-engine evidence
```

This is **risk detection confidence**, not a probability of fraud.

## 18. Final Unified Dataset

Main output:

```text
data/processed/final_unified_risk_analysis_v2.csv
```

Important fields include:

```text
ml_normalized_score
rule_normalized_score
financial_normalized_score
statistical_normalized_score

ml_detected
rule_detected
financial_detected
statistical_detected

active_risk_engines
available_risk_engines

base_risk_score
consensus_bonus

final_ai_risk_score
final_ai_risk_level

risk_detection_confidence
primary_risk_source

combined_risk_factors
detecting_engines
```

## 19. Investigation Layer

The investigation layer focuses on:

```text
HIGH + CRITICAL
```

projects.

Instead of manually reviewing thousands of projects, the system creates a ranked investigation queue.

Priority categories:

```text
P1 - IMMEDIATE REVIEW
P1 - PRIORITY REVIEW
P2 - HIGH PRIORITY
P3 - STANDARD REVIEW
```

Queue:

```text
data/processed/investigation_queue.csv
```

Summary:

```text
data/processed/investigation_summary.csv
```

## 20. Grounded LLM Investigation Copilot

The LLM layer follows:

```text
Verified Project Data
        ↓
Evidence Builder
        ↓
Structured Evidence
        ↓
Groq / GPT-OSS
        ↓
Grounded Investigation Report
```

Current model:

```text
openai/gpt-oss-20b
```

Provider:

```text
Groq
```

Integration:

```text
LangChain + ChatGroq
```

Temperature:

```text
0
```

### Grounding Rules

The LLM must:

- Use only verified project evidence.
- Never invent financial amounts.
- Never invent percentages.
- Never invent vendors.
- Never invent transactions.
- Never claim fraud.
- Never claim corruption.
- Never claim illegal activity.
- Never modify numerical values.
- Never exaggerate severity.
- State when information is unavailable.

Reports distinguish:

```text
Verified Observation
Risk Indicator
AI/ML Detection
Investigation Recommendation
```

## 21. Investigation Report Structure

```text
# INVESTIGATION REPORT

# 1. EXECUTIVE SUMMARY
# 2. PROJECT OVERVIEW
# 3. FINANCIAL OBSERVATIONS
# 4. PAYMENT OBSERVATIONS
# 5. PROJECT LIFECYCLE OBSERVATIONS
# 6. AI/ML RISK SIGNALS
# 7. RISK FACTORS
# 8. INVESTIGATION PRIORITIES
# 9. REQUIRED EVIDENCE
# 10. INVESTIGATION CONCLUSION
```

Reports are stored in:

```text
data/processed/investigation_reports/
```

Structured LLM output:

```text
data/processed/grounded_llm_investigation_reports_v4.csv
```

## 22. Current Investigation Results

Latest investigation pipeline:

```text
Total projects analyzed: 13,694
HIGH:                       155
CRITICAL:                    20
Investigation candidates:   175
```

The LLM pipeline attempted 20 reports and successfully generated 5. Remaining reports were deferred after the Groq daily token limit was reached.

This does not affect the ML/risk-engine outputs.

## 23. Example High-Risk Project

Example:

```text
Work ID:
WS/MP459/2025-2026/149089

Risk Level:
CRITICAL

Final AI Risk Score:
93.95

Active Engines:
4

Primary Source:
Multi-Engine Consensus
```

Example financial information:

```text
Recommended Amount: ₹12,000,000
Sanction Amount:    ₹12,000,000
Expenditure:        ₹10,478,968
Expenditure Ratio:  ≈ 0.8732
Payments:           3
Vendors:            1
```

These are risk indicators only and do not establish wrongdoing.

## 24. FastAPI Architecture

```text
React Dashboard
       ↓
     Axios
       ↓
    FastAPI
       ↓
 ┌─────┼────────────┐
 │     │            │
Projects Risk Investigations
 │     │            │
 └─────┼────────────┘
       │
   Analytics
       ↓
Processed Risk Data
```

### API Endpoints

#### Projects

```http
GET /projects
GET /projects/{work_id}
```

#### Risk

```http
GET /risk/summary
GET /risk/distribution
```

#### Investigations

```http
GET /investigations
GET /investigations/{work_id}
GET /investigations/{work_id}/report
```

#### Analytics

```http
GET /analytics/overview
GET /analytics/states
GET /analytics/categories
GET /analytics/constituencies
```

## 25. Pydantic Schemas

API response validation uses Pydantic models such as:

```text
ProjectResponse
RiskSummaryResponse
RiskDistributionResponse
AnalyticsOverviewResponse
InvestigationResponse
InvestigationReportResponse
```

## 26. Run the API

Activate the virtual environment:

```powershell
.env\Scriptsctivate
```

Run:

```powershell
python -m uvicorn api.main:app --reload
```

API:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

## 27. Project Structure

```text
E:\mplads_ai
│
├── api/
│   ├── __init__.py
│   ├── main.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── projects.py
│   │   ├── risk.py
│   │   ├── investigations.py
│   │   └── analytics.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── project_service.py
│   │   ├── risk_service.py
│   │   ├── investigation_service.py
│   │   └── analytics_service.py
│   └── schemas/
│       ├── __init__.py
│       ├── project.py
│       ├── risk.py
│       └── investigation.py
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
│
├── notebooks/
│   ├── data_preparation.py
│   ├── train_lof.py
│   ├── investigation_reporting.py
│   └── train_unified_risk_v2.py
│
├── src/
│   ├── anomaly_detection.py
│   └── ensemble_anomaly.py
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

## 28. ML Pipeline Files

### Data Preparation

```text
notebooks/data_preparation.py
```

Responsibilities:
- Load raw datasets
- Clean data
- Join datasets
- Deduplicate records
- Engineer features
- Create master dataset

### Isolation Forest

```text
src/anomaly_detection.py
```

Responsibilities:
- Prepare ML features
- Create missingness indicators
- Impute missing values
- Scale features
- Train Isolation Forest
- Generate anomaly scores
- Save model artifacts

### LOF

```text
notebooks/train_lof.py
```

Responsibilities:
- Prepare features
- Handle duplicate feature patterns
- Impute missing values
- Scale features
- Train LOF
- Generate anomaly scores

### ML Ensemble

```text
src/ensemble_anomaly.py
```

Combines Isolation Forest and LOF.

### Unified Risk Engine

```text
notebooks/train_unified_risk_v2.py
```

Combines ML, rule, financial and statistical risk.

### Investigation Reporting

```text
notebooks/investigation_reporting.py
```

Selects HIGH/CRITICAL projects, ranks investigations, builds evidence and generates grounded LLM reports.

## 29. Model Artifacts

```text
models/
├── isolation_forest.pkl
├── local_outlier_factor.pkl
├── if_scaler.pkl
├── if_imputer.pkl
├── lof_scaler.pkl
└── lof_imputer.pkl
```

## 30. End-to-End Execution

```text
Raw MPLADS Data
      ↓
Data Cleaning
      ↓
Dataset Joining
      ↓
Master Dataset
      ↓
Feature Engineering
      ↓
Isolation Forest
      ↓
LOF
      ↓
ML Ensemble
      ↓
Rule Risk
      ↓
Financial Risk
      ↓
Statistical Risk
      ↓
Unified Risk Engine
      ↓
Final AI Risk Score
      ↓
Risk Classification
      ↓
Investigation Queue
      ↓
Grounded LLM
      ↓
FastAPI
      ↓
Dashboard
```

## 31. Human-in-the-Loop Design

The system does not automatically accuse or punish projects.

```text
AI
 ↓
Detect unusual/risky pattern
 ↓
Prioritize project
 ↓
Explain risk indicators
 ↓
Human Investigator
 ↓
Verify official evidence
 ↓
Investigation Decision
```

Final decisions remain with authorized human investigators.

## 32. Important ML Limitations

### No Ground Truth

There are currently no verified fraud/non-fraud labels.

Therefore metrics such as:

```text
Accuracy
Precision
Recall
F1
ROC-AUC
```

cannot currently be used as evidence of fraud-detection performance.

### Anomaly ≠ Fraud

An anomaly means an unusual pattern, not fraud.

### LOF Score ≠ Probability

The LOF risk score is a ranking/prioritization signal, not a probability.

### Threshold Sensitivity

Risk thresholds and statistical percentile thresholds affect the final risk distribution.

Future validation should use:

```text
Historical investigations
Audit findings
Domain expert feedback
```

## 33. Retrospective vs Predictive Risk

The current system is primarily:

> **Retrospective risk analysis and investigation prioritization.**

Features such as:

```text
total_expenditure
payment_count
unique_vendors
```

may only become available after financial/project activity.

Therefore, the current system should not be described as a pure pre-project fraud prediction model.

## 34. Future ML Improvements

### Supervised Learning

If verified investigation outcomes become available, evaluate:

```text
XGBoost
LightGBM
Random Forest
Logistic Regression
```

### Explainable AI

Add:

```text
SHAP
LIME
Feature Importance
Anomaly Explanation
```

### Better Vendor Features

Future payment-level data could provide:

```text
Maximum vendor payment share
Vendor concentration
HHI
Gini coefficient
```

### Peer Group Analysis

Compare projects against similar projects by:

```text
State
Work Category
Budget
Lifecycle
Project Characteristics
```

## 35. Security

Store API secrets in:

```text
.env
```

Example:

```text
GROQ_API_KEY=your_key
TAVILY_API_KEY=your_key
```

Never commit `.env` to GitHub.

## 36. Current System Status

```text
Data Preparation             ✅
Master Dataset               ✅
Feature Engineering          ✅

Isolation Forest             ✅
LOF                           ✅
ML Ensemble                   ✅

Rule Risk Engine              ✅
Financial Risk Engine         ✅
Statistical Engine            ✅
Unified Risk Engine           ✅

Investigation Queue           ✅
Grounded LLM Investigation    ✅

FastAPI                       ✅
Pydantic                      ✅
Analytics API                 ✅
Risk API                      ✅
Investigation API             ✅
Projects API                  ✅

Frontend Dashboard             🚧
API + Frontend Integration    🚧
Production Deployment         🚧
```

## 37. Future Roadmap

### Phase 1 — Data & ML

```text
Data
 ↓
Feature Engineering
 ↓
Isolation Forest
 ↓
LOF
 ↓
ML Ensemble
```

### Phase 2 — Risk Intelligence

```text
ML + Rules + Financial + Statistical
                ↓
         Unified Risk Engine
```

### Phase 3 — Investigation

```text
HIGH / CRITICAL
       ↓
Investigation Queue
       ↓
Priority Ranking
       ↓
Grounded LLM
```

### Phase 4 — API

```text
FastAPI
+
Pydantic
+
Analytics
```

### Phase 5 — Frontend

```text
React
+
Tailwind
+
Recharts
+
Axios
```

### Phase 6 — Production

Potential architecture:

```text
React
   ↓
Nginx
   ↓
FastAPI
   ↓
PostgreSQL
   ↓
ML Services
```

## 38. Key Achievement

The major achievement of this project is not simply training an anomaly detection model.

It is an end-to-end **Government Project Risk Intelligence and Investigation platform**:

```text
13,694 Government Projects
          ↓
14-feature ML representation
          ↓
Isolation Forest + LOF
          ↓
ML Ensemble
          ↓
Rule + Financial + Statistical Engines
          ↓
Unified 0–100 Risk Score
          ↓
Risk Classification
          ↓
Investigation Prioritization
          ↓
Grounded LLM Investigation
          ↓
FastAPI
          ↓
Dashboard
```

The system transforms raw government project data into an actionable investigation workflow.

## 39. One-Line Architecture

```text
MPLADS Data → Feature Engineering → Isolation Forest + LOF → ML Ensemble → Rule/Financial/Statistical Risk → Unified Risk Engine → AI Risk Score → Investigation Queue → Grounded LLM Report → FastAPI → Dashboard
```

## 40. Project Summary

### What does the system do?

Analyzes MPLADS projects and identifies unusual or potentially risky patterns.

### How?

Using:

```text
Isolation Forest
LOF
ML Ensemble
Rule-Based Analysis
Financial Risk Analysis
Statistical Anomaly Detection
Unified Risk Scoring
Grounded LLM
```

### What does each project receive?

```text
Risk Score
Risk Level
Risk Confidence
Risk Source
Risk Factors
Detecting Engines
Investigation Priority
```

### Final Goal

Help investigators answer:

> **"Which government projects should I review first, and what evidence-based indicators should I examine?"**

---

## Disclaimer

This system is intended for research, analytics, risk prioritization, and decision support. It does not independently establish fraud, corruption, criminal conduct, or misuse of public funds. High-risk results should be reviewed using appropriate official records and by authorized human investigators.
