import { createClient } from '@supabase/supabase-js';

// Variables de entorno públicas (anon key)
// Las claves secretas (service_role, Stripe, Resend, Claude) NUNCA van aquí.
// Se usan en Supabase Edge Functions.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Variables de entorno de Supabase no configuradas. ' +
    'Copia .env.example a .env y rellena los valores.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Helper para llamar a Supabase Edge Functions.
 * Las Edge Functions son el único lugar donde se pueden usar claves secretas
 * (Stripe, Resend, Claude API, etc.)
 */
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
