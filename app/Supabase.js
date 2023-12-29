// Supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://agosjbtaobpytmhmxmhf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnb3NqYnRhb2JweXRtaG14bWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI0NDcwODMsImV4cCI6MjAxODAyMzA4M30.OS9to7cUtkfI5mId_qUjT-_nkv6KpCSJ9AgcEVwNUnU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
