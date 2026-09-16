const supabase = require('../config/supabaseClient');

const TABLE = 'projects';

const throwIfError = (error) => {
  if (error) throw new Error(`[project.repository] ${error.message}`);
};

// Manually-added projects (via the admin "New Project" form) have no ML risk
// score yet — those columns stay null until the next ml_engine pipeline run
// picks this work_id up from the ingested dataset.
const create = async (fields) => {
  const { data, error } = await supabase.from(TABLE).insert(fields).select().single();
  throwIfError(error);
  return data;
};

const findByWorkId = async (workId) => {
  const { data, error } = await supabase.from(TABLE).select('work_id').eq('work_id', workId).maybeSingle();
  throwIfError(error);
  return data;
};

const getByWorkId = async (workId) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('work_id', workId).maybeSingle();
  throwIfError(error);
  return data;
};

const list = async ({ limit = 20, offset = 0, riskLevel, state, district, constituency, status } = {}) => {
  let query = supabase.from(TABLE).select('*', { count: 'exact' });
  if (riskLevel) query = query.ilike('final_ai_risk_level', riskLevel);
  if (state) query = query.ilike('state', `%${state}%`);
  if (district) query = query.ilike('ida', `%${district}%`);
  if (constituency) query = query.ilike('constituency', `%${constituency}%`);
  if (status) query = query.ilike('work_status', `%${status}%`);

  const from = Number(offset) || 0;
  const to = from + (Number(limit) || 20) - 1;
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
  throwIfError(error);
  return { total: count ?? 0, limit: Number(limit) || 20, offset: from, projects: data || [] };
};

module.exports = { create, findByWorkId, getByWorkId, list };
