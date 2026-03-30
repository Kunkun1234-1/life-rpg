import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppkgevflzwiybktyfmdy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwa2dldmZsendpeWJrdHlmbWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTE3NTEsImV4cCI6MjA5MDQyNzc1MX0.ZCMWqiG5qJwQvLFUuzCw6XCX-fN1BTXJtuKxsyGLt8g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
