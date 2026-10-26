import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.1.0'
import { getSecret } from '../_shared/vault.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendEmailPayload {
  order_id: string
  event: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verificar autenticación (admin o sistema)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Parsear payload
    const { order_id, event }: SendEmailPayload = await req.json()

    if (!order_id || !event) {
      throw new Error('order_id y event son obligatorios')
    }

    // 3. Obtener pedido con todos los detalles
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        user:profiles!user_id(id, nombre, email),
        items:order_items(*)
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      throw new Error('Pedido no encontrado')
    }

    // 4. Obtener email del usuario
    const userEmail = order.user?.email
    if (!userEmail) {
      throw new Error('El usuario no tiene email')
    }

    // 5. Inicializar Resend
    const resendApiKey = await getSecret('resend_api_key')
    if (!resendApiKey) {
      throw new Error('Clave API de Resend no configurada')
    }
    const resend = new Resend(resendApiKey)

    // 6. Preparar contenido del email según el evento
    const { subject, html } = getEmailContent(event, order)

    // 7. Enviar email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'SegurHogar <noreply@segurhogar.es>',
      to: [userEmail],
      subject,
      html,
    })

    if (emailError) {
      console.error('Error enviando email:', emailError)
      throw emailError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email enviado correctamente',
        emailId: emailData?.id,
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

/**
 * Genera el contenido del email según el evento
 */
function getEmailContent(event: string, order: any) {
  const orderNumber = order.numero
  const customerName = order.user?.nombre || 'Cliente'
  const total = order.total
  const items = order.items || []

  const itemsList = items
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.nombre_snapshot}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.cantidad}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.precio_unitario.toFixed(2)}€</td>
      </tr>
    `
    )
    .join('')

  const baseTemplate = (content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SegurHogar</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #0B1F3A; padding: 24px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                    🛡️ SegurHogar
                  </h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 32px 24px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                    ¿Tienes dudas? Contáctanos
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    📞 900 123 456 · ✉️ info@segurhogar.es
                  </p>
                  <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} SegurHogar. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  switch (event) {
    case 'order_confirmed':
      return {
        subject: `Pedido ${orderNumber} confirmado - SegurHogar`,
        html: baseTemplate(`
          <h2 style="margin: 0 0 16px 0; color: #0B1F3A; font-size: 20px;">
            ¡Hola ${customerName}! 👋
          </h2>
          <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
            Tu pedido <strong>${orderNumber}</strong> ha sido confirmado y estamos preparándolo.
          </p>
          <div style="background-color: #eff6ff; border-left: 4px solid #2D7FF9; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: bold;">
              📦 Resumen del pedido
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Producto</th>
                  <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 12px; text-align: right; font-weight: bold; color: #2D7FF9; font-size: 18px;">
                    ${total.toFixed(2)}€
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p style="margin: 24px 0 0 0; color: #4b5563; line-height: 1.6;">
            Te enviaremos otro email cuando tu pedido sea enviado. ¡Gracias por confiar en nosotros!
          </p>
        `),
      }

    case 'order_shipped':
      return {
        subject: `Tu pedido ${orderNumber} ha sido enviado - SegurHogar`,
        html: baseTemplate(`
          <h2 style="margin: 0 0 16px 0; color: #0B1F3A; font-size: 20px;">
            ¡Buenas noticias, ${customerName}! 🚚
          </h2>
          <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
            Tu pedido <strong>${orderNumber}</strong> ha sido enviado y está en camino.
          </p>
          ${
            order.notas_internas?.includes('Nº seguimiento')
              ? `
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; color: #166534; font-weight: bold;">
                📦 Número de seguimiento
              </p>
              <p style="margin: 0; color: #166534; font-size: 18px; font-weight: bold;">
                ${order.notas_internas.match(/Nº seguimiento: ([^\n]+)/)?.[1] || 'Disponible en tu cuenta'}
              </p>
            </div>
          `
              : ''
          }
          <p style="margin: 24px 0 0 0; color: #4b5563; line-height: 1.6;">
            Recibirás tu pedido en los próximos días. Puedes consultar el estado en tu cuenta.
          </p>
        `),
      }

    case 'installation_confirmed':
      return {
        subject: `Instalación confirmada - Pedido ${orderNumber} - SegurHogar`,
        html: baseTemplate(`
          <h2 style="margin: 0 0 16px 0; color: #0B1F3A; font-size: 20px;">
            ¡Hola ${customerName}! 🔧
          </h2>
          <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
            Tu instalación para el pedido <strong>${orderNumber}</strong> ha sido confirmada.
          </p>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 12px 0; color: #92400e; font-weight: bold;">
              📅 Detalles de la instalación
            </p>
            <p style="margin: 0 0 8px 0; color: #92400e;">
              <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p style="margin: 0 0 8px 0; color: #92400e;">
              <strong>Dirección:</strong> ${order.envio_calle}
            </p>
            <p style="margin: 0; color: #92400e;">
              <strong>Duración estimada:</strong> 60-120 minutos
            </p>
          </div>
          <p style="margin: 24px 0 0 0; color: #4b5563; line-height: 1.6;">
            Nuestro técnico se pondrá en contacto contigo el día de la instalación. ¡Gracias por tu confianza!
          </p>
        `),
      }

    case 'installation_completed':
      return {
        subject: `Instalación completada - Pedido ${orderNumber} - SegurHogar`,
        html: baseTemplate(`
          <h2 style="margin: 0 0 16px 0; color: #0B1F3A; font-size: 20px;">
            ¡Instalación completada, ${customerName}! ✅
          </h2>
          <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
            La instalación de tu pedido <strong>${orderNumber}</strong> ha sido completada con éxito.
          </p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0 0 12px 0; color: #166534; font-weight: bold;">
              🎉 ¡Todo listo!
            </p>
            <p style="margin: 0 0 8px 0; color: #166534;">
              Tus productos están instalados y funcionando correctamente.
            </p>
            <p style="margin: 0; color: #166534;">
              Recuerda que tienes <strong>3 años de garantía</strong> en todos los productos.
            </p>
          </div>
          <p style="margin: 24px 0 0 0; color: #4b5563; line-height: 1.6;">
            Si tienes cualquier duda sobre el uso de tus productos, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
          </p>
        `),
      }

    default:
      return {
        subject: `Actualización del pedido ${orderNumber} - SegurHogar`,
        html: baseTemplate(`
          <h2 style="margin: 0 0 16px 0; color: #0B1F3A; font-size: 20px;">
            ¡Hola ${customerName}!
          </h2>
          <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
            Hay una actualización en tu pedido <strong>${orderNumber}</strong>.
          </p>
          <p style="margin: 24px 0 0 0; color: #4b5563; line-height: 1.6;">
            Puedes consultar los detalles en tu cuenta o contactarnos si tienes alguna pregunta.
          </p>
        `),
      }
  }
}
