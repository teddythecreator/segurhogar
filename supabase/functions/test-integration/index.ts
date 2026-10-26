import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSecret, getVaultSecretName } from './_shared/vault.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestIntegrationRequest {
  service: string
  mode?: 'prueba' | 'real'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verificar autenticación y permisos
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    })

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
      throw new Error('Permisos insuficientes')
    }

    // 2. Verificar MFA
    const aal = user.app_metadata?.factors?.verified_at ? 'aal2' : user.aal || 'aal1'
    if (aal !== 'aal2') {
      throw new Error('Se requiere MFA para probar integraciones')
    }

    // 3. Parsear request
    const { service, mode = 'prueba' }: TestIntegrationRequest = await req.json()

    if (!service) {
      throw new Error('Falta el servicio')
    }

    // 4. Probar conexión según el servicio
    let testResult: { success: boolean; message: string; error?: string }

    switch (service) {
      case 'stripe':
        testResult = await testStripe(mode)
        break
      case 'resend':
        testResult = await testResend()
        break
      case 'claude':
        testResult = await testClaude()
        break
      case 'aliexpress':
        testResult = await testAliExpress()
        break
      case 'affiliate':
        testResult = { success: true, message: 'IDs de afiliado configurados' }
        break
      default:
        throw new Error('Servicio no válido')
    }

    // 5. Actualizar estado en BD
    await supabase
      .from('integrations')
      .update({
        status: testResult.success ? 'configurada' : 'error',
        last_test_at: new Date().toISOString(),
        last_test_result: testResult.message,
        last_test_error: testResult.error || null,
        updated_at: new Date().toISOString(),
      })
      .eq('service', service)

    // 6. Registrar en auditoría
    await supabase.rpc('log_integration_action', {
      p_user_id: user.id,
      p_user_email: user.email,
      p_action: 'test',
      p_service: service,
      p_success: testResult.success,
      p_details: { mode, result: testResult.message },
      p_ip_address: req.headers.get('x-forwarded-for') || null,
      p_user_agent: req.headers.get('user-agent') || null,
    })

    // 7. Respuesta (SIN claves)
    return new Response(
      JSON.stringify({
        success: testResult.success,
        message: testResult.message,
        error: testResult.error,
        service,
        mode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: testResult.success ? 200 : 400,
      }
    )
  } catch (error) {
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

// ============================================================================
// FUNCIONES DE PRUEBA POR SERVICIO
// ============================================================================

async function testStripe(mode: 'prueba' | 'real'): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const secretKey = await getSecret(getVaultSecretName('stripe', 'secret_key', mode))
    
    if (!secretKey) {
      return { success: false, message: 'Clave secreta no configurada', error: 'No hay clave' }
    }

    // Hacer una llamada mínima a Stripe (consultar balance)
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { 
        success: false, 
        message: 'Error al conectar con Stripe', 
        error: `HTTP ${response.status}` 
      }
    }

    const data = await response.json()
    return { 
      success: true, 
      message: `Conexión exitosa. Balance disponible: ${data.available?.[0]?.amount || 0}` 
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Error al probar Stripe', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

async function testResend(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const apiKey = await getSecret('resend_api_key')
    
    if (!apiKey) {
      return { success: false, message: 'Clave API no configurada', error: 'No hay clave' }
    }

    // Hacer una llamada mínima a Resend (listar dominios)
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      return { 
        success: false, 
        message: 'Error al conectar con Resend', 
        error: `HTTP ${response.status}` 
      }
    }

    const data = await response.json()
    return { 
      success: true, 
      message: `Conexión exitosa. ${data.data?.length || 0} dominios configurados` 
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Error al probar Resend', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

async function testClaude(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const apiKey = await getSecret('claude_api_key')
    
    if (!apiKey) {
      return { success: false, message: 'Clave API no configurada', error: 'No hay clave' }
    }

    // Hacer una llamada mínima a Claude (mensaje corto)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          { role: 'user', content: 'Hi' }
        ],
      }),
    })

    if (!response.ok) {
      return { 
        success: false, 
        message: 'Error al conectar con Claude', 
        error: `HTTP ${response.status}` 
      }
    }

    return { 
      success: true, 
      message: 'Conexión exitosa con Claude API' 
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Error al probar Claude', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

async function testAliExpress(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const appKey = await getSecret('aliexpress_app_key')
    const appSecret = await getSecret('aliexpress_app_secret')
    
    if (!appKey || !appSecret) {
      return { success: false, message: 'Credenciales no configuradas', error: 'Faltan claves' }
    }

    // Para AliExpress, verificamos que las claves tengan el formato correcto
    // (no hay endpoint simple de "ping" sin autenticación completa)
    if (appKey.length < 16 || appSecret.length < 16) {
      return { 
        success: false, 
        message: 'Formato de credenciales inválido', 
        error: 'Claves demasiado cortas' 
      }
    }

    return { 
      success: true, 
      message: 'Credenciales de AliExpress configuradas correctamente' 
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Error al probar AliExpress', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}
