import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDevices() {
  console.log('Clearing authorized devices to force OTP...');
  const { error } = await supabase.from('device_authorizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('All devices cleared. Next login will require OTP.');
  }
}

clearDevices();
