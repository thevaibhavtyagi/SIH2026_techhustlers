-- MPLADS DRISHTI — Project/risk/investigation data schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- Until now, `ml_engine`'s FastAPI service read project/risk/investigation
-- data straight from local CSVs (data/processed/final_unified_risk_analysis_v2.csv
-- etc.) into in-memory pandas dataframes at process startup — nothing lived in
-- a database. This creates the persistent home for that data: one `projects`
-- table matching the real ML pipeline output (not the earlier mock-shaped
-- `projects` table in schema.sql — that one is stale, see its own header),
-- plus `investigation_reports` to persist both the offline-batch and
-- live-Groq-generated investigation explanations so they survive a restart
-- instead of only living in backend/src/services/llmService.js's in-memory
-- cache.
--
-- Column names match ml_engine's raw CSV/API output (work_id, snake_case)
-- exactly, so ingestion can copy values through without renaming.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / DROP ... IF EXISTS.

create table if not exists projects (
  work_id text primary key,

  -- Location / identity
  state text,
  ida text,                              -- implementing district authority
  constituency text,
  honble_members_of_parliament text,
  work_category text,
  work_description text,

  -- Financial / lifecycle
  recommended_date date,
  recommended_amount numeric,
  recommended_year integer,
  recommended_month integer,
  sanction_date date,
  sanction_amount numeric,
  work_status text,
  completion_date date,
  completed_amount_disbursed numeric,
  total_expenditure numeric,
  payment_count numeric,
  unique_vendors numeric,
  has_sanction integer,
  has_completion integer,
  has_expenditure integer,
  sanction_delay_days numeric,
  completion_duration_days numeric,
  sanction_difference numeric,
  expenditure_ratio numeric,
  sanction_ratio numeric,
  expenditure_difference numeric,
  completion_amount_ratio numeric,
  completion_amount_difference numeric,
  payments_per_vendor numeric,
  financial_year text,

  -- Risk engine outputs
  ml_anomaly_score numeric,
  ensemble_is_anomaly integer,
  both_models_anomaly integer,
  model_agreement text,
  primary_ml_source text,
  ensemble_risk_level text,
  ml_available integer,
  ml_detected integer,
  rule_risk_score numeric,
  risk_factors text,
  financial_risk_score numeric,
  financial_risk_level text,
  financial_risk_factors text,
  statistical_anomaly_score numeric,
  statistical_anomaly_level text,
  statistical_anomaly_factors text,
  rule_available integer,
  financial_available integer,
  statistical_available integer,
  ml_normalized_score numeric,
  rule_normalized_score numeric,
  financial_normalized_score numeric,
  statistical_normalized_score numeric,
  rule_detected integer,
  financial_detected integer,
  statistical_detected integer,
  active_risk_engines integer,
  available_risk_engines integer,
  base_risk_score numeric,
  consensus_bonus numeric,
  final_ai_risk_score numeric,
  final_ai_risk_level text,
  risk_detection_confidence text,
  primary_risk_source text,
  combined_risk_factors text,
  combined_risk_factor_count integer,
  detecting_engines text,

  -- Investigation queue — populated only for the projects flagged for
  -- investigation (final_ai_risk_level HIGH/CRITICAL); null for the rest.
  investigation_priority_score numeric,
  investigation_priority_category text,
  investigation_rank integer,
  verified_observations text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_state_idx on projects(state);
create index if not exists projects_district_idx on projects(ida);
create index if not exists projects_constituency_idx on projects(constituency);
create index if not exists projects_risk_level_idx on projects(final_ai_risk_level);
create index if not exists projects_investigation_rank_idx on projects(investigation_rank) where investigation_rank is not null;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
before update on projects
for each row execute function set_updated_at();

create table if not exists investigation_reports (
  work_id text primary key references projects(work_id) on delete cascade,
  report_text text not null,
  report_status text not null default 'COMPLETE',
  source text not null,                  -- 'offline_batch_v3' | 'live_groq'
  generated_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table investigation_reports enable row level security;

grant usage on schema public to service_role;
grant all privileges on projects, investigation_reports to service_role;
