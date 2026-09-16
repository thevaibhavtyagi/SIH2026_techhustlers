const supabase = require('../config/supabaseClient');

const TABLE = 'investigation_reports';

// PGRST205 = PostgREST can't find the table — i.e. database/data_schema.sql
// hasn't been run yet in Supabase. Treat that as "persistence not available
// yet" rather than a hard failure, so investigation reports keep working
// (just without the persistence benefit) until the schema is applied.
const TABLE_MISSING = 'PGRST205';

const throwIfError = (error) => {
  if (error && error.code !== TABLE_MISSING) {
    throw new Error(`[investigationReport.repository] ${error.message}`);
  }
};

const findByWorkId = async (workId) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('work_id', workId).maybeSingle();
  throwIfError(error);
  return error ? null : data;
};

// source: 'offline_batch_v3' | 'live_groq'
const upsert = async ({ workId, reportText, source, reportStatus = 'COMPLETE' }) => {
  const { error } = await supabase.from(TABLE).upsert(
    {
      work_id: workId,
      report_text: reportText,
      report_status: reportStatus,
      source,
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'work_id' }
  );
  throwIfError(error);
};

module.exports = { findByWorkId, upsert };
