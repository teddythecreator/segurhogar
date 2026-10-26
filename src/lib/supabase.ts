import { createClient } from '@supabase/supabase-js';

// Las variables de entorno se cargan desde .env
// VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son públicas (anon key)
// Las claves secretas (service_role, API keys de Stripe/Claude/Resend)
// NUNCA van en el frontend. Se usan en Supabase Edge Functions.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para llamar Edge Functions (donde están las claves secretas)
export async function callEdgeFunction<T>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: body ? JSON.stringify(body) : undefined,
  });

  if (error) throw error;
  return data as T;
}
