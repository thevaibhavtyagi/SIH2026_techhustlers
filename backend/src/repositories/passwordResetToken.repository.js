const supabase = require('../config/supabaseClient');

const TABLE = 'password_reset_tokens';

const throwIfError = (error) => {
  if (error) throw new Error(`[passwordResetToken.repository] ${error.message}`);
};

const create = async ({ tokenHash, userId, expiresAt }) => {
  const { error } = await supabase.from(TABLE).insert({
    token_hash: tokenHash,
    user_id: userId,
    expires_at: expiresAt,
  });
  throwIfError(error);
};

const findValidByHash = async (tokenHash) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .maybeSingle();
  throwIfError(error);
  return data;
};

const markUsed = async (id) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ used_at: new Date().toISOString() })
    .eq('id', id);
  throwIfError(error);
};

const invalidateAllForUser = async (userId) => {
  const { error } = await supabase
    .from(TABLE)
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('used_at', null);
  throwIfError(error);
};

module.exports = { create, findValidByHash, markUsed, invalidateAllForUser };
