import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateSecretFormat, getVaultSecretName, clearSecretCache } from './_shared/vault.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaveIntegrationRequest {
  service: string
  keyName: string
  value: string
  mode?: 'prueba' | 'real'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verificar autenticación
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // 2. Verificar usuario y rol admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('No autorizado')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // Registrar intento no autorizado
      await supabase.rpc('log_integration_action', {
        p_user_id: user.id,
        p_user_email: user.email,
        p_action: 'save',
        p_service: 'unknown',
        p_success: false,
        p_details: { error: 'Intento de acceso sin rol admin' },
        p_ip_address: req.headers.get('x-forwarded-for') || null,
        p_user_agent: req.headers.get('user-agent') || null,
      })
      throw new Error('Permisos insuficientes')
    }

    // 3. Verificar MFA activo (nivel aal2)
    const aal = user.app_metadata?.factors?.verified_at
      ? 'aal2'
      : user.aal || 'aal1'
    
    if (aal !== 'aal2') {
      await supabase.rpc('log_integration_action', {
        p_user_id: user.id,
        p_user_email: user.email,
        p_action: 'save',
        p_service: 'unknown',
        p_success: false,
        p_details: { error: 'Intento sin MFA activo' },
        p_ip_address: req.headers.get('x-forwarded-for') || null,
        p_user_agent: req.headers.get('user-agent') || null,
      })
      throw new Error('Se requiere autenticación de dos factores (MFA) para gestionar integraciones')
    }

    // 4. Parsear request
    const { service, keyName, value, mode = 'prueba' }: SaveIntegrationRequest = await req.json()

    if (!service || !keyName || !value) {
      throw new Error('Faltan parámetros obligatorios')
    }

    // 5. Validar servicio y clave
    const validServices = ['stripe', 'resend', 'claude', 'aliexpress', 'affiliate']
    if (!validServices.includes(service)) {
      throw new Error('Servicio no válido')
    }

    // 6. Validar formato de la clave
    if (!validateSecretFormat(service, keyName, value)) {
      await supabase.rpc('log_integration_action', {
        p_user_id: user.id,
        p_user_email: user.email,
        p_action: 'save',
        p_service,
        p_success: false,
        p_details: { error: 'Formato de clave inválido', keyName },
        p_ip_address: req.headers.get('x-forwarded-for') || null,
        p_user_agent: req.headers.get('user-agent') || null,
      })
      throw new Error('Formato de clave inválido')
    }

    // 7. Guardar en Vault
    const secretName = getVaultSecretName(service, keyName, mode)
    
    const { error: vaultError } = await supabase.rpc('save_integration_secret', {
      p_service: service,
      p_secret_name: secretName,
      p_secret_value: value,
    })

    if (vaultError) {
      throw new Error('Error al guardar el secreto')
    }

    // 8. Actualizar metadatos en tabla integrations
    await supabase.rpc('update_integration_metadata', {
      p_service: service,
      p_key_name: keyName,
      p_key_value: value,
    })

    // 9. Actualizar estado de la integración
    await supabase
      .from('integrations')
      .update({
        status: 'configurada',
        mode,
        updated_at: new Date().toISOString(),
      })
      .eq('service', service)

    // 10. Limpiar caché del secreto
    clearSecretCache(secretName)

    // 11. Registrar en auditoría (SIN la clave)
    await supabase.rpc('log_integration_action', {
      p_user_id: user.id,
      p_user_email: user.email,
      p_action: 'save',
      p_service,
      p_success: true,
      p_details: { keyName, mode, lastFour: value.slice(-4) },
      p_ip_address: req.headers.get('x-forwarded-for') || null,
      p_user_agent: req.headers.get('user-agent') || null,
    })

    // 12. Respuesta exitosa (SIN devolver la clave)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Clave guardada correctamente',
        service,
        keyName,
        mode,
        lastFour: value.slice(-4),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    // NUNCA loguear el valor de la clave
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
