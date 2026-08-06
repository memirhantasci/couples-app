require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: existing, error: selError } = await supabase
    .from("medicine_logs")
    .select("id")
    .eq("medicine_id", 1)
    .eq("date", "2026-08-06")
    .eq("user_id", 1)
    .eq("time", "08:00")
    .single();

  console.log('SELECT:', existing, selError);

  const { data, error } = await supabase.from('medicine_logs').insert({
    user_id: 1,
    medicine_id: 1,
    date: '2026-08-06',
    time: '08:00',
    status: 'DRANK',
    taken_at: new Date().toISOString(),
    couple_id: 'd9b9b9b9-9b9b-9b9b-9b9b-9b9b9b9b9b9b',
  });
  console.log('INSERT:', data, error);
}
run();
