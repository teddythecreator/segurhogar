import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getSecret } from '../_shared/vault.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AliExpress API base URL (producción)
const AE_API_URL = 'https://api-sg.aliexpress.com'

// ============================================================================
// ALGORITMO DE FIRMA DE ALIEXPRESS
// ============================================================================

/**
 * Genera la firma HMAC-MD5 requerida por AliExpress
 * 
 * El algoritmo:
 * 1. Concatena: app_secret + parámetros ordenados alfabéticamente + app_secret
 * 2. Calcula MD5 del resultado
 * 3. Convierte a mayúsculas
 */
async function generateSign(params: Record<string, string>, appSecret: string): Promise<string> {
  // 1. Ordenar parámetros alfabéticamente por clave
  const sortedKeys = Object.keys(params).sort()
  
  // 2. Construir string a firmar: key1value1key2value2...
  let signString = appSecret
  for (const key of sortedKeys) {
    signString += key + params[key]
  }
  signString += appSecret
  
  // 3. Calcular MD5
  const encoder = new TextEncoder()
  const data = encoder.encode(signString)
  const hashBuffer = await crypto.subtle.digest('MD5', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // 4. Convertir a mayúsculas
  return hashHex.toUpperCase()
}

// Fallback si MD5 no está disponible en crypto.subtle
async function generateSignFallback(params: Record<string, string>, appSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort()
  let signString = appSecret
  for (const key of sortedKeys) {
    signString += key + params[key]
  }
  signString += appSecret
  
  // MD5 simple implementation
  return md5(signString).toUpperCase()
}

// Implementación MD5 (necesaria porque crypto.subtle no soporta MD5 en Deno)
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
    a = ff(a, b, c, d, k[0], 7, -680876936)
    d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819)
    b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897)
    d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341)
    b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416)
    d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063)
    b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682)
    d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290)
    b = ff(b, c, d, a, k[15], 22, 1236535329)
    a = gg(a, b, c, d, k[1], 5, -165796510)
    d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713)
    b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691)
    d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335)
    b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438)
    d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961)
    b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467)
    d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473)
    b = gg(b, c, d, a, k[12], 20, -1926607734)
    a = hh(a, b, c, d, k[5], 4, -378558)
    d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562)
    b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060)
    d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632)
    b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174)
    d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979)
    b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487)
    d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520)
    b = hh(b, c, d, a, k[2], 23, -995338651)
    a = ii(a, b, c, d, k[0], 6, -198630844)
    d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905)
    b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571)
    d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523)
    b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359)
    d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380)
    b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070)
    d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259)
    b = ii(b, c, d, a, k[9], 21, -343485551)
    x[0] = ad(a, x[0])
    x[1] = ad(b, x[1])
    x[2] = ad(c, x[2])
    x[3] = ad(d, x[3])
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
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(str.substring(i - 64, i)))
  }
  str = str.substring(i - 64)
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (i = 0; i < str.length; i++) tail[i >> 2] |= str.charCodeAt(i) << (i % 4 << 3)
  tail[i >> 2] |= 0x80 << (i % 4 << 3)
  if (i > 55) {
    md5cycle(state, tail)
    for (i = 0; i < 16; i++) tail[i] = 0
  }
  tail[14] = n * 8
  md5cycle(state, tail)
  return rh(state[0]) + rh(state[1]) + rh(state[2]) + rh(state[3])
}

// ============================================================================
// CLIENTE ALIEXPRESS
// ============================================================================

class AliExpressClient {
  private appKey: string
  private appSecret: string
  private accessToken: string | null
  private supabase: any

  constructor(appKey: string, appSecret: string, accessToken: string | null, supabase: any) {
    this.appKey = appKey
    this.appSecret = appSecret
    this.accessToken = accessToken
    this.supabase = supabase
  }

  /**
   * Realiza una llamada a la API de AliExpress
   */
  async callApi(apiPath: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, '+0800')
    
    // Parámetros base requeridos
    const sysParams: Record<string, string> = {
      app_key: this.appKey,
      sign_method: 'md5',
      timestamp: timestamp,
      format: 'json',
      v: '2.0',
    }

    // Añadir access token si está disponible
    if (this.accessToken) {
      sysParams.session = this.accessToken
    }

    // Combinar parámetros del sistema con los de la API
    const allParams: Record<string, string> = {
      ...sysParams,
    }

    // Añadir parámetros específicos de la API
    for (const [key, value] of Object.entries(params)) {
      allParams[key] = typeof value === 'object' ? JSON.stringify(value) : String(value)
    }

    // Generar firma
    const sign = await generateSignFallback(allParams, this.appSecret)
    allParams.sign = sign

    // Construir URL
    const url = new URL(AE_API_URL + apiPath)
    for (const [key, value] of Object.entries(allParams)) {
      url.searchParams.append(key, value)
    }

    // Hacer request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const data = await response.json()

    // Verificar errores
    if (data.error_response) {
      throw new Error(`AliExpress API Error: ${data.error_response.sub_msg || data.error_response.msg}`)
    }

