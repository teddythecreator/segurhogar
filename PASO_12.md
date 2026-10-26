# Paso 12: Integración con AliExpress Dropshipping

## ✅ Implementación completada

### 📦 Componentes creados

#### Edge Functions (Supabase)

1. **`aliexpress-client`** - Cliente principal de la API
   - Algoritmo de firma HMAC-MD5 implementado
   - Gestión de tokens (access_token y refresh_token)
   - Renovación automática de tokens
   - Métodos: `get_product`, `create_order`, `get_tracking`, `generate_token`, `refresh_token`

2. **`aliexpress-sync`** - Sincronización periódica
   - Actualiza precios y stock de productos importados
   - Alertas cuando el margen cae por debajo del mínimo
   - Diseñada para ejecutarse como cron (pg_cron o similar)

3. **`aliexpress-create-order`** - Crear pedidos en AliExpress
   - Envía dirección del cliente y productos al proveedor
   - Cambia estado del pedido a "enviado_proveedor"
   - Registra en historial

4. **`aliexpress-tracking`** - Consultar seguimiento
   - Consulta estado de pedidos en AliExpress
   - Actualiza tracking number y URL
   - Cambia estado a "en_transito" o "entregado" automáticamente

#### Páginas del panel

1. **`/panel/aliexpress`** - Configuración
   - Estado de conexión (token)
   - Configuración de márgenes
   - Sincronización manual
   - Registro de errores

2. **`/panel/aliexpress/importar`** - Importar productos
   - Pegar URL o ID de AliExpress
   - Ver datos e imágenes
   - Configurar margen de beneficio
   - Guardar como borrador

#### Integración en detalle de pedido

- Botón "📦 Enviar a AliExpress" (solo si hay productos AE)
- Muestra información del pedido AE si ya existe
- Tracking number visible

#### Hooks de frontend

- `useAliexpressTokenStatus` - Estado del token
- `useGenerateAliexpressToken` - Generar token
- `useImportAliexpressProduct` - Importar producto
- `useCreateAliexpressOrder` - Crear pedido AE
- `useAliexpressTracking` - Consultar tracking
- `useAliexpressOrders` - Lista de pedidos AE
- `useAliexpressErrors` - Registro de errores
- `useAliexpressConfig` - Configuración
- `useSyncAliexpressProducts` - Sincronizar manualmente

---

## 🗄️ Base de datos

### Nuevas tablas

```sql
aliexpress_tokens          -- Tokens de acceso
aliexpress_products        -- Caché de productos AE
aliexpress_orders          -- Pedidos enviados a AE
aliexpress_errors          -- Registro de errores
aliexpress_config          -- Configuración (márgenes, etc.)
```

### Nuevos campos en `products`

```sql
aliexpress_product_id      -- ID del producto en AE
aliexpress_last_price      -- Último precio conocido
aliexpress_last_sync       -- Última sincronización
margin_alert_sent          -- Si ya se envió alerta de margen
```

### Migración

Ejecutar: `supabase/migrations/012_aliexpress_integration.sql`

---

## 🔐 Configuración

### 1. Variables de entorno en Supabase

```bash
ALIEXPRESS_APP_KEY=tu_app_key
ALIEXPRESS_APP_SECRET=tu_app_secret
```

### 2. Desplegar Edge Functions

```bash
supabase functions deploy aliexpress-client
supabase functions deploy aliexpress-sync
supabase functions deploy aliexpress-create-order
supabase functions deploy aliexpress-tracking
```

### 3. Configurar cron para sincronización

En Supabase, crear una función SQL programada:

