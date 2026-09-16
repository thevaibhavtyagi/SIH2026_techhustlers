require('dotenv').config();
const supabase = require('./src/config/supabaseClient');

async function run() {
  const mp = await supabase.from('users').select('email, constituency').eq('role', 'mp').eq('is_active', true).limit(1).single();
  const nodal = await supabase.from('users').select('email, state, district').eq('role', 'district_nodal').eq('is_active', true).limit(1).single();
  
  console.log('MP:', mp.data);
  console.log('Nodal:', nodal.data);
  
  process.exit(0);
}
run();
