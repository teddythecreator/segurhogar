import { supabase } from '@/lib/supabase';

/**
 * Helper para llamar a Supabase Edge Functions.
 * Las Edge Functions son el único lugar donde se pueden usar claves secretas
 * (service_role, Stripe, Resend, Claude API, etc.)
 *
 * El frontend solo envía la anon key, que es pública.
 */

export interface EdgeFunctionResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

export async function callEdgeFunction<T = unknown>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<EdgeFunctionResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      method: options.method || 'POST',
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: options.headers,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Tipos específicos para las funciones de negocio

export interface InviteUserPayload {
  email: string;
  role: 'admin' | 'gestor' | 'instalador' | 'cliente';
  nombre?: string;
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export async function inviteUser(payload: InviteUserPayload): Promise<EdgeFunctionResponse<InviteUserResponse>> {
  return callEdgeFunction<InviteUserResponse>('invite-user', {
    method: 'POST',
    body: payload,
  });
}

export interface UpdateUserRolePayload {
  userId: string;
  newRole: 'admin' | 'gestor' | 'instalador' | 'cliente';
}

export async function updateUserRole(payload: UpdateUserRolePayload): Promise<EdgeFunctionResponse<{ success: boolean }>> {
  return callEdgeFunction<{ success: boolean }>('update-user-role', {
    method: 'POST',
    body: payload,
  });
}