```sql
-- Sincronizar productos cada 6 horas
SELECT cron.schedule(
  'sync-aliexpress-products',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://TU_PROYECTO.supabase.co/functions/v1/aliexpress-sync',
    headers := '{"Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Consultar tracking cada hora
SELECT cron.schedule(
  'check-aliexpress-tracking',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://TU_PROYECTO.supabase.co/functions/v1/aliexpress-tracking',
    headers := '{"Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### 4. Autorizar la aplicación

1. Ir a `/panel/aliexpress`
2. Seguir la guía de autorización de AliExpress
3. Pegar el código de autorización
4. Click en "Autorizar"

---

## 🔄 Flujo de trabajo

### Importar producto

1. Ir a `/panel/aliexpress/importar`
2. Pegar URL o ID del producto de AliExpress
3. Ver datos e imágenes
4. Configurar margen (por defecto 30%)
5. Click en "Importar como borrador"
6. Editar en `/panel/productos/:id` si es necesario
7. Publicar cuando esté listo

### Crear pedido en AliExpress

**Opción A: Manual**
1. Ir al detalle de un pedido pagado
2. Click en "📦 Enviar a AliExpress"
3. Confirmar
4. El pedido pasa a estado "enviado_proveedor"

**Opción B: Automática**
1. En `/panel/aliexpress`, activar "Crear pedidos automáticamente"
2. Cuando un pedido se paga, se envía automáticamente a AE

### Seguimiento

- La sincronización automática actualiza el tracking
- Se muestra en el detalle del pedido
- El estado cambia automáticamente:
  - `enviado_proveedor` → `en_transito` → `entregado`

### Alertas de margen

- Si el coste sube y el margen baja del mínimo (por defecto 15%):
  - Se registra en `aliexpress_errors`
  - Se marca el producto con `margin_alert_sent = true`
  - Visible en `/panel/aliexpress`

---

## 📊 Registro de errores

Todos los errores de la API de AliExpress se registran en `aliexpress_errors`:

- `endpoint`: Qué función falló
- `error_code`: Código de error
- `error_message`: Mensaje descriptivo
- `request_data`: Datos de la petición
- `response_data`: Respuesta completa
- `created_at`: Cuándo ocurrió

Visible en `/panel/aliexpress` con opción de limpiar.

---

## 🔒 Seguridad

- ✅ App Key y Secret solo en Edge Functions (variables de entorno)
- ✅ Tokens almacenados en BD con RLS (solo admin)
- ✅ Firma HMAC-MD5 en cada petición
- ✅ Renovación automática de tokens
- ✅ Registro de todos los errores
- ✅ Permisos: solo admin gestiona AliExpress

---

## 🧪 Cómo probar

### 1. Configurar credenciales
```bash
# En Supabase → Settings → Secrets
ALIEXPRESS_APP_KEY=...
ALIEXPRESS_APP_SECRET=...
```

### 2. Desplegar funciones
```bash
supabase functions deploy aliexpress-client
supabase functions deploy aliexpress-sync
supabase functions deploy aliexpress-create-order
supabase functions deploy aliexpress-tracking
```

### 3. Ejecutar migración
```sql
-- Contenido de supabase/migrations/012_aliexpress_integration.sql
```

### 4. Autorizar la aplicación
- Ir a `/panel/aliexpress`
- Seguir enlace de autorización
- Pegar código

### 5. Importar producto de prueba
- Ir a `/panel/aliexpress/importar`
- Pegar URL de un producto de AliExpress
- Verificar que se cargan datos e imágenes
- Importar como borrador

### 6. Crear pedido de prueba
- Crear pedido con producto de AliExpress
- Pagar (o simular pago)
- Ir al detalle del pedido
- Click en "Enviar a AliExpress"
- Verificar que se crea en AliExpress

### 7. Probar sincronización
- Ir a `/panel/aliexpress`
- Click en "Sincronizar productos ahora"
- Verificar que se actualizan precios

### 8. Probar tracking
- Esperar a que el cron ejecute `aliexpress-tracking`
- O ejecutar manualmente:
```bash
curl -X POST https://TU_PROYECTO.supabase.co/functions/v1/aliexpress-tracking \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

---

## 📝 Notas técnicas

### Algoritmo de firma

AliExpress usa HMAC-MD5:
1. Ordenar parámetros alfabéticamente
2. Concatenar: `app_secret + key1value1key2value2... + app_secret`
3. Calcular MD5
4. Convertir a mayúsculas

### Endpoints utilizados

- `/auth/token/create` - Generar token
- `/auth/token/refresh` - Renovar token
- `/aliexpress/ds/product/get` - Detalles de producto
- `/aliexpress/ds/order/create` - Crear pedido
- `/aliexpress/ds/order/get` - Obtener pedido/tracking

### Límites de la API

- Rate limit: ~50 requests/segundo
- Se recomienda cachear productos
- Sincronizar cada 6 horas como máximo

### Costes

- API de AliExpress: gratuita para dropshippers
- Edge Functions: incluidas en el plan de Supabase
- Cron: incluido en el plan de Supabase

---

## 🚀 Próximos pasos sugeridos

- [ ] Notificaciones por email cuando hay alertas de margen
- [ ] Dashboard con métricas de dropshipping
- [ ] Importación masiva de productos
- [ ] Comparador de precios con otros proveedores
- [ ] Gestión automática de stock (pausar productos sin stock)
- [ ] Integración con más proveedores (CJDropshipping, etc.)

---

## 📚 Recursos

- [AliExpress Open Platform](https://openservice.aliexpress.com/)
- [Documentación API Dropshipping](https://openservice.aliexpress.com/doc/api.htm)
- [SDK de referencia (ae_sdk)](https://github.com/moh3a/ae_sdk)

---

**Paso 12 completado**: Integración completa con AliExpress Dropshipping, incluyendo importación de productos, sincronización de precios/stock, creación automática de pedidos, seguimiento de envíos y registro de errores.
