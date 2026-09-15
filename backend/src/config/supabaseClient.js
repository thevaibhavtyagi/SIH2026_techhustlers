const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

// Server-side admin client — uses the secret key, bypasses RLS. Only ever
// imported from backend code, never sent to the frontend.
const supabaseAdmin = createClient(env.supabase.url, env.supabase.secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
});

module.exports = supabaseAdmin;
