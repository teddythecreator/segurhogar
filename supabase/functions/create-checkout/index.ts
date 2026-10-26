import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  product_id: string
  cantidad: number
}

interface Address {
  nombre: string
  telefono: string
  calle: string
  codigo_postal: string
  ciudad: string
  provincia: string
}

interface InvoiceData extends Address {
  razon_social: string
  nif: string
}

interface InstallationData {
  direccion: Address
  fechas_preferidas: string[]
}

interface CreateCheckoutPayload {
  items: OrderItem[]
  envio: Address
  factura: InvoiceData | null
  notas: string | null
  installation: InstallationData | null
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

    const {  { user: authUser } } = await supabaseClient.auth.getUser()
    if (!authUser) {
      throw new Error('No autorizado')
    }

    // 2. Parsear payload
    const payload: CreateCheckoutPayload = await req.json()

    if (!payload.items || payload.items.length === 0) {
      throw new Error('El carrito está vacío')
    }

    // 3. Obtener productos desde la BD (NUNCA confiar en precios del cliente)
    const productIds = payload.items.map((item) => item.product_id)
    const {  products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('estado', 'publicado')
      .eq('activo', true)

    if (productsError) throw productsError
    if (!products || products.length !== productIds.length) {
      throw new Error('Algunos productos no están disponibles')
    }

    // 4. Recalcular totales desde la BD
    let subtotal = 0
    const orderItems = payload.items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)
      if (!product) {
        throw new Error(`Producto ${item.product_id} no encontrado`)
      }

      const precio = product.precio_rebajado ?? product.precio
      const itemTotal = precio * item.cantidad
      subtotal += itemTotal

      return {
        product_id: item.product_id,
        nombre_snapshot: product.nombre,
        tipo_snapshot: product.tipo,
        cantidad: item.cantidad,
        precio_unitario: precio,
        iva_unitario: 21, // IVA estándar
      }
    })

    const iva = subtotal * 0.21
    const total = subtotal + iva

    // 5. Generar número de pedido único
    const numero = `PED-${Date.now()}`

    // 6. Crear pedido en estado pendiente_pago
    const {  order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        numero,
        user_id: authUser.id,
        estado: 'pendiente_pago',
        subtotal,
        iva,
        total,
        tipo_iva: 21,
        // Datos de envío
        envio_nombre: payload.envio.nombre,
        envio_telefono: payload.envio.telefono,
        envio_calle: payload.envio.calle,
        envio_codigo_postal: payload.envio.codigo_postal,
        envio_ciudad: payload.envio.ciudad,
        envio_provincia: payload.envio.provincia,
        // Datos de facturación
        factura_nombre: payload.factura?.razon_social || payload.envio.nombre,
        factura_nif: payload.factura?.nif || null,
        factura_calle: payload.factura?.calle || payload.envio.calle,
        factura_codigo_postal: payload.factura?.codigo_postal || payload.envio.codigo_postal,
        factura_ciudad: payload.factura?.ciudad || payload.envio.ciudad,
        factura_provincia: payload.factura?.provincia || payload.envio.provincia,
        notas_cliente: payload.notas,
      }])
      .select()
      .single()

    if (orderError) throw orderError
    if (!order) throw new Error('Error al crear el pedido')

    // 7. Crear items del pedido
    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          ...item,
        }))
      )

    if (itemsError) throw itemsError

    // 8. Registrar cambio de estado en historial
    await supabaseClient.from('order_status_history').insert([{
      order_id: order.id,
      estado_anterior: null,
      estado_nuevo: 'pendiente_pago',
      usuario_id: authUser.id,
      notas: 'Pedido creado desde el carrito',
    }])

    // 9. Crear sesión de Stripe Checkout
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-08-16',
    })

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const lineItems = orderItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nombre_snapshot,
        },
        unit_amount: Math.round(item.precio_unitario * 100), // Stripe usa céntimos
      },
      quantity: item.cantidad,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pago-cancelado`,
      customer_email: authUser.email,
      metadata: {
        order_id: order.id,
        order_numero: order.numero,
      },
    })

    // 10. Guardar session_id en el pedido
    await supabaseClient
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
