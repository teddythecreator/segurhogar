import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Esta Edge Function requiere la SERVICE_ROLE_KEY (secreta)
// NUNCA uses la anon key aquí, ya que necesitamos permisos de admin
// para crear usuarios y actualizar perfiles.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteUserPayload {
  email: string
  role: 'admin' | 'gestor' | 'instalador' | 'cliente'
  nombre?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verificar autenticación del usuario que hace la petición
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    // Crear cliente con la anon key para verificar el JWT del usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Verificar que el usuario es admin
    const {  { user: authUser } } = await supabaseClient.auth.getUser()
    if (!authUser) {
      throw new Error('No autorizado')
    }

    // Verificar rol del usuario
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Solo los administradores pueden invitar usuarios')
    }

    // 3. Parsear payload
    const { email, role, nombre }: InviteUserPayload = await req.json()

    if (!email || !role) {
      throw new Error('Email y rol son obligatorios')
    }

    // 4. Crear cliente con SERVICE_ROLE_KEY para operaciones de admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // ← Clave secreta
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 5. Generar contraseña temporal aleatoria
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'

    // 6. Crear usuario en auth.users
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Confirmar automáticamente
      user_metadata: {
        nombre: nombre || email.split('@')[0],
      },
    })

    if (createError) {
      if (createError.message.includes('already been registered')) {
        throw new Error('Este email ya está registrado')
      }
      throw createError
    }

    if (!newUser.user) {
      throw new Error('Error al crear el usuario')
    }

    // 7. Actualizar el perfil con el rol asignado
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role,
        nombre: nombre || email.split('@')[0],
      })
      .eq('id', newUser.user.id)

    if (updateError) {
      throw updateError
    }

    // 8. Enviar email de bienvenida con contraseña temporal
    // En producción, usar Resend o el servicio de email de Supabase
    // Por ahora, devolvemos la contraseña temporal en la respuesta
    // (solo visible para el admin que invita)

    // 9. Enviar enlace de recuperación para que establezca su contraseña
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/nueva-contrasena`,
    })

    if (resetError) {
      console.error('Error enviando email:', resetError)
      // No fallar si el email falla, el usuario ya fue creado
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Usuario invitado correctamente. Se ha enviado un email a ${email} para establecer su contraseña.`,
        userId: newUser.user.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
