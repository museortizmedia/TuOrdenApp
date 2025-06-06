import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPA_PROJECT;
const supabaseAnonKey = process.env.ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);