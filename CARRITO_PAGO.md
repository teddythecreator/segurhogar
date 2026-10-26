# Carrito y Pago con Stripe - Paso 7

## ✅ Implementación completada

### Archivos creados/modificados:

**Store actualizado:**
- `src/stores/cart-store.ts` — Carrito con persistencia, validación de afiliados, datos de instalación

**Páginas:**
- `src/pages/tienda/CartPage.tsx` — Carrito con formulario de instalación
- `src/pages/tienda/CheckoutPage.tsx` — Checkout con envío, facturación y notas
- `src/pages/tienda/PaymentSuccessPage.tsx` — Página de pago exitoso
- `src/pages/tienda/PaymentCancelledPage.tsx` — Página de pago cancelado
- `src/pages/tienda/MyAccountPage.tsx` — Actualizada con pedidos e instalaciones

**Edge Functions:**
- `supabase/functions/create-checkout/index.ts` — Crea pedido y sesión de Stripe
- `supabase/functions/stripe-webhook/index.ts` — Procesa webhooks de Stripe

**Migraciones:**
- `supabase/migrations/add_stripe_session_id.sql` — Añade campo stripe_session_id

**Tipos:**
- `src/types/database.ts` — Actualizado con stripe_session_id

**Rutas:**
- `src/App.tsx` — Nuevas rutas `/checkout`, `/pago-exitoso`, `/pago-cancelado`

---

## 🛒 Carrito de compra

### Características
- **Persistencia en localStorage** con Zustand
- **Validación**: productos afiliados no se pueden añadir
- **Gestión de cantidades**: aumentar, disminuir, eliminar
- **Datos de instalación**: si hay servicios/packs, pide dirección y fechas
- **Verificación de zona**: comprueba código postal en service_zones

### Flujo de instalación
1. Detectar si hay productos de tipo `servicio` o `pack`
2. Mostrar formulario de dirección
3. Verificar código postal contra service_zones
4. Pedir 2-3 fechas preferidas
5. Guardar datos en el carrito

---

## 💳 Checkout

### Datos requeridos
- **Envío**: nombre, teléfono, dirección completa, CP, ciudad, provincia
- **Facturación** (opcional): checkbox "Necesito factura" con NIF/CIF y razón social
- **Notas**: campo opcional para instrucciones especiales

### Validaciones
- Todos los campos obligatorios validados con Zod
- Si marca "Necesito factura", debe completar todos los datos fiscales
- Código postal de 5 dígitos
- Teléfono mínimo 9 caracteres

### Flujo de pago
1. Usuario completa formulario
2. Frontend llama a Edge Function `create-checkout`
3. Edge Function:
   - Recalcula precios desde BD (NUNCA confía en el frontend)
   - Crea pedido en estado `pendiente_pago`
   - Crea items del pedido
   - Registra historial de estado
   - Crea sesión de Stripe Checkout
   - Guarda session_id en el pedido
4. Frontend redirige a Stripe Checkout
5. Usuario completa pago en Stripe
6. Stripe redirige a `/pago-exitoso` o `/pago-cancelado`

---

## 🔐 Edge Function: create-checkout

### Seguridad
- **Verifica autenticación** del usuario
- **Recalcula precios** desde la base de datos
- **Valida productos** (publicados y activos)
- **NUNCA confía** en precios enviados por el navegador

### Flujo
```typescript
1. Verificar JWT del usuario
2. Parsear payload (items, envío, facturación, notas, instalación)
3. Obtener productos desde BD por IDs
4. Recalcular subtotal, IVA y total
5. Generar número de pedido único (PED-{timestamp})
6. Crear pedido en estado "pendiente_pago"
7. Crear items del pedido
8. Registrar cambio de estado en historial
9. Crear sesión de Stripe Checkout
10. Guardar session_id en el pedido
11. Devolver URL de Stripe al frontend
```

