import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSecret } from '../_shared/vault.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function md5(str: string): string {
  function rh(n: number) {
    let j, s = ""
    for (j = 0; j <= 3; j++) s += (n >> (j * 8 + 4) & 0x0F).toString(16) + (n >> (j * 8) & 0x0F).toString(16)
    return s
  }
  function ad(x: number, y: number) {
    const l = (x & 0xFFFF) + (y & 0xFFFF)
    const m = (x >> 16) + (y >> 16) + (l >> 16)
    return (m << 16) | (l & 0xFFFF)
  }
  function rl(n: number, c: number) { return (n << c) | (n >>> (32 - c)) }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return ad(rl(ad(ad(a, q), ad(x, t)), s), b)
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t)
  }
  
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3]
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329)
    a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734)
    a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651)
    a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551)
    x[0] = ad(a, x[0]); x[1] = ad(b, x[1]); x[2] = ad(c, x[2]); x[3] = ad(d, x[3])
  }
  
  function md5blk(s: string) {
    const md5blks = []
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
    }
    return md5blks
  }
  
  const n = str.length
  let state = [1732584193, -271733879, -1732584194, 271733878], i
  for (i = 64; i <= n; i += 64) md5cycle(state, md5blk(str.substring(i - 64, i)))
  str = str.substring(i - 64)
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (i = 0; i < str.length; i++) tail[i >> 2] |= str.charCodeAt(i) << (i % 4 << 3)
  tail[i >> 2] |= 0x80 << (i % 4 << 3)
  if (i > 55) { md5cycle(state, tail); for (i = 0; i < 16; i++) tail[i] = 0 }
  tail[14] = n * 8
  md5cycle(state, tail)
  return rh(state[0]) + rh(state[1]) + rh(state[2]) + rh(state[3])
}

async function generateSign(params: Record<string, string>, appSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort()
  let signString = appSecret
  for (const key of sortedKeys) signString += key + params[key]
  signString += appSecret
  return md5(signString).toUpperCase()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Leer credenciales de AliExpress desde Vault
  const appKey = await getSecret('aliexpress_app_key')
  const appSecret = await getSecret('aliexpress_app_secret')
  
  if (!appKey || !appSecret) {
    throw new Error('Credenciales de AliExpress no configuradas')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No autorizado')

    const {  { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) throw new Error('No autorizado')

    const {  profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['admin', 'gestor'].includes(profile?.role || '')) {
      throw new Error('Permisos insuficientes')
    }

    const { orderId } = await req.json()
    if (!orderId) throw new Error('orderId es obligatorio')

    // 1. Obtener pedido con todos los detalles
    const {  order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(aliexpress_product_id, especificaciones))
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) throw new Error('Pedido no encontrado')

    // 2. Verificar que el pedido está pagado
    if (order.estado !== 'pagado') {
      throw new Error('El pedido debe estar pagado antes de enviarlo al proveedor')
    }

    // 3. Verificar que no existe ya un pedido AE para este pedido
    const {  existingAeOrder } = await supabase
      .from('aliexpress_orders')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (existingAeOrder) {
      throw new Error('Ya existe un pedido de AliExpress para este pedido')
    }

    // 4. Filtrar items que son de AliExpress
    const aeItems = order.items?.filter((item: any) => item.product?.aliexpress_product_id) || []
    if (aeItems.length === 0) {
      throw new Error('No hay productos de AliExpress en este pedido')
    }

    // 5. Obtener token válido
    const {  tokenData } = await supabase
      .from('aliexpress_tokens')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (!tokenData) throw new Error('No hay token de AliExpress configurado')

    const now = new Date()
    if (new Date(tokenData.expires_at) <= now) {
      throw new Error('Token expirado. Renueva el token.')
    }

    // 6. Construir dirección de envío
    const logisticsAddress = {
      address: order.envio_calle || '',
      city: order.envio_ciudad || '',
      country: 'ES',
      full_name: order.envio_nombre || '',
      mobile_no: order.envio_telefono || '',
      phone_country: '+34',
      province: order.envio_provincia || '',
      zip: order.envio_codigo_postal || '',
    }

    // 7. Construir items del pedido
    const productItems = aeItems.map((item: any) => {
      const skuAttr = item.product?.especificaciones?.sku_attr || ''
      const logisticsServiceName = item.product?.especificaciones?.logistics_service_name || 'AliExpress Standard Shipping'
      
      return {
        logistics_service_name: logisticsServiceName,
        order_memo: `Pedido SegurHogar #${order.numero}`,
        product_count: item.cantidad,
        product_id: parseInt(item.product.aliexpress_product_id),
        sku_attr: skuAttr,
      }
    })

    // 8. Hacer request a AliExpress
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, '+0800')
    
    const params: Record<string, string> = {
      app_key: appKey,
      sign_method: 'md5',
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
      session: tokenData.access_token,
      logistics_address: JSON.stringify(logisticsAddress),
      product_items: JSON.stringify(productItems),
      buyer_message: `Pedido SegurHogar #${order.numero}. Gracias por su compra.`,
    }

    const sign = await generateSign(params, appSecret)
    params.sign = sign

    const url = new URL('https://api-sg.aliexpress.com/aliexpress/ds/order/create')
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value)
    }

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.error_response) {
      throw new Error(data.error_response.sub_msg || data.error_response.msg)
    }

    const aeOrderResult = data.aliexpress_ds_order_create_response?.result
    if (!aeOrderResult || !aeOrderResult.order_id) {
      throw new Error('No se recibió ID de pedido de AliExpress')
    }

    // 9. Guardar relación en BD
    await supabase.from('aliexpress_orders').insert({
      order_id: orderId,
      aliexpress_order_id: String(aeOrderResult.order_id),
      status: aeOrderResult.order_status || 'pending',
    })

    // 10. Actualizar estado del pedido a enviado_proveedor
    await supabase
      .from('orders')
      .update({ estado: 'enviado_proveedor' })
      .eq('id', orderId)

    // 11. Registrar en historial
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      estado_anterior: order.estado,
      estado_nuevo: 'enviado_proveedor',
      usuario_id: user.id,
      notas: `Pedido enviado a AliExpress. ID AE: ${aeOrderResult.order_id}`,
    })

    return new Response(
      JSON.stringify({
        success: true,
        ae_order_id: aeOrderResult.order_id,
        ae_order_status: aeOrderResult.order_status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    // Registrar error
    try {
      const { orderId } = await req.clone().json().catch(() => ({}))
      await supabase.from('aliexpress_errors').insert({
        endpoint: 'create_order',
        error_code: 'CREATE_ORDER_ERROR',
        error_message: error instanceof Error ? error.message : 'Error desconocido',
        request_data: { orderId },
      })
    } catch (logError) {
      console.error('Error logging:', logError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
