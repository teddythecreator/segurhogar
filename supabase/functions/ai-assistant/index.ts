import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Coste por token de Claude (aproximado)
const COST_PER_TOKEN = 0.00003 // $0.03 por 1K tokens

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener usuario autenticado (si existe)
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null
    
    if (authHeader) {
      const {  { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id || null
    }

    // Verificar límites de uso si hay usuario autenticado
    if (userId) {
      const {  limitData, error: limitError } = await supabase
        .from('ai_usage_limits')
        .select('monthly_limit_usd, current_month_start')
        .eq('user_id', userId)
        .single()

      if (!limitError && limitData) {
        // Calcular uso del mes actual
        const monthStart = new Date(limitData.current_month_start)
        const {  usageData } = await supabase
          .from('ai_usage')
          .select('cost_usd')
          .eq('user_id', userId)
          .gte('created_at', monthStart.toISOString())

        const currentUsage = usageData?.reduce((sum, u) => sum + Number(u.cost_usd), 0) || 0
        
        if (currentUsage >= Number(limitData.monthly_limit_usd)) {
          throw new Error('Has alcanzado el límite mensual de uso de IA. Contacta con el administrador.')
        }
      }
    }

    // Parsear request
    const { endpoint, messages, context } = await req.json()

    if (!endpoint || !messages || !Array.isArray(messages)) {
      throw new Error('Parámetros inválidos')
    }

    // Construir prompt según el endpoint
    let systemPrompt = ''
    let tools: any[] | undefined

    switch (endpoint) {
      case 'shop-assistant':
        systemPrompt = await buildShopAssistantPrompt(supabase)
        break
      case 'panel-assistant':
        systemPrompt = await buildPanelAssistantPrompt(supabase, userId)
        tools = buildPanelTools()
        break
      case 'product-description':
        systemPrompt = buildProductDescriptionPrompt()
        break
      case 'email-response':
        systemPrompt = buildEmailResponsePrompt()
        break
      default:
        throw new Error('Endpoint no válido')
    }

    // Llamar a Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
        ...(tools && { tools }),
      }),
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API error:', errorText)
      throw new Error('Error al procesar la solicitud con IA')
    }

    const claudeData = await claudeResponse.json()
    
    // Extraer respuesta
    let responseMessage = ''
    let recommendedProducts: any[] = []

    if (claudeData.content && claudeData.content.length > 0) {
      const contentBlock = claudeData.content[0]
      
      if (contentBlock.type === 'text') {
        responseMessage = contentBlock.text
      } else if (contentBlock.type === 'tool_use') {
        // Manejar function calling para panel-assistant
        if (endpoint === 'panel-assistant') {
          const toolResult = await executeTool(supabase, contentBlock.name, contentBlock.input, userId)
          responseMessage = toolResult
        }
      }
    }

    // Extraer productos recomendados si existen
    if (endpoint === 'shop-assistant' && responseMessage.includes('PRODUCTOS_RECOMENDADOS:')) {
      const productsMatch = responseMessage.match(/PRODUCTOS_RECOMENDADOS:(.+)/s)
      if (productsMatch) {
        try {
          recommendedProducts = JSON.parse(productsMatch[1].trim())
          responseMessage = responseMessage.replace(/PRODUCTOS_RECOMENDADOS:.+/s, '').trim()
        } catch (e) {
          console.error('Error parsing products:', e)
        }
      }
    }

    // Registrar uso
    if (userId && claudeData.usage) {
      const totalTokens = (claudeData.usage.input_tokens || 0) + (claudeData.usage.output_tokens || 0)
      const cost = totalTokens * COST_PER_TOKEN

      await supabase.from('ai_usage').insert({
        user_id: userId,
        endpoint,
        tokens_input: claudeData.usage.input_tokens || 0,
        tokens_output: claudeData.usage.output_tokens || 0,
        cost_usd: cost,
      })
    }

    return new Response(
      JSON.stringify({
        message: responseMessage,
        products: recommendedProducts,
        tokens_used: {
          input: claudeData.usage?.input_tokens || 0,
          output: claudeData.usage?.output_tokens || 0,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('AI Assistant error:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// ============================================================================
// PROMPTS
// ============================================================================

async function buildShopAssistantPrompt(supabase: any): Promise<string> {
  // Obtener productos disponibles
  const {  products } = await supabase
    .from('products')
    .select('id, nombre, slug, tipo, precio, descripcion_corta, categoria:categories(nombre)')
    .eq('estado', 'publicado')
    .eq('activo', true)
    .limit(50)

  const productsList = products?.map((p: any) => 
    `- ${p.nombre} (${p.tipo}, ${p.precio}€) - ${p.descripcion_corta || 'Sin descripción'}`
  ).join('\n') || 'No hay productos disponibles'

  return `Eres un asistente de ventas de SegurHogar, una empresa española que vende productos de seguridad física y digital para hogares, personas mayores y pequeños negocios.

PRODUCTOS DISPONIBLES EN EL CATÁLOGO:
${productsList}

INSTRUCCIONES:
1. Sé cercano, amable y sencillo. Usa un tono conversacional.
2. Pregunta al cliente sobre:
   - Tipo de vivienda o negocio (casa, piso, local, oficina)
   - Tamaño aproximado
   - Si hay niños o personas mayores
   - Presupuesto aproximado
   - Necesidades específicas (vigilancia, alarma, cerraduras, ciberseguridad)
3. Recomienda SOLO productos que existan en el catálogo de arriba. NUNCA inventes productos ni precios.
4. Cuando recomiendes productos, incluye al final de tu mensaje la línea:
   PRODUCTOS_RECOMENDADOS:[{"id":"id1","nombre":"nombre1","slug":"slug1","tipo":"tipo1","precio":precio1},{"id":"id2",...}]
   (máximo 3 productos)
5. Si el cliente pide instalación, pregúntale el código postal y verifica si está en la zona de servicio (Madrid y alrededores).
6. Si no sabes algo, di que contacten al teléfono 900 123 456 o email info@segurhogar.es.
7. Responde siempre en español de España.`
}

async function buildPanelAssistantPrompt(supabase: any, userId: string | null): Promise<string> {
  // Obtener rol del usuario
  let userRole = 'cliente'
  if (userId) {
    const {  profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    userRole = profile?.role || 'cliente'
  }

  return `Eres un asistente de IA para el panel de gestión de SegurHogar. Tu rol es ayudar al usuario a analizar datos del negocio.

ROL DEL USUARIO: ${userRole}

PERMISOS SEGÚN ROL:
- admin: Acceso completo a todos los datos
- gestor: Acceso a pedidos, clientes e instalaciones
- instalador: Solo acceso a sus propias instalaciones
- cliente: Solo acceso a sus propios datos

INSTRUCCIONES:
1. Responde preguntas sobre datos del negocio usando las herramientas disponibles.
2. NUNCA ejecutes SQL directamente. Usa solo las herramientas proporcionadas.
3. Respeta los permisos del rol del usuario.
4. Sé conciso y profesional.
5. Si el usuario pregunta algo fuera de tu alcance, indícaselo amablemente.
6. Responde siempre en español de España.
7. Cuando uses datos, cítalos claramente (ej: "Según los datos, hay 5 pedidos pendientes...").`
}

function buildPanelTools(): any[] {
  return [
    {
      name: 'get_delayed_orders',
      description: 'Obtiene pedidos que llevan más de 10 días sin entregar',
      input_schema: {
        type: 'object',
        properties: {
          days: { type: 'number', description: 'Número de días (por defecto 10)' },
        },
      },
    },
    {
      name: 'get_today_installations',
      description: 'Obtiene las instalaciones programadas para hoy',
      input_schema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_tomorrow_installations',
      description: 'Obtiene las instalaciones programadas para mañana',
      input_schema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_top_products',
      description: 'Obtiene los productos más vendidos',
      input_schema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Número de productos (por defecto 10)' },
          days: { type: 'number', description: 'Últimos N días (por defecto 30)' },
        },
      },
    },
    {
      name: 'get_sales_summary',
      description: 'Obtiene un resumen de ventas',
      input_schema: {
        type: 'object',
        properties: {
          period: { type: 'string', description: 'Período: today, week, month, year' },
        },
      },
    },
    {
      name: 'get_pending_orders',
      description: 'Obtiene pedidos pendientes de pago o en proceso',
      input_schema: {
        type: 'object',
        properties: {},
      },
    },
  ]
}

function buildProductDescriptionPrompt(): string {
  return `Eres un copywriter profesional especializado en productos de seguridad. Genera descripciones atractivas y especificaciones técnicas para productos de seguridad.

INSTRUCCIONES:
1. Genera una descripción clara, atractiva y profesional en español de España.
2. Destaca los beneficios para el cliente (seguridad, tranquilidad, facilidad de uso).
3. Incluye especificaciones técnicas relevantes.
4. Usa un tono cercano pero profesional.
5. Devuelve la respuesta en formato JSON:
   {
     "description": "Descripción completa del producto...",
     "specifications": {
       "caracteristica1": "valor1",
       "caracteristica2": "valor2"
     }
   }
6. No inventes características que no se mencionen en los datos del producto.`
}

function buildEmailResponsePrompt(): string {
  return `Eres un redactor profesional de emails para SegurHogar. Redacta emails claros, profesionales y cercanos para comunicar el estado de pedidos a clientes.

INSTRUCCIONES:
1. Redacta un email completo con asunto y cuerpo.
2. Usa un tono profesional pero cercano.
3. Incluye información relevante según el estado del pedido.
4. Ofrece contacto para dudas (900 123 456, info@segurhogar.es).
5. Firma como "Equipo SegurHogar".
6. Responde siempre en español de España.
7. No inventes datos que no se proporcionen.`
}

// ============================================================================
// EJECUCIÓN DE HERRAMIENTAS
// ============================================================================

async function executeTool(supabase: any, toolName: string, input: any, userId: string | null): Promise<string> {
  try {
    switch (toolName) {
      case 'get_delayed_orders': {
        const days = input.days || 10
        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - days)

        const {  orders, error } = await supabase
          .from('orders')
          .select('numero, created_at, total, envio_nombre, estado')
          .in('estado', ['pagado', 'enviado_proveedor', 'en_transito'])
          .lt('created_at', dateThreshold.toISOString())
          .order('created_at', { ascending: true })

        if (error) throw error

        if (!orders || orders.length === 0) {
          return `No hay pedidos que lleven más de ${days} días sin entregar. ¡Buen trabajo!`
        }

        const ordersList = orders.map((o: any) => 
          `- Pedido ${o.numero} (${o.envio_nombre || 'Cliente'}): ${o.total}€, creado el ${new Date(o.created_at).toLocaleDateString('es-ES')}`
        ).join('\n')

        return `Hay ${orders.length} pedidos que llevan más de ${days} días sin entregar:\n\n${ordersList}\n\n¿Quieres que te ayude con algo más?`
      }

      case 'get_today_installations': {
        const today = new Date().toISOString().split('T')[0]
        const {  installations, error } = await supabase
          .from('installations')
          .select('id, fecha, hora_inicio, direccion_calle, direccion_ciudad, customer:customers(nombre), instalador:profiles(nombre)')
          .eq('fecha', today)
          .order('hora_inicio')

        if (error) throw error

        if (!installations || installations.length === 0) {
          return 'No hay instalaciones programadas para hoy.'
        }

        const installationsList = installations.map((i: any) => 
          `- ${i.hora_inicio || 'Hora no definida'}: ${i.customer?.nombre || 'Cliente'} en ${i.direccion_calle}, ${i.direccion_ciudad}. Instalador: ${i.instalador?.nombre || 'No asignado'}`
        ).join('\n')

        return `Hay ${installations.length} instalaciones programadas para hoy:\n\n${installationsList}`
      }

      case 'get_tomorrow_installations': {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]

        const {  installations, error } = await supabase
          .from('installations')
          .select('id, fecha, hora_inicio, direccion_calle, direccion_ciudad, customer:customers(nombre), instalador:profiles(nombre)')
          .eq('fecha', tomorrowStr)
          .order('hora_inicio')

        if (error) throw error

        if (!installations || installations.length === 0) {
          return 'No hay instalaciones programadas para mañana.'
        }

        const installationsList = installations.map((i: any) => 
          `- ${i.hora_inicio || 'Hora no definida'}: ${i.customer?.nombre || 'Cliente'} en ${i.direccion_calle}, ${i.direccion_ciudad}. Instalador: ${i.instalador?.nombre || 'No asignado'}`
        ).join('\n')

        return `Hay ${installations.length} instalaciones programadas para mañana:\n\n${installationsList}`
      }

      case 'get_top_products': {
        const limit = input.limit || 10
        const days = input.days || 30
        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - days)

        const {  items, error } = await supabase
          .from('order_items')
          .select('product_id, cantidad, nombre_snapshot, product:products(nombre)')
          .gte('created_at', dateThreshold.toISOString())

        if (error) throw error

        // Agrupar por producto
        const productMap = new Map<string, { nombre: string; cantidad: number }>()
        items?.forEach((item: any) => {
          const nombre = item.product?.nombre || item.nombre_snapshot
          const current = productMap.get(item.product_id) || { nombre, cantidad: 0 }
          current.cantidad += item.cantidad
          productMap.set(item.product_id, current)
        })

        const topProducts = Array.from(productMap.entries())
          .sort((a, b) => b[1].cantidad - a[1].cantidad)
          .slice(0, limit)

        if (topProducts.length === 0) {
          return `No hay datos de ventas en los últimos ${days} días.`
        }

        const productsList = topProducts.map(([_, data], index) => 
          `${index + 1}. ${data.nombre}: ${data.cantidad} unidades`
        ).join('\n')

        return `Top ${limit} productos más vendidos en los últimos ${days} días:\n\n${productsList}`
      }

      case 'get_sales_summary': {
        const period = input.period || 'month'
        let dateThreshold = new Date()

        switch (period) {
          case 'today':
            dateThreshold.setHours(0, 0, 0, 0)
            break
          case 'week':
            dateThreshold.setDate(dateThreshold.getDate() - 7)
            break
          case 'month':
            dateThreshold.setMonth(dateThreshold.getMonth() - 1)
            break
          case 'year':
            dateThreshold.setFullYear(dateThreshold.getFullYear() - 1)
            break
        }

        const {  orders, error } = await supabase
          .from('orders')
          .select('total, estado')
          .eq('estado', 'pagado')
          .gte('pagado_en', dateThreshold.toISOString())

        if (error) throw error

        const totalSales = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0
        const totalOrders = orders?.length || 0
        const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0

        return `Resumen de ventas (${period}):\n- Total ventas: ${totalSales.toFixed(2)}€\n- Número de pedidos: ${totalOrders}\n- Ticket medio: ${averageTicket.toFixed(2)}€`
      }

      case 'get_pending_orders': {
        const {  orders, error } = await supabase
          .from('orders')
          .select('numero, estado, total, envio_nombre, created_at')
          .in('estado', ['pendiente_pago', 'pagado', 'enviado_proveedor'])
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        if (!orders || orders.length === 0) {
          return 'No hay pedidos pendientes en este momento.'
        }

        const ordersList = orders.map((o: any) => 
          `- ${o.numero} (${o.envio_nombre || 'Cliente'}): ${o.total}€, estado: ${o.estado}`
        ).join('\n')

        return `Hay ${orders.length} pedidos pendientes:\n\n${ordersList}`
      }

      default:
        return 'Herramienta no reconocida.'
    }
  } catch (error) {
    console.error('Tool execution error:', error)
    return 'Error al ejecutar la herramienta. Por favor, intenta de nuevo.'
  }
}
