import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePasswords() {
  console.log('Fetching users...');
  const { data: users, error } = await supabase.from('users').select('id, username, password');
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  for (const user of users) {
    if (!user.password.startsWith('$2')) {
      console.log(`Migrating password for ${user.username}...`);
      const hash = await bcrypt.hash(user.password, 10);
      await supabase.from('users').update({ password: hash }).eq('id', user.id);
      console.log(`Password for ${user.username} successfully hashed.`);
    } else {
      console.log(`User ${user.username} is already hashed.`);
    }
  }
  
  console.log('Migration complete!');
}

migratePasswords();
