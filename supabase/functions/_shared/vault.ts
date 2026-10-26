/**
 * Módulo compartido para leer secretos desde Supabase Vault
 * 
 * SEGURIDAD:
 * - Solo puede ser usado por Edge Functions (service role)
 * - Implementa caché en memoria para reducir lecturas
 * - Fallback a variables de entorno si el secreto no existe en Vault
 * - NUNCA expone las claves en logs o errores
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Caché en memoria (se pierde al reiniciar la Edge Function)
const secretCache = new Map<string, { value: string; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

// Mapeo de nombres de secretos a variables de entorno (fallback)
const ENV_FALLBACKS: Record<string, string> = {
  'stripe_secret_key_prueba': 'STRIPE_SECRET_KEY_TEST',
  'stripe_secret_key_real': 'STRIPE_SECRET_KEY_LIVE',
  'stripe_webhook_secret_prueba': 'STRIPE_WEBHOOK_SECRET_TEST',
  'stripe_webhook_secret_real': 'STRIPE_WEBHOOK_SECRET_LIVE',
  'resend_api_key': 'RESEND_API_KEY',
  'resend_from_email': 'RESEND_FROM_EMAIL',
  'claude_api_key': 'ANTHROPIC_API_KEY',
  'aliexpress_app_key': 'ALIEXPRESS_APP_KEY',
  'aliexpress_app_secret': 'ALIEXPRESS_APP_SECRET',
}

/**
 * Obtiene un secreto desde Vault con caché y fallback a variables de entorno
 * 
 * @param secretName - Nombre del secreto en Vault
 * @returns El valor del secreto o undefined si no existe
 * 
 * @example
 * const stripeKey = await getSecret('stripe_secret_key_prueba')
 */
export async function getSecret(secretName: string): Promise<string | undefined> {
  // 1. Verificar caché
  const cached = secretCache.get(secretName)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  // 2. Intentar leer desde Vault
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Faltan variables de entorno de Supabase')
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await supabase.rpc('get_integration_secret', {
      p_secret_name: secretName,
    })

    if (error) {
      // NUNCA loguear el error completo (podría contener información sensible)
      console.warn(`Error leyendo secreto ${secretName} de Vault, usando fallback`)
    } else if (data) {
      // Guardar en caché
      secretCache.set(secretName, {
        value: data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
      return data
    }
  } catch (err) {
    // NUNCA loguear el error completo
    console.warn(`Excepción leyendo secreto ${secretName}, usando fallback`)
  }

  // 3. Fallback a variable de entorno
  const envVar = ENV_FALLBACKS[secretName]
  if (envVar) {
    const envValue = Deno.env.get(envVar)
    if (envValue) {
      // Guardar en caché
      secretCache.set(secretName, {
        value: envValue,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
      return envValue
    }
  }

  // 4. No existe el secreto
  return undefined
}

/**
 * Obtiene múltiples secretos de una vez
 * 
 * @param secretNames - Array de nombres de secretos
 * @returns Objeto con los secretos encontrados
 * 
 * @example
 * const secrets = await getSecrets(['stripe_secret_key_prueba', 'stripe_webhook_secret_prueba'])
 * // { stripe_secret_key_prueba: 'sk_...', stripe_webhook_secret_prueba: 'whsec_...' }
 */
export async function getSecrets(
  secretNames: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {}

  await Promise.all(
    secretNames.map(async (name) => {
      const value = await getSecret(name)
      if (value) {
        results[name] = value
      }
    })
  )

  return results
}

/**
 * Limpia la caché de secretos
 * Útil después de actualizar un secreto
 */
export function clearSecretCache(secretName?: string): void {
  if (secretName) {
    secretCache.delete(secretName)
  } else {
    secretCache.clear()
  }
}

/**
 * Valida el formato de una clave según el servicio
 * 
 * @param service - Nombre del servicio
 * @param keyName - Nombre de la clave
 * @param value - Valor a validar
 * @returns true si el formato es válido
 */
export function validateSecretFormat(
  service: string,
  keyName: string,
  value: string
): boolean {
  if (!value || value.trim().length === 0) {
    return false
  }

  switch (service) {
    case 'stripe':
      if (keyName === 'secret_key') {
        // sk_test_... o sk_live_...
        return /^(sk_test_|sk_live_)[A-Za-z0-9]{24,}$/.test(value)
      }
      if (keyName === 'webhook_secret') {
        // whsec_...
        return /^whsec_[A-Za-z0-9]{32,}$/.test(value)
      }
      break

    case 'resend':
      if (keyName === 'api_key') {
        // re_...
        return /^re_[A-Za-z0-9]{30,}$/.test(value)
      }
      if (keyName === 'from_email') {
        // Email válido
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      }
      break

    case 'claude':
      if (keyName === 'api_key') {
        // sk-ant-...
        return /^sk-ant-[A-Za-z0-9-]{50,}$/.test(value)
      }
      if (keyName === 'daily_limit' || keyName === 'monthly_limit') {
        // Número positivo
        const num = parseInt(value)
        return !isNaN(num) && num > 0
      }
      break

    case 'aliexpress':
      if (keyName === 'app_key' || keyName === 'app_secret') {
        // Alfanumérico de longitud razonable
        return /^[A-Za-z0-9]{16,}$/.test(value)
      }
      if (keyName === 'access_token' || keyName === 'refresh_token') {
        // Token largo
        return value.length >= 50
      }
      break

    case 'affiliate':
      // IDs de afiliado, formato libre pero no vacío
      return value.trim().length > 0
  }

  return true // Si no hay validación específica, aceptar
}

/**
 * Obtiene el nombre del secreto en Vault según servicio y modo
 */
export function getVaultSecretName(
  service: string,
  keyName: string,
  mode: 'prueba' | 'real' = 'prueba'
): string {
  // Para Stripe, diferenciar entre modo prueba y real
  if (service === 'stripe') {
    return `${service}_${keyName}_${mode}`
  }
  
  // Para el resto, no diferenciar por modo
  return `${service}_${keyName}`
}
