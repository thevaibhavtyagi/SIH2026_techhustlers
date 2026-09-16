// One-time (re-runnable) ingestion: loads the ML pipeline's project/risk/
// investigation output from the FastAPI service (ml_engine, already reading
// the real CSVs) into Supabase's `projects` + `investigation_reports` tables.
// Run `database/data_schema.sql` in the Supabase SQL Editor first.
// Run with `npm run ingest-data` (requires the ml_engine FastAPI service to
// be running and reachable at ML_ENGINE_URL).
const axios = require('axios');
const env = require('../config/env');
const supabase = require('../config/supabaseClient');

const mlClient = axios.create({ baseURL: env.mlEngineUrl, timeout: 30000 });

const PROJECT_COLUMNS = [
  'work_id', 'state', 'ida', 'constituency', 'honble_members_of_parliament', 'work_category', 'work_description',
  'recommended_date', 'recommended_amount', 'recommended_year', 'recommended_month', 'sanction_date', 'sanction_amount',
  'work_status', 'completion_date', 'completed_amount_disbursed', 'total_expenditure', 'payment_count', 'unique_vendors',
  'has_sanction', 'has_completion', 'has_expenditure', 'sanction_delay_days', 'completion_duration_days', 'sanction_difference',
  'expenditure_ratio', 'sanction_ratio', 'expenditure_difference', 'completion_amount_ratio', 'completion_amount_difference',
  'payments_per_vendor', 'financial_year', 'ml_anomaly_score', 'ensemble_is_anomaly', 'both_models_anomaly', 'model_agreement',
  'primary_ml_source', 'ensemble_risk_level', 'ml_available', 'ml_detected', 'rule_risk_score', 'risk_factors',
  'financial_risk_score', 'financial_risk_level', 'financial_risk_factors', 'statistical_anomaly_score', 'statistical_anomaly_level',
  'statistical_anomaly_factors', 'rule_available', 'financial_available', 'statistical_available', 'ml_normalized_score',
  'rule_normalized_score', 'financial_normalized_score', 'statistical_normalized_score', 'rule_detected', 'financial_detected',
  'statistical_detected', 'active_risk_engines', 'available_risk_engines', 'base_risk_score', 'consensus_bonus',
  'final_ai_risk_score', 'final_ai_risk_level', 'risk_detection_confidence', 'primary_risk_source', 'combined_risk_factors',
  'combined_risk_factor_count', 'detecting_engines',
];

const pick = (obj, keys) => {
  const out = {};
  for (const k of keys) out[k] = obj[k] ?? null;
  return out;
};

async function fetchAllPages(path, dataKey, pageSize = 100) {
  const first = await mlClient.get(path, { params: { limit: pageSize, offset: 0 } });
  const total = first.data.total;
  const rows = [...first.data[dataKey]];
  const requests = [];
  for (let offset = pageSize; offset < total; offset += pageSize) {
    requests.push(mlClient.get(path, { params: { limit: pageSize, offset } }).then((r) => r.data[dataKey]));
  }
  const rest = await Promise.all(requests);
  for (const r of rest) rows.push(...r);
  return rows;
}

async function main() {
  console.log(`Ingesting from ML engine at ${env.mlEngineUrl}...`);

  console.log('Fetching projects...');
  const projects = await fetchAllPages('/projects', 'projects');
  console.log(`  ${projects.length} projects fetched.`);

  console.log('Fetching investigation queue...');
  const investigations = await fetchAllPages('/investigations', 'investigations');
  console.log(`  ${investigations.length} queued investigations fetched.`);

  const invByWorkId = new Map(investigations.map((i) => [i.work_id, i]));

  const rows = projects.map((p) => {
    const base = pick(p, PROJECT_COLUMNS);
    const inv = invByWorkId.get(p.work_id);
    return {
      ...base,
      investigation_priority_score: inv?.investigation_priority_score ?? null,
      investigation_priority_category: inv?.investigation_priority_category ?? null,
      investigation_rank: inv?.investigation_rank ?? null,
      verified_observations: inv?.verified_observations ?? null,
    };
  });

  console.log('Upserting into Supabase `projects`...');
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('projects').upsert(batch, { onConflict: 'work_id' });
    if (error) throw new Error(`Batch ${i}-${i + batch.length} failed: ${error.message}`);
    console.log(`  upserted ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }

  console.log('Persisting pre-generated investigation reports (offline batch v3)...');
  let reportCount = 0;
  for (const inv of investigations) {
    try {
      const { data } = await mlClient.get(`/investigations/${encodeURIComponent(inv.work_id)}/report`);
      if (data?.grounded_llm_investigation_report) {
        const { error } = await supabase.from('investigation_reports').upsert(
          {
            work_id: inv.work_id,
            report_text: data.grounded_llm_investigation_report,
            report_status: 'COMPLETE',
            source: 'offline_batch_v3',
          },
          { onConflict: 'work_id' }
        );
        if (error) throw new Error(error.message);
        reportCount += 1;
      }
    } catch (err) {
      if (err.response?.status !== 404) console.error(`  report fetch failed for ${inv.work_id}:`, err.message);
    }
  }
  console.log(`  ${reportCount} pre-generated reports persisted.`);

  console.log('Done.');
}

main().catch((err) => {
  console.error('Ingestion failed:', err.message);
  process.exitCode = 1;
});
