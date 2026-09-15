const supabase = require('../config/supabaseClient');

const TABLE = 'users';

const throwIfError = (error) => {
  if (error) throw new Error(`[user.repository] ${error.message}`);
};

const findByEmail = async (email) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('email', email).maybeSingle();
  throwIfError(error);
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  throwIfError(error);
  return data;
};

const create = async (user) => {
  const { data, error } = await supabase.from(TABLE).insert(user).select('*').single();
  throwIfError(error);
  return data;
};

const updateById = async (id, patch) => {
  const { data, error } = await supabase.from(TABLE).update(patch).eq('id', id).select('*').single();
  throwIfError(error);
  return data;
};

const list = async ({ role, isActive, search, page, pageSize }) => {
  let query = supabase.from(TABLE).select('*', { count: 'exact' });

  if (role) query = query.eq('role', role);
  if (isActive !== undefined) query = query.eq('is_active', isActive);
  if (search) {
    // Strip characters that are meaningful in PostgREST's filter DSL so a
    // search term can't break out of the ilike pattern into another filter.
    const safe = search.replace(/[,()%*]/g, ' ').trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  throwIfError(error);
  return { items: data, total: count };
};

const recordFailedLogin = async (id, { failedLoginAttempts, lockedUntil }) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ failed_login_attempts: failedLoginAttempts, locked_until: lockedUntil })
    .eq('id', id);
  throwIfError(error);
};

const recordSuccessfulLogin = async (id) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ failed_login_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
    .eq('id', id);
  throwIfError(error);
};

module.exports = {
  findByEmail,
  findById,
  create,
  updateById,
  list,
  recordFailedLogin,
  recordSuccessfulLogin,
};