    return data
  }

  /**
   * Obtiene un access token usando un código de autorización
   */
  async generateToken(code: string): Promise<any> {
    const result = await this.callApi('/auth/token/create', { code })
    
    // Guardar token en BD
    const tokenData = result.generate_token_response || result
    await this.saveToken(tokenData)
    
    return tokenData
  }

  /**
   * Renueva el access token usando el refresh token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    const result = await this.callApi('/auth/token/refresh', { refresh_token: refreshToken })
    
    const tokenData = result.refresh_token_response || result
    await this.saveToken(tokenData)
    
    return tokenData
  }

  /**
   * Guarda el token en la base de datos
   */
  private async saveToken(tokenData: any): Promise<void> {
    const now = new Date()
    const expiresIn = parseInt(tokenData.expires_in || '3600')
    const refreshExpiresIn = parseInt(tokenData.refresh_expires_in || '86400')
    
    await this.supabase
      .from('aliexpress_tokens')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // Token único
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(now.getTime() + expiresIn * 1000).toISOString(),
        refresh_expires_at: new Date(now.getTime() + refreshExpiresIn * 1000).toISOString(),
        seller_id: tokenData.seller_id || null,
        user_id: tokenData.user_id || null,
        account: tokenData.account || null,
      })
  }

  /**
   * Obtiene un access token válido, renovándolo si es necesario
   */
  async getValidToken(): Promise<string> {
    // Obtener token actual de BD
    const { data: tokenData } = await this.supabase
      .from('aliexpress_tokens')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single()

    if (!tokenData) {
      throw new Error('No hay token de AliExpress configurado. Por favor, configura la conexión primero.')
    }

    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    const refreshExpiresAt = new Date(tokenData.refresh_expires_at)

    // Si el token aún es válido (con 5 min de margen)
    if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
      this.accessToken = tokenData.access_token
      return tokenData.access_token
    }

    // Si el refresh token aún es válido, renovar
    if (refreshExpiresAt.getTime() > now.getTime()) {
      const newToken = await this.refreshToken(tokenData.refresh_token)
      this.accessToken = newToken.access_token
      return newToken.access_token
    }

    throw new Error('El token de AliExpress ha expirado y no se puede renovar. Por favor, reautoriza la aplicación.')
  }

  /**
   * Obtiene detalles de un producto de AliExpress
   */
  async getProductDetails(productId: string, options: {
    shipToCountry?: string
    targetCurrency?: string
    targetLanguage?: string
  } = {}): Promise<any> {
    await this.getValidToken()
    
    const params: Record<string, any> = {
      product_id: productId,
      ship_to_country: options.shipToCountry || 'ES',
      target_currency: options.targetCurrency || 'EUR',
      target_language: options.targetLanguage || 'es',
    }

    const result = await this.callApi('/aliexpress/ds/product/get', params)
    
    // Guardar/cachear en BD
    const productResult = result.aliexpress_ds_product_get_response?.result
    if (productResult) {
      await this.supabase
        .from('aliexpress_products')
        .upsert({
          product_id: productId,
          product_data: productResult,
          last_sync_at: new Date().toISOString(),
          last_price: parseFloat(productResult.product_price || '0'),
          last_stock: parseInt(productResult.product_stock || '0'),
        })
    }
    
    return productResult
  }

  /**
   * Crea un pedido de dropshipping en AliExpress
   */
  async createOrder(orderData: {
    logisticsAddress: any
    productItems: any[]
    buyerMessage?: string
  }): Promise<any> {
    await this.getValidToken()
    
    const params: Record<string, any> = {
      logistics_address: orderData.logisticsAddress,
      product_items: orderData.productItems,
    }

    if (orderData.buyerMessage) {
      params.buyer_message = orderData.buyerMessage
    }

    const result = await this.callApi('/aliexpress/ds/order/create', params)
    return result.aliexpress_ds_order_create_response?.result
  }

  /**
   * Obtiene información de seguimiento de un pedido
   */
  async getOrderTracking(aeOrderId: string): Promise<any> {
    await this.getValidToken()
    
    const result = await this.callApi('/aliexpress/ds/order/get', {
      order_id: aeOrderId,
    })
    
    return result.aliexpress_ds_order_get_response?.result
  }
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    const {  { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      throw new Error('No autorizado')
    }

    // Verificar que es admin
    const {  profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Solo administradores pueden gestionar AliExpress')
    }

    // Parsear request
    const { action, payload } = await req.json()

    // Crear cliente
    const client = new AliExpressClient(appKey, appSecret, null, supabase)

    let result: any

    switch (action) {
      case 'get_product':
        result = await client.getProductDetails(payload.productId, payload.options)
        break

      case 'create_order':
        result = await client.createOrder(payload.orderData)
        break

      case 'get_tracking':
        result = await client.getOrderTracking(payload.aeOrderId)
        break

      case 'generate_token':
        result = await client.generateToken(payload.code)
        break

      case 'refresh_token':
        result = await client.refreshToken(payload.refreshToken)
        break

      case 'get_token_status':
        const {  tokenData } = await supabase
          .from('aliexpress_tokens')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single()
        result = tokenData
        break

      default:
        throw new Error(`Acción no válida: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true,  result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    // Registrar error en BD
    try {
      const { action, payload } = await req.clone().json().catch(() => ({ action: 'unknown', payload: {} }))
      
      await supabase.from('aliexpress_errors').insert({
        endpoint: action || 'unknown',
        error_code: 'EXCEPTION',
        error_message: error instanceof Error ? error.message : 'Error desconocido',
        request_data: payload || {},
        response_data: { stack: error instanceof Error ? error.stack : null },
      })
    } catch (logError) {
      console.error('Error logging to DB:', logError)
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
