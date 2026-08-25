import { createClient } from '@supabase/supabase-js';

// Environment variables from Vite (.env / Vercel / Cloud Run)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Aceita VITE_SUPABASE_ANON_KEY (nome padrão) ou VITE_SUPABASE_PUBLISHABLE_KEY (nome novo do Supabase)
// para evitar que a nuvem "desligue" silenciosamente por causa de uma variável com nome diferente.
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

// Verify if Supabase environment variables are provided
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 10 &&
    !supabaseUrl.includes('placeholder')
  );
};

// Fallback dummy client if credentials are not configured yet, preventing app crashes
const dummyUrl = 'https://xyzcompanyplaceholder.supabase.co';
const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : dummyUrl,
  isSupabaseConfigured() ? supabaseAnonKey : dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
