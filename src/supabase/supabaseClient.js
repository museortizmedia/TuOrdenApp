import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yepdystrtpfmdcdqimws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcGR5c3RydHBmbWRjZHFpbXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzgxNzUsImV4cCI6MjA2NDc1NDE3NX0.vfNUBTiWUuEB3-Lao6dligMYPsp0wMOCviESx3o39nw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);