import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const placeholderUrl = 'https://placeholder-project.supabase.co';
const placeholderKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY0OTY0MDAsImV4cCI6MTkzMjA3MjQwMH0.placeholder';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. App will run in limited mode with local storage only.'
  );
}

export const supabase = createClient(
  supabaseUrl || placeholderUrl,
  supabaseAnonKey || placeholderKey
);
