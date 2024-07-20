// Supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
