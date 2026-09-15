const supabase = require('../config/supabaseClient');

const TABLE = 'refresh_tokens';

const throwIfError = (error) => {
  if (error) throw new Error(`[refreshToken.repository] ${error.message}`);
};

const create = async ({ tokenHash, userId, expiresAt, createdByIp, userAgent }) => {
  const { error } = await supabase.from(TABLE).insert({
    token_hash: tokenHash,
    user_id: userId,
    expires_at: expiresAt,
    created_by_ip: createdByIp,
    user_agent: userAgent,
  });
  throwIfError(error);
};

const findActiveByHash = async (tokenHash) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, users(*)')
    .eq('token_hash', tokenHash)
    .maybeSingle();
  throwIfError(error);
  return data;
};

const revokeByHash = async (tokenHash, replacedByTokenHash = null) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ revoked_at: new Date().toISOString(), replaced_by_token_hash: replacedByTokenHash })
    .eq('token_hash', tokenHash)
    .is('revoked_at', null);
  throwIfError(error);
};

const revokeAllForUser = async (userId) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
  throwIfError(error);
};

module.exports = { create, findActiveByHash, revokeByHash, revokeAllForUser };