### Datos de Stripe
- **Modo**: payment (pago único)
- **Métodos**: card
- **Line items**: productos con precios en céntimos
- **Success URL**: `/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `/pago-cancelado`
- **Metadata**: order_id, order_numero

---

## 🔔 Edge Function: stripe-webhook

### Eventos manejados
- **checkout.session.completed**: pago exitoso
- **checkout.session.expired**: sesión expirada

### Flujo de pago exitoso
```typescript
1. Verificar firma del webhook con STRIPE_WEBHOOK_SECRET
2. Extraer order_id del metadata de la sesión
3. Obtener pedido actual desde BD
4. Actualizar estado a "pagado"
5. Guardar payment_intent_id y fecha de pago
6. Registrar cambio de estado en historial
7. Si hay instalación, crearla en estado "solicitada"
```

### Seguridad
- **Verifica firma** con webhook secret
- **Usa service_role_key** para operaciones de admin
- **Valida payment_status** antes de marcar como pagado

---

## 📄 Páginas de pago

### Pago exitoso (`/pago-exitoso`)
- Recibe `session_id` de Stripe
- Busca pedido por stripe_session_id
- Muestra número de pedido y total
- Limpia carrito
- Enlaces a "Ver mis pedidos" y "Seguir comprando"

### Pago cancelado (`/pago-cancelado`)
- Mensaje de cancelación
- Carrito sigue guardado
- Enlaces a "Volver al carrito" y "Seguir comprando"
- Información de contacto

---

## 👤 Mi cuenta actualizada

### Pestañas
- **Mis pedidos**: lista de pedidos con estado, fecha y total
- **Mis instalaciones**: lista de instalaciones con fecha, dirección y estado
- **Mi perfil**: información del usuario (nombre, email, teléfono)

### Datos mostrados
- Número de pedido
- Estado con badge de color
- Fecha de creación
- Total con IVA incluido
- Fecha y dirección de instalación
- Estado de instalación

---

## 🔧 Configuración de Stripe

### 1. Crear cuenta en Stripe
- Ir a [stripe.com](https://stripe.com)
- Crear cuenta (puedes usar modo test)

### 2. Obtener claves API
En Stripe Dashboard → Developers → API keys:
- **Publishable key** (pk_test_...): pública, para el frontend
- **Secret key** (sk_test_...): secreta, solo para backend

### 3. Configurar webhooks
En Stripe Dashboard → Developers → Webhooks:
1. Click "Add endpoint"
2. Endpoint URL: `https://TU_PROYECTO.supabase.co/functions/v1/stripe-webhook`
3. Events to send:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Click "Add endpoint"
5. Copiar **Signing secret** (whsec_...)

### 4. Configurar variables de entorno en Supabase

En Supabase → Settings → Secrets:

```bash
STRIPE_SECRET_KEY=sk_test_tu_secret_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
```

### 5. Desplegar Edge Functions

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# Desplegar funciones
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

---

## 🧪 Probar en modo test

### Tarjetas de prueba de Stripe
- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago rechazado**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`
- Cualquier fecha futura, cualquier CVC

### Flujo de prueba completo
1. Añadir productos al carrito
2. Ir a `/carrito`
3. Si hay instalaciones, completar datos
4. Ir a `/checkout`
5. Completar formulario de envío
6. Click en "Pagar con Stripe"
7. Serás redirigido a Stripe Checkout
8. Usar tarjeta `4242 4242 4242 4242`
9. Completar pago
10. Serás redirigido a `/pago-exitoso`
11. Verificar que:
    - Pedido aparece en `/mi-cuenta`
    - Estado es "pagado"
    - Si había instalación, aparece en "Mis instalaciones"

### Probar webhook localmente (opcional)
```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escuchar webhooks y redirigir a tu función
stripe listen --forward-to https://TU_PROYECTO.supabase.co/functions/v1/stripe-webhook

# En otra terminal, disparar evento de prueba
stripe trigger checkout.session.completed
```

---

## 🔒 Seguridad implementada

### Frontend
- ✅ Productos afiliados no se pueden añadir al carrito
- ✅ Validación de formularios con Zod
- ✅ Verificación de código postal antes de continuar
- ✅ JWT en cada petición a Edge Functions

### Backend (Edge Functions)
- ✅ **create-checkout**: recalcula precios desde BD
- ✅ **create-checkout**: verifica autenticación
- ✅ **stripe-webhook**: verifica firma del webhook
- ✅ **stripe-webhook**: usa service_role_key para operaciones de admin
- ✅ Nunca se confía en datos del frontend para precios

### Base de datos
- ✅ RLS en todas las tablas
- ✅ Pedidos solo visibles para el usuario que los creó (o admin/gestor)
- ✅ Historial de cambios de estado auditado

---

## 📊 Estructura de datos

### Pedido creado
```typescript
{
  id: string;
  numero: "PED-1234567890";
  user_id: string;
  estado: "pendiente_pago" | "pagado" | ...;
  subtotal: number;
  iva: number;
  total: number;
  tipo_iva: 21;
  // Envío
  envio_nombre: string;
  envio_telefono: string;
  envio_calle: string;
  envio_codigo_postal: string;
  envio_ciudad: string;
  envio_provincia: string;
  // Facturación
  factura_nombre: string;
  factura_nif: string | null;
  // ...
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  pagado_en: string | null;
}
```

### Items del pedido
```typescript
{
  order_id: string;
  product_id: string;
  nombre_snapshot: string; // Nombre en el momento de la compra
  tipo_snapshot: "dropshipping" | "afiliado" | "servicio" | "pack";
  cantidad: number;
  precio_unitario: number;
  iva_unitario: 21;
}
```

---

## 🚀 Próximos pasos

- Implementar emails de confirmación con Resend
- Añadir seguimiento de envíos
- Implementar devoluciones
- Añadir cupones de descuento
- Implementar suscripciones recurrentes
- Añadir más métodos de pago (Bizum, PayPal)
- Implementar facturas en PDF
- Añadir sistema de reseñas
