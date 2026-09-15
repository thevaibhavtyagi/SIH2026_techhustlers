const { createClient } = require('@supabase/supabase-js');
const env = require('./src/config/env.js');

const supabase = createClient(env.supabase.url, env.supabase.secretKey);

async function test() {
  const tables = ['users', 'projects', 'alerts', 'refresh_tokens', 'password_reset_tokens'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}' error:`, error.message);
    } else {
      console.log(`Table '${table}' exists. Rows found:`, data.length);
    }
  }
}

test();
