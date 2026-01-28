import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Check if env vars are loaded
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase env vars not loaded!', { supabaseUrl, supabaseAnonKey });
} else {
    console.log('✅ Supabase initialized:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
