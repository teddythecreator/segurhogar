import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-08-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response('Invalid signature', { status: 400 })
  }

  // Crear cliente con service_role_key para operaciones de admin
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Manejar eventos de Stripe
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Verificar que el pago fue exitoso
      if (session.payment_status !== 'paid') {
        console.log('Payment not completed, skipping')
        break
      }

      const orderId = session.metadata?.order_id
      if (!orderId) {
        console.error('No order_id in session metadata')
        break
      }

      // 1. Obtener pedido actual
      const {  order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        console.error('Order not found:', orderError)
        break
      }

      // 2. Actualizar estado del pedido a "pagado"
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          estado: 'pagado',
          pagado_en: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error updating order:', updateError)
        break
      }

      // 3. Registrar cambio de estado en historial
      await supabaseAdmin.from('order_status_history').insert([{
        order_id: orderId,
        estado_anterior: order.estado,
        estado_nuevo: 'pagado',
        notas: `Pago completado vía Stripe. Session: ${session.id}`,
      }])

      // 4. Si hay instalación, crearla en estado "solicitada"
      if (order.notas_cliente?.includes('instalación') || order.notas_cliente?.includes('Instalación')) {
        // Buscar si hay datos de instalación en las notas o en un campo JSON
        // Por ahora, creamos una instalación básica con los datos del pedido
        const { error: installationError } = await supabaseAdmin
          .from('installations')
          .insert([{
            order_id: orderId,
            customer_id: null, // Se puede asociar después si es necesario
            estado: 'solicitada',
            fecha: new Date(), // Fecha por defecto, se programará después
            direccion_calle: order.envio_calle || '',
            direccion_codigo_postal: order.envio_codigo_postal || '',
            direccion_ciudad: order.envio_ciudad || '',
            direccion_provincia: order.envio_provincia || '',
            notas: 'Instalación solicitada por el cliente',
          }])

        if (installationError) {
          console.error('Error creating installation:', installationError)
        }
      }

      console.log(`Order ${orderId} marked as paid`)
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      
      if (orderId) {
        // Marcar pedido como cancelado
        await supabaseAdmin
          .from('orders')
          .update({ estado: 'cancelado' })
          .eq('id', orderId)

        await supabaseAdmin.from('order_status_history').insert([{
          order_id: orderId,
          estado_anterior: 'pendiente_pago',
          estado_nuevo: 'cancelado',
          notas: 'Sesión de pago expirada',
        }])

        console.log(`Order ${orderId} cancelled (session expired)`)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
