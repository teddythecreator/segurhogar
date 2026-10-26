import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateUserRolePayload {
  userId: string
  newRole: 'admin' | 'gestor' | 'instalador' | 'cliente'
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

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Solo los administradores pueden cambiar roles')
    }

    // 3. Parsear payload
    const { userId, newRole }: UpdateUserRolePayload = await req.json()

    if (!userId || !newRole) {
      throw new Error('userId y newRole son obligatorios')
    }

    // No permitir que el admin se quite a sí mismo el rol
    if (userId === authUser.id && newRole !== 'admin') {
      throw new Error('No puedes cambiar tu propio rol de administrador')
    }

    // 4. Actualizar rol con SERVICE_ROLE_KEY
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Rol actualizado a ${newRole}`,
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
