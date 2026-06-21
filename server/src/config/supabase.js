import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in environment');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

const payload = decodeJwtPayload(supabaseKey);
if (payload?.role === 'anon') {
  console.warn(
    '\n⚠️  SUPABASE_KEY looks like anon key. Team/project inserts may fail with RLS errors.\n' +
      '   Use service_role key from Supabase → Settings → API → service_role (secret)\n' +
      '   Or run database/fix-rls.sql in SQL Editor.\n'
  );
}
