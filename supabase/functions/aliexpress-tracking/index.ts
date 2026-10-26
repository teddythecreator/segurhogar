import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  const appKey = Deno.env.get('ALIEXPRESS_APP_KEY')!
  const appSecret = Deno.env.get('ALIEXPRESS_APP_SECRET')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const results = {
    checked: 0,
    updated: 0,
    errors: 0,
  }

  try {
    // 1. Obtener token válido
    const {  tokenData } = await supabase
      .from('aliexpress_tokens')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (!tokenData) throw new Error('No hay token configurado')

    const now = new Date()
    if (new Date(tokenData.expires_at) <= now) {
      throw new Error('Token expirado')
    }

    // 2. Obtener pedidos pendientes de tracking
    const {  aeOrders, error } = await supabase
      .from('aliexpress_orders')
      .select(`
        *,
        order:orders(id, numero, estado)
      `)
      .not('aliexpress_order_id', 'is', null)
      .neq('status', 'finished')
      .neq('status', 'closed')

    if (error) throw error
    if (!aeOrders || aeOrders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No hay pedidos para consultar', ...results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Consultar cada pedido
    for (const aeOrder of aeOrders) {
      try {
        const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, '+0800')
        
        const params: Record<string, string> = {
          app_key: appKey,
          sign_method: 'md5',
          timestamp: timestamp,
          format: 'json',
          v: '2.0',
          session: tokenData.access_token,
          order_id: aeOrder.aliexpress_order_id,
        }

        const sign = await generateSign(params, appSecret)
        params.sign = sign

        const url = new URL('https://api-sg.aliexpress.com/aliexpress/ds/order/get')
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.append(key, value)
        }

        const response = await fetch(url.toString())
        const data = await response.json()

        if (data.error_response) {
          throw new Error(data.error_response.sub_msg || data.error_response.msg)
        }

        const aeOrderData = data.aliexpress_ds_order_get_response?.result
        if (!aeOrderData) continue

        results.checked++

        // 4. Extraer información de tracking
        const trackingNumber = aeOrderData.logistics_no || aeOrderData.tracking_number
        const trackingUrl = aeOrderData.logistics_track_url
        const status = aeOrderData.order_status

        // 5. Actualizar en BD
        const updateData: any = {
          status: status,
          last_tracking_check: new Date().toISOString(),
        }

        if (trackingNumber) {
          updateData.tracking_number = trackingNumber
        }
        if (trackingUrl) {
          updateData.tracking_url = trackingUrl
        }

        await supabase
          .from('aliexpress_orders')
          .update(updateData)
          .eq('id', aeOrder.id)

        // 6. Si hay número de seguimiento, actualizar el pedido principal
        if (trackingNumber && !aeOrder.order?.notas_internas?.includes(trackingNumber)) {
          await supabase
            .from('orders')
            .update({
              notas_internas: [
                aeOrder.order?.notas_internas || '',
                `[${new Date().toLocaleString('es-ES')}] Nº seguimiento AE: ${trackingNumber}`,
              ].join('\n'),
            })
            .eq('id', aeOrder.order_id)
        }

        // 7. Si el pedido está entregado, actualizar estado
        if (status === 'finished' || status === 'buyer_accept_goods') {
          await supabase
            .from('orders')
            .update({ estado: 'entregado' })
            .eq('id', aeOrder.order_id)

          await supabase.from('order_status_history').insert({
            order_id: aeOrder.order_id,
            estado_anterior: aeOrder.order?.estado || 'enviado_proveedor',
            estado_nuevo: 'entregado',
            notas: `Entregado según AliExpress. Tracking: ${trackingNumber || 'N/A'}`,
          })

          results.updated++
        }

        // 8. Si el pedido está en tránsito, actualizar estado
        if (status === 'wait_buyer_accept_goods' && aeOrder.order?.estado === 'enviado_proveedor') {
          await supabase
            .from('orders')
            .update({ estado: 'en_transito' })
            .eq('id', aeOrder.order_id)

          await supabase.from('order_status_history').insert({
            order_id: aeOrder.order_id,
            estado_anterior: 'enviado_proveedor',
            estado_nuevo: 'en_transito',
            notas: `En tránsito según AliExpress. Tracking: ${trackingNumber || 'N/A'}`,
          })

          results.updated++
        }
      } catch (orderError) {
        results.errors++
        
        await supabase.from('aliexpress_errors').insert({
          endpoint: 'tracking_check',
          error_code: 'TRACKING_ERROR',
          error_message: `Error consultando tracking ${aeOrder.aliexpress_order_id}: ${
            orderError instanceof Error ? orderError.message : 'Error desconocido'
          }`,
          request_data: { ae_order_id: aeOrder.aliexpress_order_id },
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    await supabase.from('aliexpress_errors').insert({
      endpoint: 'tracking_cron',
      error_code: 'CRITICAL_ERROR',
      error_message: error instanceof Error ? error.message : 'Error desconocido',
    })

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        ...results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
